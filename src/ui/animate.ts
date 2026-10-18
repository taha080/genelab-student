import { AMINO_ACIDS, anticodon, translate } from '../lib/codon';
import { SHORT_ORF } from '../lib/samples';
import { complement, dnaToRna } from '../lib/sequence';
import { bases, el } from './dom';

type Scene = 'helix' | 'transcription' | 'translation';

const DNA = SHORT_ORF;
const RNA = dnaToRna(DNA);
const TEMPLATE = complement(DNA);

export function mountAnimation(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      'A schematic of the helix, then RNA polymerase copying a template, then a ribosome reading codons. The sequence is a short synthetic open reading frame, not a natural gene. Play walks forward. Step works even when motion is reduced.',
    ),
  );
  root.append(el('p', 'motion-note', 'Reduced motion is on, so Play stays off. Use Step to move one base or one codon.'));

  const nav = el('div', 'segment');
  const stage = el('div', 'panel stage-panel');
  const readout = el('p', 'readout');
  const controls = el('div', 'row');
  root.append(nav, stage, readout, controls);

  let scene: Scene = 'helix';
  let index = 0;
  let playing = false;
  let timer = 0;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const scenes: { id: Scene; label: string }[] = [
    { id: 'helix', label: 'Double helix' },
    { id: 'transcription', label: 'Transcription' },
    { id: 'translation', label: 'Translation' },
  ];
  const buttons = new Map<Scene, HTMLButtonElement>();
  for (const item of scenes) {
    const button = el('button', undefined, item.label);
    button.type = 'button';
    button.addEventListener('click', () => {
      stop();
      scene = item.id;
      index = 0;
      render();
    });
    buttons.set(item.id, button);
    nav.append(button);
  }

  const restart = el('button', 'ghost', 'Restart');
  const back = el('button', 'ghost', 'Step back');
  const forward = el('button', 'ghost', 'Step');
  const play = el('button', 'primary', 'Play');
  for (const button of [restart, back, forward, play]) button.type = 'button';
  restart.addEventListener('click', () => {
    stop();
    index = 0;
    render();
  });
  back.addEventListener('click', () => {
    stop();
    index = Math.max(0, index - 1);
    render();
  });
  forward.addEventListener('click', () => {
    stop();
    index = Math.min(maxIndex(), index + 1);
    render();
  });
  play.addEventListener('click', () => {
    if (motion.matches) return;
    if (playing) {
      stop();
      render();
      return;
    }
    if (index >= maxIndex()) index = 0;
    playing = true;
    render();
    timer = window.setInterval(() => {
      if (index >= maxIndex()) {
        stop();
        render();
        return;
      }
      index += 1;
      render();
    }, 700);
  });
  controls.append(restart, back, forward, play);

  function maxIndex(): number {
    if (scene === 'translation') return RNA.length / 3 - 1;
    return DNA.length - 1;
  }

  function stop() {
    playing = false;
    window.clearInterval(timer);
  }

  function syncMotion() {
    play.disabled = motion.matches;
    if (motion.matches) stop();
  }
  syncMotion();
  motion.addEventListener('change', syncMotion);

  function render() {
    for (const [id, button] of buttons) button.classList.toggle('on', id === scene);
    play.textContent = playing ? 'Pause' : 'Play';
    play.setAttribute('aria-pressed', String(playing));
    back.disabled = index <= 0;
    forward.disabled = index >= maxIndex();
    stage.replaceChildren();
    if (scene === 'helix') {
      stage.append(drawHelix(index));
      readout.textContent = helixCaption(index);
    } else if (scene === 'transcription') {
      stage.append(drawTranscription(index));
      readout.textContent = transcriptionCaption(index);
    } else {
      stage.append(drawTranslation(index));
      readout.textContent = translationCaption(index);
    }
  }

  render();
  return () => {
    stop();
    motion.removeEventListener('change', syncMotion);
  };
}

function helixCaption(index: number): string {
  const base = DNA[index] ?? '';
  const pair = TEMPLATE[index] ?? '';
  return `Pair ${index + 1} of ${DNA.length}: ${base} pairs with ${pair}. B-DNA has about 10.5 base pairs in one full turn. This is a flat schematic of that twist, with the two strands drawn in opposite phase.`;
}

function transcriptionCaption(index: number): string {
  return `RNA polymerase has added ${index + 1} ribonucleotide${index === 0 ? '' : 's'}. The new base is ${RNA[index]}, copied from template base ${TEMPLATE[index]}. The coding strand shows ${DNA[index]}; the mRNA matches it, with U in place of T. The polymerase reads the template 3′ to 5′, which is left to right in this aligned drawing.`;
}

function translationCaption(index: number): string {
  const codon = RNA.slice(index * 3, index * 3 + 3);
  const letter = translate(DNA.slice(index * 3, index * 3 + 3)) || '?';
  if (letter === '*') {
    return `Codon ${codon} is a stop. No amino acid is added, and release factors free the chain ${peptide(index - 1)}.`;
  }
  const anti = anticodon(codon);
  const name = AMINO_ACIDS[letter]?.name ?? 'an amino acid';
  return `Codon ${index + 1}, ${codon}, pairs with anticodon 3′-${anti?.threeToFive ?? ''}-5′ (written 5′-${anti?.fiveToThree ?? ''}-3′). Strict Watson–Crick pairing is shown; real tRNA often wobbles at the third base. The residue is ${name}. Peptide so far: ${peptide(index)}.`;
}

function peptide(through: number): string {
  if (through < 0) return '—';
  const last = Math.min(RNA.length / 3 - 1, through);
  const protein = translate(DNA.slice(0, (last + 1) * 3));
  const stop = protein.indexOf('*');
  const chain = stop < 0 ? protein : protein.slice(0, stop);
  return chain || '—';
}

function codonLetter(index: number): string {
  return translate(DNA.slice(index * 3, index * 3 + 3));
}

function drawHelix(index: number): HTMLElement {
  const scroll = el('div', 'stage-scroll');
  const picture = svg('svg', { viewBox: '0 0 700 210', role: 'img' });
  picture.setAttribute('aria-label', helixCaption(index));
  const origin = 36;
  const gap = 26;
  const xOf = (i: number) => origin + i * gap;
  const yTop = (i: number) => 78 + 34 * Math.sin((i / 10.5) * Math.PI * 2);
  const yBot = (i: number) => 132 + 34 * Math.sin((i / 10.5) * Math.PI * 2 + Math.PI);
  for (let i = 0; i < DNA.length; i += 1) {
    picture.append(
      svg('line', {
        x1: xOf(i),
        y1: yTop(i),
        x2: xOf(i),
        y2: yBot(i),
        stroke: i === index ? 'var(--accent)' : 'var(--line)',
        'stroke-width': i === index ? 2.4 : 1,
      }),
    );
  }
  picture.append(wave(DNA.length, xOf, yTop, 'var(--accent)'));
  picture.append(wave(DNA.length, xOf, yBot, 'var(--accent-strong)'));
  for (let i = 0; i < DNA.length; i += 1) {
    picture.append(baseDot(xOf(i), yTop(i), DNA[i] ?? '', i === index));
    picture.append(baseDot(xOf(i), yBot(i), TEMPLATE[i] ?? '', i === index));
  }
  picture.append(svg('text', { x: 8, y: 28, fill: 'var(--muted)' }, "5'"));
  picture.append(svg('text', { x: 650, y: 28, fill: 'var(--muted)' }, "3'"));
  scroll.append(picture);
  return scroll;
}

function drawTranscription(index: number): HTMLElement {
  const scroll = el('div', 'stage-scroll');
  const picture = svg('svg', { viewBox: '0 0 740 250', role: 'img' });
  picture.setAttribute('aria-label', transcriptionCaption(index));
  const origin = 48;
  const gap = 28;
  const xOf = (i: number) => origin + i * gap;
  picture.append(svg('text', { x: 8, y: 42, fill: 'var(--muted)', 'font-size': 12 }, "coding 5'"));
  picture.append(svg('text', { x: 8, y: 96, fill: 'var(--muted)', 'font-size': 12 }, "template 3'"));
  picture.append(svg('text', { x: 8, y: 176, fill: 'var(--muted)', 'font-size': 12 }, "mRNA 5'"));
  for (let i = 0; i < DNA.length; i += 1) {
    picture.append(baseText(xOf(i), 58, DNA[i] ?? ''));
    picture.append(baseText(xOf(i), 112, TEMPLATE[i] ?? ''));
    if (i <= index) picture.append(baseText(xOf(i), 196, RNA[i] ?? ''));
  }
  const poly = svg('rect', {
    x: xOf(index) - 16,
    y: 24,
    width: 36,
    height: 104,
    rx: 10,
    fill: 'var(--accent-soft)',
    stroke: 'var(--accent)',
  });
  picture.append(poly);
  picture.append(svg('text', { x: xOf(index) - 12, y: 148, fill: 'var(--ink)', 'font-size': 12 }, 'RNAP'));
  scroll.append(picture);
  return scroll;
}

function drawTranslation(index: number): HTMLElement {
  const wrap = el('div', 'translation');
  const mrna = el('div', 'mrna-row');
  mrna.append(el('span', 'end-label', "5'"));
  for (let i = 0; i < RNA.length / 3; i += 1) {
    const codon = RNA.slice(i * 3, i * 3 + 3);
    const chip = el('span', `codon${i === index ? ' is-current' : ''}`);
    chip.append(bases(codon, 'bases mrna'));
    mrna.append(chip);
  }
  mrna.append(el('span', 'end-label', "3'"));

  const codon = RNA.slice(index * 3, index * 3 + 3);
  const anti = anticodon(codon);
  const letter = codonLetter(index);
  const trna = el('div', 'trna');
  if (letter === '*') {
    trna.append(el('p', undefined, 'Stop codon. The ribosome releases the chain instead of adding a residue.'));
  } else {
    trna.append(
      el('p', 'caption', `tRNA anticodon aligned 3′ → 5′ under the codon: ${anti?.threeToFive ?? ''}`),
      el('p', undefined, `Written 5′ → 3′: ${anti?.fiveToThree ?? ''}. Amino acid: ${AMINO_ACIDS[letter]?.name ?? ''}.`),
    );
  }
  const chain = el('p', 'protein-hero');
  const chainText = letter === '*' ? peptide(index - 1) : peptide(index);
  for (let i = 0; i < chainText.length; i += 1) {
    const residue = chainText[i] ?? '';
    const mark = el('span', 'residue', residue);
    if (letter !== '*' && i === chainText.length - 1) mark.classList.add('current');
    chain.append(mark);
  }
  wrap.append(el('p', 'caption', 'Messenger RNA, grouped in threes. The highlighted codon is in the ribosome.'), mrna, trna, el('p', 'caption', 'Peptide'), chain);
  return wrap;
}

function wave(
  length: number,
  xOf: (i: number) => number,
  yOf: (i: number) => number,
  stroke: string,
): SVGPathElement {
  let d = '';
  for (let i = 0; i < length; i += 1) d += `${i === 0 ? 'M' : 'L'}${xOf(i)} ${yOf(i)} `;
  return svg('path', { d, fill: 'none', stroke, 'stroke-width': 2 });
}

function baseDot(x: number, y: number, base: string, current: boolean): SVGTextElement {
  const node = svg('text', {
    x,
    y: y + 4,
    'text-anchor': 'middle',
    'font-size': 11,
    'font-family': 'IBM Plex Mono, ui-monospace, monospace',
    fill: baseColor(base),
    'font-weight': current ? 700 : 400,
  }, base);
  return node;
}

function baseText(x: number, y: number, base: string): SVGTextElement {
  return svg('text', {
    x,
    y,
    'text-anchor': 'middle',
    'font-size': 13,
    'font-family': 'IBM Plex Mono, ui-monospace, monospace',
    fill: baseColor(base),
  }, base);
}

function baseColor(base: string): string {
  if (base === 'A') return 'var(--a)';
  if (base === 'T' || base === 'U') return base === 'U' ? 'var(--u)' : 'var(--t)';
  if (base === 'G') return 'var(--g)';
  if (base === 'C') return 'var(--c)';
  return 'var(--ink)';
}

function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
  text?: string,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}
