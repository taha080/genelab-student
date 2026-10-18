/**
 * Classroom metabolism lessons. Counts and ΔG°′ values follow the usual
 * textbook figures (Lehninger-style). They are for study, not a lab protocol.
 */

export const METABOLISM_LESSON_IDS = ['intro', 'atp', 'glycolysis', 'glycogenolysis', 'pentose', 'oxphos'] as const;
export type MetabolismLessonId = (typeof METABOLISM_LESSON_IDS)[number];

export interface LessonQuiz {
  prompt: string;
  choices: readonly [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface PathStep {
  id: string;
  step: number;
  title: string;
  enzyme: string;
  phase: string;
  conversion: string;
  energy: string;
  regulation: string;
  detail: string;
  atp?: number;
  nadh?: number;
  nadph?: number;
  protons?: number;
}

export interface MapLink {
  id: string;
  title: string;
  hash: string;
  blurb: string;
  place: string;
}

export interface MetabolismLesson {
  id: MetabolismLessonId;
  title: string;
  kicker: string;
  summary: string;
  steps: readonly PathStep[];
  quiz: readonly LessonQuiz[];
}

/** Standard free energy of ATP hydrolysis to ADP and phosphate, kJ/mol. */
export const ATP_TO_ADP_KJ = -30.5;

export interface PhosphateCompound {
  id: string;
  name: string;
  /** ΔG°′ of hydrolysis, kJ/mol. More negative means a better phosphoryl donor. */
  deltaG: number;
  kind: 'donor' | 'atp' | 'acceptor';
  note: string;
}

export const PHOSPHATE_COMPOUNDS: readonly PhosphateCompound[] = [
  {
    id: 'pep',
    name: 'Phosphoenolpyruvate',
    deltaG: -61.9,
    kind: 'donor',
    note: 'The enol phosphate is the strongest common donor. Pyruvate kinase uses it to make ATP.',
  },
  {
    id: 'bpg',
    name: '1,3-Bisphosphoglycerate',
    deltaG: -49.4,
    kind: 'donor',
    note: 'An acyl phosphate. Phosphoglycerate kinase transfers its phosphoryl group to ADP.',
  },
  {
    id: 'pcr',
    name: 'Phosphocreatine',
    deltaG: -43.1,
    kind: 'donor',
    note: 'A muscle buffer. Creatine kinase can refill ATP when demand jumps.',
  },
  {
    id: 'atp',
    name: 'ATP → ADP + Pi',
    deltaG: ATP_TO_ADP_KJ,
    kind: 'atp',
    note: 'The reference hydrolysis. Donors above ATP can phosphorylate ADP. Acceptors below cannot.',
  },
  {
    id: 'g1p',
    name: 'Glucose 1-phosphate',
    deltaG: -20.9,
    kind: 'acceptor',
    note: 'A phosphate ester. Its hydrolysis is less favorable than ATP, so it does not phosphorylate ADP.',
  },
  {
    id: 'g6p',
    name: 'Glucose 6-phosphate',
    deltaG: -13.8,
    kind: 'acceptor',
    note: 'Made by spending ATP at hexokinase. The ester cannot push the phosphate back onto ADP.',
  },
  {
    id: 'glycerol3p',
    name: 'Glycerol 3-phosphate',
    deltaG: -9.2,
    kind: 'acceptor',
    note: 'A low-energy phosphate ester, far below ATP.',
  },
];

/** A compound phosphorylates ADP when its hydrolysis is more exergonic than ATP hydrolysis. */
export function canPhosphorylateAdp(deltaG: number, atp = ATP_TO_ADP_KJ): boolean {
  return Number.isFinite(deltaG) && Number.isFinite(atp) && deltaG < atp;
}

/** Couple a positive phosphorylation with ATP hydrolysis. Values are ΔG°′ in kJ/mol. */
export function coupledFreeEnergy(endergonic: number, hydrolysis = ATP_TO_ADP_KJ): number {
  if (!Number.isFinite(endergonic) || !Number.isFinite(hydrolysis)) return Number.NaN;
  return endergonic + hydrolysis;
}

export const MAP_LINKS: readonly MapLink[] = [
  { id: 'glycogenolysis', title: 'Glycogenolysis', hash: 'metabolism/glycogenolysis', blurb: 'Liver and muscle release glucose units from glycogen.', place: 'store' },
  { id: 'glycolysis', title: 'Glycolysis', hash: 'metabolism/glycolysis', blurb: 'Glucose to two pyruvate in the cytosol.', place: 'spine' },
  { id: 'pentose', title: 'Pentose phosphate', hash: 'metabolism/pentose', blurb: 'NADPH and ribose 5-phosphate from glucose 6-phosphate.', place: 'side' },
  { id: 'atp', title: 'ATP', hash: 'metabolism/atp', blurb: 'Phosphoryl transfer, coupling, and substrate-level phosphorylation.', place: 'currency' },
  { id: 'krebs', title: 'Citric acid cycle', hash: 'biochem/krebs', blurb: 'Acetyl-CoA to 3 NADH, 1 FADH₂, 1 GTP, and 2 CO₂.', place: 'cycle' },
  { id: 'oxphos', title: 'Oxidative phosphorylation', hash: 'metabolism/oxphos', blurb: 'The respiratory chain and ATP synthase.', place: 'chain' },
  { id: 'glucose', title: 'Gluconeogenesis', hash: 'biochem/glucose', blurb: 'Two pyruvate back to glucose: 4 ATP, 2 GTP, and 2 NADH.', place: 'rebuild' },
];

export const INTRO_NOTES = {
  catabolism: 'Catabolism breaks fuels down. It is oxidative and convergent: many molecules become acetyl-CoA, then the citric acid cycle, then the respiratory chain.',
  anabolism: 'Anabolism builds molecules. It is reductive and divergent. Biosynthesis usually spends ATP and uses NADPH, not NADH, as the electron donor.',
  separate: 'The two directions are not the reverse of one enzyme set. The irreversible steps use different enzymes, so the cell can turn one direction off while the other runs.',
  charge: 'Energy charge is (ATP + ½ ADP) / (ATP + ADP + AMP). A high charge slows ATP-making pathways. Control sits on the committed step, the first irreversible reaction unique to that path.',
} as const;

export const GLYCOLYSIS: readonly PathStep[] = [
  {
    id: 'hk',
    step: 1,
    title: 'Trap glucose',
    enzyme: 'Hexokinase (glucokinase in liver)',
    phase: 'Investment',
    conversion: 'Glucose + ATP → glucose 6-phosphate + ADP',
    energy: 'Spends 1 ATP per glucose.',
    regulation: 'Muscle hexokinase has a low Km and is inhibited by glucose 6-phosphate. Liver glucokinase has a high Km, is not inhibited by glucose 6-phosphate, and is held in the nucleus when fructose 6-phosphate is high.',
    detail: 'Phosphorylation keeps glucose in the cell. This step is irreversible in the cell. Gluconeogenesis bypasses it with glucose-6-phosphatase, which muscle and brain lack.',
    atp: -1,
  },
  {
    id: 'pgi',
    step: 2,
    title: 'Isomerize',
    enzyme: 'Phosphoglucose isomerase',
    phase: 'Investment',
    conversion: 'Glucose 6-phosphate ↔ fructose 6-phosphate',
    energy: 'Near equilibrium. No ATP.',
    regulation: 'Not a control point. The same enzyme serves gluconeogenesis.',
    detail: 'An aldose becomes a ketose so the next phosphorylation can sit on carbon 1.',
  },
  {
    id: 'pfk',
    step: 3,
    title: 'Committed step',
    enzyme: 'Phosphofructokinase-1',
    phase: 'Investment',
    conversion: 'Fructose 6-phosphate + ATP → fructose 1,6-bisphosphate + ADP',
    energy: 'Spends the second ATP per glucose.',
    regulation: 'Inhibited by ATP and citrate. Activated by AMP and, in liver, by fructose 2,6-bisphosphate. That signal is the main reciprocal switch with fructose-1,6-bisphosphatase.',
    detail: 'This is the first step that belongs only to glycolysis, so it is the committed step. It is irreversible.',
    atp: -1,
  },
  {
    id: 'aldolase',
    step: 4,
    title: 'Split the hexose',
    enzyme: 'Aldolase',
    phase: 'Investment',
    conversion: 'Fructose 1,6-bisphosphate ↔ dihydroxyacetone phosphate + glyceraldehyde 3-phosphate',
    energy: 'No ATP. The cleavage is pulled forward by the next steps.',
    regulation: 'Not a main control point. Shared with gluconeogenesis.',
    detail: 'One hexose becomes two trioses. Only glyceraldehyde 3-phosphate continues directly.',
  },
  {
    id: 'tpi',
    step: 5,
    title: 'Second triose',
    enzyme: 'Triose-phosphate isomerase',
    phase: 'Investment',
    conversion: 'Dihydroxyacetone phosphate ↔ glyceraldehyde 3-phosphate',
    energy: 'No ATP. From here every count is for two trioses, one glucose.',
    regulation: 'Near equilibrium and shared with gluconeogenesis.',
    detail: 'A very fast enzyme. Both halves of glucose are now glyceraldehyde 3-phosphate.',
  },
  {
    id: 'gapdh',
    step: 6,
    title: 'Oxidize and phosphorylate',
    enzyme: 'Glyceraldehyde-3-phosphate dehydrogenase',
    phase: 'Payoff',
    conversion: 'Glyceraldehyde 3-phosphate + NAD⁺ + Pi → 1,3-bisphosphoglycerate + NADH + H⁺',
    energy: 'Makes 2 NADH per glucose. The new acyl phosphate is a high-energy donor.',
    regulation: 'A high NADH/NAD⁺ ratio slows it. Arsenate can replace phosphate in the classroom example and then skip ATP formation at the next step.',
    detail: 'Oxidation is joined to formation of 1,3-bisphosphoglycerate. This NADH is cytosolic. Shuttle choice decides how many ATP it is worth later.',
    nadh: 2,
  },
  {
    id: 'pgk',
    step: 7,
    title: 'First ATP payoff',
    enzyme: 'Phosphoglycerate kinase',
    phase: 'Payoff',
    conversion: '1,3-Bisphosphoglycerate + ADP → 3-phosphoglycerate + ATP',
    energy: 'Substrate-level phosphorylation: 2 ATP per glucose.',
    regulation: 'Near equilibrium. Shared with gluconeogenesis, where it spends ATP.',
    detail: 'The acyl phosphate phosphorylates ADP directly. No respiratory chain is involved.',
    atp: 2,
  },
  {
    id: 'pgm',
    step: 8,
    title: 'Move the phosphate',
    enzyme: 'Phosphoglycerate mutase',
    phase: 'Payoff',
    conversion: '3-Phosphoglycerate ↔ 2-phosphoglycerate',
    energy: 'No ATP.',
    regulation: 'Not a control point. A phosphorylated histidine and a bisphosphate intermediate move the phosphate from carbon 3 to carbon 2.',
    detail: 'The phosphate has to sit next to the future enol so the next dehydration can make phosphoenolpyruvate.',
  },
  {
    id: 'enolase',
    step: 9,
    title: 'Make the enol',
    enzyme: 'Enolase',
    phase: 'Payoff',
    conversion: '2-Phosphoglycerate ↔ phosphoenolpyruvate + H₂O',
    energy: 'No ATP. The dehydration creates the highest-energy phosphate in the path.',
    regulation: 'Fluoride inhibits enolase in the classic classroom demonstration. Not a physiological control point.',
    detail: 'Water leaves and the phosphate becomes an enol phosphate, ready for pyruvate kinase.',
  },
  {
    id: 'pk',
    step: 10,
    title: 'Second ATP payoff',
    enzyme: 'Pyruvate kinase',
    phase: 'Payoff',
    conversion: 'Phosphoenolpyruvate + ADP → pyruvate + ATP',
    energy: 'Substrate-level phosphorylation: 2 ATP per glucose.',
    regulation: 'Feed-forward activation by fructose 1,6-bisphosphate. Inhibited by ATP and alanine. In liver, glucagon leads to phosphorylation that inactivates this isozyme. Muscle pyruvate kinase is not switched off that way.',
    detail: 'Irreversible in the cell. Gluconeogenesis bypasses it with pyruvate carboxylase and PEPCK. The enol tautomerizes to pyruvate.',
    atp: 2,
  },
];

export function glycolysisYield(steps: readonly PathStep[] = GLYCOLYSIS): { atp: number; nadh: number; pyruvate: number } {
  return {
    atp: steps.reduce((sum, step) => sum + (step.atp ?? 0), 0),
    nadh: steps.reduce((sum, step) => sum + (step.nadh ?? 0), 0),
    pyruvate: 2,
  };
}

export const GLYCOLYSIS_NET =
  'Glucose + 2 ADP + 2 Pi + 2 NAD⁺ → 2 pyruvate + 2 ATP + 2 NADH + 2 H⁺ + 2 H₂O.';

export const PYRUVATE_FATES = [
  {
    id: 'pdh',
    title: 'Acetyl-CoA',
    when: 'Aerobic tissues',
    detail: 'Pyruvate dehydrogenase, in the mitochondrial matrix: pyruvate + CoA + NAD⁺ → acetyl-CoA + CO₂ + NADH. That NADH is extra, on top of the citric acid cycle.',
  },
  {
    id: 'ldh',
    title: 'Lactate',
    when: 'When NAD⁺ must be regenerated without oxygen',
    detail: 'Lactate dehydrogenase: pyruvate + NADH + H⁺ → lactate + NAD⁺. Red blood cells always do this. Working muscle does it when the shuttle cannot keep up. The NADH from glycolysis is consumed, so the anaerobic yield is only the 2 ATP.',
  },
  {
    id: 'pc',
    title: 'Oxaloacetate',
    when: 'Liver and kidney, making glucose',
    detail: 'Pyruvate carboxylase uses ATP and biotin to make oxaloacetate. That is the first bypass of pyruvate kinase, not a fate that yields energy.',
  },
  {
    id: 'alt',
    title: 'Alanine',
    when: 'Moving nitrogen and carbon to the liver',
    detail: 'Alanine aminotransferase transfers the amino group of glutamate to pyruvate. Alanine carries that carbon to the liver, which can rebuild glucose.',
  },
] as const;

export const GLYCOGENOLYSIS: readonly PathStep[] = [
  {
    id: 'phosphorylase',
    step: 1,
    title: 'Phosphorolysis',
    enzyme: 'Glycogen phosphorylase',
    phase: 'Chain shortening',
    conversion: '(Glucose)n + Pi → (glucose)n−1 + glucose 1-phosphate',
    energy: 'Uses inorganic phosphate, so the product is already phosphorylated. No ATP is spent.',
    regulation: 'The active form is phosphorylase a, phosphorylated by phosphorylase kinase. Glucagon in liver, and epinephrine in muscle and liver, raise cAMP and turn that kinase on. Muscle phosphorylase b is also activated by AMP and inhibited by ATP and glucose 6-phosphate. Ca²⁺ activates phosphorylase kinase during contraction.',
    detail: 'Pyridoxal phosphate is the cofactor. The enzyme uses α-1,4 linkages and stops four residues before a branch. Most glucose units leave as glucose 1-phosphate, not free glucose.',
  },
  {
    id: 'transferase',
    step: 2,
    title: 'Move the branch stub',
    enzyme: 'Debranching enzyme, transferase activity',
    phase: 'Debranching',
    conversion: 'Moves the outer three of the last four glucoses to another chain as an α-1,4 link',
    energy: 'No ATP.',
    regulation: 'Not the hormonal control point. Phosphorylase is.',
    detail: 'One protein in eukaryotes carries both debranching activities. The transfer exposes the single glucose still attached by the α-1,6 bond.',
  },
  {
    id: 'glucosidase',
    step: 3,
    title: 'Release the branch glucose',
    enzyme: 'Debranching enzyme, α-1,6-glucosidase',
    phase: 'Debranching',
    conversion: 'Hydrolyzes the α-1,6 glucose → free glucose',
    energy: 'This one residue is free glucose, not glucose 1-phosphate. It must be phosphorylated by hexokinase if it is to enter glycolysis.',
    regulation: 'Not the main control point.',
    detail: 'About one residue in twelve is released as free glucose. The rest were released as glucose 1-phosphate by phosphorylase.',
  },
  {
    id: 'pgm',
    step: 4,
    title: 'Glucose 1-phosphate to glucose 6-phosphate',
    enzyme: 'Phosphoglucomutase',
    phase: 'Entry',
    conversion: 'Glucose 1-phosphate ↔ glucose 6-phosphate',
    energy: 'Near equilibrium. Glucose 1,6-bisphosphate is the cofactor that primes the enzyme.',
    regulation: 'Not a control point.',
    detail: 'Glucose 6-phosphate is the shared sugar of glycolysis, the pentose phosphate pathway, and, in liver, release of blood glucose.',
  },
  {
    id: 'g6pase',
    step: 5,
    title: 'Liver can release glucose',
    enzyme: 'Glucose-6-phosphatase (liver and kidney)',
    phase: 'Tissue fate',
    conversion: 'Glucose 6-phosphate + H₂O → glucose + Pi',
    energy: 'Muscle has no glucose-6-phosphatase. Its glucose 6-phosphate enters glycolysis and nets 3 ATP per glucosyl unit, because hexokinase was skipped.',
    regulation: 'Present in liver and kidney endoplasmic reticulum. Muscle and brain keep the phosphate and use the sugar themselves. Insulin favors glycogen synthesis. Glucagon and epinephrine favor breakdown.',
    detail: 'Liver glycogen buffers blood glucose. Muscle glycogen fuels that muscle. Glucagon acts on liver, not on skeletal muscle, which does not respond to glucagon.',
  },
];

export const GLYCOGEN_TISSUES = [
  {
    tissue: 'Liver',
    purpose: 'Keep blood glucose steady between meals.',
    hormone: 'Glucagon and epinephrine promote phosphorylase a. Insulin promotes synthase.',
    product: 'Free glucose, because glucose-6-phosphatase is present.',
  },
  {
    tissue: 'Skeletal muscle',
    purpose: 'Fuel contraction in that fiber.',
    hormone: 'Epinephrine and Ca²⁺ from contraction. AMP activates phosphorylase b. Glucagon does not act here.',
    product: 'Glucose 6-phosphate for glycolysis. No free glucose is released to the blood.',
  },
] as const;

/** Anaerobic glycolysis from a glycogen glucosyl unit nets 3 ATP, because hexokinase is skipped. */
export const GLYCOGEN_GLYCOLYSIS_ATP = 3;

export const PENTOSE_PATHWAY: readonly PathStep[] = [
  {
    id: 'g6pd',
    step: 1,
    title: 'First NADPH',
    enzyme: 'Glucose-6-phosphate dehydrogenase',
    phase: 'Oxidative',
    conversion: 'Glucose 6-phosphate + NADP⁺ → 6-phosphoglucono-δ-lactone + NADPH',
    energy: '1 NADPH. This is the committed step.',
    regulation: 'Inhibited by NADPH. When the NADPH/NADP⁺ ratio is high, the oxidative phase slows. The enzyme is specific for NADP⁺, not NAD⁺.',
    detail: 'The reaction is irreversible in the cell. In red cells, the NADPH keeps glutathione reduced. Low activity, often from G6PD variants, leaves those cells open to oxidative damage.',
    nadph: 1,
  },
  {
    id: 'lactonase',
    step: 2,
    title: 'Open the lactone',
    enzyme: 'Gluconolactonase',
    phase: 'Oxidative',
    conversion: '6-Phosphoglucono-δ-lactone + H₂O → 6-phosphogluconate',
    energy: 'No NADPH.',
    regulation: 'Not a control point. The lactone also hydrolyzes on its own, more slowly.',
    detail: 'The ring opens to the sugar acid phosphate.',
  },
  {
    id: 'pgd',
    step: 3,
    title: 'Second NADPH and CO₂',
    enzyme: '6-Phosphogluconate dehydrogenase',
    phase: 'Oxidative',
    conversion: '6-Phosphogluconate + NADP⁺ → ribulose 5-phosphate + CO₂ + NADPH',
    energy: '1 NADPH. Oxidative phase total: 2 NADPH and 1 CO₂ per glucose 6-phosphate.',
    regulation: 'Also slowed when NADPH is abundant.',
    detail: 'An oxidative decarboxylation. The product is a pentose, ribulose 5-phosphate.',
    nadph: 1,
  },
  {
    id: 'isomerase',
    step: 4,
    title: 'Two pentoses',
    enzyme: 'Ribulose-5-phosphate isomerase and epimerase',
    phase: 'Non-oxidative',
    conversion: 'Ribulose 5-phosphate ↔ ribose 5-phosphate, and ↔ xylulose 5-phosphate',
    energy: 'Reversible. No NADPH.',
    regulation: 'The mix follows what the cell is using. Ribose 5-phosphate goes into nucleotides.',
    detail: 'Isomerase makes the aldose ribose 5-phosphate. Epimerase makes xylulose 5-phosphate, the ketose donor for transketolase.',
  },
  {
    id: 'tk1',
    step: 5,
    title: 'Two-carbon transfer',
    enzyme: 'Transketolase',
    phase: 'Non-oxidative',
    conversion: 'Xylulose 5-phosphate + ribose 5-phosphate ↔ sedoheptulose 7-phosphate + glyceraldehyde 3-phosphate',
    energy: 'Reversible carbon rearrangement. No NADPH.',
    regulation: 'Thiamine pyrophosphate is the cofactor. Not a committed step.',
    detail: 'Transketolase moves a two-carbon unit. The products are a seven-carbon sugar and a glycolytic triose.',
  },
  {
    id: 'ta',
    step: 6,
    title: 'Three-carbon transfer',
    enzyme: 'Transaldolase',
    phase: 'Non-oxidative',
    conversion: 'Sedoheptulose 7-phosphate + glyceraldehyde 3-phosphate ↔ fructose 6-phosphate + erythrose 4-phosphate',
    energy: 'Reversible. No NADPH.',
    regulation: 'A lysine Schiff base carries the three-carbon unit. No thiamine is required.',
    detail: 'One product, fructose 6-phosphate, can return to glycolysis or to glucose 6-phosphate.',
  },
  {
    id: 'tk2',
    step: 7,
    title: 'Back to glycolysis',
    enzyme: 'Transketolase',
    phase: 'Non-oxidative',
    conversion: 'Xylulose 5-phosphate + erythrose 4-phosphate ↔ fructose 6-phosphate + glyceraldehyde 3-phosphate',
    energy: 'Reversible. No NADPH.',
    regulation: 'Again uses thiamine pyrophosphate.',
    detail: 'A second transketolase step finishes the rearrangement. Fructose 6-phosphate and glyceraldehyde 3-phosphate are glycolytic intermediates.',
  },
];

/** One pass of the oxidative phase, per glucose 6-phosphate. */
export function pentoseOxidativeYield(steps: readonly PathStep[] = PENTOSE_PATHWAY): { nadph: number; co2: number } {
  const oxidative = steps.filter((step) => step.phase === 'Oxidative');
  return {
    nadph: oxidative.reduce((sum, step) => sum + (step.nadph ?? 0), 0),
    co2: 1,
  };
}

/** When pentoses are recycled and the cell wants NADPH, three glucose 6-phosphates give this balance. */
export const PENTOSE_RECYCLE = {
  glucose6p: 3,
  nadph: 6,
  co2: 3,
  fructose6p: 2,
  glyceraldehyde3p: 1,
} as const;

export const OXPHOS: readonly PathStep[] = [
  {
    id: 'complex-i',
    step: 1,
    title: 'NADH enters',
    enzyme: 'Complex I, NADH dehydrogenase',
    phase: 'From NADH',
    conversion: 'NADH + H⁺ + Q → NAD⁺ + QH₂',
    energy: 'Pumps 4 H⁺ per 2 electrons. FMN and iron–sulfur clusters carry the electrons.',
    regulation: 'Rotenone, piericidin A, and amytal block electron exit from Complex I. A high proton gradient slows the chain (respiratory control).',
    detail: 'Matrix NADH from the citric acid cycle and from pyruvate dehydrogenase starts here. Cytosolic NADH does not cross the inner membrane. It uses a shuttle.',
    protons: 4,
  },
  {
    id: 'complex-ii',
    step: 2,
    title: 'Succinate enters later',
    enzyme: 'Complex II, succinate dehydrogenase',
    phase: 'From succinate',
    conversion: 'Succinate + Q → fumarate + QH₂',
    energy: 'Pumps no protons. Bound FAD accepts the electrons and passes them to ubiquinone.',
    regulation: 'Malonate competes with succinate. This is the same enzyme as step 6 of the citric acid cycle.',
    detail: 'Because Complex I is skipped, electrons from succinate drive fewer protons. That is why the P/O ratio is about 1.5 rather than about 2.5.',
    protons: 0,
  },
  {
    id: 'complex-iii',
    step: 3,
    title: 'Q cycle',
    enzyme: 'Complex III, cytochrome bc₁',
    phase: 'Shared',
    conversion: 'QH₂ + 2 cytochrome c (Fe³⁺) → Q + 2 cytochrome c (Fe²⁺)',
    energy: 'Pumps 4 H⁺ per QH₂. The Q cycle routes the two electrons so that proton release is on the intermembrane side.',
    regulation: 'Antimycin A blocks electron flow after cytochrome b.',
    detail: 'Ubiquinol from either Complex I or Complex II is the substrate. Cytochrome c then carries one electron at a time along the outer face of the inner membrane.',
    protons: 4,
  },
  {
    id: 'complex-iv',
    step: 4,
    title: 'Oxygen accepts the electrons',
    enzyme: 'Complex IV, cytochrome c oxidase',
    phase: 'Shared',
    conversion: '4 cytochrome c (Fe²⁺) + O₂ + 4 H⁺ → 4 cytochrome c (Fe³⁺) + 2 H₂O',
    energy: 'Pumps 2 H⁺ per 2 electrons (4 H⁺ per O₂) and also consumes matrix protons to make water.',
    regulation: 'Cyanide, carbon monoxide, and azide bind the heme a₃–copper center and stop the reduction of oxygen.',
    detail: 'Oxygen is the terminal acceptor. Without it the chain backs up, NADH cannot be oxidized, and aerobic ATP synthesis stops.',
    protons: 2,
  },
  {
    id: 'gradient',
    step: 5,
    title: 'The proton-motive force',
    enzyme: 'Inner mitochondrial membrane',
    phase: 'Gradient',
    conversion: 'Protons are higher outside the matrix than inside',
    energy: 'About 10 H⁺ are translocated per mitochondrial NADH, and about 6 per succinate, counting the pumped protons above.',
    regulation: 'The gradient is respiratory control: ADP lets protons back through ATP synthase, and electron transport speeds up. No ADP, and a tight mitochondrion slows the chain.',
    detail: 'The force is both a concentration difference and a membrane potential. The inner membrane must stay closed to protons except at the planned routes.',
  },
  {
    id: 'synthase',
    step: 6,
    title: 'ATP synthase turns',
    enzyme: 'ATP synthase, Complex V',
    phase: 'ATP',
    conversion: 'ADP + Pi → ATP, as protons flow back into the matrix',
    energy: 'Classroom P/O ratios are about 2.5 ATP per NADH and about 1.5 ATP per succinate or enzyme-bound FADH₂. Older tables used 3 and 2.',
    regulation: 'Oligomycin blocks the proton channel of F₀, so both ATP synthesis and, in a coupled mitochondrion, oxygen use stop. An uncoupler lets protons leak, restores oxygen use, and still makes no ATP.',
    detail: 'F₀ is the membrane rotor. F₁, projecting into the matrix, has the catalytic β subunits. Rotation of the γ stalk changes those sites through loose, tight, and open. Moving ATP and phosphate across the inner membrane costs part of the gradient, which is why the yield is not an integer 4.',
  },
];

export const PO_RATIO = { nadh: 2.5, succinate: 1.5 } as const;

/** Pumped protons for the NADH route (I + III + IV) or the succinate route (III + IV). */
export function protonsPumped(entry: 'nadh' | 'succinate'): number {
  const ids = entry === 'nadh' ? ['complex-i', 'complex-iii', 'complex-iv'] : ['complex-iii', 'complex-iv'];
  return OXPHOS.filter((step) => ids.includes(step.id)).reduce((sum, step) => sum + (step.protons ?? 0), 0);
}

export const OXPHOS_AGENTS = [
  { id: 'rotenone', name: 'Rotenone', target: 'Complex I', kind: 'inhibitor' as const, effect: 'Blocks electron transfer from Complex I to ubiquinone. NADH oxidation stops. Succinate can still reduce Q.' },
  { id: 'malonate', name: 'Malonate', target: 'Complex II', kind: 'inhibitor' as const, effect: 'Competes with succinate. It does not stop NADH oxidation.' },
  { id: 'antimycin', name: 'Antimycin A', target: 'Complex III', kind: 'inhibitor' as const, effect: 'Blocks the Q cycle. Both NADH and succinate oxidation stop.' },
  { id: 'cyanide', name: 'Cyanide', target: 'Complex IV', kind: 'inhibitor' as const, effect: 'Blocks the binuclear center that reduces oxygen. The whole chain stops.' },
  { id: 'oligomycin', name: 'Oligomycin', target: 'ATP synthase', kind: 'inhibitor' as const, effect: 'Blocks H⁺ flow through F₀. ATP synthesis stops, and coupled electron transport slows.' },
  { id: 'dnp', name: '2,4-Dinitrophenol', target: 'Inner membrane', kind: 'uncoupler' as const, effect: 'Carries protons across the membrane. The gradient becomes heat, ATP synthesis fails, and oxygen use can speed up.' },
  { id: 'ucp1', name: 'Thermogenin (UCP1)', target: 'Brown-fat mitochondria', kind: 'uncoupler' as const, effect: 'A physiological proton channel. Fuel oxidation makes heat instead of ATP.' },
] as const;

const INTRO_STEPS: readonly PathStep[] = [
  {
    id: 'catabolism',
    step: 1,
    title: 'Break fuels down',
    enzyme: 'Catabolism',
    phase: 'Direction',
    conversion: 'Carbohydrate, fat, and protein → acetyl-CoA, NADH, and ATP',
    energy: 'Oxidative. Convergent.',
    regulation: 'Slows when ATP and NADH are already high.',
    detail: INTRO_NOTES.catabolism,
  },
  {
    id: 'anabolism',
    step: 2,
    title: 'Build cell material',
    enzyme: 'Anabolism',
    phase: 'Direction',
    conversion: 'Small precursors + ATP + NADPH → macromolecules',
    energy: 'Reductive. Divergent. Spends ATP.',
    regulation: 'Runs when energy charge and biosynthetic precursors are sufficient.',
    detail: INTRO_NOTES.anabolism,
  },
  {
    id: 'split',
    step: 3,
    title: 'Separate enzymes at the irreversible steps',
    enzyme: 'Reciprocal control',
    phase: 'Design',
    conversion: 'Glycolysis and gluconeogenesis, for example, do not share hexokinase, PFK-1, or pyruvate kinase',
    energy: 'Running both directions at once would waste ATP.',
    regulation: 'The same signal often turns one enzyme on and the opposing enzyme off.',
    detail: INTRO_NOTES.separate,
  },
  {
    id: 'charge',
    step: 4,
    title: 'Energy charge and the committed step',
    enzyme: 'Allosteric control',
    phase: 'Regulation',
    conversion: 'Energy charge = (ATP + ½ ADP) / (ATP + ADP + AMP)',
    energy: 'ATP-making paths slow as the charge rises toward 1.',
    regulation: 'The usual site is the committed step, such as PFK-1 in glycolysis.',
    detail: INTRO_NOTES.charge,
  },
  {
    id: 'hormones',
    step: 5,
    title: 'Hormones and compartments',
    enzyme: 'Covalent and compartment control',
    phase: 'Regulation',
    conversion: 'Glucagon and epinephrine raise phosphorylation in liver. Insulin lowers it.',
    energy: 'Glycolysis is cytosolic. The citric acid cycle is in the matrix. The respiratory chain is in the inner membrane.',
    regulation: 'Phosphorylation, allosteric effectors, and which organelle holds the enzyme all matter. Muscle does not answer glucagon.',
    detail: 'A pathway map is a sequence of enzymes plus a decision about which tissue and which compartment. The lessons below are those decisions, one path at a time.',
  },
];

function quiz(
  prompt: string,
  choices: readonly [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explanation: string,
): LessonQuiz {
  return { prompt, choices, answer, explanation };
}

export const METABOLISM_LESSONS: readonly MetabolismLesson[] = [
  {
    id: 'intro',
    title: 'Introduction to metabolism',
    kicker: 'Two directions, one map',
    summary: 'Catabolism oxidizes fuels and converges on acetyl-CoA. Anabolism spends ATP and NADPH and branches outward. The map links the lessons, including the citric acid cycle and gluconeogenesis already on the biochemistry bench.',
    steps: INTRO_STEPS,
    quiz: [
      quiz(
        'Which pair describes catabolism?',
        ['Oxidative and convergent', 'Reductive and divergent', 'Reductive and convergent', 'Oxidative and divergent'],
        0,
        'Catabolism oxidizes fuels and funnels many molecules into a few shared intermediates such as acetyl-CoA.',
      ),
      quiz(
        'Which cofactor usually donates electrons in biosynthesis?',
        ['NADPH', 'NADH', 'FAD', 'Ubiquinone'],
        0,
        'NADH feeds the respiratory chain. NADPH is the reductant for fatty-acid synthesis, the pentose phosphate pathway’s product, and glutathione.',
      ),
      quiz(
        'Why do glycolysis and gluconeogenesis use different enzymes at three steps?',
        [
          'So each direction can be turned off while the other runs',
          'Because the shared enzymes cannot bind ATP',
          'Because both paths are in the mitochondrial matrix',
          'Because pyruvate has no phosphate',
        ],
        0,
        'The irreversible steps are the control points. Separate enzymes prevent a futile cycle that would only hydrolyze ATP.',
      ),
      quiz(
        'A high energy charge tends to do what to ATP-producing pathways?',
        ['Slow them', 'Speed them at every step', 'Block only anabolism', 'Force oxygen off Complex IV'],
        0,
        'Energy charge near 1 means ATP is plentiful. Catabolic control points such as PFK-1 slow down.',
      ),
    ],
  },
  {
    id: 'atp',
    title: 'Phosphoryl group transfer and ATP',
    kicker: 'Why some phosphates can make ATP',
    summary: 'ATP stores transferable phosphoryl groups in its phosphoanhydride bonds. A donor whose hydrolysis is more exergonic than ATP hydrolysis can phosphorylate ADP. That direct transfer is substrate-level phosphorylation.',
    steps: [
      {
        id: 'structure',
        step: 1,
        title: 'Three phosphates on adenosine',
        enzyme: 'ATP',
        phase: 'Structure',
        conversion: 'Adenine + ribose + three phosphates',
        energy: 'The bonds between the phosphates are phosphoanhydrides. The link from ribose to the first phosphate is a lower-energy ester.',
        regulation: 'Cells keep ATP, ADP, and AMP far from equilibrium so hydrolysis stays strongly favorable.',
        detail: 'The useful “high-energy bonds” are the phosphoanhydrides, written as ~ when a book wants the shorthand. Breaking one releases more free energy than breaking a typical phosphate ester.',
      },
      {
        id: 'hydrolysis',
        step: 2,
        title: 'Hydrolysis free energy',
        enzyme: 'ATP → ADP + Pi',
        phase: 'Free energy',
        conversion: 'ATP + H₂O → ADP + Pi',
        energy: 'ΔG°′ is −30.5 kJ/mol. Inside cells the actual ΔG is more negative, often near −50 to −65 kJ/mol, because concentrations are not the standard 1 M.',
        regulation: 'Products are kept low, and Mg²⁺ binds the phosphates. Both push hydrolysis forward.',
        detail: 'Cleavage to AMP and pyrophosphate is even more exergonic, about −45.6 kJ/mol, and pyrophosphate is often hydrolyzed so the pull is permanent.',
      },
      {
        id: 'ranking',
        step: 3,
        title: 'A ladder of donors',
        enzyme: 'Phosphoryl transfer potential',
        phase: 'Ranking',
        conversion: 'Phosphoenolpyruvate and 1,3-bisphosphoglycerate sit above ATP. Glucose 6-phosphate sits below it.',
        energy: 'Only compounds above ATP phosphorylate ADP under standard conditions.',
        regulation: 'The cell uses the ones above ATP at substrate-level phosphorylation steps.',
        detail: 'Phosphoenolpyruvate is about −61.9 kJ/mol, 1,3-bisphosphoglycerate about −49.4, and phosphocreatine about −43.1. Glucose 6-phosphate is about −13.8.',
      },
      {
        id: 'slp',
        step: 4,
        title: 'Substrate-level phosphorylation',
        enzyme: 'A kinase and a metabolic donor',
        phase: 'ATP production',
        conversion: 'Donor~P + ADP → donor + ATP',
        energy: 'In glycolysis: phosphoglycerate kinase and pyruvate kinase. In the citric acid cycle: succinyl-CoA synthetase makes GTP.',
        regulation: 'No proton gradient and no oxygen are required. That is how anaerobic glycolysis still nets 2 ATP.',
        detail: 'The phosphoryl group moves from the high-energy intermediate onto ADP or GDP. Oxidative phosphorylation is the other route, and it uses the respiratory chain.',
      },
      {
        id: 'coupling',
        step: 5,
        title: 'Coupling an unfavorable step',
        enzyme: 'Hexokinase as the example',
        phase: 'Coupling',
        conversion: 'Glucose + ATP → glucose 6-phosphate + ADP',
        energy: 'Glucose + Pi → glucose 6-phosphate is about +13.8 kJ/mol. Adding ATP hydrolysis (−30.5) makes the sum about −16.7 kJ/mol.',
        regulation: 'The two reactions share the enzyme’s active site, so the phosphate does not have to wander off as free Pi first.',
        detail: 'A positive ΔG°′ can still run if it is tied to a more negative one and the shared intermediate is consumed. That is metabolic coupling.',
      },
    ],
    quiz: [
      quiz(
        'Which bonds in ATP are the high-energy phosphoanhydrides?',
        [
          'The bonds between the phosphate groups',
          'The bond from adenine to ribose',
          'The glycosidic bond only',
          'The ribose hydroxyls',
        ],
        0,
        'The phosphoanhydride links between phosphates release the free energy used in phosphoryl transfer. The sugar–phosphate ester is not in that class.',
      ),
      quiz(
        'ΔG°′ for ATP → ADP + Pi is about',
        ['−30.5 kJ/mol', '−61.9 kJ/mol', '+30.5 kJ/mol', '−13.8 kJ/mol'],
        0,
        '−30.5 kJ/mol is the standard value used in class. Phosphoenolpyruvate is the more negative −61.9, and glucose 6-phosphate is −13.8.',
      ),
      quiz(
        'Which compound can phosphorylate ADP?',
        ['Phosphoenolpyruvate', 'Glucose 6-phosphate', 'Glycerol 3-phosphate', 'Free phosphate'],
        0,
        'Phosphoenolpyruvate’s hydrolysis is more exergonic than ATP’s, so the phosphate can move onto ADP. Glucose 6-phosphate cannot.',
      ),
      quiz(
        'Substrate-level phosphorylation means',
        [
          'A metabolic intermediate donates a phosphoryl group directly to ADP or GDP',
          'ATP synthase uses the proton gradient',
          'Oxygen accepts electrons at Complex IV',
          'NADPH reduces glutathione',
        ],
        0,
        'Pyruvate kinase, phosphoglycerate kinase, and succinyl-CoA synthetase do this. ATP synthase does not.',
      ),
    ],
  },
  {
    id: 'glycolysis',
    title: 'Glycolysis',
    kicker: 'Ten steps, two phases',
    summary: 'In the cytosol, one glucose becomes two pyruvate. The investment phase spends 2 ATP. The payoff returns 4 ATP and 2 NADH. The net is 2 ATP and 2 NADH.',
    steps: GLYCOLYSIS,
    quiz: [
      quiz(
        'What is the net yield of glycolysis from glucose to two pyruvate?',
        ['2 ATP and 2 NADH', '4 ATP and 2 NADH', '2 ATP and 2 NADPH', '32 ATP'],
        0,
        'Four ATP are formed and two were spent. Two NADH are formed by GAPDH. The 30–32 ATP figure is for complete aerobic oxidation, not for glycolysis alone.',
      ),
      quiz(
        'Which enzyme is the committed step?',
        ['Phosphofructokinase-1', 'Aldolase', 'Enolase', 'Phosphoglucose isomerase'],
        0,
        'PFK-1 is the first irreversible step unique to glycolysis. ATP and citrate inhibit it. AMP and fructose 2,6-bisphosphate activate it.',
      ),
      quiz(
        'Which enzyme produces the NADH of glycolysis?',
        ['Glyceraldehyde-3-phosphate dehydrogenase', 'Pyruvate kinase', 'Hexokinase', 'Triose-phosphate isomerase'],
        0,
        'GAPDH oxidizes the aldehyde and reduces NAD⁺. Pyruvate kinase and hexokinase transfer phosphoryl groups and do not make NADH.',
      ),
      quiz(
        'In a human red blood cell, what is the usual fate of pyruvate?',
        ['Lactate, regenerating NAD⁺', 'Ethanol', 'Acetyl-CoA inside a mitochondrion', 'Ribose 5-phosphate'],
        0,
        'Red cells have no mitochondria. Lactate dehydrogenase regenerates the NAD⁺ that GAPDH needs. Ethanol fermentation is the yeast route.',
      ),
    ],
  },
  {
    id: 'glycogenolysis',
    title: 'Glycogenolysis',
    kicker: 'Phosphorolysis, then a branch',
    summary: 'Glycogen phosphorylase releases glucose 1-phosphate from α-1,4 chains. The debranching enzyme handles the α-1,6 link and frees one glucose. Liver can release blood glucose. Muscle cannot.',
    steps: GLYCOGENOLYSIS,
    quiz: [
      quiz(
        'What does glycogen phosphorylase release from an α-1,4 linkage?',
        ['Glucose 1-phosphate', 'Free glucose', 'UDP-glucose', 'Glucose 6-phosphate directly'],
        0,
        'The reaction is a phosphorolysis. Inorganic phosphate attacks, so the product is glucose 1-phosphate. Free glucose comes only from the α-1,6 branch point.',
      ),
      quiz(
        'Which enzyme frees the glucose at the α-1,6 branch?',
        ['The debranching enzyme’s glucosidase', 'Glycogen phosphorylase', 'Glycogen synthase', 'Hexokinase'],
        0,
        'After the transferase moves three glucoses, the glucosidase hydrolyzes the remaining α-1,6 glucose. Phosphorylase cannot cut that bond.',
      ),
      quiz(
        'Why can liver glycogen support blood glucose, while muscle glycogen cannot?',
        [
          'Liver has glucose-6-phosphatase and muscle does not',
          'Muscle stores UDP-glucose instead of glycogen',
          'Liver phosphorylase makes free glucose directly',
          'Muscle lacks glycogen phosphorylase',
        ],
        0,
        'Both tissues make glucose 6-phosphate. Only liver and kidney hydrolyze it to free glucose that can leave the cell.',
      ),
      quiz(
        'Which signal promotes phosphorylase a in liver?',
        ['Glucagon, via phosphorylation', 'Insulin, via phosphorylation of phosphorylase', 'High ATP acting on liver phosphorylase b', 'A fall in cAMP'],
        0,
        'Glucagon raises cAMP, protein kinase A activates phosphorylase kinase, and phosphorylase b becomes phosphorylase a. Insulin works in the other direction.',
      ),
    ],
  },
  {
    id: 'pentose',
    title: 'Pentose phosphate pathway',
    kicker: 'NADPH and ribose',
    summary: 'The oxidative phase converts glucose 6-phosphate to ribulose 5-phosphate and makes 2 NADPH and 1 CO₂. The non-oxidative phase rearranges sugars and can return carbon to glycolysis.',
    steps: PENTOSE_PATHWAY,
    quiz: [
      quiz(
        'What does one oxidative pass produce from glucose 6-phosphate?',
        ['2 NADPH, 1 CO₂, and ribulose 5-phosphate', '2 NADH and two pyruvate', '1 NADPH and glucose', '3 ATP'],
        0,
        'G6PD and 6-phosphogluconate dehydrogenase each reduce NADP⁺. The second reaction also releases CO₂.',
      ),
      quiz(
        'Which enzyme is the main control point, and what inhibits it?',
        ['G6PD, inhibited by NADPH', 'Transaldolase, inhibited by ATP', 'Transketolase, inhibited by ribose', 'Gluconolactonase, inhibited by glucose'],
        0,
        'G6PD is irreversible in the cell and is specific for NADP⁺. NADPH slows it when reductive biosynthesis is not drawing NADPH off.',
      ),
      quiz(
        'Ribose 5-phosphate is used to build',
        ['Nucleotides', 'Glycogen branches', 'ATP synthase', 'Heme a₃'],
        0,
        'Ribose 5-phosphate is the sugar of nucleotides and nucleic acids. If the cell needs ribose more than NADPH, the non-oxidative enzymes can run from glycolytic intermediates.',
      ),
      quiz(
        'Transketolase moves carbons with which cofactor?',
        ['Thiamine pyrophosphate, two carbons', 'Biotin, one carbon', 'Pyridoxal phosphate, an amino group', 'NAD⁺, a hydride'],
        0,
        'Transketolase transfers a two-carbon unit and needs thiamine pyrophosphate. Transaldolase transfers three carbons and uses a lysine, not thiamine.',
      ),
    ],
  },
  {
    id: 'oxphos',
    title: 'Oxidative phosphorylation',
    kicker: 'A gradient, then a rotor',
    summary: 'Complexes I, III, and IV pump protons as electrons move from NADH to oxygen. ATP synthase lets the protons back in and makes ATP. Succinate skips Complex I, so its yield is lower.',
    steps: OXPHOS,
    quiz: [
      quiz(
        'Which complex pumps no protons?',
        ['Complex II', 'Complex I', 'Complex III', 'Complex IV'],
        0,
        'Succinate dehydrogenase reduces ubiquinone but does not span the membrane as a proton pump. That is why FADH₂ is worth less ATP than NADH.',
      ),
      quiz(
        'What is the terminal electron acceptor?',
        ['Oxygen at Complex IV', 'NAD⁺ at Complex I', 'Fumarate at Complex II', 'ATP at ATP synthase'],
        0,
        'Cytochrome c oxidase reduces O₂ to water. Cyanide blocks that step and stops the chain.',
      ),
      quiz(
        'About how many ATP does the classroom P/O ratio assign to mitochondrial NADH?',
        ['2.5', '1.5', '4', '30.5'],
        0,
        'About 2.5 for NADH and about 1.5 for succinate. Older integer tables used 3 and 2. The exact count depends on the c-ring and on the cost of exporting ATP.',
      ),
      quiz(
        'What does an uncoupler such as DNP do?',
        [
          'Lets protons leak, so ATP synthesis fails and oxygen use can continue',
          'Blocks Complex IV the way cyanide does',
          'Stops oxygen use and raises ATP',
          'Inhibits hexokinase',
        ],
        0,
        'The gradient is spent as heat. Electron transport is released from respiratory control, but ATP synthase no longer has a gradient to use. Oligomycin, by contrast, blocks the synthase itself.',
      ),
    ],
  },
];

export function isMetabolismLesson(id: string): id is MetabolismLessonId {
  return (METABOLISM_LESSON_IDS as readonly string[]).includes(id);
}

export function metabolismLesson(id: string): MetabolismLesson | null {
  return METABOLISM_LESSONS.find((lesson) => lesson.id === id) ?? null;
}

export function lessonFromHash(hash: string): MetabolismLessonId {
  const cleaned = hash.replace(/^#/, '');
  if (cleaned === 'metabolism') return 'intro';
  if (!cleaned.startsWith('metabolism/')) return 'intro';
  const id = cleaned.slice('metabolism/'.length);
  return isMetabolismLesson(id) ? id : 'intro';
}

export function gradeLesson(id: string, choices: readonly number[]): { score: number; total: number } | null {
  const lesson = metabolismLesson(id);
  if (!lesson || choices.length !== lesson.quiz.length) return null;
  if (choices.some((choice) => !Number.isInteger(choice) || choice < 0 || choice > 3)) return null;
  const score = lesson.quiz.reduce((sum, question, index) => sum + (choices[index] === question.answer ? 1 : 0), 0);
  return { score, total: lesson.quiz.length };
}
