import { describe, expect, it } from 'vitest';
import { analyzePair, analyzePrimer, findHairpin, nearestNeighborTm, threePrimeRun, wallaceTm } from '../src/lib/primer';
import { HAIRPIN_PRIMER, MATCHED_FORWARD, MATCHED_REVERSE, UNEVEN_FORWARD, UNEVEN_REVERSE } from '../src/lib/samples';

describe('melting temperature', () => {
  it('uses the Wallace base-count rule', () => {
    expect(wallaceTm('ATGC')).toBe(12);
    expect(wallaceTm('CGTTGA')).toBe(18);
    expect(wallaceTm('')).toBe(0);
  });

  it('matches the SantaLucia 1998 nearest-neighbor equation', () => {
    // CGTTGA, 1 M Na+, 100 µM oligo, non-self-complementary: hand-checked.
    expect(nearestNeighborTm('CGTTGA', { naMolar: 1, oligoMolar: 1e-4 })).toBeCloseTo(28.7799, 3);
    // Same oligo at a typical PCR setting: 50 mM Na+, 250 nM oligo.
    expect(nearestNeighborTm('CGTTGA', { naMolar: 0.05, oligoMolar: 250e-9 })).toBeCloseTo(-5.3962, 3);
    expect(nearestNeighborTm('ATGTTTGGCTGCAAACCG')).toBeCloseTo(53.7004, 3);
    // EcoRI site GAATTC is its own reverse complement, so symmetry and C_T (not C_T/4) apply.
    const ecori = nearestNeighborTm('GAATTC', { naMolar: 1, oligoMolar: 1e-4 });
    expect(ecori).toBeCloseTo(18.2978, 3);
    expect(analyzePrimer('GAATTC', { naMolar: 1, oligoMolar: 1e-4 }).selfComplementary).toBe(true);
  });
});

describe('primer structure checks', () => {
  it('finds a designed hairpin', () => {
    expect(findHairpin(HAIRPIN_PRIMER)).toEqual({ stem: 5, loop: 4 });
    const report = analyzePrimer(HAIRPIN_PRIMER);
    expect(report.notes.some((note) => note.text.includes('hairpin'))).toBe(true);
    expect(report.length).toBe(14);
  });

  it('flags a 3′ self-match and a clean 3′ end', () => {
    expect(threePrimeRun('GCATAAAAATGC', 'GCATAAAAATGC')).toBeGreaterThanOrEqual(4);
    expect(analyzePrimer('GCATAAAAATGC').selfDimer.threePrime).toBeGreaterThanOrEqual(4);
    expect(threePrimeRun(MATCHED_FORWARD, MATCHED_FORWARD)).toBeLessThan(4);
  });

  it('compares a matched pair and an uneven pair', () => {
    const matched = analyzePair(MATCHED_FORWARD, MATCHED_REVERSE);
    expect(matched.tmDifference).toBeLessThan(5);
    expect(matched.notes.some((note) => note.text.includes('differ'))).toBe(false);

    const uneven = analyzePair(UNEVEN_FORWARD, UNEVEN_REVERSE);
    expect(uneven.tmDifference).toBeGreaterThan(5);
    expect(uneven.notes.some((note) => note.level === 'caution')).toBe(true);

    const dimer = analyzePair('AAAAAAAAATGC', 'AAAAAAAAGCAT');
    expect(Math.max(dimer.cross.forwardThreePrime, dimer.cross.reverseThreePrime)).toBeGreaterThanOrEqual(4);
    expect(dimer.notes.some((note) => note.level === 'poor')).toBe(true);
  });
});
