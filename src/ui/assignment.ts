import {
  ASSIGNMENT_LEVELS,
  ASSIGNMENT_TYPES,
  GROQ_KEY_URL,
  WORD_PRESETS,
  blocksFromMarkdown,
  clearGroqKey,
  downloadName,
  inlineFromMarkdown,
  keyProblem,
  markdownToPlain,
  parseWordCount,
  readGroqKey,
  requestProblem,
  writeAssignment,
  writeGroqKey,
  type AssignmentDraft,
  type InlinePart,
  type MdBlock,
} from '../lib/assignment';
import { copyButton, el } from './dom';

interface Session {
  typeLabel: string;
  topic: string;
  requirements: string;
  words: string;
  level: string;
  draft: AssignmentDraft | null;
}

const session: Session = {
  typeLabel: 'Essay',
  topic: '',
  requirements: '',
  words: '800',
  level: 'FSc / higher secondary',
  draft: null,
};

export function mountAssignment(root: HTMLElement): () => void {
  const controller = new AbortController();
  let generation = 0;

  root.append(
    el(
      'p',
      'explain',
      'Pick the assignment type, the topic, what it must contain, the word length, and the level. The page writes a complete draft in English. Read it, check the facts, and rewrite it in your own words before you hand it in.',
    ),
  );

  const form = el('form', 'panel assign-setup');
  form.autocomplete = 'off';
  const keyField = keyPanel();
  const typeInput = textInput('assign-type', 'Assignment type', session.typeLabel, 'Or type your own, such as reflection or literature review');
  const topicInput = textInput('assign-topic', 'Topic', session.topic, 'How the Cori cycle links muscle and liver');
  const requirements = el('textarea', 'assign-text');
  requirements.id = 'assign-requirements';
  requirements.rows = 5;
  requirements.value = session.requirements;
  requirements.placeholder = 'Introduction, the four bypass enzymes, the Cori cycle, and a conclusion';
  const requirementsLabel = el('label', 'field assign-span');
  requirementsLabel.htmlFor = requirements.id;
  requirementsLabel.append(
    el('span', 'field-label', 'Required sections and what it must contain'),
    el('span', 'caption', 'Optional. Leave this blank and the draft chooses sections that fit the type.'),
    requirements,
  );
  const wordsInput = textInput('assign-words', 'Word length', session.words, '800');
  wordsInput.input.inputMode = 'numeric';
  wordsInput.input.autocomplete = 'off';
  const levelInput = textInput('assign-level', 'Level', session.level, 'Or type your own, such as grade 11 or MS');

  insertBeforeInput(typeInput.label, chips(ASSIGNMENT_TYPES.map((item) => item.label), typeInput.input, 'data-type'));
  insertBeforeInput(wordsInput.label, wordChips(wordsInput.input));
  insertBeforeInput(levelInput.label, chips(ASSIGNMENT_LEVELS.map((item) => item.label), levelInput.input, 'data-level'));

  const grid = el('div', 'assign-grid');
  grid.append(wordsInput.label, levelInput.label);

  const actions = el('div', 'row');
  const write = el('button', 'primary', 'Write assignment');
  write.type = 'submit';
  actions.append(write);

  const status = el('p', 'caption');
  status.setAttribute('role', 'status');
  status.hidden = true;
  const error = el('p', 'note poor');
  error.setAttribute('role', 'alert');
  error.hidden = true;

  form.append(
    keyField.block,
    typeInput.label,
    topicInput.label,
    grid,
    requirementsLabel,
    actions,
    status,
    error,
    el(
      'p',
      'caption',
      'Free models: openai/gpt-oss-20b, then openai/gpt-oss-120b if the first one does not answer. No account on this site, and no paid service.',
    ),
  );
  root.append(form);

  const paper = el('article', 'assign-paper');
  paper.hidden = true;
  root.append(paper);

  const syncChips = () => {
    markChips(form, 'data-type', typeInput.input.value);
    markChips(form, 'data-words', wordsInput.input.value.trim());
    markChips(form, 'data-level', levelInput.input.value);
  };
  typeInput.input.addEventListener('input', () => {
    session.typeLabel = typeInput.input.value;
    syncChips();
  });
  topicInput.input.addEventListener('input', () => {
    session.topic = topicInput.input.value;
  });
  wordsInput.input.addEventListener('input', () => {
    session.words = wordsInput.input.value;
    syncChips();
  });
  levelInput.input.addEventListener('input', () => {
    session.level = levelInput.input.value;
    syncChips();
  });
  requirements.addEventListener('input', () => {
    session.requirements = requirements.value;
  });
  syncChips();
  if (session.draft) showDraft(session.draft);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submit();
  });

  async function submit(): Promise<void> {
    error.hidden = true;
    status.hidden = true;
    const key = keyField.input.value;
    const keyError = keyProblem(key);
    if (keyError) {
      showError(keyError);
      keyField.input.focus();
      return;
    }
    const words = parseWordCount(wordsInput.input.value);
    const problem = requestProblem({
      typeLabel: typeInput.input.value,
      topic: topicInput.input.value,
      requirements: requirements.value,
      words,
      level: levelInput.input.value,
    });
    if (problem || words === null) {
      showError(problem ?? 'Enter a word length as a whole number, such as 800.');
      return;
    }
    try {
      writeGroqKey(localStorage, key);
      keyField.saved.textContent = 'A key is saved in this browser.';
    } catch {
      keyField.saved.textContent = 'This browser blocked localStorage, so the key will be forgotten when you leave the page.';
    }

    const ticket = ++generation;
    write.disabled = true;
    write.textContent = 'Writing…';
    form.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.textContent = 'Writing with openai/gpt-oss-20b…';

    const result = await writeAssignment(
      {
        typeLabel: typeInput.input.value.trim(),
        topic: topicInput.input.value.trim(),
        requirements: requirements.value.trim(),
        words,
        level: levelInput.input.value.trim(),
      },
      key.trim(),
      {
        signal: controller.signal,
        onStatus: (message) => {
          if (ticket !== generation) return;
          status.hidden = false;
          status.textContent = message;
        },
      },
    );

    if (ticket !== generation || controller.signal.aborted) return;
    write.disabled = false;
    write.textContent = 'Write assignment';
    form.removeAttribute('aria-busy');
    status.hidden = true;

    if (!result.ok) {
      if (!result.aborted) showError(result.message);
      return;
    }
    session.draft = result.draft;
    showDraft(result.draft);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    paper.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function showError(message: string): void {
    error.hidden = false;
    error.textContent = message;
  }

  function showDraft(draft: AssignmentDraft): void {
    paper.hidden = false;
    paper.replaceChildren();
    const bar = el('div', 'row assign-actions');
    bar.append(
      copyButton(() => markdownToPlain(draft.markdown), 'Copy'),
      downloadButton(downloadName(draft.title, 'txt'), 'text/plain;charset=utf-8', () => markdownToPlain(draft.markdown), 'Download .txt'),
      downloadButton(downloadName(draft.title, 'md'), 'text/markdown;charset=utf-8', () => `${draft.markdown.trim()}\n`, 'Download .md'),
      printButton(draft.title),
    );
    const reminder = el(
      'p',
      'note caution assign-screen',
      'Review this draft and personalize it before you hand it in. Check the facts, the references, and the wording so the work is yours.',
    );
    const modelNote = draft.usedFallback
      ? `Written with ${draft.model}, because openai/gpt-oss-20b did not return an assignment.`
      : `Written with ${draft.model}.`;
    const meta = el('p', 'caption assign-screen', `${modelNote} About ${draft.words.toLocaleString('en-US')} words.`);
    paper.append(bar, reminder, meta);
    if (draft.truncated) {
      paper.append(
        el(
          'p',
          'note caution assign-screen',
          'This draft may be shorter than you asked, because the model hit its length limit. Try again or choose a lower word length.',
        ),
      );
    }
    paper.append(renderBlocks(blocksFromMarkdown(draft.markdown)));
    const printHint = el('p', 'caption assign-screen', 'Print to PDF opens the print dialog. Choose Save as PDF there.');
    paper.append(printHint);
  }

  return () => {
    generation += 1;
    controller.abort();
  };
}

function keyPanel(): { block: HTMLElement; input: HTMLInputElement; saved: HTMLElement } {
  const block = el('div', 'assign-key');
  const input = el('input');
  input.id = 'assign-key';
  input.type = 'password';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.placeholder = 'gsk_…';
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocorrect', 'off');
  let stored = '';
  try {
    stored = readGroqKey(localStorage);
  } catch {
    stored = '';
  }
  input.value = stored;
  const label = el('label', 'field');
  label.htmlFor = input.id;
  label.append(el('span', 'field-label', 'Your free Groq API key'), input);
  const toggle = el('button', 'ghost tiny', 'Show key');
  toggle.type = 'button';
  toggle.addEventListener('click', () => {
    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    toggle.textContent = hidden ? 'Hide key' : 'Show key';
    toggle.setAttribute('aria-pressed', String(hidden));
  });
  const forget = el('button', 'ghost tiny', 'Forget key');
  forget.type = 'button';
  forget.addEventListener('click', () => {
    input.value = '';
    saved.textContent = 'No key is saved in this browser.';
    try {
      clearGroqKey(localStorage);
    } catch {
      saved.textContent = 'This browser blocked localStorage. Clear the field to drop the key.';
    }
  });
  const row = el('div', 'row');
  row.append(toggle, forget);
  const saved = el('p', 'caption', stored ? 'A key is saved in this browser.' : 'No key is saved in this browser.');
  const note = el('p', 'caption assign-note');
  note.append(
    document.createTextNode('Get a free key at '),
    groqLink(),
    document.createTextNode(
      '. Paste it once. It is stored only in localStorage on this browser and is sent only to Groq when you write an assignment. It is never saved on this site.',
    ),
  );
  input.addEventListener('change', () => {
    const value = input.value.trim();
    if (!value) return;
    try {
      writeGroqKey(localStorage, value);
      saved.textContent = 'A key is saved in this browser.';
    } catch {
      saved.textContent = 'This browser blocked localStorage, so the key will be forgotten when you leave the page.';
    }
  });
  block.append(label, row, saved, note);
  return { block, input, saved };
}

function groqLink(): HTMLAnchorElement {
  const anchor = el('a', undefined, 'console.groq.com');
  anchor.href = GROQ_KEY_URL;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  return anchor;
}

function textInput(id: string, labelText: string, value: string, placeholder: string): { label: HTMLLabelElement; input: HTMLInputElement } {
  const input = el('input');
  input.type = 'text';
  input.id = id;
  input.value = value;
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  const label = el('label', 'field');
  label.htmlFor = id;
  label.append(el('span', 'field-label', labelText), input);
  return { label, input };
}

function insertBeforeInput(label: HTMLLabelElement, row: HTMLElement): void {
  const input = label.querySelector('input');
  if (input) label.insertBefore(row, input);
}

function chips(labels: readonly string[], input: HTMLInputElement, kind: 'data-type' | 'data-level'): HTMLElement {
  const row = el('div', 'segment');
  for (const label of labels) {
    const button = el('button', undefined, label);
    button.type = 'button';
    button.setAttribute(kind, label);
    button.addEventListener('click', () => {
      input.value = label;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
    row.append(button);
  }
  return row;
}

function wordChips(input: HTMLInputElement): HTMLElement {
  const row = el('div', 'segment');
  for (const words of WORD_PRESETS) {
    const button = el('button', undefined, String(words));
    button.type = 'button';
    button.dataset.words = String(words);
    button.addEventListener('click', () => {
      input.value = String(words);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    row.append(button);
  }
  return row;
}

function markChips(scope: ParentNode, attribute: string, value: string): void {
  const trimmed = value.trim();
  for (const button of scope.querySelectorAll<HTMLButtonElement>(`button[${attribute}]`)) {
    const on = button.getAttribute(attribute) === trimmed;
    button.classList.toggle('on', on);
    button.setAttribute('aria-pressed', String(on));
  }
}

function downloadButton(filename: string, mime: string, getText: () => string, label: string): HTMLButtonElement {
  const button = el('button', 'ghost tiny', label);
  button.type = 'button';
  button.addEventListener('click', () => {
    const blob = new Blob([getText()], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = el('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  });
  return button;
}

function printButton(title: string): HTMLButtonElement {
  const button = el('button', 'ghost tiny', 'Print to PDF');
  button.type = 'button';
  button.addEventListener('click', () => {
    const previous = document.title;
    document.title = title;
    document.documentElement.dataset.printing = 'assignment';
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      delete document.documentElement.dataset.printing;
      document.title = previous;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
  });
  return button;
}

function renderBlocks(blocks: readonly MdBlock[]): HTMLElement {
  const wrap = el('div', 'assign-body');
  for (const block of blocks) {
    if (block.type === 'hr') {
      wrap.append(el('hr'));
      continue;
    }
    if (block.type === 'h1') {
      wrap.append(heading('h2', block.text));
      continue;
    }
    if (block.type === 'h2' || block.type === 'h3') {
      wrap.append(heading('h3', block.text));
      continue;
    }
    if (block.type === 'pre') {
      const pre = el('pre');
      pre.append(el('code', undefined, block.text));
      wrap.append(pre);
      continue;
    }
    if (block.type === 'p') {
      const paragraph = el('p');
      appendInline(paragraph, block.text);
      wrap.append(paragraph);
      continue;
    }
    const list = el(block.type === 'ol' ? 'ol' : 'ul');
    for (const item of block.items) {
      const li = el('li');
      appendInline(li, item);
      list.append(li);
    }
    wrap.append(list);
  }
  return wrap;
}

function heading(tag: 'h2' | 'h3', text: string): HTMLElement {
  const node = el(tag);
  appendInline(node, text);
  return node;
}

function appendInline(parent: HTMLElement, text: string): void {
  for (const part of inlineFromMarkdown(text)) parent.append(inlineNode(part));
}

function inlineNode(part: InlinePart): HTMLElement {
  if (part.type === 'strong') return el('strong', undefined, part.text);
  if (part.type === 'em') return el('em', undefined, part.text);
  if (part.type === 'code') return el('code', undefined, part.text);
  if (part.type === 'link') {
    const anchor = el('a', undefined, part.text);
    anchor.href = part.href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    return anchor;
  }
  return el('span', undefined, part.text);
}
