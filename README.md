# GeneLab

**DNA, enzymes, and metabolism — worked through on one bench.**

A static classroom bench for FSc (higher secondary) and early university biotechnology. DNA, scores, and study rooms stay in the browser. The page has no server, no account, and no API key.

**Live site:** [https://taha080.github.io/genelab-student/](https://taha080.github.io/genelab-student/)

Created by [Taha Ahsan](https://www.linkedin.com/in/taha-ahsan-832475270/), a computer science graduate in Lahore, Pakistan. [GitHub](https://github.com/taha080)

The calculations and diagrams are classroom models. They are for learning. They are not a clinical design or a laboratory protocol. Every sample sequence in the app is synthetic. None of them is a natural gene or a pathogen sequence.

GitHub Actions publishes the site from `main`. A push to that branch builds the app and uploads `dist/` to GitHub Pages at the address above.

![Central dogma explorer](docs/central-dogma.png)

## What it is

GeneLab is a single-page study bench. A student pastes DNA or opens a lesson, and the browser does the calculation on that computer. Beside the sequence tools are biochemistry and metabolism lessons, eighteen syllabus notes, a thirty-question quiz, five short games, and a peer-to-peer study room.

The header calls the app a student bench. The footer states the same limit the science uses: estimates are for teaching, not for a clinical design.

## Features

Tabs along the top switch tools. The address hash opens a tool directly. With no hash, the page opens on Central dogma.

### Tools

- **Progress.** Remembers which tools you have opened, quiz scores, the best quiz score, metabolism and study checks, game high scores, and completion badges. Everything is stored in `localStorage` on this browser. Reset asks once, then asks you to confirm.
- **Central dogma.** Paste a coding or template strand, or generate an open reading frame of 8, 16, or 32 amino acids. The page builds the paired strand, the mRNA (T written as U), and the amino acids. It reports GC content, six reading frames, and the open reading frame, and it can play, pause, and step through codons. Only the first 3,000 bases are used.
- **CRISPR.** Lists SpCas9 `NGG` sites on both strands of the pasted DNA, the 20 nucleotides on the 5′ side of each PAM, GC content, and simple sequence flags (GC, runs of the same base, and `TTTT`). You can filter by strand. The list covers the sequence you paste. It does not search a genome for the same 20 bases, and it is not a laboratory protocol. Only the first 3,000 bases are used.
- **Primers.** Estimates melting temperature with the Wallace rule and with the SantaLucia 1998 nearest-neighbor table. Also shows GC, length, the GC clamp, 3′ self-complementarity, a simple hairpin check, and how far apart a pair sits. Sodium and primer concentration are editable. The defaults are 50 mM Na⁺ and 250 nM oligo. Magnesium is not in the model, so a real PCR buffer can differ by a few degrees.
- **Mutations.** Applies a substitution, insertion, or deletion and classifies the protein change as silent, missense, nonsense, stop-loss, frameshift, or an in-frame indel. Positions count A, C, G, and T only.
- **Codon table.** The standard genetic code, NCBI translation table 1, drawn as a 4×4×4 grid. Search by codon (`ATG` or `AUG`) or by amino acid (Phe, F, or phenylalanine). Start and stop are marked. Click a codon to highlight every codon for that amino acid.
- **Animation.** A schematic double helix (about 10.5 base pairs per turn), transcription, and translation of a short synthetic open reading frame, plus a replication fork and a ribosome with tRNAs and a growing peptide. Play, pause, and step. When the browser requests reduced motion, Play stays off and Step still moves one base or one codon.
- **Sequences.** Paste DNA or FASTA. The page reverse-complements a record, counts bases, finds classroom restriction sites, lists open reading frames on all six frames, and aligns two sequences with a short global alignment. An ORF here is an ATG followed, in frame, by a stop. Alignment stops at 500 bases on each sequence. The enzymes are EcoRI, BamHI, HindIII, NotI, XhoI, SalI, EcoRV, SmaI, PstI, KpnI, SacI, NdeI, NcoI, XbaI, SpeI, and BglII.
- **Biochemistry.** Three sections: Basics, Krebs cycle, and Gluconeogenesis. Basics covers the 20 amino acids (filterable by side-chain group), an interactive Michaelis–Menten plot with a Lineweaver–Burk view, and short overviews of proteins, nucleic acids, polysaccharides, and lipids. The Krebs section walks all eight steps of the citric acid cycle and can play, pause, and step. Gluconeogenesis walks the route from pyruvate back to glucose, can show only the four bypass enzymes, and includes the Cori cycle.
- **Metabolism.** Six lessons, each with a step-through and a quiz of at least four questions. Scores are saved on the progress dashboard.
  - Introduction to metabolism (a pathway map)
  - Phosphoryl group transfer and ATP
  - Glycolysis (ten steps, investment and payoff)
  - Glycogenolysis (liver and muscle)
  - Pentose phosphate pathway
  - Oxidative phosphorylation

  The map also opens the citric acid cycle and gluconeogenesis, which live on the Biochemistry tab. Glycolysis, glycogen breakdown, the citric acid cycle, electron transport, and ATP synthase have play, pause, speed (0.5×, 1×, and 2×), and step. Reduced motion keeps those scenes on Step.
- **Study.** Eighteen syllabus notes for chapters the tools do not already teach. Described in the next section.
- **Games.** Five games that use the same science as the bench. High scores stay with the other progress, and badges unlock from finished rounds.
  - Codon rush: 45 seconds on the standard code. A correct codon is 10 points, a streak adds a small bonus, and a miss costs 2.
  - Base pairs: DNA A–T, DNA G–C, RNA A–U, and RNA G–C. A DNA adenine is not treated as a match for uracil.
  - Krebs order: the eight cycle enzymes, starting at citrate synthase.
  - Enzymes: citrate synthase, isocitrate dehydrogenase, succinyl-CoA synthetase, succinate dehydrogenase, pyruvate carboxylase, and fructose-1,6-bisphosphatase.
  - Mutations: name the effect with the same rules as the mutation tool.
- **Study room.** Three ways to study together, with no account.
  - **Live room.** One tap creates a four-character room code. Share the code, an invite link, or a QR code drawn in the browser. The invite asks only for a name. A saved name is reused. A first visit gets a fun default you can change. Joining by code is case-insensitive, and a dropped guest can retry. The race is eight questions, each open for 20 seconds. A correct answer is worth 60 points, plus up to 40 for a fast reply (100 at the instant the question opens, 60 after 10 seconds). A miss scores 0. Text chat shows names, colors, times, emoji reactions, and join, leave, and rename notes. A message is limited to 200 characters. Tap your name to change it. The new name is saved on this device and updates the participant list, voice labels, and later chat lines. Voice is optional and uses the same peers. The microphone stays off until you tap Join voice. Up to six people can be in voice, with mute, a per-person volume, and a speaking indicator. If the microphone is blocked, or voice is full, the quiz continues.
  - **Pass and play.** Two to six people on one device. Each person gets different questions, so the total is not a shared challenge.
  - **Challenge link.** Encodes a quiz seed and a score, and replays one shuffled list.
- **Quiz.** Thirty questions on the same ideas as the tools, including amino acids, the citric acid cycle, and gluconeogenesis. An explanation appears as soon as you answer. The score is saved on the progress dashboard.

Lesson figures are labelled diagrams drawn as inline SVG. Captions are numbered Figure 1, Figure 2, and so on for that page. Tap a figure to enlarge it. The drawings use the page colors, so they stay readable in light and dark mode, and they work offline.

![Amino acids and the start of the kinetics bench](docs/amino-acids.png)

![Citric acid cycle at α-ketoglutarate dehydrogenase: 1 NADH and 1 CO₂](docs/krebs-cycle.png)

![Gluconeogenesis, with the four bypass enzymes marked](docs/gluconeogenesis.png)

### Study topics

The Study tab holds notes for FSc and BS biotechnology topics the other tools do not already cover. Each page has sections, key definitions, a labelled figure, a worked example, a Pakistan example, key points, four multiple-choice questions, and short questions with model answers. The quiz score is stored with the other progress. The page cites the National Curriculum of Pakistan 2022-23 (Biology, grades 9–12), FBISE assessment materials, the HEC BS Biotechnology curriculum 2024, and the Pakistan Biosafety Clearing-House (Biosafety Rules, 2005).

| Topic | Hash |
| --- | --- |
| Biomolecules | `#study/biomolecules` |
| Enzymes | `#study/enzymes` |
| The cell | `#study/cell` |
| Photosynthesis | `#study/photosynthesis` |
| Inheritance | `#study/inheritance` |
| Evolution | `#study/evolution` |
| Microbiology | `#study/microbiology` |
| Immunity | `#study/immunology` |
| Gene regulation and repair | `#study/regulation` |
| PCR | `#study/pcr` |
| Gel electrophoresis | `#study/electrophoresis` |
| Recombinant DNA and cloning | `#study/cloning` |
| Bioinformatics | `#study/bioinformatics` |
| Biosafety and bioethics | `#study/biosafety` |
| Fermentation and industrial biotechnology | `#study/fermentation` |
| Agricultural biotechnology | `#study/agri` |
| Plant tissue culture | `#study/tissue` |
| Health biotechnology | `#study/health` |

`#study` opens Biomolecules.

## How it works

GeneLab is a static site. [Vite](https://vite.dev/) bundles TypeScript into the `dist/` folder. There is no application server and no database.

- `index.html` loads `src/main.ts`, which draws the shell and mounts one tab at a time.
- The science and the scoring live in `src/lib/`. The screens in `src/ui/` render those results into the page. There is no UI framework.
- The URL hash selects the tab. Longer hashes open a biochemistry section, a metabolism lesson (`#metabolism/glycolysis`), a study topic, a room invite (`#party/` plus the code), or a challenge (`#challenge/` plus an encoded seed and score).
- Sequence cleaning keeps A, C, G, T, and U. U is stored as T. FASTA title lines, whitespace, and digits are dropped. Any other character is skipped and counted. Nothing you paste is uploaded.
- Progress is JSON under the key `genelab-progress`. The theme is `genelab-theme` (`light` or `dark`; otherwise the page follows the system preference). A study-room name is `genelab-nickname`. If the browser blocks storage, the tool still opens.
- Diagrams and animations are inline SVG. The animated scenes are a custom element, `gene-cinema`, with play, pause, 0.5×, 1×, 2×, and step. When `prefers-reduced-motion: reduce` matches, Play is disabled and Step still works.
- The live study room uses [PeerJS](https://github.com/peers/peerjs). `new Peer()` uses the public PeerJS broker, which only introduces the browsers. The room itself is WebRTC between those browsers, and this site stores no room. There is no API key in the repository. QR codes are drawn in the page with the `uqr` package.
- Figtree, Newsreader, and IBM Plex Mono are bundled with `@fontsource`, so the built site does not request those fonts from another host.
- `vite.config.ts` sets `base` to `./`, so the built files load under the GitHub Pages path `/genelab-student/`.

These are the classroom models the code and the tests lock in.

- **Genetic code.** NCBI standard code, table 1. `ATG` is the start taught here. Stops are `TAA`, `TAG`, and `TGA`. Mitochondrial codes differ, and some bacteria use extra starts. The app does not mark those.
- **Strands.** A coding strand written 5′→3′ matches the mRNA, with T written as U. The template drawn underneath is the complement, so it reads 3′→5′ left to right. Reverse complement is the other strand written 5′→3′.
- **Wallace.** `Tm = 2(A+T) + 4(G+C)`.
- **Nearest neighbor.** SantaLucia 1998, PNAS 95:1460, Table 2, including initiation and the symmetry correction. Salt enters as `0.368 × (N−1) × ln([Na+])`.
- **SpCas9.** The guide is the 20 nucleotides immediately 5′ of `NGG` on the strand that carries the PAM. The flags are sequence warnings. They are not an efficiency score.
- **Michaelis–Menten.** `v = Vmax[S] / (Km + [S])`. At `[S] = Km`, `v` is half of `Vmax`. On the Lineweaver–Burk plot the y-intercept is `1/Vmax` and the x-intercept is `−1/Km`.
- **Citric acid cycle.** Per acetyl-CoA: 3 NADH (isocitrate dehydrogenase, α-ketoglutarate dehydrogenase, malate dehydrogenase), 1 enzyme-bound FAD counted as FADH₂ (succinate dehydrogenase, Complex II), 1 GTP (succinyl-CoA synthetase), and 2 CO₂. Pyruvate dehydrogenase is the entry step and makes another NADH. It is not one of the eight cycle steps.
- **Gluconeogenesis.** Two pyruvate to one glucose costs 4 ATP + 2 GTP + 2 NADH. The four bypasses are pyruvate carboxylase, PEPCK, fructose-1,6-bisphosphatase, and glucose-6-phosphatase.
- **Cori cycle.** Muscle nets 2 ATP turning glucose into two lactate. Liver spends 6 NTP (4 ATP + 2 GTP) to return one glucose. The organism’s net cost is 4 NTP.
- **Alignment.** Needleman–Wunsch global alignment with a linear gap penalty. The teaching scores are match 1, mismatch −1, and gap −1. Ties prefer a diagonal step, then a gap in the second sequence, then a gap in the first. This is a classroom alignment, not a database search.

## Setup and run locally

You need Node.js and npm. The GitHub Actions workflow uses Node.js 22.

```bash
npm install
npm test
npm run dev
```

`npm run dev` starts the Vite development server and prints a local URL.

`npm run build` typechecks with `tsc --noEmit` and writes the static site to `dist/`. `npm run preview` serves that folder.

## Usage

1. Open the [live site](https://taha080.github.io/genelab-student/) or the local development server.
2. Choose a tab, or set the hash. Examples: `#primers`, `#metabolism/glycolysis`, `#study/pcr`, `#quiz`.
3. On a sequence tool, paste DNA or FASTA, or press a sample button. The result updates as you type.
4. Use **Dark mode** or **Light mode** in the header. The choice is remembered in this browser.
5. Open **Progress** for tools you have opened, badges, recent quiz scores, lesson checks, and game high scores. **Reset progress**, then **Confirm reset**, clears that store on this browser.
6. For a group, open **Study room**. Create a live room and share the code, link, or QR code. If the network is unavailable, use **Pass and play** or a **Challenge link**.

## Project structure

```text
index.html                  page shell and the theme applied before first paint
package.json                scripts and dependencies
vite.config.ts              Vite build and Vitest settings
tsconfig.json               strict TypeScript (ES2022, no emit)
public/favicon.svg
src/main.ts                 shell, tabs, hash routing, light and dark theme
src/styles.css
src/ui/                     one mount function per tab, plus figures, cinema, and voice
src/lib/                    genetic code, primers, CRISPR, metabolism, study notes, games, progress
src/lib/studyPart1.ts       Biomolecules through Evolution
src/lib/studyPart2.ts       Microbiology through Cloning
src/lib/studyPart3.ts       Bioinformatics through Health biotechnology
tests/                      Vitest files (*.test.ts)
docs/                       screenshots linked above
.github/workflows/ci.yml    test, build, and GitHub Pages deploy
```

Runtime dependencies are `peerjs`, `uqr`, and the three `@fontsource` packages. TypeScript, Vite, and Vitest are development dependencies.

## Tests

```bash
npm test
```

That runs Vitest once (`vitest run`) in Node, matching `tests/**/*.test.ts`. The suite covers the genetic code, codon table, CRISPR guides, primer melting temperatures, mutations, sequence tools, biochemistry, metabolism, study pages, figures, motion scripts, games, the quiz, progress, study-room rules, chat, and voice rules. The tests do not open a browser.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` on pull requests and on pushes to `main`. A push to `main` that passes those steps uploads `dist/` and deploys it with GitHub Pages. In the repository settings, Pages needs **GitHub Actions** as the source.

## License

This repository has no `LICENSE` file, and `package.json` does not declare a license. All rights stay with the author until a license is added. Do not treat the project as open source.
