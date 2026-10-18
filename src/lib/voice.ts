/** Rules for the optional study-room voice mesh. No microphone is opened here. */

export const VOICE_LIMIT = 6;
export const SPEAKING_THRESHOLD = 0.08;

/** The peer with the lower id places the call, so a pair never calls both ways. */
export function peersToCall(selfId: string, voiceIds: readonly string[], already: ReadonlySet<string>): string[] {
  return voiceIds.filter((id) => id !== selfId && id > selfId && !already.has(id)).sort();
}

export function roomHasVoiceSlot(inVoiceCount: number, alreadyIn: boolean, limit = VOICE_LIMIT): boolean {
  if (alreadyIn) return true;
  if (!Number.isInteger(inVoiceCount) || inVoiceCount < 0) return false;
  return inVoiceCount < limit;
}

export function voiceStatus(input: { inVoice: boolean; muted: boolean; speaking: boolean; unreachable: boolean }): string {
  if (!input.inVoice) return 'Voice off';
  if (input.unreachable) return "Can't hear";
  if (input.muted) return 'Muted';
  if (input.speaking) return 'Speaking';
  return 'In voice';
}

/** Time-domain samples are 0–255, with 128 as silence. */
export function rmsSpeaking(samples: ArrayLike<number>, threshold = SPEAKING_THRESHOLD): boolean {
  if (samples.length === 0) return false;
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const sample = samples[i] ?? 128;
    const centered = (sample - 128) / 128;
    sum += centered * centered;
  }
  return Math.sqrt(sum / samples.length) >= threshold;
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

export function micErrorMessage(name: string): string {
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Microphone permission was denied. The quiz still works. Join voice again if you change your mind.';
  }
  if (name === 'NotFoundError') {
    return 'No microphone was found. The quiz still works without voice.';
  }
  return 'The microphone did not start. The quiz still works without voice.';
}
