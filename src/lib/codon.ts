/**
 * Standard genetic code, NCBI translation table 1.
 * Mitochondrial and some bacterial codes differ; this bench does not use them.
 * ATG is the start students are taught. TAA, TAG, and TGA are stops.
 */
import { cleanDna, complement, dnaToRna, reverseComplement } from './sequence';

const TABLE = `
TTT F TTC F TTA L TTG L
TCT S TCC S TCA S TCG S
TAT Y TAC Y TAA * TAG *
TGT C TGC C TGA * TGG W
CTT L CTC L CTA L CTG L
CCT P CCC P CCA P CCG P
CAT H CAC H CAA Q CAG Q
CGT R CGC R CGA R CGG R
ATT I ATC I ATA I ATG M
ACT T ACC T ACA T ACG T
AAT N AAC N AAA K AAG K
AGT S AGC S AGA R AGG R
GTT V GTC V GTA V GTG V
GCT A GCC A GCA A GCG A
GAT D GAC D GAA E GAG E
GGT G GGC G GGA G GGG G
`;

function parseCodonTable(source: string): Record<string, string> {
  const tokens = source.trim().split(/\s+/);
  if (tokens.length !== 128) {
    throw new Error(`Expected 64 codons, found ${tokens.length / 2}`);
  }
  const map: Record<string, string> = {};
  for (let i = 0; i < tokens.length; i += 2) {
    const codon = tokens[i];
    const aa = tokens[i + 1];
    if (!codon || !aa || codon.length !== 3 || map[codon]) {
      throw new Error(`Bad codon table entry at ${codon ?? i}`);
    }
    map[codon] = aa;
  }
  return map;
}

export const CODON_TO_AA: Readonly<Record<string, string>> = parseCodonTable(TABLE);

export const AMINO_ACIDS: Readonly<Record<string, { short: string; name: string }>> = {
  A: { short: 'Ala', name: 'alanine' },
  R: { short: 'Arg', name: 'arginine' },
  N: { short: 'Asn', name: 'asparagine' },
  D: { short: 'Asp', name: 'aspartic acid' },
  C: { short: 'Cys', name: 'cysteine' },
  Q: { short: 'Gln', name: 'glutamine' },
  E: { short: 'Glu', name: 'glutamic acid' },
  G: { short: 'Gly', name: 'glycine' },
  H: { short: 'His', name: 'histidine' },
  I: { short: 'Ile', name: 'isoleucine' },
  L: { short: 'Leu', name: 'leucine' },
  K: { short: 'Lys', name: 'lysine' },
  M: { short: 'Met', name: 'methionine' },
  F: { short: 'Phe', name: 'phenylalanine' },
  P: { short: 'Pro', name: 'proline' },
  S: { short: 'Ser', name: 'serine' },
  T: { short: 'Thr', name: 'threonine' },
  W: { short: 'Trp', name: 'tryptophan' },
  Y: { short: 'Tyr', name: 'tyrosine' },
  V: { short: 'Val', name: 'valine' },
  '*': { short: 'Stop', name: 'stop' },
};

export type FrameId = 1 | 2 | 3 | -1 | -2 | -3;

export interface CodonView {
  /** 0-based index among complete codons in this frame. */
  index: number;
  dna: string;
  mrna: string;
  /** Complements aligned under the codon, so this row reads 3′→5′ left to right. */
  template: string;
  aa: string | null;
  short: string | null;
  name: string | null;
  incomplete: boolean;
  isStart: boolean;
  isStop: boolean;
}

export interface OpenReadingFrame {
  /** 1-based codon number of the first ATG, if there is one. */
  startCodon: number | null;
  /** 1-based codon number of the in-frame stop after that ATG. */
  stopCodon: number | null;
  /** Amino acids from the start through the codon before the stop. */
  aminoAcids: number | null;
  stopBeforeStart: boolean;
}

export interface FrameAnalysis {
  frame: FrameId;
  /** Strand actually being read, 5′→3′. */
  coding: string;
  /** Bases skipped so the first codon starts on the frame boundary. */
  skipped: string;
  codons: CodonView[];
  /** One-letter protein for every complete codon, including codons after a stop. */
  protein: string;
  /** Protein through the first stop, including the star. Later codons are omitted. */
  polypeptide: string;
  orf: OpenReadingFrame;
}

export function translateCodon(codon: string): string | null {
  if (codon.length !== 3) return null;
  return CODON_TO_AA[codon] ?? null;
}

const RNA_PAIR: Record<string, string> = { A: 'U', U: 'A', G: 'C', C: 'G' };

/**
 * Strict Watson–Crick anticodon for an mRNA codon.
 * `threeToFive` lines up under the codon. `fiveToThree` is the usual written order.
 * Real tRNAs often wobble at the third codon base; this helper does not.
 */
export function anticodon(mrnaCodon: string): { threeToFive: string; fiveToThree: string } | null {
  if (mrnaCodon.length !== 3) return null;
  let threeToFive = '';
  for (const base of mrnaCodon.toUpperCase()) {
    const pair = RNA_PAIR[base];
    if (!pair) return null;
    threeToFive += pair;
  }
  return { threeToFive, fiveToThree: [...threeToFive].reverse().join('') };
}

/** Translate a coding strand in a 0-based frame. Incomplete trailing bases are ignored. */
export function translate(raw: string, frame = 0): string {
  const seq = cleanDna(raw).seq;
  let protein = '';
  for (let i = frame; i + 3 <= seq.length; i += 3) {
    protein += CODON_TO_AA[seq.slice(i, i + 3)] ?? 'X';
  }
  return protein;
}

export function polypeptideOf(protein: string): string {
  const stop = protein.indexOf('*');
  if (stop < 0) return protein;
  return protein.slice(0, stop + 1);
}

/**
 * Read one frame of a coding strand.
 * Positive frames start at base 1, 2, or 3. Negative frames read the opposite
 * strand 5′→3′, then apply the same offset.
 */
export function analyzeFrame(raw: string, frame: FrameId): FrameAnalysis {
  const cleaned = cleanDna(raw).seq;
  const coding = frame > 0 ? cleaned : reverseComplement(cleaned);
  const offset = Math.abs(frame) - 1;
  const skipped = coding.slice(0, offset);
  const codons: CodonView[] = [];
  let index = 0;
  for (let i = offset; i < coding.length; i += 3) {
    const dna = coding.slice(i, i + 3);
    const incomplete = dna.length < 3;
    const aa = incomplete ? null : (CODON_TO_AA[dna] ?? null);
    const info = aa ? AMINO_ACIDS[aa] : undefined;
    codons.push({
      index,
      dna,
      mrna: dnaToRna(dna),
      template: complement(dna),
      aa,
      short: info?.short ?? null,
      name: info?.name ?? null,
      incomplete,
      isStart: dna === 'ATG',
      isStop: aa === '*',
    });
    index += 1;
  }
  const protein = codons
    .filter((codon) => !codon.incomplete && codon.aa)
    .map((codon) => codon.aa)
    .join('');
  return {
    frame,
    coding,
    skipped,
    codons,
    protein,
    polypeptide: polypeptideOf(protein),
    orf: describeOrf(codons),
  };
}

function describeOrf(codons: CodonView[]): OpenReadingFrame {
  const complete = codons.filter((codon) => !codon.incomplete);
  const start = complete.findIndex((codon) => codon.isStart);
  const earlyStop = complete.findIndex((codon) => codon.isStop);
  if (start < 0) {
    return { startCodon: null, stopCodon: null, aminoAcids: null, stopBeforeStart: earlyStop >= 0 };
  }
  const after = complete.slice(start + 1).findIndex((codon) => codon.isStop);
  if (after < 0) {
    return {
      startCodon: start + 1,
      stopCodon: null,
      aminoAcids: null,
      stopBeforeStart: earlyStop >= 0 && earlyStop < start,
    };
  }
  const stop = start + 1 + after;
  return {
    startCodon: start + 1,
    stopCodon: stop + 1,
    aminoAcids: stop - start,
    stopBeforeStart: earlyStop >= 0 && earlyStop < start,
  };
}

/** Codons that are not stops, used when building a random open reading frame. */
export function senseCodons(): string[] {
  return Object.entries(CODON_TO_AA)
    .filter(([, aa]) => aa !== '*')
    .map(([codon]) => codon);
}

/**
 * Synthetic open reading frame: ATG, then `aminoAcids - 1` sense codons, then TAA.
 * `aminoAcids` includes the starting methionine and excludes the stop.
 */
export function randomOrf(aminoAcids: number, rng: () => number = Math.random): string {
  const choices = senseCodons();
  const n = Math.max(1, Math.floor(aminoAcids));
  let seq = 'ATG';
  for (let i = 1; i < n; i += 1) {
    seq += choices[Math.floor(rng() * choices.length)] ?? 'GCT';
  }
  seq += 'TAA';
  return seq;
}
