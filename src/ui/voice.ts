import type { MediaConnection, Peer } from 'peerjs';
import { clampVolume, micErrorMessage, peersToCall, rmsSpeaking } from '../lib/voice';

interface VoiceHooks {
  onChange: () => void;
}

/**
 * Optional mesh of audio calls. getUserMedia runs only from join(), which the
 * room calls inside the Join voice click so iOS can start the microphone.
 */
export class VoiceMesh {
  joined = false;
  muted = false;
  denied = '';
  needGesture = false;
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private peer: Peer | null = null;
  private selfId = '';
  private calls = new Map<string, MediaConnection>();
  private audio = new Map<string, HTMLAudioElement>();
  private analysers = new Map<string, AnalyserNode>();
  private sources = new Map<string, MediaStreamAudioSourceNode>();
  private volumes = new Map<string, number>();
  private silenced = new Set<string>();
  private speaking = new Set<string>();
  private unreachable = new Set<string>();
  private tries = new Map<string, number>();
  private closing = new Set<string>();
  private lastIds: readonly string[] = [];
  private timer = 0;
  private listening: Peer | null = null;

  constructor(private readonly hooks: VoiceHooks) {}

  attach(peer: Peer, selfId: string) {
    this.selfId = selfId;
    this.peer = peer;
    if (this.listening === peer) return;
    this.listening = peer;
    peer.on('call', (call) => this.answer(call));
  }

  /** Starts the mic. Call this synchronously from a click so mobile Safari keeps the gesture. */
  join(): Promise<boolean> {
    this.denied = '';
    if (!navigator.mediaDevices?.getUserMedia) {
      this.denied = micErrorMessage('NotFoundError');
      return Promise.resolve(false);
    }
    const AudioCtx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = this.ctx ?? new AudioCtx();
      void this.ctx.resume();
    }
    return navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        this.stream = stream;
        this.joined = true;
        this.muted = false;
        this.watch(this.selfId, stream);
        this.armMeter();
        return true;
      })
      .catch((error: unknown) => {
        const name = error instanceof DOMException ? error.name : '';
        this.denied = micErrorMessage(name);
        this.joined = false;
        return false;
      });
  }

  leave() {
    this.joined = false;
    this.muted = false;
    this.needGesture = false;
    for (const [id, call] of this.calls) {
      this.closing.add(id);
      call.close();
    }
    this.calls.clear();
    this.tries.clear();
    this.lastIds = [];
    for (const id of [...this.audio.keys()]) this.dropAudio(id);
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.speaking.clear();
    this.unreachable.clear();
    this.sources.get(this.selfId)?.disconnect();
    this.sources.delete(this.selfId);
    this.analysers.delete(this.selfId);
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = 0;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    for (const track of this.stream?.getAudioTracks() ?? []) track.enabled = !muted;
    if (muted) this.speaking.delete(this.selfId);
  }

  setVolume(id: string, volume: number) {
    const next = clampVolume(volume);
    this.volumes.set(id, next);
    this.applyVolume(id);
  }

  setSilenced(id: string, silenced: boolean) {
    if (silenced) this.silenced.add(id);
    else this.silenced.delete(id);
    this.applyVolume(id);
  }

  volume(id: string): number {
    return this.volumes.get(id) ?? 1;
  }

  isSilenced(id: string): boolean {
    return this.silenced.has(id);
  }

  isSpeaking(id: string): boolean {
    return this.speaking.has(id);
  }

  isUnreachable(id: string): boolean {
    return this.unreachable.has(id);
  }

  sync(voiceIds: readonly string[]) {
    this.lastIds = voiceIds;
    if (!this.joined || !this.stream || !this.peer) return;
    for (const id of [...this.tries.keys()]) {
      if (!voiceIds.includes(id)) this.tries.delete(id);
    }
    for (const id of peersToCall(this.selfId, voiceIds, new Set(this.calls.keys()))) {
      const used = this.tries.get(id) ?? 0;
      if (used >= 3) {
        if (!this.unreachable.has(id)) {
          this.unreachable.add(id);
          this.hooks.onChange();
        }
        continue;
      }
      this.tries.set(id, used + 1);
      try {
        const call = this.peer.call(id, this.stream, { metadata: { voice: true } });
        this.wire(id, call);
      } catch {
        this.unreachable.add(id);
        this.hooks.onChange();
      }
    }
    for (const [id, call] of this.calls) {
      if (!voiceIds.includes(id)) {
        this.closing.add(id);
        call.close();
        this.calls.delete(id);
        this.dropAudio(id);
        this.unreachable.delete(id);
      }
    }
  }

  hear() {
    this.needGesture = false;
    void this.ctx?.resume();
    for (const audio of this.audio.values()) {
      void audio.play().catch(() => {
        this.needGesture = true;
      });
    }
  }

  destroy() {
    this.leave();
    this.listening = null;
    void this.ctx?.close();
    this.ctx = null;
    this.peer = null;
  }

  private answer(call: MediaConnection) {
    if (!this.joined || !this.stream) {
      call.close();
      return;
    }
    const id = call.peer;
    const previous = this.calls.get(id);
    if (previous) {
      this.closing.add(id);
      previous.close();
    }
    call.answer(this.stream);
    this.wire(id, call);
  }

  private wire(id: string, call: MediaConnection) {
    this.calls.set(id, call);
    this.unreachable.delete(id);
    call.on('stream', (stream) => {
      this.attachAudio(id, stream);
      this.watch(id, stream);
    });
    call.on('close', () => {
      if (this.closing.has(id)) {
        this.closing.delete(id);
        return;
      }
      if (this.calls.get(id) !== call) return;
      this.calls.delete(id);
      this.dropAudio(id);
      if ((this.tries.get(id) ?? 0) < 3 && this.joined) {
        window.setTimeout(() => this.sync(this.lastIds), 600);
        return;
      }
      this.unreachable.add(id);
      this.hooks.onChange();
    });
    call.on('error', () => {
      this.unreachable.add(id);
      this.hooks.onChange();
    });
  }

  private attachAudio(id: string, stream: MediaStream) {
    let audio = this.audio.get(id);
    if (!audio) {
      audio = document.createElement('audio');
      audio.autoplay = true;
      audio.setAttribute('playsinline', '');
      this.audio.set(id, audio);
    }
    audio.srcObject = stream;
    this.applyVolume(id);
    void audio.play().catch(() => {
      this.needGesture = true;
      this.hooks.onChange();
    });
  }

  private applyVolume(id: string) {
    const audio = this.audio.get(id);
    if (!audio) return;
    audio.volume = this.silenced.has(id) ? 0 : (this.volumes.get(id) ?? 1);
  }

  private dropAudio(id: string) {
    const audio = this.audio.get(id);
    if (audio) {
      audio.srcObject = null;
      audio.remove();
    }
    this.audio.delete(id);
    this.sources.get(id)?.disconnect();
    this.sources.delete(id);
    this.analysers.delete(id);
    this.speaking.delete(id);
  }

  private watch(id: string, stream: MediaStream) {
    if (!this.ctx) return;
    this.sources.get(id)?.disconnect();
    const source = this.ctx.createMediaStreamSource(stream);
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    this.sources.set(id, source);
    this.analysers.set(id, analyser);
  }

  private armMeter() {
    if (this.timer) return;
    const buffer = new Uint8Array(256);
    this.timer = window.setInterval(() => {
      let changed = false;
      for (const [id, analyser] of this.analysers) {
        if (id === this.selfId && this.muted) {
          if (this.speaking.delete(this.selfId)) changed = true;
          continue;
        }
        analyser.getByteTimeDomainData(buffer);
        const speaking = rmsSpeaking(buffer);
        const had = this.speaking.has(id);
        if (speaking) this.speaking.add(id);
        else this.speaking.delete(id);
        if (had !== speaking) changed = true;
      }
      if (changed) this.hooks.onChange();
    }, 160);
  }
}
