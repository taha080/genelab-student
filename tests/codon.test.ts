import { describe, expect, it } from 'vitest';
import { analyzeFrame, anticodon, CODON_TO_AA, randomOrf, translate } from '../src/lib/codon';
import { CLASSROOM_GENE, SHORT_ORF } from '../src/lib/samples';
import { cleanDna, complement, gcContent, reverseComplement } from '../src/lib/sequence';

const EXPECTED = `
TTT F TTC F TTA L TTG L
TCT S TCC S TCA S TCG S
TAT Y TAC Y TAA * TAG *
TGT C TGC C TGA * TGG W
CTT L CTC L CTA L CTG L
CCT P CCC P CCA P CCG P
CAT H CAC H CAA Q CAG Q
CGT R CGC R CGA R CGG R
ATT I ATC I ATA I ATG M
ACT T ACC T ACA T ACG T
AAT N AAC N AAA K AAG K
AGT S AGC S AGA R AGG R
GTT V GTC V GTA V GTG V
GCT A GCC A GCA A GCG A
GAT D GAC D GAA E GAG E
GGT G GGC G GGA G GGG G
`;

describe('standard genetic code', () => {
  it('matches NCBI translation table 1 for all 64 codons', () => {
    const tokens = EXPECTED.trim().split(/\s+/);
    expect(tokens).toHaveLength(128);
    expect(Object.keys(CODON_TO_AA)).toHaveLength(64);
    for (let i = 0; i < tokens.length; i += 2) {
      expect(CODON_TO_AA[tokens[i] ?? '']).toBe(tokens[i + 1]);
    }
  });

  it('has the familiar codon counts', () => {
    const counts: Record<string, number> = {};
    for (const aa of Object.values(CODON_TO_AA)) counts[aa] = (counts[aa] ?? 0) + 1;
    expect(counts['*']).toBe(3);
    expect(counts.M).toBe(1);
    expect(counts.W).toBe(1);
    expect(counts.L).toBe(6);
    expect(counts.S).toBe(6);
    expect(counts.R).toBe(6);
    expect(counts.I).toBe(3);
  });

  it('pairs an mRNA codon with a strict anticodon', () => {
    expect(anticodon('AUG')).toEqual({ threeToFive: 'UAC', fiveToThree: 'CAU' });
    expect(anticodon('UUU')?.threeToFive).toBe('AAA');
    expect(anticodon('AT')).toBeNull();
  });

  it('translates the classroom and short open reading frames', () => {
    expect(translate(SHORT_ORF)).toBe('MFGCKPE*');
    expect(translate(CLASSROOM_GENE)).toBe('MKGCKPELVRAGSTNQHFLWY*');
    expect(translate('atgttttaa')).toBe('MF*');
    expect(translate('ATGTTTTAA', 1)).toBe('CF');
    expect(translate('ATGTTTTAA', 2)).toBe('VL');
  });
});

describe('reading frames', () => {
  it('marks the short ORF from the first ATG to the in-frame stop', () => {
    const frame = analyzeFrame(SHORT_ORF, 1);
    expect(frame.orf).toEqual({
      startCodon: 1,
      stopCodon: 8,
      aminoAcids: 7,
      stopBeforeStart: false,
    });
    expect(frame.codons[0]?.isStart).toBe(true);
    expect(frame.codons[0]?.mrna).toBe('AUG');
    expect(frame.codons[0]?.template).toBe('TAC');
    expect(frame.codons[7]?.isStop).toBe(true);
    expect(frame.polypeptide).toBe('MFGCKPE*');
  });

  it('shifts the grouping in frames +2 and +3', () => {
    const plus2 = analyzeFrame(CLASSROOM_GENE, 2);
    expect(plus2.skipped).toBe('A');
    expect(plus2.codons[0]?.dna).toBe('TGA');
    expect(plus2.codons[0]?.isStop).toBe(true);
    expect(plus2.protein.startsWith('*KD')).toBe(true);

    const plus3 = analyzeFrame(CLASSROOM_GENE, 3);
    expect(plus3.skipped).toBe('AT');
    expect(plus3.protein.startsWith('ERM')).toBe(true);
  });

  it('reads the opposite strand for a reverse frame', () => {
    expect(reverseComplement('ATGTTTTAA')).toBe('TTAAAACAT');
    expect(translate(reverseComplement('ATGTTTTAA'))).toBe('LKH');
    const reverse = analyzeFrame('ATGTTTTAA', -1);
    expect(reverse.coding).toBe('TTAAAACAT');
    expect(reverse.protein).toBe('LKH');
  });
});

describe('sequence geometry', () => {
  it('cleans FASTA, case, uracil, numbers, and unknown letters', () => {
    const cleaned = cleanDna('>demo gene\nAtg ttt uaa 12 N\n');
    expect(cleaned).toEqual({ seq: 'ATGTTTTAA', uToT: 1, skipped: 1 });
  });

  it('complements and reverse-complements', () => {
    expect(complement('ATG')).toBe('TAC');
    expect(reverseComplement('ATG')).toBe('CAT');
    const seq = CLASSROOM_GENE;
    expect(reverseComplement(reverseComplement(seq))).toBe(seq);
    expect(complement(complement(seq))).toBe(seq);
  });

  it('reports GC content', () => {
    expect(gcContent('')).toBe(0);
    expect(gcContent('AAAA')).toBe(0);
    expect(gcContent('GCGC')).toBe(100);
    expect(gcContent('ACGT')).toBe(50);
    expect(gcContent(SHORT_ORF)).toBeCloseTo((11 / 24) * 100, 5);
  });

  it('builds an open reading frame that starts and stops', () => {
    const seq = randomOrf(6, () => 0);
    expect(seq.startsWith('ATG')).toBe(true);
    expect(seq.endsWith('TAA')).toBe(true);
    expect(seq.length).toBe(21);
    const protein = translate(seq);
    expect(protein.startsWith('M')).toBe(true);
    expect(protein.endsWith('*')).toBe(true);
    expect(protein.slice(0, -1)).not.toContain('*');
  });
});
