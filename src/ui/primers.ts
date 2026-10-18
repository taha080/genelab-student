import { analyzePair, analyzePrimer, type PrimerReport } from '../lib/primer';
import { HAIRPIN_PRIMER, MATCHED_FORWARD, MATCHED_REVERSE, UNEVEN_FORWARD, UNEVEN_REVERSE } from '../lib/samples';
import { bases, el, formatC, formatPercent, labeled, noteList, sequenceField, stat } from './dom';

export function mountPrimers(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      'A PCR primer is a short DNA strand that binds where you want copying to start. Melting temperature (Tm) is an estimate of where that duplex comes apart. Compare the two primers, and watch for ends that can stick to each other.',
    ),
  );

  const forward = sequenceField('primer-f', 'Forward primer, 5′ to 3′', MATCHED_FORWARD, 2);
  const reverse = sequenceField('primer-r', 'Reverse primer, 5′ to 3′', MATCHED_REVERSE, 2);
  const na = el('input');
  na.type = 'number';
  na.min = '1';
  na.max = '1000';
  na.value = '50';
  const conc = el('input');
  conc.type = 'number';
  conc.min = '1';
  conc.max = '100000';
  conc.value = '250';

  const samples = el('div', 'chips');
  samples.append(el('span', 'chip-label', 'Samples'));
  const load = (f: string, r: string) => {
    forward.area.value = f;
    reverse.area.value = r;
    render();
  };
  for (const [name, f, r] of [
    ['Matched pair', MATCHED_FORWARD, MATCHED_REVERSE],
    ['Uneven pair', UNEVEN_FORWARD, UNEVEN_REVERSE],
    ['Hairpin', HAIRPIN_PRIMER, ''],
  ] as const) {
    const button = el('button', 'chip', name);
    button.type = 'button';
    button.addEventListener('click', () => load(f, r));
    samples.append(button);
  }

  const numbers = el('div', 'row');
  numbers.append(labeled('primer-na', 'Sodium (mM)', na), labeled('primer-conc', 'Primer (nM)', conc));

  const controls = el('div', 'panel controls');
  controls.append(samples, forward.label, reverse.label, numbers);
  const results = el('div', 'panel results');
  const details = el('details', 'calc');
  details.append(
    el('summary', undefined, 'How the melting temperatures are calculated'),
    el(
      'p',
      undefined,
      'The basic estimate is the Wallace rule: Tm = 2(A+T) + 4(G+C). It only counts bases. G·C pairs add more because they are held by three hydrogen bonds.',
    ),
    el(
      'p',
      undefined,
      'The nearest-neighbor estimate uses the SantaLucia 1998 stacking table. Each pair of neighbors contributes enthalpy and entropy, the two ends add an initiation term, and a sequence that is its own reverse complement gets a symmetry correction. Salt adjusts the entropy by 0.368 × (length − 1) × ln([Na+]). Primer concentration enters the two-state equation. Magnesium is not included, so a real PCR buffer can sit a few degrees away from this number.',
    ),
  );
  root.append(controls, results, details);

  for (const node of [forward.area, reverse.area, na, conc]) {
    node.addEventListener('input', render);
  }

  function conditions() {
    const naMm = clamp(Number(na.value), 1, 1000, 50);
    const nM = clamp(Number(conc.value), 1, 100000, 250);
    return { naMolar: naMm / 1000, oligoMolar: nM * 1e-9, naMm, nM };
  }

  function render() {
    const cond = conditions();
    const melt = { naMolar: cond.naMolar, oligoMolar: cond.oligoMolar };
    const fwd = analyzePrimer(forward.area.value, melt);
    const rev = analyzePrimer(reverse.area.value, melt);
    results.replaceChildren();
    if (!fwd.sequence && !rev.sequence) {
      results.append(el('p', 'empty', 'Paste one primer, or a pair.'));
      return;
    }

    const grid = el('div', 'pair-grid');
    if (fwd.sequence) grid.append(primerCard('Forward', fwd));
    if (rev.sequence) grid.append(primerCard('Reverse', rev));
    results.append(el('p', 'caption', `Nearest-neighbor settings: ${cond.naMm} mM Na+, ${cond.nM} nM primer, no magnesium correction.`), grid);

    if (fwd.sequence && rev.sequence) {
      const pair = analyzePair(fwd.sequence, rev.sequence, melt);
      const pairPanel = el('div', 'pair-summary');
      const stats = el('div', 'stats');
      stats.append(
        stat('Forward Tm', formatC(fwd.nearestNeighbor)),
        stat('Reverse Tm', formatC(rev.nearestNeighbor)),
        stat('Difference', formatC(pair.tmDifference).replace('°C', '°C')),
      );
      pairPanel.append(el('h3', undefined, 'The pair'), stats, noteList(pair.notes));
      if (Number.isFinite(fwd.nearestNeighbor) && Number.isFinite(rev.nearestNeighbor)) {
        const lower = Math.min(fwd.nearestNeighbor, rev.nearestNeighbor);
        if (lower > 20) {
          pairPanel.append(
            el(
              'p',
              'caption',
              `A common place to start annealing is about 3–5°C below the lower Tm, near ${formatC(lower - 4)}. Treat that as a first guess, not a guarantee.`,
            ),
          );
        }
      }
      results.append(pairPanel);
    }
  }

  render();
  return () => {};
}

function primerCard(title: string, report: PrimerReport): HTMLElement {
  const card = el('article', 'primer-card');
  card.append(el('h3', undefined, title), bases(report.sequence, 'bases guide-seq'));
  const stats = el('div', 'stats');
  stats.append(
    stat('Length', `${report.length} nt`),
    stat('GC', formatPercent(report.gc)),
    stat('Wallace', formatC(report.wallace)),
    stat('Nearest neighbor', formatC(report.nearestNeighbor)),
    stat("3′ G/C in last 5", String(report.gcClamp)),
  );
  card.append(stats, noteList(report.notes));
  return card;
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
