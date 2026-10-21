import type { StudyQuiz, StudyTopic } from './studyTypes';

function q(
  prompt: string,
  choices: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explanation: string,
): StudyQuiz {
  return { prompt, choices, answer, explanation };
}

export const STUDY_PART_1: readonly StudyTopic[] = [
  {
    id: 'biomolecules',
    title: 'Biomolecules',
    short: 'Biomolecules',
    kicker: 'The molecules of a cell',
    level: 'FSc Part I (NCP domain C) and BS Biochemistry',
    summary:
      'Carbohydrates, proteins, lipids, and nucleic acids are the four groups every FSc paper starts from. Polymers are built by condensation and split by hydrolysis. The amino-acid table and the live pathways stay on the Biochemistry and Metabolism tabs.',
    sections: [
      {
        heading: 'Polymers, water, and the bond that joins them',
        paragraphs: [
          'A monomer is a small unit. A polymer is many units joined in a chain. In a condensation reaction two molecules join and a molecule of water leaves. Hydrolysis is the reverse: water is added and the link breaks. Digestion is hydrolysis. Synthesis of starch, protein, and DNA is condensation.',
          'Water is the medium those reactions happen in. It is polar, so it forms hydrogen bonds. That is why it has a high specific heat, a high heat of vaporization, and cohesion. Ice is less dense than liquid water because the hydrogen-bond lattice holds the molecules farther apart. Cohesion of water is also what lets a column of xylem sap hold together.',
        ],
      },
      {
        heading: 'Carbohydrates',
        paragraphs: [
          'Carbohydrates contain carbon, hydrogen, and oxygen, often in the ratio of water. A monosaccharide is one sugar. Glucose is C6H12O6. Fructose is an isomer of glucose: same formula, different arrangement. A disaccharide is two sugars joined by a glycosidic bond. Maltose is glucose plus glucose. Sucrose is glucose plus fructose. Lactose is glucose plus galactose.',
          'Polysaccharides store or support. Starch is the plant store. Amylose is an unbranched chain of glucose with α-1,4 links. Amylopectin adds α-1,6 branches. Glycogen is the animal store and is branched more often, so many ends can be released at once. Cellulose is glucose too, but the link is β-1,4. Humans cannot digest that link, so cellulose is fibre, not a fuel. Chitin, in fungal walls and arthropod cuticle, is a modified glucose polymer.',
        ],
      },
      {
        heading: 'Proteins',
        paragraphs: [
          'An amino acid has an amino group, a carboxyl group, a hydrogen, and a side chain on the same carbon. The side chain decides the class: nonpolar, aromatic, polar, acidic, or basic. The Biochemistry tab lists all twenty. A peptide bond joins the carboxyl of one amino acid to the amino group of the next and releases water. The sequence of that chain is the primary structure.',
          'Hydrogen bonds along the backbone fold stretches into an α helix or a β sheet. That is secondary structure. Side chains then pack the chain into a tertiary shape. Disulfide bonds between cysteines can lock it. A protein with more than one chain has quaternary structure. Haemoglobin has four chains. Fibrous proteins such as collagen and keratin are structural. Globular proteins such as enzymes and haemoglobin are compact and usually soluble.',
        ],
      },
      {
        heading: 'Lipids',
        paragraphs: [
          'Lipids are not one polymer. They are grouped because they dissolve in nonpolar solvents. An acylglycerol is glycerol esterified to one, two, or three fatty acids. A triacylglycerol is the fat store. A saturated fatty acid has no carbon-carbon double bond. An unsaturated one has at least one, which kinks the chain and lowers the melting point.',
          'A phospholipid replaces one fatty acid with a phosphate-bearing head. The head likes water and the tails do not, so phospholipids form bilayers. That is the basis of membranes. Waxes are long-chain alcohols esterified to fatty acids and waterproof a surface. Terpenes are built from isoprene units. Steroids, including cholesterol, are four-ring lipids. Cholesterol sits in animal membranes and is the starting material for bile acids and steroid hormones. Prostaglandins are local lipid signals made from a 20-carbon fatty acid.',
        ],
      },
      {
        heading: 'Nucleic acids and conjugated molecules',
        paragraphs: [
          'A nucleotide is a pentose sugar, a nitrogenous base, and one or more phosphates. In DNA the sugar is deoxyribose and the bases are A, T, G, and C. In RNA the sugar is ribose and uracil replaces thymine. A phosphodiester bond joins the 3′ carbon of one sugar to the 5′ phosphate of the next. DNA is a double helix. A pairs with T by two hydrogen bonds. G pairs with C by three. The strands run antiparallel. RNA is usually single-stranded. mRNA carries the message, tRNA brings amino acids, and rRNA is part of the ribosome. The Central dogma tab walks a real sequence through that path.',
          'Some molecules are conjugates. A glycoprotein is protein plus carbohydrate, as on the cell surface. A glycolipid is lipid plus carbohydrate. A lipoprotein carries lipids in blood. A nucleoprotein is protein plus nucleic acid, as in a ribosome or a chromosome. ATP is a nucleotide used as an energy currency. NAD is a dinucleotide used to carry electrons. Both are taught again with the pathways.',
        ],
      },
    ],
    definitions: [
      { term: 'Condensation', meaning: 'Two molecules join and water is released.' },
      { term: 'Hydrolysis', meaning: 'A bond is broken by the addition of water.' },
      { term: 'Glycosidic bond', meaning: 'The link between two sugar units.' },
      { term: 'Peptide bond', meaning: 'The amide link between two amino acids.' },
      { term: 'Phosphodiester bond', meaning: 'The sugar–phosphate link in DNA and RNA.' },
      { term: 'Primary structure', meaning: 'The order of amino acids in a polypeptide.' },
    ],
    worked: {
      title: 'Sickle-cell haemoglobin is one changed residue',
      prompt: 'Adult haemoglobin A has glutamate at position 6 of each β chain. In sickle-cell haemoglobin that residue is valine. Explain what kind of change this is.',
      steps: [
        'The DNA coding codon GAG specifies glutamate. The sickle allele uses GTG at that position.',
        'Transcription writes GTG as the mRNA codon GUG. GUG specifies valine. The Mutations tab calls a codon change that swaps one amino acid a missense mutation.',
        'Glutamate is charged and likes water. Valine is nonpolar. The new sticky patch lets deoxygenated haemoglobin molecules pack into fibres.',
        'The fibres distort the red cell into a sickle shape. The gene is inherited. The molecule fails because the sequence failed.',
      ],
      result:
        'One missense change, glutamate to valine at β6, is enough to change the solubility of haemoglobin. Sequence is the primary structure, and primary structure decides the fold.',
    },
    pakistan: {
      title: 'Wheat, cotton, and a protein that matters locally',
      body:
        'Wheat and rice starch, and the cellulose in bran, are the carbohydrate lesson on a Pakistani plate. Cotton fibre is almost pure cellulose, which is why the β-1,4 link is an agriculture fact as well as a chemistry fact. For protein, beta-thalassemia is the local genetic disease to connect with this chapter: it is a fault in making the β-globin chain. The inheritance page works that cross.',
    },
    keyPoints: [
      'Condensation builds a polymer and releases water. Hydrolysis breaks it.',
      'Glucose, fructose, and galactose are monosaccharides. Sucrose, maltose, and lactose are disaccharides.',
      'Starch and glycogen use α links and store glucose. Cellulose uses β links and does not.',
      'Protein structure has four levels. Fibrous proteins support. Globular proteins usually work in solution.',
      'Phospholipids make bilayers. Steroids are lipids with four rings.',
      'DNA uses A–T and G–C. RNA uses U instead of T. mRNA, tRNA, and rRNA have different jobs.',
    ],
    quiz: [
      q(
        'Which bond joins two amino acids?',
        ['Glycosidic bond', 'Peptide bond', 'Phosphodiester bond', 'Hydrogen bond only'],
        1,
        'A peptide bond is the covalent link in a protein chain. Hydrogen bonds stabilize the fold but do not join the residues in the backbone.',
      ),
      q(
        'Why can humans digest starch but not cellulose?',
        [
          'Cellulose is not made of glucose',
          'Starch uses α links and cellulose uses β-1,4 links',
          'Cellulose has peptide bonds',
          'Starch is a lipid',
        ],
        1,
        'Both are glucose polymers. Our enzymes hydrolyse the α links of starch. They do not hydrolyse the β-1,4 links of cellulose.',
      ),
      q(
        'In the DNA double helix, guanine pairs with cytosine by how many hydrogen bonds?',
        ['One', 'Two', 'Three', 'Four'],
        2,
        'A–T pairs use two hydrogen bonds. G–C pairs use three. That is why a GC-rich stretch is harder to separate.',
      ),
      q(
        'Sickle-cell haemoglobin differs from haemoglobin A by which change?',
        [
          'A missing haem group',
          'Glutamate replaced by valine at position 6 of the β chain',
          'Loss of the entire α chain',
          'A change from DNA to RNA',
        ],
        1,
        'The classic allele is a missense mutation: glutamate, which is charged, becomes valine, which is hydrophobic, at β6.',
      ),
    ],
    shorts: [
      {
        prompt: 'Describe how a disaccharide is formed and broken. Use sucrose as the example.',
        answer:
          'Sucrose is a disaccharide of glucose and fructose. The two monosaccharides join by a glycosidic bond in a condensation reaction, and one molecule of water is released. The reverse reaction is hydrolysis: water is added across the glycosidic bond and free glucose and fructose are produced. The same condensation-and-hydrolysis pattern builds and breaks starch, protein, and nucleic acids, with a different bond in each case.',
      },
      {
        prompt: 'Distinguish primary, secondary, tertiary, and quaternary structure of a protein.',
        answer:
          'Primary structure is the sequence of amino acids held by peptide bonds. Secondary structure is local folding of the backbone into an α helix or a β sheet, held by hydrogen bonds. Tertiary structure is the overall three-dimensional shape of one chain, held by side-chain interactions, including hydrophobic packing, ionic bonds, hydrogen bonds, and sometimes disulfide bonds. Quaternary structure exists only when two or more polypeptide chains assemble, as in haemoglobin. A change in the primary sequence can spoil every level above it, which is what happens in sickle-cell haemoglobin.',
      },
    ],
    related: [
      { label: 'Amino acids and kinetics', hash: 'biochem' },
      { label: 'Central dogma', hash: 'central-dogma' },
      { label: 'Inheritance', hash: 'study/inheritance' },
    ],
  },
  {
    id: 'enzymes',
    title: 'Enzymes',
    short: 'Enzymes',
    kicker: 'Catalysts with a shape',
    level: 'FSc Part I (NCP domain F) and BS Biochemistry',
    summary:
      'Enzymes speed a reaction by lowering activation energy. They do not change the equilibrium. This page covers the active site, cofactors, temperature, pH, and inhibition. The live Michaelis–Menten curve is on the Biochemistry tab.',
    sections: [
      {
        heading: 'A protein catalyst, and a few that are RNA',
        paragraphs: [
          'An enzyme is a biological catalyst. Most enzymes are globular proteins. A few catalysts are RNA. The peptidyl transferase centre of the ribosome is the example already noted on the macromolecule cards. The enzyme is not used up. A small amount can turn over a large amount of substrate.',
          'The reaction an enzyme catalyses has the same start and end points with or without the enzyme. What changes is the path. The activation energy is the hill the reactants must cross. The enzyme stabilises the transition state, so the hill is lower and more molecules cross per second. The free-energy difference between reactants and products, ΔG, is unchanged. An enzyme does not make an impossible reaction possible. It makes a possible reaction fast.',
        ],
      },
      {
        heading: 'Lock and key, and induced fit',
        paragraphs: [
          'The active site is the cleft where the substrate binds and the chemistry happens. Amino acids there both hold the substrate and take part in the reaction. Fischer’s lock-and-key model said the site is a rigid shape that already matches the substrate. It explains specificity, but it does not explain how binding itself helps the reaction.',
          'Koshland’s induced-fit model is the one to use in an answer. The site is flexible. When the substrate arrives, the site closes around it. Bonds in the substrate are strained, and catalytic groups are brought into place. A molecule that is only roughly the right shape may bind weakly and then fail to induce the working shape. That is specificity with a mechanism, not just a matching outline.',
        ],
      },
      {
        heading: 'Cofactors',
        paragraphs: [
          'Some enzymes need a non-protein helper. An inorganic ion such as Mg2+ or Zn2+ is one class. Kinases use ATP as a complex with magnesium. Carboxypeptidase uses zinc. A prosthetic group is bound tightly and stays with the enzyme. Haem in catalase is the usual example. A coenzyme is bound loosely, carries a chemical group or electrons, and is regenerated. NAD+ and coenzyme A are coenzymes. Many coenzymes are made from vitamins. NAD+ comes from niacin.',
          'The apoenzyme is the protein alone. The holoenzyme is the protein plus its cofactor. Without the cofactor the active site is incomplete, so the rate collapses even if the protein fold is still there.',
        ],
      },
      {
        heading: 'Temperature, pH, and concentration',
        paragraphs: [
          'Raising the temperature makes molecules collide faster, so the rate rises. Past the optimum the protein denatures, the active site loses its shape, and the rate falls. Human enzymes are often near their optimum around 37°C. Enzymes of thermophilic microbes, including the Taq polymerase used in PCR, are built to stay folded at much higher temperatures.',
          'pH changes the charges on side chains in the active site. Each enzyme has an optimum. Pepsin, in the stomach, is near pH 2. Trypsin, in the small intestine, is near pH 8. Papain, from papaya, works around neutral, near pH 7. Far from the optimum the enzyme denatures or the catalytic groups are in the wrong charge state. If the substrate is plentiful, the rate rises in proportion to the enzyme concentration. If the substrate runs out, adding more enzyme does nothing.',
        ],
      },
      {
        heading: 'Inhibition',
        paragraphs: [
          'A competitive inhibitor resembles the substrate and binds the active site. It does not change the chemistry of the enzyme that does get a substrate. At very high substrate the inhibitor is crowded out, so Vmax is unchanged. At ordinary substrate concentrations the enzyme looks less eager for substrate, so the apparent Km rises. Malonate competing with succinate at succinate dehydrogenase is the standard example, and it is also on the oxidative phosphorylation page.',
          'A non-competitive inhibitor binds a different site. In the pure classroom model it does not change Km, because the remaining working enzyme still has the same affinity, but it removes enzyme from the working pool, so Vmax falls. Extra substrate does not fix that. Real inhibitors are often mixed, and the Lineweaver–Burk picture is then less tidy. For the board, state the pure cases and say that they are the classroom model. The Biochemistry tab plots the uninhibited equation so you can see Km and Vmax before you add an inhibitor in your head.',
        ],
      },
    ],
    definitions: [
      { term: 'Activation energy', meaning: 'The energy barrier between reactants and the transition state.' },
      { term: 'Active site', meaning: 'The part of the enzyme that binds substrate and catalyses the reaction.' },
      { term: 'Induced fit', meaning: 'The active site changes shape as the substrate binds.' },
      { term: 'Km', meaning: 'The substrate concentration at which the rate is half of Vmax.' },
      { term: 'Vmax', meaning: 'The rate when the enzyme is saturated with substrate.' },
      { term: 'Coenzyme', meaning: 'A loose organic cofactor, often built from a vitamin, that is recycled.' },
    ],
    worked: {
      title: 'Competitive inhibition on the Michaelis–Menten equation',
      prompt: 'An enzyme has Vmax = 100 and Km = 10, in the same units as the kinetics bench. The substrate concentration is 10. A competitive inhibitor raises the apparent Km to 20. Find the rate before and after.',
      steps: [
        'The equation is v = Vmax [S] / (Km + [S]).',
        'Before inhibition, [S] equals Km, so v = 100 × 10 / (10 + 10) = 50. That is the definition of Km: half of Vmax.',
        'After the inhibitor, use the apparent Km. v = 100 × 10 / (20 + 10) = 1000 / 30 = 33.3.',
        'Vmax did not change. If [S] were made very large, both rates would approach 100. That is how you recognise competitive inhibition on a graph: same y-intercept on a Lineweaver–Burk plot, different x-intercept.',
      ],
      result:
        'The rate falls from 50 to 33.3 at this substrate concentration, but the ceiling stays 100. Extra substrate can still reach Vmax. That is the opposite of non-competitive inhibition, where the ceiling itself drops.',
    },
    pakistan: {
      title: 'Papain, heat, and a lab curve',
      body:
        'Papaya is grown in Sindh and in kitchen gardens across the country, and papain is the textbook enzyme whose optimum is near neutral. The comparison the syllabus wants is pepsin at about pH 2, trypsin at about pH 8, and papain near pH 7. When a practical asks you to explain a hump-shaped temperature graph, describe more collisions on the way up and denaturation on the way down. Do not say the enzyme is “killed”. It is unfolded.',
    },
    keyPoints: [
      'Enzymes lower activation energy. They do not change ΔG or the equilibrium.',
      'Induced fit is the model to describe. Lock and key is the older, rigid picture.',
      'Cofactors are ions, prosthetic groups, or coenzymes. NAD+ is a coenzyme.',
      'Rate rises with temperature until the enzyme denatures. Each enzyme has an optimum pH.',
      'Competitive inhibition: apparent Km up, Vmax unchanged. Non-competitive: Vmax down.',
      'At [S] = Km, v = Vmax / 2. The kinetics bench plots this.',
    ],
    quiz: [
      q(
        'What does an enzyme change?',
        [
          'The equilibrium constant, by being used up',
          'The activation energy, not ΔG',
          'The atomic identity of the product',
          'The temperature of the cell to 100°C',
        ],
        1,
        'The enzyme lowers the activation energy and is regenerated. The free-energy difference between reactants and products stays the same.',
      ),
      q(
        'Which model says the active site moulds around the substrate?',
        ['Lock and key', 'Induced fit', 'Fluid mosaic', 'Endosymbiosis'],
        1,
        'Induced fit is Koshland’s model. Lock and key, from Fischer, treats the site as rigid.',
      ),
      q(
        'A competitive inhibitor changes the classroom graph by',
        [
          'Lowering Vmax and leaving Km the same',
          'Raising apparent Km and leaving Vmax the same',
          'Removing the protein’s primary structure',
          'Turning the reaction into an equilibrium with a new ΔG',
        ],
        1,
        'The inhibitor and the substrate compete for the active site. Saturating substrate still reaches the original Vmax, so only the apparent Km rises.',
      ),
      q(
        'Pepsin and trypsin differ mainly in',
        [
          'Pepsin working near pH 2 and trypsin near pH 8',
          'Pepsin being RNA and trypsin being DNA',
          'Trypsin lowering ΔG and pepsin raising it',
          'Both working only at 100°C',
        ],
        0,
        'The stomach is acid, so pepsin’s optimum is near pH 2. The small intestine is nearer pH 8, which suits trypsin.',
      ),
    ],
    shorts: [
      {
        prompt: 'Explain induced fit and compare it with the lock-and-key model.',
        answer:
          'In the lock-and-key model the active site is a rigid shape that already matches the substrate, as a lock matches one key. It accounts for specificity but not for how binding helps the chemistry. In the induced-fit model the active site is flexible. Substrate binding changes the shape of the site, strains bonds in the substrate, and lines up the catalytic groups. A poor mimic may bind weakly and fail to induce that working shape. Induced fit is the explanation expected for the mechanism of enzyme action.',
      },
      {
        prompt: 'Distinguish competitive and non-competitive inhibition, including the effect on Km and Vmax.',
        answer:
          'A competitive inhibitor resembles the substrate and binds the active site. While it is bound, substrate cannot bind. High substrate displaces it, so Vmax is unchanged and the apparent Km rises. Malonate at succinate dehydrogenase is the usual example. A non-competitive inhibitor binds a different site. In the pure classroom model it lowers Vmax because fewer enzyme molecules can work, and Km stays the same. Adding substrate does not restore Vmax. On a Lineweaver–Burk plot, competitive lines meet on the y-axis. Pure non-competitive lines meet on the x-axis.',
      },
    ],
    related: [
      { label: 'Kinetics bench', hash: 'biochem' },
      { label: 'Oxidative phosphorylation', hash: 'metabolism/oxphos' },
      { label: 'PCR and Taq', hash: 'study/pcr' },
    ],
  },
  {
    id: 'cell',
    title: 'The cell',
    short: 'The cell',
    kicker: 'Organelles, membrane, division',
    level: 'FSc Part I (NCP domain D) and BS Cell Biology',
    summary:
      'Cells are the unit of life. This page covers the two cell plans, the jobs of the organelles, how substances cross the membrane, and how mitosis differs from meiosis. Mitochondrial pathways stay on the Metabolism tab.',
    sections: [
      {
        heading: 'Cell theory and two plans',
        paragraphs: [
          'Cell theory says that living things are made of cells, that the cell is the basic unit of structure and function, and that cells arise from existing cells. Viruses are the usual exception named in class: they are not cells and they do not reproduce alone. The first cells also had no parent cell. Those limits belong in an answer if the question asks for exceptions.',
          'A prokaryotic cell has no nucleus. Its DNA is a nucleoid, its ribosomes are 70S, and it has no mitochondria, no chloroplasts, and no endoplasmic reticulum. Bacteria are prokaryotes. A eukaryotic cell encloses its chromosomes in a nucleus, has 80S ribosomes in the cytosol, and divides the work among membrane-bound organelles. Plants, animals, fungi, and protists are eukaryotes. Both plans have a plasma membrane, DNA, ribosomes, and a cytosol.',
        ],
      },
      {
        heading: 'Organelles and what they do',
        paragraphs: [
          'The nucleus stores the chromosomes and builds ribosome subunits in the nucleolus. Ribosomes read mRNA and make protein. Free ribosomes make proteins that stay in the cytosol. Ribosomes on the rough endoplasmic reticulum make proteins that will be secreted or placed in a membrane. The smooth endoplasmic reticulum makes lipids and detoxifies some molecules. The Golgi apparatus sorts and modifies those products and packs them into vesicles.',
          'Mitochondria run the citric acid cycle and oxidative phosphorylation. Those pathways are already lessons on this bench. Chloroplasts, in plants and algae, run photosynthesis. Lysosomes hold hydrolytic enzymes. Peroxisomes carry out oxidative reactions, including the breakdown of hydrogen peroxide by catalase. Vacuoles in plant cells store sap and keep the cell turgid. Centrioles help organise the spindle in animal cells. A plant cell wall is cellulose outside the membrane. A bacterial wall is peptidoglycan and is a different structure.',
        ],
      },
      {
        heading: 'The membrane and transport',
        paragraphs: [
          'The plasma membrane is a phospholipid bilayer with proteins floating in it. That is the fluid-mosaic model of Singer and Nicolson. Cholesterol in animal membranes modulates fluidity. Glycoproteins and glycolipids on the outer face are recognition marks. A single phospholipid has glycerol, two fatty-acid tails, and a phosphate head. One tail is often unsaturated, which keeps the bilayer from packing solid.',
          'Simple diffusion is the unaided movement of a small nonpolar molecule, such as oxygen or carbon dioxide, down its gradient. Facilitated diffusion uses a channel or a carrier but still goes downhill and does not spend ATP. Osmosis is the diffusion of water toward the side with more solute. Active transport moves a solute up its gradient and spends ATP. The sodium-potassium pump is the example. Endocytosis brings a vesicle in. Exocytosis sends one out. Phagocytosis is endocytosis of a large particle.',
        ],
      },
      {
        heading: 'Signals and stem cells',
        paragraphs: [
          'A signal that cannot cross the bilayer, such as many peptide hormones, binds a receptor on the surface. The receptor then changes something inside the cell. A steroid hormone is lipid-soluble, so it can cross the membrane and bind a receptor inside the cell, often affecting transcription. The same hormone word covers both routes. The route depends on the chemistry of the signal.',
          'A stem cell can divide and also produce more specialised cells. A totipotent cell, the zygote, can make the whole organism and the extraembryonic tissues. A pluripotent cell can make every cell type of the body. A multipotent cell, such as a bone-marrow stem cell, has a narrower menu. Induced pluripotent stem cells are adult cells returned to a pluripotent state by a set of transcription factors. They avoid using an embryo. The cost is that reprogramming can be incomplete, and dividing reprogrammed cells can form tumours, so they are a research tool with real limits.',
        ],
      },
      {
        heading: 'Mitosis and meiosis',
        paragraphs: [
          'Mitosis makes two nuclei with the same chromosome number as the parent. In prophase the chromosomes condense and the spindle forms. In metaphase they line up at the equator, attached at the kinetochores. In anaphase sister chromatids separate. In telophase nuclear envelopes reform. Cytokinesis then splits the cytoplasm: a cleavage furrow in animal cells, a cell plate in plant cells. Mitosis is for growth and repair, not for making gametes.',
          'Meiosis makes haploid cells for sexual reproduction and shuffles alleles. In prophase I homologous chromosomes pair and crossing over exchanges pieces. In metaphase I pairs line up, not single chromosomes. In anaphase I homologues separate, so the chromosome number is halved. Meiosis II separates sister chromatids and looks more like mitosis. One diploid cell can yield four genetically different haploid cells. In humans, mitosis keeps 46 chromosomes. Meiosis produces gametes with 23.',
        ],
      },
    ],
    definitions: [
      { term: 'Prokaryote', meaning: 'A cell with no nucleus and no membrane-bound organelles.' },
      { term: 'Eukaryote', meaning: 'A cell whose DNA is inside a nucleus and which has organelles.' },
      { term: 'Fluid mosaic', meaning: 'A phospholipid bilayer with proteins able to move sideways in it.' },
      { term: 'Osmosis', meaning: 'Diffusion of water across a membrane toward the higher solute side.' },
      { term: 'Totipotent', meaning: 'Able to give rise to a whole organism, including extraembryonic tissues.' },
      { term: 'Crossing over', meaning: 'Exchange of DNA between homologous chromosomes in prophase I.' },
    ],
    worked: {
      title: 'Where does a secreted protein go?',
      prompt: 'A protein is going to be released from the cell. List the compartments in order.',
      steps: [
        'The mRNA is read by a ribosome that docks on the rough endoplasmic reticulum. The growing chain enters the ER.',
        'In the ER the chain folds and may receive the start of a carbohydrate tag.',
        'A vesicle carries it to the Golgi apparatus. The Golgi finishes the modifications and sorts it.',
        'A secretory vesicle leaves the Golgi, fuses with the plasma membrane, and releases the protein by exocytosis.',
      ],
      result:
        'The path is rough ER, then Golgi, then a secretory vesicle, then exocytosis. A protein that works in the cytosol never enters that path. It is made on a free ribosome and stays inside.',
    },
    pakistan: {
      title: 'Why the microscope practical asks about plant cells',
      body:
        'Onion epidermis is the usual classroom tissue because the cells are large and the wall is obvious. What you are seeing is the wall and, with stain, the nucleus. Chloroplasts are not in an onion-bulb scale. They are in a leaf. If a viva asks why a leaf cell and an onion cell both count as plant cells, the answer is the wall, the vacuole, and the eukaryotic plan, not the presence of chloroplasts in every cell.',
    },
    keyPoints: [
      'Prokaryotes have a nucleoid and 70S ribosomes. Eukaryotes have a nucleus and 80S cytosolic ribosomes.',
      'Secreted proteins travel rough ER to Golgi to a vesicle. Cytosolic proteins do not.',
      'Diffusion is downhill. Active transport is uphill and spends ATP. Osmosis is about water.',
      'Peptide signals usually bind outside. Steroid signals can bind inside.',
      'Mitosis keeps the chromosome number. Meiosis halves it and recombines alleles in prophase I.',
      'Totipotent, pluripotent, and multipotent describe how many cell types a stem cell can make.',
    ],
    quiz: [
      q(
        'Which feature is found in a bacterium and not in a human liver cell?',
        ['A plasma membrane', '70S ribosomes and a nucleoid', 'DNA', 'Ribosomes of any kind'],
        1,
        'Both cells have a membrane, DNA, and ribosomes. The bacterial ribosome is 70S and the chromosome is a nucleoid, not a nucleus.',
      ),
      q(
        'A protein hormone that cannot cross the bilayer signals by',
        [
          'Binding a receptor inside the nucleus directly, with no surface step',
          'Binding a surface receptor',
          'Becoming part of the peptidoglycan wall',
          'Replacing the phosphate heads of the membrane',
        ],
        1,
        'Peptide and protein signals are not lipid-soluble. They bind receptors on the cell surface, and the message is passed inward.',
      ),
      q(
        'Crossing over happens in',
        ['Mitotic metaphase', 'Prophase I of meiosis', 'Cytokinesis', 'Prophase II only'],
        1,
        'Homologous chromosomes pair and exchange DNA in prophase I. That is a main source of new allele combinations.',
      ),
      q(
        'Which transport needs ATP?',
        ['Simple diffusion of oxygen', 'Osmosis', 'Facilitated diffusion down a gradient', 'Active transport against a gradient'],
        3,
        'Movement down a gradient can use a protein and still spend no ATP. Moving a solute up its gradient is active transport.',
      ),
    ],
    shorts: [
      {
        prompt: 'Compare a prokaryotic cell with a eukaryotic cell.',
        answer:
          'A prokaryotic cell has no nuclear envelope. Its DNA lies in a nucleoid, often as one circular chromosome, and it may carry plasmids. Ribosomes are 70S. There are no mitochondria, chloroplasts, or endoplasmic reticulum. Bacteria have a peptidoglycan wall. A eukaryotic cell has a true nucleus, linear chromosomes, and 80S ribosomes in the cytosol. It contains membrane-bound organelles, including mitochondria. Plant cells also have a cellulose wall, a large vacuole, and, in photosynthetic tissues, chloroplasts. Both kinds of cell have a plasma membrane, DNA, and the ability to make protein.',
      },
      {
        prompt: 'Explain the stages of mitosis and say how meiosis I differs.',
        answer:
          'In prophase chromosomes condense and the spindle assembles. In metaphase they align at the equator. In anaphase sister chromatids separate and move to opposite poles. In telophase the envelopes reform, and cytokinesis divides the cytoplasm. The two nuclei have the same chromosome number as the parent. In meiosis I, homologous chromosomes pair and cross over in prophase I, then separate in anaphase I. Sister chromatids stay together through meiosis I, and the chromosome number is halved. Sister chromatids separate later, in meiosis II.',
      },
    ],
    related: [
      { label: 'Mitochondria and ATP', hash: 'metabolism/oxphos' },
      { label: 'Photosynthesis', hash: 'study/photosynthesis' },
      { label: 'Inheritance', hash: 'study/inheritance' },
    ],
  },
  {
    id: 'photosynthesis',
    title: 'Photosynthesis',
    short: 'Photosynthesis',
    kicker: 'Light, then carbon',
    level: 'FSc Part I bioenergetics and BS Biochemistry',
    summary:
      'Photosynthesis stores light energy in carbohydrate and releases oxygen. The light reactions make ATP and NADPH. The Calvin cycle spends them to fix carbon dioxide. Glycolysis, the citric acid cycle, and the respiratory chain are already on this bench. This page is the missing half of bioenergetics.',
    sections: [
      {
        heading: 'The equation and the chloroplast',
        paragraphs: [
          'The summary equation is 6 CO2 + 6 H2O → C6H12O6 + 6 O2, in the light, with chlorophyll. It is a summary. The chloroplast does not assemble a free glucose molecule in one step. It makes triose phosphates, and those are then used to make glucose, starch, or sucrose. The oxygen comes from water, not from carbon dioxide. That was shown with labelled oxygen.',
          'A chloroplast has an outer membrane and an inner membrane. Inside is the stroma, a solution of enzymes. Thylakoid membranes are stacked in places into grana. Chlorophyll and the electron carriers sit in the thylakoid membrane. The Calvin-cycle enzymes sit in the stroma. Putting the two stages in different compartments is the same idea as putting the respiratory chain in the inner mitochondrial membrane and the citric acid cycle in the matrix.',
        ],
      },
      {
        heading: 'Pigments and the light reactions',
        paragraphs: [
          'Chlorophyll a is the main pigment at the reaction centres. Chlorophyll b and the carotenoids absorb other wavelengths and pass the energy on. They also broaden the colours a leaf can use. A photosystem is the antenna pigments plus a reaction centre.',
          'In non-cyclic electron flow, light drives photosystem II. It splits water. The electrons replace those lost from the reaction centre, protons are left in the thylakoid lumen, and oxygen is released. Electrons travel through a chain to photosystem I. A second light step lets photosystem I reduce NADP+ to NADPH. The proton gradient drives ATP synthase. That ATP synthesis is photophosphorylation. Cyclic flow uses only photosystem I. Electrons return to the chain, extra ATP is made, and neither NADPH nor oxygen is produced. Plants use cyclic flow when the Calvin cycle needs more ATP than the non-cyclic path supplies.',
        ],
      },
      {
        heading: 'The Calvin cycle',
        paragraphs: [
          'Rubisco joins carbon dioxide to ribulose bisphosphate, a five-carbon sugar. The product splits into two molecules of 3-phosphoglycerate. ATP and NADPH from the light reactions reduce that acid to glyceraldehyde 3-phosphate. Some of the triose phosphate is the harvest. The rest is rearranged, with more ATP, to regenerate ribulose bisphosphate.',
          'For each carbon dioxide fixed, the cycle spends 3 ATP and 2 NADPH. A glucose has six carbons, so the classroom cost of the sugar is 18 ATP and 12 NADPH. None of that ATP came from the mitochondria. It came from the thylakoid. In the dark the light reactions stop, NADPH and ATP run down, and the Calvin cycle stops even though its enzymes do not themselves absorb light. Calling it the “dark reaction” only means it does not use photons directly.',
        ],
      },
      {
        heading: 'C3, C4, and what limits the rate',
        paragraphs: [
          'Rubisco can also react with oxygen. That photorespiration recovers some carbon but wastes ATP and releases carbon dioxide. It gets worse when stomata close and oxygen builds up in the leaf. C4 plants, including maize, sugarcane, and sorghum, first fix carbon dioxide into a four-carbon acid in the mesophyll and release it again deep in the bundle sheath, where rubisco works in a high-CO2 pocket. Wheat, rice, and cotton are C3 plants and do not have that pump.',
          'Blackman’s idea of limiting factors still organises the graphs. At low light, light is limiting and the rate rises as the lamp is moved closer. At high light, carbon dioxide is often limiting. Temperature affects the enzyme steps of the Calvin cycle more than the photochemical steps, until the enzymes denature. Drought does not appear in the summary equation as a limit, but it closes stomata, and closed stomata limit carbon dioxide. That is how water stress slows photosynthesis in a field.',
        ],
      },
    ],
    definitions: [
      { term: 'Thylakoid', meaning: 'The membrane sac where the light reactions and the proton gradient sit.' },
      { term: 'Stroma', meaning: 'The fluid of the chloroplast, where the Calvin cycle runs.' },
      { term: 'Photophosphorylation', meaning: 'ATP synthesis driven by light, using the thylakoid proton gradient.' },
      { term: 'Rubisco', meaning: 'The enzyme that attaches carbon dioxide to ribulose bisphosphate.' },
      { term: 'C4 plant', meaning: 'A plant that concentrates carbon dioxide at rubisco using a four-carbon acid.' },
      { term: 'Limiting factor', meaning: 'The condition that, at that moment, sets the rate of the whole process.' },
    ],
    worked: {
      title: 'The ATP and NADPH bill for one glucose',
      prompt: 'Show why the classroom total is 18 ATP and 12 NADPH per glucose.',
      steps: [
        'Each turn of the Calvin cycle fixes one CO2.',
        'Each turn spends 2 ATP to phosphorylate 3-phosphoglycerate, 2 NADPH to reduce it, and 1 more ATP to regenerate ribulose bisphosphate. That is 3 ATP and 2 NADPH per CO2.',
        'Glucose has six carbons, so six turns are required: 6 × 3 = 18 ATP and 6 × 2 = 12 NADPH.',
        'Those reduced nucleotides and ATP must be made by the light reactions. If light stops, the bill cannot be paid and carbon fixation stops.',
      ],
      result:
        'One glucose costs 18 ATP and 12 NADPH in the Calvin cycle. The oxygen released along the way comes from splitting water in photosystem II, not from the CO2 that was fixed.',
    },
    pakistan: {
      title: 'Sugarcane, maize, wheat, and a hot afternoon',
      body:
        'Sugarcane and maize are major crops and they are C4. That path loses less carbon to photorespiration in hot, bright weather, which is why those crops suit the Punjab and Sindh summers better than a simple C3 leaf would. Wheat and rice, the staple cereals, are C3. Cotton, including Bt cotton, is also C3. The Bt trait does not change the photosynthetic path. It changes insect resistance. When a paper asks for a local C4 example, sugarcane or maize is the safe answer.',
    },
    keyPoints: [
      'The summary equation produces carbohydrate and oxygen. The oxygen comes from water.',
      'Light reactions are in the thylakoid and make ATP, NADPH, and O2.',
      'Cyclic photophosphorylation makes ATP only. Non-cyclic flow makes ATP, NADPH, and O2.',
      'The Calvin cycle is in the stroma. Per CO2 it costs 3 ATP and 2 NADPH.',
      'Per glucose the bill is 18 ATP and 12 NADPH.',
      'Maize and sugarcane are C4. Wheat, rice, and cotton are C3.',
    ],
    quiz: [
      q(
        'Where do the light reactions take place?',
        ['Stroma', 'Thylakoid membrane', 'Mitochondrial matrix', 'Cytosol'],
        1,
        'The photosystems and the electron chain are in the thylakoid membrane. The Calvin cycle is in the stroma.',
      ),
      q(
        'The oxygen released in photosynthesis comes from',
        ['Carbon dioxide', 'Glucose', 'Water split at photosystem II', 'Rubisco'],
        2,
        'Photosystem II splits water. The electrons replace those lost from chlorophyll. The oxygen is the leftover.',
      ),
      q(
        'Fixing six CO2 molecules in the Calvin cycle requires',
        ['6 ATP and 6 NADPH', '18 ATP and 12 NADPH', '2 ATP only', 'No NADPH if light is bright'],
        1,
        'Each CO2 costs 3 ATP and 2 NADPH. Six carbons for one glucose therefore cost 18 ATP and 12 NADPH.',
      ),
      q(
        'Which crop uses the C4 path?',
        ['Wheat', 'Rice', 'Sugarcane', 'A typical fern, as a trick answer for cotton'],
        2,
        'Sugarcane, maize, and sorghum are C4. Wheat, rice, and cotton are C3. Cotton being genetically modified does not make it C4.',
      ),
    ],
    shorts: [
      {
        prompt: 'Describe non-cyclic photophosphorylation.',
        answer:
          'Light absorbed by photosystem II drives the loss of electrons from its reaction centre. Water is split to replace them, which releases oxygen and leaves protons in the thylakoid lumen. The electrons pass along a carrier chain to photosystem I, and the proton gradient is used by ATP synthase to make ATP. A second light absorption at photosystem I raises the electrons enough to reduce NADP+ to NADPH. The products that the Calvin cycle needs from this path are ATP and NADPH, and the gas released is oxygen. Cyclic flow, by contrast, returns electrons to the chain, makes ATP only, and releases no oxygen.',
      },
      {
        prompt: 'Why is the Calvin cycle not truly a “dark” process in a living leaf?',
        answer:
          'The cycle’s enzymes do not absorb light, so the reactions themselves are not photochemical. They do depend on ATP and NADPH made by the light reactions. In the dark those supplies stop, and carbon fixation stops with them. The name “dark reaction” only means light is not a direct reactant. A full answer should also give the site, the stroma, the enzyme rubisco, and the cost of 3 ATP and 2 NADPH per carbon dioxide.',
      },
    ],
    related: [
      { label: 'Glycolysis and respiration', hash: 'metabolism' },
      { label: 'Citric acid cycle', hash: 'biochem/krebs' },
      { label: 'The cell', hash: 'study/cell' },
    ],
  },
  {
    id: 'inheritance',
    title: 'Inheritance',
    short: 'Inheritance',
    kicker: 'Alleles, ratios, and families',
    level: 'FSc Part II variation and genetics, and BS Genetics',
    summary:
      'Mendel’s laws, a worked monohybrid cross, incomplete dominance, codominance, sex linkage, and epistasis. The Mutations tab shows what a DNA change does to a codon. This page shows how alleles move through a family.',
    sections: [
      {
        heading: 'Genes, alleles, and Mendel’s laws',
        paragraphs: [
          'A gene is a stretch of DNA that affects a character. An allele is a version of that gene. In a diploid cell there are two copies. If they are the same the individual is homozygous. If they differ, it is heterozygous. The genotype is the alleles. The phenotype is what you observe. A dominant allele affects the phenotype in a heterozygote. A recessive allele affects it only when both copies are recessive.',
          'Mendel crossed true-breeding pea plants and counted the offspring. The law of segregation says the two alleles of a gene separate when gametes form, so a gamete carries one. That separation is anaphase I of meiosis. The law of independent assortment says alleles of different genes go to gametes independently. It holds when the genes are on different chromosomes, or far apart on the same one. Genes that sit close together are linked and do not give the textbook 9:3:3:1 ratio.',
        ],
      },
      {
        heading: 'One gene, then two',
        paragraphs: [
          'A monohybrid cross of two heterozygotes, Aa × Aa, gives gametes A and a from each parent. The four combinations are AA, Aa, Aa, and aa. The genotype ratio is 1:2:1. If A is completely dominant, the phenotype ratio is 3 dominant : 1 recessive. A test cross decides whether a dominant-looking individual is AA or Aa. Cross it with aa. If any offspring show the recessive phenotype, the tested parent was heterozygous.',
          'A dihybrid cross of AaBb × AaBb, for unlinked genes, gives a phenotype ratio of 9 both dominant : 3 first dominant only : 3 second dominant only : 1 both recessive. Each gene is still segregating 3:1. The 9:3:3:1 is what you get by combining two independent 3:1 ratios. If a counted family is far from that ratio, linkage, a small sample, or epistasis may be why.',
        ],
      },
      {
        heading: 'When dominance is not complete',
        paragraphs: [
          'In incomplete dominance the heterozygote is intermediate. Red and white four-o’clock flowers give pink heterozygotes, and the phenotype ratio of a heterozygous cross is 1 red : 2 pink : 1 white. Genotype and phenotype ratios match because nothing is hidden.',
          'In codominance both alleles are fully visible. The ABO blood groups are the example. IA and IB are codominant, and i is recessive. Blood group AB is IA IB. Group O is ii. Group A can be IA IA or IA i. A person of group AB cannot be the parent of a child of group O, because an AB parent has no i allele to give. Antibodies in plasma are why a mismatched transfusion is dangerous: group O has antibodies to A and to B.',
        ],
      },
      {
        heading: 'Sex linkage and epistasis',
        paragraphs: [
          'Human females are XX and males are XY. A gene on the X chromosome with no working partner on the Y is sex-linked. Haemophilia and red-green colour blindness are X-linked recessives. A male expresses whatever allele is on his single X. A female expresses a recessive X-linked allele only if both of her X chromosomes carry it. A carrier mother and an unaffected father can have affected sons. Their daughters from that mating are not affected, though half of them are carriers.',
          'Epistasis means one gene masks another. In Labrador coat colour, a dominant E allele lets pigment form, and B versus b chooses black or brown. An ee dog makes no pigment in the coat and is yellow, whatever B it carries. A dihybrid cross then gives 9 black : 3 brown : 4 yellow, not 9:3:3:1. The 4 yellows are the 3+1 that would have been coloured if E were present. Name the ratio and the reason. Do not force 9:3:3:1 onto a cross the data reject.',
        ],
      },
    ],
    definitions: [
      { term: 'Allele', meaning: 'One version of a gene.' },
      { term: 'Segregation', meaning: 'The separation of a pair of alleles into different gametes.' },
      { term: 'Test cross', meaning: 'A cross with a homozygous recessive individual, used to reveal a hidden allele.' },
      { term: 'Incomplete dominance', meaning: 'The heterozygote’s phenotype is between the two homozygotes.' },
      { term: 'Codominance', meaning: 'Both alleles are fully expressed in the heterozygote, as in blood group AB.' },
      { term: 'Epistasis', meaning: 'One gene masks the phenotypic effect of another gene.' },
    ],
    worked: {
      title: 'Two carriers of a recessive allele',
      prompt: 'Beta-thalassemia major appears in people who inherit a faulty β-globin allele from both parents. Both parents are healthy carriers (Aa). What are the chances for the next child?',
      steps: [
        'Write the cross Aa × Aa. Gametes from each parent are half A and half a.',
        'The Punnett square gives AA, Aa, Aa, and aa, each one quarter.',
        'AA is unaffected and not a carrier. Aa is an unaffected carrier. aa has the major disease. So the chance the child is affected is 1/4.',
        'The chance the child is a carrier is 1/2. If you are told only that a child is unaffected, the chance that child is a carrier is 2/3, because the aa outcome has been removed and two of the three remaining boxes are Aa.',
      ],
      result:
        'The risk of an affected child is 1 in 4 at every birth. The births are independent. Having one affected child does not lower the chance for the next. Counseling is about that repeat risk, not about a family “using up” the unlucky outcome.',
    },
    pakistan: {
      title: 'Thalassemia and cousin marriage',
      body:
        'Beta-thalassemia is common enough in Pakistan that many hospitals offer carrier testing before marriage. The allele is autosomal and recessive, so carriers are often well. When cousins marry they are more likely to share a rare allele inherited from the same grandparent, which raises the chance that both partners are carriers. The biology does not forbid cousin marriage. It says the test is more useful in families where an allele is already known, and that two carriers have a one-in-four chance of an affected child each pregnancy.',
    },
    keyPoints: [
      'Segregation: one allele per gamete. Independent assortment needs unlinked genes.',
      'Aa × Aa gives 1:2:1 genotypes and, with complete dominance, 3:1 phenotypes.',
      'A test cross with aa reveals a hidden recessive allele.',
      'Incomplete dominance gives a 1:2:1 phenotype ratio. ABO blood groups are codominant.',
      'X-linked recessives show in males more often. A carrier mother can have affected sons.',
      'Epistasis changes 9:3:3:1. Labrador colour is 9 black : 3 brown : 4 yellow.',
    ],
    quiz: [
      q(
        'A test cross of a tall pea, of unknown genotype, with a short pea gives some short offspring. The tall parent was',
        ['TT', 'Tt', 'tt', 'Lacking the gene'],
        1,
        'Short offspring are tt, so they received t from the tall parent. That parent must have been Tt. A TT parent would have given only tall offspring.',
      ),
      q(
        'A parent of blood group AB and a parent of blood group O can have a child of group',
        ['A', 'O', 'AB', 'Only group AB or O'],
        0,
        'An AB parent is IA IB and passes IA or IB. An O parent is ii and passes i. Children are IA i (group A) or IB i (group B). They cannot be O or AB.',
      ),
      q(
        'Red-green colour blindness is X-linked recessive. A carrier woman and an unaffected man have a son. The son’s chance of being colour-blind is',
        ['0', '1/4', '1/2', '1'],
        2,
        'The son receives his X from his mother. Half of her X chromosomes carry the allele, so his chance is 1/2. The father’s X goes to daughters, not to sons.',
      ),
      q(
        'A 9:3:4 ratio in a dihybrid cross is evidence of',
        ['Independent assortment with no interaction', 'Epistasis', 'A mitochondrial gene', 'Codominance of all four alleles'],
        1,
        'Independent assortment of two dominant genes gives 9:3:3:1. A 9:3:4 ratio means one class has been merged because one genotype masks another.',
      ),
    ],
    shorts: [
      {
        prompt: 'State Mendel’s law of segregation and the law of independent assortment, and give one limit of the second law.',
        answer:
          'The law of segregation says that the two alleles of a gene separate during gamete formation, so each gamete receives one allele. They reunite at random at fertilisation. The law of independent assortment says that alleles of different genes segregate independently of each other. The limit is linkage. Genes that lie close together on the same chromosome tend to be inherited as a block, so they do not give a 9:3:3:1 ratio. Independent assortment is reliable for genes on different chromosomes.',
      },
      {
        prompt: 'A man with haemophilia, an X-linked recessive condition, has children with a woman who is not a carrier. Predict the children.',
        answer:
          'Write the man’s genotype as Xh Y and the woman’s as XH XH. Daughters all receive Xh from their father and XH from their mother, so every daughter is a carrier and none is affected. Sons receive XH from their mother and Y from their father, so every son is unaffected and none is a carrier of an X-linked gene. This is the reverse of the carrier-mother pattern. An affected father passes the allele to all of his daughters and to none of his sons.',
      },
    ],
    related: [
      { label: 'Mutations', hash: 'mutations' },
      { label: 'Codon table', hash: 'codon-table' },
      { label: 'The cell cycle', hash: 'study/cell' },
    ],
  },
  {
    id: 'evolution',
    title: 'Evolution',
    short: 'Evolution',
    kicker: 'Variation and selection',
    level: 'FSc Part I (NCP domain B)',
    summary:
      'Evolution is a change in heritable characters in a population. Natural selection is one cause. This page covers Darwin and Wallace, why Lamarck’s giraffe fails, the evidence from geography and molecules, homologous and analogous structures, and the endosymbiotic origin of mitochondria and chloroplasts.',
    sections: [
      {
        heading: 'Variation comes first',
        paragraphs: [
          'A population evolves when the mix of heritable traits in it changes from one generation to the next. Individuals do not evolve in this sense. A person who builds muscle has not evolved. The population evolves if some heritable variants leave more offspring than others, or if migration, mutation, or chance shifts the mix.',
          'Natural selection, proposed by Darwin and independently by Wallace, needs three things. Individuals vary. Some of that variation is heritable. More offspring are born than survive and breed, and the ones that do are not a random sample. A variant that helps its bearer leave more offspring becomes more common. The environment does the selecting. There is no plan inside the organism to become a particular future form.',
        ],
      },
      {
        heading: 'Lamarck, and why the answer is no',
        paragraphs: [
          'Lamarck suggested that characters acquired during life are inherited. The classroom story is the giraffe: ancestors stretched toward leaves, the neck lengthened in that lifetime, and the offspring were born with longer necks. The idea is called the inheritance of acquired characters.',
          'It fails for a plain reason. Stretching a neck, or a blacksmith building an arm, changes muscle and bone in that body. It does not rewrite the DNA in the gametes. Cutting the tails of mice for many generations, Weismann’s experiment, did not produce tailless pups. Some chemical marks on DNA can last into the next generation, but that is a narrow and temporary effect. It is not Lamarck’s stretching neck, and it is not how giraffes got their necks. The Darwinian account is that heritable differences in neck length already existed, and in a habitat where high leaves mattered, longer-necked individuals left more offspring.',
        ],
      },
      {
        heading: 'Evidence',
        paragraphs: [
          'Biogeography is the geography of species. Islands often hold species that resemble the mainland nearest them, modified for island life, rather than a random set of animals from the whole planet. That pattern fits descent from colonists, plus selection in the new place. Fossils add a time axis: forms in older rocks are not a random sample of modern species.',
          'Molecular evidence is now the sharpest. The same genetic code, the same amino acids, and shared sequences in cytochrome c or in ribosomal RNA are what you expect if living things inherited a system from a common ancestor. A more similar sequence usually means a more recent shared ancestor, with caution when the sequence is short. The Sequences tab is where a small alignment can be tried by hand. Convergent evolution can make unrelated proteins solve the same problem, so a match is a hypothesis, not a finished family tree.',
        ],
      },
      {
        heading: 'Homologous, analogous, divergent, convergent',
        paragraphs: [
          'Homologous structures share an origin even when the jobs differ. The human arm, the bat’s wing, and the whale’s flipper are built on the same limb bones. That is divergent evolution: one ancestral limb, several later uses. Analogous structures do the same job and do not share that origin. An insect wing and a bird wing both fly, and they were not inherited from a winged common ancestor. That is convergent evolution.',
          'The trap in the question is to sort by function. Function does not decide homology. Origin does. Two structures can be homologous as limbs and still be used differently. Two structures can be analogous as wings and still both be called wings in ordinary speech. In an answer, say which comparison you are making.',
        ],
      },
      {
        heading: 'Endosymbiosis',
        paragraphs: [
          'Eukaryotic cells did not invent mitochondria from nothing. The endosymbiotic theory says an ancestral host cell took in an aerobic bacterium and did not digest it. The bacterium became the mitochondrion. A later intake of a cyanobacterium, in the line that led to plants and algae, became the chloroplast. Lynn Margulis pressed the modern form of the argument.',
          'The evidence is structural and molecular. Mitochondria and chloroplasts have their own circular DNA. They have 70S ribosomes, the bacterial size. They are bounded by more than one membrane, which fits an engulfed cell. They divide by fission inside the eukaryotic cell. They are not free-living now. Many of their genes have moved to the nucleus. The theory explains those oddities. It does not say that every organelle began this way. The nucleus has a different and less settled history.',
        ],
      },
    ],
    definitions: [
      { term: 'Natural selection', meaning: 'Heritable variants that leave more offspring become more common.' },
      { term: 'Acquired character', meaning: 'A trait gained during life, which is not passed on through the gametes.' },
      { term: 'Homologous', meaning: 'Structures inherited from a common ancestor, even if their uses now differ.' },
      { term: 'Analogous', meaning: 'Structures with a similar use and a different evolutionary origin.' },
      { term: 'Divergent evolution', meaning: 'Related lineages becoming less alike from a shared starting point.' },
      { term: 'Endosymbiosis', meaning: 'One cell living inside another and, over time, becoming an organelle.' },
    ],
    worked: {
      title: 'Sort four structures',
      prompt: 'A question lists a human arm, a whale flipper, a bird wing, and an insect wing. Which pairs are homologous, and which comparison is analogous?',
      steps: [
        'Human arm, whale flipper, and bird wing are all forelimbs of vertebrates. The bones correspond. Those three are homologous to each other.',
        'Their uses differ: manipulate, swim, fly. Different use does not cancel homology. This is divergent evolution.',
        'The insect wing flies, like the bird wing, but it is not a vertebrate forelimb. That pair is analogous.',
        'The insect–bird comparison is convergent evolution. State the pair before you name the process, or the answer collapses into “all wings are the same”.',
      ],
      result:
        'Arm, flipper, and bird wing: homologous, divergent. Insect wing and bird wing: analogous, convergent. Origin decides homology. Present-day job decides the analogy.',
    },
    pakistan: {
      title: 'A local biogeography sentence',
      body:
        'The Indus flyway is a geographic fact students can use without inventing a fossil. Migratory birds arrive from a particular set of breeding grounds, not from a random sample of the world’s birds, and the wetlands they use are remnants of a connected landscape. On the molecular side, Pakistani labs compare viral and crop sequences with public databases for the same reason Darwin compared island finches: similarity is evidence of relatedness. The bioinformatics page says how far a sequence match can be trusted.',
    },
    keyPoints: [
      'Populations evolve. Natural selection needs heritable variation and unequal reproductive success.',
      'Lamarck’s acquired characters are not written into gametes. Weismann’s tail-cutting mice are the classic test.',
      'Biogeography, fossils, and shared molecules are independent lines of evidence.',
      'Homologous means common origin. Analogous means common job, different origin.',
      'Divergent evolution produces homologues. Convergent evolution produces analogues.',
      'Mitochondria and chloroplasts began as bacteria: own DNA, 70S ribosomes, double membranes.',
    ],
    quiz: [
      q(
        'Lamarck’s explanation of the giraffe neck fails because',
        [
          'Giraffes do not eat leaves',
          'A change acquired in a lifetime is not passed on through the gametes',
          'Selection can never act on neck length',
          'Fossils show that necks cannot vary',
        ],
        1,
        'Stretching does not alter the DNA in sperm or eggs. Selection on heritable variation is the alternative, not the inheritance of the stretch.',
      ),
      q(
        'A bird wing and an insect wing are',
        ['Homologous forelimbs', 'Analogous structures', 'Evidence against evolution', 'Products of meiosis'],
        1,
        'Both are used for flight, but they did not come from a shared winged ancestor. Same job, different origin: analogous.',
      ),
      q(
        'Which observation supports the endosymbiotic origin of mitochondria?',
        [
          'They have circular DNA and 70S ribosomes',
          'They are made of cellulose',
          'They have no membrane',
          'They are coded only by the Golgi',
        ],
        0,
        'Circular DNA, 70S ribosomes, a double membrane, and division by fission are the bacterial features of mitochondria and chloroplasts.',
      ),
      q(
        'Natural selection requires',
        [
          'That every individual wants to improve',
          'Heritable variation and differences in reproductive success',
          'The inheritance of muscles built by exercise',
          'A goal known in advance by the species',
        ],
        1,
        'Selection has no foresight. Variants that already leave more offspring become more common if the difference is heritable.',
      ),
    ],
    shorts: [
      {
        prompt: 'Explain natural selection, using heritable variation rather than a story about effort.',
        answer:
          'Members of a population differ, and some differences are inherited. More offspring are produced than can survive and breed. Individuals with a heritable advantage in that environment leave more offspring, so their alleles become more common. Over many generations the population’s typical features shift. The organism does not try to evolve, and characters gained by exercise or injury are not the raw material. Mutation supplies new alleles. Selection keeps or removes the ones that already affect reproduction.',
      },
      {
        prompt: 'Describe the endosymbiotic theory and two pieces of evidence for it.',
        answer:
          'The theory says mitochondria came from an aerobic bacterium that an ancestral host cell engulfed and kept, and that chloroplasts came later from an engulfed cyanobacterium. Evidence includes their own circular DNA, which fits a bacterial chromosome, and their 70S ribosomes, which match bacteria rather than the 80S ribosomes of the eukaryotic cytosol. A double membrane and division by binary fission point the same way. The organelles are dependent on the host now because many of their genes have moved to the nucleus.',
      },
    ],
    related: [
      { label: 'The cell', hash: 'study/cell' },
      { label: 'Sequence alignment', hash: 'sequences' },
      { label: 'Bioinformatics', hash: 'study/bioinformatics' },
    ],
  },
];
