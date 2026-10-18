import { describe, expect, it } from 'vitest';
import { AMINO_ACIDS } from '../src/lib/codon';
import {
  AMINO_ACID_TABLE,
  CORI_CYCLE,
  GLUCONEOGENESIS,
  GLUCONEOGENESIS_COST,
  GLYCOLYSIS_COMPARE,
  KREBS_STEPS,
  aminoAcidsInGroup,
  krebsTotals,
  lineweaverBurk,
  michaelisMenten,
  pathwayEnergy,
} from '../src/lib/biochem';

describe('amino acids', () => {
  it('lists the twenty coded amino acids, matched to the genetic-code names', () => {
    expect(AMINO_ACID_TABLE).toHaveLength(20);
    const letters = AMINO_ACID_TABLE.map((acid) => acid.letter);
    expect(new Set(letters).size).toBe(20);
    const coded = Object.keys(AMINO_ACIDS).filter((letter) => letter !== '*').sort();
    expect([...letters].sort()).toEqual(coded);
    for (const acid of AMINO_ACID_TABLE) {
      expect(AMINO_ACIDS[acid.letter]?.short).toBe(acid.code);
      expect(AMINO_ACIDS[acid.letter]?.name).toBe(acid.name);
    }
  });

  it('uses the usual side-chain groups', () => {
    expect(aminoAcidsInGroup('nonpolar').map((acid) => acid.letter)).toEqual(['G', 'A', 'V', 'L', 'I', 'M', 'P']);
    expect(aminoAcidsInGroup('aromatic').map((acid) => acid.letter)).toEqual(['F', 'Y', 'W']);
    expect(aminoAcidsInGroup('polar').map((acid) => acid.letter)).toEqual(['S', 'T', 'C', 'N', 'Q']);
    expect(aminoAcidsInGroup('positive').map((acid) => acid.letter)).toEqual(['K', 'R', 'H']);
    expect(aminoAcidsInGroup('negative').map((acid) => acid.letter)).toEqual(['D', 'E']);
  });
});

describe('Michaelis–Menten', () => {
  it('is half of Vmax when substrate equals Km', () => {
    expect(michaelisMenten(10, 100, 10)).toBe(50);
    expect(michaelisMenten(0, 100, 10)).toBe(0);
    expect(michaelisMenten(1_000_000, 100, 10)).toBeCloseTo(100, 2);
  });

  it('rejects a non-positive Km', () => {
    expect(michaelisMenten(10, 100, 0)).toBeNaN();
    expect(michaelisMenten(-1, 100, 10)).toBeNaN();
  });

  it('matches the Lineweaver–Burk intercepts', () => {
    expect(lineweaverBurk(0.1, 100, 10)).toBeCloseTo(0.02, 8);
    expect(lineweaverBurk(0, 100, 10)).toBeCloseTo(1 / 100, 8);
    const km = 10;
    const vmax = 100;
    const atIntercept = lineweaverBurk(1 / km, vmax, km);
    expect(atIntercept).toBeCloseTo(2 / vmax, 8);
  });
});

describe('citric acid cycle', () => {
  it('has eight steps and the textbook yield per acetyl-CoA', () => {
    expect(KREBS_STEPS.map((step) => step.step)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(KREBS_STEPS.map((step) => step.enzyme)).toEqual([
      'Citrate synthase',
      'Aconitase',
      'Isocitrate dehydrogenase',
      'α-Ketoglutarate dehydrogenase',
      'Succinyl-CoA synthetase',
      'Succinate dehydrogenase',
      'Fumarase',
      'Malate dehydrogenase',
    ]);
    expect(krebsTotals()).toEqual({ nadh: 3, fadh2: 1, gtp: 1, co2: 2 });
  });

  it('assigns NADH, FADH2, and GTP to the right enzymes', () => {
    const withNadh = KREBS_STEPS.filter((step) => step.nadh === 1).map((step) => step.id);
    expect(withNadh).toEqual(['idh', 'ogdh', 'mdh']);
    expect(KREBS_STEPS.find((step) => step.fadh2 === 1)?.id).toBe('sdh');
    expect(KREBS_STEPS.find((step) => step.gtp === 1)?.enzyme).toBe('Succinyl-CoA synthetase');
    expect(KREBS_STEPS.filter((step) => step.co2 === 1).map((step) => step.id)).toEqual(['idh', 'ogdh']);
    expect(KREBS_STEPS.find((step) => step.id === 'sdh')?.location).toMatch(/inner mitochondrial membrane/i);
  });
});

describe('gluconeogenesis', () => {
  it('highlights the four bypass enzymes and the energy cost', () => {
    const bypass = GLUCONEOGENESIS.filter((step) => step.bypass).map((step) => step.enzyme);
    expect(bypass).toEqual([
      'Pyruvate carboxylase',
      'Phosphoenolpyruvate carboxykinase',
      'Fructose-1,6-bisphosphatase',
      'Glucose-6-phosphatase',
    ]);
    expect(pathwayEnergy()).toEqual(GLUCONEOGENESIS_COST);
    expect(GLUCONEOGENESIS_COST).toEqual({ atp: 4, gtp: 2, nadh: 2 });
    expect(GLUCONEOGENESIS[0]?.id).toBe('pc');
    expect(GLUCONEOGENESIS.at(-1)?.id).toBe('g6pase');
  });

  it('compares the irreversible glycolytic steps and states the Cori-cycle cost', () => {
    expect(GLYCOLYSIS_COMPARE.filter((row) => row.kind === 'bypass')).toHaveLength(3);
    expect(CORI_CYCLE.liverNtpCost - CORI_CYCLE.muscleAtpGain).toBe(CORI_CYCLE.netNtpCost);
    expect(CORI_CYCLE).toMatchObject({ muscleAtpGain: 2, liverNtpCost: 6, netNtpCost: 4 });
  });
});
