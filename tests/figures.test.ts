import { describe, expect, it } from 'vitest';
import { DIAGRAMS, FIGURE_TOPICS, figureHeading, textsOf, type FigureTopic } from '../src/lib/diagrams';

function blob(topic: FigureTopic): string {
  return DIAGRAMS[topic].flatMap((diagram) => [diagram.alt, diagram.caption, ...textsOf(diagram)]).join('\n');
}

describe('lesson figures', () => {
  it('covers every listed topic with one to three diagrams', () => {
    expect(FIGURE_TOPICS).toEqual([
      'dogma',
      'crispr',
      'primers',
      'mutations',
      'sequences',
      'codon',
      'animation',
      'biochem',
      'krebs',
      'glucose',
      'intro',
      'atp',
      'glycolysis',
      'glycogenolysis',
      'pentose',
      'oxphos',
    ]);
    for (const topic of FIGURE_TOPICS) {
      expect(DIAGRAMS[topic].length).toBeGreaterThanOrEqual(1);
      expect(DIAGRAMS[topic].length).toBeLessThanOrEqual(3);
    }
  });

  it('numbers figures inside a lesson', () => {
    expect(figureHeading(1, 'Base pairing')).toBe('Figure 1. Base pairing');
    expect(figureHeading(2, 'Information flow')).toBe('Figure 2. Information flow');
  });

  it('gives every diagram an id, caption, alt text, and labels', () => {
    const ids = new Set<string>();
    for (const topic of FIGURE_TOPICS) {
      for (const diagram of DIAGRAMS[topic]) {
        expect(ids.has(diagram.id), diagram.id).toBe(false);
        ids.add(diagram.id);
        expect(diagram.alt.trim().length).toBeGreaterThan(20);
        expect(diagram.caption.trim().length).toBeGreaterThan(20);
        expect(diagram.width).toBeGreaterThan(0);
        expect(diagram.height).toBeGreaterThan(0);
        expect(diagram.marks.length).toBeGreaterThan(0);
        expect(textsOf(diagram).length).toBeGreaterThan(0);
        for (const text of textsOf(diagram)) expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('labels DNA, codons, and the metabolism drawings', () => {
    const dogma = blob('dogma');
    expect(dogma).toContain('2 hydrogen bonds');
    expect(dogma).toContain('3 hydrogen bonds');
    expect(dogma).toContain('antiparallel');
    expect(dogma).toContain('sugar–phosphate');
    expect(dogma).toContain('5′');
    expect(dogma).toContain('transcription');
    expect(dogma).toContain('U replaces T');

    const crispr = blob('crispr');
    expect(crispr).toContain('20 nt');
    expect(crispr).toContain('NGG');
    expect(crispr).toContain('3 nt');
    expect(crispr).toContain('both strands');

    const primers = blob('primers');
    expect(primers).toContain('forward primer');
    expect(primers).toContain('reverse primer');
    expect(primers).toContain('DNA polymerase');
    expect(primers).toContain('5′ → 3′');

    const mutations = blob('mutations');
    expect(mutations).toContain('Missense');
    expect(mutations).toContain('Frameshift');
    expect(mutations).toContain('Glu');
    expect(mutations).toContain('Val');

    const sequences = blob('sequences');
    expect(sequences).toContain('EcoRI');
    expect(sequences).toContain('5′-G|AATTC-3′');
    expect(sequences).toContain('3′-CTTAA|G-5′');
    expect(sequences).toContain('sticky');
    expect(sequences).toContain('5′-GCAT-3′');

    const codon = blob('codon');
    expect(codon).toContain('5′-AUG-3′');
    expect(codon).toContain('Met');
    expect(codon).toContain('start codon');
    expect(codon).toContain('UAA');
    expect(codon).toContain('UAG');
    expect(codon).toContain('UGA');
    expect(codon).toContain('64 codons');
    expect(codon).toContain('NCBI table 1');

    const animation = blob('animation');
    expect(animation).toContain('template');
    expect(animation).toContain('A site');
    expect(animation).toContain('P site');
    expect(animation).toContain('E site');
    expect(animation).toContain('3′-UAC-5′');
    expect(animation).toContain('antiparallel');

    const biochem = blob('biochem');
    expect(biochem).toContain('α carbon');
    expect(biochem).toContain('NH₃⁺');
    expect(biochem).toContain('COO⁻');
    expect(biochem).toContain('peptide bond');
    expect(biochem).toContain('water leaves');

    const krebs = blob('krebs');
    expect(krebs).toContain('3 NADH');
    expect(krebs).toContain('1 FADH₂');
    expect(krebs).toContain('1 GTP');
    expect(krebs).toContain('2 CO₂');
    expect(krebs).toContain('oxaloacetate');
    expect(krebs).toContain('matrix');

    const glucose = blob('glucose');
    expect(glucose).toContain('pyruvate carboxylase');
    expect(glucose).toContain('PEPCK');
    expect(glucose).toContain('fructose 1,6-bisphosphatase');
    expect(glucose).toContain('glucose 6-phosphatase');
    expect(glucose).toContain('4 ATP');
    expect(glucose).toContain('2 GTP');
    expect(glucose).toContain('2 NADH');

    const intro = blob('intro');
    expect(intro).toContain('cytosol');
    expect(intro).toContain('glycolysis');
    expect(intro).toContain('pentose phosphate');
    expect(intro).toContain('glycogen');
    expect(intro).toContain('matrix');
    expect(intro).toContain('inner membrane');
    expect(intro).toContain('oxidative');
    expect(intro).toContain('convergent');
    expect(intro).toContain('reductive');
    expect(intro).toContain('divergent');
    expect(intro).toContain('NADPH');

    const atp = blob('atp');
    expect(atp).toContain('adenine');
    expect(atp).toContain('ribose');
    expect(atp).toContain('phosphoester');
    expect(atp).toContain('phosphoanhydride');
    expect(atp).toContain('−30.5');
    expect(atp).toContain('−61.9');
    expect(atp).toContain('−49.4');
    expect(atp).toContain('−43.1');
    expect(atp).toContain('−13.8');
    expect(atp).toContain('Phosphoenolpyruvate');
    expect(atp).toContain('1,3-Bisphosphoglycerate');
    expect(atp).toContain('Phosphocreatine');
    expect(atp).toContain('Glucose 6-phosphate');
    expect(atp).toContain('phosphorylate ADP');

    const glycolysis = blob('glycolysis');
    expect(glycolysis).toContain('hexokinase');
    expect(glycolysis).toContain('PFK-1');
    expect(glycolysis).toContain('pyruvate kinase');
    expect(glycolysis).toContain('−2 ATP');
    expect(glycolysis).toContain('2 NADH');
    expect(glycolysis).toContain('Cytosol');

    const glycogen = blob('glycogenolysis');
    expect(glycogen).toContain('α-1,4');
    expect(glycogen).toContain('α-1,6');
    expect(glycogen).toContain('glucose 1-phosphate');
    expect(glycogen).toContain('four residues');
    expect(glycogen).toContain('debranching');
    expect(glycogen).toContain('Liver');
    expect(glycogen).toContain('Muscle');
    expect(glycogen).toContain('glucose 6-phosphatase');
    expect(glycogen).toContain('3 ATP');

    const pentose = blob('pentose');
    expect(pentose).toContain('2 NADPH');
    expect(pentose).toContain('ribulose 5-phosphate');
    expect(pentose).toContain('CO₂');
    expect(pentose).toContain('G6PD');
    expect(pentose).toContain('NADPH');
    expect(pentose).toContain('ribose 5-phosphate');
    expect(pentose).toContain('fructose 6-phosphate');
    expect(pentose).toContain('cytosol');

    const oxphos = blob('oxphos');
    expect(oxphos).toContain('outer membrane');
    expect(oxphos).toContain('intermembrane space');
    expect(oxphos).toContain('inner membrane');
    expect(oxphos).toContain('matrix');
    expect(oxphos).toContain('Complex I');
    expect(oxphos).toContain('Complex II');
    expect(oxphos).toContain('Complex III');
    expect(oxphos).toContain('Complex IV');
    expect(oxphos).toContain('ATP synthase');
    expect(oxphos).toContain('4 H⁺');
    expect(oxphos).toContain('2 H⁺');
    expect(oxphos).toContain('10 H⁺');
    expect(oxphos).toContain('6 H⁺');
    expect(oxphos).toContain('2.5');
    expect(oxphos).toContain('1.5');
    expect(oxphos).toContain('O₂');
  });
});
