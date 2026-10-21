import type { StudyQuiz, StudyTopic } from './studyTypes';

function q(
  prompt: string,
  choices: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explanation: string,
): StudyQuiz {
  return { prompt, choices, answer, explanation };
}

export const STUDY_PART_3: readonly StudyTopic[] = [
  {
    id: 'bioinformatics',
    title: 'Bioinformatics',
    short: 'Bioinformatics',
    kicker: 'Sequences in a database',
    level: 'HEC BS Bioinformatics, using the Sequences tab',
    summary:
      'Bioinformatics stores and compares biological data with computers. This page covers records, global versus local alignment, what a BLAST E-value means, and how far a family tree can be trusted. The Sequences tab already runs a short Needleman–Wunsch alignment.',
    sections: [
      {
        heading: 'The job',
        paragraphs: [
          'A genome is too long to compare by eye, and a public database holds more sequences than any person can read. Bioinformatics is the use of computing to store, retrieve, and interpret that data: DNA, RNA, proteins, and the notes that say where a sequence came from. The biology is still in charge. A program does not decide that two genes have the same function. A person tests that idea.',
          'The bench you are using is a small, offline version of the same habits. It parses FASTA, finds an open reading frame, scans restriction sites, and aligns two short sequences. It does not phone a database. Knowing what the database would have added is this lesson.',
        ],
      },
      {
        heading: 'Records and how you ask for one',
        paragraphs: [
          'A primary nucleotide archive, GenBank at NCBI, stores DNA and RNA sequences with an accession number that identifies the record. A protein archive such as UniProt stores amino-acid sequences and, where known, a function. The accession is the thing to write in a lab notebook, not a vague “the human insulin gene”. Two records can describe the same gene and differ in length if one includes introns and the other is a cDNA.',
          'A useful record has the organism, the molecule type, and a feature table that marks exons, the coding sequence, and the translation. Searching by a gene name returns many hits. Searching by accession returns one. Quality matters. A predicted gene in a draft genome is not the same evidence as a sequenced cDNA from a laboratory. The header tells you which you are looking at, if you read it.',
        ],
      },
      {
        heading: 'Alignment',
        paragraphs: [
          'An alignment writes two sequences one above the other, with gaps where an insertion or a deletion fits better than a run of mismatches. Identity is the fraction of positions with the same letter. Similarity, for proteins, also counts different amino acids that behave alike, such as leucine and isoleucine. A DNA alignment usually reports identity. A protein alignment often reports similarity. Mixing the two words loses a mark.',
          'A global alignment, Needleman–Wunsch, forces the comparison from the first letter to the last. Use it when the sequences are related along their whole length and are about the same size. A local alignment, Smith–Waterman, finds the best matching stretch and ignores ragged ends. Use it when only a domain is shared. The Sequences tab implements a short global alignment so the penalties for a mismatch and a gap are visible. It will make a poor picture of two long sequences that share only a motif. That is a limit of the algorithm you chose, not a biological conclusion.',
        ],
      },
      {
        heading: 'BLAST and the E-value',
        paragraphs: [
          'BLAST is a fast local search. You give it a query and it looks through a database for stretches that resemble the query, using a shortcut so it does not run a full Smith–Waterman against every record. A hit comes back with a score, a length, a percent identity, and an E-value.',
          'The E-value is the number of matches of this quality you would expect by chance in a database of that size. An E-value of 0.05 means about one such match in twenty searches would be an accident. An E-value of 1 × 10^−20 is not an accident. It is not a probability, and it is not the percent identity. A short perfect match can have a dull E-value because short matches happen often. A long match of 70 percent identity can be convincing. Read the length and the E-value together. A hit is a hypothesis about homology. Function is a further claim and needs an experiment or a much more careful argument.',
        ],
      },
      {
        heading: 'Trees, structures, and a limit',
        paragraphs: [
          'A multiple alignment lines up many sequences at once. From the differences, a program can draw a tree. Branches that join sooner are sequences that have changed less since they shared an ancestor, under the model the program assumed. Change the model, or the alignment, and the tree can move. A tree is a hypothesis drawn from the sequences you included. Leave out the right relative and the picture misleads.',
          'Predicting a protein fold from sequence is now good enough, in many cases, to suggest a shape before a crystal exists. A predicted shape is still a model. It does not prove where the active site is, and it does not replace the kinetics bench if the question is how fast the enzyme works. Bioinformatics narrows the experiment. It does not retire it.',
        ],
      },
    ],
    definitions: [
      { term: 'Accession', meaning: 'The stable identifier of one database record.' },
      { term: 'Identity', meaning: 'The fraction of aligned positions that are the same letter.' },
      { term: 'Global alignment', meaning: 'An alignment that covers both sequences from end to end.' },
      { term: 'Local alignment', meaning: 'An alignment of the best matching region, ignoring unmatched ends.' },
      { term: 'E-value', meaning: 'How many matches of this quality chance would produce in that database.' },
      { term: 'Homology', meaning: 'Similarity due to shared ancestry, not merely a high score.' },
    ],
    worked: {
      title: 'Identity is not an E-value',
      prompt: 'Sequence A is ATGCATGC. Sequence B is ATGCTTGC. They are already lined up with no gaps. Compute the identity, and say what you still do not know.',
      steps: [
        'Eight positions. Compare them: positions 1–4 match (ATGC), position 5 is A versus T, positions 6–8 match (TGC).',
        'Seven of eight letters match. Identity = 7/8 = 0.875, or 87.5 percent.',
        'There is one mismatch, at position 5. This number is identity, not similarity, and there is no gap penalty to apply.',
        'You cannot quote an E-value. An E-value needs a database size and a scoring model. 87.5 percent of an 8-letter string is a weak hint, because short matches occur often. The same percent over 800 letters would be a different claim.',
      ],
      result:
        'The identity is 87.5 percent. The missing number is the E-value, and it cannot be invented from percent identity alone. Length is part of the evidence.',
    },
    pakistan: {
      title: 'A record is a citation',
      body:
        'Pakistani research groups deposit crop and pathogen sequences in the same public archives as everyone else, and a thesis that says “similar to a Chinese isolate” without an accession cannot be checked. The habit this page asks for is small enough to use on a college assignment: paste the two short sequences into the Sequences tab, report the alignment, and if you later use BLAST on a connected computer, write down the accession, the identity, the alignment length, and the E-value. A screenshot of a score with no accession is not a result.',
    },
    keyPoints: [
      'GenBank stores nucleotides. UniProt stores proteins. An accession identifies a record.',
      'Identity counts identical letters. Protein similarity also counts similar side chains.',
      'Needleman–Wunsch is global. Smith–Waterman and BLAST are local.',
      'The E-value is an expected number of chance hits, not a probability and not a percent.',
      'A hit suggests homology. It does not prove function.',
      'The Sequences tab is the global alignment you can do offline.',
    ],
    quiz: [
      q(
        'An E-value of 1 × 10^−15 means',
        [
          'The sequences are 15 percent identical',
          'About 10^−15 matches this good would be expected by chance',
          'The gene is certainly a human gene',
          'The alignment is global',
        ],
        1,
        'The E-value is a chance expectation given the database and the scoring system. It is not the percent identity, and it does not name the organism.',
      ),
      q(
        'Needleman–Wunsch is the algorithm for',
        ['A global alignment', 'A BLAST search of GenBank', 'Folding a protein', 'A Gram stain'],
        0,
        'Needleman–Wunsch aligns both sequences end to end. BLAST is a fast local search. The Sequences tab uses a short global alignment.',
      ),
      q(
        'Two DNA sequences of very different length that share one domain are better compared with',
        ['A global alignment only', 'A local alignment', 'Percent GC and nothing else', 'A restriction digest'],
        1,
        'A global alignment would penalise the unmatched lengths. A local alignment reports the shared region, which is the biologically interesting part.',
      ),
      q(
        'Homology means',
        [
          'Any two sequences with the same length',
          'Similarity explained by common ancestry',
          'Identical function, proved by a score',
          'The E-value multiplied by identity',
        ],
        1,
        'A high score is evidence you use to argue for homology. Homology itself is the historical claim: the similarity was inherited.',
      ),
    ],
    shorts: [
      {
        prompt: 'Distinguish a global alignment from a local alignment, and name an algorithm for each.',
        answer:
          'A global alignment lines up two sequences from the first position to the last, inserting gaps where needed so every letter is accounted for. Needleman–Wunsch is the classical algorithm, and it suits sequences that are related over their whole length. A local alignment finds the highest-scoring matching region and does not force the ends to line up. Smith–Waterman is the exact local algorithm, and BLAST is a fast approximate local search used against databases. Choosing global for a shared domain buried in unrelated sequence produces a misleading identity.',
      },
      {
        prompt: 'A classmate says an E-value of 0.001 means the sequences are 99.9 percent identical. Correct the statement.',
        answer:
          'The E-value is not a percent identity. It is the number of alignments at least this good that you would expect to find by chance in a database of that size. An E-value of 0.001 means a chance match of this quality is unlikely, about one in a thousand searches, but the sequences might still differ at many positions if they are long. Percent identity is read from the alignment itself. A correct report gives identity, alignment length, and E-value as three separate numbers, plus the accession of the hit.',
      },
    ],
    related: [
      { label: 'Sequence tools', hash: 'sequences' },
      { label: 'Evolution', hash: 'study/evolution' },
      { label: 'Central dogma', hash: 'central-dogma' },
    ],
  },
  {
    id: 'biosafety',
    title: 'Biosafety and bioethics',
    short: 'Biosafety',
    kicker: 'Accidents, misuse, and consent',
    level: 'HEC Biosafety, Biosecurity and Bioethics',
    summary:
      'Biosafety keeps people and the environment safe from an accidental release. Biosecurity keeps biological material from being stolen or misused. Bioethics asks whether a study is honest, consented, and fair. Pakistan’s 2005 rules name the committees that review the work.',
    sections: [
      {
        heading: 'Two words that are not interchangeable',
        paragraphs: [
          'Biosafety is protection against an accident: a spill, a needle, an escaped pollen grain, a culture that was not killed before the flask was washed. The controls are training, containment, and a habit of assuming the organism can leave if you are careless. Biosecurity is protection against a deliberate act: theft of a pathogen, sabotage, or the misuse of a method that was published for a legitimate reason. Locks, inventories, and knowing who is in the lab are biosecurity. A biosafety cabinet does not, by itself, provide them.',
          'The Pakistan Biosafety Rules, 2005, define biosafety as the policy and procedures that keep the application of biotechnology environmentally safe. They were made under the Pakistan Environmental Protection Act, 1997. They cover laboratory work with genetically modified organisms, field trials, and commercial sale. A student project that never leaves a thought experiment is not a release. A project that builds an organism is.',
        ],
      },
      {
        heading: 'Risk groups, described as categories',
        paragraphs: [
          'Teaching texts sort microbes into four risk groups by the disease they can cause and by whether prevention or treatment exists. Group 1 organisms are not known to cause disease in healthy adults and are the ones a school practical should use. Higher groups cause progressively more serious disease and need facilities this site will not help you imitate. The label of a risk group is not a challenge and not a shopping list.',
          'Containment levels, often called biosafety levels, match the work to the room. A teaching lab for group 1 organisms relies on standard practice: no food, no mouth pipetting, handwashing, a bench that is cleared, waste that is treated before it is discarded. Higher levels add restricted access, safety cabinets, and building systems. Describing those buildings is not part of learning the principle, and bypassing them is a crime rather than a technique. If your practical needs more than group 1, it needs a supervisor and an approved room, not a webpage.',
        ],
      },
      {
        heading: 'Who signs off in Pakistan',
        paragraphs: [
          'The rules set up three bodies. An Institutional Biosafety Committee sits at the university or company. It includes the head of the institution, subject experts, a social scientist, and a representative of civil society. It helps researchers assess risk, trains people, and watches the work in that building. The Technical Advisory Committee is the national scientific review. The National Biosafety Committee licenses activities and sets policy. The Director General of the Pakistan Environmental Protection Agency is its secretary under the 2005 rules.',
          'The order matters. A researcher does not apply to the National Biosafety Committee in a vacuum. The institutional committee looks first, the technical committee assesses, and the national committee decides on release. Field trials and commercial sale of a living modified organism are licensed events, not extensions of a successful Petri dish. Bt cotton went through that gate. The crop page tells that story. The rule page is the gate itself.',
        ],
      },
      {
        heading: 'Ethics',
        paragraphs: [
          'Research ethics, in the form used for human studies, rests on three ideas. Respect for persons means a participant is told the truth and can refuse. Beneficence means the study should seek a benefit and limit harm. Justice means the people who bear the risk should not be a group chosen because they cannot say no, and the benefit should not be reserved for someone else. Informed consent is the written or recorded form of the first idea. A signature from a person who was not told the risks is not consent.',
          'Data ethics is simpler and fails more often. You do not invent a gel, a sequence, or a patient count. You do not put your name on a classmate’s practical. A fabricated figure is a scientific failure before it is an administrative one, because later work will be built on it. For genetics, a thalassemia test discloses information about a family, not only about one person. The result needs counseling and privacy, which is the inheritance page meeting this one.',
        ],
      },
      {
        heading: 'Genes, crops, and dual use',
        paragraphs: [
          'Somatic gene therapy changes cells that are not passed to children. Germline change would be inherited. Many countries allow carefully reviewed somatic research and restrict heritable editing of human embryos. Those are different acts. A CRISPR guide-finding exercise on this website is neither. It does not edit a cell.',
          'A genetically modified crop is reviewed case by case. “All GM is safe” and “all GM is harmful” are both slogans. The questions are which gene, which plant, which insect or weed, and what the field trial showed. Some biological knowledge can also be misused. That is dual use. The response is review, training, and a refusal to turn a textbook into a method for causing harm. This site stops at the principle on purpose.',
        ],
      },
    ],
    definitions: [
      { term: 'Biosafety', meaning: 'Measures that prevent accidental infection, release, or environmental harm.' },
      { term: 'Biosecurity', meaning: 'Measures that prevent theft, loss, or deliberate misuse of biological material.' },
      { term: 'Risk group', meaning: 'A category that ranks a microbe by the disease it can cause and the treatments available.' },
      { term: 'Informed consent', meaning: 'Agreement given after the person understands the risks, the purpose, and the right to refuse.' },
      { term: 'Somatic therapy', meaning: 'A genetic change in body cells that is not meant to reach the next generation.' },
      { term: 'Dual use', meaning: 'Research that has a legitimate use and could also be misused to cause harm.' },
    ],
    worked: {
      title: 'Sort six controls into the right column',
      prompt: 'Classify: a biosafety cabinet, a lock on a freezer, an inventory of vials, a no-food rule, a vaccination of staff where a vaccine exists, and a background check for access. Which are mainly biosafety, and which are mainly biosecurity?',
      steps: [
        'The cabinet, the no-food rule, and staff vaccination reduce accidental infection. They are biosafety.',
        'The lock, the inventory, and the access check reduce theft and unauthorised use. They are biosecurity.',
        'An inventory also helps biosafety, because a missing vial might be a spill rather than a theft. Say “mainly” if a control serves both.',
        'None of these six is an ethics review. Consent forms and data integrity are a third column. Do not dump them under biosecurity just because they are rules.',
      ],
      result:
        'Cabinet, food ban, and vaccination: biosafety. Lock, inventory, and access check: biosecurity, with inventory shared. Ethics is separate: consent, fairness, and honest data.',
    },
    pakistan: {
      title: 'The 2005 rules are the citation',
      body:
        'Quote the instrument by name. The Pakistan Biosafety Rules, 2005, were notified under the Pakistan Environmental Protection Act, 1997. They establish the National Biosafety Committee and the Technical Advisory Committee, and they require an Institutional Biosafety Committee where the work is done. Pakistan Biosafety Guidelines sit beside the rules as the detailed companion. A project that releases a living modified organism, even a plant, needs that path. A classroom explanation of the lac operon does not.',
    },
    keyPoints: [
      'Biosafety prevents accidents. Biosecurity prevents deliberate misuse.',
      'Risk group 1 is the teaching-lab category. Higher groups need an approved facility.',
      'In Pakistan the institutional committee, the technical committee, and the national committee have different jobs.',
      'The rules were made in 2005 under the Environmental Protection Act of 1997.',
      'Consent, minimising harm, and fairness are the ethics test for studies on people.',
      'Somatic gene therapy is not germline editing. A crop is reviewed case by case.',
    ],
    quiz: [
      q(
        'A lock and an inventory of a pathogen collection are mainly',
        ['Biosafety', 'Biosecurity', 'A replacement for informed consent', 'A Calvin cycle control'],
        1,
        'They stop unauthorised access and reveal a loss. That is biosecurity. A cabinet and a handwashing rule are biosafety.',
      ),
      q(
        'The Pakistan Biosafety Rules, 2005, were made under',
        [
          'The Pakistan Environmental Protection Act, 1997',
          'The Mendelian laws of 1866',
          'A provincial textbook board circular only',
          'The genetic code',
        ],
        0,
        'The rules cite section 31 of the Pakistan Environmental Protection Act, 1997. They are national law about biotechnology, not a chapter of a textbook.',
      ),
      q(
        'Informed consent requires that the person',
        [
          'Signs quickly, before hearing the risks',
          'Understands the purpose and the risks and may refuse',
          'Is a relative of the researcher',
          'Agrees that data may be invented if the result is useful',
        ],
        1,
        'Consent is understanding plus a free choice. A signature without the explanation is not informed. Refusal must be a real option.',
      ),
      q(
        'Somatic gene therapy differs from germline editing because',
        [
          'Somatic change is not intended to be inherited',
          'Somatic therapy changes every descendant',
          'Germline editing cannot use DNA',
          'They are two names for blue-white screening',
        ],
        0,
        'Somatic therapy targets body cells of one person. Germline editing would change embryos or gametes and be passed on. The ethical rules treat them differently.',
      ),
    ],
    shorts: [
      {
        prompt: 'Distinguish biosafety from biosecurity, with one example of each.',
        answer:
          'Biosafety reduces the chance that a biological agent harms a worker or the environment by accident. A biosafety cabinet, a ban on mouth pipetting, and treatment of waste before disposal are biosafety measures. Biosecurity reduces the chance that an agent is stolen, lost, or used deliberately to cause harm. Locked storage, a vial inventory, and limited access are biosecurity measures. A laboratory needs both. One does not substitute for the other, and neither one is the same as an ethics review of a project involving human participants.',
      },
      {
        prompt: 'Name the three committees in Pakistan’s biosafety system and state one role of each.',
        answer:
          'The Institutional Biosafety Committee works at the university or institute. It assesses local risk, trains researchers, and monitors regulated work in that place. The Technical Advisory Committee provides national scientific assessment of proposals. The National Biosafety Committee, established under the Pakistan Biosafety Rules, 2005, licenses work and is the policy authority, including on commercial release of living modified organisms. An application moves upward. Approval by a supervisor is not a national license to release a genetically modified plant.',
      },
    ],
    related: [
      { label: 'Cloning', hash: 'study/cloning' },
      { label: 'Crop biotechnology', hash: 'study/agri' },
      { label: 'Health biotechnology', hash: 'study/health' },
    ],
  },
  {
    id: 'fermentation',
    title: 'Fermentation and industrial biotechnology',
    short: 'Fermentation',
    kicker: 'A word with two meanings',
    level: 'FSc biotechnology and HEC Industrial Biotechnology',
    summary:
      'In biochemistry, fermentation regenerates NAD+ without oxygen. In industry, fermentation is any large culture that makes a product, aerobic or not. This page separates the two, names the bioreactor, and stops before a production recipe.',
    sections: [
      {
        heading: 'The biochemical meaning',
        paragraphs: [
          'Glycolysis makes ATP and converts NAD+ to NADH. If the cell has no oxygen, or no respiratory chain, the NADH must still be turned back into NAD+ or glycolysis stops. Fermentation is that anaerobic recycling. The carbon product is the waste that makes it possible. The ATP yield is the two ATP from glycolysis, far below the yield of full respiration on the oxidative phosphorylation page.',
          'In alcoholic fermentation, pyruvate from glycolysis is converted to acetaldehyde and then to ethanol. Carbon dioxide is released. The classroom equation is C6H12O6 → 2 C2H5OH + 2 CO2, with a net of 2 ATP, in yeast. In lactic fermentation, pyruvate is reduced straight to lactate, as in Lactobacillus and in human muscle when oxygen delivery lags. No carbon dioxide is released in that short path. Both routes exist to free NAD+. The ethanol and the lactate are not the cell’s goal.',
        ],
      },
      {
        heading: 'The industrial meaning',
        paragraphs: [
          'An industrial fermentation is a controlled growth of microbes, or of plant or animal cells, to make a product. The product might be the cells themselves, an alcohol, an acid, an antibiotic, or an enzyme. Some of these processes are anaerobic in the biochemical sense. Many are aerobic and would not be called fermentation by a biochemist. The word survived in factories. In an exam, say which meaning you are using.',
          'The organism is chosen for the product and for its behaviour in a tank. Saccharomyces cerevisiae makes ethanol and raises bread. Lactobacillus species sour milk into yoghurt. Aspergillus niger is the fungus used to make citric acid, and that process is aerobic. Industrial strains of Penicillium make penicillin, also aerobically. The strain on a factory site has usually been selected for yield. It is not a sample scooped from a fruit and poured into a tank.',
        ],
      },
      {
        heading: 'The vessel',
        paragraphs: [
          'A bioreactor is a closed vessel in which the conditions can be set. An impeller stirs so that cells, nutrients, and heat do not sit in layers. A jacket or coils add or remove heat, because a growing culture releases heat and enzymes have optima. Probes follow pH and temperature. Ports let you add feed or take samples. If the process is aerobic, a sparger blows sterile air in as small bubbles. Oxygen dissolves poorly, so stirring and sparging are the whole problem of an aerobic tank, not a detail.',
          'The vessel is sterilised before the chosen organism is added, or a contaminant will outgrow the product or spoil it. That sentence is the principle. Times, pressures, and media recipes are a plant operator’s documents, not this course. Downstream processing is everything after the culture: separating cells from liquid, then extracting or chromatographing the product until it is pure enough to sell. A titre in the tank is not yet a medicine.',
        ],
      },
      {
        heading: 'Batch, fed-batch, and continuous',
        paragraphs: [
          'In a batch culture all the nutrients are present at the start. The population follows the growth curve on the microbiology page: lag, log, stationary, and, if you wait, death. You harvest once. It is simple and it is how many older processes run. The stationary phase arrives because something ran out.',
          'In a fed-batch culture you add fresh feed during the run and you do not remove culture. The volume rises. You can keep cells in a productive state longer and avoid giving them, at the start, a sugar concentration that would poison them. In a continuous culture, fresh medium enters and culture leaves at the same rate. A chemostat holds the population in exponential growth by the rate of that feed. Continuous operation is efficient and harder to keep free of contaminants. The exam distinction is when material enters and whether anything leaves.',
        ],
      },
      {
        heading: 'Scale-up',
        paragraphs: [
          'A flask that works at one litre can fail at ten thousand litres for physical reasons. The surface-to-volume ratio falls, so heat is harder to remove. Oxygen is harder to distribute. Mixing times get longer, and cells near the sparger see a different liquid from cells near the wall. A successful scale-up copies the conditions the cells experience, not the shape of the flask.',
          'Industrial biotechnology is this combination: a strain, a feed, a vessel, a mode of running it, and a purification. Enzymes in washing powder, citric acid in a soft drink, penicillin, and vaccine antigens are products of that chain. The metabolic map on this site is the cell’s half of the story. The tank is the other half.',
        ],
      },
    ],
    definitions: [
      { term: 'Alcoholic fermentation', meaning: 'Anaerobic regeneration of NAD+ by yeast, producing ethanol and CO2.' },
      { term: 'Lactic fermentation', meaning: 'Anaerobic regeneration of NAD+ by reducing pyruvate to lactate.' },
      { term: 'Bioreactor', meaning: 'A vessel that controls the conditions of a large biological culture.' },
      { term: 'Sparger', meaning: 'The pipe that introduces sterile air as bubbles in an aerobic fermentation.' },
      { term: 'Fed-batch', meaning: 'A culture that receives extra feed during the run and is harvested at the end.' },
      { term: 'Downstream processing', meaning: 'Recovery and purification of the product after the culture step.' },
    ],
    worked: {
      title: 'Count the ATP, then name the factory word',
      prompt: 'One glucose is fermented to ethanol by yeast. How many ATP does the cell net, and why do industrial microbiologists still call an aerobic citric-acid tank a fermentation?',
      steps: [
        'Glycolysis nets 2 ATP per glucose and produces 2 NADH and 2 pyruvate.',
        'Each pyruvate becomes ethanol, and the NADH is oxidised back to NAD+. No further ATP is made. The net is 2 ATP.',
        'Full respiration would yield roughly 30 ATP, depending on the shuttle, which is why yeast switches when oxygen is available. The metabolism lessons hold that count.',
        'The citric-acid process uses Aspergillus and oxygen. A biochemist would not call it fermentation. Factory language calls almost any production culture a fermentation. Say so, or the two halves of the syllabus collide.',
      ],
      result:
        'The cell nets 2 ATP per glucose in alcoholic fermentation. “Industrial fermentation” is a wider word and includes aerobic processes such as citric acid and penicillin.',
    },
    pakistan: {
      title: 'Dahi, bread, and molasses',
      body:
        'Dahi is lactic fermentation in a kitchen: bacteria sour the lactose and the milk sets. Bread and naan dough use yeast, and the carbon dioxide from alcoholic fermentation is what raises the dough. Those are the biochemical meaning, at home. Pakistan’s sugar mills produce molasses, a cheap carbon source that industrial microbiology worldwide uses as feed. The jump from a bowl of dahi to a stirred, aerated tank is the jump between the two meanings of the word.',
    },
    keyPoints: [
      'Biochemical fermentation regenerates NAD+ and nets 2 ATP per glucose.',
      'Yeast makes ethanol and CO2. Lactic fermentation makes lactate and no CO2.',
      'Industry also calls aerobic production cultures fermentations. Say which meaning you mean.',
      'A bioreactor controls stirring, temperature, pH, and, if needed, air.',
      'Batch is closed. Fed-batch adds feed. Continuous culture also removes culture.',
      'Scale-up fails when heat and oxygen cannot be delivered the way they were in a flask.',
    ],
    quiz: [
      q(
        'The net ATP from one glucose in alcoholic fermentation is',
        ['2', '18', 'About 30', '0, because NAD+ is recycled'],
        0,
        'The 2 ATP come from glycolysis. Regenerating NAD+ does not add ATP. About 30 is the aerobic estimate. Eighteen is the Calvin-cycle bill.',
      ),
      q(
        'A sparger is needed when',
        [
          'The process is aerobic and the cells need dissolved oxygen',
          'The goal is lactic fermentation in a sealed jar',
          'DNA is being run on a gel',
          'A repressor binds the operator',
        ],
        0,
        'The sparger introduces sterile air. Anaerobic fermentations do not want it. Oxygen transfer is the limit in many large aerobic tanks.',
      ),
      q(
        'In a chemostat, the population is kept growing because',
        [
          'Fresh medium enters and culture leaves continuously',
          'All nutrients were added at the start and the vessel is then closed',
          'The temperature is held at 95°C',
          'No cells are allowed to divide',
        ],
        0,
        'Continuous culture, with matched inflow and outflow, can hold cells in exponential growth. A closed batch cannot.',
      ),
      q(
        'Citric acid production by Aspergillus niger is',
        [
          'An aerobic industrial process',
          'The same pathway as yeast making ethanol',
          'A photosynthetic light reaction',
          'Possible only in the absence of any oxygen',
        ],
        0,
        'The fungus oxidises sugar to citric acid in an aerated tank. Calling the tank a fermentation uses the industrial meaning of the word.',
      ),
    ],
    shorts: [
      {
        prompt: 'Compare alcoholic and lactic fermentation.',
        answer:
          'Both regenerate NAD+ so that glycolysis can continue when respiration cannot, and both net 2 ATP per glucose. In alcoholic fermentation, typical of yeast, pyruvate is split to acetaldehyde and carbon dioxide, and acetaldehyde is then reduced to ethanol. In lactic fermentation, typical of Lactobacillus and of oxygen-starved muscle, pyruvate is reduced directly to lactate and no carbon dioxide is released. The end products differ because the acceptor of the electrons from NADH differs. Neither process approaches the ATP yield of aerobic respiration.',
      },
      {
        prompt: 'Distinguish batch, fed-batch, and continuous culture.',
        answer:
          'A batch culture is charged with medium once, inoculated, and harvested at the end. The cells pass through lag, log, and stationary phase as nutrients are exhausted. A fed-batch culture receives additional nutrients during the run, so the productive phase can be extended, and nothing is removed until harvest. A continuous culture adds fresh medium and removes culture at the same rate. A chemostat uses that flow to keep the population in exponential growth. Continuous systems can produce more per day and are more easily spoiled by a contaminant. The distinguishing questions are whether feed is added later and whether culture leaves during the run.',
      },
    ],
    related: [
      { label: 'Glycolysis', hash: 'metabolism/glycolysis' },
      { label: 'Microbiology', hash: 'study/microbiology' },
      { label: 'Enzymes', hash: 'study/enzymes' },
    ],
  },
  {
    id: 'agri',
    title: 'Agricultural biotechnology',
    short: 'Crop biotech',
    kicker: 'One gene in a crop',
    level: 'HEC Agriculture Biotechnology',
    summary:
      'Breeders have always selected plants. Biotechnology can add one known gene, or it can use a DNA marker to select a gene that was already in the crop. Bt cotton is Pakistan’s commercial example. The rules are on the biosafety page. Tissue culture is the next page.',
    sections: [
      {
        heading: 'Selection, markers, and a transgene',
        paragraphs: [
          'Conventional breeding crosses two plants and keeps the offspring that look right. It is powerful and slow, and the offspring receive thousands of genes along with the one you wanted. Marker-assisted selection still uses a cross. It adds a DNA test for a sequence linked to the trait, so you can keep a seedling that carries the allele without waiting for a drought or a fungus to reveal it. The plant is not transgenic. You have only chosen faster.',
          'A transgenic crop contains a gene moved in from another organism, or an edited version of its own gene constructed in the lab. The gene arrives inside a cassette: a promoter the plant will obey, the coding sequence, and a terminator. Agrobacterium, a soil bacterium that naturally inserts DNA into plant cells, is the usual delivery system in teaching accounts. A gene gun is the other. Delivery is not expression. Without a working promoter the new DNA is silent, which is the regulation lesson applied to a field.',
        ],
      },
      {
        heading: 'Bt cotton',
        paragraphs: [
          'Bacillus thuringiensis makes Cry proteins that are toxic to particular groups of insects. The protein is produced as a crystal. In the alkaline midgut of a susceptible caterpillar it is activated, binds a specific receptor, and opens a pore. The gut contents spill and the larva dies. The human stomach is strongly acid and does not carry that insect receptor, so the same activation does not occur in people. The specificity is the scientific point. It is not a claim that a bottle of pure toxin is a food.',
          'Bt cotton carries a cry gene and makes the protein in its own tissues. The target in the original events is bollworm larvae chewing the plant. The fibre is still cellulose. The plant’s photosynthesis is still C3. What changed is that the leaf and the boll contain an insecticide the plant made. Pakistan’s National Biosafety Committee cleared early varieties at the end of the 2000s, and commercial cultivation began in 2010. Public laboratories, including CEMB at the University of the Punjab and NIBGE in Faisalabad, did part of the breeding and the molecular work.',
        ],
      },
      {
        heading: 'What goes wrong in a field',
        paragraphs: [
          'Insects evolve too. If every host plant kills susceptible larvae, the rare resistant larva has the field to itself and its alleles spread. A refuge of non-Bt plants lets susceptible insects survive and mate with resistant ones, which slows that spread. Resistance is the agronomic failure mode of Bt, and it is managed by how farmers plant, not by insisting the protein is magic.',
          'Gene flow, the movement of pollen into a related plant, is assessed crop by crop. So are effects on insects that were not the target. None of these questions is answered by the word “natural” or the word “modified”. They are answered by a trial. That is why a commercial release is a licensed event under the biosafety rules rather than the last step of a breeding notebook.',
        ],
      },
      {
        heading: 'Where this meets the rest of the course',
        paragraphs: [
          'Tissue culture regenerates a whole plant from the one cell that received the new gene, and it also multiplies a variety that is not transgenic at all. The two techniques share a sterile bench and are often confused. A micropropagated banana need not contain any foreign gene. A Bt cotton plant did pass through culture, and it does contain one.',
          'Marker-assisted selection, transgenes, and tissue culture can be used together or apart. A good answer says which one a story used. “Biotechnology improved the crop” is not yet an answer.',
        ],
      },
    ],
    definitions: [
      { term: 'Transgenic', meaning: 'An organism that contains a gene moved in from another source by laboratory methods.' },
      { term: 'Marker-assisted selection', meaning: 'Choosing offspring with a DNA test linked to a trait, without adding a foreign gene.' },
      { term: 'Cry protein', meaning: 'An insect-active protein from Bacillus thuringiensis, encoded by a cry gene.' },
      { term: 'Refuge', meaning: 'Non-Bt plants grown nearby so susceptible insects survive and resistance spreads more slowly.' },
      { term: 'Agrobacterium', meaning: 'A soil bacterium used to insert DNA into a plant cell.' },
      { term: 'Gene flow', meaning: 'Movement of alleles between populations, for crops often by pollen.' },
    ],
    worked: {
      title: 'Three farms, three methods',
      prompt: 'Farm A keeps seedlings that test positive for a rust-resistance allele already in the wheat family. Farm B grows cotton that makes a bacterial Cry protein. Farm C plants banana saplings regenerated from meristems, with no added gene. Name the method in each case.',
      steps: [
        'Farm A uses marker-assisted selection. The allele was already in the breeding pool. No gene was inserted.',
        'Farm B grows a transgenic Bt crop. The cry gene came from Bacillus thuringiensis and is expressed by the plant.',
        'Farm C uses tissue culture for micropropagation. The plants should be genetic copies of the parent. They are not, on this description, transgenic.',
        'A fourth possibility, gene editing of a wheat gene without adding a foreign coding sequence, is neither A nor B. Do not call every laboratory plant transgenic.',
      ],
      result:
        'Marker-assisted selection, a Bt transgene, and micropropagation are three different tools. Only farm B has put a gene from another species into the crop.',
    },
    pakistan: {
      title: 'Cotton in Punjab and Sindh',
      body:
        'Cotton is a major crop in Punjab and Sindh, and Bt varieties are the form of it most farmers now recognise. The National Biosafety Committee’s clearance, not a seed-shop label, is what made commercial planting legal. Unapproved seed was already in fields before 2010, which is a useful caution: a gene in a plant is not the same thing as a completed safety review. Insect resistance remains the practical threat, so a refuge and the recommended variety matter more than a repeated claim that the toxin is simply “safe” or simply “unsafe”.',
    },
    keyPoints: [
      'Marker-assisted selection speeds breeding and does not make a transgenic plant.',
      'A transgene needs a promoter the host will use, not only a coding sequence.',
      'Bt Cry proteins act in the alkaline midgut of susceptible caterpillars.',
      'Pakistan began commercial cultivation of approved Bt cotton in 2010.',
      'Refuges slow the evolution of resistant insects.',
      'Tissue culture and transgenesis are different. A cultured plant may contain no new gene.',
    ],
    quiz: [
      q(
        'Marker-assisted selection differs from making a transgenic plant because',
        [
          'It uses a DNA test to keep an allele already in the cross',
          'It always inserts a bacterial gene',
          'It cannot be used on wheat',
          'It replaces meiosis',
        ],
        0,
        'The marker is a signpost for an allele already segregating. No foreign gene is added. A transgene is an added or reconstructed sequence.',
      ),
      q(
        'Cry protein harms susceptible caterpillars because',
        [
          'It is activated in the alkaline midgut and forms a pore',
          'It blocks rubisco in the human stomach',
          'It is an antibiotic against 80S ribosomes',
          'It converts the plant from C3 to C4',
        ],
        0,
        'The alkaline insect gut activates the protein, which then needs an insect receptor. Cotton stays a C3 plant. The fibre is still cellulose.',
      ),
      q(
        'A refuge of non-Bt cotton is planted in order to',
        [
          'Slow the spread of resistance alleles in the insect',
          'Increase photorespiration',
          'Remove the need for a biosafety license',
          'Make the Cry protein in a bacterium instead',
        ],
        0,
        'Susceptible insects surviving on the refuge mate with resistant survivors from the Bt field. That dilutes resistance. It is an evolutionary management tool.',
      ),
      q(
        'Commercial release of a GM crop in Pakistan is licensed by',
        [
          'The National Biosafety Committee under the 2005 rules',
          'Any college principal',
          'The student who built the plasmid',
          'A gel photograph alone',
        ],
        0,
        'The National Biosafety Committee is the licensing body. An institutional committee and the technical committee are part of the path. A gel is not a release permit.',
      ),
    ],
    shorts: [
      {
        prompt: 'Explain how Bt cotton protects itself, and name one limit of that protection.',
        answer:
          'Bt cotton contains a cry gene from Bacillus thuringiensis and expresses a Cry protein in its tissues. When a susceptible caterpillar eats the tissue, the alkaline midgut activates the protein. The protein binds a receptor specific to those insects and forms a pore, so the gut is damaged and the larva dies. People do not activate the protein in the same way. The protection is limited by evolution: insects with rare resistance alleles can survive and, if they are the only survivors, resistance spreads. Refuges of non-Bt plants are grown to slow that spread. The plant is also still subject to pests the Cry protein does not affect.',
      },
      {
        prompt: 'Distinguish a transgenic crop from a variety produced by marker-assisted selection.',
        answer:
          'A transgenic crop carries a gene construct introduced in the laboratory, often from another species, with a promoter that drives it in the plant. Bt cotton is the local example. Marker-assisted selection does not add such a construct. Breeders make an ordinary cross and use a DNA marker linked to a desired allele to decide which offspring to keep. The allele was already in the species. The methods can later be combined, but they answer different questions and they are not regulated as the same act. Only the transgenic route introduces a new coding sequence.',
      },
    ],
    related: [
      { label: 'Biosafety', hash: 'study/biosafety' },
      { label: 'Tissue culture', hash: 'study/tissue' },
      { label: 'Gene control', hash: 'study/regulation' },
    ],
  },
  {
    id: 'tissue',
    title: 'Plant tissue culture',
    short: 'Tissue culture',
    kicker: 'A whole plant from a piece',
    level: 'FSc biotechnology and BS Agriculture Biotechnology',
    summary:
      'Many plant cells are totipotent: one living cell can regenerate a plant. Culture gives that cell a sterile medium and a hormone balance. The method multiplies varieties, cleans some of them of virus, and also regenerates a cell after a new gene has been added.',
    sections: [
      {
        heading: 'Totipotency',
        paragraphs: [
          'Animal development usually closes doors. A muscle cell does not become a whole animal. Plant development leaves more doors open. Totipotency is the ability of a differentiated plant cell to dedifferentiate, divide, and rebuild every organ of a plant, including the flowers that will make the next generation. Haberlandt stated the idea. Later, whole carrot plants were grown from isolated cells. The exam sentence is the definition plus one consequence: you can copy a prized plant without seed.',
          'An explant is the piece you start with: a node, a meristem, a piece of leaf, or an embryo. It is placed on a sterile medium. The cells that divide can form a callus, an unorganised lump, or they can form organs directly. Which path you get is mostly hormones and the explant you chose, not luck.',
        ],
      },
      {
        heading: 'The medium',
        paragraphs: [
          'The classical medium is Murashige and Skoog, published in 1962. It supplies mineral salts, a carbon source such as sucrose, vitamins, and a gelling agent if the culture is solid. The plant is photosynthetic in real life and often is not, usefully, inside a closed jar, so the sugar is its food. The medium is sterile. A single bacterial cell will outgrow the explant and the culture is lost. Surface-cleaning the explant is therefore part of the idea. The concentrations and the timing are a supervised practical, not a list this page will turn into a recipe.',
          'Two hormone classes do most of the steering. Auxins, such as NAA or 2,4-D in laboratory media, tend to promote cell division and roots. Cytokinins, such as BAP, tend to promote shoots. Skoog and Miller showed that the ratio, not a single hormone, decides the outcome. More cytokinin relative to auxin favours shoots. More auxin relative to cytokinin favours roots. A balance favours callus. You adjust the ratio when you want the next step.',
        ],
      },
      {
        heading: 'From callus to a pot',
        paragraphs: [
          'A callus can be split onto fresh medium and grown again. That maintains the line. To make a plant, the callus or the explant is moved to a shoot-favouring medium, shoots are separated, and those shoots are moved to a root-favouring medium. A rooted plantlet is hardened off: moved gradually from the wet, sterile jar into ordinary air and soil. Skipping that step kills plants that have never had to control their own water loss.',
          'Micropropagation is this process used to make many uniform plants from one parent. It is how a single elite plant fills a nursery. Meristem-tip culture uses only the smallest dome of the shoot tip, which often contains little virus even when the rest of the plant is infected. The plant that grows is not guaranteed virus-free. It is often cleaner, and it is then tested. Somaclonal variation is the unwanted companion: culture itself causes mutations, so plants from a long callus phase are not always faithful copies. For a uniform crop that variation is a defect. For a breeder hunting a new trait it is sometimes a source.',
        ],
      },
      {
        heading: 'What it is not',
        paragraphs: [
          'Tissue culture does not, by itself, add a gene. It is also the step that regenerates a plant after someone has added one, which is why the two ideas live in the same laboratory. Read the question. “Explain micropropagation” does not require Bacillus thuringiensis. “How was the transgenic plant recovered?” does require the culture step.',
          'The method is slow, it needs sterile conditions, and the plants can be expensive compared with seed. It earns its cost when seed does not breed true, when the parent is a rare elite, or when virus has made ordinary cuttings worthless. Banana, potato, sugarcane, and date palm are the crops where that bargain is often worth making.',
        ],
      },
    ],
    definitions: [
      { term: 'Totipotency', meaning: 'The capacity of one plant cell to regenerate a whole plant.' },
      { term: 'Explant', meaning: 'The piece of plant placed into culture.' },
      { term: 'Callus', meaning: 'An unorganised mass of dividing cells grown on a medium.' },
      { term: 'Micropropagation', meaning: 'Making many plants from one parent by sterile culture.' },
      { term: 'Somaclonal variation', meaning: 'Genetic differences that appear among plants regenerated from culture.' },
      { term: 'Hardening', meaning: 'Gradually adapting a plantlet from sterile humid culture to ordinary air.' },
    ],
    worked: {
      title: 'Choose the ratio',
      prompt: 'A callus of sugarcane is growing on a balanced medium. The goal is a rooted plant in a pot. Which hormone change comes first, which comes second, and what is the last non-sterile step?',
      steps: [
        'Move tissue to a medium with a higher cytokinin-to-auxin ratio so shoots form.',
        'Separate a shoot and move it to a medium with a higher auxin-to-cytokinin ratio so roots form.',
        'Do not try to root a callus that has no shoot, and do not skip straight to soil from an unrooted callus.',
        'Harden the rooted plantlet by easing it out of saturated air before it is expected to live in a pot. Then it is a plant, not a culture.',
      ],
      result:
        'Shoots first, by raising cytokinin relative to auxin. Roots second, by raising auxin. Hardening last. The balanced medium that made the callus is not the medium that finishes the plant.',
    },
    pakistan: {
      title: 'Banana, potato, sugarcane, date palm',
      body:
        'Agricultural laboratories in Pakistan use tissue culture for banana, potato, sugarcane, and date palm. Banana and potato are propagated this way because virus builds up in ordinary cuttings and tubers, and a meristem culture plus a virus test gives the nursery cleaner stock. Sugarcane is slow from seed and is normally grown from setts, so a lab can multiply a new variety faster than a field can. Date palm is slow and valuable, which is the other reason to clone a known tree. None of these examples requires the plant to be transgenic.',
    },
    keyPoints: [
      'Totipotency lets one plant cell rebuild a plant. An explant is the starting piece.',
      'Murashige and Skoog medium supplies salts, sugar, and vitamins. Hormones steer development.',
      'High cytokinin favours shoots. High auxin favours roots. A balance favours callus.',
      'Micropropagation copies a parent. Meristem culture is used to escape virus.',
      'Somaclonal variation means culture can change the genotype.',
      'Culture does not equal a transgene. It is also how a transgenic cell becomes a plant.',
    ],
    quiz: [
      q(
        'Totipotency means a plant cell can',
        [
          'Regenerate an entire plant',
          'Only become a xylem vessel',
          'Fix nitrogen like Rhizobium',
          'Survive without any medium',
        ],
        0,
        'A totipotent cell can dedifferentiate and produce every organ of the plant. That is the basis of regenerating a plant from an explant or a callus.',
      ),
      q(
        'To encourage shoots, the medium should have',
        [
          'A higher cytokinin-to-auxin ratio',
          'No hormones and no sugar',
          'Only auxin, at a high level, with no cytokinin ever',
          'A bacterial cry gene',
        ],
        0,
        'Skoog and Miller’s ratio is the rule. Cytokinin favours shoots. Auxin favours roots. A cry gene is a Bt trait, not a hormone.',
      ),
      q(
        'Somaclonal variation is',
        [
          'Genetic change arising during culture',
          'The intended Cry protein',
          'A type of meiosis in the jar',
          'Proof that the plant is virus-free',
        ],
        0,
        'Plants regenerated after a callus phase can carry new mutations. That can spoil uniformity or, occasionally, provide a new trait. It is not a virus test.',
      ),
      q(
        'Meristem-tip culture is used mainly to',
        [
          'Recover plants with a lower virus load',
          'Insert a plasmid into cotton',
          'Replace the Calvin cycle',
          'Produce ethanol',
        ],
        0,
        'The shoot tip is often ahead of a systemic virus. Plants grown from it are then tested. The method is not, by itself, genetic engineering.',
      ),
    ],
    shorts: [
      {
        prompt: 'Define totipotency and describe how an explant becomes a rooted plant.',
        answer:
          'Totipotency is the ability of a single plant cell to regenerate a whole plant. An explant, a small sterile piece of the parent, is placed on Murashige and Skoog medium containing sugar, salts, vitamins, and plant hormones. A balanced auxin-to-cytokinin ratio produces a callus. Raising the cytokinin relative to auxin induces shoots. A separated shoot is moved to a medium richer in auxin to form roots. The rooted plantlet is hardened by gradual exposure to lower humidity and then moved to soil. Throughout the culture the medium is sterile so microbes do not overgrow the plant tissue.',
      },
      {
        prompt: 'Why is somaclonal variation both a problem and, sometimes, a tool?',
        answer:
          'Cells dividing for a long time as callus accumulate mutations and chromosomal changes, so the plants regenerated from them are not always identical to the parent. For micropropagation of a known variety that is a problem, because the buyer wanted a copy and may receive something weaker. For a breeder, the same variation can produce a new trait without a deliberate cross. The practical response is to keep the callus phase short when uniformity matters, and to screen regenerated plants before they are multiplied. Variation is a consequence of the method, not evidence that a foreign gene was added.',
      },
    ],
    related: [
      { label: 'Crop biotechnology', hash: 'study/agri' },
      { label: 'The cell', hash: 'study/cell' },
      { label: 'Biosafety', hash: 'study/biosafety' },
    ],
  },
  {
    id: 'health',
    title: 'Health biotechnology',
    short: 'Health biotech',
    kicker: 'Tests and medicines',
    level: 'HEC Health Biotechnology',
    summary:
      'Biotechnology enters medicine as a test, as a molecule made by cells, or as a careful attempt to add a working gene to somatic cells. ELISA, recombinant hepatitis B vaccine, monoclonal antibodies, and the limits of gene therapy are the core. The CRISPR tab is a study tool for guides, not a treatment.',
    sections: [
      {
        heading: 'A test has to be read',
        paragraphs: [
          'A diagnostic test asks whether a particular molecule is present. PCR asks about a nucleic acid. The PCR page covers that, including why a band without controls is not a diagnosis. ELISA asks about a protein, usually an antigen from a pathogen or an antibody the patient has made. The letters stand for enzyme-linked immunosorbent assay.',
          'In a sandwich ELISA, a capture antibody is stuck to the plastic well. The sample is added. If the antigen is present it binds. A second antibody, which recognises another part of the same antigen and carries an enzyme, is added next. After washing, only the second antibody that found antigen remains. The enzyme’s substrate then turns coloured. Colour means captured antigen. No colour means none was detected, within the sensitivity of that kit. The test is compared with a positive control and a blank. Intensity can be read so the result is quantitative. A coloured well is still not a full clinical picture.',
        ],
      },
      {
        heading: 'Medicines made by cells',
        paragraphs: [
          'Before recombinant DNA, insulin for diabetes was extracted from animal pancreases. It worked, and it was scarce and slightly different from human insulin. Recombinant production puts the human coding sequence into a host. Early processes made the A and B chains in bacteria and joined them. The product matches human insulin. Yeast and other hosts are used for proteins that bacteria fold badly. The cloning page is the strategy behind that sentence.',
          'The hepatitis B vaccine used in childhood programmes is a recombinant subunit vaccine. Yeast cells make the viral surface antigen, HBsAg. The purified protein is the vaccine. No hepatitis virus is grown to make it. That is the cleanest local example of a medicine that is both a vaccine, on the immunology page, and a biotechnology product. Monoclonal antibodies are the other large class: one binding specificity, made in quantity, used as a drug or as the capture reagent in a test.',
        ],
      },
      {
        heading: 'One clone of antibody',
        paragraphs: [
          'If you inject a protein into an animal, the serum that comes back contains many antibodies against many epitopes. That mixture is polyclonal. A monoclonal antibody comes from one B-cell clone and binds one epitope. Köhler and Milstein made that possible in 1975 by fusing a B cell that had the specificity they wanted with a myeloma cell that could divide forever in culture. The hybrid cell, a hybridoma, has both properties. The culture fluid contains one antibody.',
          'Monoclonal antibodies are the reason a modern ELISA can be specific, and they are drugs in their own right when the target is a cytokine or a receptor on a tumour cell. Making one still starts with an immune response and a screen. It is not a matter of writing the epitope on a bottle. The health of the patient, the cost, and the cold storage are part of whether the drug is actually available.',
        ],
      },
      {
        heading: 'Gene therapy, stated carefully',
        paragraphs: [
          'Some diseases are caused by a single non-working gene. Somatic gene therapy tries to give the relevant body cells a working copy. The copy is often carried in a viral vector that has been altered so it delivers DNA and does not cause the original viral disease. If the cells that are treated are not the germline, the patient’s children do not inherit the change. That limit is also an ethical line, discussed on the biosafety page.',
          'The difficulties are practical. The vector can trigger immunity. The DNA can land in the wrong place and disturb another gene. The new gene may not stay on for life, so the effect fades. A few inherited immunodeficiencies and some eye and blood disorders have real licensed treatments. Most diseases do not. An unapproved injection offered as a “stem-cell cure” is not one of those treatments. Stem cells and induced pluripotent cells, on the cell page, are a research route to replacing tissue. They are not a general medicine you can infer from the word.',
        ],
      },
      {
        heading: 'What this site will not pretend',
        paragraphs: [
          'The CRISPR tab finds SpCas9 sites and flags simple sequence problems so a student can see what a guide is. It does not score off-target cuts in a genome, and it is not a protocol for editing a person or a pathogen. Gene therapy is a medical act under a regulator. Reading about it is not practising it.',
          'Access is the last scientific fact. A recombinant vaccine that never reaches a clinic has not, in any sense that matters, prevented a disease. Health biotechnology is judged by tests that are true and treatments that arrive, not by the elegance of the construct.',
        ],
      },
    ],
    definitions: [
      { term: 'ELISA', meaning: 'A plate assay in which an enzyme-linked antibody produces a colour if the target was captured.' },
      { term: 'Sandwich ELISA', meaning: 'An ELISA that traps antigen between a capture antibody and a second, enzyme-linked antibody.' },
      { term: 'Monoclonal antibody', meaning: 'Antibody of one specificity, secreted by one hybridoma clone.' },
      { term: 'Hybridoma', meaning: 'A fused cell that combines an antibody-making B cell with a myeloma cell that divides in culture.' },
      { term: 'Subunit vaccine', meaning: 'A vaccine made from one purified antigen, not from the whole pathogen.' },
      { term: 'Somatic gene therapy', meaning: 'Addition of a working gene to body cells, not to the germline.' },
    ],
    worked: {
      title: 'Read two ELISA wells',
      prompt: 'A sandwich ELISA for a viral antigen includes a blank well, a positive control, and a patient well. The blank is colourless, the positive control is strongly coloured, and the patient well is colourless. What can you say?',
      steps: [
        'The blank shows that colour does not appear from the reagents alone. That control worked.',
        'The positive control shows that capture antibody, detection antibody, and the enzyme reaction can produce colour when antigen is present. The kit worked on the day.',
        'The colourless patient well means antigen was not detected in that sample, down to the sensitivity of the assay. It does not prove the person was never infected. Antibody tests, timing, and a second sample answer different questions.',
        'If the positive control had also been colourless, you could say nothing about the patient. A failed kit looks the same as a negative sample unless the control is there.',
      ],
      result:
        'Report “not detected”, and only because the controls behaved. Do not report “healthy”. A nucleic-acid test such as PCR asks a different question and can disagree, especially very early or very late in an infection.',
    },
    pakistan: {
      title: 'Hepatitis B vaccine and thalassemia counseling',
      body:
        'Hepatitis B is part of the Expanded Programme on Immunization, and the vaccine antigen is recombinant HBsAg made in yeast. That is health biotechnology already present in a Pakistani clinic, not a future promise. The other local meeting point is inherited disease. Families considering marriage use carrier tests for beta-thalassemia, and a positive result is information about both partners. The biology of the cross is on the inheritance page. The duty to explain it, and to keep it private, is the ethics page. A test without that conversation is only a coloured well.',
    },
    keyPoints: [
      'A sandwich ELISA traps antigen between two antibodies and reports it as enzyme colour.',
      'Controls decide whether a colourless well means “negative” or “the kit failed”.',
      'Recombinant insulin matches the human sequence. Recombinant HBsAg is a subunit vaccine.',
      'A hybridoma makes one monoclonal antibody. Polyclonal serum makes many.',
      'Somatic gene therapy is not inherited. Vectors can land badly or provoke immunity.',
      'The CRISPR tab studies guide sites. It is not a therapy and not a protocol.',
    ],
    quiz: [
      q(
        'In a sandwich ELISA, colour appears because',
        [
          'An enzyme on the detection antibody reacts after antigen was captured',
          'The antigen itself is always coloured',
          'DNA moves to the anode',
          'The well contains a Cry protein by default',
        ],
        0,
        'Antigen is trapped by the capture antibody. The second antibody brings an enzyme. The enzyme’s product is the colour. No captured antigen, no enzyme, no colour.',
      ),
      q(
        'The hepatitis B vaccine antigen used in immunisation programmes is',
        [
          'HBsAg protein made in recombinant yeast',
          'A living hepatitis virus',
          'Human insulin',
          'An antibiotic from Penicillium',
        ],
        0,
        'It is a subunit vaccine. Yeast makes the surface protein. The whole virus is not grown to produce the standard recombinant vaccine.',
      ),
      q(
        'A hybridoma is',
        [
          'A B cell fused with a myeloma cell so one antibody can be made in culture',
          'A plant callus',
          'A bacterial plasmid with no origin',
          'A thymine dimer',
        ],
        0,
        'Köhler and Milstein fused an antibody-producing cell with a myeloma cell. The hybrid divides and secretes one specificity: a monoclonal antibody.',
      ),
      q(
        'Somatic gene therapy aims to',
        [
          'Add a working gene to body cells without changing the germline',
          'Edit every descendant of the patient',
          'Replace vaccination in the childhood programme',
          'Prove that ELISA is unnecessary',
        ],
        0,
        'The intended change stops with the patient. Germline editing would be inherited and is a different, much more restricted act. Most diseases have no gene therapy.',
      ),
    ],
    shorts: [
      {
        prompt: 'Describe a sandwich ELISA and the controls you need before you trust a negative well.',
        answer:
          'A capture antibody is bound to the well. Sample is added, and any matching antigen binds and is kept when the well is washed. A second antibody, linked to an enzyme and aimed at a different site on the same antigen, is added and also washed. Substrate is then added. Colour develops only if the enzyme, and therefore the antigen, remained. A blank well with no sample must stay colourless, or the reagents are producing colour on their own. A positive control must turn coloured, or the kit cannot detect antigen on that day. Only when both controls behave can a colourless patient well be reported as not detected. The result is about the sample, not the person’s whole health.',
      },
      {
        prompt: 'Why is recombinant hepatitis B vaccine described as a subunit vaccine?',
        answer:
          'A subunit vaccine contains one component of the pathogen, not the pathogen itself. For hepatitis B that component is the surface antigen HBsAg. The gene is expressed in yeast, the protein is purified, and the protein is what is injected. No virus replicates in the vaccinated person, and no virus is cultured to manufacture the antigen. The immune system still sees the relevant antigen and can form memory, which is the requirement explained on the immunity page. The same recombinant logic produced human insulin, which is a hormone rather than a vaccine, by placing a human coding sequence in a microbial host.',
      },
    ],
    related: [
      { label: 'Immunity', hash: 'study/immunology' },
      { label: 'PCR', hash: 'study/pcr' },
      { label: 'CRISPR bench', hash: 'crispr' },
    ],
  },
];
