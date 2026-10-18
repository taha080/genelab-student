import { describe, expect, it } from 'vitest';
import { KREBS_STEPS } from '../src/lib/biochem';
import { MOTION, MOTION_IDS } from '../src/lib/motion';

function scriptText(id: (typeof MOTION_IDS)[number]): string {
  const scene = MOTION[id];
  return [scene.title, scene.summary, ...scene.stages.flatMap((stage) => [stage.title, stage.detail, stage.badge ?? ''])].join('\n');
}

describe('lesson animations', () => {
  it('has a labeled script for each showpiece', () => {
    expect(MOTION_IDS).toEqual(['replication', 'ribosome', 'synthase', 'etc', 'glycolysis', 'glycogen', 'krebs']);
    for (const id of MOTION_IDS) {
      const scene = MOTION[id];
      expect(scene.stages.length).toBeGreaterThanOrEqual(4);
      expect(scene.summary.length).toBeGreaterThan(40);
      const titles = new Set<string>();
      for (const stage of scene.stages) {
        expect(titles.has(stage.title), stage.title).toBe(false);
        titles.add(stage.title);
        expect(stage.detail.length).toBeGreaterThan(20);
      }
    }
  });

  it('keeps the replication fork and the ribosome accurate', () => {
    const fork = scriptText('replication');
    expect(fork).toContain('10.5');
    expect(fork).toContain('2 hydrogen bonds');
    expect(fork).toContain('3 hydrogen bonds');
    expect(fork).toContain('antiparallel');
    expect(fork).toContain('Helicase');
    expect(fork).toContain('5′ to 3′');
    expect(fork).toContain('Okazaki');
    expect(fork).toContain('RNA primer');

    const ribosome = scriptText('ribosome');
    expect(ribosome).toContain('P site');
    expect(ribosome).toContain('A site');
    expect(ribosome).toContain('E site');
    expect(ribosome).toContain('5′-AUG-3′');
    expect(ribosome).toContain('3′-UAC-5′');
    expect(ribosome).toContain('antiparallel');
    expect(ribosome).toContain('3′-AAA-5′');
    expect(ribosome).toContain('3′-CCG-5′');
    expect(ribosome).toContain('3′-ACG-5′');
    expect(ribosome).toContain('peptide bond');
    expect(ribosome).toContain('Met–Phe–Gly–Cys');
  });

  it('matches the textbook counts for ATP synthase, the chain, glycolysis, glycogen, and the cycle', () => {
    const synthase = scriptText('synthase');
    expect(synthase).toContain('F₀');
    expect(synthase).toContain('F₁');
    expect(synthase).toContain('intermembrane space');
    expect(synthase).toContain('matrix');
    expect(synthase).toContain('loose, tight, and open');
    expect(synthase).toContain('ATP');

    const chain = scriptText('etc');
    expect(chain).toContain('Complex I');
    expect(chain).toContain('4 H⁺');
    expect(chain).toContain('Complex III');
    expect(chain).toContain('Complex IV');
    expect(chain).toContain('2 H⁺');
    expect(chain).toContain('O₂');
    expect(chain).toContain('Complex II');
    expect(chain).toContain('about 6 H⁺');
    expect(chain).toContain('about 10 H⁺');

    const glycolysis = scriptText('glycolysis');
    expect(glycolysis).toContain('Hexokinase');
    expect(glycolysis).toContain('PFK-1');
    expect(glycolysis).toContain('pyruvate kinase');
    expect(glycolysis).toContain('irreversible');
    expect(glycolysis).toContain('2 NADH');
    expect(glycolysis).toContain('−2 ATP');
    expect(glycolysis).toContain('cytosol');
    expect(glycolysis).toContain('2 pyruvate');

    const glycogen = scriptText('glycogen');
    expect(glycogen).toContain('α-1,4');
    expect(glycogen).toContain('α-1,6');
    expect(glycogen).toContain('glucose 1-phosphate');
    expect(glycogen).toContain('four residues');
    expect(glycogen).toContain('debranching enzyme');

    const krebs = scriptText('krebs');
    for (const step of KREBS_STEPS) expect(krebs).toContain(step.enzyme);
    expect(krebs).toContain('3 NADH');
    expect(krebs).toContain('1 FADH₂');
    expect(krebs).toContain('1 GTP');
    expect(krebs).toContain('2 CO₂');
    expect(krebs).toContain('oxaloacetate');
    expect(krebs).toContain('mitochondrial matrix');
    expect(krebs).toContain('Complex II');
  });
});
