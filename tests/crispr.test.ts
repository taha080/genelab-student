import { describe, expect, it } from 'vitest';
import { findGuides, guideFlags } from '../src/lib/crispr';
import { CLASSROOM_GENE, PAM_MINUS, PAM_PLUS } from '../src/lib/samples';
import { reverseComplement } from '../src/lib/sequence';

function expectGuideInvariant(seq: string) {
  const guides = findGuides(seq);
  for (const guide of guides) {
    expect(guide.guide).toHaveLength(20);
    expect(guide.pam).toMatch(/^[ACGT]GG$/);
    const window = seq.slice(guide.start, guide.start + 20);
    if (guide.strand === '+') {
      expect(window).toBe(guide.guide);
      expect(seq.slice(guide.start + 20, guide.start + 23)).toBe(guide.pam);
    } else {
      expect(reverseComplement(window)).toBe(guide.guide);
      expect(reverseComplement(seq.slice(guide.start - 3, guide.start))).toBe(guide.pam);
    }
  }
  return guides;
}

describe('SpCas9 PAM search', () => {
  it('finds a single NGG on the + strand', () => {
    const guides = expectGuideInvariant(PAM_PLUS);
    expect(guides).toHaveLength(1);
    expect(guides[0]).toMatchObject({
      strand: '+',
      start: 0,
      guide: 'ATCGATCGATCGATCGATCG',
      pam: 'AGG',
    });
    expect(guides[0]?.gc).toBe(50);
  });

  it('finds the same site when the PAM is on the − strand', () => {
    const guides = expectGuideInvariant(PAM_MINUS);
    expect(guides).toHaveLength(1);
    expect(guides[0]).toMatchObject({
      strand: '-',
      start: 3,
      guide: 'ATCGATCGATCGATCGATCG',
      pam: 'AGG',
    });
  });

  it('finds nothing when the sequence is too short or has no NGG', () => {
    expect(findGuides('A'.repeat(22))).toEqual([]);
    expect(findGuides('ACGT'.repeat(10))).toEqual([]);
    expect(findGuides('AAAGG')).toEqual([]);
  });

  it('lists both strands of the classroom gene, including a poly-T guide', () => {
    const guides = expectGuideInvariant(CLASSROOM_GENE);
    expect(guides.map((guide) => [guide.strand, guide.start + 1, guide.guide, guide.pam])).toEqual([
      ['+', 3, 'GAAAGGATGCAAACCGGAGC', 'TGG'],
      ['+', 13, 'AAACCGGAGCTGGTTCGCGC', 'AGG'],
      ['-', 19, 'GAACCTGCGCGAACCAGCTC', 'CGG'],
      ['+', 38, 'CTACTAACCAACACTTTTTA', 'TGG'],
    ]);
    const polyT = guides[3];
    expect(polyT?.flags.some((flag) => flag.level === 'poor' && flag.text.includes('TTTTT'))).toBe(true);
    expect(polyT?.gc).toBe(30);
  });

  it('flags extreme GC and a guanine run', () => {
    const poor = guideFlags('GGGGAAAAAAAAAAAAAAAT');
    expect(poor.some((flag) => flag.level === 'poor')).toBe(true);
    expect(poor.some((flag) => flag.text.includes('GGGG'))).toBe(true);
    const calm = guideFlags('ATCGATCGATCGATCGATCG');
    expect(calm.every((flag) => flag.level === 'good')).toBe(true);
  });
});
