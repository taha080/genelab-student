import { describe, expect, it } from 'vitest';
import { interpretEdit } from '../src/lib/mutation';
import { SHORT_ORF } from '../src/lib/samples';

describe('mutation effects', () => {
  it('names a silent substitution', () => {
    const result = interpretEdit(SHORT_ORF, { kind: 'substitution', position: 6, base: 'C' });
    expect(result).toMatchObject({
      effect: 'silent',
      polypeptideOriginal: 'MFGCKPE*',
      polypeptideMutant: 'MFGCKPE*',
    });
    if ('summary' in result) expect(result.summary.startsWith('Silent.')).toBe(true);
  });

  it('names a missense substitution', () => {
    const result = interpretEdit(SHORT_ORF, { kind: 'substitution', position: 4, base: 'A' });
    expect(result).toMatchObject({ effect: 'missense', polypeptideMutant: 'MIGCKPE*' });
    if ('summary' in result) expect(result.summary).toContain('phenylalanine');
  });

  it('names a nonsense substitution', () => {
    const result = interpretEdit(SHORT_ORF, { kind: 'substitution', position: 12, base: 'A' });
    expect(result).toMatchObject({ effect: 'nonsense', polypeptideMutant: 'MFG*' });
  });

  it('names a stop-to-stop change as silent and a stop loss separately', () => {
    const synonymousStop = interpretEdit(SHORT_ORF, { kind: 'substitution', position: 23, base: 'G' });
    expect(synonymousStop).toMatchObject({ effect: 'silent', polypeptideMutant: 'MFGCKPE*' });
    const loss = interpretEdit(SHORT_ORF, { kind: 'substitution', position: 22, base: 'C' });
    expect(loss).toMatchObject({ effect: 'stop-loss', polypeptideMutant: 'MFGCKPEQ' });
  });

  it('names a frameshift and an in-frame indel', () => {
    const shift = interpretEdit(SHORT_ORF, { kind: 'insertion', position: 4, inserted: 'A' });
    expect(shift).toMatchObject({ effect: 'frameshift' });
    if ('summary' in shift) expect(shift.summary.startsWith('Inserting 1 base')).toBe(true);

    const deletion = interpretEdit(SHORT_ORF, { kind: 'deletion', position: 4, count: 3 });
    expect(deletion).toMatchObject({ effect: 'in-frame-deletion', polypeptideMutant: 'MGCKPE*' });

    const insertion = interpretEdit(SHORT_ORF, { kind: 'insertion', position: 4, inserted: 'GCG' });
    expect(insertion).toMatchObject({ effect: 'in-frame-insertion', polypeptideMutant: 'MAFGCKPE*' });
  });

  it('keeps a frameshift that lands after a stop from changing the protein', () => {
    const result = interpretEdit('ATGTAAATTT', { kind: 'deletion', position: 8, count: 1 });
    expect(result).toMatchObject({
      effect: 'frameshift',
      polypeptideOriginal: 'M*',
      polypeptideMutant: 'M*',
    });
    if ('summary' in result) expect(result.summary).toContain('downstream of a stop');
  });

  it('ignores an edit in a leftover incomplete codon', () => {
    const result = interpretEdit('ATGTTTGGCT', { kind: 'substitution', position: 10, base: 'A' });
    expect(result).toMatchObject({ effect: 'unchanged', polypeptideOriginal: 'MFG', polypeptideMutant: 'MFG' });
    if ('summary' in result) expect(result.summary).toContain('incomplete codon');
  });

  it('rejects edits that do not fit the sequence', () => {
    expect(interpretEdit(SHORT_ORF, { kind: 'substitution', position: 99, base: 'A' })).toEqual({
      error: 'Position must be from 1 to 24.',
    });
    expect(interpretEdit(SHORT_ORF, { kind: 'deletion', position: 22, count: 5 })).toEqual({
      error: 'That deletion runs past the end of the sequence.',
    });
    expect(interpretEdit(SHORT_ORF, { kind: 'substitution', position: 4, base: 'T' })).toMatchObject({
      effect: 'unchanged',
    });
  });
});
