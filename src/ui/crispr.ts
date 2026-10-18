import { findGuides, worstLevel, type GuideSite } from '../lib/crispr';
import { CLASSROOM_GENE, PAM_MINUS, PAM_PLUS } from '../lib/samples';
import { cleanDna } from '../lib/sequence';
import { bases, cleanMessage, copyButton, el, formatPercent, sequenceField, stat } from './dom';

const MAX = 3000;

export function mountCrispr(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      'SpCas9 cuts beside the letters NGG, called a PAM. The guide is the 20 bases on the 5′ side of that PAM. This list reads both strands of the sequence you paste. It does not check whether the same 20 bases occur elsewhere in a genome.',
    ),
  );

  const { label, area } = sequenceField('crispr-seq', 'Target DNA', CLASSROOM_GENE, 4);
  const samples = el('div', 'chips');
  samples.append(el('span', 'chip-label', 'Samples'));
  for (const [name, seq] of [
    ['Classroom gene', CLASSROOM_GENE],
    ['One + PAM', PAM_PLUS],
    ['One − PAM', PAM_MINUS],
  ] as const) {
    const button = el('button', 'chip', name);
    button.type = 'button';
    button.addEventListener('click', () => {
      area.value = seq;
      selected = 0;
      render();
    });
    samples.append(button);
  }
  const random = el('button', 'ghost', 'Random 60 bp');
  random.type = 'button';
  random.addEventListener('click', () => {
    area.value = randomDna(60);
    selected = 0;
    render();
  });

  const filterRow = el('div', 'segment');
  filterRow.setAttribute('role', 'radiogroup');
  filterRow.setAttribute('aria-label', 'Strand filter');
  let filter: 'all' | '+' | '-' = 'all';
  const filters = (['all', '+', '-'] as const).map((value) => {
    const button = el('button', undefined, value === 'all' ? 'Both strands' : value === '+' ? '+ strand' : '− strand');
    button.type = 'button';
    button.setAttribute('role', 'radio');
    button.addEventListener('click', () => {
      filter = value;
      selected = 0;
      render();
    });
    filterRow.append(button);
    return button;
  });

  const controls = el('div', 'panel controls');
  controls.append(label, samples, random, el('p', 'field-label', 'Show'), filterRow);
  const results = el('div', 'panel results');
  const details = el('details', 'calc');
  details.append(
    el('summary', undefined, 'How a guide is chosen'),
    el(
      'p',
      undefined,
      'On each strand, written 5′ to 3′, every NGG is a PAM. The guide is the 20 nucleotides immediately before it. SpCas9 cuts about three bases before the PAM. The flags look at GC content, runs of the same base, and TTTT, which can cut short a guide RNA made from a U6 promoter. They are not a prediction of how well editing would work.',
    ),
  );
  root.append(controls, results, details);

  let selected = 0;
  area.addEventListener('input', () => {
    selected = 0;
    render();
  });

  function render() {
    filters.forEach((button, index) => {
      const on = (['all', '+', '-'] as const)[index] === filter;
      button.setAttribute('aria-checked', String(on));
      button.classList.toggle('on', on);
    });

    const cleaned = cleanDna(area.value);
    const truncated = cleaned.seq.length > MAX;
    const seq = truncated ? cleaned.seq.slice(0, MAX) : cleaned.seq;
    const guides = findGuides(seq).filter((guide) => filter === 'all' || guide.strand === filter);
    if (selected > guides.length - 1) selected = 0;
    results.replaceChildren();

    if (!seq) {
      results.append(el('p', 'empty', 'Paste a DNA sequence, or use a sample.'));
      return;
    }
    if (seq.length < 23) {
      results.append(
        el(
          'p',
          'empty',
          `A guide needs 23 bases: 20 for the spacer and 3 for the PAM. This sequence has ${seq.length}.`,
        ),
      );
      return;
    }

    const plus = guides.filter((guide) => guide.strand === '+').length;
    const minus = guides.length - plus;
    const stats = el('div', 'stats');
    stats.append(stat('Guides', String(guides.length)), stat('+ strand', String(plus)), stat('− strand', String(minus)));

    const active = guides[selected];
    const map = el('div', 'map');
    for (let i = 0; i < seq.length; i += 1) {
      const base = el('button', `base b${seq[i]}`, seq[i]);
      base.type = 'button';
      if (active && coversGuide(active, i)) base.classList.add('hit-guide');
      if (active && coversPam(active, i)) base.classList.add('hit-pam');
      base.addEventListener('click', () => {
        const hit = guides.findIndex((guide) => coversGuide(guide, i) || coversPam(guide, i));
        if (hit >= 0) {
          selected = hit;
          render();
        }
      });
      map.append(base);
    }

    const legend = el('p', 'legend');
    legend.append(el('i', 'swatch guide'), el('span', undefined, '20 bp guide site'), el('i', 'swatch pam'), el('span', undefined, 'PAM'));

    const list = el('div', 'cards');
    if (guides.length === 0) {
      list.append(el('p', 'empty', 'No NGG PAM was found on the strands you are showing.'));
    }
    guides.forEach((guide, index) => {
      list.append(guideCard(guide, index === selected, () => {
        selected = index;
        render();
      }));
    });

    results.append(stats, map, legend, list);
    const message = cleanMessage(cleaned.uToT, cleaned.skipped, truncated);
    if (message) results.append(el('p', 'warn-line', message));
  }

  render();
  return () => {};
}

function coversGuide(guide: GuideSite, index: number): boolean {
  return index >= guide.start && index < guide.start + 20;
}

function coversPam(guide: GuideSite, index: number): boolean {
  if (guide.strand === '+') return index >= guide.start + 20 && index < guide.start + 23;
  return index >= guide.start - 3 && index < guide.start;
}

function guideCard(guide: GuideSite, on: boolean, select: () => void): HTMLElement {
  const card = el('article', `guide-card ${worstLevel(guide.flags)}`);
  if (on) card.classList.add('selected');
  card.tabIndex = 0;
  card.addEventListener('click', select);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      select();
      event.preventDefault();
    }
  });
  const end = guide.start + 20;
  const pamStart = guide.strand === '+' ? end + 1 : guide.start - 2;
  const pamEnd = guide.strand === '+' ? end + 3 : guide.start;
  const head = el('div', 'guide-head');
  head.append(
    el('span', 'strand', guide.strand === '+' ? '+ strand' : '− strand'),
    el('span', undefined, `site ${guide.start + 1}–${end}`),
    el('span', undefined, `PAM bases ${pamStart}–${pamEnd}`),
    el('b', undefined, formatPercent(guide.gc)),
  );
  const seq = el('p', 'guide-seq');
  seq.append(el('span', 'end-label', "5′"), bases(guide.guide), el('span', 'end-label', "3′"), el('span', 'pam-label', 'PAM'), bases(guide.pam, 'bases pam'));
  const flags = el('div', 'notes');
  for (const flag of guide.flags) flags.append(el('p', `note ${flag.level}`, flag.text));
  const copy = copyButton(() => guide.guide, 'Copy guide');
  copy.addEventListener('click', (event) => event.stopPropagation());
  card.append(head, seq, flags, copy);
  return card;
}

function randomDna(length: number): string {
  const bases = 'ACGT';
  let out = '';
  for (let i = 0; i < length; i += 1) out += bases[Math.floor(Math.random() * 4)];
  return out;
}
