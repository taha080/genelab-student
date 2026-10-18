/**
 * Classroom sequence tools: FASTA, composition, restriction sites,
 * six-frame open reading frames, and a simple global alignment.
 */
import { analyzeFrame, translate, type FrameId } from './codon';
import { baseCounts, cleanDna, gcContent, reverseComplement, type BaseCounts } from './sequence';

export interface FastaRecord {
  header: string;
  sequence: string;
  uToT: number;
  skipped: number;
}

/** Split FASTA text into records. Text without a header becomes one record. */
export function parseFasta(raw: string): FastaRecord[] {
  const lines = raw.split(/\r?\n/);
  const chunks: { header: string; body: string[] }[] = [];
  let current: { header: string; body: string[] } | null = null;
  let sawHeader = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('>')) {
      sawHeader = true;
      current = { header: trimmed.slice(1).trim(), body: [] };
      chunks.push(current);
    } else if (trimmed) {
      if (!current) {
        current = { header: '', body: [] };
        chunks.push(current);
      }
      current.body.push(line);
    }
  }
  if (!sawHeader && chunks.length === 0 && raw.trim()) {
    const cleaned = cleanDna(raw);
    return [{ header: '', sequence: cleaned.seq, uToT: cleaned.uToT, skipped: cleaned.skipped }];
  }
  return chunks.map((chunk) => {
    const cleaned = cleanDna(chunk.body.join('\n'));
    return { header: chunk.header, sequence: cleaned.seq, uToT: cleaned.uToT, skipped: cleaned.skipped };
  });
}

export interface SequenceStats {
  length: number;
  gc: number;
  counts: BaseCounts;
}

export function sequenceStats(raw: string): SequenceStats {
  const seq = cleanDna(raw).seq;
  return { length: seq.length, gc: gcContent(seq), counts: baseCounts(seq) };
}

export type Overhang = "5'" | "3'" | 'blunt';

export interface Enzyme {
  name: string;
  /** Recognition site, 5′→3′, identical to its reverse complement. */
  site: string;
  /** Top-strand cut, counted in bases from the 5′ end of the site. */
  cutAfter: number;
  overhang: Overhang;
}

/** Common classroom enzymes. The caret in textbooks sits after `cutAfter` bases. */
export const ENZYMES: readonly Enzyme[] = [
  { name: 'EcoRI', site: 'GAATTC', cutAfter: 1, overhang: "5'" },
  { name: 'BamHI', site: 'GGATCC', cutAfter: 1, overhang: "5'" },
  { name: 'HindIII', site: 'AAGCTT', cutAfter: 1, overhang: "5'" },
  { name: 'NotI', site: 'GCGGCCGC', cutAfter: 2, overhang: "5'" },
  { name: 'XhoI', site: 'CTCGAG', cutAfter: 1, overhang: "5'" },
  { name: 'SalI', site: 'GTCGAC', cutAfter: 1, overhang: "5'" },
  { name: 'EcoRV', site: 'GATATC', cutAfter: 3, overhang: 'blunt' },
  { name: 'SmaI', site: 'CCCGGG', cutAfter: 3, overhang: 'blunt' },
  { name: 'PstI', site: 'CTGCAG', cutAfter: 5, overhang: "3'" },
  { name: 'KpnI', site: 'GGTACC', cutAfter: 5, overhang: "3'" },
  { name: 'SacI', site: 'GAGCTC', cutAfter: 5, overhang: "3'" },
  { name: 'NdeI', site: 'CATATG', cutAfter: 2, overhang: "5'" },
  { name: 'NcoI', site: 'CCATGG', cutAfter: 1, overhang: "5'" },
  { name: 'XbaI', site: 'TCTAGA', cutAfter: 1, overhang: "5'" },
  { name: 'SpeI', site: 'ACTAGT', cutAfter: 1, overhang: "5'" },
  { name: 'BglII', site: 'AGATCT', cutAfter: 1, overhang: "5'" },
];

export interface RestrictionHit {
  name: string;
  site: string;
  /** 0-based index of the first base of the site on the pasted sequence. */
  start: number;
  cutAfter: number;
  /** 1-based position of the base just before the top-strand cut. */
  cutPosition: number;
  overhang: Overhang;
}

export function findRestrictionSites(raw: string, enzymes: readonly Enzyme[] = ENZYMES): RestrictionHit[] {
  const seq = cleanDna(raw).seq;
  const hits: RestrictionHit[] = [];
  for (const enzyme of enzymes) {
    for (let i = 0; i <= seq.length - enzyme.site.length; i += 1) {
      if (seq.slice(i, i + enzyme.site.length) !== enzyme.site) continue;
      hits.push({
        name: enzyme.name,
        site: enzyme.site,
        start: i,
        cutAfter: enzyme.cutAfter,
        cutPosition: i + enzyme.cutAfter,
        overhang: enzyme.overhang,
      });
    }
  }
  hits.sort((a, b) => a.start - b.start || a.name.localeCompare(b.name));
  return hits;
}

export interface OrfHit {
  frame: FrameId;
  /** 1-based inclusive coordinates on the pasted sequence, left to right. */
  inputStart: number;
  inputEnd: number;
  /** 1-based inclusive coordinates on the translated strand, 5′ to 3′. */
  strandStart: number;
  strandEnd: number;
  /** Amino acids from ATG up to, but not including, the stop. */
  aminoAcids: number;
  /** One-letter protein, including the stop star. */
  protein: string;
}

const FRAMES: FrameId[] = [1, 2, 3, -1, -2, -3];

/**
 * Every ATG-to-stop run in all six frames.
 * `minAminoAcids` counts the starting methionine and ignores the stop.
 */
export function findOrfs(raw: string, minAminoAcids = 1): OrfHit[] {
  const seq = cleanDna(raw).seq;
  const hits: OrfHit[] = [];
  for (const frame of FRAMES) {
    const analysis = analyzeFrame(seq, frame);
    const offset = Math.abs(frame) - 1;
    const complete = analysis.codons.filter((codon) => !codon.incomplete);
    for (let i = 0; i < complete.length; i += 1) {
      if (!complete[i]?.isStart) continue;
      let stop = -1;
      for (let j = i + 1; j < complete.length; j += 1) {
        if (complete[j]?.isStop) {
          stop = j;
          break;
        }
      }
      if (stop < 0) continue;
      const aminoAcids = stop - i;
      if (aminoAcids < minAminoAcids) continue;
      const protein = complete
        .slice(i, stop + 1)
        .map((codon) => codon.aa ?? '')
        .join('');
      const strandStart = offset + i * 3 + 1;
      const strandEnd = offset + (stop + 1) * 3;
      const input = frame > 0 ? { inputStart: strandStart, inputEnd: strandEnd } : reverseSpan(seq.length, strandStart, strandEnd);
      hits.push({
        frame,
        inputStart: input.inputStart,
        inputEnd: input.inputEnd,
        strandStart,
        strandEnd,
        aminoAcids,
        protein,
      });
    }
  }
  hits.sort((a, b) => a.inputStart - b.inputStart || a.frame - b.frame);
  return hits;
}

function reverseSpan(length: number, strandStart: number, strandEnd: number): { inputStart: number; inputEnd: number } {
  return {
    inputStart: length - strandEnd + 1,
    inputEnd: length - strandStart + 1,
  };
}

export interface Alignment {
  alignedA: string;
  alignedB: string;
  score: number;
  matches: number;
  columns: number;
  /** Percent of columns that are matching bases. */
  identity: number;
}

export interface AlignScores {
  match: number;
  mismatch: number;
  gap: number;
}

export const TEACHING_SCORES: AlignScores = { match: 1, mismatch: -1, gap: -1 };
export const ALIGN_LIMIT = 500;

/**
 * Needleman–Wunsch global alignment with a linear gap penalty.
 * Ties prefer a diagonal step, then a gap in B, then a gap in A.
 * This is a classroom alignment, not a database search.
 */
export function alignPair(
  rawA: string,
  rawB: string,
  scores: AlignScores = TEACHING_SCORES,
): Alignment | { error: string } {
  const a = cleanDna(rawA).seq;
  const b = cleanDna(rawB).seq;
  if (!a || !b) return { error: 'Paste two DNA sequences to align.' };
  if (a.length > ALIGN_LIMIT || b.length > ALIGN_LIMIT) {
    return { error: `This teaching alignment stops at ${ALIGN_LIMIT} bases on each sequence.` };
  }
  const n = a.length;
  const m = b.length;
  const f: number[][] = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i += 1) f[i]![0] = i * scores.gap;
  for (let j = 1; j <= m; j += 1) f[0]![j] = j * scores.gap;
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const sub = (f[i - 1]![j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? scores.match : scores.mismatch);
      const up = (f[i - 1]![j] ?? 0) + scores.gap;
      const left = (f[i]![j - 1] ?? 0) + scores.gap;
      f[i]![j] = Math.max(sub, up, left);
    }
  }
  let i = n;
  let j = m;
  let alignedA = '';
  let alignedB = '';
  while (i > 0 || j > 0) {
    const current = f[i]![j] ?? 0;
    if (i > 0 && j > 0) {
      const sub = (f[i - 1]![j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? scores.match : scores.mismatch);
      if (sub === current) {
        alignedA = (a[i - 1] ?? '') + alignedA;
        alignedB = (b[j - 1] ?? '') + alignedB;
        i -= 1;
        j -= 1;
        continue;
      }
    }
    if (i > 0 && (f[i - 1]![j] ?? 0) + scores.gap === current) {
      alignedA = (a[i - 1] ?? '') + alignedA;
      alignedB = `-${alignedB}`;
      i -= 1;
      continue;
    }
    alignedA = `-${alignedA}`;
    alignedB = (b[j - 1] ?? '') + alignedB;
    j -= 1;
  }
  let matches = 0;
  for (let k = 0; k < alignedA.length; k += 1) {
    if (alignedA[k] !== '-' && alignedA[k] === alignedB[k]) matches += 1;
  }
  const columns = alignedA.length;
  return {
    alignedA,
    alignedB,
    score: f[n]![m] ?? 0,
    matches,
    columns,
    identity: columns === 0 ? 0 : (100 * matches) / columns,
  };
}

/** Translate the slice an ORF claims, to check coordinates in tests and the UI. */
export function orfTranslation(seq: string, hit: OrfHit): string {
  const slice = seq.slice(hit.inputStart - 1, hit.inputEnd);
  return hit.frame > 0 ? translate(slice) : translate(reverseComplement(slice));
}
