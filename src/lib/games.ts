/**
 * Classroom game rules. Answers come from the codon table, the citric-acid
 * cycle, and the same mutation classifier the editor uses.
 */
import { KREBS_STEPS } from './biochem';
import { AMINO_ACIDS, CODON_TO_AA } from './codon';
import { interpretEdit, type EffectKind, type MutationEdit } from './mutation';
import { mulberry32, pick, shuffle } from './random';

export interface CodonRound {
  /** mRNA codon, U in place of T. */
  codon: string;
  answer: string;
  choices: readonly string[];
}

const DNA_CODONS = Object.keys(CODON_TO_AA);

export function aminoAcidName(letter: string): string {
  if (letter === '*') return 'Stop';
  const name = AMINO_ACIDS[letter]?.name;
  if (!name) return 'Stop';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function codonRound(rng: () => number, avoid = ''): CodonRound {
  let dna = pick(DNA_CODONS, rng);
  for (let i = 0; i < 6 && dna === avoid; i += 1) dna = pick(DNA_CODONS, rng);
  const answer = aminoAcidName(CODON_TO_AA[dna] ?? '*');
  const names = [...new Set(DNA_CODONS.map((codon) => aminoAcidName(CODON_TO_AA[codon] ?? '*')))].filter(
    (name) => name !== answer,
  );
  const choices = shuffle([answer, ...shuffle(names, rng).slice(0, 3)], rng);
  return { codon: dna.replaceAll('T', 'U'), answer, choices };
}

export function codonRounds(seed: number, count: number): CodonRound[] {
  const rng = mulberry32(seed);
  const rounds: CodonRound[] = [];
  let previous = '';
  for (let i = 0; i < count; i += 1) {
    const round = codonRound(rng, previous);
    previous = round.codon.replaceAll('U', 'T');
    rounds.push(round);
  }
  return rounds;
}

/** 10 points per correct codon, a small streak bonus, and a 2-point penalty for a miss. */
export function scoreCodonRush(correct: number, wrong: number, bestStreak: number): number {
  if (correct < 0 || wrong < 0 || bestStreak < 0) return 0;
  const bonus = Math.max(0, bestStreak - 1) * 2;
  return Math.max(0, correct * 10 + bonus - wrong * 2);
}

export interface PairCard {
  id: string;
  pairId: string;
  base: string;
  context: 'DNA' | 'RNA';
}

/**
 * Strict classroom pairs. DNA adenine is not the partner of RNA uracil;
 * each card names the nucleic acid so the match is unambiguous.
 */
export const BASE_PAIR_DECK: readonly PairCard[] = [
  { id: 'dna-a', pairId: 'dna-at', base: 'A', context: 'DNA' },
  { id: 'dna-t', pairId: 'dna-at', base: 'T', context: 'DNA' },
  { id: 'dna-g', pairId: 'dna-gc', base: 'G', context: 'DNA' },
  { id: 'dna-c', pairId: 'dna-gc', base: 'C', context: 'DNA' },
  { id: 'rna-a', pairId: 'rna-au', base: 'A', context: 'RNA' },
  { id: 'rna-u', pairId: 'rna-au', base: 'U', context: 'RNA' },
  { id: 'rna-g', pairId: 'rna-gc', base: 'G', context: 'RNA' },
  { id: 'rna-c', pairId: 'rna-gc', base: 'C', context: 'RNA' },
];

export function shuffledPairs(seed: number): PairCard[] {
  return shuffle(BASE_PAIR_DECK, mulberry32(seed));
}

export function cardsMatch(a: PairCard, b: PairCard): boolean {
  return a.id !== b.id && a.pairId === b.pairId;
}

/** Four pairs are worth 25 each. Every mismatch costs 5, and the score stays at zero or above. */
export function scoreBasePairs(pairs: number, mismatches: number): number {
  if (pairs < 0 || mismatches < 0) return 0;
  return Math.max(0, pairs * 25 - mismatches * 5);
}

export interface OrderItem {
  id: string;
  label: string;
}

export function krebsOrder(): OrderItem[] {
  return KREBS_STEPS.map((step) => ({ id: step.id, label: step.enzyme }));
}

export function shuffledKrebs(seed: number): OrderItem[] {
  return shuffle(krebsOrder(), mulberry32(seed));
}

export function scorePlacement(submitted: readonly string[], answer: readonly string[]): { correct: number; score: number } {
  const limit = Math.min(submitted.length, answer.length);
  let correct = 0;
  for (let i = 0; i < limit; i += 1) if (submitted[i] === answer[i]) correct += 1;
  const perfect = correct === answer.length && submitted.length === answer.length && answer.length > 0;
  return { correct, score: correct * 12 + (perfect ? 4 : 0) };
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length || from === to) return [...items];
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

export interface EnzymePair {
  id: string;
  enzyme: string;
  reaction: string;
}

/** Enzymes from the citric acid cycle and the gluconeogenesis bypasses. */
export const ENZYME_PAIRS: readonly EnzymePair[] = [
  {
    id: 'cs',
    enzyme: 'Citrate synthase',
    reaction: 'Acetyl-CoA + oxaloacetate + H₂O → citrate + CoA',
  },
  {
    id: 'idh',
    enzyme: 'Isocitrate dehydrogenase',
    reaction: 'Isocitrate + NAD⁺ → α-ketoglutarate + CO₂ + NADH',
  },
  {
    id: 'scs',
    enzyme: 'Succinyl-CoA synthetase',
    reaction: 'Succinyl-CoA + GDP + Pi → succinate + GTP + CoA',
  },
  {
    id: 'sdh',
    enzyme: 'Succinate dehydrogenase',
    reaction: 'Succinate → fumarate, with electrons passed to ubiquinone',
  },
  {
    id: 'pc',
    enzyme: 'Pyruvate carboxylase',
    reaction: 'Pyruvate + CO₂ + ATP → oxaloacetate + ADP + Pi',
  },
  {
    id: 'fbpase',
    enzyme: 'Fructose-1,6-bisphosphatase',
    reaction: 'Fructose 1,6-bisphosphate + H₂O → fructose 6-phosphate + Pi',
  },
];

export function scoreEnzymeMatch(correct: number, mistakes: number, total = ENZYME_PAIRS.length): number {
  if (correct < 0 || mistakes < 0 || total < 1) return 0;
  const bonus = correct === total && mistakes === 0 ? 4 : 0;
  return Math.max(0, correct * 16 - mistakes * 4 + bonus);
}

export interface DetectiveCase {
  id: string;
  prompt: string;
  before: string;
  after: string;
  proteinBefore: string;
  proteinAfter: string;
  effect: EffectKind;
  choices: readonly EffectKind[];
}

const EFFECT_CHOICES: Record<string, readonly EffectKind[]> = {
  silent: ['silent', 'missense', 'nonsense', 'frameshift'],
  missense: ['missense', 'silent', 'nonsense', 'stop-loss'],
  nonsense: ['nonsense', 'missense', 'silent', 'frameshift'],
  frameshift: ['frameshift', 'in-frame-insertion', 'missense', 'silent'],
  'stop-loss': ['stop-loss', 'nonsense', 'silent', 'missense'],
  'in-frame-deletion': ['in-frame-deletion', 'frameshift', 'missense', 'silent'],
};

const DETECTIVE_EDITS: readonly { id: string; prompt: string; before: string; edit: MutationEdit }[] = [
  {
    id: 'silent',
    prompt: 'Coding DNA ATGTTTTAA changes at position 6, T to C. TTT and TTC both encode phenylalanine.',
    before: 'ATGTTTTAA',
    edit: { kind: 'substitution', position: 6, base: 'C' },
  },
  {
    id: 'missense',
    prompt: 'Coding DNA ATGTTTTAA changes at position 4, T to A. The second codon is no longer TTT.',
    before: 'ATGTTTTAA',
    edit: { kind: 'substitution', position: 4, base: 'A' },
  },
  {
    id: 'nonsense',
    prompt: 'In ATGTTTGGCTGCAAACCGGAGTAA, position 12 changes from C to A.',
    before: 'ATGTTTGGCTGCAAACCGGAGTAA',
    edit: { kind: 'substitution', position: 12, base: 'A' },
  },
  {
    id: 'frameshift',
    prompt: 'An extra A is inserted before position 4 of ATGTTTGGCTAA.',
    before: 'ATGTTTGGCTAA',
    edit: { kind: 'insertion', position: 4, inserted: 'A' },
  },
  {
    id: 'stop-loss',
    prompt: 'The stop of ATGTTTGGCTGCAAACCGGAGTAA changes at position 22, T to C.',
    before: 'ATGTTTGGCTGCAAACCGGAGTAA',
    edit: { kind: 'substitution', position: 22, base: 'C' },
  },
  {
    id: 'in-frame-deletion',
    prompt: 'Three bases are deleted from ATGTTTGGCTAA, starting at position 4.',
    before: 'ATGTTTGGCTAA',
    edit: { kind: 'deletion', position: 4, count: 3 },
  },
];

export const EFFECT_LABELS: Record<EffectKind, string> = {
  unchanged: 'Unchanged',
  silent: 'Silent',
  missense: 'Missense',
  nonsense: 'Nonsense',
  'stop-loss': 'Stop-loss',
  frameshift: 'Frameshift',
  'in-frame-insertion': 'In-frame insertion',
  'in-frame-deletion': 'In-frame deletion',
};

export function detectiveCases(): DetectiveCase[] {
  return DETECTIVE_EDITS.map((item) => {
    const result = interpretEdit(item.before, item.edit);
    if ('error' in result) throw new Error(`Detective case ${item.id} failed: ${result.error}`);
    const choices = EFFECT_CHOICES[item.id];
    if (!choices?.includes(result.effect)) throw new Error(`Detective case ${item.id} effect ${result.effect} is not a choice`);
    return {
      id: item.id,
      prompt: item.prompt,
      before: result.original,
      after: result.mutant,
      proteinBefore: result.polypeptideOriginal,
      proteinAfter: result.polypeptideMutant,
      effect: result.effect,
      choices,
    };
  });
}

export function scoreDetective(correct: number, total: number): number {
  if (correct < 0 || total < 1 || correct > total) return 0;
  const each = Math.floor(96 / total);
  const bonus = correct === total ? 100 - each * total : 0;
  return correct * each + bonus;
}
