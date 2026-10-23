import { describe, expect, it } from 'vitest';
import {
  FALLBACK_MODEL,
  GROQ_CHAT_URL,
  GROQ_KEY_STORAGE,
  PRIMARY_MODEL,
  assignmentTitle,
  blocksFromMarkdown,
  buildMessages,
  clearGroqKey,
  completionBudget,
  downloadName,
  emptyProblem,
  extractAssignmentText,
  inlineFromMarkdown,
  interpretGroqFailure,
  keyProblem,
  markdownToPlain,
  parseWordCount,
  readGroqKey,
  requestBody,
  requestProblem,
  wordCount,
  writeAssignment,
  writeGroqKey,
} from '../src/lib/assignment';
import { STUDY_TOPIC_IDS } from '../src/lib/study';
import type { KeyValueStore } from '../src/lib/progress';

function memory(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

const sample = {
  typeLabel: 'Essay',
  topic: 'How the Cori cycle links muscle and liver',
  requirements: 'Introduction, the four bypass enzymes, and a conclusion.',
  words: 800,
  level: 'FSc / higher secondary',
};

const essay = `# The Cori cycle

## Introduction

Muscle and liver share lactate.

## The cycle

Lactate returns to the liver and becomes glucose.

## Conclusion

The cycle moves a load, at a cost in ATP.

## References

1. A biochemistry textbook chapter on the Cori cycle. Check the edition you use.
`;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('assignment maker', () => {
  it('keeps the Groq key in its own localStorage slot', () => {
    const store = memory();
    expect(readGroqKey(store)).toBe('');
    writeGroqKey(store, '  gsk_example_key_value_12345  ');
    expect(store.getItem(GROQ_KEY_STORAGE)).toBe('gsk_example_key_value_12345');
    expect(readGroqKey(store)).toBe('gsk_example_key_value_12345');
    clearGroqKey(store);
    expect(readGroqKey(store)).toBe('');
    expect(GROQ_KEY_STORAGE).not.toBe('genelab-progress');
  });

  it('rejects a missing key and a word length outside the classroom range', () => {
    expect(keyProblem('')).toMatch(/console\.groq\.com/);
    expect(keyProblem('gsk_short')).toMatch(/too short/);
    expect(keyProblem('gsk_example_key_value_12345')).toBeNull();
    expect(parseWordCount('800')).toBe(800);
    expect(parseWordCount('80.5')).toBeNull();
    expect(requestProblem({ ...sample, words: 80 })).toMatch(/150/);
    expect(requestProblem({ ...sample, words: 5000 })).toMatch(/4,000/);
    expect(requestProblem({ ...sample, topic: 'ab', words: 800 })).toMatch(/topic/);
    expect(requestProblem({ ...sample, typeLabel: '  ', words: 800 })).toMatch(/type/);
    expect(requestProblem({ ...sample, words: 800 })).toBeNull();
  });

  it('asks for an English assignment and never puts the key in the prompt', () => {
    const messages = buildMessages(sample);
    const blob = JSON.stringify(messages);
    expect(blob).toContain('Essay');
    expect(blob).toContain('Cori cycle');
    expect(blob).toContain('four bypass enzymes');
    expect(blob).toContain('800');
    expect(blob).toContain('FSc / higher secondary');
    expect(blob).toContain('# Title');
    expect(blob).toContain('## Introduction');
    expect(blob).toContain('## Conclusion');
    expect(blob).toContain('## References');
    expect(blob).toContain('Do not invent DOIs');
    expect(blob).not.toMatch(/gsk_/);
    expect(blob).not.toMatch(/[\u0600-\u06FF]/);
    const body = requestBody(sample, PRIMARY_MODEL, true);
    expect(body.model).toBe(PRIMARY_MODEL);
    expect(body.reasoning_effort).toBe('low');
    expect(body.reasoning_format).toBe('hidden');
    expect(completionBudget(800)).toBeGreaterThan(800);
    expect(completionBudget(4000)).toBeLessThanOrEqual(8192);
  });

  it('turns Groq errors into a clear next step', () => {
    const invalid = interpretGroqFailure(401, JSON.stringify({ error: { message: 'Invalid API Key', code: 'invalid_api_key' } }), 'gsk_secret');
    expect(invalid.retryWithOtherModel).toBe(false);
    expect(invalid.message).toMatch(/console\.groq\.com/);
    expect(invalid.message).not.toContain('gsk_secret');

    const limited = interpretGroqFailure(429, JSON.stringify({ error: { message: 'Rate limit', code: 'rate_limit_exceeded' } }), 'gsk_secret');
    expect(limited.retryWithOtherModel).toBe(true);
    expect(limited.message).toMatch(/rate limit/i);

    const missing = interpretGroqFailure(404, JSON.stringify({ error: { message: 'model not found', code: 'model_not_found' } }), 'gsk_secret');
    expect(missing.retryWithOtherModel).toBe(true);

    const setting = interpretGroqFailure(
      400,
      JSON.stringify({ error: { message: 'unknown field reasoning_format', code: 'invalid_request_error' } }),
      'gsk_secret',
    );
    expect(setting.dropReasoningFields).toBe(true);
    expect(setting.retryWithOtherModel).toBe(false);
  });

  it('reads the assignment text and ignores an empty reply', () => {
    const extracted = extractAssignmentText(
      JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: `\`\`\`markdown\n${essay}\n\`\`\`` } }] }),
    );
    expect(extracted?.content.startsWith('# The Cori cycle')).toBe(true);
    expect(extracted?.finishReason).toBe('stop');
    expect(extractAssignmentText(JSON.stringify({ choices: [{ message: { content: '   ' } }] }))?.content).toBe('');
    expect(extractAssignmentText('not-json')).toBeNull();
    const parts = extractAssignmentText(
      JSON.stringify({ choices: [{ message: { content: [{ type: 'text', text: '# From parts' }] } }] }),
    );
    expect(parts?.content).toBe('# From parts');
  });

  it('formats a title, plain text, and a safe file name', () => {
    expect(assignmentTitle(essay, 'fallback topic')).toBe('The Cori cycle');
    expect(assignmentTitle('no heading', 'Lactate')).toBe('Lactate');
    const plain = markdownToPlain(essay);
    expect(plain).toContain('The Cori cycle');
    expect(plain).toContain('1. A biochemistry textbook');
    expect(plain).not.toContain('##');
    expect(wordCount(plain)).toBeGreaterThan(20);
    expect(downloadName('The Cori cycle: muscle & liver', 'md')).toBe('the-cori-cycle-muscle-liver.md');
    expect(downloadName('!!!', 'txt')).toBe('assignment.txt');
    const blocks = blocksFromMarkdown(essay);
    expect(blocks[0]).toEqual({ type: 'h1', text: 'The Cori cycle' });
    expect(blocks.some((block) => block.type === 'h2' && block.text === 'References')).toBe(true);
    expect(inlineFromMarkdown('See **ATP** and [Campbell](https://example.edu/campbell).')).toEqual([
      { type: 'text', text: 'See ' },
      { type: 'strong', text: 'ATP' },
      { type: 'text', text: ' and ' },
      { type: 'link', text: 'Campbell', href: 'https://example.edu/campbell' },
      { type: 'text', text: '.' },
    ]);
  });

  it('tries gpt-oss-20b first and falls back to gpt-oss-120b', async () => {
    const calls: { model: string; authorization: string; reasoning: boolean }[] = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      expect(String(url)).toBe(GROQ_CHAT_URL);
      const headers = new Headers(init?.headers);
      const body = JSON.parse(String(init?.body)) as { model: string; reasoning_format?: string; messages: unknown };
      expect(JSON.stringify(body.messages)).not.toContain('gsk_example_key_value_12345');
      calls.push({
        model: body.model,
        authorization: headers.get('Authorization') ?? '',
        reasoning: body.reasoning_format === 'hidden',
      });
      if (body.model === PRIMARY_MODEL) {
        return jsonResponse(503, { error: { message: 'overloaded', code: 'server_error' } });
      }
      return jsonResponse(200, { choices: [{ finish_reason: 'stop', message: { content: essay } }] });
    };
    const result = await writeAssignment(sample, 'gsk_example_key_value_12345', { fetchImpl });
    expect(calls.map((call) => call.model)).toEqual([PRIMARY_MODEL, FALLBACK_MODEL]);
    expect(calls.every((call) => call.authorization === 'Bearer gsk_example_key_value_12345')).toBe(true);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.model).toBe(FALLBACK_MODEL);
      expect(result.draft.usedFallback).toBe(true);
      expect(result.draft.title).toBe('The Cori cycle');
      expect(result.draft.truncated).toBe(false);
    }
  });

  it('does not spend a second request when the key is rejected', async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      return jsonResponse(401, { error: { message: 'Invalid API Key', code: 'invalid_api_key' } });
    };
    const result = await writeAssignment(sample, 'gsk_example_key_value_12345', { fetchImpl });
    expect(calls).toBe(1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/console\.groq\.com/);
  });

  it('retries the same model once when a reasoning field is rejected, then stops if the key is the problem', async () => {
    const formats: (string | undefined)[] = [];
    const fetchImpl: typeof fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { reasoning_format?: string };
      formats.push(body.reasoning_format);
      if (body.reasoning_format) {
        return jsonResponse(400, { error: { message: 'unknown field reasoning_format' } });
      }
      return jsonResponse(401, { error: { message: 'Invalid API Key', code: 'invalid_api_key' } });
    };
    const result = await writeAssignment(sample, 'gsk_example_key_value_12345', { fetchImpl });
    expect(formats).toEqual(['hidden', undefined]);
    expect(result.ok).toBe(false);
  });

  it('reports an empty assignment after both models', async () => {
    const fetchImpl: typeof fetch = async () => jsonResponse(200, { choices: [{ message: { content: '' } }] });
    const result = await writeAssignment(sample, 'gsk_example_key_value_12345', { fetchImpl });
    expect(result).toEqual({ ok: false, message: emptyProblem() });
  });

  it('leaves the eighteen study topics untouched', () => {
    expect(STUDY_TOPIC_IDS).toHaveLength(18);
    expect(STUDY_TOPIC_IDS).toContain('biomolecules');
    expect(STUDY_TOPIC_IDS).toContain('health');
  });
});
