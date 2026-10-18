import { describe, expect, it } from 'vitest';
import { CLASSROOM_GENE, RESTRICTION_DEMO, SHORT_ORF } from '../src/lib/samples';
import { reverseComplement } from '../src/lib/sequence';
import {
  ALIGN_LIMIT,
  alignPair,
  ENZYMES,
  findOrfs,
  findRestrictionSites,
  orfTranslation,
  parseFasta,
  sequenceStats,
} from '../src/lib/seqtools';

describe('FASTA and composition', () => {
  it('parses headers and a headerless paste', () => {
    const records = parseFasta('>one demo\nATGC\nAT uu 1\n>two\nGG\n');
    expect(records).toEqual([
      { header: 'one demo', sequence: 'ATGCATTT', uToT: 2, skipped: 0 },
      { header: 'two', sequence: 'GG', uToT: 0, skipped: 0 },
    ]);
    expect(parseFasta('atg c\n')).toEqual([{ header: '', sequence: 'ATGC', uToT: 0, skipped: 0 }]);
  });

  it('counts length, GC, and bases', () => {
    expect(sequenceStats('ACGT')).toEqual({
      length: 4,
      gc: 50,
      counts: { A: 1, C: 1, G: 1, T: 1, length: 4 },
    });
    expect(sequenceStats('')).toMatchObject({ length: 0, gc: 0 });
  });
});

describe('restriction sites', () => {
  it('uses palindromic sites and the textbook cut', () => {
    for (const enzyme of ENZYMES) {
      expect(reverseComplement(enzyme.site)).toBe(enzyme.site);
      expect(enzyme.cutAfter).toBeGreaterThan(0);
      expect(enzyme.cutAfter).toBeLessThan(enzyme.site.length);
    }
    const alone = findRestrictionSites('GAATTC');
    expect(alone.find((hit) => hit.name === 'EcoRI')).toMatchObject({
      start: 0,
      cutPosition: 1,
      overhang: "5'",
    });
    expect(findRestrictionSites('AAAAAA').filter((hit) => hit.site !== 'AAAAAA')).toEqual([]);
  });

  it('finds the sites in the classroom demo', () => {
    const hits = findRestrictionSites(RESTRICTION_DEMO);
    expect(hits.find((hit) => hit.name === 'EcoRI')).toMatchObject({ start: 1, site: 'GAATTC' });
    expect(hits.find((hit) => hit.name === 'BamHI')).toMatchObject({ start: 8, site: 'GGATCC' });
    expect(hits.find((hit) => hit.name === 'HindIII')).toMatchObject({ start: 16, site: 'AAGCTT' });
    expect(hits.find((hit) => hit.name === 'XhoI')).toMatchObject({ start: 22, site: 'CTCGAG' });
    expect(hits.find((hit) => hit.name === 'NotI')).toMatchObject({ start: 28, site: 'GCGGCCGC', cutPosition: 30 });
  });
});

describe('open reading frames', () => {
  it('finds the classroom and short ORFs on the +1 frame', () => {
    const short = findOrfs(SHORT_ORF).find((hit) => hit.frame === 1);
    expect(short).toMatchObject({ inputStart: 1, inputEnd: 24, aminoAcids: 7, protein: 'MFGCKPE*' });
    const classroom = findOrfs(CLASSROOM_GENE).find((hit) => hit.frame === 1 && hit.aminoAcids === 21);
    expect(classroom?.protein).toBe('MKGCKPELVRAGSTNQHFLWY*');
  });

  it('maps a reverse-strand ORF back onto the pasted sequence', () => {
    const seq = 'TTACAT';
    const hits = findOrfs(seq);
    const reverse = hits.find((hit) => hit.frame === -1);
    expect(reverse).toMatchObject({ protein: 'M*', inputStart: 1, inputEnd: 6, aminoAcids: 1 });
    expect(orfTranslation(seq, reverse!)).toBe('M*');
  });

  it('keeps every ATG that reaches a stop, in every frame', () => {
    const seq = 'ATGAAAATGTAA';
    const frame1 = findOrfs(seq).filter((hit) => hit.frame === 1);
    expect(frame1.map((hit) => hit.protein)).toEqual(['MKM*', 'M*']);
    const shifted = findOrfs(`A${seq}`).find((hit) => hit.frame === 2 && hit.protein === 'MKM*');
    expect(shifted).toMatchObject({ inputStart: 2, inputEnd: 13 });
    for (const hit of findOrfs(CLASSROOM_GENE)) {
      expect(orfTranslation(CLASSROOM_GENE, hit)).toBe(hit.protein);
    }
    expect(findOrfs('ATGAAAAAA')).toEqual([]);
    expect(findOrfs(seq, 3).map((hit) => hit.protein)).toEqual(['MKM*']);
  });
});

describe('pairwise alignment', () => {
  it('aligns identical sequences and a one-base gap', () => {
    expect(alignPair('ACGT', 'ACGT')).toMatchObject({
      alignedA: 'ACGT',
      alignedB: 'ACGT',
      score: 4,
      matches: 4,
      identity: 100,
    });
    expect(alignPair('ACGT', 'AGT')).toMatchObject({
      alignedA: 'ACGT',
      alignedB: 'A-GT',
      score: 2,
      matches: 3,
      columns: 4,
      identity: 75,
    });
    expect(alignPair('AAAA', 'TTTT')).toMatchObject({ score: -4, matches: 0, identity: 0 });
  });

  it('refuses an empty or oversized sequence', () => {
    expect(alignPair('', 'ACGT')).toEqual({ error: 'Paste two DNA sequences to align.' });
    expect(alignPair('A'.repeat(ALIGN_LIMIT + 1), 'AA')).toMatchObject({ error: expect.stringContaining('500') });
  });
});
