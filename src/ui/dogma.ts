import { analyzeFrame, randomOrf, type CodonView, type FrameAnalysis, type FrameId } from '../lib/codon';
import { CLASSROOM_GENE, SHORT_ORF } from '../lib/samples';
import { baseCounts, cleanDna, dnaToRna, gcContent, reverseComplement } from '../lib/sequence';
import { DIAGRAMS } from '../lib/diagrams';
import { mountCinema } from './cinema';
import { bases, cleanMessage, copyButton, el, formatPercent, sequenceField, stat } from './dom';
import { mountFigures } from './figure';

const FRAMES: FrameId[] = [1, 2, 3, -1, -2, -3];
const MAX = 3000;

function orfSentence(analysis: FrameAnalysis): string {
  const { orf } = analysis;
  if (orf.startCodon === null) {
    return 'This frame has no ATG start codon. The letters below are what this grouping would encode if a ribosome started at the first codon.';
  }
  const early = orf.stopBeforeStart
    ? 'A stop codon sits ahead of the first ATG, so it is not the end of this open reading frame. '
    : '';
  if (orf.stopCodon === null || orf.aminoAcids === null) {
    return `${early}The first ATG is codon ${orf.startCodon}. No in-frame stop appears before the sequence ends.`;
  }
  return `${early}The first ATG is codon ${orf.startCodon}. The in-frame stop is codon ${orf.stopCodon}. That open reading frame is ${orf.aminoAcids} amino acids, counting methionine and not counting the stop.`;
}

function codonLabel(codon: CodonView, total: number): string {
  if (codon.incomplete) {
    const word = codon.dna.length === 1 ? 'One base is' : 'Two bases are';
    return `${word} left over (${codon.dna}). That is not a full codon.`;
  }
  const place = `Codon ${codon.index + 1} of ${total}`;
  if (codon.isStop) return `${place}. ${codon.dna} becomes ${codon.mrna}, a stop. A ribosome would end the protein here.`;
  if (codon.isStart && codon.index === 0) {
    return `${place}. ${codon.dna} becomes ${codon.mrna}, methionine. ATG is the start codon in this code.`;
  }
  if (codon.isStart) return `${place}. ${codon.dna} becomes ${codon.mrna}, methionine. This ATG could also be a start.`;
  return `${place}. ${codon.dna} becomes ${codon.mrna}, ${codon.name} (${codon.short}, ${codon.aa}).`;
}

export function mountDogma(root: HTMLElement): () => void {
  const explain = el(
    'p',
    'explain',
    'Paste a coding strand, written 5′ to 3′. GeneLab builds the base-paired template, the mRNA (T becomes U), and the amino acids. Codons are groups of three. Change the frame to see the grouping shift.',
  );

  const { label, area } = sequenceField('dogma-seq', 'DNA sequence', CLASSROOM_GENE, 4);
  const samples = el('div', 'chips');
  samples.append(el('span', 'chip-label', 'Samples'));
  const sampleData = [
    ['Classroom gene', CLASSROOM_GENE],
    ['Short ORF', SHORT_ORF],
  ] as const;
  for (const [name, seq] of sampleData) {
    const button = el('button', 'chip', name);
    button.type = 'button';
    button.addEventListener('click', () => {
      area.value = seq;
      render();
    });
    samples.append(button);
  }

  const generateWrap = el('div', 'row');
  const length = el('select');
  length.id = 'dogma-length';
  for (const n of [8, 16, 32]) {
    const option = el('option', undefined, `${n} amino acids`);
    option.value = String(n);
    length.append(option);
  }
  const generate = el('button', 'ghost', 'Generate an ORF');
  generate.type = 'button';
  generate.addEventListener('click', () => {
    area.value = randomOrf(Number(length.value));
    render();
  });
  generateWrap.append(labeledInline('ORF length', length), generate);

  const strandRow = el('div', 'segment');
  strandRow.setAttribute('role', 'radiogroup');
  strandRow.setAttribute('aria-label', 'Which strand you pasted');
  let strand: 'coding' | 'template' = 'coding';
  const strandButtons = (['coding', 'template'] as const).map((value) => {
    const button = el('button', undefined, value === 'coding' ? 'Coding strand' : 'Template strand');
    button.type = 'button';
    button.dataset.strand = value;
    button.setAttribute('role', 'radio');
    button.addEventListener('click', () => {
      strand = value;
      render();
    });
    strandRow.append(button);
    return button;
  });

  const frameRow = el('div', 'segment');
  frameRow.setAttribute('role', 'radiogroup');
  frameRow.setAttribute('aria-label', 'Reading frame');
  let frame: FrameId = 1;
  const frameButtons = FRAMES.map((value) => {
    const button = el('button', undefined, value > 0 ? `+${value}` : String(value));
    button.type = 'button';
    button.setAttribute('role', 'radio');
    button.addEventListener('click', () => {
      frame = value;
      codonIndex = 0;
      stop();
      render();
    });
    frameRow.append(button);
    return button;
  });

  const transport = el('div', 'transport');
  const prev = el('button', 'ghost', 'Previous codon');
  const next = el('button', 'ghost', 'Next codon');
  const play = el('button', 'primary', 'Play');
  prev.type = 'button';
  next.type = 'button';
  play.type = 'button';
  const readout = el('p', 'readout');
  readout.setAttribute('aria-live', 'polite');
  transport.append(prev, next, play, readout);

  const results = el('div', 'panel results');
  const controls = el('div', 'panel controls');
  controls.append(
    label,
    samples,
    generateWrap,
    el('p', 'field-label', 'Pasted strand'),
    strandRow,
    el('p', 'field-label', 'Reading frame'),
    frameRow,
    transport,
  );

  const details = el('details', 'calc');
  details.append(
    el('summary', undefined, 'Which genetic code this uses'),
    el(
      'p',
      undefined,
      'Translation uses the standard genetic code (NCBI table 1). ATG is marked as the start. The stops are TAA, TAG, and TGA. Mitochondria and some bacteria use other codes. Codons after a stop stay visible so you can see the frame; a ribosome would have stopped at the star.',
    ),
  );

  root.append(explain, mountFigures(DIAGRAMS.dogma), mountCinema('replication'), controls, results, details);

  let codonIndex = 0;
  let timer = 0;
  let playing = false;

  function stop() {
    playing = false;
    window.clearInterval(timer);
    play.textContent = 'Play';
    play.setAttribute('aria-pressed', 'false');
  }

  function step(delta: number) {
    const analysis = current();
    const last = Math.max(0, analysis.codons.length - 1);
    codonIndex = Math.min(last, Math.max(0, codonIndex + delta));
    render();
  }

  prev.addEventListener('click', () => {
    stop();
    step(-1);
  });
  next.addEventListener('click', () => {
    stop();
    step(1);
  });
  play.addEventListener('click', () => {
    if (playing) {
      stop();
      return;
    }
    playing = true;
    play.textContent = 'Pause';
    play.setAttribute('aria-pressed', 'true');
    timer = window.setInterval(() => {
      const analysis = current();
      if (codonIndex >= analysis.codons.length - 1) {
        stop();
        return;
      }
      codonIndex += 1;
      render();
    }, 800);
  });

  area.addEventListener('input', () => {
    codonIndex = 0;
    stop();
    render();
  });

  root.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
    if (event.key === 'ArrowRight') {
      stop();
      step(1);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      stop();
      step(-1);
      event.preventDefault();
    }
  });

  function current(): FrameAnalysis {
    const cleaned = cleanDna(area.value);
    const pasted = cleaned.seq.slice(0, MAX);
    const coding = strand === 'template' ? reverseComplement(pasted) : pasted;
    return analyzeFrame(coding, frame);
  }

  function render() {
    for (const button of strandButtons) {
      const on = button.dataset.strand === strand;
      button.setAttribute('aria-checked', String(on));
      button.classList.toggle('on', on);
    }
    frameButtons.forEach((button, index) => {
      const on = FRAMES[index] === frame;
      button.setAttribute('aria-checked', String(on));
      button.classList.toggle('on', on);
    });

    const cleaned = cleanDna(area.value);
    const truncated = cleaned.seq.length > MAX;
    const pasted = truncated ? cleaned.seq.slice(0, MAX) : cleaned.seq;
    const analysis = current();
    if (codonIndex > analysis.codons.length - 1) codonIndex = Math.max(0, analysis.codons.length - 1);

    results.replaceChildren();
    if (!pasted) {
      results.append(el('p', 'empty', 'Paste a DNA sequence, or use a sample.'));
      readout.textContent = 'No sequence yet.';
      prev.disabled = true;
      next.disabled = true;
      return;
    }

    const counts = baseCounts(pasted);
    const stats = el('div', 'stats');
    stats.append(
      stat('Bases', String(pasted.length)),
      stat('GC', formatPercent(gcContent(pasted))),
      stat('A', String(counts.A)),
      stat('T', String(counts.T)),
      stat('G', String(counts.G)),
      stat('C', String(counts.C)),
    );
    const message = cleanMessage(cleaned.uToT, cleaned.skipped, truncated);
    const bar = composition(counts);

    const heroWrap = el('div', 'hero-block');
    const hero = el('p', 'protein-hero');
    hero.setAttribute('aria-label', 'Amino acids in this frame');
    const complete = analysis.codons.filter((codon) => !codon.incomplete);
    analysis.codons.forEach((codon) => {
      if (codon.incomplete || !codon.aa) return;
      const letter = el('span', 'residue', codon.aa === '*' ? '*' : codon.aa);
      if (codon.index === codonIndex) letter.classList.add('current');
      if (codon.isStop) letter.classList.add('stop');
      const start = analysis.orf.startCodon;
      const stop = analysis.orf.stopCodon;
      if (start !== null && codon.index + 1 >= start && (stop === null || codon.index + 1 <= stop)) {
        letter.classList.add('orf');
      }
      if (stop !== null && codon.index + 1 > stop) letter.classList.add('after');
      hero.append(letter);
    });
    if (!complete.length) hero.append(el('span', 'residue faint', '—'));

    const copies = el('div', 'row');
    const frameMrna = dnaToRna(analysis.codons.map((codon) => codon.dna).join(''));
    copies.append(
      copyButton(() => analysis.coding, 'Copy coding DNA'),
      copyButton(() => frameMrna, 'Copy mRNA'),
      copyButton(() => analysis.protein, 'Copy protein'),
    );

    heroWrap.append(hero, el('p', 'caption', orfSentence(analysis)), copies);

    const track = el('div', 'codon-track');
    if (analysis.skipped) {
      const skip = el('div', 'codon skipped');
      skip.append(el('span', 'badge', 'Not in frame'), bases(analysis.skipped));
      track.append(skip);
    }
    for (const codon of analysis.codons) {
      const card = el('button', 'codon');
      card.type = 'button';
      if (codon.index === codonIndex) card.classList.add('is-current');
      if (codon.isStart) card.classList.add('is-start');
      if (codon.isStop) card.classList.add('is-stop');
      if (codon.incomplete) card.classList.add('incomplete');
      const start = analysis.orf.startCodon;
      const stopAt = analysis.orf.stopCodon;
      if (!codon.incomplete && start !== null && codon.index + 1 >= start && (stopAt === null || codon.index + 1 <= stopAt)) {
        card.classList.add('in-orf');
      }
      if (!codon.incomplete && stopAt !== null && codon.index + 1 > stopAt) card.classList.add('after-stop');
      card.append(bases(codon.dna, 'bases coding'));
      card.append(bases(codon.template, 'bases template'));
      card.append(bases(codon.mrna, 'bases mrna'));
      card.append(el('span', 'aa-name', codon.incomplete ? '…' : codon.isStop ? 'Stop' : (codon.short ?? '')));
      if (codon.isStart && analysis.orf.startCodon === codon.index + 1) card.append(el('span', 'badge', 'Start'));
      else if (codon.isStop && analysis.orf.stopCodon === codon.index + 1) card.append(el('span', 'badge', 'Stop'));
      card.addEventListener('click', () => {
        codonIndex = codon.index;
        stop();
        render();
      });
      track.append(card);
    }

    const strandNote =
      strand === 'template'
        ? 'The paste was read as the template, 5′ to 3′. The coding strand is its reverse complement.'
        : frame < 0
          ? 'Reverse frames read the opposite strand, written 5′ to 3′.'
          : 'Top row is coding DNA, 5′ to 3′. The middle row is the template aligned underneath, so it reads 3′ to 5′. The third row is mRNA.';

    results.append(stats, bar, heroWrap, el('p', 'caption', strandNote), track);
    if (message) results.append(el('p', 'warn-line', message));

    const active = analysis.codons[codonIndex];
    readout.textContent = codonLabel(active, complete.length);
    prev.disabled = codonIndex <= 0;
    next.disabled = codonIndex >= analysis.codons.length - 1;
  }

  render();
  return () => window.clearInterval(timer);
}

function labeledInline(text: string, control: HTMLSelectElement): HTMLLabelElement {
  const label = el('label', 'inline');
  label.append(el('span', undefined, text), control);
  return label;
}

function composition(counts: ReturnType<typeof baseCounts>): HTMLDivElement {
  const wrap = el('div', 'comp-wrap');
  const bar = el('div', 'comp');
  bar.setAttribute('role', 'img');
  bar.setAttribute(
    'aria-label',
    `Base composition. A ${counts.A}, T ${counts.T}, G ${counts.G}, C ${counts.C}.`,
  );
  for (const base of ['A', 'T', 'G', 'C'] as const) {
    const block = el('i');
    block.className = `b${base}`;
    block.style.width = counts.length ? `${(100 * counts[base]) / counts.length}%` : '0';
    bar.append(block);
  }
  wrap.append(bar);
  return wrap;
}
