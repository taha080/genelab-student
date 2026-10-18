import { figureHeading, type Diagram, type Mark, type Tone } from '../lib/diagrams';
import { el } from './dom';

const NS = 'http://www.w3.org/2000/svg';

const TONE: Record<Tone, string> = {
  ink: 'var(--ink)',
  muted: 'var(--muted)',
  accent: 'var(--accent)',
  soft: 'var(--accent-soft)',
  surface: 'var(--surface)',
  line: 'var(--line)',
  a: 'var(--a)',
  t: 'var(--t)',
  g: 'var(--g)',
  c: 'var(--c)',
  u: 'var(--u)',
  good: 'var(--good)',
  caution: 'var(--caution)',
  bg: 'var(--bg)',
  on: 'var(--on-accent)',
};

let lightbox: HTMLDialogElement | null = null;
let opener: HTMLElement | null = null;
let listening = false;

function ensureLightbox(): HTMLDialogElement {
  if (lightbox) return lightbox;
  lightbox = document.createElement('dialog');
  lightbox.className = 'figure-lightbox';
  document.body.append(lightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox?.close();
  });
  lightbox.addEventListener('close', () => {
    opener?.focus();
    opener = null;
  });
  if (!listening) {
    listening = true;
    window.addEventListener('hashchange', () => lightbox?.close());
  }
  return lightbox;
}

function paint(tone: Tone | undefined, fallback: string): string {
  return tone ? TONE[tone] : fallback;
}

function draw(mark: Mark): SVGElement {
  if (mark.kind === 'text') {
    const node = document.createElementNS(NS, 'text');
    node.setAttribute('x', String(mark.x));
    node.setAttribute('y', String(mark.y));
    node.setAttribute('fill', paint(mark.fill, 'currentColor'));
    node.setAttribute('font-size', String(mark.size ?? 13));
    node.setAttribute('font-weight', String(mark.weight ?? 600));
    node.setAttribute('text-anchor', mark.anchor ?? 'middle');
    node.setAttribute('dominant-baseline', 'middle');
    if (mark.font === 'mono') node.setAttribute('font-family', 'var(--mono)');
    if (mark.rotate) node.setAttribute('transform', `rotate(${mark.rotate} ${mark.x} ${mark.y})`);
    node.textContent = mark.text;
    return node;
  }

  const node = document.createElementNS(NS, mark.kind === 'line' ? 'line' : mark.kind);
  const fill = mark.fill ? TONE[mark.fill] : 'none';
  const stroke = mark.stroke ? TONE[mark.stroke] : 'none';
  node.setAttribute('fill', fill);
  node.setAttribute('stroke', stroke);
  if (mark.stroke) node.setAttribute('stroke-width', String(mark.sw ?? 1.5));
  if (mark.dash) node.setAttribute('stroke-dasharray', mark.dash);
  if (mark.kind === 'rect') {
    node.setAttribute('x', String(mark.x));
    node.setAttribute('y', String(mark.y));
    node.setAttribute('width', String(mark.w));
    node.setAttribute('height', String(mark.h));
    if (mark.rx) node.setAttribute('rx', String(mark.rx));
  } else if (mark.kind === 'line') {
    node.setAttribute('x1', String(mark.x1));
    node.setAttribute('y1', String(mark.y1));
    node.setAttribute('x2', String(mark.x2));
    node.setAttribute('y2', String(mark.y2));
    node.setAttribute('stroke-linecap', 'round');
  } else if (mark.kind === 'circle') {
    node.setAttribute('cx', String(mark.cx));
    node.setAttribute('cy', String(mark.cy));
    node.setAttribute('r', String(mark.r));
  } else if (mark.kind === 'ellipse') {
    node.setAttribute('cx', String(mark.cx));
    node.setAttribute('cy', String(mark.cy));
    node.setAttribute('rx', String(mark.rx));
    node.setAttribute('ry', String(mark.ry));
  } else {
    node.setAttribute('d', mark.d);
  }
  return node;
}

export function renderDiagram(diagram: Diagram): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${diagram.width} ${diagram.height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', diagram.alt);
  svg.classList.add('edu-svg');
  for (const mark of diagram.marks) svg.append(draw(mark));
  return svg;
}

function openFigure(diagram: Diagram, n: number, button: HTMLElement): void {
  const dialog = ensureLightbox();
  if (dialog.open) dialog.close();
  const bar = el('div', 'lightbox-bar');
  const close = el('button', 'ghost', 'Close');
  close.type = 'button';
  close.addEventListener('click', () => dialog.close());
  bar.append(close);
  const stage = el('div', 'lightbox-stage');
  stage.append(renderDiagram(diagram));
  const caption = el('p', 'lightbox-caption', figureHeading(n, diagram.caption));
  dialog.replaceChildren(bar, stage, caption);
  opener = button;
  dialog.showModal();
  close.focus();
}

export function mountFigures(diagrams: readonly Diagram[]): HTMLElement {
  const gallery = el('div', 'figure-gallery');
  diagrams.forEach((diagram, index) => {
    const n = index + 1;
    const fig = el('figure', diagram.wide ? 'edu-figure span-all' : 'edu-figure');
    const button = el('button', 'figure-open');
    button.type = 'button';
    button.setAttribute('aria-label', `Enlarge Figure ${n}. ${diagram.alt}`);
    button.append(renderDiagram(diagram));
    fig.append(button, el('figcaption', undefined, figureHeading(n, diagram.caption)));
    button.addEventListener('click', () => openFigure(diagram, n, button));
    gallery.append(fig);
  });
  return gallery;
}
