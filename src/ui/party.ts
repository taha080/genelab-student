import Peer, { type DataConnection } from 'peerjs';
import { encode } from 'uqr';
import {
  CHAT_EMOJIS,
  CHAT_HISTORY,
  CHAT_LIMIT,
  applyReaction,
  formatChatTime,
  isChatEmoji,
  nameColor,
  prepareChatText,
  readMessages,
  renameNotice,
  type ChatMessage,
} from '../lib/chat';
import {
  JOIN_RETRIES,
  NICK_KEY,
  QUESTION_MS,
  RACE_LENGTH,
  challengeHash,
  decodeChallenge,
  inviteUrl,
  joinError,
  loadNickname,
  makeRoomCode,
  normalizeRoomCode,
  passTurns,
  peerIdForRoom,
  racePoints,
  rankBoard,
  sanitizeName,
  selectQuestions,
  shouldRetryJoin,
  waitingOn,
  type ChallengeLink,
} from '../lib/party';
import { saveGameScore } from '../lib/progress';
import type { QuizQuestion } from '../lib/quiz';
import { VOICE_LIMIT, roomHasVoiceSlot, voiceStatus } from '../lib/voice';
import { el } from './dom';
import { VoiceMesh } from './voice';

type Mode = 'live' | 'pass' | 'challenge';

interface PlayerState {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  answered: boolean;
  choice: number | null;
  pending: number;
  voice: boolean;
  muted: boolean;
}

interface RoomView {
  t: 'room';
  phase: 'lobby' | 'question' | 'reveal' | 'done';
  players: { id: string; name: string; score: number; connected: boolean; voice?: boolean; muted?: boolean }[];
  index: number;
  total: number;
  prompt: string;
  choices: string[];
  yourAnswer: number | null;
  correct: number | null;
  explanation: string;
  seed: number;
  hostId: string;
  messages: ChatMessage[];
}

type ClientMessage =
  | { t: 'hello'; name: string }
  | { t: 'answer'; index: number; choice: number; ms: number }
  | { t: 'voice'; on: boolean; muted: boolean }
  | { t: 'chat'; text: string }
  | { t: 'react'; id: string; emoji: string }
  | { t: 'rename'; name: string };

type Entry = 'home' | 'invite';

export function mountParty(root: HTMLElement): () => void {
  const route = readRoute();
  root.append(
    el(
      'p',
      'explain',
      'Study together without an account. Create a live room in one tap, or open an invite link and join with your name. Chat stays in the room, and you can change your name any time. Voice is optional: the microphone stays off until you tap Join voice, and the quiz works without it. The public PeerJS broker only introduces the browsers, and this site stores no room. If the network is unavailable, pass one device around, or share a challenge link that carries a quiz seed and a score.',
    ),
  );
  const nav = el('div', 'segment');
  const stage = el('div');
  root.append(nav, stage);

  let mode: Mode = route.mode;
  let stop = () => {};
  const tabs: { id: Mode; label: string }[] = [
    { id: 'live', label: 'Live room' },
    { id: 'pass', label: 'Pass and play' },
    { id: 'challenge', label: 'Challenge link' },
  ];

  function show() {
    stop();
    nav.replaceChildren();
    for (const tab of tabs) {
      const button = el('button', tab.id === mode ? 'on' : undefined, tab.label);
      button.type = 'button';
      button.addEventListener('click', () => {
        mode = tab.id;
        show();
      });
      nav.append(button);
    }
    stage.replaceChildren();
    if (mode === 'live') stop = mountLive(stage, route.code);
    else if (mode === 'pass') stop = mountPass(stage);
    else stop = mountChallenge(stage, route.challenge);
  }

  show();
  return () => stop();
}

function mountLive(stage: HTMLElement, preset: string): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  let peer: Peer | null = null;
  let guestConn: DataConnection | null = null;
  let timer = 0;
  let saved = false;
  const conns = new Map<string, DataConnection>();
  let players: PlayerState[] = [];
  let questions: QuizQuestion[] = [];
  let phase: RoomView['phase'] = 'lobby';
  let index = 0;
  let seed = 0;
  let selfId = '';
  let host = false;
  let code = preset;
  let startedAt = 0;
  let closed = '';
  let voiceNote = '';
  let lastView: RoomView | null = null;
  let painting = false;
  let roomReady = false;
  let session = 0;
  let joinFailures = 0;
  let retryTimer = 0;
  let connGen = 0;
  let entry: Entry = preset ? 'invite' : 'home';
  let messages: ChatMessage[] = [];
  let chatSeq = 0;
  let chatDraft = '';
  let chatOpen = false;
  let chatSeen = 0;
  let renaming = false;
  let renameDraft = '';
  let renameFocus = false;
  let onAttemptFail: (kind: string) => void = () => {};
  const voice = new VoiceMesh({
    onChange: () => refreshVoiceFaces(),
  });

  function destroy() {
    session += 1;
    window.clearTimeout(timer);
    window.clearTimeout(retryTimer);
    onAttemptFail = () => {};
    voice.destroy();
    guestConn?.close();
    guestConn = null;
    for (const conn of conns.values()) conn.close();
    conns.clear();
    peer?.destroy();
    peer = null;
    roomReady = false;
  }

  function rememberedName(): string {
    try {
      return loadNickname(localStorage.getItem(NICK_KEY));
    } catch {
      return loadNickname(null);
    }
  }

  function rememberName(name: string) {
    try {
      localStorage.setItem(NICK_KEY, sanitizeName(name));
    } catch {
      // Private mode still lets the room use the name for this visit.
    }
  }

  function reconnectPeer() {
    try {
      peer?.reconnect();
    } catch {
      // PeerJS throws when a reconnect is already in progress.
    }
  }

  function pushChat(text: string, name: string, system: boolean) {
    const clean = prepareChatText(text);
    if (!clean) return;
    chatSeq += 1;
    messages.push({
      id: `c${chatSeq}`,
      name: system ? '' : name.slice(0, 16),
      color: nameColor(name),
      at: Date.now(),
      text: clean,
      system,
      reactions: [],
    });
    if (messages.length > CHAT_HISTORY) messages.splice(0, messages.length - CHAT_HISTORY);
  }

  function applyRename(id: string, raw: string): boolean {
    const player = players.find((item) => item.id === id);
    if (!player) return false;
    const others = players.filter((item) => item.id !== id).map((item) => item.name);
    const name = uniqueName(sanitizeName(raw), others);
    const notice = renameNotice(player.name, name);
    if (!notice) return false;
    player.name = name;
    pushChat(notice, name, true);
    return true;
  }

  function arm() {
    window.clearTimeout(timer);
    startedAt = Date.now();
    timer = window.setTimeout(() => {
      if (phase === 'question') reveal();
    }, QUESTION_MS);
  }

  function snapshot(forId: string): RoomView {
    const player = players.find((item) => item.id === forId);
    const question = questions[index];
    const showKey = phase === 'reveal' || phase === 'done';
    return {
      t: 'room',
      phase,
      players: players.map((item) => ({
        id: item.id,
        name: item.name,
        score: item.score,
        connected: item.connected,
        voice: item.voice,
        muted: item.muted,
      })),
      index,
      total: questions.length,
      prompt: phase === 'lobby' ? '' : (question?.prompt ?? ''),
      choices: phase === 'lobby' ? [] : [...(question?.choices ?? [])],
      yourAnswer: player?.choice ?? null,
      correct: showKey ? (question?.answer ?? null) : null,
      explanation: showKey ? (question?.explanation ?? '') : '',
      seed,
      hostId: selfId,
      messages,
    };
  }

  function broadcast() {
    for (const [id, conn] of conns) {
      if (conn.open) conn.send(snapshot(id));
    }
    paint(snapshot(selfId));
  }

  function reveal() {
    if (phase !== 'question') return;
    window.clearTimeout(timer);
    for (const player of players) {
      if (player.connected) player.score += player.pending;
      player.pending = 0;
    }
    phase = 'reveal';
    broadcast();
  }

  function record(id: string, choice: number, ms: number, questionIndex: number) {
    if (phase !== 'question' || questionIndex !== index) return;
    const player = players.find((item) => item.id === id);
    const question = questions[index];
    if (!player || !player.connected || player.answered || !question) return;
    if (!Number.isInteger(choice) || choice < 0 || choice > 3) return;
    player.answered = true;
    player.choice = choice;
    player.pending = racePoints(choice === question.answer, ms);
    if (waitingOn(players).length === 0) reveal();
    else broadcast();
  }

  function beginRound() {
    seed = Math.floor(Math.random() * 0xffffffff);
    questions = selectQuestions(seed, RACE_LENGTH);
    index = 0;
    phase = 'question';
    for (const player of players) {
      player.score = 0;
      player.answered = false;
      player.choice = null;
      player.pending = 0;
    }
    arm();
    broadcast();
  }

  function advance() {
    if (index + 1 >= questions.length) {
      phase = 'done';
      window.clearTimeout(timer);
      broadcast();
      saveOwn(snapshot(selfId));
      return;
    }
    index += 1;
    phase = 'question';
    for (const player of players) {
      player.answered = false;
      player.choice = null;
      player.pending = 0;
    }
    arm();
    broadcast();
  }

  function saveOwn(view: RoomView) {
    if (saved || view.phase !== 'done') return;
    const mine = view.players.find((player) => player.id === selfId);
    if (!mine) return;
    saved = true;
    try {
      saveGameScore(localStorage, 'party', mine.score);
    } catch {
      // Storage can be blocked. The room still ends.
    }
  }

  function onGuestData(id: string, data: unknown) {
    const message = parseClient(data);
    if (!message) return;
    if (message.t === 'hello') {
      const found = players.find((player) => player.id === id);
      const others = players.filter((player) => player.id !== id).map((player) => player.name);
      const name = uniqueName(sanitizeName(message.name), others);
      if (found) {
        found.connected = true;
        const notice = renameNotice(found.name, name);
        found.name = name;
        if (notice) pushChat(notice, name, true);
      } else {
        players.push({ id, name, score: 0, connected: true, answered: false, choice: null, pending: 0, voice: false, muted: false });
        pushChat(`${name} joined`, name, true);
      }
      broadcast();
      return;
    }
    if (message.t === 'voice') {
      const player = players.find((item) => item.id === id);
      if (!player || !player.connected) return;
      if (message.on && !player.voice && !roomHasVoiceSlot(players.filter((item) => item.voice && item.connected).length, false)) {
        broadcast();
        return;
      }
      player.voice = message.on;
      player.muted = message.on && message.muted;
      broadcast();
      return;
    }
    if (message.t === 'chat') {
      const player = players.find((item) => item.id === id);
      const text = prepareChatText(message.text);
      if (!player || !player.connected || !text) return;
      pushChat(text, player.name, false);
      broadcast();
      return;
    }
    if (message.t === 'react') {
      const player = players.find((item) => item.id === id);
      const target = messages.find((item) => item.id === message.id);
      if (!player || !player.connected || !target || target.system || !isChatEmoji(message.emoji)) return;
      target.reactions = applyReaction(target.reactions, message.emoji, id);
      broadcast();
      return;
    }
    if (message.t === 'rename') {
      const player = players.find((item) => item.id === id);
      if (!player || !player.connected) return;
      if (applyRename(id, message.name)) broadcast();
      return;
    }
    record(id, message.choice, message.ms, message.index);
  }

  function openHost(roomCode: string, name: string, attempt = 0) {
    destroy();
    saved = false;
    closed = '';
    host = true;
    entry = 'home';
    code = roomCode;
    messages = [];
    chatSeq = 0;
    chatSeen = 0;
    roomReady = false;
    peer = new Peer(peerIdForRoom(roomCode));
    panel.replaceChildren(el('p', undefined, 'Opening the room…'));
    peer.on('open', (id) => {
      selfId = id;
      if (roomReady) {
        closed = '';
        if (peer) voice.attach(peer, id);
        broadcast();
        return;
      }
      roomReady = true;
      players = [{ id, name, score: 0, connected: true, answered: false, choice: null, pending: 0, voice: false, muted: false }];
      phase = 'lobby';
      pushChat(`${name} joined`, name, true);
      if (peer) voice.attach(peer, id);
      broadcast();
    });
    peer.on('connection', (conn) => {
      conns.set(conn.peer, conn);
      conn.on('open', () => undefined);
      conn.on('data', (data) => onGuestData(conn.peer, data));
      conn.on('close', () => drop(conn.peer));
      conn.on('error', () => drop(conn.peer));
    });
    peer.on('error', (error) => {
      const kind = 'type' in error ? String(error.type) : '';
      if (kind === 'unavailable-id' && attempt < 4 && !roomReady) {
        openHost(makeRoomCode(), name, attempt + 1);
        return;
      }
      if (roomReady) {
        if (kind === 'webrtc' || kind === 'peer-unavailable') return;
        closed = 'Reconnecting so friends can still use this code…';
        paint(snapshot(selfId));
        reconnectPeer();
        return;
      }
      closed = 'The room could not open. Check the connection and try again.';
      destroy();
      entry = 'home';
      paintForm();
    });
    peer.on('disconnected', () => {
      if (!roomReady) return;
      closed = 'Reconnecting so friends can still use this code…';
      paint(snapshot(selfId));
      reconnectPeer();
    });
  }

  function drop(id: string) {
    const player = players.find((item) => item.id === id);
    if (player?.connected) {
      player.connected = false;
      player.voice = false;
      player.muted = false;
      pushChat(`${player.name} left`, player.name, true);
    }
    conns.delete(id);
    if (phase === 'question' && waitingOn(players).length === 0) reveal();
    else broadcast();
  }

  function openGuest(roomCode: string, name: string) {
    destroy();
    const ticket = session;
    saved = false;
    closed = '';
    host = false;
    entry = 'invite';
    code = roomCode;
    joinFailures = 0;
    messages = [];
    peer = new Peer();
    panel.replaceChildren(el('p', undefined, `Joining room ${roomCode}…`));
    peer.on('open', (id) => {
      if (ticket !== session) return;
      selfId = id;
      if (peer) voice.attach(peer, id);
      connectChannel(roomCode, name, ticket);
    });
    peer.on('disconnected', () => {
      if (ticket !== session) return;
      reconnectPeer();
    });
    peer.on('error', (error) => {
      if (ticket !== session) return;
      const kind = 'type' in error ? String(error.type) : '';
      onAttemptFail(kind === 'peer-unavailable' ? 'peer-unavailable' : 'dropped');
    });
  }

  function connectChannel(roomCode: string, name: string, ticket: number) {
    if (!peer || ticket !== session) return;
    window.clearTimeout(retryTimer);
    connGen += 1;
    const gen = connGen;
    let attemptDone = false;
    const previous = guestConn;
    guestConn = peer.connect(peerIdForRoom(roomCode), { reliable: true });
    previous?.close();

    const fail = (kind: string) => {
      if (attemptDone || gen !== connGen || ticket !== session) return;
      attemptDone = true;
      if (shouldRetryJoin(joinFailures, JOIN_RETRIES)) {
        joinFailures += 1;
        closed = 'Reconnecting to the host…';
        if (lastView) paint(lastView);
        else panel.replaceChildren(statusNote('Reconnecting to the host…', 'caution'));
        retryTimer = window.setTimeout(() => connectChannel(roomCode, name, ticket), 750);
        return;
      }
      closed = joinError(kind);
      destroy();
      host = false;
      entry = 'invite';
      code = roomCode;
      paintForm();
    };
    onAttemptFail = fail;

    guestConn.on('open', () => {
      if (gen !== connGen || ticket !== session) return;
      joinFailures = 0;
      closed = '';
      guestConn?.send({ t: 'hello', name: rememberedName() || name } satisfies ClientMessage);
    });
    guestConn.on('data', (data) => {
      if (gen !== connGen || ticket !== session) return;
      const view = parseRoom(data);
      if (!view) return;
      if (view.phase === 'question' && (startedAt === 0 || view.index !== index)) startedAt = Date.now();
      index = view.index;
      closed = '';
      paint(view);
      if (view.phase === 'done') saveOwn(view);
    });
    guestConn.on('close', () => fail('dropped'));
    guestConn.on('error', () => fail('peer-unavailable'));
  }

  function paintForm() {
    const nickname = rememberedName();
    panel.replaceChildren(el('h3', undefined, entry === 'invite' ? 'Join this room' : 'Live quiz race'));
    const idle = entry === 'invite'
      ? 'Check your name, then join. You can change it again inside the room.'
      : 'Not connected yet. Create a room, or join with a code.';
    panel.append(statusNote(closed || idle, closed ? 'caution' : 'idle'));
    if (entry === 'invite') {
      panel.append(el('p', 'eyebrow', 'Room'), el('p', 'room-code', code));
      panel.append(el('p', undefined, 'This invite opens straight to your name. Nothing joins until you tap the button.'));
      const name = textField('Your name', nickname);
      name.area.classList.add('big-field');
      name.area.setAttribute('autocomplete', 'nickname');
      const enter = el('button', 'primary big-action', closed ? 'Retry' : 'Join room');
      enter.type = 'button';
      enter.addEventListener('click', () => {
        const next = sanitizeName(name.area.value);
        rememberName(next);
        openGuest(code, next);
      });
      const back = el('button', 'ghost', 'Use a different room');
      back.type = 'button';
      back.addEventListener('click', () => {
        entry = 'home';
        closed = '';
        paintForm();
      });
      panel.append(name.label, enter, back);
      return;
    }
    panel.append(el('p', undefined, 'Create a room in one tap. Friends can scan the code, open the link, or type the four characters. A faster correct answer scores more.'));
    const name = textField('Your name', nickname);
    name.area.classList.add('big-field');
    name.area.setAttribute('autocomplete', 'nickname');
    const create = el('button', 'primary big-action', 'Create room');
    create.type = 'button';
    create.addEventListener('click', () => {
      const next = sanitizeName(name.area.value);
      rememberName(next);
      openHost(makeRoomCode(), next);
    });
    const join = textField('Join with a code', code);
    join.area.classList.add('big-field');
    join.area.maxLength = 8;
    join.area.autocapitalize = 'characters';
    join.area.spellcheck = false;
    join.area.autocomplete = 'off';
    const enter = el('button', 'primary big-action', 'Join with code');
    enter.type = 'button';
    enter.addEventListener('click', () => {
      const next = normalizeRoomCode(join.area.value);
      if (!next) {
        closed = 'A room code is four letters or numbers, without I, L, O, 0, or 1.';
        paintForm();
        return;
      }
      const nick = sanitizeName(name.area.value);
      rememberName(nick);
      openGuest(next, nick);
    });
    panel.append(name.label, create, el('p', 'eyebrow', 'Or join a friend'), join.label, enter);
  }

  function publishVoice() {
    const on = voice.joined;
    const muted = on && voice.muted;
    if (host) {
      const me = players.find((player) => player.id === selfId);
      if (me) {
        if (on && !me.voice && !roomHasVoiceSlot(players.filter((player) => player.voice && player.connected).length, false)) {
          voice.leave();
          voiceNote = `Voice is full (${VOICE_LIMIT} people). The quiz still works without it.`;
          broadcast();
          return;
        }
        me.voice = on;
        me.muted = muted;
      }
      broadcast();
      return;
    }
    guestConn?.send({ t: 'voice', on, muted } satisfies ClientMessage);
    if (lastView) paint(lastView);
  }

  function refreshVoiceFaces() {
    for (const row of panel.querySelectorAll<HTMLElement>('[data-player]')) {
      const id = row.dataset.player ?? '';
      const player = lastView?.players.find((item) => item.id === id);
      if (!player) continue;
      const status = voiceLabel(player);
      row.classList.toggle('is-speaking', status === 'Speaking');
      const meta = row.querySelector('.voice-meta');
      if (meta) meta.textContent = player.connected ? `${player.score} · ${status}` : 'left';
    }
    if (voice.needGesture && !panel.querySelector('[data-hear]') && lastView) paint(lastView);
  }

  function voiceBar(): HTMLElement {
    const bar = el('div', 'voice-bar');
    const others = lastView?.players.filter((player) => player.voice && player.connected && player.id !== selfId).length ?? 0;
    if (!voice.joined) {
      const join = el('button', 'ghost', 'Join voice');
      join.type = 'button';
      const open = roomHasVoiceSlot(others, false);
      join.disabled = !open;
      join.addEventListener('click', () => {
        void voice.join().then((ok) => {
          if (ok) {
            voiceNote = '';
            publishVoice();
          } else if (lastView) paint(lastView);
        });
      });
      bar.append(join);
      bar.append(el('p', 'caption', open
        ? 'The microphone stays off until you tap Join voice. A phone may ask for a second tap before you can hear the room.'
        : `Voice is full (${VOICE_LIMIT} people). The quiz still works without it.`));
    } else {
      const mute = el('button', 'ghost', voice.muted ? 'Unmute' : 'Mute');
      mute.type = 'button';
      mute.addEventListener('click', () => {
        voice.setMuted(!voice.muted);
        publishVoice();
      });
      const leave = el('button', 'ghost', 'Leave voice');
      leave.type = 'button';
      leave.addEventListener('click', () => {
        voice.leave();
        voiceNote = '';
        publishVoice();
      });
      bar.append(mute, leave);
      bar.append(el('p', 'caption', voice.muted ? 'Your microphone is muted. The quiz is unchanged.' : 'You are in voice. Mute yourself any time. The quiz does not need the microphone.'));
    }
    if (voice.denied) bar.append(el('p', 'banner caution', voice.denied));
    if (voiceNote) bar.append(el('p', 'banner caution', voiceNote));
    if (voice.needGesture) {
      const hear = el('button', 'primary', 'Tap to hear');
      hear.type = 'button';
      hear.dataset.hear = '1';
      hear.addEventListener('click', () => {
        voice.hear();
        if (lastView) paint(lastView);
      });
      bar.append(hear);
    }
    return bar;
  }

  function personVolume(id: string, name: string): HTMLElement {
    const wrap = el('span', 'voice-person');
    const range = el('input');
    range.type = 'range';
    range.min = '0';
    range.max = '1';
    range.step = '0.05';
    range.value = String(voice.volume(id));
    range.setAttribute('aria-label', `Volume for ${name}`);
    range.addEventListener('input', () => voice.setVolume(id, Number(range.value)));
    const quiet = el('button', 'ghost tiny', voice.isSilenced(id) ? 'Hear' : 'Mute them');
    quiet.type = 'button';
    quiet.addEventListener('click', () => {
      voice.setSilenced(id, !voice.isSilenced(id));
      quiet.textContent = voice.isSilenced(id) ? 'Hear' : 'Mute them';
    });
    wrap.append(range, quiet);
    return wrap;
  }

  function repaint() {
    if (host) paint(snapshot(selfId));
    else if (lastView) paint(lastView);
  }

  function commitRename(raw: string) {
    renaming = false;
    const next = sanitizeName(raw);
    rememberName(next);
    if (host) {
      const before = players.find((player) => player.id === selfId)?.name;
      const changed = applyRename(selfId, next);
      if (changed) broadcast();
      else if (before !== undefined) paint(snapshot(selfId));
      return;
    }
    guestConn?.send({ t: 'rename', name: next } satisfies ClientMessage);
    if (lastView) paint(lastView);
  }

  function nameSlot(player: RoomView['players'][number]): HTMLElement {
    if (player.id !== selfId || !player.connected) return el('strong', undefined, player.name);
    if (renaming) {
      const form = el('form', 'rename-form');
      const input = el('input');
      input.type = 'text';
      input.maxLength = 16;
      input.value = renameDraft;
      input.setAttribute('aria-label', 'New username');
      input.addEventListener('input', () => {
        renameDraft = input.value;
      });
      const save = el('button', 'primary', 'Save');
      save.type = 'submit';
      const cancel = el('button', 'ghost', 'Cancel');
      cancel.type = 'button';
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        commitRename(input.value);
      });
      cancel.addEventListener('click', () => {
        renaming = false;
        repaint();
      });
      form.append(input, save, cancel);
      queueMicrotask(() => {
        if (!renameFocus) return;
        input.focus();
        input.select();
        renameFocus = false;
      });
      return form;
    }
    const button = el('button', 'name-edit');
    button.type = 'button';
    button.append(el('span', undefined, player.name), el('span', 'pencil', '✎'));
    button.setAttribute('aria-label', `Change username, currently ${player.name}`);
    button.addEventListener('click', () => {
      renaming = true;
      renameDraft = player.name;
      renameFocus = true;
      repaint();
    });
    return button;
  }

  function liveRoster(group: RoomView['players']): HTMLElement {
    const list = el('ul', 'roster');
    for (const ranked of rankBoard(group)) {
      const player = group.find((item) => item.id === ranked.id);
      if (!player) continue;
      const row = el('li', player.connected ? undefined : 'is-gone');
      row.dataset.player = player.id;
      const status = voiceLabel(player);
      if (status === 'Speaking') row.classList.add('is-speaking');
      row.append(nameSlot(player));
      row.append(el('span', 'voice-meta', player.connected ? `${player.score} · ${status}` : 'left'));
      const inVoice = player.id === selfId ? voice.joined : player.voice === true;
      if (player.connected && inVoice && player.id !== selfId) row.append(personVolume(player.id, player.name));
      list.append(row);
    }
    return list;
  }

  function voiceLabel(player: RoomView['players'][number]): string {
    const self = player.id === selfId;
    const inVoice = self ? voice.joined : player.voice === true;
    const muted = self ? voice.joined && voice.muted : player.muted === true;
    return voiceStatus({
      inVoice,
      muted,
      speaking: inVoice && !muted && voice.isSpeaking(player.id),
      unreachable: inVoice && !self && voice.isUnreachable(player.id),
    });
  }

  function paint(view: RoomView) {
    lastView = view;
    if (painting) return;
    painting = true;
    try {
      paintRoom(view);
    } finally {
      painting = false;
    }
  }

  function paintRoom(view: RoomView) {
    const othersInVoice = view.players.filter((player) => player.voice && player.connected && player.id !== selfId).length;
    const me = view.players.find((player) => player.id === selfId);
    if (voice.joined && me && me.voice !== true && othersInVoice >= VOICE_LIMIT) {
      voice.leave();
      voiceNote = `Voice is full (${VOICE_LIMIT} people). The quiz still works without it.`;
    }
    voice.sync(view.players.filter((player) => (player.id === selfId ? voice.joined : player.voice) && player.connected).map((player) => player.id));
    panel.replaceChildren();
    const here = view.players.filter((player) => player.connected).length;
    const role = host ? 'You are the host.' : 'You joined this room.';
    const phaseNote = view.phase === 'done' ? `Race finished. ${here} still connected.` : `Connected. ${role} ${here} ${here === 1 ? 'person is' : 'people are'} here.`;
    panel.append(statusNote(closed || phaseNote, closed ? 'caution' : 'good'));
    panel.append(voiceBar());
    const main = el('div', 'room-main');
    if (view.phase === 'lobby') {
      main.append(el('p', 'eyebrow', 'Room'), el('p', 'room-code', code), el('p', undefined, host ? 'Share this code. You start the race when everyone is here. Tap your name to change it.' : 'Waiting for the host to start. Tap your name to change it.'));
      main.append(inviteActions(), qrCode(inviteUrl(location.href, code)), liveRoster(view.players));
      if (host) {
        const start = el('button', 'primary big-action', 'Start race');
        start.type = 'button';
        start.addEventListener('click', beginRound);
        main.append(start);
      }
    } else if (view.phase === 'done') {
      const mine = view.players.find((player) => player.id === selfId)?.score ?? 0;
      main.append(el('h3', undefined, 'Leaderboard'), liveRoster(view.players), challengeButton(view.seed, mine, view.total));
    } else {
      const question = el('div');
      question.append(
        el('p', 'caption', `Question ${view.index + 1} of ${view.total}`),
        el('h3', 'game-prompt', view.prompt),
      );
      const choices = el('div', 'choices');
      view.choices.forEach((choice, choiceIndex) => {
        const button = el('button', 'choice', choice);
        button.type = 'button';
        const locked = view.yourAnswer !== null || view.phase === 'reveal';
        if (locked) button.disabled = true;
        if (view.phase === 'reveal' && choiceIndex === view.correct) button.classList.add('is-correct');
        if (view.phase === 'reveal' && choiceIndex === view.yourAnswer && choiceIndex !== view.correct) button.classList.add('is-wrong');
        button.addEventListener('click', () => {
          const ms = Math.max(0, Date.now() - startedAt);
          if (host) record(selfId, choiceIndex, ms, view.index);
          else guestConn?.send({ t: 'answer', index: view.index, choice: choiceIndex, ms } satisfies ClientMessage);
        });
        choices.append(button);
      });
      main.append(question, choices, liveRoster(view.players));
      if (view.phase === 'question' && view.yourAnswer !== null) {
        main.append(el('p', 'caption', 'Answer locked. The question reveals when everyone still connected has answered, or when 20 seconds run out.'));
      }
      if (view.phase === 'reveal') {
        main.append(el('p', 'banner good', view.explanation));
        if (host) {
          const next = el('button', 'primary', view.index + 1 >= view.total ? 'Show results' : 'Next question');
          next.type = 'button';
          next.addEventListener('click', advance);
          main.append(next);
        } else main.append(el('p', 'caption', 'The host moves the room to the next question.'));
      }
      const gone = view.players.filter((player) => !player.connected);
      if (gone.length) main.append(el('p', 'banner caution', `${gone.map((player) => player.name).join(', ')} disconnected. The race continues without them.`));
    }
    const layout = el('div', 'room-layout');
    layout.append(main, chatColumn(view.messages));
    panel.append(layout);
  }

  function inviteActions(): HTMLElement {
    const row = el('div', 'invite-actions');
    const copy = el('button', 'ghost', 'Copy invite link');
    copy.type = 'button';
    copy.addEventListener('click', () => {
      void copyInvite().then((ok) => {
        copy.textContent = ok ? 'Copied' : 'Copy failed';
      });
    });
    const share = el('button', 'ghost', 'Share');
    share.type = 'button';
    share.addEventListener('click', () => {
      void shareInvite().then((result) => {
        if (result === 'copied') share.textContent = 'Copied';
      });
    });
    row.append(copy, share);
    return row;
  }

  async function copyInvite(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(inviteUrl(location.href, code));
      return true;
    } catch {
      return false;
    }
  }

  async function shareInvite(): Promise<'shared' | 'copied' | 'cancelled'> {
    const url = inviteUrl(location.href, code);
    const data = { title: 'GeneLab study room', text: `Join my GeneLab room ${code}`, url };
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(data);
        return 'shared';
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      }
    }
    return (await copyInvite()) ? 'copied' : 'cancelled';
  }

  function sendChat(raw: string) {
    const text = prepareChatText(raw);
    if (!text) return;
    chatDraft = '';
    if (host) {
      const me = players.find((player) => player.id === selfId);
      pushChat(text, me?.name ?? 'Student', false);
      broadcast();
      return;
    }
    guestConn?.send({ t: 'chat', text } satisfies ClientMessage);
    if (lastView) paint(lastView);
  }

  function sendReact(id: string, emoji: string) {
    if (!isChatEmoji(emoji)) return;
    if (host) {
      const target = messages.find((item) => item.id === id);
      if (!target || target.system) return;
      target.reactions = applyReaction(target.reactions, emoji, selfId);
      broadcast();
      return;
    }
    guestConn?.send({ t: 'react', id, emoji } satisfies ClientMessage);
  }

  function chatIsOpen(): boolean {
    return window.matchMedia('(min-width: 900px)').matches || chatOpen;
  }

  function chatColumn(roomMessages: ChatMessage[]): HTMLElement {
    const column = el('div', 'chat-column');
    const open = chatIsOpen();
    if (open) chatSeen = roomMessages.length;
    const unread = open ? 0 : Math.max(0, roomMessages.length - chatSeen);
    const toggle = el('button', 'ghost chat-toggle');
    toggle.type = 'button';
    toggle.append(document.createTextNode(open ? 'Hide chat' : 'Chat'));
    if (unread > 0) toggle.append(el('span', 'unread-badge', String(unread)));
    toggle.setAttribute('aria-label', unread > 0 ? `Chat, ${unread} unread` : 'Chat');
    toggle.addEventListener('click', () => {
      chatOpen = !chatIsOpen();
      if (chatOpen) chatSeen = roomMessages.length;
      repaint();
    });
    const drawer = el('div', open ? 'chat-drawer is-open' : 'chat-drawer');
    const log = el('div', 'chat-log');
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');
    for (const message of roomMessages) {
      const row = el('div', message.system ? 'chat-line is-system' : `chat-line chat-c${message.color}`);
      if (!message.system) {
        const head = el('p', 'chat-head');
        head.append(el('strong', undefined, message.name), el('time', undefined, formatChatTime(message.at)));
        row.append(head);
      }
      row.append(el('p', 'chat-text', message.text));
      if (!message.system) {
        const reacts = el('div', 'chat-reacts');
        for (const emoji of CHAT_EMOJIS) {
          const owners = message.reactions.find((item) => item.emoji === emoji)?.who ?? [];
          const mine = owners.includes(selfId);
          const button = el('button', mine ? 'ghost tiny is-mine' : 'ghost tiny', owners.length ? `${emoji} ${owners.length}` : emoji);
          button.type = 'button';
          button.setAttribute('aria-label', `React with ${emoji}`);
          button.addEventListener('click', () => sendReact(message.id, emoji));
          reacts.append(button);
        }
        row.append(reacts);
      }
      log.append(row);
    }
    const form = el('form', 'chat-form');
    const input = el('input');
    input.type = 'text';
    input.maxLength = CHAT_LIMIT;
    input.placeholder = 'Message the room';
    input.value = chatDraft;
    input.setAttribute('aria-label', 'Message');
    input.addEventListener('input', () => {
      chatDraft = input.value;
    });
    const send = el('button', 'primary', 'Send');
    send.type = 'submit';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      sendChat(input.value);
    });
    form.append(input, send);
    drawer.append(el('h3', undefined, 'Chat'), log, form);
    column.append(toggle, drawer);
    queueMicrotask(() => {
      log.scrollTop = log.scrollHeight;
    });
    return column;
  }

  paintForm();
  return () => destroy();
}

function mountPass(stage: HTMLElement): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  let names = ['Ada', 'Lin'];
  let questions: QuizQuestion[] = [];
  let turns: number[] = [];
  let scores: number[] = [];
  let turn = 0;
  let seed = 0;
  let askedAt = 0;
  let stageName: 'setup' | 'cover' | 'ask' | 'tell' | 'board' = 'setup';
  let picked: number | null = null;

  function render() {
    panel.replaceChildren(el('h3', undefined, 'Pass and play'));
    if (stageName === 'setup') {
      panel.append(el('p', undefined, 'Two to six players share this device. Each person gets two questions. Hand it over before the next question so the answer stays hidden.'));
      names.forEach((name, index) => {
        const field = textField(`Player ${index + 1}`, name);
        field.area.addEventListener('input', () => {
          names[index] = field.area.value;
        });
        panel.append(field.label);
      });
      const row = el('div', 'row');
      const add = el('button', 'ghost', 'Add player');
      const remove = el('button', 'ghost', 'Remove');
      const start = el('button', 'primary', 'Start');
      add.type = 'button';
      remove.type = 'button';
      start.type = 'button';
      add.disabled = names.length >= 6;
      remove.disabled = names.length <= 2;
      add.addEventListener('click', () => {
        names = [...names, `Player ${names.length + 1}`];
        render();
      });
      remove.addEventListener('click', () => {
        names = names.slice(0, -1);
        render();
      });
      start.addEventListener('click', () => {
        const clean = names.map((name) => sanitizeName(name));
        seed = Math.floor(Math.random() * 0xffffffff);
        turns = passTurns(clean.length, 2);
        questions = selectQuestions(seed, turns.length);
        scores = clean.map(() => 0);
        names = clean;
        turn = 0;
        picked = null;
        stageName = 'cover';
        render();
      });
      row.append(add, remove, start);
      panel.append(row);
      return;
    }
    const player = names[turns[turn] ?? 0] ?? 'Student';
    if (stageName === 'cover') {
      panel.append(el('p', 'game-prompt', `Pass the device to ${player}.`), el('p', undefined, 'The previous answer is hidden. Start only when they are looking.'));
      const ready = el('button', 'primary', `I'm ${player}`);
      ready.type = 'button';
      ready.addEventListener('click', () => {
        askedAt = Date.now();
        picked = null;
        stageName = 'ask';
        render();
      });
      panel.append(ready);
      return;
    }
    const question = questions[turn];
    if (!question) return;
    if (stageName === 'ask' || stageName === 'tell') {
      panel.append(el('p', 'caption', `${player} · turn ${turn + 1} of ${turns.length}`), el('h3', undefined, question.prompt));
      const choices = el('div', 'choices');
      question.choices.forEach((choice, choiceIndex) => {
        const button = el('button', 'choice', choice);
        button.type = 'button';
        if (stageName === 'tell') {
          button.disabled = true;
          if (choiceIndex === question.answer) button.classList.add('is-correct');
          if (choiceIndex === picked && choiceIndex !== question.answer) button.classList.add('is-wrong');
        }
        button.addEventListener('click', () => {
          if (stageName !== 'ask') return;
          picked = choiceIndex;
          const who = turns[turn] ?? 0;
          scores[who] = (scores[who] ?? 0) + racePoints(choiceIndex === question.answer, Date.now() - askedAt);
          stageName = 'tell';
          render();
        });
        choices.append(button);
      });
      panel.append(choices);
      if (stageName === 'tell') {
        panel.append(el('p', 'banner good', question.explanation));
        const next = el('button', 'primary', turn + 1 >= turns.length ? 'Show scores' : 'Hide and pass');
        next.type = 'button';
        next.addEventListener('click', () => {
          if (turn + 1 >= turns.length) {
            stageName = 'board';
            const winner = Math.max(...scores);
            try {
              saveGameScore(localStorage, 'party', winner);
            } catch {
              // The round still shows its board.
            }
          } else {
            turn += 1;
            stageName = 'cover';
          }
          render();
        });
        panel.append(next);
      }
      return;
    }
    const entries = names.map((name, id) => ({ id: String(id), name, score: scores[id] ?? 0, connected: true }));
    panel.append(el('p', undefined, 'Highest score on this device:'), board(entries));
    panel.append(el('p', 'caption', 'These turns use different questions, so this total is not a shared challenge. Use Challenge link when friends should face the same list.'));
  }

  render();
  return () => {};
}

function mountChallenge(stage: HTMLElement, incoming: ChallengeLink | null): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  let link = incoming;
  let questions: QuizQuestion[] = [];
  let index = 0;
  let score = 0;
  let picked: number | null = null;
  let askedAt = 0;
  let phase: 'intro' | 'ask' | 'tell' | 'done' = 'intro';
  let saved = false;
  let timer = 0;

  function render() {
    window.clearTimeout(timer);
    panel.replaceChildren(el('h3', undefined, 'Challenge link'));
    if (phase === 'intro') {
      if (link) {
        panel.append(el('p', undefined, `A friend scored ${link.score} on ${link.total} shared questions. You get the same list. A correct answer is worth 60, plus up to 40 if you are quick.`));
      } else {
        panel.append(el('p', undefined, 'Play eight questions, then copy a link with your seed and score. A friend who opens it gets the same questions and tries to beat that number. Nothing is stored on a server.'));
      }
      const start = el('button', 'primary', link ? 'Try to beat it' : 'Play a challenge');
      start.type = 'button';
      start.addEventListener('click', () => {
        if (!link) link = { seed: Math.floor(Math.random() * 0xffffffff), score: 0, total: RACE_LENGTH };
        questions = selectQuestions(link.seed, link.total);
        index = 0;
        score = 0;
        picked = null;
        askedAt = Date.now();
        phase = 'ask';
        render();
      });
      panel.append(start);
      return;
    }
    const question = questions[index];
    if (!question || phase === 'done') {
      const target = incoming?.score ?? 0;
      const beat = incoming ? score > target : false;
      const tied = incoming ? score === target : false;
      if (!saved) {
        saved = true;
        try {
          saveGameScore(localStorage, 'party', score);
        } catch {
          // The result is still on screen.
        }
      }
      const detail = incoming
        ? beat
          ? `You scored ${score} and beat ${target}.`
          : tied
            ? `You tied at ${score}.`
            : `You scored ${score}. The link to beat was ${target}.`
        : `You scored ${score}. Copy the link and send it to a friend.`;
      panel.append(el('p', 'score', String(score)), el('p', undefined, detail));
      if (link) panel.append(challengeButton(link.seed, score, questions.length || link.total));
      return;
    }
    panel.append(el('p', 'caption', `Question ${index + 1} of ${questions.length} · score ${score}`), el('h3', undefined, question.prompt));
    const choices = el('div', 'choices');
    question.choices.forEach((choice, choiceIndex) => {
      const button = el('button', 'choice', choice);
      button.type = 'button';
      if (phase === 'tell') {
        button.disabled = true;
        if (choiceIndex === question.answer) button.classList.add('is-correct');
        if (choiceIndex === picked && choiceIndex !== question.answer) button.classList.add('is-wrong');
      }
      button.addEventListener('click', () => choose(choiceIndex));
      choices.append(button);
    });
    panel.append(choices);
    if (phase === 'ask') {
      timer = window.setTimeout(() => choose(-1), Math.max(0, QUESTION_MS - (Date.now() - askedAt)));
    } else {
      panel.append(el('p', 'banner good', question.explanation));
      const next = el('button', 'primary', index + 1 >= questions.length ? 'See the result' : 'Next');
      next.type = 'button';
      next.addEventListener('click', () => {
        if (index + 1 >= questions.length) phase = 'done';
        else {
          index += 1;
          picked = null;
          askedAt = Date.now();
          phase = 'ask';
        }
        render();
      });
      panel.append(next);
    }
  }

  function choose(choice: number) {
    if (phase !== 'ask') return;
    const question = questions[index];
    if (!question) return;
    picked = choice;
    score += racePoints(choice === question.answer, Date.now() - askedAt);
    phase = 'tell';
    render();
  }

  render();
  return () => window.clearTimeout(timer);
}

function statusNote(text: string, tone: 'good' | 'caution' | 'idle'): HTMLElement {
  const note = el('p', tone === 'idle' ? 'caption' : `banner ${tone}`, text);
  note.setAttribute('role', 'status');
  return note;
}

function roster(players: RoomView['players']): HTMLElement {
  const list = el('ul', 'roster');
  for (const player of rankBoard(players)) {
    const row = el('li', player.connected ? undefined : 'is-gone');
    row.append(el('strong', undefined, player.name), el('span', undefined, player.connected ? `${player.score}` : 'left'));
    list.append(row);
  }
  return list;
}

function board(players: RoomView['players']): HTMLElement {
  return roster(players);
}

function challengeButton(seed: number, score: number, total: number): HTMLElement {
  const hash = challengeHash({ seed, score, total });
  const button = el('button', 'ghost', 'Copy challenge link');
  button.type = 'button';
  if (!hash) {
    button.disabled = true;
    return button;
  }
  button.addEventListener('click', () => {
    const url = new URL(location.href);
    url.hash = hash.slice(1);
    void navigator.clipboard?.writeText(url.toString());
    button.textContent = 'Link copied';
  });
  return button;
}

function textField(labelText: string, value: string): { label: HTMLLabelElement; area: HTMLInputElement } {
  const area = el('input');
  area.type = 'text';
  area.value = value;
  area.maxLength = 16;
  const label = el('label', 'field');
  const caption = el('span', 'field-label', labelText);
  label.append(caption, area);
  return { label, area };
}

function uniqueName(name: string, taken: string[]): string {
  if (!taken.includes(name)) return name;
  let n = 2;
  while (taken.includes(`${name} ${n}`)) n += 1;
  return `${name} ${n}`.slice(0, 16);
}

function parseRoom(data: unknown): RoomView | null {
  if (!data || typeof data !== 'object') return null;
  const view = data as Partial<RoomView> & { messages?: unknown };
  if (view.t !== 'room' || !Array.isArray(view.players) || !Array.isArray(view.choices)) return null;
  if (view.phase !== 'lobby' && view.phase !== 'question' && view.phase !== 'reveal' && view.phase !== 'done') return null;
  const room = view as RoomView;
  room.messages = readMessages(view.messages);
  return room;
}

function parseClient(data: unknown): ClientMessage | null {
  if (!data || typeof data !== 'object') return null;
  const message = data as Partial<ClientMessage>;
  if (message.t === 'hello' && typeof message.name === 'string') return { t: 'hello', name: message.name };
  if (message.t === 'voice' && typeof message.on === 'boolean' && typeof message.muted === 'boolean') {
    return { t: 'voice', on: message.on, muted: message.muted };
  }
  if (message.t === 'chat' && typeof message.text === 'string') return { t: 'chat', text: message.text };
  if (message.t === 'react' && typeof message.id === 'string' && typeof message.emoji === 'string') {
    return { t: 'react', id: message.id, emoji: message.emoji };
  }
  if (message.t === 'rename' && typeof message.name === 'string') return { t: 'rename', name: message.name };
  if (message.t === 'answer' && typeof message.index === 'number' && typeof message.choice === 'number' && typeof message.ms === 'number') {
    return { t: 'answer', index: message.index, choice: message.choice, ms: message.ms };
  }
  return null;
}

function qrCode(text: string): SVGSVGElement {
  const qr = encode(text, { ecc: 'M', border: 2 });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${qr.size} ${qr.size}`);
  svg.classList.add('qr-code');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'QR code for the invite link');
  qr.data.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (!dark) return;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(x));
      rect.setAttribute('y', String(y));
      rect.setAttribute('width', '1');
      rect.setAttribute('height', '1');
      svg.append(rect);
    });
  });
  return svg;
}

function readRoute(): { mode: Mode; code: string; challenge: ChallengeLink | null } {
  const hash = location.hash.replace(/^#/, '');
  if (hash.startsWith('challenge/')) {
    return { mode: 'challenge', code: '', challenge: decodeChallenge(hash.slice('challenge/'.length)) };
  }
  const code = hash.startsWith('party/') ? normalizeRoomCode(hash.slice('party/'.length)) : null;
  return { mode: 'live', code: code ?? '', challenge: null };
}
