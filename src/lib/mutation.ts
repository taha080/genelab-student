/**
 * Apply one edit to a coding strand and name the effect on the protein.
 * Translation starts at base 1 of the coding strand (frame +1).
 */
import { analyzeFrame, polypeptideOf, type FrameAnalysis } from './codon';
import { cleanDna } from './sequence';

export type MutationKind = 'substitution' | 'insertion' | 'deletion';

export interface MutationEdit {
  kind: MutationKind;
  /** 1-based. Insertion at `length + 1` appends. Insertion is placed before this base. */
  position: number;
  base?: string;
  inserted?: string;
  count?: number;
}

export type EffectKind =
  | 'unchanged'
  | 'silent'
  | 'missense'
  | 'nonsense'
  | 'stop-loss'
  | 'frameshift'
  | 'in-frame-insertion'
  | 'in-frame-deletion';

export interface MutationResult {
  original: string;
  mutant: string;
  effect: EffectKind;
  summary: string;
  proteinOriginal: string;
  proteinMutant: string;
  polypeptideOriginal: string;
  polypeptideMutant: string;
}

export function applyEdit(raw: string, edit: MutationEdit): { sequence: string } | { error: string } {
  const seq = cleanDna(raw).seq;
  const pos = edit.position;
  if (!Number.isInteger(pos)) return { error: 'Use a whole-number position.' };

  if (edit.kind === 'substitution') {
    if (seq.length === 0) return { error: 'Paste a DNA sequence first.' };
    if (pos < 1 || pos > seq.length) {
      return { error: `Position must be from 1 to ${seq.length}.` };
    }
    const base = (edit.base ?? '').toUpperCase();
    if (base.length !== 1 || !'ACGT'.includes(base)) {
      return { error: 'Choose a new base: A, C, G, or T.' };
    }
    return { sequence: seq.slice(0, pos - 1) + base + seq.slice(pos) };
  }

  if (edit.kind === 'insertion') {
    if (pos < 1 || pos > seq.length + 1) {
      return { error: `Insert at a position from 1 to ${seq.length + 1}.` };
    }
    const inserted = cleanDna(edit.inserted ?? '').seq;
    if (!inserted) return { error: 'Enter the bases to insert, using A, C, G, and T.' };
    return { sequence: seq.slice(0, pos - 1) + inserted + seq.slice(pos - 1) };
  }

  const count = edit.count ?? 0;
  if (seq.length === 0) return { error: 'Paste a DNA sequence first.' };
  if (pos < 1 || pos > seq.length) return { error: `Position must be from 1 to ${seq.length}.` };
  if (!Number.isInteger(count) || count < 1) return { error: 'Delete at least one base.' };
  if (pos - 1 + count > seq.length) return { error: 'That deletion runs past the end of the sequence.' };
  return { sequence: seq.slice(0, pos - 1) + seq.slice(pos - 1 + count) };
}

function codonAt(seq: string, position: number): { index: number; codon: string } | null {
  if (position < 1) return null;
  const index = Math.floor((position - 1) / 3);
  const codon = seq.slice(index * 3, index * 3 + 3);
  if (codon.length < 3) return null;
  return { index, codon };
}

function aaName(frame: FrameAnalysis, codonIndex: number): string {
  const codon = frame.codons[codonIndex];
  if (!codon || codon.incomplete || !codon.name) return 'an incomplete codon';
  if (codon.isStop) return 'a stop';
  return `${codon.name} (${codon.short})`;
}

function firstDiff(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
}

export function interpretEdit(raw: string, edit: MutationEdit): MutationResult | { error: string } {
  const original = cleanDna(raw).seq;
  const applied = applyEdit(original, edit);
  if ('error' in applied) return applied;
  const mutant = applied.sequence;
  const frame0 = analyzeFrame(original, 1);
  const frame1 = analyzeFrame(mutant, 1);
  const proteinOriginal = frame0.protein;
  const proteinMutant = frame1.protein;
  const poly0 = polypeptideOf(proteinOriginal);
  const poly1 = polypeptideOf(proteinMutant);

  const base = {
    original,
    mutant,
    proteinOriginal,
    proteinMutant,
    polypeptideOriginal: poly0,
    polypeptideMutant: poly1,
  };

  if (mutant === original) {
    return {
      ...base,
      effect: 'unchanged',
      summary: 'That edit leaves the DNA sequence the same, so the protein stays the same.',
    };
  }

  const lengthDelta = mutant.length - original.length;
  if (lengthDelta % 3 !== 0) {
    const where =
      edit.kind === 'insertion'
        ? `Inserting ${Math.abs(lengthDelta)} base${Math.abs(lengthDelta) === 1 ? '' : 's'}`
        : `Deleting ${Math.abs(lengthDelta)} base${Math.abs(lengthDelta) === 1 ? '' : 's'}`;
    const downstream = poly0 === poly1;
    return {
      ...base,
      effect: 'frameshift',
      summary: downstream
        ? `${where} changes the reading frame, but the edit sits downstream of a stop. A ribosome would already have stopped, so the translated protein is unchanged.`
        : `${where} changes the reading frame. The length change is not a multiple of three, so codons downstream of the edit are read differently.`,
    };
  }

  if (poly0 !== poly1) {
    if (lengthDelta === 0) {
      const diff = firstDiff(poly0, poly1);
      const before = poly0[diff] ?? '';
      const after = poly1[diff] ?? '';
      const located = codonAt(original, edit.position);
      const from = located ? frame0.codons[located.index] : undefined;
      const to = located ? frame1.codons[located.index] : undefined;
      const place = located ? `Codon ${located.index + 1}` : 'The edited codon';
      if (after === '*' && before !== '*') {
        return {
          ...base,
          effect: 'nonsense',
          summary: `Nonsense. ${place} changed from ${from?.dna ?? '?'} (${aaName(frame0, located?.index ?? -1)}) to ${to?.dna ?? '?'}, a stop. Translation ends there, so the protein is shorter.`,
        };
      }
      if (before === '*' && after !== '*') {
        return {
          ...base,
          effect: 'stop-loss',
          summary: `Stop loss. ${place} changed from a stop (${from?.dna ?? '?'}) to ${to?.dna ?? '?'} (${aaName(frame1, located?.index ?? -1)}). Translation can continue past the old stop.`,
        };
      }
      return {
        ...base,
        effect: 'missense',
        summary: `Missense. ${place} changed from ${from?.dna ?? '?'} (${aaName(frame0, located?.index ?? -1)}) to ${to?.dna ?? '?'} (${aaName(frame1, located?.index ?? -1)}). One amino acid differs, and the reading frame stays the same.`,
      };
    }

    const added = lengthDelta > 0;
    const bases = Math.abs(lengthDelta);
    const earlyStop = poly1.includes('*') && (!poly0.includes('*') || poly1.indexOf('*') < poly0.indexOf('*'));
    const kind = added ? 'in-frame insertion' : 'in-frame deletion';
    return {
      ...base,
      effect: added ? 'in-frame-insertion' : 'in-frame-deletion',
      summary: `${added ? 'In-frame insertion' : 'In-frame deletion'}. ${bases} bases were ${added ? 'inserted' : 'removed'}, a multiple of three, so the reading frame is preserved. ${
        earlyStop
          ? 'The edited protein reaches a stop sooner than before.'
          : `This is ${kind === 'in-frame insertion' ? 'an insertion' : 'a deletion'} of amino acids, not a frameshift.`
      }`,
    };
  }

  // Polypeptide (through the first stop) is unchanged.
  if (lengthDelta === 0) {
    const completeBases = Math.floor(original.length / 3) * 3;
    if (edit.kind === 'substitution' && edit.position > completeBases) {
      return {
        ...base,
        effect: 'unchanged',
        summary:
          'That base sits in an incomplete codon at the end of the sequence, so the translated protein does not change.',
      };
    }
    if (proteinOriginal === proteinMutant) {
      const located = codonAt(original, edit.position);
      const from = located?.codon ?? '';
      const to = located ? mutant.slice(located.index * 3, located.index * 3 + 3) : '';
      const name = located ? aaName(frame0, located.index) : 'the same amino acid';
      const bothStops = from.length === 3 && (frame0.codons[located?.index ?? -1]?.isStop ?? false);
      return {
        ...base,
        effect: 'silent',
        summary: bothStops
          ? `Silent. Codon ${(located?.index ?? 0) + 1} changed from ${from} to ${to}. Both are stop codons, so the protein still ends in the same place.`
          : `Silent. Codon ${(located?.index ?? 0) + 1} changed from ${from} to ${to}. Both encode ${name}, so the amino acid sequence stays the same.`,
      };
    }
    return {
      ...base,
      effect: 'unchanged',
      summary:
        'The changed codon is downstream of a stop, so the protein a ribosome would make is unchanged.',
    };
  }

  const added = lengthDelta > 0;
  return {
    ...base,
    effect: added ? 'in-frame-insertion' : 'in-frame-deletion',
    summary: `${added ? 'In-frame insertion' : 'In-frame deletion'} downstream of a stop. The reading frame of the DNA changes by a whole number of codons, but translation would already have stopped, so the protein is unchanged.`,
  };
}
