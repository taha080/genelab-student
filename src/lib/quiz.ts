export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: [string, string, string, string];
  /** Index into `choices`. */
  answer: number;
  explanation: string;
}

export const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'dogma-order',
    prompt: 'In the central dogma taught in class, what is the usual order of information flow?',
    choices: ['Protein → RNA → DNA', 'DNA → RNA → protein', 'RNA → DNA → protein', 'DNA → protein → RNA'],
    answer: 1,
    explanation:
      'DNA is transcribed into RNA, and RNA is translated into protein. Some viruses reverse the first step, but the classroom path is DNA to RNA to protein.',
  },
  {
    id: 'base-pair',
    prompt: 'Which base pairs with adenine in a DNA duplex?',
    choices: ['Thymine', 'Uracil', 'Guanine', 'Cytosine'],
    answer: 0,
    explanation: 'In DNA, A pairs with T and G pairs with C. Uracil pairs with adenine in RNA, not in DNA.',
  },
  {
    id: 'coding-mrna',
    prompt: 'A coding strand is written 5′ to 3′. How is the mRNA related to that strand?',
    choices: [
      'It is the reverse complement, with U in place of T',
      'It is the same sequence, including the thymines',
      'It is the same sequence, with U in place of T',
      'It is read from the protein backward',
    ],
    answer: 2,
    explanation:
      'The coding strand matches the mRNA, except that T is written as U. The template strand is the reverse complement, and that is the strand RNA polymerase reads.',
  },
  {
    id: 'codon-size',
    prompt: 'How many bases does the ribosome read at a time in the standard genetic code?',
    choices: ['1', '2', '3', '4'],
    answer: 2,
    explanation: 'A codon is three bases. Sixty-four codons is enough for 20 amino acids and the stop signals.',
  },
  {
    id: 'start',
    prompt: 'Which codon usually signals the start of translation in the standard genetic code?',
    choices: ['UAA', 'AUG', 'UAG', 'UGA'],
    answer: 1,
    explanation: 'AUG codes for methionine and is the usual start codon. UAA, UAG, and UGA are stops.',
  },
  {
    id: 'stop-count',
    prompt: 'How many stop codons are in the standard genetic code?',
    choices: ['1', '2', '3', '4'],
    answer: 2,
    explanation: 'UAA, UAG, and UGA do not encode an amino acid. They end translation.',
  },
  {
    id: 'silent',
    prompt: 'A DNA codon TTT changes to TTC. Both encode phenylalanine. What kind of mutation is that?',
    choices: ['Missense', 'Silent', 'Nonsense', 'Frameshift'],
    answer: 1,
    explanation: 'A silent, or synonymous, mutation changes the codon but not the amino acid.',
  },
  {
    id: 'nonsense',
    prompt: 'A codon for an amino acid changes into a stop codon. What is that called?',
    choices: ['Silent', 'In-frame insertion', 'Nonsense', 'Missense'],
    answer: 2,
    explanation: 'A nonsense mutation ends the protein early because a stop appears where an amino acid used to be.',
  },
  {
    id: 'missense',
    prompt: 'Changing GAG (glutamate) to GTG (valine) is which kind of mutation?',
    choices: ['Missense', 'Silent', 'Nonsense', 'Frameshift'],
    answer: 0,
    explanation: 'A missense mutation swaps one amino acid for a different one. The reading frame stays the same.',
  },
  {
    id: 'frameshift',
    prompt: 'Inserting one extra base into a coding sequence usually causes which effect?',
    choices: ['A single amino-acid swap and nothing else', 'Silent change', 'Frameshift', 'Loss of the PAM'],
    answer: 2,
    explanation:
      'Codons are read in threes. Adding a number of bases that is not a multiple of three shifts every codon downstream.',
  },
  {
    id: 'gc',
    prompt: 'What does GC content measure?',
    choices: [
      'The melting temperature in degrees',
      'The percentage of bases that are G or C',
      'The number of genes in the sequence',
      'The length of the protein',
    ],
    answer: 1,
    explanation:
      'GC content is (G + C) divided by the number of bases, as a percentage. G·C pairs have three hydrogen bonds, so GC-rich DNA tends to melt at a higher temperature.',
  },
  {
    id: 'pam',
    prompt: 'Which PAM does the commonly taught SpCas9 from Streptococcus pyogenes recognize?',
    choices: ['TTTV', 'NGG', 'TTN', 'NGA only'],
    answer: 1,
    explanation:
      'SpCas9 binds a 5′-NGG-3′ PAM just downstream of the 20-nucleotide guide match. Other Cas proteins use different PAMs.',
  },
  {
    id: 'guide-side',
    prompt: 'Where does the 20-nucleotide SpCas9 guide sit relative to the PAM?',
    choices: [
      'Immediately on the 3′ side of the NGG',
      'Ten bases away from the PAM',
      'Inside the three PAM bases',
      'Immediately on the 5′ side of the NGG',
    ],
    answer: 3,
    explanation: 'On the strand that contains the PAM, the target is 5′–[20 nt guide]NGG–3′.',
  },
  {
    id: 'polyt',
    prompt: 'Why do classroom guide checks flag a run of four thymines?',
    choices: [
      'TTTT is the SpCas9 PAM',
      'Four thymines can terminate a U6 promoter used to make the guide RNA',
      'TTTT is always a stop codon',
      'Thymine cannot base-pair',
    ],
    answer: 1,
    explanation:
      'RNA polymerase III promoters such as U6 treat a run of uracils as a stop signal. TTTT in the DNA that encodes the guide can cut that RNA short. This is a sequence flag, not an off-target search.',
  },
  {
    id: 'wallace',
    prompt: 'What is the Wallace rule estimating?',
    choices: [
      'A simple melting temperature from base counts',
      'The exact number of PCR copies',
      'The mass of the protein',
      'How many PAM sites a genome contains',
    ],
    answer: 0,
    explanation:
      'Tm ≈ 2(A+T) + 4(G+C). It is a quick estimate for short oligos. It ignores salt, concentration, and stacking, which the nearest-neighbor calculation includes.',
  },
  {
    id: 'pair-tm',
    prompt: 'Two PCR primers work best together when their melting temperatures are…',
    choices: ['As different as possible', 'Both below 20°C', 'Close to each other', 'Exactly equal to the GC percentage'],
    answer: 2,
    explanation:
      'If one primer melts much earlier than the other, it may not bind at the annealing temperature that suits its partner. A difference of a few degrees is a common classroom target.',
  },
  {
    id: 'hairpin',
    prompt: 'Which warning means a primer might fold back on itself?',
    choices: ['Hairpin', 'A start codon', 'A frameshift', 'High GC content by itself'],
    answer: 0,
    explanation: 'A hairpin is a stem and loop inside one primer. A long stem can keep that primer from binding the template.',
  },
  {
    id: 'frame',
    prompt: 'Frame +1 of a coding strand groups which bases into the first codon?',
    choices: ['Bases 2–4', 'Bases 1–3', 'The first three guanines', 'The reverse complement only'],
    answer: 1,
    explanation:
      'Frame +1 groups bases 1–3, 4–6, and so on. Frame +2 starts at base 2. Frame +3 starts at base 3. The reverse frames read the other strand.',
  },
  {
    id: 'translate',
    prompt: 'Translate the coding DNA ATGTTTTAA in frame +1.',
    choices: ['Met–Phe–Lys', 'Met–Leu–Stop', 'Phe–Leu–Stop', 'Met–Phe–Stop'],
    answer: 3,
    explanation: 'ATG is methionine, TTT is phenylalanine, and TAA is a stop codon.',
  },
  {
    id: 'off-target',
    prompt: 'What does a guide list in this app deliberately not tell you?',
    choices: [
      'Where the NGG PAM is',
      'The GC content of the 20-base guide',
      'Whether the same guide matches other sites in a genome',
      'Whether the guide contains a long run of one base',
    ],
    answer: 2,
    explanation:
      'Finding a PAM and a 20-base guide is only the first classroom step. Other matches depend on the rest of the genome, which this static tool does not search.',
  },
  {
    id: 'aa-charge',
    prompt: 'Which pair of amino acids carries a negative charge on the side chain at physiological pH?',
    choices: ['Aspartate and glutamate', 'Lysine and arginine', 'Serine and threonine', 'Glycine and alanine'],
    answer: 0,
    explanation:
      'Aspartate and glutamate have carboxylic acid side chains and are negatively charged near pH 7. Lysine and arginine are positive. Histidine is only partly charged because its side-chain pKa is near 6. Serine, threonine, glycine, and alanine are uncharged.',
  },
  {
    id: 'mm-half',
    prompt: 'In Michaelis–Menten kinetics, what is the reaction velocity when the substrate concentration equals Km?',
    choices: ['Half of Vmax', 'Equal to Vmax', 'One quarter of Vmax', 'Zero'],
    answer: 0,
    explanation:
      'The Michaelis–Menten equation is v = Vmax[S] / (Km + [S]). Setting [S] equal to Km gives v = Vmax / 2. Km is defined as the substrate concentration at half-maximal velocity.',
  },
  {
    id: 'lb-intercept',
    prompt: 'On a Lineweaver–Burk plot of 1/v against 1/[S], what is the y-intercept?',
    choices: ['1/Vmax', '−1/Km', 'Km', 'Vmax'],
    answer: 0,
    explanation:
      'The double-reciprocal equation is 1/v = (Km/Vmax)(1/[S]) + 1/Vmax. When 1/[S] is zero, the line crosses the y-axis at 1/Vmax. The x-intercept is −1/Km.',
  },
  {
    id: 'krebs-nadh',
    prompt: 'How many NADH does one turn of the citric acid cycle make from one acetyl-CoA?',
    choices: ['3', '1', '2', '4'],
    answer: 0,
    explanation:
      'Isocitrate dehydrogenase, the α-ketoglutarate dehydrogenase complex, and malate dehydrogenase each reduce one NAD⁺. Succinate dehydrogenase reduces bound FAD, counted as FADH₂, not as a fourth NADH. Pyruvate dehydrogenase makes another NADH, but it is not one of the eight cycle steps.',
  },
  {
    id: 'krebs-gtp',
    prompt: 'Which citric acid cycle enzyme makes GTP by substrate-level phosphorylation in animals?',
    choices: ['Succinyl-CoA synthetase', 'Citrate synthase', 'Succinate dehydrogenase', 'Fumarase'],
    answer: 0,
    explanation:
      'Succinyl-CoA synthetase converts succinyl-CoA to succinate and phosphorylates GDP to GTP. Nucleoside diphosphate kinase can move that phosphate onto ADP. The other enzymes listed do not make GTP.',
  },
  {
    id: 'complex-ii',
    prompt: 'Which citric acid cycle enzyme is also Complex II of the electron-transport chain?',
    choices: ['Succinate dehydrogenase', 'Malate dehydrogenase', 'Isocitrate dehydrogenase', 'Aconitase'],
    answer: 0,
    explanation:
      'Succinate dehydrogenase sits in the inner mitochondrial membrane. Its bound FAD passes electrons to ubiquinone. The other dehydrogenases of the cycle use NAD⁺ in the matrix.',
  },
  {
    id: 'bypass',
    prompt: 'Which enzyme bypasses phosphofructokinase-1 during gluconeogenesis?',
    choices: ['Fructose-1,6-bisphosphatase', 'Hexokinase', 'Pyruvate kinase', 'Aldolase'],
    answer: 0,
    explanation:
      'Phosphofructokinase-1 spends ATP to make fructose 1,6-bisphosphate. Gluconeogenesis hydrolyzes that phosphate with fructose-1,6-bisphosphatase. Hexokinase is bypassed by glucose-6-phosphatase, and pyruvate kinase by pyruvate carboxylase plus PEPCK. Aldolase is shared and runs in reverse.',
  },
  {
    id: 'gng-cost',
    prompt: 'What does it cost to make one glucose from two pyruvate?',
    choices: ['4 ATP, 2 GTP, and 2 NADH', '2 ATP and 2 NADH', '4 ATP only', '2 GTP and 2 FADH₂'],
    answer: 0,
    explanation:
      'Two pyruvate carboxylations use 2 ATP, two PEPCK reactions use 2 GTP, two reverse phosphoglycerate-kinase steps use 2 ATP, and two reverse GAPDH steps use 2 NADH. The total is 4 ATP + 2 GTP + 2 NADH per glucose.',
  },
  {
    id: 'g6pase',
    prompt: 'Why can liver release free glucose into the blood while muscle cannot?',
    choices: ['Muscle lacks glucose-6-phosphatase', 'Muscle lacks pyruvate kinase', 'Muscle cannot make lactate', 'Liver lacks hexokinase'],
    answer: 0,
    explanation:
      'Glucose-6-phosphatase, in the endoplasmic reticulum of liver and kidney, hydrolyzes glucose 6-phosphate to free glucose. Muscle and brain do not have this enzyme, so their glucose 6-phosphate stays in the cell.',
  },
  {
    id: 'cori',
    prompt: 'In the Cori cycle, how do the energy accounts compare for one glucose returned to muscle?',
    choices: [
      'The liver spends 6 NTP and the muscle gained 2 ATP',
      'Both tissues gain 2 ATP',
      'The liver spends 2 ATP and the muscle spends 6',
      'No ATP is used in either tissue',
    ],
    answer: 0,
    explanation:
      'Muscle glycolysis from glucose to two lactate nets 2 ATP. The liver spends 4 ATP and 2 GTP to rebuild that glucose. Liver lactate dehydrogenase also supplies the two NADH gluconeogenesis needs. The organism’s net cost is 4 NTP.',
  },
];
