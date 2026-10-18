/**
 * Study-room rules that do not need a network: room codes, race scoring,
 * the same-question deck, pass-and-play turns, and challenge links.
 */
import { QUESTIONS, type QuizQuestion } from './quiz';
import { mulberry32, shuffle } from './random';

export const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const RACE_LENGTH = 8;
export const QUESTION_MS = 20_000;

export function makeRoomCode(rng: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += ROOM_ALPHABET[Math.floor(rng() * ROOM_ALPHABET.length)] ?? 'A';
  }
  return code;
}

export function normalizeRoomCode(raw: string): string | null {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length !== 4) return null;
  if ([...cleaned].some((character) => !ROOM_ALPHABET.includes(character))) return null;
  return cleaned;
}

export function peerIdForRoom(code: string): string {
  return `gl${code.toLowerCase()}`;
}

export function sanitizeName(raw: string): string {
  const cleaned = raw.replace(/[\u0000-\u001F]/g, '').trim().slice(0, 16);
  return cleaned || 'Student';
}

export const NICK_KEY = 'genelab-nickname';

export const FUN_NAMES = [
  'Sunny Cell',
  'Brave Base',
  'Quick Codon',
  'Gentle Gene',
  'Bright Bond',
  'Calm Cycle',
  'Tiny Helix',
  'Happy Host',
  'Kind Kinase',
  'Merry Molecule',
] as const;

export function pickFunName(rng: () => number = Math.random): string {
  const index = Math.min(FUN_NAMES.length - 1, Math.max(0, Math.floor(rng() * FUN_NAMES.length)));
  return FUN_NAMES[index] ?? 'Sunny Cell';
}

/** A saved nickname wins. A first visit gets a fun default the student can change. */
export function loadNickname(saved: string | null, rng: () => number = Math.random): string {
  if (saved && saved.trim()) return sanitizeName(saved);
  return pickFunName(rng);
}

export const JOIN_RETRIES = 3;

export function shouldRetryJoin(failures: number, max = JOIN_RETRIES): boolean {
  return Number.isInteger(failures) && failures >= 0 && failures < max;
}

export function joinError(kind: string): string {
  if (kind === 'peer-unavailable') {
    return "We can't reach that host. Check the code, or tap Retry — they may still be opening the room.";
  }
  return 'The connection dropped. Tap Retry to join again.';
}

export function inviteUrl(href: string, code: string): string {
  const url = new URL(href);
  url.hash = `party/${code}`;
  return url.toString();
}

/** A correct answer is worth 60, plus up to 40 for a fast reply. A miss scores 0. */
export function racePoints(correct: boolean, elapsedMs: number): number {
  if (!correct || !Number.isFinite(elapsedMs) || elapsedMs < 0) return 0;
  return 60 + Math.max(0, 40 - Math.floor(elapsedMs / 250));
}

export interface BoardEntry {
  id: string;
  name: string;
  score: number;
  connected: boolean;
}

export function rankBoard(entries: readonly BoardEntry[]): BoardEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

export interface Seat {
  id: string;
  connected: boolean;
  answered: boolean;
}

/** Connected players who still owe an answer. A disconnected seat does not block the room. */
export function waitingOn(seats: readonly Seat[]): string[] {
  return seats.filter((seat) => seat.connected && !seat.answered).map((seat) => seat.id);
}

export function selectQuestions(seed: number, count = RACE_LENGTH): QuizQuestion[] {
  const take = Math.max(0, Math.min(count, QUESTIONS.length));
  return shuffle(QUESTIONS, mulberry32(seed >>> 0)).slice(0, take);
}

/** Player indexes for a pass-and-play round. Each person gets `rounds` turns, in order. */
export function passTurns(playerCount: number, rounds: number): number[] {
  if (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 6) return [];
  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 8) return [];
  const turns: number[] = [];
  for (let round = 0; round < rounds; round += 1) {
    for (let player = 0; player < playerCount; player += 1) turns.push(player);
  }
  return turns;
}

export interface ChallengeLink {
  seed: number;
  score: number;
  total: number;
}

export function encodeChallenge(link: ChallengeLink): string | null {
  if (!Number.isInteger(link.seed) || link.seed < 0 || link.seed > 0xffffffff) return null;
  if (!Number.isInteger(link.score) || link.score < 0 || link.score > 100_000) return null;
  if (!Number.isInteger(link.total) || link.total < 1 || link.total > QUESTIONS.length) return null;
  const payload = JSON.stringify([link.seed, link.score, link.total]);
  return btoa(payload).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

export function decodeChallenge(raw: string): ChallengeLink | null {
  if (!raw || !/^[A-Za-z0-9_-]+$/.test(raw)) return null;
  try {
    const padded = raw.replaceAll('-', '+').replaceAll('_', '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const parsed: unknown = JSON.parse(atob(padded + pad));
    if (!Array.isArray(parsed) || parsed.length !== 3) return null;
    const [seed, score, total] = parsed;
    if (typeof seed !== 'number' || typeof score !== 'number' || typeof total !== 'number') return null;
    const link = { seed, score, total };
    return encodeChallenge(link) ? link : null;
  } catch {
    return null;
  }
}

export function challengeHash(link: ChallengeLink): string | null {
  const encoded = encodeChallenge(link);
  return encoded ? `#challenge/${encoded}` : null;
}
