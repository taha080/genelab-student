/** Browser-only progress. Nothing leaves the machine. */
import { isMetabolismLesson, METABOLISM_LESSON_IDS, type MetabolismLessonId } from './metabolism';

export const TRACKED_TOOLS = [
  'dogma',
  'crispr',
  'primers',
  'mutations',
  'codon',
  'animation',
  'sequences',
  'biochem',
  'metabolism',
  'quiz',
  'games',
  'party',
] as const;

export const GAME_IDS = ['codon-rush', 'base-pair', 'krebs', 'enzyme', 'mutation', 'party'] as const;

export type GameId = (typeof GAME_IDS)[number];

export interface GameAttempt {
  game: GameId;
  score: number;
  at: string;
}

export type TrackedTool = (typeof TRACKED_TOOLS)[number];

export interface QuizAttempt {
  score: number;
  total: number;
  at: string;
}

export interface LessonCheck {
  id: MetabolismLessonId;
  score: number;
  total: number;
  at: string;
}

export interface ProgressState {
  version: 1;
  /** ISO time of the first visit, keyed by tool. */
  used: Partial<Record<TrackedTool, string>>;
  quizzes: QuizAttempt[];
  games: GameAttempt[];
  /** Quick checks from the metabolism lessons. Missing on saves from before those lessons. */
  checks: LessonCheck[];
}

export interface Badge {
  id: string;
  title: string;
  detail: string;
  earned: boolean;
}

export interface Lesson {
  tool: TrackedTool;
  title: string;
  detail: string;
}

export const LESSONS: readonly Lesson[] = [
  { tool: 'dogma', title: 'Central dogma', detail: 'Walk from a coding strand to mRNA and amino acids.' },
  { tool: 'crispr', title: 'CRISPR guides', detail: 'Find NGG sites and read the 20-base guides.' },
  { tool: 'primers', title: 'PCR primers', detail: 'Compare melting temperatures and primer warnings.' },
  { tool: 'mutations', title: 'Mutations', detail: 'See a silent, missense, nonsense, or frameshift change.' },
  { tool: 'codon', title: 'Codon table', detail: 'Look up a codon or an amino acid in the standard code.' },
  { tool: 'animation', title: 'Animation', detail: 'Step through the helix, transcription, or translation.' },
  { tool: 'sequences', title: 'Sequence tools', detail: 'Reverse-complement, cut, find an ORF, or align two sequences.' },
  { tool: 'biochem', title: 'Biochemistry', detail: 'Amino acids, enzyme kinetics, the citric acid cycle, and gluconeogenesis.' },
  { tool: 'metabolism', title: 'Metabolism lessons', detail: 'ATP, glycolysis, glycogen, the pentose phosphate pathway, and oxidative phosphorylation.' },
  { tool: 'quiz', title: 'Quiz', detail: 'Finish a quiz round.' },
  { tool: 'games', title: 'Games', detail: 'Play a round and keep a high score.' },
  { tool: 'party', title: 'Study room', detail: 'Join a room, pass a device, or open a challenge link.' },
];

export const PROGRESS_KEY = 'genelab-progress';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function emptyProgress(): ProgressState {
  return { version: 1, used: {}, quizzes: [], games: [], checks: [] };
}

function isGameId(value: unknown): value is GameId {
  return typeof value === 'string' && (GAME_IDS as readonly string[]).includes(value);
}

export function loadProgress(store: KeyValueStore): ProgressState {
  try {
    const raw = store.getItem(PROGRESS_KEY);
    if (!raw) return emptyProgress();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyProgress();
    const record = parsed as Partial<ProgressState>;
    if (record.version !== 1) return emptyProgress();
    const used: ProgressState['used'] = {};
    if (record.used && typeof record.used === 'object') {
      for (const tool of TRACKED_TOOLS) {
        const value = record.used[tool];
        if (typeof value === 'string' && value) used[tool] = value;
      }
    }
    const quizzes: QuizAttempt[] = [];
    if (Array.isArray(record.quizzes)) {
      for (const attempt of record.quizzes) {
        if (!attempt || typeof attempt !== 'object') continue;
        const score = Number((attempt as QuizAttempt).score);
        const total = Number((attempt as QuizAttempt).total);
        const at = (attempt as QuizAttempt).at;
        if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1) continue;
        if (score < 0 || score > total || typeof at !== 'string') continue;
        quizzes.push({ score, total, at });
      }
    }
    const games: GameAttempt[] = [];
    if (Array.isArray(record.games)) {
      for (const attempt of record.games) {
        if (!attempt || typeof attempt !== 'object') continue;
        const game = (attempt as GameAttempt).game;
        const score = Number((attempt as GameAttempt).score);
        const at = (attempt as GameAttempt).at;
        if (!isGameId(game) || !Number.isInteger(score) || score < 0 || score > 100_000) continue;
        if (typeof at !== 'string') continue;
        games.push({ game, score, at });
      }
    }
    const checks: LessonCheck[] = [];
    if (Array.isArray(record.checks)) {
      for (const item of record.checks) {
        if (!item || typeof item !== 'object') continue;
        const id = (item as LessonCheck).id;
        const score = Number((item as LessonCheck).score);
        const total = Number((item as LessonCheck).total);
        const at = (item as LessonCheck).at;
        if (!isMetabolismLesson(id) || !Number.isInteger(score) || !Number.isInteger(total) || total < 1) continue;
        if (score < 0 || score > total || typeof at !== 'string') continue;
        checks.push({ id, score, total, at });
      }
    }
    return { version: 1, used, quizzes, games, checks };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(store: KeyValueStore, state: ProgressState): void {
  store.setItem(PROGRESS_KEY, JSON.stringify(state));
}

export function markToolUsed(state: ProgressState, tool: TrackedTool, at: string): ProgressState {
  if (state.used[tool]) return state;
  return { ...state, used: { ...state.used, [tool]: at } };
}

export function recordQuiz(state: ProgressState, score: number, total: number, at: string): ProgressState {
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) {
    return state;
  }
  return { ...state, quizzes: [...state.quizzes, { score, total, at }] };
}

export function recordGame(state: ProgressState, game: GameId, score: number, at: string): ProgressState {
  if (!Number.isInteger(score) || score < 0 || score > 100_000) return state;
  return { ...state, games: [...state.games, { game, score, at }] };
}

export function bestGame(state: ProgressState, game: GameId): number | null {
  let best: number | null = null;
  for (const attempt of state.games) {
    if (attempt.game !== game) continue;
    if (best === null || attempt.score > best) best = attempt.score;
  }
  return best;
}

export function bestQuiz(state: ProgressState): QuizAttempt | null {
  let best: QuizAttempt | null = null;
  for (const attempt of state.quizzes) {
    if (!best || attempt.score > best.score || (attempt.score === best.score && attempt.total > best.total)) {
      best = attempt;
    }
  }
  return best;
}

export function toolsUsed(state: ProgressState): number {
  return TRACKED_TOOLS.filter((tool) => state.used[tool]).length;
}

export function badges(state: ProgressState): Badge[] {
  const used = (tool: TrackedTool) => Boolean(state.used[tool]);
  const best = bestQuiz(state);
  const perfect = Boolean(best && best.score === best.total && best.total >= 20);
  const allTools = TRACKED_TOOLS.every((tool) => (tool === 'quiz' ? state.quizzes.length > 0 || used('quiz') : used(tool)));
  const list: Badge[] = [
    {
      id: 'curious',
      title: 'First look',
      detail: 'Open any tool.',
      earned: toolsUsed(state) > 0 || state.quizzes.length > 0,
    },
    { id: 'dogma', title: 'Central dogma', detail: 'Open the codon walker.', earned: used('dogma') },
    { id: 'crispr', title: 'Guide list', detail: 'Open the CRISPR finder.', earned: used('crispr') },
    { id: 'primers', title: 'Primer check', detail: 'Open the PCR primer bench.', earned: used('primers') },
    { id: 'mutations', title: 'Editor', detail: 'Open the mutation simulator.', earned: used('mutations') },
    { id: 'codon', title: 'Code reader', detail: 'Open the codon table.', earned: used('codon') },
    { id: 'animation', title: 'In motion', detail: 'Open the helix and polymerase.', earned: used('animation') },
    { id: 'sequences', title: 'Sequence bench', detail: 'Open the sequence tools.', earned: used('sequences') },
    { id: 'biochem', title: 'Biochemistry', detail: 'Open the biochemistry bench.', earned: used('biochem') },
    { id: 'metabolism', title: 'Pathways', detail: 'Open the metabolism lessons.', earned: used('metabolism') },
    { id: 'quiz', title: 'Quiz taken', detail: 'Finish one quiz.', earned: state.quizzes.length > 0 },
    { id: 'games', title: 'Player', detail: 'Finish any game.', earned: state.games.some((attempt) => attempt.game !== 'party') },
    { id: 'codon-rush', title: 'Codon rush', detail: 'Translate codons against the clock.', earned: state.games.some((attempt) => attempt.game === 'codon-rush') },
    { id: 'base-pair', title: 'Base pairs', detail: 'Match A–T, G–C, and A–U.', earned: state.games.some((attempt) => attempt.game === 'base-pair') },
    { id: 'krebs', title: 'Cycle order', detail: 'Place the citric acid cycle in order.', earned: state.games.some((attempt) => attempt.game === 'krebs') },
    { id: 'enzyme', title: 'Enzyme match', detail: 'Pair enzymes with their reactions.', earned: state.games.some((attempt) => attempt.game === 'enzyme') },
    { id: 'mutation', title: 'Detective', detail: 'Name a mutation from the sequence change.', earned: state.games.some((attempt) => attempt.game === 'mutation') },
    { id: 'party', title: 'Study group', detail: 'Finish a room, a pass-and-play round, or a challenge.', earned: state.games.some((attempt) => attempt.game === 'party') },
    {
      id: 'pathways',
      title: 'Six pathways',
      detail: 'Finish the quiz in every metabolism lesson.',
      earned: METABOLISM_LESSON_IDS.every((id) => state.checks.some((check) => check.id === id)),
    },
    {
      id: 'high-score',
      title: 'High score',
      detail: 'Score 80 or more in any game.',
      earned: state.games.some((attempt) => attempt.game !== 'party' && attempt.score >= 80),
    },
    { id: 'perfect', title: 'Full marks', detail: 'Answer every question in a round.', earned: perfect },
    {
      id: 'complete',
      title: 'Bench complete',
      detail: 'Open every tool and finish a quiz.',
      earned: allTools && state.quizzes.length > 0,
    },
  ];
  return list;
}

export function bestLessonCheck(state: ProgressState, id: MetabolismLessonId): LessonCheck | null {
  let best: LessonCheck | null = null;
  for (const check of state.checks) {
    if (check.id !== id) continue;
    if (!best || check.score > best.score) best = check;
  }
  return best;
}

export function recordLessonCheck(state: ProgressState, id: string, score: number, total: number, at: string): ProgressState {
  if (!isMetabolismLesson(id)) return state;
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) return state;
  return { ...state, checks: [...state.checks, { id, score, total, at }] };
}

export function touchTool(store: KeyValueStore, tool: TrackedTool, at = new Date().toISOString()): ProgressState {
  const next = markToolUsed(loadProgress(store), tool, at);
  saveProgress(store, next);
  return next;
}

export function saveQuizScore(store: KeyValueStore, score: number, total: number, at = new Date().toISOString()): ProgressState {
  const next = recordQuiz(markToolUsed(loadProgress(store), 'quiz', at), score, total, at);
  saveProgress(store, next);
  return next;
}

export function saveGameScore(store: KeyValueStore, game: GameId, score: number, at = new Date().toISOString()): ProgressState {
  const tool: TrackedTool = game === 'party' ? 'party' : 'games';
  const next = recordGame(markToolUsed(loadProgress(store), tool, at), game, score, at);
  saveProgress(store, next);
  return next;
}

export function saveLessonCheck(
  store: KeyValueStore,
  id: string,
  score: number,
  total: number,
  at = new Date().toISOString(),
): ProgressState {
  const next = recordLessonCheck(markToolUsed(loadProgress(store), 'metabolism', at), id, score, total, at);
  saveProgress(store, next);
  return next;
}

export function resetProgress(store: KeyValueStore): void {
  store.removeItem(PROGRESS_KEY);
}
