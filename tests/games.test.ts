import { describe, expect, it } from 'vitest';
import { GLUCONEOGENESIS, KREBS_STEPS } from '../src/lib/biochem';
import { CODON_TO_AA } from '../src/lib/codon';
import {
  BASE_PAIR_DECK,
  ENZYME_PAIRS,
  cardsMatch,
  codonRound,
  codonRounds,
  detectiveCases,
  krebsOrder,
  moveItem,
  scoreBasePairs,
  scoreCodonRush,
  scoreDetective,
  scoreEnzymeMatch,
  scorePlacement,
  shuffledKrebs,
} from '../src/lib/games';
import { interpretEdit } from '../src/lib/mutation';
import { mulberry32 } from '../src/lib/random';

describe('codon rush', () => {
  it('uses the standard genetic code and four distinct choices', () => {
    const round = codonRound(mulberry32(7));
    const dna = round.codon.replaceAll('U', 'T');
    const letter = CODON_TO_AA[dna];
    expect(letter).toBeTruthy();
    expect(round.answer === 'Stop' ? letter : letter).toBeTruthy();
    expect(round.choices).toContain(round.answer);
    expect(new Set(round.choices).size).toBe(4);
    expect(round.codon).not.toContain('T');
  });

  it('repeats a seeded deck and scores a streak', () => {
    expect(codonRounds(11, 5)).toEqual(codonRounds(11, 5));
    expect(scoreCodonRush(4, 1, 3)).toBe(4 * 10 + 4 - 2);
    expect(scoreCodonRush(0, 3, 0)).toBe(0);
  });
});

describe('base-pair match', () => {
  it('pairs DNA A–T and G–C, and RNA A–U and G–C, and nothing else', () => {
    expect(BASE_PAIR_DECK).toHaveLength(8);
    const partner = (id: string) => BASE_PAIR_DECK.find((card) => card.id === id);
    expect(cardsMatch(partner('dna-a')!, partner('dna-t')!)).toBe(true);
    expect(cardsMatch(partner('dna-g')!, partner('dna-c')!)).toBe(true);
    expect(cardsMatch(partner('rna-a')!, partner('rna-u')!)).toBe(true);
    expect(cardsMatch(partner('rna-g')!, partner('rna-c')!)).toBe(true);
    expect(cardsMatch(partner('dna-a')!, partner('rna-u')!)).toBe(false);
    expect(cardsMatch(partner('dna-a')!, partner('dna-a')!)).toBe(false);
    expect(scoreBasePairs(4, 0)).toBe(100);
    expect(scoreBasePairs(4, 2)).toBe(90);
  });
});

describe('krebs order', () => {
  it('follows the eight cycle enzymes and scores a perfect order at 100', () => {
    const order = krebsOrder();
    expect(order.map((item) => item.label)).toEqual(KREBS_STEPS.map((step) => step.enzyme));
    expect(scorePlacement(order.map((item) => item.id), order.map((item) => item.id))).toEqual({ correct: 8, score: 100 });
    const swapped = moveItem(order, 0, 1);
    expect(swapped[0]?.id).toBe(order[1]?.id);
    expect(shuffledKrebs(3).map((item) => item.id).sort()).toEqual(order.map((item) => item.id).sort());
  });
});

describe('enzyme match', () => {
  it('uses real cycle and bypass enzymes', () => {
    const known = new Set([...KREBS_STEPS.map((step) => step.enzyme), ...GLUCONEOGENESIS.map((step) => step.enzyme)]);
    for (const pair of ENZYME_PAIRS) expect(known.has(pair.enzyme)).toBe(true);
    expect(new Set(ENZYME_PAIRS.map((pair) => pair.id)).size).toBe(ENZYME_PAIRS.length);
    expect(scoreEnzymeMatch(ENZYME_PAIRS.length, 0)).toBe(100);
    expect(scoreEnzymeMatch(1, 1)).toBe(12);
  });
});

describe('mutation detective', () => {
  it('agrees with the mutation classifier', () => {
    const cases = detectiveCases();
    expect(cases.map((item) => item.effect)).toEqual([
      'silent',
      'missense',
      'nonsense',
      'frameshift',
      'stop-loss',
      'in-frame-deletion',
    ]);
    for (const item of cases) {
      expect(item.choices).toContain(item.effect);
      const again = interpretEdit(item.before, { kind: 'substitution', position: 1, base: item.before[0] });
      expect('error' in again).toBe(false);
    }
    expect(scoreDetective(6, 6)).toBe(100);
    expect(scoreDetective(3, 6)).toBe(48);
  });
});
