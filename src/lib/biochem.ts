/**
 * Classroom biochemistry: the 20 amino acids, Michaelis–Menten kinetics,
 * the citric acid cycle, and gluconeogenesis. Textbook stoichiometry only.
 */

export type SideChainGroup = 'nonpolar' | 'aromatic' | 'polar' | 'positive' | 'negative';

export interface AminoAcid {
  letter: string;
  code: string;
  name: string;
  group: SideChainGroup;
  sideChain: string;
  note: string;
}

export const GROUP_LABELS: Record<SideChainGroup, string> = {
  nonpolar: 'Nonpolar',
  aromatic: 'Aromatic',
  polar: 'Polar uncharged',
  positive: 'Positively charged',
  negative: 'Negatively charged',
};

/** Lehninger-style side-chain groups. Tyrosine is aromatic and more polar than phenylalanine. */
export const AMINO_ACID_TABLE: readonly AminoAcid[] = [
  {
    letter: 'G',
    code: 'Gly',
    name: 'glycine',
    group: 'nonpolar',
    sideChain: '—H',
    note: 'The only amino acid in proteins that is not chiral. The side chain is a hydrogen.',
  },
  {
    letter: 'A',
    code: 'Ala',
    name: 'alanine',
    group: 'nonpolar',
    sideChain: '—CH₃',
    note: 'A small methyl group. Common in helices and in tight spaces.',
  },
  {
    letter: 'V',
    code: 'Val',
    name: 'valine',
    group: 'nonpolar',
    sideChain: '—CH(CH₃)₂',
    note: 'A branched hydrophobic side chain.',
  },
  {
    letter: 'L',
    code: 'Leu',
    name: 'leucine',
    group: 'nonpolar',
    sideChain: '—CH₂CH(CH₃)₂',
    note: 'Hydrophobic, and one of the most common residues in proteins.',
  },
  {
    letter: 'I',
    code: 'Ile',
    name: 'isoleucine',
    group: 'nonpolar',
    sideChain: '—CH(CH₃)CH₂CH₃',
    note: 'Hydrophobic. The side chain has a second chiral carbon.',
  },
  {
    letter: 'M',
    code: 'Met',
    name: 'methionine',
    group: 'nonpolar',
    sideChain: '—(CH₂)₂SCH₃',
    note: 'A thioether. AUG encodes methionine and is the usual start, so many new chains begin here.',
  },
  {
    letter: 'P',
    code: 'Pro',
    name: 'proline',
    group: 'nonpolar',
    sideChain: '—(CH₂)₃— back to the backbone nitrogen',
    note: 'The side chain closes on the backbone nitrogen, so the nitrogen is not a typical amide hydrogen-bond donor. Proline often bends a chain.',
  },
  {
    letter: 'F',
    code: 'Phe',
    name: 'phenylalanine',
    group: 'aromatic',
    sideChain: '—CH₂–phenyl',
    note: 'A hydrophobic aromatic ring.',
  },
  {
    letter: 'Y',
    code: 'Tyr',
    name: 'tyrosine',
    group: 'aromatic',
    sideChain: '—CH₂–phenol',
    note: 'Aromatic like phenylalanine, but the hydroxyl makes the side chain more polar. It is a common phosphorylation site.',
  },
  {
    letter: 'W',
    code: 'Trp',
    name: 'tryptophan',
    group: 'aromatic',
    sideChain: '—CH₂–indole',
    note: 'The largest side chain. The indole ring is aromatic and fluorescent.',
  },
  {
    letter: 'S',
    code: 'Ser',
    name: 'serine',
    group: 'polar',
    sideChain: '—CH₂OH',
    note: 'A primary alcohol. It hydrogen-bonds and is often phosphorylated.',
  },
  {
    letter: 'T',
    code: 'Thr',
    name: 'threonine',
    group: 'polar',
    sideChain: '—CH(OH)CH₃',
    note: 'A secondary alcohol and a common phosphorylation site.',
  },
  {
    letter: 'C',
    code: 'Cys',
    name: 'cysteine',
    group: 'polar',
    sideChain: '—CH₂SH',
    note: 'The thiol can form a disulfide with another cysteine in an oxidizing compartment such as the endoplasmic reticulum.',
  },
  {
    letter: 'N',
    code: 'Asn',
    name: 'asparagine',
    group: 'polar',
    sideChain: '—CH₂CONH₂',
    note: 'A polar amide. Asn–X–Ser/Thr is a common N-glycosylation motif.',
  },
  {
    letter: 'Q',
    code: 'Gln',
    name: 'glutamine',
    group: 'polar',
    sideChain: '—(CH₂)₂CONH₂',
    note: 'A longer polar amide than asparagine. Uncharged at physiological pH.',
  },
  {
    letter: 'K',
    code: 'Lys',
    name: 'lysine',
    group: 'positive',
    sideChain: '—(CH₂)₄NH₃⁺',
    note: 'The side-chain amino group is positively charged near pH 7 and is often on the protein surface.',
  },
  {
    letter: 'R',
    code: 'Arg',
    name: 'arginine',
    group: 'positive',
    sideChain: '—(CH₂)₃–guanidinium⁺',
    note: 'The guanidinium group stays positive across the physiological pH range.',
  },
  {
    letter: 'H',
    code: 'His',
    name: 'histidine',
    group: 'positive',
    sideChain: '—CH₂–imidazole',
    note: 'The imidazole side chain has a pKa near 6, so histidine is only partly charged at pH 7 and often takes part in catalysis.',
  },
  {
    letter: 'D',
    code: 'Asp',
    name: 'aspartic acid',
    group: 'negative',
    sideChain: '—CH₂COO⁻',
    note: 'A carboxylic acid, called aspartate when it is ionized. Negatively charged at physiological pH.',
  },
  {
    letter: 'E',
    code: 'Glu',
    name: 'glutamic acid',
    group: 'negative',
    sideChain: '—(CH₂)₂COO⁻',
    note: 'A longer carboxylate than aspartate, called glutamate when ionized. Negatively charged at physiological pH.',
  },
];

export function aminoAcidsInGroup(group: SideChainGroup): AminoAcid[] {
  return AMINO_ACID_TABLE.filter((acid) => acid.group === group);
}

/** v = Vmax [S] / (Km + [S]). Km must be positive. */
export function michaelisMenten(substrate: number, vmax: number, km: number): number {
  if (!Number.isFinite(substrate) || !Number.isFinite(vmax) || !Number.isFinite(km)) return Number.NaN;
  if (substrate < 0 || vmax < 0 || km <= 0) return Number.NaN;
  return (vmax * substrate) / (km + substrate);
}

/**
 * Lineweaver–Burk: 1/v = (Km/Vmax)(1/[S]) + 1/Vmax.
 * The y-intercept is 1/Vmax and the x-intercept is −1/Km.
 */
export function lineweaverBurk(invSubstrate: number, vmax: number, km: number): number {
  if (!Number.isFinite(invSubstrate) || !Number.isFinite(vmax) || !Number.isFinite(km)) return Number.NaN;
  if (invSubstrate < 0 || vmax <= 0 || km <= 0) return Number.NaN;
  return (km / vmax) * invSubstrate + 1 / vmax;
}

export interface Macromolecule {
  id: string;
  name: string;
  builtFrom: string;
  linkage: string;
  overview: string;
}

export const MACROMOLECULES: readonly Macromolecule[] = [
  {
    id: 'protein',
    name: 'Proteins',
    builtFrom: '20 amino acids',
    linkage: 'Peptide bonds',
    overview:
      'Amino acids join by peptide bonds into a chain. Hydrogen bonds, hydrophobic packing, and sometimes disulfides fold that chain. Most enzymes are proteins. A few catalysts, including the ribosome’s peptidyl transferase center, are RNA.',
  },
  {
    id: 'nucleic',
    name: 'Nucleic acids',
    builtFrom: 'Nucleotides',
    linkage: 'Phosphodiester bonds',
    overview:
      'DNA stores the sequence. Messenger RNA carries a copy, transfer RNA brings amino acids, and ribosomal RNA is part of the ribosome. The sugar-phosphate backbone is the repeating structure. The bases carry the information.',
  },
  {
    id: 'polysaccharide',
    name: 'Polysaccharides',
    builtFrom: 'Monosaccharides, often glucose',
    linkage: 'Glycosidic bonds',
    overview:
      'Glycogen in animals and starch in plants store glucose with α linkages. Branching gives many ends that can be released at once. Cellulose uses β linkages and is a structural fiber, not a glucose store for humans.',
  },
  {
    id: 'lipid',
    name: 'Lipids',
    builtFrom: 'Not one repeating monomer',
    linkage: 'Ester bonds in fats; no single polymer backbone',
    overview:
      'Triacylglycerols store fatty acids. Phospholipids form bilayers because they have a polar head and hydrophobic tails. Cholesterol sits in animal membranes and is a precursor of bile acids and steroid hormones.',
  },
];

export interface KrebsStep {
  id: string;
  /** 1 through 8, in cycle order. */
  step: number;
  enzyme: string;
  substrates: readonly string[];
  products: readonly string[];
  cofactors: readonly string[];
  nadh: number;
  fadh2: number;
  gtp: number;
  co2: number;
  location: string;
  regulation: string;
  detail: string;
}

/**
 * One turn of the citric acid cycle, starting from acetyl-CoA plus oxaloacetate.
 * Counts are per acetyl-CoA. Pyruvate dehydrogenase is the entry step and is not included.
 */
export const KREBS_STEPS: readonly KrebsStep[] = [
  {
    id: 'citrate-synthase',
    step: 1,
    enzyme: 'Citrate synthase',
    substrates: ['Acetyl-CoA', 'Oxaloacetate', 'H₂O'],
    products: ['Citrate', 'CoA'],
    cofactors: ['None that stay bound; CoA leaves'],
    nadh: 0,
    fadh2: 0,
    gtp: 0,
    co2: 0,
    location: 'Mitochondrial matrix',
    regulation: 'Inhibited by ATP, NADH, succinyl-CoA, and citrate.',
    detail:
      'The methyl carbon of acetyl-CoA attacks oxaloacetate. Hydrolysis of the citryl-CoA intermediate pulls the reaction forward and releases coenzyme A.',
  },
  {
    id: 'aconitase',
    step: 2,
    enzyme: 'Aconitase',
    substrates: ['Citrate'],
    products: ['Isocitrate'],
    cofactors: ['Iron–sulfur cluster'],
    nadh: 0,
    fadh2: 0,
    gtp: 0,
    co2: 0,
    location: 'Mitochondrial matrix',
    regulation: 'Not a main control point of the cycle.',
    detail:
      'Water leaves and returns through cis-aconitate. The hydroxyl moves onto the carbon that came from oxaloacetate, so the next decarboxylation can happen.',
  },
  {
    id: 'idh',
    step: 3,
    enzyme: 'Isocitrate dehydrogenase',
    substrates: ['Isocitrate', 'NAD⁺'],
    products: ['α-Ketoglutarate', 'CO₂', 'NADH'],
    cofactors: ['NAD⁺', 'Mg²⁺ or Mn²⁺'],
    nadh: 1,
    fadh2: 0,
    gtp: 0,
    co2: 1,
    location: 'Mitochondrial matrix',
    regulation: 'Activated by ADP and Ca²⁺. Inhibited by ATP and NADH.',
    detail:
      'The NAD⁺-dependent enzyme oxidizes isocitrate and then loses CO₂. This is the first reduced NADH and the first CO₂ of the turn.',
  },
  {
    id: 'ogdh',
    step: 4,
    enzyme: 'α-Ketoglutarate dehydrogenase',
    substrates: ['α-Ketoglutarate', 'NAD⁺', 'CoA'],
    products: ['Succinyl-CoA', 'CO₂', 'NADH'],
    cofactors: ['Thiamine pyrophosphate', 'Lipoamide', 'CoA', 'FAD', 'NAD⁺'],
    nadh: 1,
    fadh2: 0,
    gtp: 0,
    co2: 1,
    location: 'Mitochondrial matrix',
    regulation: 'Inhibited by succinyl-CoA, NADH, and ATP. Activated by Ca²⁺.',
    detail:
      'A complex with the same cofactor set as pyruvate dehydrogenase. Oxidative decarboxylation makes a thioester and the second NADH and second CO₂.',
  },
  {
    id: 'succinyl-coa-synthetase',
    step: 5,
    enzyme: 'Succinyl-CoA synthetase',
    substrates: ['Succinyl-CoA', 'GDP', 'Pi'],
    products: ['Succinate', 'GTP', 'CoA'],
    cofactors: ['GDP or, in some organisms, ADP', 'Phosphate'],
    nadh: 0,
    fadh2: 0,
    gtp: 1,
    co2: 0,
    location: 'Mitochondrial matrix',
    regulation: 'Not a main control point. The thioester drives substrate-level phosphorylation.',
    detail:
      'In animals the enzyme usually phosphorylates GDP. Nucleoside diphosphate kinase can transfer that phosphate to ADP, making ATP. The cycle yield is counted as one GTP.',
  },
  {
    id: 'sdh',
    step: 6,
    enzyme: 'Succinate dehydrogenase',
    substrates: ['Succinate', 'Ubiquinone'],
    products: ['Fumarate', 'Ubiquinol'],
    cofactors: ['Bound FAD', 'Iron–sulfur clusters'],
    nadh: 0,
    fadh2: 1,
    gtp: 0,
    co2: 0,
    location: 'Inner mitochondrial membrane',
    regulation: 'Inhibited by oxaloacetate. Malonate is the classic competitive inhibitor used in class.',
    detail:
      'This is Complex II. The FAD stays bound and passes electrons to ubiquinone, so the textbook “FADH₂” is a reduced enzyme and then QH₂, not free FADH₂ in the matrix.',
  },
  {
    id: 'fumarase',
    step: 7,
    enzyme: 'Fumarase',
    substrates: ['Fumarate', 'H₂O'],
    products: ['L-Malate'],
    cofactors: ['None'],
    nadh: 0,
    fadh2: 0,
    gtp: 0,
    co2: 0,
    location: 'Mitochondrial matrix',
    regulation: 'Not a main control point.',
    detail: 'Water adds across the double bond in one direction only, producing L-malate rather than a mixture of mirror images.',
  },
  {
    id: 'mdh',
    step: 8,
    enzyme: 'Malate dehydrogenase',
    substrates: ['L-Malate', 'NAD⁺'],
    products: ['Oxaloacetate', 'NADH'],
    cofactors: ['NAD⁺'],
    nadh: 1,
    fadh2: 0,
    gtp: 0,
    co2: 0,
    location: 'Mitochondrial matrix',
    regulation: 'The equilibrium favors malate. Citrate synthase keeps oxaloacetate scarce and pulls the step forward. A high NADH/NAD⁺ ratio slows it.',
    detail: 'Oxaloacetate is regenerated for the next turn. This is the third NADH.',
  },
];

export interface KrebsYield {
  nadh: number;
  fadh2: number;
  gtp: number;
  co2: number;
}

export function krebsTotals(steps: readonly KrebsStep[] = KREBS_STEPS): KrebsYield {
  return steps.reduce(
    (sum, step) => ({
      nadh: sum.nadh + step.nadh,
      fadh2: sum.fadh2 + step.fadh2,
      gtp: sum.gtp + step.gtp,
      co2: sum.co2 + step.co2,
    }),
    { nadh: 0, fadh2: 0, gtp: 0, co2: 0 },
  );
}

export const KREBS_NOTES = {
  yield:
    'Per acetyl-CoA, one turn makes 3 NADH, 1 enzyme-bound FAD counted as FADH₂, 1 GTP, and 2 CO₂.',
  carbons:
    'Those two CO₂ molecules are not the two carbons that just entered from that acetyl-CoA. The new carbons stay in succinate and leave on later turns.',
  pdh:
    'Pyruvate dehydrogenase is the entry, not a ninth step: pyruvate + CoA + NAD⁺ → acetyl-CoA + CO₂ + NADH. That NADH is extra.',
} as const;

export interface PathwayStep {
  id: string;
  enzyme: string;
  bypass: boolean;
  compartment: string;
  conversion: string;
  glycolysis: string;
  /** Counted for two pyruvate → one glucose. */
  atp: number;
  gtp: number;
  nadh: number;
  regulation: string;
}

/** Pyruvate to glucose, including the malate shuttle of the classic cytosolic PEPCK route. */
export const GLUCONEOGENESIS: readonly PathwayStep[] = [
  {
    id: 'pc',
    enzyme: 'Pyruvate carboxylase',
    bypass: true,
    compartment: 'Mitochondrial matrix',
    conversion: 'Pyruvate + CO₂ + ATP → oxaloacetate + ADP + Pi',
    glycolysis: 'With PEPCK, bypasses pyruvate kinase',
    atp: 2,
    gtp: 0,
    nadh: 0,
    regulation:
      'Biotin carries the activated CO₂. Acetyl-CoA turns the enzyme on, a signal that the citric acid cycle has fuel and carbon can go toward glucose.',
  },
  {
    id: 'mdh-mito',
    enzyme: 'Mitochondrial malate dehydrogenase',
    bypass: false,
    compartment: 'Mitochondrial matrix',
    conversion: 'Oxaloacetate + NADH → malate + NAD⁺',
    glycolysis: 'Shuttle, not a glycolytic step',
    atp: 0,
    gtp: 0,
    nadh: 0,
    regulation:
      'Malate can leave the mitochondrion. The NADH used here reappears in the cytosol, which is where gluconeogenesis needs it. This pair is transport, not an extra NADH cost.',
  },
  {
    id: 'mdh-cyto',
    enzyme: 'Cytosolic malate dehydrogenase',
    bypass: false,
    compartment: 'Cytosol',
    conversion: 'Malate + NAD⁺ → oxaloacetate + NADH',
    glycolysis: 'Shuttle, not a glycolytic step',
    atp: 0,
    gtp: 0,
    nadh: 0,
    regulation:
      'Reoxidizing malate supplies cytosolic NADH. Humans also have mitochondrial PEPCK, which can export phosphoenolpyruvate and then needs another source of cytosolic NADH, such as lactate.',
  },
  {
    id: 'pepck',
    enzyme: 'Phosphoenolpyruvate carboxykinase',
    bypass: true,
    compartment: 'Cytosol in the classic route',
    conversion: 'Oxaloacetate + GTP → phosphoenolpyruvate + CO₂ + GDP',
    glycolysis: 'With pyruvate carboxylase, bypasses pyruvate kinase',
    atp: 0,
    gtp: 2,
    nadh: 0,
    regulation:
      'The CO₂ added by pyruvate carboxylase comes off again. Transcription of this enzyme rises when glucagon is high and the liver is making glucose.',
  },
  {
    id: 'enolase',
    enzyme: 'Enolase',
    bypass: false,
    compartment: 'Cytosol',
    conversion: 'Phosphoenolpyruvate + H₂O → 2-phosphoglycerate',
    glycolysis: 'Same enzyme, toward glucose',
    atp: 0,
    gtp: 0,
    nadh: 0,
    regulation: 'A reversible step shared with glycolysis. In glycolysis it removes water from 2-phosphoglycerate.',
  },
  {
    id: 'pgm',
    enzyme: 'Phosphoglycerate mutase',
    bypass: false,
    compartment: 'Cytosol',
    conversion: '2-Phosphoglycerate → 3-phosphoglycerate',
    glycolysis: 'Same enzyme, toward glucose',
    atp: 0,
    gtp: 0,
    nadh: 0,
    regulation: 'Shared and reversible. The phosphate moves from carbon 2 to carbon 3.',
  },
  {
    id: 'pgk',
    enzyme: 'Phosphoglycerate kinase',
    bypass: false,
    compartment: 'Cytosol',
    conversion: '3-Phosphoglycerate + ATP → 1,3-bisphosphoglycerate + ADP',
    glycolysis: 'Same enzyme, reverse of the ATP-forming step',
    atp: 2,
    gtp: 0,
    nadh: 0,
    regulation: 'Shared. Run toward glucose, it spends one ATP per triose, so two ATP per glucose.',
  },
  {
    id: 'gapdh',
    enzyme: 'Glyceraldehyde-3-phosphate dehydrogenase',
    bypass: false,
    compartment: 'Cytosol',
    conversion: '1,3-Bisphosphoglycerate + NADH + H⁺ → glyceraldehyde 3-phosphate + NAD⁺ + Pi',
    glycolysis: 'Same enzyme, reverse of the NADH-forming step',
    atp: 0,
    gtp: 0,
    nadh: 2,
    regulation: 'Shared. Run toward glucose, it spends one NADH per triose, so two NADH per glucose.',
  },
  {
    id: 'tpi',
    enzyme: 'Triose-phosphate isomerase',
    bypass: false,
    compartment: 'Cytosol',
    conversion: 'Glyceraldehyde 3-phosphate → dihydroxyacetone phosphate',
    glycolysis: 'Same enzyme, toward glucose',
    atp: 0,
    gtp: 0,
    nadh: 0,
    regulation: 'One of the two triose phosphates is isomerized. Aldolase needs both.',
  },
  {
    id: 'aldolase',
    enzyme: 'Aldolase',
    bypass: false,
    compartment: 'Cytosol',
    conversion: 'Dihydroxyacetone phosphate + glyceraldehyde 3-phosphate → fructose 1,6-bisphosphate',
    glycolysis: 'Same enzyme, toward glucose',
    atp: 0,
    gtp: 0,
    nadh: 0,
    regulation: 'Shared and reversible. Aldolase is not one of the four bypass enzymes.',
  },
  {
    id: 'fbpase',
    enzyme: 'Fructose-1,6-bisphosphatase',
    bypass: true,
    compartment: 'Cytosol',
    conversion: 'Fructose 1,6-bisphosphate + H₂O → fructose 6-phosphate + Pi',
    glycolysis: 'Bypasses phosphofructokinase-1',
    atp: 0,
    gtp: 0,
    nadh: 0,
    regulation:
      'Inhibited by fructose 2,6-bisphosphate and by AMP. Activated by citrate. Glucagon lowers fructose 2,6-bisphosphate in liver, which slows phosphofructokinase-1 and lets this phosphatase work.',
  },
  {
    id: 'pgi',
    enzyme: 'Phosphoglucose isomerase',
    bypass: false,
    compartment: 'Cytosol',
    conversion: 'Fructose 6-phosphate → glucose 6-phosphate',
    glycolysis: 'Same enzyme, toward glucose',
    atp: 0,
    gtp: 0,
    nadh: 0,
    regulation: 'Shared and reversible.',
  },
  {
    id: 'g6pase',
    enzyme: 'Glucose-6-phosphatase',
    bypass: true,
    compartment: 'Endoplasmic reticulum of liver and kidney',
    conversion: 'Glucose 6-phosphate + H₂O → glucose + Pi',
    glycolysis: 'Bypasses hexokinase and glucokinase',
    atp: 0,
    gtp: 0,
    nadh: 0,
    regulation:
      'Muscle and brain lack this enzyme, so they keep glucose 6-phosphate for their own use. Liver and kidney can release free glucose into the blood.',
  },
];

export interface EnergyCost {
  atp: number;
  gtp: number;
  nadh: number;
}

/** Stoichiometry for two pyruvate → one glucose: 4 ATP + 2 GTP + 2 NADH. */
export const GLUCONEOGENESIS_COST: EnergyCost = { atp: 4, gtp: 2, nadh: 2 };

export function pathwayEnergy(steps: readonly PathwayStep[] = GLUCONEOGENESIS): EnergyCost {
  return steps.reduce(
    (sum, step) => ({
      atp: sum.atp + step.atp,
      gtp: sum.gtp + step.gtp,
      nadh: sum.nadh + step.nadh,
    }),
    { atp: 0, gtp: 0, nadh: 0 },
  );
}

export interface CompareRow {
  glycolysis: string;
  gluconeogenesis: string;
  kind: 'bypass' | 'shared';
  note: string;
}

export const GLYCOLYSIS_COMPARE: readonly CompareRow[] = [
  {
    glycolysis: 'Hexokinase or glucokinase',
    gluconeogenesis: 'Glucose-6-phosphatase',
    kind: 'bypass',
    note: 'Glycolysis spends ATP to trap glucose. Gluconeogenesis hydrolyzes the phosphate so glucose can leave the cell.',
  },
  {
    glycolysis: 'Phosphofructokinase-1',
    gluconeogenesis: 'Fructose-1,6-bisphosphatase',
    kind: 'bypass',
    note: 'The main reciprocal switch. Fructose 2,6-bisphosphate turns the kinase up and the phosphatase down.',
  },
  {
    glycolysis: 'Pyruvate kinase',
    gluconeogenesis: 'Pyruvate carboxylase and PEPCK',
    kind: 'bypass',
    note: 'Two enzymes replace one irreversible kinase. The cost is one ATP and one GTP per pyruvate.',
  },
  {
    glycolysis: 'The other seven enzymes',
    gluconeogenesis: 'The same seven enzymes, toward glucose',
    kind: 'shared',
    note: 'Phosphoglucose isomerase, aldolase, triose-phosphate isomerase, GAPDH, phosphoglycerate kinase, phosphoglycerate mutase, and enolase are near equilibrium and serve both pathways.',
  },
];

export const CORI_CYCLE = {
  muscleAtpGain: 2,
  liverNtpCost: 6,
  netNtpCost: 4,
  muscle:
    'Working muscle converts glucose to two lactate and nets 2 ATP. Lactate dehydrogenase regenerates NAD⁺ inside the muscle, so those reducing equivalents are not exported.',
  liver:
    'Liver lactate dehydrogenase turns two lactate into two pyruvate and makes the two NADH that gluconeogenesis consumes. Rebuilding one glucose still spends 4 ATP and 2 GTP.',
  net: 'Six high-energy phosphates are spent in the liver and two ATP are gained in the muscle. The organism pays a net 4 NTP.',
} as const;
