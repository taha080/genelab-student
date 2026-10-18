import { AMINO_ACIDS } from '../lib/codon';
import { interpretEdit, type EffectKind, type MutationKind, type MutationResult } from '../lib/mutation';
import { CLASSROOM_GENE, SHORT_ORF } from '../lib/samples';
import { cleanDna } from '../lib/sequence';
import { DIAGRAMS } from '../lib/diagrams';
import { bases, cleanMessage, el, labeled, sequenceField } from './dom';
import { mountFigures } from './figure';

const EFFECT_TONE: Record<EffectKind, string> = {
  unchanged: 'good',
  silent: 'good',
  missense: 'caution',
  nonsense: 'poor',
  'stop-loss': 'poor',
  frameshift: 'poor',
  'in-frame-insertion': 'caution',
  'in-frame-deletion': 'caution',
};

const EFFECT_TITLE: Record<EffectKind, string> = {
  unchanged: 'No protein change',
  silent: 'Silent',
  missense: 'Missense',
  nonsense: 'Nonsense',
  'stop-loss': 'Stop loss',
  frameshift: 'Frameshift',
  'in-frame-insertion': 'In-frame insertion',
  'in-frame-deletion': 'In-frame deletion',
};

export function mountMutations(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      'Change one part of a coding sequence and see what happens to the protein. A new codon can encode the same amino acid (silent), a different one (missense), or a stop (nonsense). Adding or removing bases can also shift the reading frame. Positions count A, C, G, and T only.',
    ),
    mountFigures(DIAGRAMS.mutations),
  );

  const sequence = sequenceField('mut-seq', 'Coding DNA, 5′ to 3′', CLASSROOM_GENE, 4);
  const kind = el('select');
  for (const [value, label] of [
    ['substitution', 'Substitution'],
    ['insertion', 'Insertion'],
    ['deletion', 'Deletion'],
  ] as const) {
    const option = el('option', undefined, label);
    option.value = value;
    kind.append(option);
  }
  const position = el('input');
  position.type = 'number';
  position.min = '1';
  position.value = '4';
  const base = el('select');
  for (const letter of ['A', 'C', 'G', 'T']) {
    const option = el('option', undefined, letter);
    option.value = letter;
    base.append(option);
  }
  base.value = 'G';
  const inserted = el('input');
  inserted.type = 'text';
  inserted.value = 'GCG';
  inserted.spellcheck = false;
  inserted.className = 'seq textish';
  const count = el('input');
  count.type = 'number';
  count.min = '1';
  count.value = '3';

  const baseField = labeled('mut-base', 'New base', base);
  const insertField = labeled('mut-insert', 'Bases to insert', inserted);
  const countField = labeled('mut-count', 'How many bases to delete', count);

  const samples = el('div', 'chips');
  samples.append(el('span', 'chip-label', 'Examples'));
  const examples: { name: string; seq: string; kind: MutationKind; position: string; base?: string; inserted?: string; count?: string }[] = [
    { name: 'Missense', seq: CLASSROOM_GENE, kind: 'substitution', position: '4', base: 'G' },
    { name: 'Silent', seq: CLASSROOM_GENE, kind: 'substitution', position: '6', base: 'G' },
    { name: 'Nonsense', seq: CLASSROOM_GENE, kind: 'substitution', position: '12', base: 'A' },
    { name: 'Frameshift', seq: SHORT_ORF, kind: 'insertion', position: '4', inserted: 'A' },
  ];
  for (const example of examples) {
    const button = el('button', 'chip', example.name);
    button.type = 'button';
    button.addEventListener('click', () => {
      sequence.area.value = example.seq;
      kind.value = example.kind;
      position.value = example.position;
      if (example.base) base.value = example.base;
      if (example.inserted) inserted.value = example.inserted;
      if (example.count) count.value = example.count;
      render();
    });
    samples.append(button);
  }

  const grid = el('div', 'row');
  grid.append(labeled('mut-kind', 'Change', kind), labeled('mut-pos', 'Position (first base is 1)', position), baseField, insertField, countField);

  const controls = el('div', 'panel controls');
  controls.append(samples, sequence.label, grid);
  const results = el('div', 'panel results');
  results.setAttribute('aria-live', 'polite');
  root.append(controls, results);

  for (const node of [sequence.area, kind, position, base, inserted, count]) {
    node.addEventListener('input', render);
    node.addEventListener('change', render);
  }

  function render() {
    const mutation = kind.value as MutationKind;
    baseField.hidden = mutation !== 'substitution';
    insertField.hidden = mutation !== 'insertion';
    countField.hidden = mutation !== 'deletion';

    const cleaned = cleanDna(sequence.area.value);
    const outcome = interpretEdit(cleaned.seq, {
      kind: mutation,
      position: Number(position.value),
      base: base.value,
      inserted: inserted.value,
      count: Number(count.value),
    });
    results.replaceChildren();
    const hint = positionHint(cleaned.seq, Number(position.value));
    if (hint) results.append(el('p', 'caption', hint));

    if ('error' in outcome) {
      results.append(el('p', 'empty', outcome.error));
      return;
    }
    results.append(banner(outcome), comparison(outcome));
    const message = cleanMessage(cleaned.uToT, cleaned.skipped, false);
    if (message) results.append(el('p', 'warn-line', message));
  }

  render();
  return () => {};
}

function positionHint(seq: string, position: number): string {
  if (!seq || !Number.isInteger(position) || position < 1 || position > seq.length) return '';
  return `Position ${position} is currently ${seq[position - 1]}. Translation below starts at base 1.`;
}

function banner(result: MutationResult): HTMLElement {
  const box = el('div', `banner ${EFFECT_TONE[result.effect]}`);
  box.append(el('strong', undefined, EFFECT_TITLE[result.effect]), el('p', undefined, result.summary));
  return box;
}

function comparison(result: MutationResult): HTMLElement {
  const wrap = el('div', 'pair-grid');
  wrap.append(
    column('Before', result.original, result.proteinOriginal, result.mutant),
    column('After', result.mutant, result.proteinMutant, result.original),
  );
  return wrap;
}

function column(title: string, seq: string, protein: string, other: string): HTMLElement {
  const card = el('article', 'primer-card');
  card.append(el('h3', undefined, title));
  const track = el('div', 'mini-track');
  const stopAt = protein.indexOf('*');
  for (let i = 0; i < seq.length; i += 3) {
    const codon = seq.slice(i, i + 3);
    const aa = protein[i / 3] ?? '';
    const chip = el('span', 'mini');
    if (codon !== other.slice(i, i + 3)) chip.classList.add('changed');
    if (codon.length < 3) chip.classList.add('incomplete');
    if (stopAt >= 0 && i / 3 > stopAt) chip.classList.add('after-stop');
    chip.append(bases(codon));
    const name = aa ? AMINO_ACIDS[aa] : undefined;
    chip.append(el('span', 'aa-name', aa === '*' ? 'Stop' : (name?.short ?? '…')));
    track.append(chip);
  }
  const letters = el('p', 'protein-hero small');
  for (let i = 0; i < protein.length; i += 1) {
    const letter = el('span', 'residue', protein[i] ?? '');
    if (protein[i] === '*') letter.classList.add('stop');
    if (stopAt >= 0 && i > stopAt) letter.classList.add('after');
    letters.append(letter);
  }
  card.append(letters, track);
  return card;
}
