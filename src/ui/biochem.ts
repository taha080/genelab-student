import {
  AMINO_ACID_TABLE,
  CORI_CYCLE,
  GLUCONEOGENESIS,
  GLUCONEOGENESIS_COST,
  GLYCOLYSIS_COMPARE,
  GROUP_LABELS,
  KREBS_NOTES,
  KREBS_STEPS,
  MACROMOLECULES,
  krebsTotals,
  lineweaverBurk,
  michaelisMenten,
  pathwayEnergy,
  type AminoAcid,
  type SideChainGroup,
} from '../lib/biochem';
import { el } from './dom';

type Section = 'basics' | 'krebs' | 'glucose';

export function mountBiochem(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      'Amino acids, a Michaelis–Menten curve, the eight steps of the citric acid cycle, and the route from pyruvate back to glucose. The numbers are the textbook counts for one acetyl-CoA, or for two pyruvate making one glucose.',
    ),
  );

  const nav = el('div', 'segment');
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Biochemistry topics');
  const body = el('div');
  root.append(nav, body);

  let section: Section = 'basics';
  let group: SideChainGroup | 'all' = 'all';
  let vmax = 100;
  let km = 10;
  let substrate = 10;
  let krebsIndex = 0;
  let krebsPlaying = false;
  let krebsTimer = 0;
  let glucoseIndex = 0;
  let bypassOnly = false;

  const tabs: { id: Section; label: string }[] = [
    { id: 'basics', label: 'Basics' },
    { id: 'krebs', label: 'Krebs cycle' },
    { id: 'glucose', label: 'Gluconeogenesis' },
  ];

  for (const tab of tabs) {
    const button = el('button', undefined, tab.label);
    button.type = 'button';
    button.dataset.section = tab.id;
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => {
      section = tab.id;
      stopKrebs();
      render();
    });
    nav.append(button);
  }

  function stopKrebs() {
    krebsPlaying = false;
    window.clearInterval(krebsTimer);
  }

  function render() {
    for (const button of nav.querySelectorAll('button')) {
      const on = button.dataset.section === section;
      button.classList.toggle('on', on);
      button.setAttribute('aria-selected', String(on));
    }
    body.replaceChildren();
    if (section === 'basics') body.append(basics());
    else if (section === 'krebs') body.append(krebs());
    else body.append(glucose());
  }

  function basics(): HTMLElement {
    const wrap = el('div');
    const filters = el('div', 'segment');
    const options: { id: SideChainGroup | 'all'; label: string }[] = [
      { id: 'all', label: 'All 20' },
      { id: 'nonpolar', label: GROUP_LABELS.nonpolar },
      { id: 'aromatic', label: GROUP_LABELS.aromatic },
      { id: 'polar', label: GROUP_LABELS.polar },
      { id: 'positive', label: GROUP_LABELS.positive },
      { id: 'negative', label: GROUP_LABELS.negative },
    ];
    for (const option of options) {
      const button = el('button', option.id === group ? 'on' : undefined, option.label);
      button.type = 'button';
      button.addEventListener('click', () => {
        group = option.id;
        render();
      });
      filters.append(button);
    }

    const cards = el('div', 'aa-grid');
    const shown = AMINO_ACID_TABLE.filter((acid) => group === 'all' || acid.group === group);
    for (const acid of shown) cards.append(aminoCard(acid));

    wrap.append(
      el(
        'p',
        'caption',
        'Groups follow the usual side-chain sorting: seven nonpolar, three aromatic, five polar uncharged, three positive, and two negative. Histidine is only partly charged at pH 7.',
      ),
      filters,
      cards,
      kinetics(),
      macromolecules(),
    );
    return wrap;
  }

  function kinetics(): HTMLElement {
    const panel = el('section', 'panel');
    panel.append(
      el('h3', undefined, 'Enzyme kinetics'),
      el(
        'p',
        'caption',
        'v = Vmax[S] / (Km + [S]). When [S] = Km, v is half of Vmax. The Lineweaver–Burk line plots 1/v against 1/[S]. Its y-intercept is 1/Vmax and its x-intercept is −1/Km.',
      ),
    );

    const live = el('div', 'kinetics-live');
    const vmaxInput = slider('Vmax', vmax, 20, 200, 5, (value) => {
      vmax = value;
      fillKinetics(live);
    });
    const kmInput = slider('Km', km, 1, 40, 1, (value) => {
      km = value;
      fillKinetics(live);
    });
    const substrateInput = slider('Substrate [S]', substrate, 0, 80, 1, (value) => {
      substrate = value;
      fillKinetics(live);
    });
    panel.append(vmaxInput, kmInput, substrateInput, live);
    fillKinetics(live);
    return panel;
  }

  function fillKinetics(live: HTMLElement) {
    const velocity = michaelisMenten(substrate, vmax, km);
    const half = Math.abs(substrate - km) < 0.001;
    const stats = el('div', 'stats');
    stats.append(
      statChip('v', trim(velocity)),
      statChip('Vmax', trim(vmax)),
      statChip('Km', trim(km)),
      statChip('[S]', trim(substrate)),
    );
    const plots = el('div', 'plot-grid');
    plots.append(plotCard('Michaelis–Menten', mmPlot(vmax, km, substrate)), plotCard('Lineweaver–Burk', lbPlot(vmax, km, substrate)));
    const invV = substrate > 0 ? lineweaverBurk(1 / substrate, vmax, km) : Number.NaN;
    live.replaceChildren(
      stats,
      el(
        'p',
        'caption',
        half
          ? 'Substrate equals Km, so the velocity is half of Vmax.'
          : `At this substrate concentration the velocity is ${trim(velocity)}, ${trim((100 * velocity) / vmax)}% of Vmax.`,
      ),
      plots,
      el(
        'p',
        'caption',
        substrate > 0
          ? `At this point, 1/[S] = ${trim(1 / substrate)} and 1/v = ${trim(invV)}. The y-intercept is ${trim(1 / vmax)} and the x-intercept is −${trim(1 / km)}.`
          : 'The double-reciprocal point needs a substrate concentration above zero. The intercepts are still drawn.',
      ),
    );
  }

  function macromolecules(): HTMLElement {
    const panel = el('section', 'panel');
    panel.append(el('h3', undefined, 'Macromolecules'));
    const grid = el('div', 'macro-grid');
    for (const molecule of MACROMOLECULES) {
      const card = el('article', 'macro-card');
      card.append(
        el('h3', undefined, molecule.name),
        el('p', 'caption', `${molecule.builtFrom} · ${molecule.linkage}`),
        el('p', undefined, molecule.overview),
      );
      grid.append(card);
    }
    panel.append(grid);
    return panel;
  }

  function krebs(): HTMLElement {
    const step = KREBS_STEPS[krebsIndex] ?? KREBS_STEPS[0]!;
    const totals = krebsTotals();
    const wrap = el('div');
    wrap.append(
      el(
        'p',
        'caption',
        'Eight enzymes take the two carbons of acetyl-CoA around and back to oxaloacetate. Press play to walk the circle, or choose a step. The drawing is a map, not a picture of the enzymes.',
      ),
      el('p', 'motion-note', 'Animation is off because reduced motion is requested. Step still moves one enzyme at a time.'),
    );

    const stage = el('div', 'cycle-stage');
    stage.append(cycleSvg(krebsIndex));
    KREBS_STEPS.forEach((item, index) => {
      const button = el('button', `cycle-node${index === krebsIndex ? ' on' : ''}`);
      button.type = 'button';
      const pos = nodePosition(index);
      button.style.left = `${pos.x}%`;
      button.style.top = `${pos.y}%`;
      button.title = item.enzyme;
      button.append(el('b', undefined, String(item.step)), el('span', undefined, shortEnzyme(item.id)));
      button.setAttribute('aria-pressed', String(index === krebsIndex));
      button.addEventListener('click', () => {
        stopKrebs();
        krebsIndex = index;
        render();
      });
      stage.append(button);
    });

    const controls = el('div', 'row');
    const prev = el('button', 'ghost', 'Previous');
    const next = el('button', 'ghost', 'Next');
    const play = el('button', 'primary', krebsPlaying ? 'Pause' : 'Play');
    prev.type = 'button';
    next.type = 'button';
    play.type = 'button';
    play.setAttribute('aria-pressed', String(krebsPlaying));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) play.disabled = true;
    prev.addEventListener('click', () => {
      stopKrebs();
      krebsIndex = (krebsIndex + KREBS_STEPS.length - 1) % KREBS_STEPS.length;
      render();
    });
    next.addEventListener('click', () => {
      stopKrebs();
      krebsIndex = (krebsIndex + 1) % KREBS_STEPS.length;
      render();
    });
    play.addEventListener('click', () => {
      if (reduced) return;
      if (krebsPlaying) {
        stopKrebs();
        render();
        return;
      }
      krebsPlaying = true;
      render();
      krebsTimer = window.setInterval(() => {
        krebsIndex = (krebsIndex + 1) % KREBS_STEPS.length;
        if (krebsIndex === 0) stopKrebs();
        render();
      }, 1300);
    });
    controls.append(prev, play, next);

    const detail = el('article', 'panel step-detail');
    detail.append(el('p', 'eyebrow', `Step ${step.step} of 8`), el('h3', undefined, step.enzyme));
    const yields = el('div', 'stats');
    yields.append(
      statChip('NADH', String(step.nadh)),
      statChip('FADH₂', String(step.fadh2)),
      statChip('GTP', String(step.gtp)),
      statChip('CO₂', String(step.co2)),
    );
    detail.append(
      yields,
      fact('Substrates', step.substrates.join(' + ')),
      fact('Products', step.products.join(' + ')),
      fact('Cofactors', step.cofactors.join(', ')),
      fact('Where', step.location),
      fact('Regulation', step.regulation),
      el('p', undefined, step.detail),
    );

    const summary = el('section', 'panel');
    const totalChips = el('div', 'stats');
    totalChips.append(
      statChip('NADH', String(totals.nadh)),
      statChip('FADH₂', String(totals.fadh2)),
      statChip('GTP', String(totals.gtp)),
      statChip('CO₂', String(totals.co2)),
    );
    summary.append(
      el('h3', undefined, 'One turn, one acetyl-CoA'),
      totalChips,
      el('p', undefined, KREBS_NOTES.yield),
      el('p', undefined, KREBS_NOTES.carbons),
      el('p', undefined, KREBS_NOTES.pdh),
    );

    wrap.append(stage, controls, detail, summary);
    return wrap;
  }

  function glucose(): HTMLElement {
    const steps = bypassOnly ? GLUCONEOGENESIS.filter((step) => step.bypass) : GLUCONEOGENESIS;
    const safeIndex = Math.min(glucoseIndex, steps.length - 1);
    const step = steps[safeIndex] ?? GLUCONEOGENESIS[0]!;
    const cost = pathwayEnergy();
    const wrap = el('div');

    const filter = el('div', 'segment');
    for (const option of [
      { on: !bypassOnly, label: 'Full path' },
      { on: bypassOnly, label: 'Four bypasses' },
    ]) {
      const button = el('button', option.on ? 'on' : undefined, option.label);
      button.type = 'button';
      button.addEventListener('click', () => {
        bypassOnly = option.label.startsWith('Four');
        glucoseIndex = 0;
        render();
      });
      filter.append(button);
    }

    const controls = el('div', 'row');
    const prev = el('button', 'ghost', 'Previous');
    const next = el('button', 'ghost', 'Next');
    prev.type = 'button';
    next.type = 'button';
    prev.disabled = safeIndex <= 0;
    next.disabled = safeIndex >= steps.length - 1;
    prev.addEventListener('click', () => {
      glucoseIndex = Math.max(0, safeIndex - 1);
      render();
    });
    next.addEventListener('click', () => {
      glucoseIndex = Math.min(steps.length - 1, safeIndex + 1);
      render();
    });
    controls.append(prev, next);

    const list = el('div', 'path-list');
    steps.forEach((item, index) => {
      const button = el('button', `path-step${item.bypass ? ' bypass' : ''}${index === safeIndex ? ' on' : ''}`);
      button.type = 'button';
      button.append(
        el('span', 'path-index', String(GLUCONEOGENESIS.indexOf(item) + 1)),
        el('span', 'path-name', item.enzyme),
      );
      if (item.bypass) button.append(el('span', 'badge', 'Bypass'));
      button.addEventListener('click', () => {
        glucoseIndex = index;
        render();
      });
      list.append(button);
    });

    const detail = el('article', 'panel step-detail');
    detail.append(
      el('p', 'eyebrow', step.bypass ? 'Bypass enzyme' : 'Shared or shuttle step'),
      el('h3', undefined, step.enzyme),
      fact('Conversion', step.conversion),
      fact('Compared with glycolysis', step.glycolysis),
      fact('Compartment', step.compartment),
      fact('For one glucose', energyPhrase(step.atp, step.gtp, step.nadh)),
      el('p', undefined, step.regulation),
    );

    const energy = el('section', 'panel');
    const chips = el('div', 'stats');
    chips.append(statChip('ATP', String(cost.atp)), statChip('GTP', String(cost.gtp)), statChip('NADH', String(cost.nadh)));
    energy.append(
      el('h3', undefined, 'Cost of one glucose'),
      chips,
      el(
        'p',
        undefined,
        `${GLUCONEOGENESIS_COST.atp} ATP + ${GLUCONEOGENESIS_COST.gtp} GTP + ${GLUCONEOGENESIS_COST.nadh} NADH convert two pyruvate into one glucose. Pyruvate carboxylase spends 2 ATP, PEPCK spends 2 GTP, phosphoglycerate kinase spends 2 ATP, and GAPDH spends 2 NADH.`,
      ),
      el(
        'p',
        undefined,
        'Glycolysis in the other direction nets only 2 ATP and 2 NADH. Running both at once is a futile cycle: the NADH cancels and the cell loses 2 ATP plus 2 GTP.',
      ),
    );

    const table = el('table', 'compare');
    const head = el('tr');
    head.append(el('th', undefined, 'Glycolysis'), el('th', undefined, 'Gluconeogenesis'), el('th', undefined, 'Relationship'));
    table.append(head);
    for (const row of GLYCOLYSIS_COMPARE) {
      const tr = el('tr');
      tr.append(el('td', undefined, row.glycolysis), el('td', undefined, row.gluconeogenesis), el('td', undefined, row.note));
      table.append(tr);
    }
    const compare = el('section', 'panel');
    const scroll = el('div', 'table-scroll');
    scroll.append(table);
    compare.append(el('h3', undefined, 'Side by side with glycolysis'), scroll);

    const cori = el('section', 'panel');
    const columns = el('div', 'cori-grid');
    columns.append(coriCard('Muscle', CORI_CYCLE.muscle, `+${CORI_CYCLE.muscleAtpGain} ATP`), coriCard('Liver', CORI_CYCLE.liver, `${CORI_CYCLE.liverNtpCost} NTP spent`));
    cori.append(
      el('h3', undefined, 'Cori cycle'),
      columns,
      el('p', undefined, CORI_CYCLE.net),
      el('p', 'caption', `Net cost to the organism: ${CORI_CYCLE.netNtpCost} NTP per glucose returned.`),
    );

    wrap.append(
      el(
        'p',
        'caption',
        'Four enzymes bypass the irreversible steps of glycolysis. The other enzymes are shared, or they shuttle oxaloacetate out of the mitochondrion as malate.',
      ),
      filter,
      controls,
    );
    const layout = el('div', 'path-layout');
    layout.append(list, detail);
    wrap.append(layout, energy, compare, cori);
    return wrap;
  }

  render();
  return () => stopKrebs();
}

function aminoCard(acid: AminoAcid): HTMLElement {
  const card = el('article', `aa-card group-${acid.group}`);
  const title = el('div', 'aa-title');
  title.append(el('span', 'aa-letter', acid.letter), el('span', 'aa-code', `${acid.code} · ${acid.name}`));
  card.append(
    title,
    el('p', 'caption', GROUP_LABELS[acid.group]),
    el('p', 'side-chain', acid.sideChain),
    el('p', undefined, acid.note),
  );
  return card;
}

function slider(label: string, value: number, min: number, max: number, step: number, onInput: (value: number) => void): HTMLElement {
  const input = el('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  const caption = el('span', 'field-label', `${label}: ${trim(value)}`);
  input.addEventListener('input', () => {
    const next = Number(input.value);
    caption.textContent = `${label}: ${trim(next)}`;
    onInput(next);
  });
  const field = el('label', 'field slider-field');
  field.append(caption, input);
  return field;
}

function statChip(label: string, value: string): HTMLElement {
  const node = el('span', 'stat');
  node.append(el('span', 'stat-label', label), el('b', undefined, value));
  return node;
}

function fact(label: string, value: string): HTMLElement {
  const p = el('p', 'fact');
  p.append(el('span', undefined, label), document.createTextNode(` ${value}`));
  return p;
}

function plotCard(title: string, picture: SVGElement): HTMLElement {
  const card = el('figure', 'plot-card');
  card.append(el('figcaption', undefined, title), picture);
  return card;
}

function mmPlot(vmax: number, km: number, substrate: number): SVGElement {
  const width = 560;
  const height = 280;
  const pad = { l: 54, r: 16, t: 16, b: 40 };
  const sMax = Math.max(40, km * 5, substrate);
  const yMax = vmax * 1.12;
  const xOf = (s: number) => pad.l + ((width - pad.l - pad.r) * s) / sMax;
  const yOf = (v: number) => height - pad.b - ((height - pad.t - pad.b) * v) / yMax;
  const picture = svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img' });
  const velocity = michaelisMenten(substrate, vmax, km);
  picture.setAttribute(
    'aria-label',
    `Michaelis–Menten curve. Vmax ${trim(vmax)}, Km ${trim(km)}. At substrate ${trim(substrate)}, velocity is ${trim(velocity)}.`,
  );
  picture.append(svg('line', axis(pad.l, yOf(0), width - pad.r, yOf(0))));
  picture.append(svg('line', axis(pad.l, pad.t, pad.l, yOf(0))));
  picture.append(svg('line', { ...axis(pad.l, yOf(vmax), width - pad.r, yOf(vmax)), 'stroke-dasharray': '4 4' }));
  picture.append(svg('line', { ...axis(xOf(km), yOf(0), xOf(km), yOf(vmax / 2)), 'stroke-dasharray': '4 4' }));
  let d = '';
  for (let i = 0; i <= 80; i += 1) {
    const s = (sMax * i) / 80;
    const v = michaelisMenten(s, vmax, km);
    d += `${i === 0 ? 'M' : 'L'}${xOf(s).toFixed(2)} ${yOf(v).toFixed(2)} `;
  }
  picture.append(svg('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5 }));
  picture.append(svg('circle', { cx: xOf(substrate), cy: yOf(velocity), r: 5, fill: 'var(--accent-strong)' }));
  picture.append(svg('text', { x: width - pad.r, y: yOf(0) + 16, 'text-anchor': 'end', fill: 'var(--muted)' }, '[S]'));
  picture.append(svg('text', { x: 8, y: pad.t + 12, fill: 'var(--muted)' }, 'v'));
  picture.append(svg('text', { x: xOf(km), y: yOf(0) + 28, 'text-anchor': 'middle', fill: 'var(--muted)' }, 'Km'));
  picture.append(svg('text', { x: pad.l + 6, y: yOf(vmax) - 6, fill: 'var(--muted)' }, 'Vmax'));
  return picture;
}

function lbPlot(vmax: number, km: number, substrate: number): SVGElement {
  const width = 560;
  const height = 280;
  const pad = { l: 54, r: 16, t: 16, b: 40 };
  const xMin = -1.45 / km;
  const xMax = Math.max(4 / km, substrate > 0 ? Math.min(1 / substrate, 8 / km) : 4 / km);
  const yMax = (km / vmax) * xMax + 1 / vmax;
  const xOf = (x: number) => pad.l + ((width - pad.l - pad.r) * (x - xMin)) / (xMax - xMin);
  const yOf = (y: number) => height - pad.b - ((height - pad.t - pad.b) * y) / (yMax * 1.08);
  const picture = svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img' });
  picture.setAttribute(
    'aria-label',
    `Lineweaver–Burk plot. Y-intercept 1 over Vmax is ${trim(1 / vmax)}. X-intercept negative 1 over Km is ${trim(-1 / km)}.`,
  );
  picture.append(svg('line', axis(xOf(xMin), yOf(0), xOf(xMax), yOf(0))));
  picture.append(svg('line', axis(xOf(0), pad.t, xOf(0), yOf(0))));
  picture.append(
    svg('line', {
      x1: xOf(-1 / km),
      y1: yOf(0),
      x2: xOf(xMax),
      y2: yOf(lineweaverBurk(xMax, vmax, km)),
      stroke: 'var(--accent)',
      'stroke-width': 2.5,
    }),
  );
  picture.append(svg('circle', { cx: xOf(0), cy: yOf(1 / vmax), r: 4, fill: 'var(--accent-strong)' }));
  picture.append(svg('circle', { cx: xOf(-1 / km), cy: yOf(0), r: 4, fill: 'var(--caution)' }));
  if (substrate > 0 && 1 / substrate <= xMax) {
    picture.append(
      svg('circle', {
        cx: xOf(1 / substrate),
        cy: yOf(lineweaverBurk(1 / substrate, vmax, km)),
        r: 5,
        fill: 'var(--ink)',
      }),
    );
  }
  picture.append(svg('text', { x: xOf(xMax), y: yOf(0) + 16, 'text-anchor': 'end', fill: 'var(--muted)' }, '1/[S]'));
  picture.append(svg('text', { x: 8, y: pad.t + 12, fill: 'var(--muted)' }, '1/v'));
  picture.append(svg('text', { x: xOf(0) + 6, y: yOf(1 / vmax) - 6, fill: 'var(--muted)' }, '1/Vmax'));
  picture.append(svg('text', { x: xOf(-1 / km), y: yOf(0) + 28, 'text-anchor': 'middle', fill: 'var(--muted)' }, '−1/Km'));
  return picture;
}

function cycleSvg(active: number): SVGElement {
  const picture = svg('svg', { viewBox: '0 0 100 100', class: 'cycle-ring', 'aria-hidden': 'true' });
  picture.append(svg('circle', { cx: 50, cy: 50, r: 36, fill: 'none', stroke: 'var(--line)', 'stroke-width': 1.2 }));
  const pos = nodePosition(active);
  picture.append(svg('circle', { cx: pos.x, cy: pos.y, r: 7.2, fill: 'var(--accent-soft)', stroke: 'var(--accent)', 'stroke-width': 1.4 }));
  return picture;
}

function nodePosition(index: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / KREBS_STEPS.length;
  return { x: 50 + 36 * Math.cos(angle), y: 50 + 36 * Math.sin(angle) };
}

function shortEnzyme(id: string): string {
  const names: Record<string, string> = {
    'citrate-synthase': 'Citrate synthase',
    aconitase: 'Aconitase',
    idh: 'IDH',
    ogdh: 'α-KGDH',
    'succinyl-coa-synthetase': 'SCS',
    sdh: 'SDH',
    fumarase: 'Fumarase',
    mdh: 'MDH',
  };
  return names[id] ?? id;
}

function energyPhrase(atp: number, gtp: number, nadh: number): string {
  if (atp === 0 && gtp === 0 && nadh === 0) return 'No ATP, GTP, or NADH in the net count for this step.';
  const parts: string[] = [];
  if (atp) parts.push(`${atp} ATP`);
  if (gtp) parts.push(`${gtp} GTP`);
  if (nadh) parts.push(`${nadh} NADH`);
  return parts.join(' + ');
}

function coriCard(title: string, text: string, chip: string): HTMLElement {
  const card = el('article', 'macro-card');
  card.append(el('h3', undefined, title), el('p', 'caption', chip), el('p', undefined, text));
  return card;
}

function axis(x1: number, y1: number, x2: number, y2: number): Record<string, string | number> {
  return { x1, y1, x2, y2, stroke: 'var(--muted)', 'stroke-width': 1 };
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

function trim(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const rounded = Math.round(n * 100) / 100;
  return String(rounded);
}
