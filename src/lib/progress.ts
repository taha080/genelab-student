/** Browser-only progress. Nothing leaves the machine. */

export const TRACKED_TOOLS = [
  'dogma',
  'crispr',
  'primers',
  'mutations',
  'codon',
  'animation',
  'sequences',
  'biochem',
  'quiz',
] as const;

export type TrackedTool = (typeof TRACKED_TOOLS)[number];

export interface QuizAttempt {
  score: number;
  total: number;
  at: string;
}

export interface ProgressState {
  version: 1;
  /** ISO time of the first visit, keyed by tool. */
  used: Partial<Record<TrackedTool, string>>;
  quizzes: QuizAttempt[];
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
  { tool: 'quiz', title: 'Quiz', detail: 'Finish a quiz round.' },
];

export const PROGRESS_KEY = 'genelab-progress';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function emptyProgress(): ProgressState {
  return { version: 1, used: {}, quizzes: [] };
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
    return { version: 1, used, quizzes };
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
    { id: 'biochem', title: 'Metabolism', detail: 'Open the biochemistry bench.', earned: used('biochem') },
    { id: 'quiz', title: 'Quiz taken', detail: 'Finish one quiz.', earned: state.quizzes.length > 0 },
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

export function resetProgress(store: KeyValueStore): void {
  store.removeItem(PROGRESS_KEY);
}
