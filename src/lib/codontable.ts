/** Search the standard genetic code by codon or amino-acid name. */
import { AMINO_ACIDS, CODON_TO_AA } from './codon';
import { dnaToRna } from './sequence';

export const CODON_BASES = ['T', 'C', 'A', 'G'] as const;

export interface CodonHit {
  codon: string;
  rna: string;
  aa: string;
  short: string;
  name: string;
  isStart: boolean;
  isStop: boolean;
}

export function codonHit(codon: string): CodonHit | null {
  const aa = CODON_TO_AA[codon];
  if (!aa) return null;
  const info = AMINO_ACIDS[aa];
  if (!info) return null;
  return {
    codon,
    rna: dnaToRna(codon),
    aa,
    short: info.short,
    name: info.name,
    isStart: codon === 'ATG',
    isStop: aa === '*',
  };
}

export function allCodonHits(): CodonHit[] {
  const hits: CodonHit[] = [];
  for (const first of CODON_BASES) {
    for (const second of CODON_BASES) {
      for (const third of CODON_BASES) {
        const hit = codonHit(`${first}${second}${third}`);
        if (hit) hits.push(hit);
      }
    }
  }
  return hits;
}

export function codonsForAminoAcid(aa: string): CodonHit[] {
  return allCodonHits().filter((hit) => hit.aa === aa);
}

/**
 * Find codons from a codon (DNA or RNA) or an amino-acid query.
 * One-letter queries match only that letter. Names match the full name,
 * the three-letter code, or a prefix of the name at least 3 letters long.
 */
export function searchCodons(query: string): CodonHit[] {
  const text = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!text) return [];
  const compact = text.replace(/[^a-z*]/g, '');
  if (compact.length === 3 && /^[acgtu]{3}$/.test(compact)) {
    const codon = compact.toUpperCase().replaceAll('U', 'T');
    const hit = codonHit(codon);
    return hit ? [hit] : [];
  }
  if (text === '*' || text === 'stop' || text === 'stops') return codonsForAminoAcid('*');
  if (compact.length === 1 && compact !== '*') {
    const letter = compact.toUpperCase();
    if (AMINO_ACIDS[letter]) return codonsForAminoAcid(letter);
    return [];
  }
  const matches = Object.entries(AMINO_ACIDS).filter(([, name]) => {
    if (name.name === text || name.short.toLowerCase() === compact) return true;
    return compact.length >= 3 && name.name.startsWith(text);
  });
  const exact = matches.filter(([, name]) => name.name === text || name.short.toLowerCase() === compact);
  const chosen = exact.length > 0 ? exact : matches;
  return chosen.flatMap(([aa]) => codonsForAminoAcid(aa));
}
