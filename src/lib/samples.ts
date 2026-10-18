/** Synthetic classroom sequences. None of these is a natural gene or a pathogen. */

export const SHORT_ORF = 'ATGTTTGGCTGCAAACCGGAGTAA';

/** 21 amino acids plus a stop: MKGCKPELVRAGSTNQHFLWY* */
export const CLASSROOM_GENE =
  'ATGAAAGGATGCAAACCGGAGCTGGTTCGCGCAGGTTCTACTAACCAACACTTTTTATGGTATTAA';

/** One + strand site: 20 nt then AGG. */
export const PAM_PLUS = 'ATCGATCGATCGATCGATCGAGG';

/** The reverse complement of PAM_PLUS, so the NGG is on the other strand. */
export const PAM_MINUS = 'CCTCGATCGATCGATCGATCGAT';

export const MATCHED_FORWARD = 'GGACTTGCATCGGTTCAAGC';
export const MATCHED_REVERSE = 'CGGTAACTTGGTCCGATTGC';

export const UNEVEN_FORWARD = 'ATGAAAGGATGCAAACCG';
export const UNEVEN_REVERSE = 'TTAATACCATAAAAAGTG';

/** Stem of five G·C pairs with a loop of four adenines. */
export const HAIRPIN_PRIMER = 'GCGCGAAAACGCGC';

/**
 * Synthetic DNA with one site each for EcoRI, BamHI, HindIII, XhoI, and NotI.
 * Not a natural gene.
 */
export const RESTRICTION_DEMO = 'GGAATTCCGGATCCAAAAGCTTCTCGAGGCGGCCGC';
