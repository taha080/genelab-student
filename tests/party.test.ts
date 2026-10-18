import { describe, expect, it } from 'vitest';
import {
  challengeHash,
  decodeChallenge,
  encodeChallenge,
  passTurns,
  racePoints,
  rankBoard,
  sanitizeName,
  selectQuestions,
} from '../src/lib/party';
import { QUESTIONS } from '../src/lib/quiz';

describe('study room rules', () => {
  it('keeps a short display name', () => {
    expect(sanitizeName('  Maya\n')).toBe('Maya');
    expect(sanitizeName('   ')).toBe('Student');
  });

  it('scores a fast correct answer above a slow one, and a miss at zero', () => {
    expect(racePoints(true, 0)).toBe(100);
    expect(racePoints(true, 1000)).toBe(96);
    expect(racePoints(true, 20_000)).toBe(60);
    expect(racePoints(false, 10)).toBe(0);
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
});
