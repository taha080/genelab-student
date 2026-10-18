import { describe, expect, it } from 'vitest';
import { allCodonHits, searchCodons } from '../src/lib/codontable';

describe('codon table lookup', () => {
  it('lists all 64 codons of the standard code', () => {
    const hits = allCodonHits();
    expect(hits).toHaveLength(64);
    expect(new Set(hits.map((hit) => hit.codon)).size).toBe(64);
    expect(hits.filter((hit) => hit.isStop).map((hit) => hit.codon).sort()).toEqual(['TAA', 'TAG', 'TGA']);
    expect(hits.filter((hit) => hit.isStart).map((hit) => hit.codon)).toEqual(['ATG']);
  });

  it('searches by DNA codon, RNA codon, and amino-acid names', () => {
    expect(searchCodons('atg').map((hit) => hit.aa)).toEqual(['M']);
    expect(searchCodons('AUG')[0]).toMatchObject({ codon: 'ATG', rna: 'AUG', name: 'methionine', isStart: true });
    expect(searchCodons('Phe').map((hit) => hit.codon).sort()).toEqual(['TTC', 'TTT']);
    expect(searchCodons('F').map((hit) => hit.codon).sort()).toEqual(['TTC', 'TTT']);
    expect(searchCodons('phenyl').map((hit) => hit.name)).toEqual(['phenylalanine', 'phenylalanine']);
    expect(searchCodons('stop').map((hit) => hit.codon).sort()).toEqual(['TAA', 'TAG', 'TGA']);
    expect(searchCodons('ser').every((hit) => hit.aa === 'S')).toBe(true);
    expect(searchCodons('ser')).toHaveLength(6);
    expect(searchCodons('s')).toHaveLength(6);
    expect(searchCodons('zz')).toEqual([]);
  });
});
