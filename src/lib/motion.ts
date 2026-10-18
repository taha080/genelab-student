/**
 * Stage scripts for the lesson animations. The picture is drawn in the UI;
 * these sentences are the science a student should read at each step.
 */

export const MOTION_IDS = ['replication', 'ribosome', 'synthase', 'etc', 'glycolysis', 'glycogen', 'krebs'] as const;

export type MotionId = (typeof MOTION_IDS)[number];

export interface MotionStage {
  title: string;
  detail: string;
  /** Short label that pops out of the picture, when this step releases something. */
  badge?: string;
}

export interface MotionScript {
  id: MotionId;
  title: string;
  summary: string;
  stages: readonly MotionStage[];
}

const replication: MotionScript = {
  id: 'replication',
  title: 'DNA replication fork',
  summary:
    'A turning double helix opens at the fork. Helicase unwinds it. DNA polymerase can add nucleotides only in the 5′ to 3′ direction, so one new strand is continuous and the other is made in Okazaki fragments.',
  stages: [
    {
      title: 'B-DNA double helix',
      detail:
        'About 10.5 base pairs make one turn. A pairs with T by 2 hydrogen bonds, and G pairs with C by 3 hydrogen bonds. The strands are antiparallel.',
    },
    {
      title: 'Helicase opens the fork',
      detail: 'Helicase walks into the helix and breaks the hydrogen bonds, so the two strands unwind.',
    },
    {
      title: 'Leading strand',
      detail:
        'DNA polymerase adds nucleotides only 5′ to 3′. On the leading strand it moves toward the fork and copies continuously.',
    },
    {
      title: 'Lagging strand',
      detail:
        'The other new strand is also made 5′ to 3′, so it grows away from the fork in short Okazaki fragments. Each fragment begins with a short RNA primer.',
    },
  ],
};

const ribosome: MotionScript = {
  id: 'ribosome',
  title: 'Translation at the ribosome',
  summary:
    'A short synthetic mRNA, 5′-AUGUUUGGCUGC-3′, is read three bases at a time. tRNAs deliver amino acids, the peptide is transferred in the A site, and the ribosome steps toward the 3′ end.',
  stages: [
    {
      title: 'Start codon in the P site',
      detail:
        'The codon 5′-AUG-3′ sits in the P site. Initiator tRNA brings Met. Its anticodon is 3′-UAC-5′, antiparallel to the codon.',
    },
    {
      title: 'Phe-tRNA enters the A site',
      detail: 'The next codon is 5′-UUU-3′. Phenylalanine-tRNA enters the A site. Its anticodon is 3′-AAA-5′.',
      badge: 'Phe',
    },
    {
      title: 'First peptide bond',
      detail: 'Peptidyl transfer joins Met to Phe. The growing chain is passed onto the amino acid in the A site.',
      badge: 'Met–Phe',
    },
    {
      title: 'Translocation',
      detail:
        'The ribosome advances three nucleotides toward the 3′ end. The chain moves into the P site, and the empty tRNA leaves through the E site.',
    },
    {
      title: 'Gly-tRNA enters the A site',
      detail: 'Codon 5′-GGC-3′ is now in the A site. Glycine-tRNA enters. Its anticodon is 3′-CCG-5′.',
      badge: 'Gly',
    },
    {
      title: 'The chain adds glycine',
      detail: 'Another peptide bond makes Met–Phe–Gly on the A-site tRNA.',
      badge: 'Met–Phe–Gly',
    },
    {
      title: 'A second step along the mRNA',
      detail: 'Translocation again. The peptide-tRNA is now in the P site, and the A site is open for the next codon.',
    },
    {
      title: 'Cys-tRNA enters the A site',
      detail: 'Codon 5′-UGC-3′ pairs with cysteine-tRNA. The anticodon is 3′-ACG-5′.',
      badge: 'Cys',
    },
    {
      title: 'Four residues',
      detail: 'A peptide bond makes Met–Phe–Gly–Cys. The same A-site, P-site, and E-site cycle repeats for the next codon.',
      badge: 'Met–Phe–Gly–Cys',
    },
  ],
};

const synthase: MotionScript = {
  id: 'synthase',
  title: 'ATP synthase',
  summary:
    'Protons flow from the intermembrane space back into the matrix through F₀. That turns the rotor and the γ stalk. F₁ uses the motion to make ATP. The catalytic hexamer does not spin.',
  stages: [
    {
      title: 'Protons enter F₀',
      detail: 'Protons in the intermembrane space enter the F₀ channel and head back into the matrix.',
    },
    {
      title: 'The c-ring turns',
      detail: 'Proton passage rotates the c-ring in the inner membrane. The γ stalk is fixed to that rotor, so it turns too.',
    },
    {
      title: 'Loose, tight, and open',
      detail: 'The turning γ stalk cycles the three F₁ catalytic sites through loose, tight, and open. The F₁ hexamer stays still.',
    },
    {
      title: 'ATP is released',
      detail:
        'ADP and phosphate become ATP and leave into the matrix. The picture does not claim a fixed proton count per ATP, because moving ATP out of the mitochondrion also spends the gradient.',
      badge: 'ATP',
    },
  ],
};

const etc: MotionScript = {
  id: 'etc',
  title: 'Electron transport chain',
  summary:
    'Electrons from matrix NADH travel Complex I → Q → Complex III → cytochrome c → Complex IV → O₂. Complexes I, III, and IV pump protons. Complex II does not.',
  stages: [
    {
      title: 'NADH donates to Complex I',
      detail: 'Matrix NADH gives two electrons to Complex I. Complex I pumps 4 H⁺ into the intermembrane space.',
      badge: '4 H⁺',
    },
    {
      title: 'Electrons reach ubiquinone',
      detail: 'The electrons leave Complex I and reduce Q to QH₂. Q can also be reduced by Complex II.',
    },
    {
      title: 'Complex III and cytochrome c',
      detail: 'Complex III oxidizes QH₂, pumps 4 H⁺, and reduces cytochrome c on the outer face of the inner membrane.',
      badge: '4 H⁺',
    },
    {
      title: 'Oxygen accepts the electrons',
      detail: 'Complex IV pumps 2 H⁺ per 2 electrons and reduces O₂ to water. O₂ is the terminal acceptor.',
      badge: '2 H⁺',
    },
    {
      title: 'Succinate skips Complex I',
      detail:
        'Complex II passes electrons from succinate to Q and pumps 0 protons. Complexes III and IV still pump, so this route moves about 6 H⁺ rather than about 10 H⁺.',
    },
  ],
};

const glycolysis: MotionScript = {
  id: 'glycolysis',
  title: 'Glucose splits',
  summary:
    'In the cytosol, one glucose becomes two pyruvate. Two ATP are invested. The payoff returns four ATP and two NADH, so the net is 2 ATP and 2 NADH.',
  stages: [
    {
      title: 'Hexokinase spends ATP',
      detail: 'Hexokinase phosphorylates glucose. That spends 1 ATP and keeps the sugar in the cytosol. This step is irreversible.',
      badge: '−1 ATP',
    },
    {
      title: 'PFK-1 spends the second ATP',
      detail: 'PFK-1 makes fructose 1,6-bisphosphate. This is the second irreversible investment, another −1 ATP.',
      badge: '−1 ATP',
    },
    {
      title: 'The six-carbon sugar splits',
      detail:
        'Aldolase splits fructose 1,6-bisphosphate into two trioses. DHAP is isomerized to glyceraldehyde 3-phosphate, so both halves go on.',
    },
    {
      title: 'Two NADH appear',
      detail: 'GAPDH oxidizes both glyceraldehyde 3-phosphate molecules and reduces two NAD⁺, producing 2 NADH.',
      badge: '2 NADH',
    },
    {
      title: 'The payoff returns ATP',
      detail:
        'Phosphoglycerate kinase and pyruvate kinase form ATP. Four ATP are made. Pyruvate kinase is the third irreversible step.',
      badge: '+4 ATP',
    },
    {
      title: 'Two pyruvate',
      detail: 'Each glucose yields 2 pyruvate. Investment was −2 ATP. The net is 2 ATP and 2 NADH, in the cytosol.',
      badge: '2 pyruvate',
    },
  ],
};

const glycogen: MotionScript = {
  id: 'glycogen',
  title: 'Glycogen phosphorylase',
  summary:
    'Phosphorylase clips α-1,4 links at a nonreducing end and releases glucose 1-phosphate. It stops four residues before an α-1,6 branch. The debranching enzyme frees the last glucose at the branch.',
  stages: [
    {
      title: 'At the nonreducing end',
      detail: 'Glycogen phosphorylase binds the free end of an α-1,4 chain. The α-1,6 branch is farther back along the chain.',
    },
    {
      title: 'The first glucose leaves',
      detail: 'Phosphate attacks the terminal link. The product is glucose 1-phosphate, not free glucose.',
      badge: 'G1P',
    },
    {
      title: 'The next glucose leaves',
      detail: 'The enzyme moves to the new nonreducing end and releases another glucose 1-phosphate.',
      badge: 'G1P',
    },
    {
      title: 'One more α-1,4 link',
      detail: 'A third glucose 1-phosphate comes off. The branch point is getting close.',
      badge: 'G1P',
    },
    {
      title: 'It stops before the branch',
      detail:
        'Phosphorylase stops four residues before the α-1,6 branch. The debranching enzyme moves the outer three glucoses and then frees one glucose from the branch point.',
    },
  ],
};

const krebs: MotionScript = {
  id: 'krebs',
  title: 'Citric acid cycle',
  summary:
    'One acetyl-CoA enters the mitochondrial matrix. The cycle returns oxaloacetate and, per turn, releases 3 NADH, 1 FADH₂, 1 GTP, and 2 CO₂.',
  stages: [
    {
      title: 'Citrate synthase',
      detail: 'Acetyl-CoA (2 carbons) condenses with oxaloacetate. Citrate forms and coenzyme A leaves. This is the mitochondrial matrix.',
      badge: 'acetyl-CoA',
    },
    {
      title: 'Aconitase',
      detail: 'Aconitase moves the hydroxyl of citrate, through cis-aconitate, to make isocitrate. No NADH or CO₂ is released here.',
    },
    {
      title: 'Isocitrate dehydrogenase',
      detail: 'Isocitrate is oxidized and then loses CO₂. This is the first NADH and the first CO₂ of the turn.',
      badge: '1 NADH + CO₂',
    },
    {
      title: 'α-Ketoglutarate dehydrogenase',
      detail: 'α-Ketoglutarate becomes succinyl-CoA. This step releases the second NADH and the second CO₂.',
      badge: '1 NADH + CO₂',
    },
    {
      title: 'Succinyl-CoA synthetase',
      detail: 'The thioester pays for substrate-level phosphorylation. In animals the product counted here is 1 GTP.',
      badge: '1 GTP',
    },
    {
      title: 'Succinate dehydrogenase',
      detail: 'Succinate is oxidized to fumarate. The bound FAD passes electrons to ubiquinone. This enzyme is Complex II, and the textbook count is 1 FADH₂.',
      badge: '1 FADH₂',
    },
    {
      title: 'Fumarase',
      detail: 'Fumarase adds water across the double bond and makes L-malate. No cofactor is reduced.',
    },
    {
      title: 'Malate dehydrogenase',
      detail:
        'Malate is oxidized back to oxaloacetate, and the third NADH is formed. One turn per acetyl-CoA has now made 3 NADH, 1 FADH₂, 1 GTP, and 2 CO₂.',
      badge: '1 NADH',
    },
  ],
};

export const MOTION: Record<MotionId, MotionScript> = {
  replication,
  ribosome,
  synthase,
  etc,
  glycolysis,
  glycogen,
  krebs,
};

export function motionScript(id: MotionId): MotionScript {
  return MOTION[id];
}
