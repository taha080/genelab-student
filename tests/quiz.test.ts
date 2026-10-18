import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../src/lib/quiz';

describe('quiz bank', () => {
  it('has thirty complete questions with one keyed answer each', () => {
    expect(QUESTIONS).toHaveLength(30);
    const ids = new Set(QUESTIONS.map((question) => question.id));
    expect(ids.size).toBe(30);
    for (const question of QUESTIONS) {
      expect(question.choices).toHaveLength(4);
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThan(4);
      expect(question.explanation.length).toBeGreaterThan(40);
      expect(new Set(question.choices).size).toBe(4);
    }
  });

  it('keys the PAM, silent-mutation, and translation items correctly', () => {
    const byId = Object.fromEntries(QUESTIONS.map((question) => [question.id, question]));
    expect(byId.pam?.choices[byId.pam.answer]).toBe('NGG');
    expect(byId.silent?.choices[byId.silent.answer]).toBe('Silent');
    expect(byId.translate?.choices[byId.translate.answer]).toBe('Met–Phe–Stop');
    expect(byId.frameshift?.choices[byId.frameshift.answer]).toBe('Frameshift');
    expect(byId['aa-charge']?.choices[byId['aa-charge'].answer]).toBe('Aspartate and glutamate');
    expect(byId['mm-half']?.choices[byId['mm-half'].answer]).toBe('Half of Vmax');
    expect(byId['lb-intercept']?.choices[byId['lb-intercept'].answer]).toBe('1/Vmax');
    expect(byId['krebs-nadh']?.choices[byId['krebs-nadh'].answer]).toBe('3');
    expect(byId['krebs-gtp']?.choices[byId['krebs-gtp'].answer]).toBe('Succinyl-CoA synthetase');
    expect(byId['complex-ii']?.choices[byId['complex-ii'].answer]).toBe('Succinate dehydrogenase');
    expect(byId.bypass?.choices[byId.bypass.answer]).toBe('Fructose-1,6-bisphosphatase');
    expect(byId['gng-cost']?.choices[byId['gng-cost'].answer]).toBe('4 ATP, 2 GTP, and 2 NADH');
    expect(byId.g6pase?.choices[byId.g6pase.answer]).toBe('Muscle lacks glucose-6-phosphatase');
    expect(byId.cori?.answer).toBe(0);
  });
});
