import { CODON_BASES, codonHit, searchCodons, type CodonHit } from '../lib/codontable';
import { DIAGRAMS } from '../lib/diagrams';
import { bases, el } from './dom';
import { mountFigures } from './figure';

export function mountCodonTable(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      'This is the standard genetic code, NCBI table 1. Rows are the first base and columns are the second. The four buttons in a box are the third base. Search by codon (ATG or AUG) or by amino acid (Phe, F, or phenylalanine). Click a codon to light up every codon for that amino acid.',
    ),
    mountFigures(DIAGRAMS.codon),
  );

  const search = el('input');
  search.type = 'search';
  search.placeholder = 'ATG, Phe, or methionine';
  search.autocomplete = 'off';
  search.spellcheck = false;
  search.setAttribute('aria-label', 'Search codons or amino acids');
  const searchField = el('label', 'field');
  searchField.append(el('span', 'field-label', 'Search'), search);
  const controls = el('div', 'panel controls');
  controls.append(searchField);
  const detail = el('div');
  const gridWrap = el('div', 'table-scroll');
  const results = el('div', 'panel results');
  results.append(detail, gridWrap);
  root.append(controls, results);

  let family = '';
  let focusCodon = '';

  search.addEventListener('input', () => {
    family = '';
    focusCodon = '';
    render();
  });

  function render() {
    const query = search.value.trim();
    const hits = query ? searchCodons(query) : [];
    const hitCodons = new Set(hits.map((hit) => hit.codon));
    const hitAcids = new Set(hits.map((hit) => hit.aa));
    detail.replaceChildren();
    if (query && hits.length === 0) {
      detail.append(el('p', 'empty', 'No codon or amino acid matches that search.'));
    } else if (hits.length > 0) {
      detail.append(summary(hits));
    } else if (family) {
      const sample = codonHit(codonsOf(family)[0] ?? 'ATG');
      if (sample) {
        detail.append(
          el(
            'p',
            'caption',
            sample.isStop
              ? 'TAA, TAG, and TGA are the three stop codons.'
              : `Every highlighted codon encodes ${sample.name}.`,
          ),
        );
      }
    }

    const grid = el('div', 'codon-grid');
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', 'Standard genetic code');
    grid.append(el('div'));
    for (const second of CODON_BASES) grid.append(el('div', 'grid-head', `2nd base ${second}`));
    for (const first of CODON_BASES) {
      grid.append(el('div', 'grid-head side', `1st ${first}`));
      for (const second of CODON_BASES) {
        const cell = el('div', 'codon-cell');
        for (const third of CODON_BASES) {
          const hit = codonHit(`${first}${second}${third}`);
          if (!hit) continue;
          const button = el('button', 'codon-btn');
          button.type = 'button';
          const lit = query ? hitCodons.has(hit.codon) || (hitAcids.size === 1 && hitAcids.has(hit.aa)) : family === hit.aa;
          if (lit) button.classList.add('on');
          if ((!query && focusCodon === hit.codon) || (hits.length === 1 && hits[0]?.codon === hit.codon)) {
            button.classList.add('focus');
          }
          if (hit.isStart) button.classList.add('is-start');
          if (hit.isStop) button.classList.add('is-stop');
          button.append(bases(hit.codon), el('span', 'aa-name', hit.isStop ? 'Stop' : hit.short), el('span', 'rna-mini', hit.rna));
          if (hit.isStart) button.append(el('span', 'badge', 'Start'));
          if (hit.isStop) button.append(el('span', 'badge', 'Stop'));
          button.addEventListener('click', () => {
            search.value = '';
            family = hit.aa;
            focusCodon = hit.codon;
            render();
          });
          cell.append(button);
        }
        grid.append(cell);
      }
    }
    gridWrap.replaceChildren(
      grid,
      el(
        'p',
        'caption',
        'DNA codons use T. The small letters are the mRNA codon, with U in place of T. ATG is the start taught in class. TAA, TAG, and TGA are stops. Mitochondria use a different table.',
      ),
    );
  }

  render();
  return () => {};
}

function codonsOf(aa: string): string[] {
  return searchCodons(aa === '*' ? 'stop' : aa).map((hit) => hit.codon);
}

function summary(hits: CodonHit[]): HTMLElement {
  const box = el('div', 'banner good');
  const acids = [...new Set(hits.map((hit) => hit.aa))];
  if (acids.length !== 1) {
    box.append(
      el('strong', undefined, 'More than one amino acid'),
      el('p', undefined, 'That prefix matches more than one name. Every matching codon is highlighted.'),
    );
    return box;
  }
  const hit = hits[0]!;
  const title = hit.isStop ? 'Stop' : `${capitalize(hit.name)} (${hit.short}, ${hit.aa})`;
  const list = hits.map((item) => `${item.codon} / ${item.rna}`).join(', ');
  const start = hits.some((item) => item.isStart) ? ' ATG is also the usual start codon, and it is the only codon for methionine.' : '';
  box.append(el('strong', undefined, title), el('p', undefined, `Codons: ${list}.${start}`));
  return box;
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
