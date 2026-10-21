import type { StudyQuiz, StudyTopic } from './studyTypes';

function q(
  prompt: string,
  choices: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explanation: string,
): StudyQuiz {
  return { prompt, choices, answer, explanation };
}

export const STUDY_PART_2: readonly StudyTopic[] = [
  {
    id: 'microbiology',
    title: 'Microbiology',
    short: 'Microbes',
    kicker: 'Cells you cannot see unaided',
    level: 'FSc diversity, and BS Microbiology',
    summary:
      'Bacteria, archaea, fungi, protozoa, microscopic algae, and viruses. This page is the cell plan, the nutritional groups, and what a growth curve means. It is not a culture method and not a guide to growing a pathogen.',
    sections: [
      {
        heading: 'The cast',
        paragraphs: [
          'A microorganism is an organism, or an acellular particle, that is too small to see clearly without a microscope. Bacteria and archaea are prokaryotes. Fungi, protozoa, and microscopic algae are eukaryotes. Viruses are not cells. They are nucleic acid inside a protein coat, and they multiply only inside a host cell.',
          'Most microbes are not pathogens. They recycle dead matter, fix nitrogen, live in the gut, and carry out the fermentations on the industrial page. A pathogen is a microbe that can cause disease in a particular host. The same species can be harmless in one context and harmful in another. Calling every bacterium a germ is the mistake this chapter exists to correct.',
        ],
      },
      {
        heading: 'The bacterial cell',
        paragraphs: [
          'Outside, many bacteria have a capsule that helps them stick and, in some species, evade phagocytes. Under that is the cell wall. Peptidoglycan is the polymer that gives the wall its strength. The plasma membrane sits inside the wall and does the selective transport. The chromosome is one circular DNA molecule in a nucleoid. There is no nuclear membrane. Plasmids are small extra circles of DNA. Ribosomes are 70S. A flagellum rotates and moves the cell. Pili attach the cell to a surface or, in conjugation, connect two cells.',
          'Shape is the first sort used in class. A coccus is a sphere, a bacillus is a rod, and a spirillum is a curved or spiral rod. The Gram stain is the second sort. Crystal violet is trapped in a thick peptidoglycan wall, so Gram-positive cells stay purple after alcohol. Gram-negative cells have a thin wall plus an outer membrane, lose the purple dye, and take up the pink counterstain. The stain is a classroom practical. It does not, by itself, name the species or say how dangerous it is.',
        ],
      },
      {
        heading: 'How bacteria make a living',
        paragraphs: [
          'Nutrition is described by the energy source and the carbon source. A photoautotroph uses light and carbon dioxide, as cyanobacteria do. A chemoautotroph oxidises inorganic chemicals and fixes carbon dioxide. A photoheterotroph uses light but takes carbon from organic molecules. A chemoheterotroph takes both energy and carbon from organic food. The bacteria that live on a plate of food, and most bacteria associated with human disease, are chemoheterotrophs.',
          'Oxygen is a separate axis. Obligate aerobes need it. Obligate anaerobes are harmed by it. Facultative organisms use it when it is present and ferment when it is not. These words classify physiology. They are not instructions for setting up a culture. Nitrogen fixers such as Rhizobium live with legumes and turn nitrogen gas into ammonia the plant can use. That mutualism is the ecological fact worth remembering.',
        ],
      },
      {
        heading: 'A growth curve, as a description',
        paragraphs: [
          'In a closed vessel, with no fresh medium added, a bacterial population often shows four phases. In the lag phase the cells adjust and the count barely rises. In the log, or exponential, phase each cell divides at a roughly constant interval, so the count doubles on a steady clock. In the stationary phase births and deaths balance because a nutrient has run out or wastes have built up. In the death phase the count of living cells falls.',
          'The generation time is the doubling time during the log phase. It is a property you can calculate from two counts. It is not a recipe. A real culture is slower than the ideal once it leaves the log phase, which is why industrial fermentations try to feed the vessel instead of letting it stall. That engineering is on the fermentation page.',
        ],
      },
      {
        heading: 'Viruses, briefly',
        paragraphs: [
          'A virus has a genome of DNA or RNA and a capsid of protein. Some have a lipid envelope taken from a host membrane. They have no ribosomes and no metabolism of their own. A bacteriophage infects a bacterium. In a lytic cycle the host is broken open to release new particles. In a lysogenic cycle the phage genome sits in the host chromosome and is copied with it until a later signal starts the lytic path.',
          'Because viruses are not cells, antibiotics that attack a wall or a 70S ribosome do not touch them. Vaccination, on the immunology page, is the prevention that matches a virus. Naming a life cycle is enough for this course. How to grow a virus is a supervised laboratory skill and is not taught here.',
        ],
      },
    ],
    definitions: [
      { term: 'Nucleoid', meaning: 'The region of a prokaryotic cell that holds the chromosome. It is not a nucleus.' },
      { term: 'Peptidoglycan', meaning: 'The polymer that strengthens the bacterial cell wall.' },
      { term: 'Gram-positive', meaning: 'A bacterium with a thick peptidoglycan wall that stays purple in the Gram stain.' },
      { term: 'Chemoheterotroph', meaning: 'An organism that takes both energy and carbon from organic compounds.' },
      { term: 'Generation time', meaning: 'The time taken for a population to double during exponential growth.' },
      { term: 'Lytic cycle', meaning: 'A viral infection that ends with the host cell bursting.' },
    ],
    worked: {
      title: 'Read a generation time',
      prompt: 'A log-phase culture contains 2 × 10^3 cells at noon and 3.2 × 10^4 cells at 2 pm. How many doublings is that, and what is the generation time?',
      steps: [
        'Divide the later count by the earlier count: 3.2 × 10^4 / 2 × 10^3 = 16.',
        'Sixteen is 2^4, so the population doubled four times.',
        'Four doublings in 120 minutes gives a generation time of 120 / 4 = 30 minutes.',
        'The calculation assumes the culture stayed in log phase and that every count is of living cells. It does not tell you which species it was or how the culture was made.',
      ],
      result:
        'The generation time is 30 minutes. On a graph, this is the steep part of the curve. Lag, stationary, and death phases do not have this constant doubling.',
    },
    pakistan: {
      title: 'Water, nitrogen, and a vaccine, not a scare list',
      body:
        'Contaminated drinking water still spreads several bacterial infections in Pakistan, which is why municipal water treatment and oral rehydration belong in a public-health sentence beside this chapter. On the useful side, Rhizobium on pulse crops is free nitrogen for soils that urea would otherwise have to supply. Polio is a virus, not a bacterium, and the national immunisation programme is the response. Antibiotics do not treat it. The immunology page takes that point further.',
    },
    keyPoints: [
      'Bacteria are prokaryotes: nucleoid, 70S ribosomes, peptidoglycan. Viruses are not cells.',
      'Coccus, bacillus, and spirillum describe shape. Gram’s stain sorts wall structure.',
      'Chemoheterotrophs use organic food. Photoautotrophs use light and CO2.',
      'A closed culture shows lag, log, stationary, and death phases.',
      'Generation time is measured in the log phase only.',
      'A lytic phage bursts the host. A lysogenic phage can wait in the chromosome.',
    ],
    quiz: [
      q(
        'Which structure is absent from a bacterium?',
        ['A plasma membrane', 'Ribosomes', 'A nuclear envelope', 'DNA'],
        2,
        'Bacteria have DNA, a membrane, and ribosomes. They do not have a nucleus bounded by an envelope.',
      ),
      q(
        'A Gram-negative cell stains pink because',
        [
          'It has no wall',
          'Alcohol removes the purple dye from a thin wall, and the counterstain remains',
          'It is a virus',
          'Peptidoglycan is made of cellulose',
        ],
        1,
        'The thick wall of a Gram-positive cell keeps crystal violet. The thin wall and outer membrane of a Gram-negative cell do not, so safranin colours it pink.',
      ),
      q(
        'During which phase is the generation time constant?',
        ['Lag', 'Log', 'Stationary', 'Death'],
        1,
        'Only exponential growth has a steady doubling time. The other phases are adjustment, balance, or decline.',
      ),
      q(
        'Antibiotics that block 70S ribosomes spare human cytosolic ribosomes because',
        [
          'Human cytosolic ribosomes are 80S',
          'Humans have no ribosomes',
          'Viruses have 80S ribosomes too',
          'DNA is absent from bacteria',
        ],
        0,
        'Cytosolic eukaryotic ribosomes are 80S. Mitochondrial ribosomes are more bacterial, which is one reason some antibiotics have side effects, but the classroom contrast is 70S versus 80S.',
      ),
    ],
    shorts: [
      {
        prompt: 'Draw, in words, a labelled bacterial cell and give one function of four parts.',
        answer:
          'A typical bacterium has a capsule outside a cell wall of peptidoglycan, then a plasma membrane. The capsule aids attachment. The wall prevents the cell from bursting. The membrane controls transport. Inside, the nucleoid holds the chromosome, and plasmids hold extra genes, including some resistance genes. Ribosomes of 70S make protein. A flagellum provides movement, and pili allow attachment or conjugation. There is no nuclear envelope and no mitochondrion.',
      },
      {
        prompt: 'Describe the four phases of a bacterial growth curve in a closed culture.',
        answer:
          'In the lag phase cells adapt to the medium and division is slow, so the count hardly changes. In the log phase division is rapid and regular, and the population doubles each generation time. In the stationary phase the number of new cells is balanced by deaths because nutrients are scarce or wastes have accumulated. In the death phase living cells decrease. The curve describes a closed batch. It is not a method for isolating or identifying a pathogen.',
      },
    ],
    related: [
      { label: 'The cell', hash: 'study/cell' },
      { label: 'Fermentation', hash: 'study/fermentation' },
      { label: 'Immunity', hash: 'study/immunology' },
    ],
  },
  {
    id: 'immunology',
    title: 'Immunity',
    short: 'Immunity',
    kicker: 'Innate, adaptive, memory',
    level: 'FSc transport and immunity, and BS Immunology',
    summary:
      'Barriers and phagocytes act immediately and without tailoring. Lymphocytes act more slowly, recognise a particular epitope, and remember it. Vaccination is applied memory. Autoimmune disease is recognition gone wrong.',
    sections: [
      {
        heading: 'Innate defence',
        paragraphs: [
          'Skin, mucus, acid in the stomach, and lysozyme in tears are barriers. If a microbe crosses them, innate cells respond within minutes to hours. Neutrophils and macrophages engulf particles. That is phagocytosis. Inflammation brings more blood and more cells to the site: heat, redness, swelling, and pain are the four classical signs. Complement is a set of blood proteins that can mark a microbe, recruit cells, and punch holes in some bacterial membranes.',
          'Innate immunity does not improve its aim at one particular antigen after the first meeting. It recognises broad patterns that many microbes share. It has no memory of the sort a vaccine depends on. It is still essential. Adaptive immunity rarely gets a chance to start if the innate system has not contained the first hours.',
        ],
      },
      {
        heading: 'Adaptive immunity',
        paragraphs: [
          'An antigen is a molecule the adaptive system can recognise. An epitope is the precise patch on that molecule that one receptor fits. B lymphocytes and T lymphocytes carry receptors with different fits, made by rearranging gene segments. A cell whose receptor matches the antigen is selected and divides. That is clonal selection. The first response takes days because the right clone starts rare.',
          'B cells that become plasma cells secrete antibodies. That arm is humoral immunity. Helper T cells, which carry CD4, coordinate the response by chemical signals. Cytotoxic T cells, which carry CD8, kill the body’s own cells when those cells display foreign peptides, which is how a virus hiding inside a cell is reached. After the response, memory B and T cells remain. The second meeting is faster and larger. That memory is the biological point of vaccination.',
        ],
      },
      {
        heading: 'Antibodies',
        paragraphs: [
          'An antibody is a Y-shaped protein of two heavy chains and two light chains. The tips of the Y are variable and bind the epitope. The stem is constant and decides the class. IgM is the first class made in a new response and is good at clumping antigen. IgG is the main class in blood later, and it crosses the placenta. IgA guards mucosal surfaces and is in milk. IgE is the class involved in allergy and in defence against some parasites. IgD is a receptor on naive B cells.',
          'Binding can neutralise a virus by covering the part it uses to enter a cell, clump bacteria so phagocytes clear them, or mark them for complement. An antibody does not itself “eat” a bacterium. Effector cells and complement do the disposal. Monoclonal antibodies, one specificity made in culture, are a medical-biotechnology product and are on the health page.',
        ],
      },
      {
        heading: 'Vaccines',
        paragraphs: [
          'A vaccine shows the immune system an antigen without causing the disease, so memory forms in advance. A live attenuated vaccine uses a weakened organism. An inactivated vaccine uses a killed one. A subunit or toxoid vaccine uses one molecule or an inactivated toxin. An mRNA vaccine gives cells instructions to make one viral protein for a short time. The classes differ in how the antigen is delivered. They share the goal: memory, without the full disease.',
          'No vaccine is a treatment you apply after a severe infection is already established, except for a few specialised products that are not the classroom story. Herd protection appears when enough people are immune that spread becomes rare. That is a population fact, not a property of one syringe.',
        ],
      },
      {
        heading: 'When the system misfires',
        paragraphs: [
          'In an autoimmune disease, adaptive immunity attacks a normal self molecule. Type 1 diabetes and rheumatoid arthritis are the examples usually named. The cause in a given patient is a mix of alleles and environment. It is not “low immunity” in the everyday sense. The response is active and pointed at the wrong target.',
          'Allergy is an exaggerated response to a harmless antigen, often through IgE. Immunodeficiency is a weak response, inherited or acquired. HIV infects helper T cells and, untreated, removes the coordination of adaptive immunity. These three words — autoimmunity, allergy, immunodeficiency — are often swapped in weak answers. Keep them separate.',
        ],
      },
    ],
    definitions: [
      { term: 'Antigen', meaning: 'A molecule that adaptive immunity can recognise.' },
      { term: 'Epitope', meaning: 'The particular part of an antigen that one receptor binds.' },
      { term: 'Humoral immunity', meaning: 'Defence by antibodies secreted by B-lineage plasma cells.' },
      { term: 'Memory cell', meaning: 'A long-lived lymphocyte that makes the second response faster.' },
      { term: 'Vaccine', meaning: 'A preparation that induces protective memory without the natural disease.' },
      { term: 'Autoimmunity', meaning: 'An adaptive response directed at the body’s own molecules.' },
    ],
    worked: {
      title: 'Why the second infection is shorter',
      prompt: 'A child meets measles virus for the first time, recovers, and meets it again years later. Explain the difference, in cells.',
      steps: [
        'On the first meeting, innate cells hold the line while rare B and T clones that happen to fit the viral epitopes divide. This primary response takes days. IgM appears first, then IgG. The child is ill during that delay.',
        'Most effector cells die off after the virus is cleared. Memory B cells, memory T cells, and long-lived plasma cells remain.',
        'On the second meeting the memory clones are already numerous and more easily activated. Antibody appears sooner and in larger amount. The virus is often cleared before symptoms start.',
        'A measles vaccine aims at the same memory, using antigen without the dangerous infection. The cellular story is identical in outline.',
      ],
      result:
        'The primary response selects clones. The secondary response starts with those clones already expanded. Memory, not a generally “stronger” immune system, is what changed.',
    },
    pakistan: {
      title: 'The Expanded Programme on Immunization',
      body:
        'Pakistan’s Expanded Programme on Immunization delivers childhood vaccines, including polio, measles, BCG against tuberculosis, and hepatitis B, through public clinics and campaigns. Hepatitis B vaccine is itself a biotechnology product: the surface antigen is made by recombinant yeast, not grown as a whole virus. Polio vaccine does not work as an antibiotic after paralysis has begun. It works by giving memory beforehand, which is why the campaigns target children who are well.',
    },
    keyPoints: [
      'Innate immunity is fast, broad, and without antigen-specific memory.',
      'Adaptive immunity is clonal. B cells make antibodies. CD4 T cells help. CD8 T cells kill infected cells.',
      'An antibody binds an epitope. Its class (IgM, IgG, IgA, IgE, IgD) decides where it works.',
      'Memory makes the secondary response faster. That is what a vaccine is for.',
      'Live, inactivated, subunit, and mRNA vaccines differ in delivery, not in the idea of memory.',
      'Autoimmunity, allergy, and immunodeficiency are three different failures.',
    ],
    quiz: [
      q(
        'Which cell secretes antibody?',
        ['Cytotoxic T cell', 'Plasma cell', 'Red blood cell', 'A platelet'],
        1,
        'Plasma cells are the antibody-secreting form of the B lineage. Cytotoxic T cells kill infected cells. They do not secrete antibody.',
      ),
      q(
        'IgA is especially important',
        ['On mucosal surfaces', 'Only inside the nucleus', 'As the wall of a bacterium', 'As a clotting factor'],
        0,
        'IgA is secreted onto mucous membranes and is present in milk. IgG dominates later blood responses. IgE is the allergy class.',
      ),
      q(
        'A vaccine protects mainly by',
        [
          'Killing every microbe in the town’s water',
          'Creating memory cells against a chosen antigen',
          'Replacing the skin as a barrier',
          'Raising body temperature permanently',
        ],
        1,
        'The antigen in the vaccine selects clones. Memory cells remain. On a later meeting the response is fast. The vaccine does not sterilise the environment.',
      ),
      q(
        'Type 1 diabetes, as an autoimmune disease, means',
        [
          'Insulin is attacked as if it, or the cells that make it, were foreign',
          'The person has no innate barriers',
          'Antibody cannot bind any antigen',
          'The person has too many red cells',
        ],
        0,
        'Adaptive immunity damages the insulin-producing cells. The word is not a synonym for a weak immune system.',
      ),
    ],
    shorts: [
      {
        prompt: 'Distinguish innate immunity from adaptive immunity.',
        answer:
          'Innate immunity is present from birth and responds within minutes or hours. Barriers, phagocytes, inflammation, and complement recognise broad microbial patterns. The response does not become specific to one epitope and does not leave antigen-specific memory. Adaptive immunity is carried by B and T lymphocytes. Each clone recognises one epitope. The first response is slow because the matching clone must multiply. Memory cells make later responses faster and stronger. Antibodies are the humoral part of adaptive immunity. Helper and cytotoxic T cells are the cellular part.',
      },
      {
        prompt: 'Describe the structure of an antibody and name three classes with their roles.',
        answer:
          'An antibody has two heavy chains and two light chains, arranged as a Y. The variable tips bind one epitope. The constant stem sets the class. IgM is produced first in a primary response and clumps antigen well. IgG is the abundant antibody in serum later in the response and can cross the placenta. IgA protects mucosal surfaces. A complete list also includes IgE, important in allergy, and IgD, found on naive B cells. Binding does not digest the pathogen. It marks or blocks it so other defences can finish the work.',
      },
    ],
    related: [
      { label: 'Health biotechnology', hash: 'study/health' },
      { label: 'Microbiology', hash: 'study/microbiology' },
      { label: 'The cell', hash: 'study/cell' },
    ],
  },
  {
    id: 'regulation',
    title: 'Gene regulation and repair',
    short: 'Gene control',
    kicker: 'Operons, chromatin, repair',
    level: 'BS Molecular Biology, after the central dogma',
    summary:
      'Replication, transcription, translation, the code, and the types of mutation are already tools on this bench. What those tools do not cover is why a gene is on in one cell and off in another, and how a wrong base is put right.',
    sections: [
      {
        heading: 'A gene can be quiet',
        paragraphs: [
          'Every cell in a person’s body has nearly the same DNA. A liver cell and a muscle cell differ because they transcribe different sets of genes. Regulation decides when and how strongly RNA polymerase reads a gene. It saves energy and stops proteins being made where they would do harm.',
          'Bacteria often put the genes of one pathway next to each other and control them with one switch. That cluster, with its promoter and operator, is an operon. Eukaryotes usually control genes one by one, and they add chromatin as an extra layer. The central dogma still holds in both. Regulation chooses the rate. It does not change the direction of information flow.',
        ],
      },
      {
        heading: 'The lac operon',
        paragraphs: [
          'E. coli uses lactose only when it is worth using. The lac operon has three structural genes: lacZ splits lactose, lacY brings lactose in, and lacA has a further metabolic job. They share a promoter, where RNA polymerase binds, and an operator, where a repressor can sit. The repressor protein is made from lacI, a gene with its own promoter just upstream, and it is made whether lactose is present or not.',
          'With no lactose, the repressor binds the operator and RNA polymerase cannot move. Lactose leads to allolactose, which binds the repressor and pulls it off the operator. That is negative control, and it is not the whole story. If glucose is abundant, cAMP is low, and the activator CAP is idle, so transcription stays weak even though the repressor is off. If glucose is scarce, cAMP is high, cAMP–CAP binds upstream of the promoter and helps polymerase, and transcription is strong. High expression needs lactose present and glucose absent. That double condition is the fact examiners want.',
        ],
      },
      {
        heading: 'The trp operon',
        paragraphs: [
          'The lac operon is inducible. It turns on when the substrate appears. The trp operon is repressible. It turns off when the product is already plentiful. The genes make tryptophan. The trp repressor is inactive alone. Tryptophan binds it as a corepressor, and the pair binds the operator and stops transcription. When tryptophan is scarce, the repressor stays off and the pathway runs.',
          'There is a second control, attenuation, in the leader sequence before the structural genes. A short leader peptide contains tryptophan codons. If tryptophan is abundant the ribosome does not stall, and the mRNA folds into a terminator. If tryptophan is scarce the ribosome stalls, a different fold forms, and transcription continues. You can score a full mark on “repressible versus inducible” without attenuation. Mention it if the question asks how the operon senses tryptophan twice.',
        ],
      },
      {
        heading: 'Eukaryotic controls',
        paragraphs: [
          'Eukaryotic DNA is wrapped on histones. Tight packing, heterochromatin, hides promoters. Looser packing, euchromatin, leaves them available. Acetylation of histones loosens the grip and is associated with transcription. Methylation of DNA at cytosine bases is often associated with silencing. These marks can persist through cell division and help a liver cell stay a liver cell. They are not a second genetic code with new letters.',
          'Transcription factors bind DNA near a gene and help or block polymerase. After transcription, a pre-mRNA can be spliced in more than one way, so one gene can yield more than one protein. mRNA lifetime and the start of translation are further controls. A eukaryotic gene is not an operon of the bacterial kind. Saying “the lac repressor switches off human insulin” is a category error.',
        ],
      },
      {
        heading: 'Repair',
        paragraphs: [
          'DNA polymerase copies DNA and also checks the base it just added. The polymerase can remove a wrong nucleotide with a 3′ to 5′ exonuclease activity and try again. That is proofreading. A few errors still escape. Mismatch repair recognises the distortion and replaces the stretch on the new strand.',
          'Ultraviolet light joins neighbouring thymines into a dimer, which kinks the helix. Nucleotide excision repair cuts out a short patch and fills it using the other strand as the template. If repair fails, the dimer can be read wrongly at the next replication, and a mutation is fixed in one daughter cell. The Mutations tab classifies that change once it exists. Repair is what usually stops it existing.',
        ],
      },
    ],
    definitions: [
      { term: 'Operon', meaning: 'A bacterial cluster of genes transcribed from one promoter and controlled together.' },
      { term: 'Operator', meaning: 'The DNA site where a repressor binds to block transcription.' },
      { term: 'Inducible', meaning: 'Turned on by the presence of a substrate, as the lac operon is.' },
      { term: 'Corepressor', meaning: 'A small molecule, such as tryptophan, that activates a repressor.' },
      { term: 'Proofreading', meaning: 'DNA polymerase removing a mismatched nucleotide before continuing.' },
      { term: 'Excision repair', meaning: 'Cutting out a damaged patch of DNA and replacing it.' },
    ],
    worked: {
      title: 'Predict the lac operon',
      prompt: 'For each condition, say whether lac mRNA is high, low, or off, and name the proteins responsible.',
      steps: [
        'Lactose absent, glucose present. The repressor is on the operator. Transcription is off. CAP is also idle, but the repressor is enough.',
        'Lactose present, glucose present. Allolactose removes the repressor, but cAMP is low so CAP does not help. Transcription is low.',
        'Lactose present, glucose absent. The repressor is off and cAMP–CAP is bound. Transcription is high.',
        'Lactose absent, glucose absent. CAP would help, but the repressor is still bound. Transcription stays off. No substrate, no message.',
      ],
      result:
        'High lac expression has two requirements: repressor off, and CAP on. Either switch alone leaves the operon quiet or only barely active. Memorise the four boxes rather than a single slogan.',
    },
    pakistan: {
      title: 'Why a cotton gene is not “always on”',
      body:
        'The Cry protein in Bt cotton is a useful local picture of regulation, one step above the lac operon. The gene is bacterial in origin, but the plant expresses it because the inserted DNA includes a promoter the plant’s RNA polymerase recognises, often a strong viral promoter in the varieties that were studied. The same coding sequence without a working promoter would sit in the chromosome and make nothing. Regulation is not only a bacterial exam story. It is why a transgene does or does not appear in the leaf.',
    },
    keyPoints: [
      'An operon is several bacterial genes under one promoter and one operator.',
      'lac is inducible. High transcription needs lactose present and glucose absent.',
      'trp is repressible. Tryptophan is the corepressor that turns it off.',
      'Eukaryotes add chromatin. Acetylation opens it. DNA methylation often closes it.',
      'Proofreading is 3′ to 5′. Mismatch repair and excision repair follow.',
      'A mutation is what remains when repair does not. The Mutations tab classifies it.',
    ],
    quiz: [
      q(
        'The lac operon is transcribed strongly when',
        [
          'Glucose is high and lactose is absent',
          'Lactose is present and glucose is absent',
          'Both sugars are absent',
          'The repressor binds the operator more tightly',
        ],
        1,
        'Lactose removes the repressor. Low glucose raises cAMP so CAP helps polymerase. Both conditions are required.',
      ),
      q(
        'In the trp operon, tryptophan acts as a',
        ['Inducer that removes the repressor', 'Corepressor that activates the repressor', 'Ribosome', 'Primer'],
        1,
        'The trp repressor binds the operator only after tryptophan binds the repressor. The pathway switches off when the product is abundant.',
      ),
      q(
        'Histone acetylation is generally associated with',
        ['Tighter packing and silence', 'Looser chromatin and transcription', 'Joining thymine dimers', 'Removing introns'],
        1,
        'Acetyl groups reduce the histones’ grip on DNA, which leaves promoters more accessible. DNA methylation is the mark more often linked to silencing.',
      ),
      q(
        'Thymine dimers caused by ultraviolet light are repaired by',
        ['Nucleotide excision repair', 'The lac repressor', 'Osmosis', 'A competitive inhibitor'],
        0,
        'Excision repair cuts out the damaged patch and fills it from the other strand. Proofreading handles single mismatched bases during replication.',
      ),
    ],
    shorts: [
      {
        prompt: 'Explain positive and negative control of the lac operon.',
        answer:
          'Negative control is the repressor from lacI. In the absence of lactose it binds the operator and blocks RNA polymerase. Allolactose, derived from lactose, binds the repressor so it leaves the operator. Positive control is CAP. When glucose is low, cAMP is high and the cAMP–CAP complex binds near the promoter and helps polymerase bind. When glucose is high, CAP does not assist. Strong transcription therefore needs the repressor off and CAP on: lactose available, glucose scarce. The structural genes lacZ, lacY, and lacA are transcribed as one mRNA.',
      },
      {
        prompt: 'Describe two mechanisms that correct DNA damage or copying errors.',
        answer:
          'During replication, DNA polymerase proofreads. If the nucleotide just added is wrong, a 3′ to 5′ exonuclease activity removes it before synthesis continues. After replication, mismatch repair recognises remaining mispairs and replaces a stretch of the new strand. Separately, ultraviolet light can fuse adjacent thymines. Nucleotide excision repair cuts out an oligonucleotide that contains the dimer and DNA polymerase fills the gap using the undamaged strand as template. If these fail, the Mutations bench is the right place to classify the change that remains.',
      },
    ],
    related: [
      { label: 'Central dogma', hash: 'central-dogma' },
      { label: 'Mutations', hash: 'mutations' },
      { label: 'Crop biotechnology', hash: 'study/agri' },
    ],
  },
  {
    id: 'pcr',
    title: 'PCR',
    short: 'PCR',
    kicker: 'Copying a chosen stretch',
    level: 'FSc biotechnology and BS Methods in Molecular Biology',
    summary:
      'The polymerase chain reaction copies a chosen stretch of DNA over and over. Primers decide the ends. Taq polymerase survives the heat. The Primers tab calculates melting temperature. This page is the reaction itself.',
    sections: [
      {
        heading: 'What is being copied',
        paragraphs: [
          'PCR, devised by Kary Mullis, makes millions of copies of one region of DNA without first putting it into a living cell. You need to know sequences at both ends of the region so you can design primers. You do not need to know every base in the middle. The product is a defined fragment, not a copy of the whole genome.',
          'The reaction is cyclic. Each cycle can, in the ideal case, double the number of target molecules. After n cycles the ideal yield from one starting molecule is 2^n. Real reactions fall short of that once reagents run low or product is so abundant that it reanneals to itself. The late cycles plateau. Quoting 2^n without that limit is the usual overstatement.',
        ],
      },
      {
        heading: 'The ingredients',
        paragraphs: [
          'The tube contains template DNA, two primers, a supply of the four dNTPs, a heat-stable DNA polymerase, magnesium ions the polymerase needs, and a buffer. The forward primer binds one strand. The reverse primer binds the other. Both are written 5′ to 3′, and they point toward each other across the target. The Primers tab checks length, GC content, melting temperature, and simple self-complementarity. A pair whose melting temperatures differ by many degrees will not anneal cleanly in one shared step.',
          'Ordinary bacterial polymerase would be destroyed at the denaturation temperature, and you would have to add it every cycle. Taq polymerase, from the thermophile Thermus aquaticus, stays active. It extends near 72°C. Taq does not proofread. If the product must be an exact copy for cloning, a polymerase that does have a 3′ to 5′ exonuclease is a better choice. For detecting whether a fragment is present, Taq is enough.',
        ],
      },
      {
        heading: 'The three temperatures',
        paragraphs: [
          'Denaturation, near 94 or 95°C, separates the two strands. Annealing, often between 50 and 65°C, lets the primers bind. The temperature is chosen from the primer pair, not from a universal constant. Extension at 72°C is where Taq adds dNTPs in the 5′ to 3′ direction. A typical teaching programme runs about 30 cycles. The first cycles also copy long original strands. Only later cycles are dominated by the short fragment whose ends are exactly the two primers.',
          'If the starting material is RNA, a reverse transcriptase first makes complementary DNA. That whole method is RT-PCR. Quantitative PCR, or qPCR, watches the product during the run with a fluorescent dye or probe, so you learn how much template you started with, not only whether it was there. The names are confused constantly. RT means reverse transcriptase. The “q” means the measurement is quantitative. A test can be both.',
        ],
      },
      {
        heading: 'Reading the result, and the limits',
        paragraphs: [
          'The product is checked by gel electrophoresis. A band at the expected length, next to a ladder, is evidence that the primers found their sites and extension worked. A band of the wrong size, or a smear, means the primers bound elsewhere or the conditions were too loose. No band can mean no template, a failed enzyme, or primers that never annealed. A band is not, by itself, a clinical diagnosis.',
          'PCR is extraordinarily sensitive, which is its danger as well as its use. A single stray molecule from an earlier reaction can become a false positive. Teaching labs therefore separate preparation from the analysis of product. This page does not give cycling times, master-mix recipes, or a method for amplifying a pathogen. The principle, the temperatures, and the reading of a gel are the examinable core.',
        ],
      },
    ],
    definitions: [
      { term: 'Primer', meaning: 'A short DNA strand that gives polymerase a 3′ end to extend.' },
      { term: 'Denaturation', meaning: 'Heating double-stranded DNA until the strands separate.' },
      { term: 'Annealing', meaning: 'Cooling enough for primers to bind their complementary sites.' },
      { term: 'Taq polymerase', meaning: 'A heat-stable DNA polymerase from Thermus aquaticus.' },
      { term: 'RT-PCR', meaning: 'PCR that starts with reverse transcriptase making DNA from RNA.' },
      { term: 'qPCR', meaning: 'PCR measured during the run so the original amount can be estimated.' },
    ],
    worked: {
      title: 'Ideal yield after 10 cycles and after 30',
      prompt: 'One double-stranded target molecule enters a PCR. Assume perfect doubling and no plateau. How many copies after 10 cycles, and after 30?',
      steps: [
        'Each cycle doubles the target, so the count is 2^n.',
        'After 10 cycles, 2^10 = 1024.',
        'After 30 cycles, 2^30 = 1,073,741,824, about 1.07 × 10^9.',
        'State the assumption in the answer. Past the exponential phase, product, primers, or dNTPs limit the reaction and the real number is lower. Also, the very first cycles are not all short amplicons.',
      ],
      result:
        'The ideal answers are 1024 and about 1.07 billion. The number examiners want is the power of two, plus one sentence on the plateau.',
    },
    pakistan: {
      title: 'Diagnostic PCR, without a protocol',
      body:
        'Hospital and provincial laboratories in Pakistan use PCR and RT-PCR to detect pathogens, including during the COVID-19 response, when RNA from a swab was copied into DNA and then amplified. A positive result means the target sequence was detected above the lab’s threshold. It does not by itself say how ill the person is or which treatment to use. The same laboratories depend on the gel, or on a qPCR trace, and on controls that did not receive sample. Contamination control is part of the result.',
    },
    keyPoints: [
      'PCR copies the region between two primers. It does not need a living cell.',
      'A cycle is denature near 95°C, anneal near the primer Tm, extend at 72°C.',
      'Ideal yield is 2^n, and real reactions plateau.',
      'Taq survives the heat and does not proofread.',
      'RT-PCR starts from RNA. qPCR measures quantity during the run.',
      'A band on a gel is checked against a ladder. The Primers tab is for the pair. The gel page is for the reading.',
    ],
    quiz: [
      q(
        'Taq polymerase is used in PCR because',
        [
          'It cuts DNA at palindromes',
          'It stays active after the tube is heated to denature DNA',
          'It translates mRNA',
          'It proofreads better than every other polymerase',
        ],
        1,
        'Taq comes from a thermophile and survives about 95°C. It actually lacks proofreading. Heat stability is the reason it is chosen.',
      ),
      q(
        'In the ideal exponential phase, 10 cycles turn one target into',
        ['10 copies', '20 copies', '1024 copies', '10^10 copies'],
        2,
        'Perfect doubling gives 2^10 = 1024. Linear addition would be wrong. So would 10^10.',
      ),
      q(
        'RT-PCR differs from ordinary PCR because',
        [
          'It uses reverse transcriptase to make DNA from RNA first',
          'It never uses primers',
          'It runs only at 4°C',
          'It sequences protein directly',
        ],
        0,
        'The template for PCR itself is always DNA. If you start with RNA, reverse transcriptase must copy it into complementary DNA first.',
      ),
      q(
        'Primers determine',
        [
          'The ends of the amplified region',
          'The amino-acid sequence of haemoglobin',
          'Whether the gel anode is positive',
          'The Gram reaction of a bacterium',
        ],
        0,
        'Each primer binds one end of the target. Polymerase extends inward from those 3′ ends. Change the primers and you change which fragment you copy.',
      ),
    ],
    shorts: [
      {
        prompt: 'Describe one cycle of PCR and the role of each temperature.',
        answer:
          'The template, two primers, dNTPs, magnesium, buffer, and a heat-stable polymerase are already in the tube. At about 95°C the hydrogen bonds break and the strands separate. The tube is then cooled to an annealing temperature, chosen from the primers’ melting temperatures, so each primer binds its complementary site. At 72°C Taq polymerase extends each primer in the 5′ to 3′ direction, using dNTPs. One cycle can double the number of target molecules. The programme repeats this temperature pattern about 30 times. Product length is confirmed on a gel against a size ladder.',
      },
      {
        prompt: 'Why can a PCR result be wrong even when the enzyme worked?',
        answer:
          'PCR copies whatever matches the primers, including a contaminant from a previous reaction or from the person setting up the tube. A false positive is therefore a constant risk, and labs keep the preparation area away from amplified product and run a no-template control. A false negative can come from a poor sample, an inhibitor in the sample, or primers that do not match the strain. A band of the wrong size means the primers found an unexpected site. Sensitivity is the advantage of PCR and the reason a single band, without controls, is not yet an answer.',
      },
    ],
    related: [
      { label: 'Primer bench', hash: 'primers' },
      { label: 'Gel electrophoresis', hash: 'study/electrophoresis' },
      { label: 'Cloning', hash: 'study/cloning' },
    ],
  },
  {
    id: 'electrophoresis',
    title: 'Gel electrophoresis',
    short: 'Gels',
    kicker: 'Sorting molecules by size',
    level: 'FSc biotechnology practicals and BS methods',
    summary:
      'A gel in an electric field separates DNA, RNA, or protein by how easily each molecule moves. DNA is negative and moves toward the anode. Smaller DNA travels farther. A ladder turns distance into a length.',
    sections: [
      {
        heading: 'The apparatus',
        paragraphs: [
          'A gel is a porous slab. For DNA, the usual slab is agarose, a polysaccharide, cast with wells at one end. The gel sits in a buffer that conducts current. A power supply makes one end negative, the cathode, and the other positive, the anode. Samples are mixed with a dense loading dye so they sink into the wells, and the dye also gives a visible front while the gel runs.',
          'The percentage of agarose sets the pore size. A higher percentage makes a tighter gel and separates small fragments better. A lower percentage lets large fragments move. One percent agarose is a common teaching compromise for fragments of a few hundred to a few thousand base pairs. Polyacrylamide gels have smaller pores and are used for proteins and for very small DNA fragments. The principle is the same. The matrix changes.',
        ],
      },
      {
        heading: 'Why DNA moves, and why size matters',
        paragraphs: [
          'Every nucleotide adds a phosphate, and at the pH of the buffer those phosphates are negative. DNA is therefore pulled toward the anode, regardless of sequence. Two fragments of the same length run together even if their sequences differ. Sequence is invisible on a plain agarose gel. Length is what you see.',
          'The matrix tangles long molecules more than short ones. In a given time, a short fragment travels farther from the well. A 500 bp band ends nearer the anode than a 3000 bp band. The relationship is not a straight line on ordinary graph paper. Over a useful range it is roughly linear if you plot distance against the logarithm of length. Outside that range the gel is the wrong percentage and the estimate gets poor.',
        ],
      },
      {
        heading: 'Ladders, stains, and restriction patterns',
        paragraphs: [
          'A ladder, or marker, is a mixture of fragments of known length run in a neighbouring lane. You match your band to the nearest rungs. Estimating “about 700 bp” is honest. Estimating “701 bp” from a photograph is not. After restriction digestion, the number and sizes of bands say whether the sites you expected are present. Two fragments of the same size stack as one brighter band, which is a classic way to mis-count.',
          'DNA is detected with a dye that binds it and fluoresces under the right light. Ethidium bromide was the classical dye and is itself a hazard, so many teaching labs now use safer dyes that work the same way in the argument: no dye, no bands, even if the DNA is there. The dye does not change the order of the bands. Protein gels are different in one important way. Proteins are not all negatively charged, so they are usually coated with the detergent SDS, which gives them a similar charge-to-mass ratio. Then the gel sorts them by size too.',
        ],
      },
      {
        heading: 'What a band can and cannot say',
        paragraphs: [
          'A single band at the length your PCR should have made is supporting evidence that the reaction worked. It does not name an organism by itself, because another template of the same length would look identical. Controls belong in the picture: a lane with no template, and a lane you know should work. A smear can mean degraded DNA or a reaction that copied many lengths.',
          'Electrophoresis is analytical. It separates and displays. Recovering a band from a gel to clone it is a further technique, done in a supervised lab, and it is not described here. For the exam, the marks are the direction of movement, the effect of size, the role of the ladder, and the reading of a simple diagram.',
        ],
      },
    ],
    definitions: [
      { term: 'Anode', meaning: 'The positive electrode. DNA moves toward it.' },
      { term: 'Cathode', meaning: 'The negative electrode. DNA moves away from it.' },
      { term: 'Agarose', meaning: 'The polysaccharide gel used to separate DNA fragments of ordinary PCR size.' },
      { term: 'Ladder', meaning: 'A set of DNA fragments of known length, used as a ruler.' },
      { term: 'SDS-PAGE', meaning: 'A protein gel in which detergent gives polypeptides a uniform charge-to-mass ratio.' },
      { term: 'Restriction pattern', meaning: 'The set of band sizes produced when DNA is cut with a restriction enzyme.' },
    ],
    worked: {
      title: 'Which band is which?',
      prompt: 'A gel has the wells at the top, the cathode end. Lane 1 is a ladder with marks at 3000, 1000, and 500 bp, the 500 bp mark closest to the bottom. Lane 2 has one band level with the 1000 bp mark. Lane 3 has a band level with 500 bp and another just below the well. Read the lane.',
      steps: [
        'DNA moved downward, toward the anode. Farther from the well means smaller.',
        'Lane 2’s single band lines up with 1000 bp, so that fragment is about 1000 bp. Do not invent a more precise number.',
        'Lane 3 has a fragment of about 500 bp and a fragment near 3000 bp or larger, because it has hardly left the well. If the top ladder rung is 3000 and the band is even closer to the well, say “about 3000 bp or larger”.',
        'If this lane was a restriction digest of a plasmid, two bands mean the enzyme cut the circle in two places, or cut once and the sample also contains an uncut form. The picture alone cannot decide which, unless the question gives the plasmid size.',
      ],
      result:
        'Lane 2 is about 1000 bp. Lane 3 contains a small fragment of about 500 bp and a large fragment that stayed near the well. Size is read from the ladder, not from brightness. Brightness says roughly how much DNA is there.',
    },
    pakistan: {
      title: 'The gel next to the PCR machine',
      body:
        'Teaching laboratories in intermediate colleges and in BS programmes use the same pair of instruments: a thermal cycler and a submarine gel tank. A practical notebook should record the ladder sizes, the voltage only if the teacher set it, and which lane is which. Forensic and diagnostic labs in the country use the same principle on tighter, more controlled systems. The reading skill does not change. A band is a length, compared with a standard, in a named lane.',
    },
    keyPoints: [
      'DNA is negative because of its phosphates and moves toward the anode.',
      'Smaller fragments travel farther through agarose in a given time.',
      'A ladder converts distance into an approximate length.',
      'Higher percent agarose resolves smaller fragments.',
      'A plain DNA gel does not read sequence, only length.',
      'SDS-PAGE lets proteins be sorted by size as well.',
    ],
    quiz: [
      q(
        'In agarose electrophoresis, DNA migrates toward the',
        ['Cathode, because DNA is positive', 'Anode, because DNA is negative', 'Well, against the field', 'Loading dye, regardless of charge'],
        1,
        'Phosphates make DNA negative. It is attracted to the positive electrode, the anode. The wells are placed at the cathode end.',
      ),
      q(
        'A 400 bp fragment will, compared with a 2000 bp fragment,',
        [
          'Stay closer to the well',
          'Travel farther from the well in the same time',
          'Move toward the cathode',
          'Fail to bind any dye',
        ],
        1,
        'The gel hinders long molecules more. The shorter fragment pulls ahead.',
      ),
      q(
        'A ladder is included so that',
        [
          'The current has a path through the buffer',
          'Unknown bands can be matched to known lengths',
          'The DNA becomes positively charged',
          'Proteins fold correctly',
        ],
        1,
        'The ladder is a ruler. Without it you can say only which band moved farther, not how many base pairs it has.',
      ),
      q(
        'SDS is added to protein samples before PAGE in order to',
        [
          'Cut them into nucleotides',
          'Give polypeptides a similar charge-to-mass ratio so size dominates',
          'Make them move to the cathode as DNA does',
          'Stain them purple like a Gram stain',
        ],
        1,
        'Untreated proteins have different charges. SDS coats them with negative charge in proportion to length, and the gel then separates them mainly by size.',
      ),
    ],
    shorts: [
      {
        prompt: 'Explain why DNA fragments separate by size in an agarose gel.',
        answer:
          'At the pH of the running buffer the phosphate backbone of DNA is negatively charged, so every fragment moves toward the anode when the current is switched on. The agarose is a mesh. Long molecules are obstructed more than short ones and therefore move more slowly. After a set time, smaller fragments are farther from the wells. A ladder of known sizes in another lane turns the distance into an approximate length. The gel does not determine sequence. Two molecules of equal length comigrate even if their bases differ.',
      },
      {
        prompt: 'A student loads a gel at the anode end by mistake. Predict the result, and correct the layout.',
        answer:
          'DNA is attracted to the anode. If the wells are already at the anode end, the fragments move out of the gel into the buffer instead of through the matrix, and the lanes will look empty. The wells must be at the cathode, the negative end, so the DNA has the whole length of the gel to travel toward the positive end. The phrase “run to red”, where the red lead is positive, is the practical check. The scientific reason is the charge of the phosphates, not the colour of the wire.',
      },
    ],
    related: [
      { label: 'PCR', hash: 'study/pcr' },
      { label: 'Restriction sites', hash: 'sequences' },
      { label: 'Cloning', hash: 'study/cloning' },
    ],
  },
  {
    id: 'cloning',
    title: 'Recombinant DNA and cloning',
    short: 'Cloning',
    kicker: 'Cut, join, select',
    level: 'FSc biotechnology and HEC Recombinant DNA Technology',
    summary:
      'Recombinant DNA is DNA joined from more than one source. Gene cloning puts a fragment into a vector, introduces the vector into a host, and selects the cells that received it. The Sequences tab finds restriction sites. This page is the strategy, not a protocol.',
    sections: [
      {
        heading: 'What “recombinant” means',
        paragraphs: [
          'Recombinant DNA contains sequences that did not sit next to each other in nature, joined in the laboratory by enzymes. The usual pieces are an insert, the DNA you care about, and a vector, the DNA that will carry it and replicate it. A plasmid is the vector used in almost every teaching example: a small circular DNA that already replicates in a bacterial host.',
          'Cloning, in this chapter, means producing a population of identical DNA molecules, or of cells that contain them. It does not mean producing an identical animal. Reproductive cloning of animals is a different procedure and is not the FSc or BS core. If a question says “clone a gene”, it means the plasmid experiment.',
        ],
      },
      {
        heading: 'Cutting and joining',
        paragraphs: [
          'A restriction enzyme recognises a short DNA sequence and cuts it. EcoRI recognises GAATTC and cuts between G and A, leaving a 5′ overhang of AATT. Two fragments cut with the same enzyme have matching sticky ends and can base-pair. A blunt cut has no overhang and joins less readily. The Sequences tab scans a pasted sequence for EcoRI and the other classroom enzymes.',
          'Base-pairing of sticky ends is not yet a stable molecule. DNA ligase seals the sugar–phosphate backbone, using ATP, and makes the join covalent. If vector and insert are cut with the same single enzyme, the insert can enter in either direction, and the vector can also recircularise with no insert at all. Two different enzymes, with incompatible ends, force the insert into one orientation and stop the empty vector from closing easily. That design point is worth more marks than the names of extra enzymes.',
        ],
      },
      {
        heading: 'What a vector must have',
        paragraphs: [
          'A plasmid vector needs an origin of replication so the host will copy it. It needs a selectable marker, often a gene that confers resistance to an antibiotic, so cells that did not take up a plasmid can be removed. It needs a cloning site, preferably a cluster of unique restriction sites called a multiple cloning site, so you can open the circle once. It should be small enough to handle and should not already contain extra copies of the site you intend to cut.',
          'After ligation, the mixture is introduced into host cells. That uptake is transformation. Cells are then spread on medium containing the antibiotic that matches the marker. Cells with no plasmid do not form colonies. Cells with a plasmid do. This selection does not yet prove the plasmid contains the insert. Some colonies carry an empty recircularised vector.',
        ],
      },
      {
        heading: 'Telling which colonies have the insert',
        paragraphs: [
          'Insertional inactivation puts the cloning site inside a second marker. If the insert lands there, that marker stops working. Blue-white screening is the version taught most often. The site sits in lacZ, which encodes the α-peptide of β-galactosidase. An empty vector still makes the peptide, the enzyme works, and colonies turn blue on X-gal. An insert spoils lacZ, the enzyme fails, and the colony stays white. A white colony is a candidate, not a proof. A few whites are damaged vectors with no useful insert. PCR or a restriction digest of the plasmid is the check.',
          'A genomic library is a large set of clones that together cover a genome, introns included. A cDNA library is made from mRNA by reverse transcriptase, so the clones match the spliced messages and contain no introns. Bacteria cannot remove eukaryotic introns. If the aim is to make a eukaryotic protein in E. coli, cDNA, not a genomic fragment, is the insert that can be translated correctly. An expression vector also supplies a promoter the bacterial polymerase recognises, and a ribosome binding site, or the gene is silent.',
        ],
      },
      {
        heading: 'A medicine, and the line this page will not cross',
        paragraphs: [
          'The historical teaching example is human insulin. Early recombinant production made the A chain and the B chain separately in bacteria and joined them through disulfide bonds, giving insulin identical to the human hormone. Later processes changed the manufacturing detail. The principle did not change: a human coding sequence, a host that will express it, and purification of the product. Diabetics use that kind of insulin. The health page puts it next to other medicines.',
          'Nothing above is a method you can take to a bench. Amounts, strains, temperatures, and antibiotic concentrations belong in a supervised practical with an institutional biosafety committee. Joining DNA is also covered by Pakistan’s biosafety rules when it is more than a thought experiment. The biosafety page names the committees. The CRISPR tab finds candidate guide sites for study. It is not a cloning protocol either.',
        ],
      },
    ],
    definitions: [
      { term: 'Recombinant DNA', meaning: 'DNA molecules joined from sequences that were not originally adjacent.' },
      { term: 'Vector', meaning: 'A DNA molecule that carries an insert and replicates it in a host.' },
      { term: 'Sticky end', meaning: 'A short single-stranded overhang left by a staggered restriction cut.' },
      { term: 'Selectable marker', meaning: 'A gene that lets you keep only the cells that received the vector.' },
      { term: 'cDNA', meaning: 'DNA copied from mRNA by reverse transcriptase, so introns are already gone.' },
      { term: 'Transformation', meaning: 'Uptake of naked DNA by a cell. In cloning, uptake of the plasmid.' },
    ],
    worked: {
      title: 'Why half the inserts may face the wrong way',
      prompt: 'A plasmid has one EcoRI site. The insert is cut out with EcoRI only. After ligation and selection, many white colonies, in a blue-white version of this plasmid, still fail to express the protein. Give two independent reasons.',
      steps: [
        'EcoRI ends are the same at both ends of the insert. The fragment can ligate in the forward orientation or the reverse orientation. Only the forward orientation puts the start of the gene next to the promoter.',
        'About half of the true inserts are therefore backwards, if ligation is random. Those clones have the DNA and still make no protein from that promoter.',
        'A second reason: a white colony can be a false lead, with a damaged lacZ and no insert. Expression fails because there is nothing to express.',
        'The repair in the design is to cut with two different enzymes so the ends are incompatible and the insert can enter only one way. Then check several colonies by PCR or by cutting the recovered plasmid.',
      ],
      result:
        'Same-enzyme cloning does not control direction. Selection on one antibiotic does not prove an insert is present. Orientation and an empty vector are separate problems, and a good answer names both.',
    },
    pakistan: {
      title: 'From a teaching plasmid to Bt cotton',
      body:
        'The same logic, at a much higher level of regulation, produced the genes in Pakistan’s approved Bt cotton. A cry coding sequence was placed with a promoter that works in a plant, introduced into cotton, and the plants were tested before the National Biosafety Committee cleared varieties for commercial release around 2010. CEMB at the University of the Punjab and NIBGE in Faisalabad were part of the public research. The classroom plasmid and the cotton event differ in host, vector, and rules. They share the idea of a coding sequence that did not evolve in that genome.',
    },
    keyPoints: [
      'A clone of a gene is a plasmid experiment, not an identical animal.',
      'Restriction enzymes cut. Matching sticky ends base-pair. Ligase seals the backbone.',
      'A vector needs an origin, a selectable marker, and a cloning site.',
      'Antibiotic selection removes cells with no plasmid. It does not prove the insert is there.',
      'Blue-white screening: white colonies are candidates because lacZ was interrupted.',
      'cDNA lacks introns and is the insert to use when a bacterium must make a eukaryotic protein.',
    ],
    quiz: [
      q(
        'EcoRI ends from two different DNA molecules can anneal because',
        [
          'Both overhangs are the same AATT sequence',
          'Ligase creates the overhang after joining',
          'The fragments are always blunt',
          'RNA polymerase translates them',
        ],
        0,
        'EcoRI leaves a 5′ AATT overhang on both sides of the cut. Complementary overhangs base-pair. Ligase then seals the backbone.',
      ),
      q(
        'Colonies grow on the antibiotic plate because',
        [
          'Every bacterial cell is naturally resistant',
          'The plasmid’s marker gene protects the cells that received it',
          'The insert is always an antibiotic',
          'Blue colonies have no plasmid',
        ],
        1,
        'The selectable marker, often an antibiotic-resistance gene on the plasmid, lets you discard cells that took up nothing. It does not guarantee an insert.',
      ),
      q(
        'A cDNA library is preferred for expressing a human protein in E. coli because',
        [
          'cDNA still contains every intron',
          'cDNA is copied from spliced mRNA and has no introns',
          'Bacteria splice human introns correctly',
          'cDNA is a protein, not a nucleic acid',
        ],
        1,
        'Bacteria do not remove eukaryotic introns. Reverse transcriptase copies the already spliced mRNA, so the coding sequence is continuous.',
      ),
      q(
        'A white colony in blue-white screening means',
        [
          'lacZ was disrupted, so the colony is a candidate and still needs a check',
          'The colony is certainly producing insulin',
          'The cell has no plasmid at all and should have died',
          'The DNA is RNA',
        ],
        0,
        'White means β-galactosidase activity failed, which is what an insert in lacZ does. Confirm the plasmid by PCR or restriction digest before you trust it.',
      ),
    ],
    shorts: [
      {
        prompt: 'List the steps of gene cloning, from a fragment to a colony, and say what each step achieves.',
        answer:
          'The insert and a plasmid vector are cut with restriction enzymes that leave compatible ends. Matching sticky ends base-pair, and DNA ligase seals the sugar–phosphate backbone, producing recombinant DNA. The ligation mixture is introduced into host cells by transformation. Cells are plated on medium containing the antibiotic matching the plasmid’s marker, so only cells that received a plasmid form colonies. Colonies are then screened, for example by blue-white colour or by PCR, because an empty religated plasmid also gives a resistant colony. A confirmed colony can be grown to produce many copies of the same plasmid.',
      },
      {
        prompt: 'Why does an expression vector need more than an origin and a resistance gene?',
        answer:
          'An origin makes the plasmid replicate, and a resistance gene lets you select cells that carry it. Neither one makes the host transcribe your insert. An expression vector adds a promoter that the host RNA polymerase recognises, placed so that it drives the insert in the correct orientation, and a ribosome binding site so the mRNA is translated. For a eukaryotic protein the insert should be cDNA, because the bacterial host will not splice out introns. Even then, the protein may need disulfide bonds or other folding the bacterium handles poorly, which is why some products are made in yeast or mammalian cells instead.',
      },
    ],
    related: [
      { label: 'Restriction scan', hash: 'sequences' },
      { label: 'PCR', hash: 'study/pcr' },
      { label: 'Biosafety', hash: 'study/biosafety' },
    ],
  },
];
