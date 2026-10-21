/**
 * Labeled figures for the study topics. Same drawing language as the
 * other lessons: page colors, no external images.
 */

import type { Diagram, Mark, Tone } from './diagrams';

type Anchor = 'start' | 'middle' | 'end';

function text(
  x: number,
  y: number,
  value: string,
  size = 13,
  anchor: Anchor = 'middle',
  fill: Tone = 'ink',
  weight = 650,
): Mark {
  return { kind: 'text', x, y, text: value, size, anchor, fill, weight };
}

function rect(x: number, y: number, w: number, h: number, fill: Tone = 'soft', stroke: Tone = 'line', rx = 10): Mark {
  return { kind: 'rect', x, y, w, h, fill, stroke, rx, sw: 1.5 };
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: Tone = 'accent', sw = 2): Mark {
  return { kind: 'line', x1, y1, x2, y2, stroke, sw };
}

function arrow(x1: number, y1: number, x2: number, y2: number, stroke: Tone = 'accent'): Mark[] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const head = 8;
  const wing = 4;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  return [
    line(x1, y1, bx, by, stroke, 2),
    {
      kind: 'path',
      d: `M ${x2} ${y2} L ${bx + -uy * wing} ${by + ux * wing} L ${bx - -uy * wing} ${by - ux * wing} Z`,
      fill: stroke,
    },
  ];
}

function chip(x: number, y: number, w: number, h: number, label: string, fill: Tone, size = 13, labelFill: Tone = 'ink'): Mark[] {
  return [rect(x, y, w, h, fill), text(x + w / 2, y + h / 2, label, size, 'middle', labelFill)];
}

function diagram(id: string, alt: string, caption: string, width: number, height: number, marks: Mark[]): Diagram {
  return { id, alt, caption, width, height, marks, wide: true };
}

function columns(
  id: string,
  title: string,
  alt: string,
  caption: string,
  leftTitle: string,
  rightTitle: string,
  rows: readonly (readonly [string, string])[],
): Diagram {
  const height = 78 + rows.length * 36;
  const marks: Mark[] = [
    text(320, 22, title, 16),
    ...chip(24, 40, 288, 28, leftTitle, 'accent', 13, 'on'),
    ...chip(328, 40, 288, 28, rightTitle, 'soft', 13),
  ];
  rows.forEach((row, index) => {
    const y = 78 + index * 36;
    marks.push(rect(24, y, 288, 30, 'surface'), text(168, y + 15, row[0], 12, 'middle', 'ink', 600));
    marks.push(rect(328, y, 288, 30, 'surface'), text(472, y + 15, row[1], 12, 'middle', 'ink', 600));
  });
  return diagram(id, alt, caption, 640, height, marks);
}

function flow(
  id: string,
  title: string,
  alt: string,
  caption: string,
  steps: readonly (readonly [string, string])[],
): Diagram {
  const marks: Mark[] = [text(320, 24, title, 16)];
  const col = 640 / steps.length;
  steps.forEach((step, index) => {
    const x = index * col + 14;
    const w = col - 28;
    marks.push(...chip(x, 48, w, 40, step[0], index % 2 === 0 ? 'accent' : 'soft', 13, index % 2 === 0 ? 'on' : 'ink'));
    marks.push(text(x + w / 2, 112, step[1], 12, 'middle', 'muted', 600));
    if (index < steps.length - 1) marks.push(...arrow(x + w + 2, 68, x + col + 10, 68));
  });
  return diagram(id, alt, caption, 640, 150, marks);
}

const biomolecules = diagram(
  'study-biomolecules',
  'Four biological molecules. Carbohydrates are built from sugars by glycosidic bonds. Proteins are built from amino acids by peptide bonds. Nucleic acids are built from nucleotides by phosphodiester bonds. Lipids are not one repeating polymer. Condensation releases water. Hydrolysis uses water to break the link.',
  'Carbohydrates, proteins, and nucleic acids are polymers. A condensation reaction joins monomers and releases water. Hydrolysis puts the water back and breaks the link. Lipids are grouped by solubility, not by one shared monomer.',
  640,
  250,
  [
    text(320, 22, 'Four biological molecules', 16),
    ...chip(20, 48, 140, 36, 'Carbohydrate', 'soft', 13),
    ...chip(174, 48, 140, 36, 'Protein', 'accent', 14, 'on'),
    ...chip(328, 48, 140, 36, 'Nucleic acid', 'soft', 13),
    ...chip(482, 48, 138, 36, 'Lipid', 'surface', 14),
    text(90, 108, 'sugars', 13, 'middle', 'muted', 600),
    text(244, 108, 'amino acids', 13, 'middle', 'muted', 600),
    text(398, 108, 'nucleotides', 13, 'middle', 'muted', 600),
    text(551, 108, 'no one monomer', 12, 'middle', 'muted', 600),
    text(90, 132, 'glycosidic bond', 13),
    text(244, 132, 'peptide bond', 13),
    text(398, 132, 'phosphodiester', 13),
    text(551, 132, 'ester in fats', 13),
    ...arrow(120, 168, 250, 168),
    text(320, 168, 'condensation releases H₂O', 14, 'middle', 'accent'),
    ...arrow(520, 196, 390, 196),
    text(320, 214, 'hydrolysis uses H₂O and breaks the link', 14, 'middle', 'good'),
  ],
);

const enzymes = diagram(
  'study-enzymes',
  'Enzyme inhibition. A competitive inhibitor binds the active site, so apparent Km rises and Vmax stays the same. A non-competitive inhibitor binds another site, so Vmax falls and Km stays the same in the classroom model. More substrate can outcompete a competitive inhibitor.',
  'Competitive inhibition raises apparent Km and leaves Vmax unchanged, so extra substrate can still reach the same top speed. Non-competitive inhibition lowers Vmax. In the pure classroom model, Km stays the same.',
  640,
  230,
  [
    text(320, 22, 'Two classroom inhibitions', 16),
    ...chip(36, 52, 250, 34, 'Competitive', 'accent', 14, 'on'),
    ...chip(354, 52, 250, 34, 'Non-competitive', 'soft', 14),
    text(161, 112, 'binds the active site', 13),
    text(479, 112, 'binds another site', 13),
    text(161, 138, 'apparent Km rises', 14, 'middle', 'accent'),
    text(479, 138, 'Vmax falls', 14, 'middle', 'accent'),
    text(161, 164, 'Vmax unchanged', 14, 'middle', 'good'),
    text(479, 164, 'Km unchanged', 14, 'middle', 'good'),
    text(161, 198, 'more substrate can win', 13, 'middle', 'muted', 600),
    text(479, 198, 'more substrate does not', 13, 'middle', 'muted', 600),
  ],
);

const cell = columns(
  'study-cell',
  'Two cell plans',
  'Prokaryotic and eukaryotic cells. A prokaryote has no nucleus, a nucleoid, 70S ribosomes, and no membrane-bound organelles. A eukaryote has a nucleus, 80S ribosomes, and organelles such as mitochondria. Both have a plasma membrane, DNA, and ribosomes.',
  'Prokaryotic cells keep their DNA in a nucleoid and have 70S ribosomes. Eukaryotic cells enclose the DNA in a nucleus, have 80S ribosomes in the cytosol, and contain membrane-bound organelles.',
  'Prokaryote',
  'Eukaryote',
  [
    ['No nucleus', 'Nucleus with envelope'],
    ['Nucleoid and plasmids', 'Linear chromosomes'],
    ['70S ribosomes', '80S ribosomes in cytosol'],
    ['No membrane organelles', 'Mitochondria and others'],
    ['Peptidoglycan wall in bacteria', 'Plant wall is cellulose'],
  ],
);

const photosynthesis = diagram(
  'study-photosynthesis',
  'Photosynthesis in a chloroplast. Light reactions in the thylakoid membrane split water, release oxygen, and make ATP and NADPH. The Calvin cycle in the stroma uses that ATP and NADPH to fix carbon dioxide. Six carbon dioxide molecules cost 18 ATP and 12 NADPH on the way to carbohydrate.',
  'Light reactions sit in the thylakoid membrane and make ATP, NADPH, and O₂. The Calvin cycle sits in the stroma and spends 3 ATP and 2 NADPH for each CO₂ fixed. Six turns, enough for one glucose, cost 18 ATP and 12 NADPH.',
  640,
  250,
  [
    text(320, 22, 'Chloroplast', 16),
    rect(48, 48, 544, 180, 'soft', 'accent', 18),
    text(320, 70, 'outer and inner membranes', 12, 'middle', 'muted', 600),
    rect(150, 88, 340, 70, 'surface', 'ink', 12),
    text(320, 112, 'thylakoid: light reactions', 14),
    text(320, 136, 'H₂O → O₂, plus ATP and NADPH', 13, 'middle', 'accent', 650),
    text(320, 186, 'stroma: Calvin cycle', 14),
    text(320, 208, 'CO₂ in, carbohydrate out', 13, 'middle', 'good', 650),
  ],
);

const inheritance = diagram(
  'study-inheritance',
  'Punnett square for two carriers, Aa crossed with Aa. The offspring genotypes are AA, Aa, Aa, and aa. The phenotype ratio for a recessive condition is 3 unaffected to 1 affected. Half of all children are carriers. The chance an unaffected child is a carrier is 2/3.',
  'When both parents are heterozygous carriers, one quarter of children are aa, half are carriers, and one quarter are AA. Among children who are not affected, two thirds are carriers.',
  640,
  250,
  [
    text(320, 22, 'Aa × Aa', 16),
    text(250, 58, 'A', 16),
    text(390, 58, 'a', 16),
    text(130, 110, 'A', 16),
    text(130, 175, 'a', 16),
    ...chip(180, 78, 120, 52, 'AA', 'good', 18, 'ink'),
    ...chip(320, 78, 120, 52, 'Aa', 'soft', 18),
    ...chip(180, 144, 120, 52, 'Aa', 'soft', 18),
    ...chip(320, 144, 120, 52, 'aa', 'caution', 18),
    text(320, 222, '3 unaffected : 1 affected', 15),
  ],
);

const evolution = columns(
  'study-evolution',
  'Two explanations of the giraffe neck',
  'Lamarck said ancestors stretched their necks and passed the acquired length to offspring. That idea fails because a trait gained in a lifetime is not written into the gametes. Darwin and Wallace said heritable variation already existed, and individuals with longer necks left more offspring where high leaves mattered.',
  'Lamarck’s acquired-character idea is not supported. Natural selection keeps heritable variants that already leave more offspring. Stretching a neck does not rewrite the genes in the gametes.',
  'Lamarck',
  'Natural selection',
  [
    ['Use changes the body', 'Variation already exists'],
    ['The change is inherited', 'Heritable variants differ'],
    ['The neck is acquired', 'More offspring, not effort'],
    ['Not supported', 'Fits the evidence'],
  ],
);

const microbiology = diagram(
  'study-microbiology',
  'A bacterial cell. The capsule is outermost, then the cell wall with peptidoglycan, then the plasma membrane. Inside are the nucleoid, plasmids, and 70S ribosomes. A flagellum is for movement and pili attach or join cells. There is no nucleus.',
  'Bacteria are prokaryotes. Peptidoglycan is in the wall. The chromosome is a nucleoid, not a nucleus. Ribosomes are 70S. Plasmids are small extra DNA circles. A flagellum moves the cell. Pili attach.',
  640,
  230,
  [
    text(320, 22, 'Bacterial cell', 16),
    rect(70, 48, 500, 160, 'soft', 'accent', 80),
    text(320, 68, 'capsule', 12, 'middle', 'muted', 650),
    rect(110, 78, 420, 112, 'surface', 'ink', 40),
    text(320, 98, 'wall: peptidoglycan', 13),
    text(250, 128, 'nucleoid', 14, 'middle', 'accent'),
    text(400, 128, 'plasmid', 13, 'middle', 'good', 650),
    text(320, 156, '70S ribosomes', 13),
    text(560, 150, 'flagellum', 12, 'start', 'ink', 650),
    line(520, 140, 555, 150, 'ink', 2),
  ],
);

const immunology = columns(
  'study-immunology',
  'Two arms of defence',
  'Innate immunity is fast and not specific to one antigen. It includes barriers, phagocytes, inflammation, and complement. Adaptive immunity is slower at first and specific. B cells make antibodies. Helper T cells coordinate. Cytotoxic T cells kill infected cells. Memory makes the second meeting faster.',
  'Innate defences do not adapt to one particular antigen. Adaptive defences do. Antibodies come from B cells. T cells help or kill. Memory is why a vaccine can protect later.',
  'Innate',
  'Adaptive',
  [
    ['Immediate', 'Days on a first meeting'],
    ['Not antigen-specific', 'Specific to an epitope'],
    ['No lasting memory', 'Memory cells remain'],
    ['Phagocytes, barriers', 'B cells and T cells'],
    ['Complement', 'Antibodies'],
  ],
);

const regulation = flow(
  'study-regulation',
  'lac operon when glucose is low',
  'The lac operon. Without lactose the repressor binds the operator and blocks transcription. Allolactose from lactose inactivates the repressor. If glucose is also low, cAMP is high and CAP helps RNA polymerase, so transcription is high. If glucose is high, CAP does not help and transcription stays low.',
  'Lactose removes the repressor. Low glucose lets CAP help RNA polymerase. Both are required for the high transcription taught in class. High glucose keeps the operon quiet even when lactose is present.',
  [
    ['No lactose', 'repressor on'],
    ['Add lactose', 'repressor off'],
    ['Low glucose', 'CAP helps'],
    ['High mRNA', 'lac genes on'],
  ],
);

const pcr = flow(
  'study-pcr',
  'One PCR cycle',
  'PCR cycle. Denaturation near 95 degrees Celsius separates the DNA strands. Annealing near 50 to 65 degrees lets primers bind. Extension at 72 degrees is where Taq polymerase copies DNA in the 5-prime to 3-prime direction. Each full cycle can double the number of target molecules.',
  'A cycle is denature, anneal, extend. Heat separates the strands. Primers set the ends of the product. Taq polymerase extends at 72°C. In the ideal case the target doubles every cycle.',
  [
    ['95°C', 'strands apart'],
    ['50–65°C', 'primers bind'],
    ['72°C', 'Taq extends'],
    ['Repeat', 'about 2ⁿ'],
  ],
);

const electrophoresis = diagram(
  'study-electrophoresis',
  'Agarose gel electrophoresis of DNA. Wells are at the cathode, the negative end. DNA has a negative phosphate backbone, so it moves toward the anode, the positive end. A 3000 base pair band stays nearer the well than a 500 base pair band. The ladder gives the sizes.',
  'DNA is negative and moves toward the anode. Smaller fragments travel farther through the agarose in the same time. A ladder in the next lane is how the size is read.',
  640,
  240,
  [
    text(320, 22, 'Agarose gel, DNA', 16),
    rect(80, 44, 480, 170, 'surface', 'line', 8),
    text(120, 68, 'wells  −', 13, 'middle', 'muted', 700),
    rect(150, 56, 28, 16, 'ink'),
    rect(230, 56, 28, 16, 'ink'),
    rect(330, 56, 28, 16, 'accent'),
    text(164, 96, '3000 bp', 12),
    rect(156, 104, 16, 18, 'accent'),
    text(244, 150, '500 bp', 12),
    rect(236, 158, 16, 18, 'good'),
    text(344, 78, 'ladder', 12, 'middle', 'accent', 700),
    rect(336, 100, 16, 12, 'soft', 'accent'),
    rect(336, 130, 16, 12, 'soft', 'accent'),
    rect(336, 168, 16, 12, 'soft', 'accent'),
    text(480, 196, '+ anode', 14, 'middle', 'accent'),
    text(320, 228, 'smaller DNA travels farther', 14),
  ],
);

const cloning = flow(
  'study-cloning',
  'Cloning a fragment',
  'Gene cloning. A restriction enzyme cuts the plasmid and the insert. Matching ends base-pair. DNA ligase seals the backbone, making recombinant DNA. The plasmid is taken up by a host cell. A selectable marker lets only cells that received a plasmid form a colony.',
  'Cut, join with ligase, put the plasmid into a host, then select. Cells without the plasmid do not form colonies on the selective medium. This is the strategy, not a bench protocol.',
  [
    ['Cut', 'same enzyme'],
    ['Ligate', 'recombinant'],
    ['Uptake', 'host cell'],
    ['Select', 'marker'],
  ],
);

const bioinformatics = columns(
  'study-bioinformatics',
  'Two alignments',
  'Global alignment, Needleman-Wunsch, lines up two sequences from end to end. Local alignment, Smith-Waterman and BLAST, finds the best matching region and ignores the unmatched ends. Identity means the same letter. A BLAST E-value is how many matches of that quality chance would produce, not a probability.',
  'Use a global alignment when the whole length should be compared. Use a local alignment when only a shared region matters. BLAST is a fast local search. A smaller E-value is more surprising.',
  'Global',
  'Local',
  [
    ['Needleman–Wunsch', 'Smith–Waterman'],
    ['End to end', 'Best region only'],
    ['Similar length helps', 'BLAST is this kind'],
    ['On the Sequences tab', 'Database search'],
  ],
);

const biosafety = columns(
  'study-biosafety',
  'Pakistan biosafety review',
  'Pakistan Biosafety Rules, 2005, were made under the Pakistan Environmental Protection Act, 1997. An Institutional Biosafety Committee works at the laboratory. The Technical Advisory Committee reviews the science. The National Biosafety Committee licenses release. Biosafety limits accidents. Biosecurity limits deliberate misuse.',
  'Work with genetically modified organisms in Pakistan is reviewed at the institute and nationally. The Institutional Biosafety Committee, the Technical Advisory Committee, and the National Biosafety Committee have different jobs. Biosafety and biosecurity are not the same word.',
  'Committee',
  'Main job',
  [
    ['Institutional (IBC)', 'Local review and training'],
    ['Technical (TAC)', 'Scientific assessment'],
    ['National (NBC)', 'Licenses and policy'],
    ['Biosafety', 'Stop accidental harm'],
    ['Biosecurity', 'Stop deliberate misuse'],
  ],
);

const fermentation = diagram(
  'study-fermentation',
  'A stirred bioreactor. A jacket controls temperature. An impeller mixes the culture. A sparger adds air when the process is aerobic. Probes follow pH and temperature. Batch starts with all the feed. Fed-batch adds feed during the run. Continuous culture adds fresh medium and removes culture.',
  'A bioreactor controls mixing, temperature, pH, and, for an aerobic process, air. Batch, fed-batch, and continuous runs differ in when nutrients enter and whether culture is removed during the run.',
  640,
  250,
  [
    text(210, 22, 'Bioreactor', 16),
    rect(70, 48, 280, 180, 'surface', 'accent', 16),
    text(210, 74, 'impeller', 14),
    line(210, 84, 210, 170, 'accent', 3),
    text(210, 196, 'sparger', 13, 'middle', 'good', 700),
    text(40, 120, 'jacket', 12, 'start', 'muted', 650),
    ...chip(390, 48, 220, 36, 'Batch', 'soft', 14),
    ...chip(390, 100, 220, 36, 'Fed-batch', 'accent', 14, 'on'),
    ...chip(390, 152, 220, 36, 'Continuous', 'surface', 14),
    text(500, 210, 'feed in, culture out', 12, 'middle', 'muted', 600),
  ],
);

const agri = flow(
  'study-agri',
  'Bt cotton, the idea',
  'Bt cotton carries a gene from Bacillus thuringiensis. The plant makes a Cry protein. In the alkaline midgut of a susceptible caterpillar the protein is activated, binds a receptor, and forms a pore. The same activation does not happen in the human stomach. Insect resistance can still evolve if the toxin is used alone.',
  'Bt cotton makes a bacterial protein that harms certain caterpillars and is not activated the same way in people. It is a specific insecticide made by the plant, not a change to the cotton fibre itself. Resistance in the insect is the agronomic risk.',
  [
    ['cry gene', 'from Bt'],
    ['Plant', 'makes Cry'],
    ['Caterpillar', 'pore in gut'],
    ['People', 'not that path'],
  ],
);

const tissue = flow(
  'study-tissue',
  'From explant to plant',
  'Plant tissue culture. An explant is placed on sterile Murashige and Skoog medium. A balance of auxin and cytokinin keeps a callus. More cytokinin favours shoots. More auxin favours roots. A rooted shoot can become a whole plant because plant cells are totipotent.',
  'Totipotency means one living plant cell can regenerate a plant. The hormone ratio chooses callus, shoots, or roots. The medium is sterile so microbes do not overgrow the explant.',
  [
    ['Explant', 'a small piece'],
    ['Callus', 'hormones balanced'],
    ['Shoots', 'more cytokinin'],
    ['Roots', 'more auxin'],
  ],
);

const health = flow(
  'study-health',
  'A sandwich ELISA',
  'Sandwich ELISA. A capture antibody is stuck to the well. The sample antigen binds it. A second antibody, linked to an enzyme, binds the antigen. The enzyme makes a colour. Colour means the antigen was present. No colour means it was not detected. The test does not by itself prove how sick a person is.',
  'A sandwich ELISA traps the antigen between two antibodies. The enzyme on the second antibody makes a colour only if the antigen was captured. The colour is a detection signal, read against controls.',
  [
    ['Capture', 'on the well'],
    ['Antigen', 'from sample'],
    ['Enzyme Ab', 'binds too'],
    ['Colour', 'a positive'],
  ],
);

export const STUDY_DIAGRAMS = {
  biomolecules,
  enzymes,
  cell,
  photosynthesis,
  inheritance,
  evolution,
  microbiology,
  immunology,
  regulation,
  pcr,
  electrophoresis,
  cloning,
  bioinformatics,
  biosafety,
  fermentation,
  agri,
  tissue,
  health,
} as const;
