import { CLASSROOM_GENE, RESTRICTION_DEMO } from '../lib/samples';
import { reverseComplement } from '../lib/sequence';
import {
  alignPair,
  findOrfs,
  findRestrictionSites,
  parseFasta,
  sequenceStats,
  type FastaRecord,
} from '../lib/seqtools';
import { bases, cleanMessage, copyButton, el, formatPercent, sequenceField } from './dom';

const FASTA_SAMPLE = `>restriction demo\n${RESTRICTION_DEMO}\n>classroom gene\n${CLASSROOM_GENE}\n`;

export function mountSequences(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      'Paste DNA or FASTA. This bench reverse-complements a record, counts bases, finds common restriction sites, lists open reading frames on all six frames, and aligns two sequences with a simple global score. Nothing is sent off this page.',
    ),
  );

  const primary = sequenceField('seq-primary', 'Sequence or FASTA', `>classroom gene\n${CLASSROOM_GENE}`, 6);
  const secondary = sequenceField('seq-align', 'Second sequence for alignment', 'AGTAAA', 3);
  const minAa = el('input');
  minAa.type = 'number';
  minAa.min = '1';
  minAa.max = '200';
  minAa.value = '1';
  minAa.addEventListener('input', render);
  const minField = el('label', 'field');
  minField.append(el('span', 'field-label', 'Minimum amino acids in an ORF'), minAa);

  const samples = el('div', 'row');
  samples.append(
    sampleButton('Classroom gene', `>classroom gene\n${CLASSROOM_GENE}\n`),
    sampleButton('Restriction demo', `>restriction demo\n${RESTRICTION_DEMO}\n`),
    sampleButton('Two FASTA records', FASTA_SAMPLE),
  );
  const reverse = el('button', 'ghost', 'Reverse complement');
  reverse.type = 'button';
  reverse.addEventListener('click', () => {
    const record = selectedRecord();
    if (!record) return;
    primary.area.value = reverseComplement(record.sequence);
    render();
  });
  samples.append(reverse);

  const picker = el('label', 'field');
  const select = el('select');
  picker.append(el('span', 'field-label', 'FASTA record'), select);
  select.addEventListener('change', render);

  const results = el('div');
  const orfList = el('div', 'cards');
  const alignBox = el('div');
  const output = el('div', 'panel');
  output.append(
    results,
    el('h3', undefined, 'Open reading frames'),
    minField,
    el(
      'p',
      'caption',
      'An ORF here is an ATG followed, in frame, by a stop. Reverse frames use the opposite strand. Coordinates are on the pasted sequence, left to right.',
    ),
    orfList,
    el('h3', undefined, 'Pairwise alignment'),
    secondary.label,
    alignBox,
  );
  const panel = el('div', 'panel');
  panel.append(primary.label, samples, picker);
  root.append(panel, output);

  primary.area.addEventListener('input', render);
  secondary.area.addEventListener('input', render);

  function sampleButton(label: string, value: string): HTMLButtonElement {
    const button = el('button', 'ghost', label);
    button.type = 'button';
    button.addEventListener('click', () => {
      primary.area.value = value;
      render();
    });
    return button;
  }

  function records(): FastaRecord[] {
    return parseFasta(primary.area.value);
  }

  function selectedRecord(): FastaRecord | undefined {
    const list = records();
    const index = Math.min(list.length - 1, Math.max(0, select.selectedIndex));
    return list[index];
  }

  function render() {
    const list = records();
    const previous = select.value;
    select.replaceChildren();
    list.forEach((record, index) => {
      const option = el('option', undefined, record.header || `Record ${index + 1}`);
      option.value = String(index);
      select.append(option);
    });
    if ([...select.options].some((option) => option.value === previous)) select.value = previous;
    picker.hidden = list.length < 2;

    results.replaceChildren();
    orfList.replaceChildren();
    alignBox.replaceChildren();
    const record = selectedRecord();
    if (!record || !record.sequence) {
      results.append(el('p', 'empty', 'Paste DNA bases, or a FASTA record that starts with >.'));
      return;
    }

    const stats = sequenceStats(record.sequence);
    const message = cleanMessage(record.uToT, record.skipped, false);
    const statRow = el('div', 'stats');
    statRow.append(
      chip('Length', String(stats.length)),
      chip('GC', formatPercent(stats.gc)),
      chip('A', String(stats.counts.A)),
      chip('T', String(stats.counts.T)),
      chip('G', String(stats.counts.G)),
      chip('C', String(stats.counts.C)),
    );
    const bar = el('div', 'comp');
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', `Composition A ${stats.counts.A}, T ${stats.counts.T}, G ${stats.counts.G}, C ${stats.counts.C}.`);
    for (const base of ['A', 'T', 'G', 'C'] as const) {
      const block = el('i');
      block.className = `b${base}`;
      block.style.width = stats.length ? `${(100 * stats.counts[base]) / stats.length}%` : '0';
      bar.append(block);
    }

    const rc = reverseComplement(record.sequence);
    const rcRow = el('p', 'mono-line');
    rcRow.append(el('span', 'end-label', "5'"), bases(rc), el('span', 'end-label', "3'"));

    const sites = findRestrictionSites(record.sequence);
    const siteList = el('div', 'cards');
    if (sites.length === 0) siteList.append(el('p', 'empty', 'None of the classroom enzymes cut this sequence.'));
    for (const site of sites) {
      const card = el('article', 'guide-card');
      card.append(
        el('h3', undefined, site.name),
        el(
          'p',
          undefined,
          `${site.site}, bases ${site.start + 1}–${site.start + site.site.length}. Top-strand cut after position ${site.cutPosition}. ${site.overhang === 'blunt' ? 'Blunt' : `${site.overhang} overhang`}.`,
        ),
      );
      siteList.append(card);
    }

    const min = Math.max(1, Math.floor(Number(minAa.value) || 1));
    const orfs = findOrfs(record.sequence, min);
    if (orfs.length === 0) orfList.append(el('p', 'empty', 'No ATG-to-stop open reading frame of that length.'));
    for (const orf of orfs) {
      const card = el('article', 'guide-card');
      const frame = orf.frame > 0 ? `+${orf.frame}` : String(orf.frame);
      card.append(
        el('h3', undefined, `Frame ${frame}`),
        el('p', undefined, `Pasted bases ${orf.inputStart}–${orf.inputEnd}. ${orf.aminoAcids} amino acids.`),
        el('p', 'protein-hero small', orf.protein),
      );
      orfList.append(card);
    }

    const aligned = alignPair(record.sequence, secondary.area.value);
    if ('error' in aligned) {
      alignBox.append(el('p', 'empty', aligned.error));
    } else {
      alignBox.append(
        el('div', 'stats'),
        alignmentView(aligned.alignedA, aligned.alignedB),
        el(
          'p',
          'caption',
          `Score ${aligned.score}. Identity ${formatPercent(aligned.identity)} (${aligned.matches} matches in ${aligned.columns} columns). Match +1, mismatch −1, gap −1.`,
        ),
        copyButton(() => `${aligned.alignedA}\n${aligned.alignedB}`, 'Copy alignment'),
      );
      const chips = alignBox.querySelector('.stats');
      chips?.append(chip('Score', String(aligned.score)), chip('Identity', formatPercent(aligned.identity)));
    }

    results.append(
      el('h3', undefined, 'Composition'),
      statRow,
      bar,
      message ? el('p', 'warn-line', message) : el('span'),
      el('h3', undefined, 'Reverse complement, 5′ to 3′'),
      rcRow,
      copyButton(() => rc, 'Copy reverse complement'),
      el('h3', undefined, 'Restriction sites'),
      el(
        'p',
        'caption',
        'EcoRI, BamHI, HindIII, NotI, XhoI, and the other classroom enzymes in the list. A site is reported only when the sequence contains that exact palindrome.',
      ),
      siteList,
    );
  }

  render();
  return () => {};
}

function chip(label: string, value: string): HTMLElement {
  const node = el('span', 'stat');
  node.append(el('span', 'stat-label', label), el('b', undefined, value));
  return node;
}

function alignmentView(a: string, b: string): HTMLElement {
  const wrap = el('div', 'align');
  const top = el('div');
  const mid = el('div');
  const bottom = el('div');
  for (let i = 0; i < a.length; i += 1) {
    const match = a[i] !== '-' && a[i] === b[i];
    top.append(el('span', match ? 'match' : 'diff', a[i] ?? ''));
    mid.append(el('span', undefined, match ? '|' : ' '));
    bottom.append(el('span', match ? 'match' : 'diff', b[i] ?? ''));
  }
  wrap.append(top, mid, bottom);
  return wrap;
}
