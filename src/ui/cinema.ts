import { MOTION, type MotionId, type MotionScript } from '../lib/motion';
import { el } from './dom';

const NS = 'http://www.w3.org/2000/svg';
const STAGE_MS = 1700;

interface Tick {
  stage: number;
  /** 0 at the start of the stage, 1 at the end. */
  t: number;
  /** Seconds the playhead has been moving. Frozen while paused. */
  spin: number;
  script: MotionScript;
}

type Painter = {
  viewBox: string;
  build(svg: SVGSVGElement): void;
  frame(tick: Tick): void;
};

class GeneCinema extends HTMLElement {
  private halt = (): void => {};

  setHalt(fn: () => void): void {
    this.halt = fn;
  }

  disconnectedCallback(): void {
    this.halt();
  }
}

if (!customElements.get('gene-cinema')) customElements.define('gene-cinema', GeneCinema);

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
  text?: string,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function setText(node: SVGTextElement, value: string): void {
  if (node.textContent !== value) node.textContent = value;
}

export function mountCinema(id: MotionId): HTMLElement {
  const script = MOTION[id];
  const host = document.createElement('gene-cinema') as GeneCinema;
  host.className = 'cinema';

  const painter = PAINTERS[id];
  const picture = svgEl('svg', { viewBox: painter.viewBox, role: 'img' });
  picture.setAttribute('aria-label', script.summary);
  picture.classList.add('cinema-svg');
  painter.build(picture);

  const stageBox = el('div', 'cinema-stage');
  stageBox.append(picture);
  const label = el('p', 'cinema-label');
  label.setAttribute('aria-live', 'polite');
  const controls = el('div', 'row');
  const play = el('button', 'primary', 'Play');
  const step = el('button', 'ghost', 'Step');
  play.type = 'button';
  step.type = 'button';
  const speeds = [0.5, 1, 2] as const;
  let speed: (typeof speeds)[number] = 1;
  const speedButtons = speeds.map((value) => {
    const button = el('button', 'ghost', `${value}×`);
    button.type = 'button';
    button.setAttribute('aria-label', value === 0.5 ? 'Half speed' : value === 2 ? 'Double speed' : 'Normal speed');
    button.addEventListener('click', () => {
      speed = value;
      paintControls();
    });
    return button;
  });
  controls.append(play, step, ...speedButtons);

  host.append(
    el('p', 'eyebrow', 'Animation'),
    el('h3', undefined, script.title),
    el('p', 'caption', script.summary),
    stageBox,
    label,
    controls,
    el('p', 'motion-note', 'Reduced motion is on, so Play stays off. Step still moves one labeled stage at a time.'),
  );

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let stageT = 0;
  let playing = false;
  let raf = 0;
  let last = 0;
  let spin = 0.4;
  let visible = true;

  function paint(): void {
    painter.frame({ stage: index, t: stageT, spin, script });
    const stage = script.stages[index] ?? script.stages[0]!;
    const next = `Step ${index + 1} of ${script.stages.length}. ${stage.title}. ${stage.detail}`;
    if (label.textContent !== next) label.textContent = next;
    paintControls();
  }

  function paintControls(): void {
    play.textContent = playing ? 'Pause' : 'Play';
    play.setAttribute('aria-pressed', String(playing));
    play.disabled = reduced.matches;
    speedButtons.forEach((button, i) => {
      const on = speeds[i] === speed;
      button.classList.toggle('on', on);
      button.setAttribute('aria-pressed', String(on));
    });
  }

  function stopLoop(): void {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function tick(now: number): void {
    const dt = Math.min(34, now - last || 16);
    last = now;
    if (visible && document.visibilityState !== 'hidden') {
      spin += (dt / 1000) * speed;
      stageT += (dt * speed) / STAGE_MS;
      if (stageT >= 1) {
        stageT %= 1;
        index = (index + 1) % script.stages.length;
      }
      paint();
    }
    raf = requestAnimationFrame(tick);
  }

  function startLoop(): void {
    if (raf || reduced.matches) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function pause(): void {
    playing = false;
    stopLoop();
    paintControls();
  }

  play.addEventListener('click', () => {
    if (reduced.matches) return;
    if (playing) {
      pause();
      return;
    }
    if (stageT >= 0.98) {
      index = (index + 1) % script.stages.length;
      stageT = 0;
    }
    playing = true;
    paint();
    startLoop();
  });

  step.addEventListener('click', () => {
    pause();
    index = (index + 1) % script.stages.length;
    stageT = 1;
    paint();
  });

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
  });
  io.observe(host);

  function onMotion(): void {
    if (reduced.matches) pause();
    paintControls();
  }
  reduced.addEventListener('change', onMotion);

  function onHide(): void {
    if (document.visibilityState === 'hidden') stopLoop();
    else if (playing) startLoop();
  }
  document.addEventListener('visibilitychange', onHide);

  host.setHalt(() => {
    playing = false;
    stopLoop();
    io.disconnect();
    reduced.removeEventListener('change', onMotion);
    document.removeEventListener('visibilitychange', onHide);
  });

  paint();
  return host;
}

const BASE: Record<string, string> = {
  A: 'var(--a)',
  T: 'var(--t)',
  G: 'var(--g)',
  C: 'var(--c)',
};

const REP_SEQ = 'ATGCGTACGTACGTACGTACG';

function replicationPainter(): Painter {
  const n = REP_SEQ.length;
  let strandA!: SVGPathElement;
  let strandB!: SVGPathElement;
  let pairs!: SVGLineElement[];
  let dotsA!: SVGCircleElement[];
  let dotsB!: SVGCircleElement[];
  let helicase!: SVGGElement;
  let polymerase!: SVGGElement;
  let lead!: SVGCircleElement[];
  let fragments!: SVGPathElement;
  let primer!: SVGPathElement;
  let leadLabel!: SVGTextElement;
  let lagLabel!: SVGTextElement;

  return {
    viewBox: '0 0 480 300',
    build(svg) {
      strandA = svgEl('path', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 4, 'stroke-linecap': 'round' });
      strandB = svgEl('path', { fill: 'none', stroke: 'var(--accent-strong)', 'stroke-width': 4, 'stroke-linecap': 'round' });
      svg.append(strandA, strandB);
      pairs = [];
      dotsA = [];
      dotsB = [];
      lead = [];
      for (let i = 0; i < n; i += 1) {
        const pair = svgEl('line', { stroke: 'var(--line)', 'stroke-width': 2 });
        const a = svgEl('circle', { r: 5, fill: BASE[REP_SEQ[i] ?? 'A'] ?? 'var(--ink)' });
        const comp = complement(REP_SEQ[i] ?? 'A');
        const b = svgEl('circle', { r: 5, fill: BASE[comp] ?? 'var(--ink)' });
        const neu = svgEl('circle', { r: 4, fill: 'var(--good)' });
        pairs.push(pair);
        dotsA.push(a);
        dotsB.push(b);
        lead.push(neu);
        svg.append(pair, a, b, neu);
      }
      fragments = svgEl('path', { fill: 'none', stroke: 'var(--good)', 'stroke-width': 6, 'stroke-linecap': 'round' });
      primer = svgEl('path', { fill: 'none', stroke: 'var(--caution)', 'stroke-width': 6, 'stroke-linecap': 'round' });
      svg.append(fragments, primer);
      helicase = svgEl('g', {});
      helicase.append(
        svgEl('circle', { r: 16, fill: 'var(--caution)', stroke: 'var(--surface)', 'stroke-width': 2 }),
        svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: 'var(--surface)', 'font-size': 9, 'font-weight': 700 }, 'Hel'),
      );
      polymerase = svgEl('g', {});
      polymerase.append(
        svgEl('rect', { x: -18, y: -12, width: 36, height: 24, rx: 8, fill: 'var(--accent)' }),
        svgEl('text', { 'text-anchor': 'middle', y: 4, fill: 'var(--on-accent)', 'font-size': 10, 'font-weight': 700 }, 'Pol'),
      );
      svg.append(helicase, polymerase);
      for (const [x, y, value] of [
        [8, 28, '3′'],
        [448, 28, '5′'],
        [8, 250, '5′'],
        [448, 250, '3′'],
      ] as const) {
        svg.append(svgEl('text', { x, y, fill: 'var(--muted)', 'font-size': 13, 'font-weight': 700 }, value));
      }
      leadLabel = svgEl('text', { fill: 'var(--good)', 'font-size': 12, 'font-weight': 700 }, 'leading 5′→3′');
      lagLabel = svgEl('text', { fill: 'var(--good)', 'font-size': 12, 'font-weight': 700 }, 'Okazaki 5′→3′');
      svg.append(leadLabel, lagLabel);
    },
    frame({ stage, t, spin }) {
      const fork = forkAt(stage, t);
      const angle = spin * 1.7;
      let dA = '';
      let dB = '';
      for (let i = 0; i < n; i += 1) {
        const x = 24 + i * (432 / (n - 1));
        const open = Math.max(0, Math.min(1, (fork - i) / 1.2));
        const amp = 18 + open * 46;
        const theta = angle + i * ((Math.PI * 2) / 10.5);
        const yA = 132 - Math.sin(theta) * amp;
        const yB = 132 + Math.sin(theta) * amp;
        dA += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yA.toFixed(1)}`;
        dB += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yB.toFixed(1)}`;
        const pair = pairs[i]!;
        pair.setAttribute('x1', x.toFixed(1));
        pair.setAttribute('x2', x.toFixed(1));
        pair.setAttribute('y1', yA.toFixed(1));
        pair.setAttribute('y2', yB.toFixed(1));
        pair.setAttribute('stroke-opacity', open > 0.35 ? '0' : '1');
        place(dotsA[i]!, x, yA);
        place(dotsB[i]!, x, yB);
        const showLead = stage >= 2 && i < fork - 0.4;
        const neu = lead[i]!;
        neu.setAttribute('opacity', showLead ? '1' : '0');
        place(neu, x, yB + 14);
      }
      strandA.setAttribute('d', dA);
      strandB.setAttribute('d', dB);
      const forkX = 24 + fork * (432 / (n - 1));
      helicase.setAttribute('transform', `translate(${forkX.toFixed(1)} 132)`);
      helicase.setAttribute('opacity', stage >= 1 ? '1' : '0');
      polymerase.setAttribute('transform', `translate(${Math.max(40, forkX - 16).toFixed(1)} 196)`);
      polymerase.setAttribute('opacity', stage >= 2 ? '1' : '0');
      leadLabel.setAttribute('x', '24');
      leadLabel.setAttribute('y', '286');
      leadLabel.setAttribute('opacity', stage >= 2 ? '1' : '0');
      lagLabel.setAttribute('x', '250');
      lagLabel.setAttribute('y', '286');
      lagLabel.setAttribute('opacity', stage >= 3 ? '1' : '0');
      fragments.setAttribute('d', stage >= 3 ? fragmentPath(fork, false) : '');
      primer.setAttribute('d', stage >= 3 ? fragmentPath(fork, true) : '');
    },
  };
}

function fragmentPath(fork: number, primerOnly: boolean): string {
  const span = 432 / (REP_SEQ.length - 1);
  const parts: string[] = [];
  const end = Math.max(2, fork - 4);
  let cursor = 1;
  while (cursor + 3 < end) {
    const x1 = 24 + cursor * span;
    const x2 = 24 + (cursor + 3.2) * span;
    const y = 58;
    if (primerOnly) parts.push(`M${x2 - 10} ${y} L${x2} ${y}`);
    else parts.push(`M${x1} ${y} L${x2 - 12} ${y}`);
    cursor += 4.2;
  }
  return parts.join(' ');
}

function forkAt(stage: number, t: number): number {
  const marks = [2, 8, 14, 18];
  const start = stage === 0 ? 2 : (marks[stage - 1] ?? 2);
  const end = marks[stage] ?? 18;
  return start + (end - start) * ease(t);
}

function complement(base: string): string {
  if (base === 'A') return 'T';
  if (base === 'T') return 'A';
  if (base === 'G') return 'C';
  return 'G';
}

function place(node: SVGCircleElement, x: number, y: number): void {
  node.setAttribute('cx', x.toFixed(1));
  node.setAttribute('cy', y.toFixed(1));
}

function ribosomePainter(): Painter {
  let mrna!: SVGGElement;
  let trnaA!: SVGGElement;
  let trnaP!: SVGGElement;
  let trnaE!: SVGGElement;
  let aaA!: SVGTextElement;
  let aaP!: SVGTextElement;
  let antiA!: SVGTextElement;
  let peptide!: SVGTextElement;
  let badge!: SVGTextElement;

  return {
    viewBox: '0 0 480 300',
    build(svg) {
      svg.append(
        svgEl('ellipse', { cx: 240, cy: 118, rx: 168, ry: 72, fill: 'var(--accent-soft)', stroke: 'var(--accent)', 'stroke-width': 2 }),
        svgEl('ellipse', { cx: 240, cy: 196, rx: 150, ry: 36, fill: 'var(--surface)', stroke: 'var(--ink)', 'stroke-width': 2 }),
      );
      for (const [x, name] of [
        [110, 'E site'],
        [230, 'P site'],
        [350, 'A site'],
      ] as const) {
        svg.append(svgEl('text', { x, y: 112, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 13, 'font-weight': 700 }, name));
      }
      mrna = svgEl('g', {});
      svg.append(mrna);
      trnaE = trnaGroup();
      trnaP = trnaGroup();
      trnaA = trnaGroup();
      svg.append(trnaE, trnaP, trnaA);
      aaEHolder(trnaE);
      aaP = textOf(trnaP);
      aaA = textOf(trnaA);
      antiA = svgEl('text', { y: 78, 'text-anchor': 'middle', fill: 'var(--accent)', 'font-size': 11, 'font-weight': 700 });
      trnaA.append(antiA);
      peptide = svgEl('text', { x: 240, y: 28, 'text-anchor': 'middle', fill: 'var(--good)', 'font-size': 16, 'font-weight': 700 });
      badge = svgEl('text', { x: 400, y: 48, 'text-anchor': 'middle', fill: 'var(--caution)', 'font-size': 13, 'font-weight': 700 });
      svg.append(peptide, badge);
      svg.append(svgEl('text', { x: 16, y: 292, fill: 'var(--muted)', 'font-size': 13, 'font-weight': 700 }, '5′'));
      svg.append(svgEl('text', { x: 448, y: 292, fill: 'var(--muted)', 'font-size': 13, 'font-weight': 700 }, '3′'));
    },
    frame({ stage, t, script }) {
      const e = ease(t);
      const codons = ['AUG', 'UUU', 'GGC', 'UGC'];
      const shift = mrnaShift(stage, e);
      mrna.replaceChildren();
      const origin = 230 - shift * 78;
      codons.forEach((codon, i) => {
        const x = origin + i * 78;
        if (x < 20 || x > 460) return;
        mrna.append(
          svgEl('text', {
            x,
            y: 214,
            'text-anchor': 'middle',
            'font-family': 'var(--mono)',
            'font-size': 16,
            'font-weight': 700,
            fill: 'var(--ink)',
          }, codon),
        );
      });
      const entering = enteringAa(stage);
      const aDrop = stage % 3 === 1 ? 40 * (1 - e) : 0;
      const showA = stage >= 1 && !(stage % 3 === 0 && stage > 0 && e > 0.65);
      trnaA.setAttribute('opacity', showA ? '1' : '0');
      trnaA.setAttribute('transform', `translate(350 ${168 - aDrop})`);
      setText(aaA, entering);
      setText(antiA, antiOf(entering));
      const chain = chainAt(stage);
      const onA = chainOnA(stage);
      trnaP.setAttribute('transform', 'translate(230 168)');
      trnaP.setAttribute('opacity', '1');
      setText(aaP, onA ? '' : tail(chain));
      setText(aaA, onA ? tail(chain) : entering);
      trnaE.setAttribute('opacity', stage % 3 === 0 && stage > 0 ? String(1 - e) : '0');
      trnaE.setAttribute('transform', `translate(${110 - e * 16} ${168 - e * 20})`);
      setText(peptide, chain);
      const badgeText = script.stages[stage]?.badge ?? '';
      setText(badge, badgeText);
      badge.setAttribute('opacity', badgeText ? String(0.35 + 0.65 * e) : '0');
    },
  };
}

function trnaGroup(): SVGGElement {
  const g = svgEl('g', {});
  g.append(
    svgEl('line', { x1: 0, y1: 8, x2: 0, y2: 36, stroke: 'var(--accent)', 'stroke-width': 3 }),
    svgEl('circle', { cy: 0, r: 16, fill: 'var(--surface)', stroke: 'var(--accent)', 'stroke-width': 2 }),
  );
  return g;
}

function textOf(group: SVGGElement): SVGTextElement {
  const node = svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: 'var(--ink)', 'font-size': 11, 'font-weight': 700 });
  group.append(node);
  return node;
}

function aaEHolder(group: SVGGElement): void {
  group.append(svgEl('text', { 'text-anchor': 'middle', y: 4, fill: 'var(--muted)', 'font-size': 10 }, 'tRNA'));
}

function mrnaShift(stage: number, e: number): number {
  if (stage < 3) return 0;
  if (stage === 3) return e;
  if (stage < 6) return 1;
  if (stage === 6) return 1 + e;
  return 2;
}

function enteringAa(stage: number): string {
  if (stage === 1 || stage === 2) return 'Phe';
  if (stage === 4 || stage === 5) return 'Gly';
  if (stage >= 7) return 'Cys';
  return '';
}

function antiOf(aa: string): string {
  if (aa === 'Phe') return '3′-AAA-5′';
  if (aa === 'Gly') return '3′-CCG-5′';
  if (aa === 'Cys') return '3′-ACG-5′';
  return '';
}

function tail(chain: string): string {
  const parts = chain.split('–');
  return parts[parts.length - 1] ?? chain;
}

function chainAt(stage: number): string {
  if (stage < 2) return 'Met';
  if (stage < 5) return 'Met–Phe';
  if (stage < 8) return 'Met–Phe–Gly';
  return 'Met–Phe–Gly–Cys';
}

function chainOnA(stage: number): boolean {
  return stage === 2 || stage === 5 || stage === 8;
}

function synthasePainter(): Painter {
  let rotor!: SVGGElement;
  let gamma!: SVGLineElement;
  let protons!: SVGCircleElement[];
  let atp!: SVGTextElement;
  let sites!: SVGTextElement[];

  return {
    viewBox: '0 0 480 300',
    build(svg) {
      svg.append(svgEl('text', { x: 16, y: 28, fill: 'var(--muted)', 'font-size': 13, 'font-weight': 700 }, 'intermembrane space'));
      svg.append(svgEl('rect', { x: 0, y: 70, width: 480, height: 58, fill: 'var(--accent-soft)' }));
      svg.append(svgEl('text', { x: 16, y: 104, fill: 'var(--ink)', 'font-size': 13, 'font-weight': 700 }, 'inner membrane'));
      svg.append(svgEl('text', { x: 16, y: 156, fill: 'var(--muted)', 'font-size': 13, 'font-weight': 700 }, 'matrix'));
      rotor = svgEl('g', {});
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        rotor.append(svgEl('circle', { cx: Math.cos(a) * 22, cy: Math.sin(a) * 22, r: 6, fill: 'var(--accent)' }));
      }
      svg.append(rotor);
      gamma = svgEl('line', { stroke: 'var(--caution)', 'stroke-width': 8, 'stroke-linecap': 'round' });
      svg.append(gamma);
      const f1 = svgEl('g', {});
      sites = [];
      for (let i = 0; i < 6; i += 1) {
        const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
        const cx = 250 + Math.cos(a) * 46;
        const cy = 214 + Math.sin(a) * 46;
        f1.append(svgEl('circle', { cx, cy, r: 16, fill: i % 2 === 0 ? 'var(--accent-soft)' : 'var(--surface)', stroke: 'var(--accent)', 'stroke-width': 2 }));
      }
      svg.append(f1);
      const labels = ['open', 'tight', 'loose'];
      labels.forEach((name, i) => {
        const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
        const node = svgEl('text', {
          x: 250 + Math.cos(a) * 78,
          y: 214 + Math.sin(a) * 58,
          'text-anchor': 'middle',
          fill: 'var(--ink)',
          'font-size': 12,
          'font-weight': 700,
        }, name);
        sites.push(node);
        svg.append(node);
      });
      protons = [0, 1, 2].map(() => svgEl('circle', { r: 5, fill: 'var(--accent-strong)' }));
      protons.forEach((node) => svg.append(node));
      atp = svgEl('text', { x: 390, y: 230, 'text-anchor': 'middle', fill: 'var(--good)', 'font-size': 18, 'font-weight': 700 }, 'ATP');
      svg.append(atp);
      svg.append(svgEl('text', { x: 250, y: 214, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: 'var(--accent)', 'font-size': 13, 'font-weight': 700 }, 'F₁'));
      svg.append(svgEl('text', { x: 300, y: 100, fill: 'var(--ink)', 'font-size': 13, 'font-weight': 700 }, 'F₀'));
    },
    frame({ stage, t, spin }) {
      const angle = (spin * 70 * Math.PI) / 180;
      rotor.setAttribute('transform', `translate(250 99) rotate(${((angle * 180) / Math.PI).toFixed(1)})`);
      const gy = 99 + Math.sin(angle) * 4;
      gamma.setAttribute('x1', '250');
      gamma.setAttribute('y1', gy.toFixed(1));
      gamma.setAttribute('x2', String(250 + Math.sin(angle) * 10));
      gamma.setAttribute('y2', '214');
      protons.forEach((node, i) => {
        const local = (ease(t) + i / 3) % 1;
        const y = 36 + local * 90;
        node.setAttribute('cx', String(214 + i * 8));
        node.setAttribute('cy', y.toFixed(1));
        node.setAttribute('opacity', stage === 0 || local > 0.15 ? '1' : '0.35');
      });
      sites.forEach((node, i) => {
        const hot = i === stage % 3;
        node.setAttribute('fill', hot ? 'var(--accent)' : 'var(--muted)');
      });
      atp.setAttribute('opacity', stage === 3 ? String(0.25 + 0.75 * ease(t)) : '0.2');
      const scale = stage === 3 ? 0.8 + 0.4 * ease(t) : 0.85;
      atp.setAttribute('transform', `translate(390 230) scale(${scale.toFixed(2)}) translate(-390 -230)`);
    },
  };
}

function etcPainter(): Painter {
  let electron!: SVGCircleElement;
  let protons!: SVGCircleElement[];
  let badge!: SVGTextElement;
  let o2!: SVGTextElement;

  const stops = [
    { x: 70, y: 188 },
    { x: 150, y: 168 },
    { x: 230, y: 150 },
    { x: 320, y: 168 },
    { x: 400, y: 196 },
  ];

  return {
    viewBox: '0 0 480 300',
    build(svg) {
      svg.append(svgEl('text', { x: 16, y: 36, fill: 'var(--muted)', 'font-size': 13, 'font-weight': 700 }, 'intermembrane space'));
      svg.append(svgEl('rect', { x: 0, y: 118, width: 480, height: 46, fill: 'var(--accent-soft)' }));
      svg.append(svgEl('text', { x: 16, y: 146, fill: 'var(--ink)', 'font-size': 12, 'font-weight': 700 }, 'inner membrane'));
      svg.append(svgEl('text', { x: 16, y: 186, fill: 'var(--muted)', 'font-size': 13, 'font-weight': 700 }, 'matrix'));
      const boxes: [number, string][] = [
        [48, 'I'],
        [128, 'II'],
        [208, 'III'],
        [300, 'IV'],
      ];
      for (const [x, name] of boxes) {
        svg.append(svgEl('rect', { x, y: 108, width: 52, height: 64, rx: 10, fill: 'var(--surface)', stroke: 'var(--accent)', 'stroke-width': 2 }));
        svg.append(svgEl('text', { x: x + 26, y: 146, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 16, 'font-weight': 700 }, name));
      }
      svg.append(svgEl('text', { x: 154, y: 100, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 12, 'font-weight': 700 }, 'Q'));
      svg.append(svgEl('text', { x: 286, y: 100, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 12, 'font-weight': 700 }, 'cyt c'));
      electron = svgEl('circle', { r: 8, fill: 'var(--caution)', stroke: 'var(--surface)', 'stroke-width': 2 });
      svg.append(electron);
      protons = Array.from({ length: 8 }, () => svgEl('circle', { r: 4, fill: 'var(--accent-strong)' }));
      protons.forEach((node) => svg.append(node));
      badge = svgEl('text', { x: 400, y: 28, 'text-anchor': 'middle', fill: 'var(--accent)', 'font-size': 14, 'font-weight': 700 });
      o2 = svgEl('text', { x: 430, y: 230, 'text-anchor': 'middle', fill: 'var(--good)', 'font-size': 14, 'font-weight': 700 }, 'O₂ → H₂O');
      svg.append(badge, o2);
      svg.append(svgEl('text', { x: 48, y: 196, fill: 'var(--good)', 'font-size': 12, 'font-weight': 700 }, 'NADH'));
      svg.append(svgEl('text', { x: 128, y: 196, fill: 'var(--muted)', 'font-size': 12, 'font-weight': 700 }, 'succinate'));
    },
    frame({ stage, t, script }) {
      const e = ease(t);
      const from = stage >= 4 ? { x: 154, y: 200 } : (stops[Math.min(stage, stops.length - 1)] ?? stops[0]);
      const to = stage >= 4 ? stops[1]! : (stops[Math.min(stage + 1, stops.length - 1)] ?? from);
      const x = (from?.x ?? 70) + ((to?.x ?? 70) - (from?.x ?? 70)) * e;
      const y = (from?.y ?? 180) + ((to?.y ?? 180) - (from?.y ?? 180)) * e;
      electron.setAttribute('cx', x.toFixed(1));
      electron.setAttribute('cy', y.toFixed(1));
      const pumping = stage === 0 || stage === 2 || stage === 3;
      protons.forEach((node, i) => {
        const wave = (e + i / 8) % 1;
        node.setAttribute('cx', String(70 + (i % 4) * 70));
        node.setAttribute('cy', String(150 - wave * 70));
        node.setAttribute('opacity', pumping ? '1' : '0');
      });
      const badgeText = script.stages[stage]?.badge ?? '';
      setText(badge, badgeText);
      badge.setAttribute('opacity', badgeText ? '1' : '0');
      o2.setAttribute('opacity', stage === 3 ? String(0.3 + 0.7 * e) : '0.25');
    },
  };
}

function glycolysisPainter(): Painter {
  let hex!: SVGGElement;
  let left!: SVGGElement;
  let right!: SVGGElement;
  let badge!: SVGTextElement;
  let caption!: SVGTextElement;

  return {
    viewBox: '0 0 480 280',
    build(svg) {
      hex = sugar(6, 'var(--accent)');
      left = sugar(3, 'var(--good)');
      right = sugar(3, 'var(--c)');
      svg.append(hex, left, right);
      badge = svgEl('text', { x: 400, y: 48, 'text-anchor': 'middle', fill: 'var(--caution)', 'font-size': 16, 'font-weight': 700 });
      caption = svgEl('text', { x: 240, y: 250, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 14, 'font-weight': 700 });
      svg.append(badge, caption);
      svg.append(svgEl('text', { x: 24, y: 28, fill: 'var(--muted)', 'font-size': 13, 'font-weight': 700 }, 'cytosol'));
    },
    frame({ stage, t, script }) {
      const e = ease(t);
      const split = stage >= 2 ? Math.min(1, stage === 2 ? e : 1) : 0;
      hex.setAttribute('opacity', split > 0.85 ? '0' : '1');
      hex.setAttribute('transform', `translate(240 130) scale(${(1 - split * 0.2).toFixed(3)})`);
      left.setAttribute('opacity', String(split));
      right.setAttribute('opacity', String(split));
      left.setAttribute('transform', `translate(${240 - split * 90} ${150 + split * 10})`);
      right.setAttribute('transform', `translate(${240 + split * 90} ${150 + split * 10})`);
      const badgeText = script.stages[stage]?.badge ?? '';
      setText(badge, badgeText);
      badge.setAttribute('opacity', badgeText ? String(0.2 + 0.8 * e) : '0');
      const names = ['Glucose', 'Fructose 1,6-BP', 'Two trioses', '2 NADH', 'Payoff', '2 pyruvate'];
      setText(caption, names[stage] ?? '');
    },
  };
}

function sugar(carbons: number, fill: string): SVGGElement {
  const g = svgEl('g', {});
  for (let i = 0; i < carbons; i += 1) {
    const a = -Math.PI / 2 + (i / carbons) * Math.PI * 2;
    g.append(svgEl('circle', { cx: Math.cos(a) * 28, cy: Math.sin(a) * 28, r: 10, fill, stroke: 'var(--surface)', 'stroke-width': 2 }));
  }
  return g;
}

function glycogenPainter(): Painter {
  const beads: SVGCircleElement[] = [];
  let enzyme!: SVGGElement;
  let badge!: SVGTextElement;
  let note!: SVGTextElement;
  const xs = Array.from({ length: 12 }, (_, i) => 28 + i * 36);

  return {
    viewBox: '0 0 480 260',
    build(svg) {
      svg.append(svgEl('text', { x: 240, y: 28, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 14, 'font-weight': 700 }, 'α-1,4 chain'));
      for (let i = 0; i < 11; i += 1) {
        svg.append(svgEl('line', { x1: xs[i]! + 12, y1: 150, x2: xs[i + 1]! - 12, y2: 150, stroke: 'var(--ink)', 'stroke-width': 2 }));
      }
      xs.forEach((x, i) => {
        const bead = svgEl('circle', { cx: x, cy: 150, r: 12, fill: i === 4 ? 'var(--c)' : 'var(--accent-soft)', stroke: 'var(--accent)', 'stroke-width': 2 });
        beads.push(bead);
        svg.append(bead);
      });
      svg.append(svgEl('line', { x1: xs[4]!, y1: 138, x2: xs[4]!, y2: 78, stroke: 'var(--caution)', 'stroke-width': 2 }));
      svg.append(svgEl('circle', { cx: xs[4]!, cy: 64, r: 12, fill: 'var(--c)', stroke: 'var(--caution)', 'stroke-width': 2 }));
      svg.append(svgEl('text', { x: xs[4]! + 20, y: 68, fill: 'var(--caution)', 'font-size': 13, 'font-weight': 700 }, 'α-1,6'));
      enzyme = svgEl('g', {});
      enzyme.append(
        svgEl('rect', { x: -46, y: -18, width: 92, height: 26, rx: 8, fill: 'var(--accent)' }),
        svgEl('text', { y: -1, 'text-anchor': 'middle', fill: 'var(--on-accent)', 'font-size': 10, 'font-weight': 700 }, 'phosphorylase'),
      );
      svg.append(enzyme);
      badge = svgEl('text', { x: 70, y: 210, fill: 'var(--good)', 'font-size': 16, 'font-weight': 700 });
      note = svgEl('text', { x: 240, y: 240, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 13, 'font-weight': 700 });
      svg.append(badge, note);
    },
    frame({ stage, t }) {
      const e = ease(t);
      const clipped = stage === 0 ? 0 : stage === 4 ? 3 : stage - 1 + (stage < 4 ? e : 0);
      beads.forEach((bead, i) => {
        const fromEnd = 11 - i;
        const gone = fromEnd < clipped;
        bead.setAttribute('opacity', gone ? '0' : '1');
      });
      const endIndex = Math.max(8, 11 - Math.floor(clipped));
      const x = xs[endIndex] ?? xs[11]!;
      enzyme.setAttribute('transform', `translate(${x} 112)`);
      enzyme.setAttribute('opacity', stage === 4 && e > 0.6 ? '0.45' : '1');
      setText(badge, stage >= 1 && stage <= 3 ? 'glucose 1-phosphate' : '');
      setText(note, stage === 4 ? 'four residues remain before the branch' : 'nonreducing end');
    },
  };
}

function krebsPainter(): Painter {
  let highlight!: SVGCircleElement;
  let badge!: SVGTextElement;
  let enzyme!: SVGTextElement;
  const names = ['Citrate', 'Isocitrate', 'α-KG', 'Succinyl-CoA', 'Succinate', 'Fumarate', 'Malate', 'OAA'];

  return {
    viewBox: '0 0 480 320',
    build(svg) {
      svg.append(svgEl('circle', { cx: 240, cy: 168, r: 78, fill: 'none', stroke: 'var(--line)', 'stroke-width': 8 }));
      svg.append(svgEl('text', { x: 240, y: 164, 'text-anchor': 'middle', fill: 'var(--accent)', 'font-size': 13, 'font-weight': 700 }, 'matrix'));
      svg.append(svgEl('text', { x: 240, y: 182, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 11 }, 'one acetyl-CoA'));
      names.forEach((name, i) => {
        const p = polar(i);
        svg.append(svgEl('circle', { cx: p.x, cy: p.y, r: 16, fill: 'var(--surface)', stroke: 'var(--accent)', 'stroke-width': 2 }));
        svg.append(svgEl('text', { x: p.x, y: p.y + 32, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 11, 'font-weight': 700 }, name));
      });
      highlight = svgEl('circle', { r: 20, fill: 'none', stroke: 'var(--caution)', 'stroke-width': 4 });
      badge = svgEl('text', { 'text-anchor': 'middle', fill: 'var(--good)', 'font-size': 14, 'font-weight': 700 });
      enzyme = svgEl('text', { x: 240, y: 304, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 14, 'font-weight': 700 });
      svg.append(highlight, badge, enzyme);
    },
    frame({ stage, t, script }) {
      const e = ease(t);
      const from = polar(stage);
      const to = polar((stage + 1) % 8);
      const x = from.x + (to.x - from.x) * e;
      const y = from.y + (to.y - from.y) * e;
      highlight.setAttribute('cx', x.toFixed(1));
      highlight.setAttribute('cy', y.toFixed(1));
      const badgeText = script.stages[stage]?.badge ?? '';
      setText(badge, badgeText);
      badge.setAttribute('x', x.toFixed(1));
      badge.setAttribute('y', (y - 28).toFixed(1));
      badge.setAttribute('opacity', badgeText ? String(0.25 + 0.75 * e) : '0');
      setText(enzyme, script.stages[stage]?.title ?? '');
    },
  };
}

function polar(i: number): { x: number; y: number } {
  const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
  return { x: 240 + Math.cos(a) * 108, y: 156 + Math.sin(a) * 96 };
}

const PAINTERS: Record<MotionId, Painter> = {
  replication: replicationPainter(),
  ribosome: ribosomePainter(),
  synthase: synthasePainter(),
  etc: etcPainter(),
  glycolysis: glycolysisPainter(),
  glycogen: glycogenPainter(),
  krebs: krebsPainter(),
};
