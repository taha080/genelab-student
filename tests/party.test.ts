import { describe, expect, it } from 'vitest';
import {
  challengeHash,
  decodeChallenge,
  encodeChallenge,
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
} from '../src/lib/party';
import { QUESTIONS } from '../src/lib/quiz';
import { mulberry32 } from '../src/lib/random';

describe('study room rules', () => {
  it('builds a four-character room code the public broker can use as a peer id', () => {
    const code = makeRoomCode(mulberry32(4));
    expect(code).toHaveLength(4);
    expect(normalizeRoomCode(` ${code.toLowerCase()} `)).toBe(code);
    expect(normalizeRoomCode('A0I1')).toBeNull();
    expect(peerIdForRoom(code)).toBe(`gl${code.toLowerCase()}`);
    expect(sanitizeName('  Maya\n')).toBe('Maya');
    expect(sanitizeName('   ')).toBe('Student');
  });

  it('scores a fast correct answer above a slow one, and a miss at zero', () => {
    expect(racePoints(true, 0)).toBe(100);
    expect(racePoints(true, 1000)).toBe(96);
    expect(racePoints(true, 20_000)).toBe(60);
    expect(racePoints(false, 10)).toBe(0);
  });

  it('does not let a disconnected player block the question', () => {
    expect(
      waitingOn([
        { id: 'host', connected: true, answered: true },
        { id: 'gone', connected: false, answered: false },
        { id: 'friend', connected: true, answered: false },
      ]),
    ).toEqual(['friend']);
  });

  it('deals the same quiz from a seed and ranks the board', () => {
    const first = selectQuestions(99, 8);
    expect(selectQuestions(99, 8).map((question) => question.id)).toEqual(first.map((question) => question.id));
    expect(first).toHaveLength(8);
    expect(new Set(first.map((question) => question.id)).size).toBe(8);
    expect(first.every((question) => QUESTIONS.some((item) => item.id === question.id))).toBe(true);
    expect(rankBoard([
      { id: 'b', name: 'Bea', score: 80, connected: true },
      { id: 'a', name: 'Amy', score: 100, connected: false },
      { id: 'c', name: 'Bea', score: 80, connected: true },
    ]).map((entry) => entry.id)).toEqual(['a', 'b', 'c']);
  });

  it('rotates pass-and-play and round-trips a challenge link', () => {
    expect(passTurns(3, 2)).toEqual([0, 1, 2, 0, 1, 2]);
    expect(passTurns(1, 4)).toEqual([]);
    const encoded = encodeChallenge({ seed: 42, score: 480, total: 8 });
    expect(encoded).toBeTruthy();
    expect(decodeChallenge(encoded ?? '')).toEqual({ seed: 42, score: 480, total: 8 });
    expect(decodeChallenge('not a link')).toBeNull();
    expect(challengeHash({ seed: 42, score: 480, total: 8 })).toBe(`#challenge/${encoded}`);
  });

  it('remembers a nickname, retries a dropped join, and builds an invite link', () => {
    expect(loadNickname('  Ali  ')).toBe('Ali');
    expect(loadNickname(null, () => 0)).toBe('Sunny Cell');
    expect(loadNickname('   ', () => 0)).toBe('Sunny Cell');
    expect(sanitizeName(`${'A'.repeat(40)}`)).toHaveLength(16);
    expect(sanitizeName('<b>Ali</b>')).toBe('<b>Ali</b>');
    expect(shouldRetryJoin(0)).toBe(true);
    expect(shouldRetryJoin(2)).toBe(true);
    expect(shouldRetryJoin(3)).toBe(false);
    expect(shouldRetryJoin(-1)).toBe(false);
    expect(joinError('peer-unavailable')).toMatch(/Retry/);
    expect(joinError('dropped')).toMatch(/Retry/);
    expect(inviteUrl('https://example.test/genelab/', 'ab23')).toBe('https://example.test/genelab/#party/ab23');
    expect(normalizeRoomCode(' ab23 ')).toBe('AB23');
  });
});
