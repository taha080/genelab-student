/** DNA string cleaning and base-pair geometry. */

export interface CleanDna {
  /** Uppercase A/C/G/T. Uracil is converted to thymine. */
  seq: string;
  /** Uracils that were read as thymine. */
  uToT: number;
  /** Characters that were not bases, whitespace, digits, or FASTA headers. */
  skipped: number;
}

const COMPLEMENT: Record<string, string> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
};

/**
 * Keep A, C, G, T, and U. Drop FASTA title lines, whitespace, and digits.
 * U is stored as T so the rest of the bench can treat the string as DNA.
 */
export function cleanDna(raw: string): CleanDna {
  const lines = raw.split(/\r?\n/).filter((line) => !line.trim().startsWith('>'));
  let seq = '';
  let uToT = 0;
  let skipped = 0;
  for (const ch of lines.join('')) {
    const upper = ch.toUpperCase();
    if (upper === 'U') {
      seq += 'T';
      uToT += 1;
    } else if (upper === 'A' || upper === 'C' || upper === 'G' || upper === 'T') {
      seq += upper;
    } else if (/\s/.test(ch) || /\d/.test(ch)) {
      continue;
    } else {
      skipped += 1;
    }
  }
  return { seq, uToT, skipped };
}

export interface BaseCounts {
  A: number;
  C: number;
  G: number;
  T: number;
  length: number;
}

export function baseCounts(seq: string): BaseCounts {
  const counts: BaseCounts = { A: 0, C: 0, G: 0, T: 0, length: seq.length };
  for (const base of seq) {
    if (base === 'A' || base === 'C' || base === 'G' || base === 'T') counts[base] += 1;
  }
  return counts;
}

/** Percent of bases that are G or C. Empty input is 0. */
export function gcContent(seq: string): number {
  if (seq.length === 0) return 0;
  const counts = baseCounts(seq);
  return (100 * (counts.G + counts.C)) / seq.length;
}

/**
 * Base-paired strand in the same left-to-right order.
 * If `seq` is written 5′→3′, the result is the other strand written 3′→5′.
 */
export function complement(seq: string): string {
  let out = '';
  for (const base of seq) out += COMPLEMENT[base] ?? 'N';
  return out;
}

/** Other strand written 5′→3′. Applying this twice returns the original. */
export function reverseComplement(seq: string): string {
  const paired = complement(seq);
  let out = '';
  for (let i = paired.length - 1; i >= 0; i -= 1) out += paired[i];
  return out;
}

/** Coding DNA to mRNA: thymine becomes uracil. Direction stays 5′→3′. */
export function dnaToRna(seq: string): string {
  return seq.replaceAll('T', 'U');
}

export function randomDna(length: number, rng: () => number = Math.random): string {
  const bases = 'ACGT';
  const n = Math.max(0, Math.floor(length));
  let out = '';
  for (let i = 0; i < n; i += 1) out += bases[Math.floor(rng() * 4)];
  return out;
}
