/**
 * PCR primer estimates for class.
 *
 * Wallace rule (Wallace et al. 1979), a base-count estimate for short oligos:
 *   Tm = 2(A+T) + 4(G+C)
 *
 * Nearest neighbor: SantaLucia, Proc. Natl. Acad. Sci. USA 95:1460 (1998),
 * Table 2 unified parameters in 1 M NaCl.
 *   ΔS([Na+]) = ΔS(1 M) + 0.368 × (N − 1) × ln([Na+])
 *   N is the number of phosphates in one strand (length − 1, no terminal phosphate).
 *   Tm = ΔH × 1000 / (ΔS + R ln(C_T / x)) − 273.15
 *   x is 4 for non-self-complementary duplexes and 1 for self-complementary ones.
 *   R = 1.987 cal/(K·mol). ΔH is converted from kcal/mol to cal/mol.
 * Magnesium is not in this correction.
 */
import { cleanDna, gcContent, reverseComplement } from './sequence';
import type { FlagLevel } from './crispr';

/** ΔH kcal/mol, ΔS cal/(K·mol), keyed by the 5′→3′ dinucleotide. */
const NN: Record<string, readonly [number, number]> = {
  AA: [-7.9, -22.2],
  TT: [-7.9, -22.2],
  AT: [-7.2, -20.4],
  TA: [-7.2, -21.3],
  CA: [-8.5, -22.7],
  TG: [-8.5, -22.7],
  GT: [-8.4, -22.4],
  AC: [-8.4, -22.4],
  CT: [-7.8, -21.0],
  AG: [-7.8, -21.0],
  GA: [-8.2, -22.2],
  TC: [-8.2, -22.2],
  CG: [-10.6, -27.2],
  GC: [-9.8, -24.4],
  GG: [-8.0, -19.9],
  CC: [-8.0, -19.9],
};

const INIT_GC: readonly [number, number] = [0.1, -2.8];
const INIT_AT: readonly [number, number] = [2.3, 4.1];
const SALT_ENTROPY = 0.368;
const GAS_R = 1.987;

export interface MeltConditions {
  /** Monovalent sodium concentration in mol/L. */
  naMolar?: number;
  /** Total strand concentration of this oligo in mol/L. */
  oligoMolar?: number;
}

export const DEFAULT_MELT: Required<MeltConditions> = {
  naMolar: 0.05,
  oligoMolar: 250e-9,
};

export interface PrimerNote {
  level: FlagLevel;
  text: string;
}

export interface Hairpin {
  stem: number;
  loop: number;
}

export interface PrimerReport {
  sequence: string;
  length: number;
  gc: number;
  wallace: number;
  nearestNeighbor: number;
  selfComplementary: boolean;
  /** G or C bases among the last five (or fewer, if the primer is shorter). */
  gcClamp: number;
  hairpin: Hairpin | null;
  selfDimer: { longest: number; threePrime: number };
  notes: PrimerNote[];
}

export interface PairReport {
  tmDifference: number;
  cross: { longest: number; forwardThreePrime: number; reverseThreePrime: number };
  notes: PrimerNote[];
}

export function wallaceTm(seq: string): number {
  let at = 0;
  let gc = 0;
  for (const base of seq) {
    if (base === 'A' || base === 'T') at += 1;
    else if (base === 'G' || base === 'C') gc += 1;
  }
  return 2 * at + 4 * gc;
}

export function isSelfComplementary(seq: string): boolean {
  return seq.length > 0 && seq === reverseComplement(seq);
}

/** Nearest-neighbor Tm in °C. Sequences shorter than 2 return NaN. */
export function nearestNeighborTm(seq: string, conditions: MeltConditions = {}): number {
  if (seq.length < 2) return Number.NaN;
  const na = conditions.naMolar ?? DEFAULT_MELT.naMolar;
  const oligo = conditions.oligoMolar ?? DEFAULT_MELT.oligoMolar;
  if (!(na > 0) || !(oligo > 0)) return Number.NaN;

  let dH = 0;
  let dS = 0;
  for (let i = 0; i < seq.length - 1; i += 1) {
    const step = NN[seq.slice(i, i + 2)];
    if (!step) return Number.NaN;
    dH += step[0];
    dS += step[1];
  }
  for (const end of [seq[0], seq[seq.length - 1]]) {
    const init = end === 'A' || end === 'T' ? INIT_AT : INIT_GC;
    dH += init[0];
    dS += init[1];
  }
  const selfComplementary = isSelfComplementary(seq);
  if (selfComplementary) dS += -1.4;
  dS += SALT_ENTROPY * (seq.length - 1) * Math.log(na);
  const symmetry = selfComplementary ? 1 : 4;
  return (dH * 1000) / (dS + GAS_R * Math.log(oligo / symmetry)) - 273.15;
}

function pairs(a: string, b: string): boolean {
  return (
    (a === 'A' && b === 'T') ||
    (a === 'T' && b === 'A') ||
    (a === 'G' && b === 'C') ||
    (a === 'C' && b === 'G')
  );
}

/** Longest stem of at least 4 with a loop of 3–10. Watson–Crick pairs only. */
export function findHairpin(seq: string): Hairpin | null {
  let best: Hairpin | null = null;
  for (let loopStart = 1; loopStart < seq.length; loopStart += 1) {
    for (let loop = 3; loop <= 10; loop += 1) {
      const right = loopStart + loop;
      if (right >= seq.length) break;
      let stem = 0;
      while (
        loopStart - 1 - stem >= 0 &&
        right + stem < seq.length &&
        pairs(seq[loopStart - 1 - stem] ?? '', seq[right + stem] ?? '')
      ) {
        stem += 1;
      }
      if (stem >= 4 && (!best || stem > best.stem)) best = { stem, loop };
    }
  }
  return best;
}

/** Consecutive Watson–Crick run that includes the 3′ base of `seq`, against `other`. */
export function threePrimeRun(seq: string, other: string): number {
  if (!seq || !other) return 0;
  const rc = reverseComplement(other);
  let best = 0;
  const last = seq.length - 1;
  for (let j = 0; j < rc.length; j += 1) {
    let run = 0;
    while (last - run >= 0 && j - run >= 0 && seq[last - run] === rc[j - run]) run += 1;
    if (run > best) best = run;
  }
  return best;
}

export function longestComplementRun(seq: string, other: string): number {
  if (!seq || !other) return 0;
  const rc = reverseComplement(other);
  let best = 0;
  for (let offset = 1 - rc.length; offset < seq.length; offset += 1) {
    let run = 0;
    for (let i = 0; i < seq.length; i += 1) {
      const j = i - offset;
      if (j >= 0 && j < rc.length && seq[i] === rc[j]) {
        run += 1;
        if (run > best) best = run;
      } else {
        run = 0;
      }
    }
  }
  return best;
}

function gcClamp(seq: string): number {
  const tail = seq.slice(-Math.min(5, seq.length));
  let n = 0;
  for (const base of tail) if (base === 'G' || base === 'C') n += 1;
  return n;
}

function homopolymer(seq: string): string | null {
  return seq.match(/A{4,}|C{4,}|G{4,}|T{4,}/)?.[0] ?? null;
}

export function analyzePrimer(raw: string, conditions: MeltConditions = {}): PrimerReport {
  const sequence = cleanDna(raw).seq;
  const notes: PrimerNote[] = [];
  const hairpin = findHairpin(sequence);
  const dimer = {
    longest: longestComplementRun(sequence, sequence),
    threePrime: threePrimeRun(sequence, sequence),
  };
  const clamp = gcClamp(sequence);
  const gc = gcContent(sequence);

  if (sequence.length > 0 && sequence.length < 18) {
    notes.push({
      level: 'caution',
      text: `This primer is ${sequence.length} bases long. Primers for PCR are often 18–25 bases.`,
    });
  } else if (sequence.length > 30) {
    notes.push({
      level: 'caution',
      text: `This primer is ${sequence.length} bases long. Primers longer than about 30 bases are less usual for standard PCR.`,
    });
  }

  if (sequence.length >= 8 && (gc < 40 || gc > 60)) {
    const strong = gc < 25 || gc > 75;
    notes.push({
      level: strong ? 'poor' : 'caution',
      text: `GC content is ${gc.toFixed(0)}%. A common classroom window for primers is 40–60%.`,
    });
  }

  const run = homopolymer(sequence);
  if (run) {
    notes.push({
      level: 'caution',
      text: `Contains ${run}. A run of four or more of the same base can be hard to synthesize and can mis-prime.`,
    });
  }

  if (sequence.length >= 5 && clamp === 0) {
    notes.push({
      level: 'caution',
      text: 'The last five bases have no G or C. One G or C at the 3′ end, a small GC clamp, is a common choice.',
    });
  } else if (sequence.length >= 5 && clamp >= 4) {
    notes.push({
      level: 'caution',
      text: `${clamp} of the last five bases are G or C. A very strong 3′ end can bind in the wrong place.`,
    });
  }

  if (hairpin) {
    notes.push({
      level: hairpin.stem >= 6 ? 'poor' : 'caution',
      text: `A stem of ${hairpin.stem} base pairs with a loop of ${hairpin.loop} could fold into a hairpin.`,
    });
  }

  if (dimer.threePrime >= 4) {
    notes.push({
      level: 'poor',
      text: `The 3′ end has ${dimer.threePrime} bases that can pair inside this primer. That favors a primer-dimer.`,
    });
  } else if (dimer.longest >= 8) {
    notes.push({
      level: 'caution',
      text: `A stretch of ${dimer.longest} bases can pair with another copy of this primer.`,
    });
  }

  if (isSelfComplementary(sequence)) {
    notes.push({
      level: 'caution',
      text: 'This sequence is its own reverse complement, so the nearest-neighbor Tm treats it as a self-complementary duplex.',
    });
  }

  return {
    sequence,
    length: sequence.length,
    gc,
    wallace: wallaceTm(sequence),
    nearestNeighbor: nearestNeighborTm(sequence, conditions),
    selfComplementary: isSelfComplementary(sequence),
    gcClamp: clamp,
    hairpin,
    selfDimer: dimer,
    notes,
  };
}

export function analyzePair(forwardRaw: string, reverseRaw: string, conditions: MeltConditions = {}): PairReport {
  const forward = cleanDna(forwardRaw).seq;
  const reverse = cleanDna(reverseRaw).seq;
  const notes: PrimerNote[] = [];
  const forwardTm = nearestNeighborTm(forward, conditions);
  const reverseTm = nearestNeighborTm(reverse, conditions);
  const tmDifference =
    Number.isFinite(forwardTm) && Number.isFinite(reverseTm) ? Math.abs(forwardTm - reverseTm) : Number.NaN;
  const cross = {
    longest: longestComplementRun(forward, reverse),
    forwardThreePrime: threePrimeRun(forward, reverse),
    reverseThreePrime: threePrimeRun(reverse, forward),
  };

  if (Number.isFinite(tmDifference) && tmDifference > 5) {
    notes.push({
      level: 'caution',
      text: `The nearest-neighbor melting temperatures differ by ${tmDifference.toFixed(1)}°C. Pairs are usually kept within about 5°C.`,
    });
  }

  const three = Math.max(cross.forwardThreePrime, cross.reverseThreePrime);
  if (three >= 4) {
    notes.push({
      level: 'poor',
      text: `The 3′ ends share ${three} complementary bases. The two primers may bind each other instead of the template.`,
    });
  } else if (cross.longest >= 8) {
    notes.push({
      level: 'caution',
      text: `A stretch of ${cross.longest} bases is complementary between the two primers.`,
    });
  }

  return { tmDifference, cross, notes };
}
