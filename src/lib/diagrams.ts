/**
 * Hand-built lesson diagrams. Labels are the classroom values already used
 * in the biochemistry and metabolism lessons. No external images.
 */

export type Tone =
  | 'ink'
  | 'muted'
  | 'accent'
  | 'soft'
  | 'surface'
  | 'line'
  | 'a'
  | 't'
  | 'g'
  | 'c'
  | 'u'
  | 'good'
  | 'caution'
  | 'bg'
  | 'on';

type Anchor = 'start' | 'middle' | 'end';

interface Shape {
  fill?: Tone;
  stroke?: Tone;
  sw?: number;
  dash?: string;
}

export type Mark =
  | (Shape & { kind: 'rect'; x: number; y: number; w: number; h: number; rx?: number })
  | (Shape & { kind: 'line'; x1: number; y1: number; x2: number; y2: number })
  | (Shape & { kind: 'circle'; cx: number; cy: number; r: number })
  | (Shape & { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number })
  | (Shape & { kind: 'path'; d: string })
  | {
      kind: 'text';
      x: number;
      y: number;
      text: string;
      size?: number;
      weight?: number;
      fill?: Tone;
      anchor?: Anchor;
      font?: 'sans' | 'mono';
      rotate?: number;
    };

export interface Diagram {
  id: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  wide?: boolean;
  marks: readonly Mark[];
}

export const FIGURE_TOPICS = [
  'dogma',
  'crispr',
  'primers',
  'mutations',
  'sequences',
  'codon',
  'animation',
  'biochem',
  'krebs',
  'glucose',
  'intro',
  'atp',
  'glycolysis',
  'glycogenolysis',
  'pentose',
  'oxphos',
] as const;

export type FigureTopic = (typeof FIGURE_TOPICS)[number];

function text(
  x: number,
  y: number,
  value: string,
  size = 14,
  anchor: Anchor = 'middle',
  fill: Tone = 'ink',
  weight = 650,
  font?: 'sans' | 'mono',
): Mark {
  return { kind: 'text', x, y, text: value, size, anchor, fill, weight, font };
}

function rect(x: number, y: number, w: number, h: number, fill: Tone = 'soft', stroke: Tone = 'line', rx = 10): Mark {
  return { kind: 'rect', x, y, w, h, fill, stroke, rx, sw: 1.5 };
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: Tone = 'accent', sw = 2, dash?: string): Mark {
  return { kind: 'line', x1, y1, x2, y2, stroke, sw, dash };
}

function circle(cx: number, cy: number, r: number, fill: Tone): Mark {
  return { kind: 'circle', cx, cy, r, fill };
}

function ellipse(cx: number, cy: number, rx: number, ry: number, fill: Tone, stroke: Tone, sw = 2): Mark {
  return { kind: 'ellipse', cx, cy, rx, ry, fill, stroke, sw };
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
  const px = -uy;
  const py = ux;
  return [
    line(x1, y1, bx, by, stroke, 2),
    {
      kind: 'path',
      d: `M ${x2} ${y2} L ${bx + px * wing} ${by + py * wing} L ${bx - px * wing} ${by - py * wing} Z`,
      fill: stroke,
    },
  ];
}

function chip(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  fill: Tone = 'soft',
  size = 13,
  labelFill: Tone = 'ink',
): Mark[] {
  const marks: Mark[] = [rect(x, y, w, h, fill)];
  if (label) marks.push(text(x + w / 2, y + h / 2, label, size, 'middle', labelFill));
  return marks;
}

function diagram(
  id: string,
  alt: string,
  caption: string,
  width: number,
  height: number,
  marks: Mark[],
  wide = false,
): Diagram {
  return { id, alt, caption, width, height, marks, wide };
}

function baseRow(y: number, left: string, right: string, leftTone: Tone, rightTone: Tone, bonds: 2 | 3): Mark[] {
  const spread = 5;
  const start = y - ((bonds - 1) * spread) / 2;
  const bondsMarks: Mark[] = [];
  for (let i = 0; i < bonds; i += 1) {
    const yy = start + i * spread;
    bondsMarks.push(line(132, yy, 248, yy, 'accent', 1.5));
  }
  return [
    circle(78, y, 10, leftTone),
    text(100, y, left, 16, 'start'),
    ...bondsMarks,
    text(268, y, right, 16, 'end'),
    circle(292, y, 10, rightTone),
  ];
}

const dogmaHelix = diagram(
  'dogma-helix',
  'Antiparallel DNA strands. A pairs with T by 2 hydrogen bonds. G pairs with C by 3 hydrogen bonds. The backbone is sugar and phosphate.',
  'Adenine pairs with thymine by 2 hydrogen bonds. Guanine pairs with cytosine by 3 hydrogen bonds. The strands are antiparallel, and the backbone is sugar–phosphate.',
  400,
  320,
  [
    text(200, 18, 'antiparallel strands', 15),
    text(48, 46, '5′', 13, 'middle', 'muted'),
    text(318, 46, '3′', 13, 'middle', 'muted'),
    rect(40, 58, 14, 168, 'accent', 'accent', 7),
    rect(310, 58, 14, 168, 'accent', 'accent', 7),
    ...baseRow(82, 'A', 'T', 'a', 't', 2),
    ...baseRow(122, 'T', 'A', 't', 'a', 2),
    ...baseRow(162, 'G', 'C', 'g', 'c', 3),
    ...baseRow(202, 'C', 'G', 'c', 'g', 3),
    text(48, 242, '3′', 13, 'middle', 'muted'),
    text(318, 242, '5′', 13, 'middle', 'muted'),
    text(200, 262, 'sugar–phosphate backbone', 12, 'middle', 'muted', 600),
    text(200, 284, 'A–T pairs: 2 hydrogen bonds', 13, 'middle', 'muted', 600),
    text(200, 304, 'G–C pairs: 3 hydrogen bonds', 13, 'middle', 'muted', 600),
  ],
);

const dogmaFlow = diagram(
  'dogma-flow',
  'Information flow from DNA to RNA to protein. The coding strand matches the mRNA, with U in place of T.',
  'Transcription copies DNA into mRNA. The coding strand matches that mRNA, with U replacing T. Translation reads the mRNA into protein.',
  400,
  300,
  [
    text(200, 18, 'coding strand matches the mRNA', 14),
    ...chip(70, 36, 260, 62, '', 'soft'),
    text(200, 52, 'DNA coding  5′-ATG-3′', 14, 'middle', 'ink', 700, 'mono'),
    text(200, 76, 'template    3′-TAC-5′', 13, 'middle', 'muted', 600, 'mono'),
    ...arrow(200, 108, 200, 132),
    text(248, 120, 'transcription', 12, 'start', 'accent', 700),
    ...chip(90, 142, 220, 52, '', 'surface'),
    text(200, 160, 'mRNA  5′-AUG-3′', 15, 'middle', 'ink', 700, 'mono'),
    text(200, 180, 'U replaces T', 12, 'middle', 'muted', 600),
    ...arrow(200, 204, 200, 228),
    text(236, 216, 'translation', 12, 'start', 'accent', 700),
    ...chip(120, 238, 160, 40, 'protein: Met', 'soft', 15),
  ],
);

const crisprCut = diagram(
  'crispr-cut',
  'SpCas9 schematic. The guide is the 20 nucleotides on the 5′ side of an NGG PAM. Both strands are cut about 3 nucleotides upstream of the PAM.',
  'The guide is the 20 nt on the 5′ side of NGG. SpCas9 cuts both strands about 3 nt upstream of the PAM. This is a map of the site, not a lab protocol.',
  400,
  250,
  [
    text(200, 18, 'SpCas9 reads the PAM', 15),
    text(16, 62, '5′', 13, 'start', 'muted'),
    ...chip(40, 44, 150, 36, '20 nt guide', 'soft', 13),
    ...chip(198, 44, 64, 36, '3 nt', 'surface', 13),
    ...chip(270, 44, 78, 36, 'NGG', 'accent', 16, 'on'),
    text(358, 62, '3′', 13, 'start', 'muted'),
    text(309, 34, 'PAM', 11, 'middle', 'accent', 700),
    text(16, 122, '3′', 13, 'start', 'muted'),
    ...chip(40, 104, 150, 36, 'complement', 'surface', 13),
    ...chip(198, 104, 64, 36, '3 nt', 'surface', 13),
    ...chip(270, 104, 78, 36, 'NCC', 'soft', 14),
    text(358, 122, '5′', 13, 'start', 'muted'),
    line(198, 36, 198, 148, 'caution', 2),
    text(200, 176, 'both strands cut here', 14, 'middle', 'caution'),
    text(200, 202, 'about 3 nt upstream of the PAM', 13, 'middle', 'muted', 600),
    text(200, 230, 'NGG is read on the strand written 5′ to 3′', 12, 'middle', 'muted', 500),
  ],
);

const primerMap = diagram(
  'primers-pcr',
  'PCR primers. The forward primer extends to the right and the reverse primer extends to the left. DNA polymerase adds nucleotides 5′ to 3′. The product lies between the primers.',
  'The forward primer is extended 5′ → 3′ along one strand. The reverse primer is extended 5′ → 3′ along the other. DNA polymerase copies only in that direction. The PCR product is the span between them.',
  400,
  270,
  [
    text(200, 18, 'DNA polymerase copies 5′ → 3′', 14),
    text(16, 58, '5′', 13, 'start', 'muted'),
    line(40, 58, 360, 58, 'ink', 3),
    text(372, 58, '3′', 13, 'start', 'muted'),
    ...arrow(250, 86, 120, 86),
    text(292, 78, '5′', 12, 'middle', 'accent'),
    text(108, 78, '3′', 12, 'middle', 'accent'),
    text(190, 108, 'reverse primer', 13, 'middle', 'accent'),
    text(16, 156, '3′', 13, 'start', 'muted'),
    line(40, 156, 360, 156, 'ink', 3),
    text(372, 156, '5′', 13, 'start', 'muted'),
    ...arrow(70, 128, 200, 128),
    text(58, 120, '5′', 12, 'middle', 'accent'),
    text(212, 120, '3′', 12, 'middle', 'accent'),
    text(130, 146, 'forward primer', 13, 'middle', 'accent'),
    line(70, 196, 290, 196, 'good', 3),
    text(200, 220, 'PCR product', 14, 'middle', 'good'),
    text(200, 248, 'each new strand grows from a primer', 12, 'middle', 'muted', 500),
  ],
);

const mutationKinds = diagram(
  'mutations-kinds',
  'A missense change replaces one amino acid. A one-base insertion shifts the reading frame for every codon after it.',
  'Missense changes one codon so the amino acid changes. A frameshift inserts or deletes a number of bases that is not a multiple of three, so later codons are regrouped.',
  400,
  390,
  [
    ...chip(16, 12, 368, 28, 'Missense', 'soft', 15),
    text(200, 58, 'ATG   GAA   GGT', 15, 'middle', 'ink', 700, 'mono'),
    text(200, 78, 'Met   Glu   Gly', 13, 'middle', 'muted', 600),
    text(200, 104, 'one base: GAA becomes GTA', 13, 'middle', 'caution'),
    text(200, 132, 'ATG   GTA   GGT', 15, 'middle', 'ink', 700, 'mono'),
    text(200, 152, 'Met   Val   Gly', 13, 'middle', 'muted', 600),
    ...chip(16, 176, 368, 28, 'Frameshift', 'soft', 15),
    text(200, 222, 'ATG   GAA   GGT', 15, 'middle', 'ink', 700, 'mono'),
    text(200, 242, 'Met   Glu   Gly', 13, 'middle', 'muted', 600),
    text(200, 268, 'insert one A after ATG', 13, 'middle', 'caution'),
    text(200, 296, 'ATG AGA AGG T…', 15, 'middle', 'ink', 700, 'mono'),
    text(200, 316, 'Met Arg Arg …', 13, 'middle', 'muted', 600),
    text(200, 348, 'the reading frame shifts', 14, 'middle', 'caution'),
    text(200, 372, 'every later codon is regrouped', 12, 'middle', 'muted', 500),
  ],
);

const ecori = diagram(
  'sequences-ecori',
  'EcoRI cuts 5′-G|AATTC-3′ and 3′-CTTAA|G-5′, leaving sticky 5′ overhangs.',
  'EcoRI recognizes 5′-GAATTC-3′ and cuts after the first G on each strand, leaving sticky ends with a 5′ overhang of AATT.',
  400,
  230,
  [
    text(200, 20, 'EcoRI', 16),
    text(200, 52, '5′-G|AATTC-3′', 18, 'middle', 'ink', 700, 'mono'),
    text(200, 80, '3′-CTTAA|G-5′', 18, 'middle', 'ink', 700, 'mono'),
    text(200, 112, 'cut on both strands', 13, 'middle', 'muted', 600),
    text(200, 148, '5′-G     AATTC-3′', 15, 'middle', 'ink', 700, 'mono'),
    text(200, 172, '3′-CTTAA     G-5′', 15, 'middle', 'ink', 700, 'mono'),
    text(200, 206, 'sticky 5′ overhangs', 14, 'middle', 'accent'),
  ],
);

const revcomp = diagram(
  'sequences-revcomp',
  'The reverse complement of 5′-ATGC-3′ is 5′-GCAT-3′.',
  'Pair each base with its complement, then read the new strand 5′ to 3′. That sequence is the reverse complement.',
  400,
  210,
  [
    text(200, 22, 'reverse complement', 15),
    text(200, 58, '5′-ATGC-3′', 18, 'middle', 'ink', 700, 'mono'),
    text(200, 86, '3′-TACG-5′', 18, 'middle', 'ink', 700, 'mono'),
    text(200, 118, 'complement, still written 3′ to 5′', 12, 'middle', 'muted', 500),
    ...arrow(200, 136, 200, 156),
    text(200, 184, '5′-GCAT-3′', 18, 'middle', 'accent', 700, 'mono'),
  ],
);

const codonRead = diagram(
  'codon-read',
  'How to read 5′-AUG-3′. The first base is A, the second is U, and the third is G. AUG is methionine and the start codon in NCBI table 1.',
  'Read a codon 5′ to 3′. In 5′-AUG-3′ the first base is A, the second is U, and the third is G. AUG is Met, and it is the start codon in NCBI table 1.',
  400,
  240,
  [
    text(200, 22, 'read the codon 5′ to 3′', 14),
    text(200, 64, '5′-AUG-3′', 28, 'middle', 'ink', 700, 'mono'),
    ...chip(24, 100, 110, 40, '1st  A', 'surface', 14),
    ...chip(146, 100, 110, 40, '2nd  U', 'surface', 14),
    ...chip(268, 100, 110, 40, '3rd  G', 'surface', 14),
    text(200, 168, 'methionine (Met)', 16),
    text(200, 194, 'start codon', 14, 'middle', 'accent'),
    text(200, 220, 'NCBI table 1', 13, 'middle', 'muted', 600),
  ],
);

const codonStops = diagram(
  'codon-stops',
  'Stop codons UAA, UAG, and UGA. In DNA they are TAA, TAG, and TGA. The standard code has 64 codons for 20 amino acids and stop.',
  'NCBI table 1 has 64 codons. They encode 20 amino acids and stop. The stops are UAA, UAG, and UGA, written TAA, TAG, and TGA in DNA.',
  400,
  220,
  [
    text(200, 22, '64 codons', 16),
    ...chip(16, 44, 116, 48, 'UAA', 'soft', 18),
    ...chip(142, 44, 116, 48, 'UAG', 'soft', 18),
    ...chip(268, 44, 116, 48, 'UGA', 'soft', 18),
    text(74, 112, 'stop', 13, 'middle', 'caution'),
    text(200, 112, 'stop', 13, 'middle', 'caution'),
    text(326, 112, 'stop', 13, 'middle', 'caution'),
    text(200, 148, 'DNA: TAA, TAG, TGA', 15, 'middle', 'ink', 700, 'mono'),
    text(200, 178, '20 amino acids and stop', 14, 'middle', 'muted', 600),
    text(200, 202, 'NCBI table 1', 12, 'middle', 'muted', 500),
  ],
);

const transcriptionBubble = diagram(
  'animation-transcription',
  'A transcription bubble. RNA polymerase copies the template strand. The new mRNA matches the coding strand, with U in place of T, and it grows 5′ to 3′.',
  'RNA polymerase reads the template strand 3′ to 5′ and builds mRNA 5′ to 3′. The mRNA sequence matches the coding strand, with U where DNA had T.',
  400,
  250,
  [
    text(200, 18, 'transcription bubble', 15),
    text(16, 52, '5′', 12, 'start', 'muted'),
    text(70, 52, 'coding', 13, 'start'),
    line(130, 52, 370, 52, 'ink', 3),
    text(378, 52, '3′', 12, 'start', 'muted'),
    rect(150, 70, 120, 70, 'soft', 'accent', 16),
    text(210, 92, 'RNA polymerase', 11, 'middle', 'accent'),
    text(210, 112, 'bubble', 11, 'middle', 'muted', 500),
    text(16, 168, '3′', 12, 'start', 'muted'),
    text(70, 168, 'template', 13, 'start'),
    line(140, 168, 370, 168, 'ink', 3),
    text(378, 168, '5′', 12, 'start', 'muted'),
    ...arrow(150, 200, 300, 200),
    text(40, 200, '5′', 12, 'start', 'good'),
    text(318, 200, '3′', 12, 'start', 'good'),
    text(200, 228, 'mRNA matches the coding strand, U for T', 12, 'middle', 'good', 600),
  ],
);

const ribosomeSites = diagram(
  'animation-ribosome',
  'A ribosome with E, P, and A sites. mRNA 5′-AUG-3′ pairs antiparallel with the tRNA anticodon 3′-UAC-5′.',
  'The ribosome has an E site, a P site, and an A site. The tRNA anticodon pairs antiparallel to the codon: mRNA 5′-AUG-3′ meets tRNA 3′-UAC-5′.',
  400,
  270,
  [
    text(200, 18, 'antiparallel codon pairing', 14),
    ...chip(16, 40, 116, 44, 'E site', 'surface', 14),
    ...chip(142, 40, 116, 44, 'P site', 'soft', 14),
    ...chip(268, 40, 116, 44, 'A site', 'surface', 14),
    text(200, 104, 'tRNA', 13, 'middle', 'accent'),
    text(200, 126, '3′-UAC-5′', 16, 'middle', 'accent', 700, 'mono'),
    line(160, 142, 240, 142, 'accent', 1.5, '4 3'),
    text(16, 168, '5′', 13, 'start', 'muted'),
    line(44, 168, 150, 168, 'ink', 3),
    text(200, 168, 'AUG', 18, 'middle', 'ink', 700, 'mono'),
    line(250, 168, 350, 168, 'ink', 3),
    text(364, 168, '3′', 13, 'start', 'muted'),
    text(200, 200, 'mRNA codon 5′-AUG-3′', 14),
    text(200, 228, 'Met in the P site', 13, 'middle', 'muted', 600),
    text(200, 252, 'the next amino acid arrives at the A site', 12, 'middle', 'muted', 500),
  ],
);

const aminoAcid = diagram(
  'biochem-amino',
  'A free amino acid. The α carbon is attached to NH₃⁺, COO⁻, a hydrogen, and the side chain R.',
  'At ordinary cell pH a free amino acid has NH₃⁺ and COO⁻ on the α carbon, plus a hydrogen and a side chain R.',
  400,
  260,
  [
    text(200, 20, 'free amino acid, near pH 7', 14),
    circle(200, 118, 28, 'soft'),
    text(200, 118, 'Cα', 16),
    line(172, 118, 96, 118, 'ink', 2),
    line(228, 118, 304, 118, 'ink', 2),
    line(200, 90, 200, 58, 'ink', 2),
    line(200, 146, 200, 188, 'ink', 2),
    text(70, 118, 'NH₃⁺', 16, 'end'),
    text(332, 118, 'COO⁻', 16, 'start'),
    text(200, 40, 'H', 16),
    text(200, 214, 'R  side chain', 15),
    text(200, 244, 'α carbon at the center', 13, 'middle', 'muted', 600),
  ],
);

const peptideBond = diagram(
  'biochem-peptide',
  'Formation of a peptide bond. The carboxyl carbon of one amino acid joins the nitrogen of the next, and water leaves.',
  'A peptide bond is a condensation. The carboxyl carbon of one amino acid joins the nitrogen of the next, and water is released.',
  400,
  250,
  [
    text(200, 20, 'condensation', 15),
    ...chip(16, 48, 150, 44, 'amino acid 1', 'soft', 13),
    text(91, 112, 'carboxyl carbon', 12, 'middle', 'muted', 600),
    ...chip(234, 48, 150, 44, 'amino acid 2', 'surface', 13),
    text(309, 112, 'amino nitrogen', 12, 'middle', 'muted', 600),
    ...arrow(166, 70, 234, 70),
    text(200, 150, 'peptide bond', 16, 'middle', 'accent'),
    text(200, 176, 'C of one residue — N of the next', 13, 'middle', 'ink', 600),
    text(200, 214, 'water leaves', 15, 'middle', 'caution'),
  ],
);

const krebsYield = diagram(
  'krebs-yield',
  'One turn of the citric acid cycle for one acetyl-CoA in the mitochondrial matrix: 3 NADH, 1 FADH₂, 1 GTP, and 2 CO₂. Oxaloacetate is regenerated.',
  'Each acetyl-CoA that enters the mitochondrial matrix yields 3 NADH, 1 FADH₂, 1 GTP, and 2 CO₂. Oxaloacetate is regenerated for the next turn.',
  400,
  300,
  [
    text(200, 20, 'one acetyl-CoA', 15),
    ellipse(200, 150, 92, 70, 'soft', 'accent', 2),
    text(200, 138, 'citric acid cycle', 13, 'middle', 'accent'),
    text(200, 160, 'oxaloacetate', 13),
    text(200, 180, 'regenerated', 12, 'middle', 'muted', 600),
    ...arrow(200, 40, 200, 72),
    text(200, 36, '2 carbons in', 12, 'middle', 'muted', 600),
    ...chip(16, 70, 110, 36, '2 CO₂', 'surface', 14),
    ...chip(16, 210, 120, 36, '3 NADH', 'soft', 14),
    ...chip(146, 246, 108, 36, '1 FADH₂', 'soft', 14),
    ...chip(264, 210, 120, 36, '1 GTP', 'soft', 14),
    text(200, 292, 'mitochondrial matrix', 12, 'middle', 'muted', 600),
  ],
);

const glucoseBypass = diagram(
  'glucose-bypass',
  'The four gluconeogenesis bypasses. Pyruvate carboxylase and PEPCK bypass pyruvate kinase. Fructose 1,6-bisphosphatase bypasses PFK-1. Glucose 6-phosphatase bypasses hexokinase. Two pyruvate to one glucose costs 4 ATP, 2 GTP, and 2 NADH.',
  'Gluconeogenesis bypasses the three irreversible kinase steps of glycolysis. Pyruvate carboxylase and PEPCK bypass pyruvate kinase, fructose 1,6-bisphosphatase bypasses PFK-1, and glucose 6-phosphatase bypasses hexokinase. Two pyruvate make one glucose at a cost of 4 ATP, 2 GTP, and 2 NADH.',
  400,
  340,
  [
    text(200, 18, 'four bypass enzymes', 15),
    text(108, 48, 'glycolysis', 12, 'middle', 'muted', 700),
    text(292, 48, 'gluconeogenesis', 12, 'middle', 'accent', 700),
    ...chip(16, 64, 168, 36, 'hexokinase', 'surface', 13),
    ...chip(216, 64, 168, 52, 'glucose 6-phosphatase', 'soft', 12),
    ...chip(16, 136, 168, 36, 'PFK-1', 'surface', 13),
    ...chip(200, 136, 188, 52, 'fructose 1,6-bisphosphatase', 'soft', 10),
    ...chip(16, 208, 168, 36, 'pyruvate kinase', 'surface', 12),
    ...chip(200, 208, 188, 52, 'pyruvate carboxylase + PEPCK', 'soft', 10),
    text(200, 286, '2 pyruvate → 1 glucose', 14),
    text(200, 312, 'costs 4 ATP + 2 GTP + 2 NADH', 14, 'middle', 'accent'),
  ],
);

const cellMap = diagram(
  'intro-cell',
  'A cell showing where the pathways run. Glycolysis, the pentose phosphate pathway, and glycogen are in the cytosol. The citric acid cycle is in the mitochondrial matrix. The electron transport chain is in the inner membrane.',
  'Glycolysis, the pentose phosphate pathway, and glycogen metabolism run in the cytosol. The citric acid cycle runs in the mitochondrial matrix. Electron transport is in the inner mitochondrial membrane.',
  400,
  360,
  [
    text(200, 18, 'where each pathway runs', 15),
    ellipse(200, 180, 180, 130, 'soft', 'accent', 2),
    text(78, 78, 'cytosol', 14, 'start'),
    ...chip(28, 96, 130, 32, 'glycolysis', 'surface', 12),
    ...chip(28, 136, 150, 32, 'pentose phosphate', 'surface', 12),
    ...chip(28, 176, 110, 32, 'glycogen', 'surface', 12),
    ellipse(270, 210, 95, 72, 'bg', 'ink', 2),
    ellipse(270, 214, 68, 48, 'surface', 'accent', 2.5),
    text(270, 200, 'matrix', 13, 'middle', 'accent'),
    text(270, 218, 'citric acid cycle', 11, 'middle', 'ink', 600),
    text(270, 168, 'inner membrane', 11, 'middle', 'muted', 700),
    text(270, 268, 'outer membrane', 11, 'middle', 'muted', 600),
    text(200, 332, 'electron transport is in the inner membrane', 12, 'middle', 'muted', 600),
  ],
  true,
);

const balance = diagram(
  'intro-balance',
  'Catabolism is oxidative and convergent. Anabolism is reductive and divergent and spends ATP and NADPH.',
  'Catabolism breaks fuels down. It is oxidative and convergent. Anabolism builds molecules. It is reductive and divergent, and it spends ATP and NADPH.',
  400,
  250,
  [
    ...chip(16, 16, 176, 34, 'Catabolism', 'soft', 15),
    ...chip(208, 16, 176, 34, 'Anabolism', 'surface', 15),
    text(104, 74, 'oxidative', 16),
    text(296, 74, 'reductive', 16),
    text(104, 104, 'convergent', 14, 'middle', 'muted', 600),
    text(296, 104, 'divergent', 14, 'middle', 'muted', 600),
    ...arrow(104, 124, 104, 156),
    text(104, 176, 'many fuels', 13),
    text(104, 196, '→ acetyl-CoA', 13, 'middle', 'muted', 600),
    ...arrow(296, 156, 296, 124),
    text(296, 176, 'ATP + NADPH', 13, 'middle', 'accent'),
    text(296, 196, '→ many products', 13, 'middle', 'muted', 600),
    text(200, 230, 'NADPH is the biosynthetic reductant', 12, 'middle', 'muted', 500),
  ],
);

const atpMolecule = diagram(
  'atp-molecule',
  'ATP: adenine attached to ribose, then three phosphates labeled alpha, beta, and gamma. The sugar–phosphate link is a phosphoester. The links between phosphates are phosphoanhydrides. Hydrolysis to ADP and phosphate has ΔG°′ −30.5 kJ/mol.',
  'ATP has adenine, ribose, and three phosphates. Alpha is closest to the sugar. The sugar is joined by a phosphoester. The bonds between phosphates are phosphoanhydrides. ΔG°′ for ATP → ADP + Pi is −30.5 kJ/mol.',
  400,
  250,
  [
    text(200, 18, 'ATP → ADP + Pi', 15),
    ...chip(16, 48, 88, 40, 'adenine', 'soft', 13),
    ...chip(116, 48, 72, 40, 'ribose', 'surface', 13),
    circle(214, 68, 16, 'accent'),
    text(214, 68, 'α', 13, 'middle', 'on'),
    circle(268, 68, 16, 'accent'),
    text(268, 68, 'β', 13, 'middle', 'on'),
    circle(322, 68, 16, 'accent'),
    text(322, 68, 'γ', 13, 'middle', 'on'),
    line(188, 68, 198, 68, 'ink', 2),
    line(230, 68, 252, 68, 'ink', 2),
    line(284, 68, 306, 68, 'ink', 2),
    text(160, 112, 'phosphoester', 12, 'middle', 'muted', 700),
    text(268, 112, 'phosphoanhydride', 12, 'middle', 'accent', 700),
    text(200, 150, 'α is next to ribose', 13, 'middle', 'muted', 600),
    text(200, 174, 'γ is the outer phosphate', 13, 'middle', 'muted', 600),
    text(200, 214, 'ΔG°′ = −30.5 kJ/mol', 16, 'middle', 'good'),
  ],
);

const atpLadder = diagram(
  'atp-ladder',
  'Phosphoryl-transfer ladder. Phosphoenolpyruvate is −61.9, 1,3-bisphosphoglycerate is −49.4, phosphocreatine is −43.1, ATP is −30.5, and glucose 6-phosphate is −13.8 kJ/mol. Donors above ATP can phosphorylate ADP.',
  'ΔG°′ of hydrolysis, in kJ/mol: phosphoenolpyruvate −61.9, 1,3-bisphosphoglycerate −49.4, phosphocreatine −43.1, ATP −30.5, glucose 6-phosphate −13.8. A donor above ATP can phosphorylate ADP.',
  400,
  280,
  [
    text(200, 18, 'more negative = better donor', 13, 'middle', 'muted', 600),
    rect(188, 36, 150, 20, 'soft', 'line', 6),
    text(8, 46, 'Phosphoenolpyruvate', 11, 'start'),
    text(392, 46, '−61.9', 12, 'end', 'accent'),
    rect(188, 66, 120, 20, 'soft', 'line', 6),
    text(8, 76, '1,3-Bisphosphoglycerate', 10, 'start'),
    text(392, 76, '−49.4', 12, 'end', 'accent'),
    rect(188, 96, 104, 20, 'soft', 'line', 6),
    text(8, 106, 'Phosphocreatine', 11, 'start'),
    text(392, 106, '−43.1', 12, 'end', 'accent'),
    rect(188, 126, 74, 20, 'accent', 'accent', 6),
    text(8, 136, 'ATP', 12, 'start'),
    text(392, 136, '−30.5', 12, 'end', 'good'),
    rect(188, 156, 34, 20, 'surface', 'line', 6),
    text(8, 166, 'Glucose 6-phosphate', 11, 'start'),
    text(392, 166, '−13.8', 12, 'end', 'muted'),
    text(200, 214, 'Donors above ATP can', 14),
    text(200, 236, 'phosphorylate ADP', 14, 'middle', 'accent'),
    text(200, 262, 'values are ΔG°′ in kJ/mol', 12, 'middle', 'muted', 500),
  ],
);

function glyBox(y: number, label: string): Mark[] {
  return chip(16, y, 368, 26, label, 'surface', 13);
}

function glyGap(y: number, label: string): Mark[] {
  return [...arrow(36, y, 36, y + 16), text(214, y + 8, label, 11, 'middle', 'muted', 600)];
}

const glycolysisChart = diagram(
  'glycolysis-chart',
  'Glycolysis in the cytosol, from glucose to 2 pyruvate. Hexokinase and PFK-1 each spend 1 ATP. GAPDH makes 2 NADH. Phosphoglycerate kinase and pyruvate kinase make ATP. The net is 2 ATP and 2 NADH. Hexokinase, PFK-1, and pyruvate kinase are irreversible.',
  'In the cytosol, glucose becomes 2 pyruvate. The investment is −2 ATP, at hexokinase and PFK-1. The payoff is +4 ATP and 2 NADH. The net is 2 ATP and 2 NADH. Hexokinase, PFK-1, and pyruvate kinase are irreversible.',
  400,
  620,
  [
    text(200, 16, 'glycolysis', 16),
    ...glyBox(32, 'Glucose'),
    ...glyGap(58, 'hexokinase, −1 ATP'),
    ...glyBox(78, 'Glucose 6-phosphate'),
    ...glyGap(104, 'phosphoglucose isomerase'),
    ...glyBox(124, 'Fructose 6-phosphate'),
    ...glyGap(150, 'PFK-1, −1 ATP'),
    ...glyBox(170, 'Fructose 1,6-bisphosphate'),
    ...glyGap(196, 'aldolase; DHAP → GAP'),
    ...glyBox(216, '2 × glyceraldehyde 3-phosphate'),
    ...glyGap(242, 'GAPDH, +2 NADH'),
    ...glyBox(262, '2 × 1,3-bisphosphoglycerate'),
    ...glyGap(288, 'phosphoglycerate kinase, +2 ATP'),
    ...glyBox(308, '2 × 3-phosphoglycerate'),
    ...glyGap(334, 'phosphoglycerate mutase'),
    ...glyBox(354, '2 × 2-phosphoglycerate'),
    ...glyGap(380, 'enolase'),
    ...glyBox(400, '2 × phosphoenolpyruvate'),
    ...glyGap(426, 'pyruvate kinase, +2 ATP'),
    ...glyBox(446, '2 pyruvate'),
    rect(16, 488, 368, 112, 'soft', 'line', 12),
    text(200, 510, 'Cytosol', 14),
    text(200, 534, 'Investment −2 ATP', 13, 'middle', 'caution', 700),
    text(200, 556, 'Payoff +4 ATP and 2 NADH', 13, 'middle', 'good', 700),
    text(200, 578, 'Net 2 ATP and 2 NADH per glucose', 13),
  ],
  true,
);

const glycogenBranch = diagram(
  'glycogen-branch',
  'Glycogen. The chain is α-1,4. A branch is α-1,6. Glycogen phosphorylase releases glucose 1-phosphate and stops four residues before a branch. The debranching enzyme frees one glucose.',
  'Linear glycogen links are α-1,4. Branches are α-1,6. Glycogen phosphorylase releases glucose 1-phosphate and stops four residues before a branch. The debranching enzyme frees one glucose from the α-1,6 link.',
  400,
  280,
  [
    text(200, 18, 'glycogen', 15),
    circle(36, 150, 14, 'accent'),
    circle(84, 150, 14, 'soft'),
    circle(132, 150, 14, 'soft'),
    circle(180, 150, 14, 'c'),
    circle(228, 150, 14, 'soft'),
    circle(276, 150, 14, 'soft'),
    circle(324, 150, 14, 'g'),
    line(50, 150, 70, 150, 'ink', 2),
    line(98, 150, 118, 150, 'ink', 2),
    line(146, 150, 166, 150, 'ink', 2),
    line(194, 150, 214, 150, 'ink', 2),
    line(242, 150, 262, 150, 'ink', 2),
    line(290, 150, 310, 150, 'ink', 2),
    text(180, 118, 'α-1,4 chain', 13),
    circle(180, 78, 14, 'c'),
    line(180, 92, 180, 136, 'caution', 2),
    text(230, 78, 'α-1,6 branch', 13, 'start', 'caution'),
    text(36, 184, 'end', 11, 'middle', 'muted', 600),
    ...arrow(36, 196, 36, 214),
    text(200, 214, 'phosphorylase releases glucose 1-phosphate', 12),
    text(200, 238, 'stops four residues before a branch', 12, 'middle', 'muted', 600),
    text(200, 262, 'debranching enzyme frees one glucose', 12, 'middle', 'accent', 650),
  ],
);

const glycogenTissue = diagram(
  'glycogen-tissue',
  'Liver has glucose 6-phosphatase and can release glucose to the blood. Muscle does not. One glucosyl unit from glycogen nets 3 ATP when the path is anaerobic.',
  'Liver has glucose 6-phosphatase, so it can release free glucose. Muscle does not. Because phosphorolysis skips the hexokinase ATP, one glucosyl unit nets 3 ATP anaerobically.',
  400,
  210,
  [
    ...chip(16, 16, 176, 64, '', 'soft'),
    text(104, 36, 'Liver', 15),
    text(104, 58, 'glucose 6-phosphatase', 11, 'middle', 'accent', 650),
    ...chip(208, 16, 176, 64, '', 'surface'),
    text(296, 36, 'Muscle', 15),
    text(296, 58, 'no glucose 6-phosphatase', 11, 'middle', 'muted', 650),
    text(200, 112, 'liver can release blood glucose', 13),
    text(200, 136, 'muscle keeps the sugar for itself', 13, 'middle', 'muted', 600),
    text(200, 174, 'one glucosyl unit nets 3 ATP', 15, 'middle', 'good'),
    text(200, 196, 'when oxygen is absent', 12, 'middle', 'muted', 500),
  ],
);

const pentoseOx = diagram(
  'pentose-oxidative',
  'Oxidative pentose phosphate pathway in the cytosol. Glucose 6-phosphate becomes ribulose 5-phosphate, with 2 NADPH and CO₂. G6PD is inhibited by NADPH.',
  'In the cytosol, the oxidative branch converts glucose 6-phosphate to ribulose 5-phosphate and makes 2 NADPH and CO₂. G6PD is the committed step and is inhibited by NADPH.',
  400,
  270,
  [
    text(200, 18, 'oxidative branch · cytosol', 14),
    ...chip(70, 40, 260, 36, 'glucose 6-phosphate', 'surface', 13),
    ...arrow(200, 76, 200, 100),
    text(250, 88, 'G6PD', 13, 'start', 'accent'),
    text(250, 106, 'inhibited by NADPH', 11, 'start', 'caution', 600),
    ...chip(70, 116, 260, 36, '6-phosphogluconate', 'soft', 13),
    ...arrow(200, 152, 200, 176),
    text(248, 164, 'CO₂ leaves', 12, 'start', 'muted', 600),
    ...chip(70, 184, 260, 36, 'ribulose 5-phosphate', 'surface', 13),
    text(200, 244, 'products: 2 NADPH + CO₂', 15, 'middle', 'good'),
  ],
);

const pentoseNon = diagram(
  'pentose-nonoxidative',
  'Nonoxidative pentose phosphate pathway. Ribulose 5-phosphate can become ribose 5-phosphate, or carbon can return to fructose 6-phosphate and glyceraldehyde 3-phosphate. This runs in the cytosol.',
  'The nonoxidative branch, also in the cytosol, rearranges ribulose 5-phosphate into ribose 5-phosphate or back into fructose 6-phosphate and glyceraldehyde 3-phosphate.',
  400,
  230,
  [
    text(200, 18, 'nonoxidative branch · cytosol', 14),
    ...chip(70, 42, 260, 36, 'ribulose 5-phosphate', 'surface', 13),
    ...arrow(120, 86, 120, 118),
    ...arrow(280, 118, 280, 86),
    ...chip(16, 126, 176, 48, 'ribose 5-phosphate', 'soft', 12),
    ...chip(208, 126, 176, 48, 'fructose 6-phosphate', 'soft', 12),
    text(296, 190, '+ glyceraldehyde 3-phosphate', 11, 'middle', 'muted', 600),
    text(104, 196, 'for nucleotides', 12, 'middle', 'accent', 600),
  ],
);

const mitochondrion = diagram(
  'oxphos-mitochondrion',
  'A mitochondrion. The outer membrane, intermembrane space, inner membrane, and matrix are labeled. Complexes I, III, and IV and ATP synthase sit in the inner membrane. Complex I pumps 4 H⁺, Complex II pumps none, Complex III pumps 4 H⁺, and Complex IV pumps 2 H⁺ per 2 electrons. The NADH route is about 10 H⁺ and the succinate route about 6 H⁺. P/O is about 2.5 for NADH and 1.5 for succinate. O₂ is the terminal acceptor at Complex IV.',
  'Electron transport sits in the inner mitochondrial membrane. Complex I pumps 4 H⁺, Complex II pumps none, Complex III pumps 4 H⁺, and Complex IV pumps 2 H⁺ per 2 electrons. That is about 10 H⁺ for NADH and about 6 H⁺ for succinate. Classroom P/O ratios are about 2.5 per NADH and about 1.5 per succinate. O₂ accepts the electrons at Complex IV.',
  400,
  560,
  [
    text(200, 16, 'mitochondrion', 15),
    ellipse(200, 148, 176, 112, 'soft', 'accent', 2),
    text(200, 52, 'outer membrane', 12, 'middle', 'muted', 700),
    text(200, 74, 'intermembrane space', 12, 'middle', 'accent', 700),
    ellipse(200, 156, 122, 72, 'surface', 'ink', 2.5),
    text(200, 104, 'inner membrane', 12, 'middle', 'ink', 700),
    text(200, 128, 'matrix', 13, 'middle', 'accent'),
    text(200, 148, 'NADH', 12, 'middle', 'good', 700),
    ...chip(48, 176, 52, 36, 'I', 'accent', 16),
    ...chip(108, 176, 52, 36, 'II', 'surface', 16),
    ...chip(168, 176, 52, 36, 'III', 'accent', 14),
    ...chip(228, 176, 52, 36, 'IV', 'accent', 16),
    ...chip(288, 176, 64, 36, 'ATP', 'good', 13),
    text(74, 228, '4 H⁺', 11, 'middle', 'accent', 700),
    text(134, 228, '0', 11, 'middle', 'muted', 700),
    text(194, 228, '4 H⁺', 11, 'middle', 'accent', 700),
    text(254, 228, '2 H⁺', 11, 'middle', 'accent', 700),
    text(200, 258, 'complexes sit in the inner membrane', 12, 'middle', 'muted', 600),
    text(24, 292, 'Complex I pumps 4 H⁺', 13, 'start'),
    text(24, 316, 'Complex II pumps 0', 13, 'start'),
    text(24, 340, 'Complex III pumps 4 H⁺', 13, 'start'),
    text(24, 364, 'Complex IV pumps 2 H⁺ per 2 e⁻', 13, 'start'),
    text(24, 388, 'ATP synthase lets H⁺ back in', 13, 'start'),
    text(24, 420, 'NADH route ≈ 10 H⁺', 14, 'start', 'good'),
    text(24, 446, 'succinate route ≈ 6 H⁺', 14, 'start', 'good'),
    text(24, 472, 'P/O ≈ 2.5 per NADH', 14, 'start'),
    text(24, 496, 'P/O ≈ 1.5 per succinate', 14, 'start'),
    text(24, 528, 'O₂ is the terminal acceptor at Complex IV', 13, 'start', 'accent'),
  ],
  true,
);

export const DIAGRAMS: Record<FigureTopic, readonly Diagram[]> = {
  dogma: [dogmaHelix, dogmaFlow],
  crispr: [crisprCut],
  primers: [primerMap],
  mutations: [mutationKinds],
  sequences: [ecori, revcomp],
  codon: [codonRead, codonStops],
  animation: [transcriptionBubble, ribosomeSites],
  biochem: [aminoAcid, peptideBond],
  krebs: [krebsYield],
  glucose: [glucoseBypass],
  intro: [cellMap, balance],
  atp: [atpMolecule, atpLadder],
  glycolysis: [glycolysisChart],
  glycogenolysis: [glycogenBranch, glycogenTissue],
  pentose: [pentoseOx, pentoseNon],
  oxphos: [mitochondrion],
};

export function textsOf(diagram: Diagram): string[] {
  const texts: string[] = [];
  for (const mark of diagram.marks) {
    if (mark.kind === 'text') texts.push(mark.text);
  }
  return texts;
}

export function figureLabel(n: number): string {
  return `Figure ${n}`;
}

export function figureHeading(n: number, caption: string): string {
  return `${figureLabel(n)}. ${caption}`;
}
