import { describe, expect, it } from 'vitest';
import {
  badges,
  bestGame,
  bestQuiz,
  emptyProgress,
  loadProgress,
  markToolUsed,
  recordGame,
  recordQuiz,
  resetProgress,
  saveProgress,
  toolsUsed,
  type KeyValueStore,
} from '../src/lib/progress';

function memory(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

describe('progress tracker', () => {
  it('starts empty and remembers the first visit only', () => {
    let state = emptyProgress();
    state = markToolUsed(state, 'dogma', '2026-01-01T00:00:00.000Z');
    state = markToolUsed(state, 'dogma', '2026-02-01T00:00:00.000Z');
    expect(state.used.dogma).toBe('2026-01-01T00:00:00.000Z');
    expect(toolsUsed(state)).toBe(1);
    expect(badges(state).find((badge) => badge.id === 'dogma')?.earned).toBe(true);
    expect(badges(state).find((badge) => badge.id === 'complete')?.earned).toBe(false);
  });

  it('keeps the best quiz score and a perfect-score badge', () => {
    let state = recordQuiz(emptyProgress(), 14, 20, '2026-01-01T00:00:00.000Z');
    state = recordQuiz(state, 20, 20, '2026-01-02T00:00:00.000Z');
    state = recordQuiz(state, 18, 20, '2026-01-03T00:00:00.000Z');
    expect(bestQuiz(state)).toMatchObject({ score: 20, total: 20 });
    expect(badges(state).find((badge) => badge.id === 'perfect')?.earned).toBe(true);
    expect(recordQuiz(state, 21, 20, '2026-01-04T00:00:00.000Z').quizzes).toHaveLength(3);
  });

  it('round-trips through storage and ignores corrupt data', () => {
    const store = memory();
    const state = recordQuiz(markToolUsed(emptyProgress(), 'quiz', '2026-01-01T00:00:00.000Z'), 16, 20, '2026-01-01T00:00:00.000Z');
    saveProgress(store, state);
    expect(loadProgress(store)).toEqual(state);
    store.setItem('genelab-progress', '{not json');
    expect(loadProgress(store)).toEqual(emptyProgress());
    resetProgress(store);
    expect(loadProgress(store)).toEqual(emptyProgress());
  });

  it('earns the bench badge only after every tool and a finished quiz', () => {
    let state = emptyProgress();
    for (const tool of ['dogma', 'crispr', 'primers', 'mutations', 'codon', 'animation', 'sequences', 'biochem', 'metabolism', 'study', 'quiz', 'games', 'party'] as const) {
      state = markToolUsed(state, tool, '2026-01-01T00:00:00.000Z');
    }
    expect(badges(state).find((badge) => badge.id === 'complete')?.earned).toBe(false);
    state = recordQuiz(state, 10, 20, '2026-01-01T00:00:00.000Z');
    expect(badges(state).find((badge) => badge.id === 'complete')?.earned).toBe(true);
    expect(badges(state).find((badge) => badge.id === 'perfect')?.earned).toBe(false);
  });

  it('keeps game high scores and ignores an old save that has no game list', () => {
    let state = recordGame(emptyProgress(), 'codon-rush', 40, '2026-01-01T00:00:00.000Z');
    state = recordGame(state, 'codon-rush', 80, '2026-01-02T00:00:00.000Z');
    expect(bestGame(state, 'codon-rush')).toBe(80);
    expect(badges(state).find((badge) => badge.id === 'high-score')?.earned).toBe(true);
    expect(badges(state).find((badge) => badge.id === 'codon-rush')?.earned).toBe(true);
    const store = memory();
    saveProgress(store, emptyProgress());
    const raw = store.getItem('genelab-progress');
    const parsed = JSON.parse(raw ?? '{}') as { games?: unknown };
    delete parsed.games;
    store.setItem('genelab-progress', JSON.stringify(parsed));
    expect(loadProgress(store).games).toEqual([]);
  });
});
