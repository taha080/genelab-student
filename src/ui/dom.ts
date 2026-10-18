export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function bases(seq: string, className = 'bases'): HTMLSpanElement {
  const wrap = el('span', className);
  for (const ch of seq) {
    wrap.append(el('span', `base b${ch}`, ch));
  }
  return wrap;
}

export function formatC(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const rounded = Math.round(n * 10) / 10;
  return `${rounded < 0 ? '−' : ''}${Math.abs(rounded).toFixed(1)}°C`;
}

export function formatPercent(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}%`;
}

export function stat(label: string, value: string): HTMLSpanElement {
  const node = el('span', 'stat');
  node.append(el('span', 'stat-label', label), el('b', undefined, value));
  return node;
}

export function copyButton(getText: () => string, label = 'Copy'): HTMLButtonElement {
  const button = el('button', 'ghost tiny', label);
  button.type = 'button';
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getText());
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Copy failed';
    }
    window.setTimeout(() => {
      button.textContent = label;
    }, 1400);
  });
  return button;
}

export function sequenceField(
  id: string,
  labelText: string,
  value: string,
  rows = 5,
): { label: HTMLLabelElement; area: HTMLTextAreaElement } {
  const area = el('textarea', 'seq');
  area.id = id;
  area.rows = rows;
  area.value = value;
  area.spellcheck = false;
  area.autocomplete = 'off';
  area.autocapitalize = 'off';
  area.setAttribute('autocorrect', 'off');
  const label = el('label', 'field');
  label.htmlFor = id;
  label.append(el('span', 'field-label', labelText), area);
  return { label, area };
}

export function labeled(id: string, labelText: string, control: HTMLElement): HTMLLabelElement {
  control.id = id;
  const label = el('label', 'field');
  label.htmlFor = id;
  label.append(el('span', 'field-label', labelText), control);
  return label;
}

export function noteList(notes: { level: string; text: string }[]): HTMLDivElement {
  const wrap = el('div', 'notes');
  if (notes.length === 0) {
    wrap.append(el('p', 'note good', 'No sequence warnings from these classroom checks.'));
    return wrap;
  }
  for (const note of notes) {
    const p = el('p', `note ${note.level}`, note.text);
    wrap.append(p);
  }
  return wrap;
}

export function cleanMessage(uToT: number, skipped: number, truncated: boolean): string {
  const parts: string[] = [];
  if (uToT > 0) parts.push('Uracil was read as thymine.');
  if (skipped > 0) {
    parts.push(
      `${skipped} character${skipped === 1 ? '' : 's'} ${skipped === 1 ? 'was' : 'were'} not DNA and ${skipped === 1 ? 'was' : 'were'} left out.`,
    );
  }
  if (truncated) parts.push('Only the first 3000 bases are shown.');
  return parts.join(' ');
}
