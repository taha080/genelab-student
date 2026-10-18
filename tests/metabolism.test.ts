import { describe, expect, it } from 'vitest';
import {
  ATP_TO_ADP_KJ,
  GLYCOGEN_GLYCOLYSIS_ATP,
  GLYCOLYSIS,
  GLYCOGENOLYSIS,
  MAP_LINKS,
  METABOLISM_LESSONS,
  OXPHOS,
  OXPHOS_AGENTS,
  PENTOSE_PATHWAY,
  PENTOSE_RECYCLE,
  PHOSPHATE_COMPOUNDS,
  PO_RATIO,
  canPhosphorylateAdp,
  coupledFreeEnergy,
  glycolysisYield,
  gradeLesson,
  lessonFromHash,
  pentoseOxidativeYield,
  protonsPumped,
} from '../src/lib/metabolism';
import { emptyProgress, loadProgress, recordLessonCheck, saveProgress, type KeyValueStore } from '../src/lib/progress';

function memory(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

describe('metabolism lessons', () => {
  it('links the map to every new lesson plus the citric acid cycle and gluconeogenesis', () => {
    expect(METABOLISM_LESSONS.map((lesson) => lesson.id)).toEqual(['intro', 'atp', 'glycolysis', 'glycogenolysis', 'pentose', 'oxphos']);
    expect(METABOLISM_LESSONS.every((lesson) => lesson.quiz.length >= 4)).toBe(true);
    expect(MAP_LINKS.map((link) => link.hash)).toEqual([
      'metabolism/glycogenolysis',
      'metabolism/glycolysis',
      'metabolism/pentose',
      'metabolism/atp',
      'biochem/krebs',
      'metabolism/oxphos',
      'biochem/glucose',
    ]);
    expect(lessonFromHash('#metabolism')).toBe('intro');
    expect(lessonFromHash('#metabolism/glycolysis')).toBe('glycolysis');
    expect(lessonFromHash('#metabolism/nope')).toBe('intro');
  });

  it('ranks phosphoryl donors against ATP and couples hexokinase', () => {
    expect(ATP_TO_ADP_KJ).toBe(-30.5);
    expect(canPhosphorylateAdp(-61.9)).toBe(true);
    expect(canPhosphorylateAdp(-13.8)).toBe(false);
    expect(PHOSPHATE_COMPOUNDS.filter((item) => item.kind === 'donor').every((item) => canPhosphorylateAdp(item.deltaG))).toBe(true);
    expect(PHOSPHATE_COMPOUNDS.filter((item) => item.kind === 'acceptor').every((item) => !canPhosphorylateAdp(item.deltaG))).toBe(true);
    expect(coupledFreeEnergy(13.8)).toBeCloseTo(-16.7, 5);
  });

  it('nets 2 ATP and 2 NADH from the ten glycolytic steps', () => {
    expect(GLYCOLYSIS).toHaveLength(10);
    expect(GLYCOLYSIS.map((step) => step.step)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(GLYCOLYSIS.map((step) => step.enzyme)).toEqual([
      'Hexokinase (glucokinase in liver)',
      'Phosphoglucose isomerase',
      'Phosphofructokinase-1',
      'Aldolase',
      'Triose-phosphate isomerase',
      'Glyceraldehyde-3-phosphate dehydrogenase',
      'Phosphoglycerate kinase',
      'Phosphoglycerate mutase',
      'Enolase',
      'Pyruvate kinase',
    ]);
    expect(glycolysisYield()).toEqual({ atp: 2, nadh: 2, pyruvate: 2 });
    expect(GLYCOLYSIS.filter((step) => step.phase === 'Investment')).toHaveLength(5);
    expect(GLYCOLYSIS.find((step) => step.id === 'pfk')?.phase).toBe('Investment');
    expect(GLYCOLYSIS.find((step) => step.id === 'gapdh')?.nadh).toBe(2);
  });

  it('releases glucose 1-phosphate, and only liver frees blood glucose', () => {
    expect(GLYCOGENOLYSIS[0]?.enzyme).toMatch(/phosphorylase/i);
    expect(GLYCOGENOLYSIS[0]?.conversion).toMatch(/glucose 1-phosphate/i);
    expect(GLYCOGENOLYSIS.find((step) => step.id === 'glucosidase')?.conversion).toMatch(/free glucose/i);
    expect(GLYCOGENOLYSIS.at(-1)?.enzyme).toMatch(/Glucose-6-phosphatase/);
    expect(GLYCOGEN_GLYCOLYSIS_ATP).toBe(3);
  });

  it('makes 2 NADPH in the oxidative pentose phosphate phase', () => {
    expect(PENTOSE_PATHWAY.filter((step) => step.phase === 'Oxidative').map((step) => step.enzyme)).toEqual([
      'Glucose-6-phosphate dehydrogenase',
      'Gluconolactonase',
      '6-Phosphogluconate dehydrogenase',
    ]);
    expect(pentoseOxidativeYield()).toEqual({ nadph: 2, co2: 1 });
    expect(PENTOSE_PATHWAY.find((step) => step.id === 'g6pd')?.regulation).toMatch(/NADPH/);
    expect(PENTOSE_PATHWAY.find((step) => step.id === 'tk1')?.detail).toMatch(/two-carbon/);
    expect(PENTOSE_RECYCLE).toEqual({ glucose6p: 3, nadph: 6, co2: 3, fructose6p: 2, glyceraldehyde3p: 1 });
  });

  it('pumps 10 protons from NADH and 6 from succinate', () => {
    expect(OXPHOS.map((step) => step.id)).toEqual(['complex-i', 'complex-ii', 'complex-iii', 'complex-iv', 'gradient', 'synthase']);
    expect(protonsPumped('nadh')).toBe(10);
    expect(protonsPumped('succinate')).toBe(6);
    expect(OXPHOS.find((step) => step.id === 'complex-ii')?.protons).toBe(0);
    expect(PO_RATIO).toEqual({ nadh: 2.5, succinate: 1.5 });
    expect(OXPHOS_AGENTS.find((agent) => agent.id === 'cyanide')?.target).toBe('Complex IV');
    expect(OXPHOS_AGENTS.find((agent) => agent.id === 'oligomycin')?.target).toBe('ATP synthase');
    expect(OXPHOS_AGENTS.find((agent) => agent.id === 'dnp')?.kind).toBe('uncoupler');
  });

  it('grades a lesson quiz and keeps the check in progress', () => {
    const glycolysis = METABOLISM_LESSONS.find((lesson) => lesson.id === 'glycolysis');
    expect(glycolysis).toBeTruthy();
    const correct = glycolysis?.quiz.map((question) => question.answer) ?? [];
    expect(gradeLesson('glycolysis', correct)).toEqual({ score: 4, total: 4 });
    const wrong = gradeLesson('glycolysis', [0, 0, 0, 0]);
    expect(wrong?.score).toBe(correct.filter((answer) => answer === 0).length);
    expect(gradeLesson('glycolysis', [0])).toBeNull();
    const store = memory();
    const state = recordLessonCheck(emptyProgress(), 'oxphos', 3, 4, '2026-01-01T00:00:00.000Z');
    saveProgress(store, state);
    expect(loadProgress(store).checks).toEqual([{ id: 'oxphos', score: 3, total: 4, at: '2026-01-01T00:00:00.000Z' }]);
    expect(recordLessonCheck(state, 'not-a-lesson', 1, 4, '2026-01-01T00:00:00.000Z').checks).toHaveLength(1);
  });
});
