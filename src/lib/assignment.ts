/**
 * AI Assignment Maker. The browser calls Groq with a key the visitor pastes.
 * The key lives in localStorage only. Nothing in this file is a secret.
 */

import type { KeyValueStore } from './progress';

export const GROQ_KEY_STORAGE = 'genelab-groq-key';
export const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const PRIMARY_MODEL = 'openai/gpt-oss-20b';
export const FALLBACK_MODEL = 'openai/gpt-oss-120b';
export const GROQ_KEY_URL = 'https://console.groq.com/keys';

export const ASSIGNMENT_TYPES = [
  { id: 'essay', label: 'Essay' },
  { id: 'lab-report', label: 'Lab report' },
  { id: 'research-summary', label: 'Research summary' },
  { id: 'case-study', label: 'Case study' },
  { id: 'qa', label: 'Q&A' },
  { id: 'presentation', label: 'Presentation outline' },
] as const;

export const ASSIGNMENT_LEVELS = [
  { id: 'fsc', label: 'FSc / higher secondary' },
  { id: 'bs', label: 'BS / early university' },
  { id: 'college', label: 'General college' },
] as const;

export const WORD_PRESETS = [300, 500, 800, 1200, 2000] as const;

const MIN_WORDS = 150;
const MAX_WORDS = 4000;

export interface AssignmentRequest {
  typeLabel: string;
  topic: string;
  requirements: string;
  words: number;
  level: string;
}

export interface AssignmentDraft {
  markdown: string;
  title: string;
  model: string;
  usedFallback: boolean;
  truncated: boolean;
  words: number;
}

export type AssignmentResult =
  | { ok: true; draft: AssignmentDraft }
  | { ok: false; message: string; aborted?: boolean };

export interface GroqFailure {
  message: string;
  retryWithOtherModel: boolean;
  dropReasoningFields: boolean;
}

type ChatMessage = { role: 'system' | 'user'; content: string };

export function readGroqKey(store: KeyValueStore): string {
  try {
    return (store.getItem(GROQ_KEY_STORAGE) ?? '').trim();
  } catch {
    return '';
  }
}

export function writeGroqKey(store: KeyValueStore, key: string): void {
  store.setItem(GROQ_KEY_STORAGE, key.trim());
}

export function clearGroqKey(store: KeyValueStore): void {
  store.removeItem(GROQ_KEY_STORAGE);
}

export function keyProblem(key: string): string | null {
  const trimmed = key.trim();
  if (!trimmed) {
    return 'Paste your free Groq API key. Create one at console.groq.com. It stays in this browser.';
  }
  if (/\s/.test(trimmed)) {
    return 'The key contains a space. Paste only the key, with no extra words.';
  }
  if (trimmed.length < 20) {
    return 'That key looks too short. Copy the full key from console.groq.com.';
  }
  return null;
}

export function parseWordCount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value)) return null;
  return value;
}

export function requestProblem(input: {
  typeLabel: string;
  topic: string;
  requirements: string;
  words: number | null;
  level: string;
}): string | null {
  const typeLabel = input.typeLabel.trim();
  const topic = input.topic.trim();
  const level = input.level.trim();
  if (!typeLabel) return 'Choose an assignment type, or type your own.';
  if (typeLabel.length > 80) return 'The assignment type is too long. Keep it under 80 characters.';
  if (topic.length < 3) return 'Add a topic of at least a few words.';
  if (topic.length > 300) return 'The topic is too long. Keep it under 300 characters.';
  if (input.requirements.trim().length > 2000) {
    return 'The required sections are too long. Keep them under 2,000 characters.';
  }
  if (input.words === null) return 'Enter a word length as a whole number, such as 800.';
  if (input.words < MIN_WORDS || input.words > MAX_WORDS) {
    return `Set a word length between ${MIN_WORDS} and ${MAX_WORDS.toLocaleString('en-US')}.`;
  }
  if (!level) return 'Choose a level, or type your own.';
  if (level.length > 80) return 'The level is too long. Keep it under 80 characters.';
  return null;
}

export function completionBudget(words: number): number {
  const output = Math.ceil(words * 1.6) + 500;
  return Math.min(8192, output + 700);
}

export function buildMessages(input: AssignmentRequest): ChatMessage[] {
  const requirements = input.requirements.trim();
  const shape = shapeHint(input.typeLabel);
  return [
    {
      role: 'system',
      content: [
        'You write classroom assignments in clear English.',
        'The student will review the draft, check every fact, and rewrite it in their own words before handing it in.',
        'Write only the assignment. No preamble, no note to the teacher, and no mention that an AI wrote it.',
        'Use Markdown, and do not wrap the assignment in a code fence.',
        'Start with one line: # Title',
        'Then a section headed ## Introduction.',
        'Then the headed sections the assignment needs, each as ## Heading.',
        'Then ## Conclusion.',
        'Then ## References.',
        'The References section is a short numbered list of suggestions the student should check, such as a textbook chapter or a well-known public source.',
        'Do not invent DOIs, volume numbers, page numbers, or quotations.',
        'Do not present a suggestion as if you verified it.',
        `Aim for about ${input.words} words in the body. The title and the reference list do not count. Stay within about 15 percent of that length.`,
        'Match the requested level. Define a term the student at that level would not already know.',
        'Follow the required sections. If none were given, choose sections that fit the assignment type.',
        'Stay accurate. If a fact is uncertain, say so in plain language instead of inventing a number.',
        'This is a study draft, not a laboratory protocol and not clinical advice. Describe any method in a few classroom sentences, without reagent amounts, temperatures, or steps to carry out at a bench.',
        'Do not include HTML.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `Assignment type: ${input.typeLabel.trim()}`,
        `Level: ${input.level.trim()}`,
        `Topic: ${input.topic.trim()}`,
        `Approximate body length: ${input.words} words`,
        requirements
          ? `Required sections and what the assignment must contain:\n${requirements}`
          : 'Required sections: none were specified. Choose sensible sections for this assignment type.',
        shape,
      ].join('\n\n'),
    },
  ];
}

function shapeHint(typeLabel: string): string {
  const folded = typeLabel.trim().toLowerCase();
  if (folded.includes('presentation') || folded.includes('outline') || folded === 'slides') {
    return 'Write this as a presentation outline. Use a slide heading for each section and a short speaker note under it. Still include an introduction, a conclusion, and reference suggestions.';
  }
  if (folded === 'q&a' || folded.includes('question')) {
    return 'Write this as questions and developed answers. Number the questions. Still include a short introduction, a conclusion, and reference suggestions.';
  }
  if (folded.includes('lab')) {
    return 'Write this as a lab report with aim, background, a short classroom description of the method, results, and discussion, unless the required sections say otherwise. Do not invent measurements. If no data was provided, use clearly labelled sample observations and say they are sample figures for study.';
  }
  if (folded.includes('case')) {
    return 'Write this as a case study: a short case, the questions it raises, an analysis in headed sections, and a conclusion. Still include reference suggestions.';
  }
  if (folded.includes('summary') || folded.includes('research')) {
    return 'Write this as a research summary: what the question is, what the main findings are, and why they matter. Still include an introduction, a conclusion, and reference suggestions.';
  }
  return 'Write this as continuous prose with a title, an introduction, headed sections, a conclusion, and reference suggestions.';
}

export function requestBody(input: AssignmentRequest, model: string, includeReasoning: boolean): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    messages: buildMessages(input),
    temperature: 0.6,
    max_completion_tokens: completionBudget(input.words),
    stream: false,
  };
  if (includeReasoning) {
    body.reasoning_effort = 'low';
    body.reasoning_format = 'hidden';
  }
  return body;
}

interface ParsedError {
  message: string;
  code: string;
}

function parsedError(bodyText: string): ParsedError {
  try {
    const parsed: unknown = JSON.parse(bodyText);
    if (!parsed || typeof parsed !== 'object') return { message: '', code: '' };
    const error = (parsed as { error?: unknown }).error;
    if (!error || typeof error !== 'object') return { message: '', code: '' };
    const message = (error as { message?: unknown }).message;
    const code = (error as { code?: unknown }).code;
    return {
      message: typeof message === 'string' ? message : '',
      code: typeof code === 'string' ? code : '',
    };
  } catch {
    return { message: '', code: '' };
  }
}

function sanitizeDetail(message: string, apiKey: string): string {
  let cleaned = message.replace(/\s+/g, ' ').trim();
  if (apiKey) cleaned = cleaned.split(apiKey).join('…');
  if (cleaned.length > 220) cleaned = `${cleaned.slice(0, 217)}…`;
  return cleaned;
}

export function interpretGroqFailure(status: number, bodyText: string, apiKey: string): GroqFailure {
  const parsed = parsedError(bodyText);
  const code = parsed.code.toLowerCase();
  const detail = sanitizeDetail(parsed.message, apiKey);
  const raw = parsed.message;

  if (status === 401 || status === 403 || code === 'invalid_api_key') {
    return {
      message: 'Groq did not accept this API key. Open console.groq.com, create a free key, and paste the whole key.',
      retryWithOtherModel: false,
      dropReasoningFields: false,
    };
  }

  if (status === 429 || code.includes('rate_limit')) {
    return {
      message: 'Groq’s free rate limit was reached for this key. Wait a minute and try again. If it keeps happening, today’s free limit may be used up.',
      retryWithOtherModel: true,
      dropReasoningFields: false,
    };
  }

  if ((status === 400 || status === 422) && /reasoning_effort|reasoning_format|include_reasoning/i.test(raw)) {
    return {
      message: 'Groq rejected a reasoning setting. Retrying without it.',
      retryWithOtherModel: false,
      dropReasoningFields: true,
    };
  }

  if (status === 413 || /context length|maximum context|too many tokens|request too large/i.test(raw)) {
    return {
      message: 'This request is too long for the model. Shorten the topic or the required sections, or choose a lower word length.',
      retryWithOtherModel: false,
      dropReasoningFields: false,
    };
  }

  const modelProblem = status === 404 || code.includes('model') || ((status === 400 || status === 422) && /model/i.test(raw));
  if (modelProblem) {
    return {
      message: detail ? `Groq could not use this model (${detail}).` : 'Groq could not use this model.',
      retryWithOtherModel: true,
      dropReasoningFields: false,
    };
  }

  if (status === 408 || status >= 500) {
    return {
      message: `Groq had a problem answering (HTTP ${status}).`,
      retryWithOtherModel: true,
      dropReasoningFields: false,
    };
  }

  return {
    message: detail
      ? `Groq could not write the assignment (HTTP ${status}): ${detail}`
      : `Groq could not write the assignment (HTTP ${status}).`,
    retryWithOtherModel: false,
    dropReasoningFields: false,
  };
}

export function networkProblem(): string {
  return 'The browser could not reach Groq. Check your internet connection and try again.';
}

export function timeoutProblem(): string {
  return 'Groq took too long to answer. Try again, or choose a shorter word length.';
}

export function emptyProblem(): string {
  return 'Groq returned no assignment text. Try again, or choose a shorter word length.';
}

export function unreadableProblem(): string {
  return 'Groq sent a response this page could not read. Try again.';
}

interface Extracted {
  content: string;
  finishReason: string | null;
}

export function extractAssignmentText(bodyText: string): Extracted | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const choices = (parsed as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== 'object') return null;
  const choice = choices[0] as { finish_reason?: unknown; message?: unknown };
  const message = choice.message;
  if (!message || typeof message !== 'object') return null;
  const content = (message as { content?: unknown }).content;
  let text = '';
  if (typeof content === 'string') text = content;
  else if (Array.isArray(content)) {
    text = content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && typeof (part as { text?: unknown }).text === 'string') {
          return (part as { text: string }).text;
        }
        return '';
      })
      .join('');
  }
  const finish = choice.finish_reason;
  return {
    content: unwrapFence(text),
    finishReason: typeof finish === 'string' ? finish : null,
  };
}

export function unwrapFence(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:markdown|md)?[^\n]*\n([\s\S]*?)\n```$/.exec(trimmed);
  return (fenced?.[1] ?? trimmed).trim();
}

export function assignmentTitle(markdown: string, fallback: string): string {
  const match = /^#\s+(.+)$/m.exec(markdown);
  const title = match?.[1]?.replace(/[*_`[\]]/g, '').trim() ?? '';
  if (title) return title;
  const topic = fallback.trim();
  return topic || 'Assignment';
}

export function downloadName(title: string, extension: 'txt' | 'md'): string {
  const stem = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${stem || 'assignment'}.${extension}`;
}

export type MdBlock =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'pre'; text: string }
  | { type: 'hr' };

export type InlinePart =
  | { type: 'text' | 'strong' | 'em' | 'code'; text: string }
  | { type: 'link'; text: string; href: string };

function isBlockStart(line: string): boolean {
  return (
    /^#{1,6}\s+/.test(line) ||
    /^```/.test(line.trim()) ||
    /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim()) ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line)
  );
}

export function blocksFromMarkdown(source: string): MdBlock[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: MdBlock[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (line.trim() === '') {
      index += 1;
      continue;
    }
    if (line.trim().startsWith('```')) {
      const buffer: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? '').trim().startsWith('```')) {
        buffer.push(lines[index] ?? '');
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: 'pre', text: buffer.join('\n') });
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      index += 1;
      continue;
    }
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading?.[1] && heading[2]) {
      const text = heading[2].trim();
      const level = Math.min(heading[1].length, 3);
      if (level === 1) blocks.push({ type: 'h1', text });
      else if (level === 2) blocks.push({ type: 'h2', text });
      else blocks.push({ type: 'h3', text });
      index += 1;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\s*[-*]\s+/, '').trim());
        index += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\s*\d+[.)]\s+/, '').trim());
        index += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }
    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && (lines[index] ?? '').trim() !== '' && !isBlockStart(lines[index] ?? '')) {
      paragraph.push((lines[index] ?? '').trim());
      index += 1;
    }
    blocks.push({ type: 'p', text: paragraph.join(' ') });
  }
  return blocks;
}

export function inlineFromMarkdown(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let index = 0;
  let plain = '';
  const pushPlain = () => {
    if (!plain) return;
    parts.push({ type: 'text', text: plain });
    plain = '';
  };
  while (index < text.length) {
    if (text.startsWith('**', index)) {
      const end = text.indexOf('**', index + 2);
      if (end > index + 2) {
        pushPlain();
        parts.push({ type: 'strong', text: text.slice(index + 2, end) });
        index = end + 2;
        continue;
      }
    }
    if (text[index] === '`') {
      const end = text.indexOf('`', index + 1);
      if (end > index + 1) {
        pushPlain();
        parts.push({ type: 'code', text: text.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }
    if (text[index] === '[') {
      const link = /^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/.exec(text.slice(index));
      if (link?.[1] && link[2]) {
        pushPlain();
        parts.push({ type: 'link', text: link[1], href: link[2] });
        index += link[0].length;
        continue;
      }
    }
    if (text[index] === '*' && text[index + 1] !== '*') {
      const end = text.indexOf('*', index + 1);
      if (end > index + 1) {
        pushPlain();
        parts.push({ type: 'em', text: text.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }
    plain += text[index];
    index += 1;
  }
  pushPlain();
  return parts;
}

function inlinePlain(text: string): string {
  return inlineFromMarkdown(text)
    .map((part) => (part.type === 'link' ? `${part.text} (${part.href})` : part.text))
    .join('');
}

export function markdownToPlain(markdown: string): string {
  const parts: string[] = [];
  for (const block of blocksFromMarkdown(markdown)) {
    if (block.type === 'hr') continue;
    if (block.type === 'h1' || block.type === 'h2' || block.type === 'h3' || block.type === 'p') {
      parts.push(inlinePlain(block.text));
      continue;
    }
    if (block.type === 'pre') {
      parts.push(block.text);
      continue;
    }
    parts.push(
      block.items
        .map((item, itemIndex) => `${block.type === 'ol' ? `${itemIndex + 1}. ` : '- '}${inlinePlain(item)}`)
        .join('\n'),
    );
  }
  const body = parts.join('\n\n').trim();
  return body ? `${body}\n` : '';
}

export function wordCount(text: string): number {
  return text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
}

export interface WriteOptions {
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
  onStatus?: (message: string) => void;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

async function callModel(
  input: AssignmentRequest,
  apiKey: string,
  model: string,
  includeReasoning: boolean,
  fetchImpl: typeof fetch,
  signal: AbortSignal,
): Promise<{ response: Response } | { thrown: unknown }> {
  try {
    const response = await fetchImpl(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody(input, model, includeReasoning)),
      signal,
    });
    return { response };
  } catch (thrown) {
    return { thrown };
  }
}

export async function writeAssignment(
  input: AssignmentRequest,
  apiKey: string,
  options: WriteOptions = {},
): Promise<AssignmentResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 120_000;
  const external = options.signal;
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastMessage = emptyProblem();

  for (const model of models) {
    let includeReasoning = true;
    options.onStatus?.(
      model === PRIMARY_MODEL
        ? `Writing with ${model}…`
        : `${PRIMARY_MODEL} did not return an assignment. Trying ${FALLBACK_MODEL}…`,
    );
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const timeout = AbortSignal.timeout(timeoutMs);
      const signal = external ? AbortSignal.any([external, timeout]) : timeout;
      const outcome = await callModel(input, apiKey.trim(), model, includeReasoning, fetchImpl, signal);
      if ('thrown' in outcome) {
        if (external?.aborted) return { ok: false, message: '', aborted: true };
        if (isAbortError(outcome.thrown) || timeout.aborted) {
          lastMessage = timeoutProblem();
          break;
        }
        lastMessage = networkProblem();
        break;
      }
      let bodyText = '';
      try {
        bodyText = await outcome.response.text();
      } catch (error) {
        if (external?.aborted) return { ok: false, message: '', aborted: true };
        if (isAbortError(error) || timeout.aborted) {
          lastMessage = timeoutProblem();
          break;
        }
        lastMessage = networkProblem();
        break;
      }
      if (!outcome.response.ok) {
        const failure = interpretGroqFailure(outcome.response.status, bodyText, apiKey);
        lastMessage = failure.message;
        if (failure.dropReasoningFields && includeReasoning) {
          includeReasoning = false;
          continue;
        }
        if (failure.retryWithOtherModel) break;
        return { ok: false, message: failure.message };
      }
      const extracted = extractAssignmentText(bodyText);
      if (!extracted) {
        lastMessage = unreadableProblem();
        break;
      }
      if (!extracted.content) {
        lastMessage = emptyProblem();
        break;
      }
      const plain = markdownToPlain(extracted.content);
      return {
        ok: true,
        draft: {
          markdown: extracted.content,
          title: assignmentTitle(extracted.content, input.topic),
          model,
          usedFallback: model !== PRIMARY_MODEL,
          truncated: extracted.finishReason === 'length',
          words: wordCount(plain),
        },
      };
    }
  }

  return { ok: false, message: lastMessage };
}
