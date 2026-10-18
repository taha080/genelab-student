import '@fontsource/figtree/latin-400.css';
import '@fontsource/figtree/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/newsreader/latin-500.css';
import '@fontsource/newsreader/latin-500-italic.css';
import './styles.css';
import { TRACKED_TOOLS, touchTool, type TrackedTool } from './lib/progress';
import { mountAnimation } from './ui/animate';
import { mountBiochem } from './ui/biochem';
import { mountCodonTable } from './ui/codontable';
import { mountCrispr } from './ui/crispr';
import { mountDogma } from './ui/dogma';
import { el } from './ui/dom';
import { mountMutations } from './ui/mutations';
import { mountPrimers } from './ui/primers';
import { mountProgress } from './ui/progress';
import { mountQuiz } from './ui/quiz';
import { mountSequences } from './ui/sequences';

const TOOLS = [
  { id: 'progress', hash: 'progress', label: 'Progress', mount: mountProgress },
  { id: 'dogma', hash: 'central-dogma', label: 'Central dogma', mount: mountDogma },
  { id: 'crispr', hash: 'crispr', label: 'CRISPR', mount: mountCrispr },
  { id: 'primers', hash: 'primers', label: 'Primers', mount: mountPrimers },
  { id: 'mutations', hash: 'mutations', label: 'Mutations', mount: mountMutations },
  { id: 'codon', hash: 'codon-table', label: 'Codon table', mount: mountCodonTable },
  { id: 'animation', hash: 'animation', label: 'Animation', mount: mountAnimation },
  { id: 'sequences', hash: 'sequences', label: 'Sequences', mount: mountSequences },
  { id: 'biochem', hash: 'biochem', label: 'Biochemistry', mount: mountBiochem },
  { id: 'quiz', hash: 'quiz', label: 'Quiz', mount: mountQuiz },
] as const;

type ToolId = (typeof TOOLS)[number]['id'];

const app = document.querySelector('#app');
if (!app) throw new Error('Missing #app');

const shell = el('div', 'shell');
const top = el('header', 'top');
const brand = el('div', 'brand');
brand.append(mark(), titleBlock());
const theme = el('button', 'ghost theme', 'Dark mode');
theme.type = 'button';
theme.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});
top.append(brand, theme);

const tabs = el('nav', 'tabs');
tabs.setAttribute('aria-label', 'Tools');
const workspace = el('main');
workspace.id = 'workspace';
const footer = el('footer', 'site-footer');
const credit = el('p');
credit.append(document.createTextNode('Built by '), link('Taha Ahsan', 'https://www.linkedin.com/in/taha-ahsan-832475270/'));
const links = el('p', 'footer-links');
links.append(
  link('LinkedIn', 'https://www.linkedin.com/in/taha-ahsan-832475270/'),
  el('span', undefined, ' · '),
  link('GitHub', 'https://github.com/taha080'),
);
footer.append(
  credit,
  links,
  el('p', 'fine', 'A static portfolio project. Sequences stay in this browser. Estimates are for teaching, not for a clinical design.'),
);

shell.append(top, tabs, workspace, footer);
app.append(shell);

const tabButtons = new Map<ToolId, HTMLButtonElement>();
for (const tool of TOOLS) {
  const button = el('button', undefined, tool.label);
  button.type = 'button';
  button.addEventListener('click', () => {
    location.hash = tool.hash;
  });
  tabs.append(button);
  tabButtons.set(tool.id, button);
}

let cleanup = () => {};

function show(id: ToolId) {
  const tool = TOOLS.find((item) => item.id === id) ?? TOOLS[0];
  cleanup();
  workspace.replaceChildren();
  const heading = el('h2', 'sr-only', tool.label);
  workspace.append(heading);
  cleanup = tool.mount(workspace);
  document.title = `GeneLab — ${tool.label}`;
  if (isTracked(tool.id)) {
    try {
      touchTool(localStorage, tool.id);
    } catch {
      // A locked-down browser can refuse localStorage. The tool still works.
    }
  }
  for (const item of TOOLS) {
    const button = tabButtons.get(item.id);
    if (!button) continue;
    const on = item.id === tool.id;
    if (on) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
    if (on) button.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }
}

function toolFromHash(): ToolId {
  const hash = location.hash.replace('#', '');
  return TOOLS.find((tool) => tool.hash === hash)?.id ?? 'dogma';
}

function isTracked(id: string): id is TrackedTool {
  return (TRACKED_TOOLS as readonly string[]).includes(id);
}

window.addEventListener('hashchange', () => show(toolFromHash()));
applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
show(toolFromHash());

function applyTheme(themeName: 'light' | 'dark') {
  document.documentElement.dataset.theme = themeName;
  localStorage.setItem('genelab-theme', themeName);
  const dark = themeName === 'dark';
  theme.textContent = dark ? 'Light mode' : 'Dark mode';
  theme.setAttribute('aria-pressed', String(dark));
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', dark ? '#101614' : '#e7e1d6');
}

function titleBlock(): HTMLElement {
  const block = el('div');
  block.append(el('p', 'eyebrow', 'Student bench'));
  const heading = el('h1');
  heading.append(document.createTextNode('Gene'), el('span', undefined, 'Lab'));
  block.append(heading, el('p', 'tagline', 'DNA, enzymes, and metabolism — worked through on one bench.'));
  return block;
}

function link(text: string, href: string): HTMLAnchorElement {
  const anchor = el('a', undefined, text);
  anchor.href = href;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  return anchor;
}

function mark(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('class', 'mark');
  svg.setAttribute('aria-hidden', 'true');
  const a = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  a.setAttribute('d', 'M8 4c8 4 8 8 0 12s-8 8 0 12');
  const b = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  b.setAttribute('d', 'M16 4c8 4 8 8 0 12s-8 8 0 12');
  for (const path of [a, b]) {
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.6');
    path.setAttribute('stroke-linecap', 'round');
    svg.append(path);
  }
  b.setAttribute('opacity', '0.55');
  return svg;
}
