import { describe, expect, it } from 'vitest';
import {
  CHAT_HISTORY,
  CHAT_LIMIT,
  applyReaction,
  escapeHtml,
  nameColor,
  prepareChatText,
  readMessages,
  renameNotice,
} from '../src/lib/chat';
import { sanitizeName } from '../src/lib/party';

describe('room chat', () => {
  it('limits length, strips control characters, and escapes HTML', () => {
    expect(prepareChatText('  hello\u0000<script>  ')).toBe('hello <script>');
    expect(prepareChatText('   ')).toBeNull();
    expect(prepareChatText('x'.repeat(CHAT_LIMIT + 40))).toHaveLength(CHAT_LIMIT);
    expect(escapeHtml(`<img src=x onerror="alert(1)"> &`)).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp;');
  });

  it('toggles a reaction and keeps only the recent history', () => {
    expect(applyReaction([], '👍', 'ada').map((item) => item.who)).toEqual([['ada']]);
    expect(applyReaction([{ emoji: '👍', who: ['ada'] }], '👍', 'ada')).toEqual([]);
    expect(applyReaction([], '<img>', 'ada')).toEqual([]);
    const raw = Array.from({ length: CHAT_HISTORY + 5 }, (_, index) => ({
      id: `m${index}`,
      name: 'Ada',
      color: 99,
      at: index,
      text: `note ${index}`,
      system: false,
      reactions: [{ emoji: 'nope', who: ['x'] }, { emoji: '🔥', who: ['ada', 4] }],
    }));
    const messages = readMessages(raw);
    expect(messages).toHaveLength(CHAT_HISTORY);
    expect(messages[0]?.text).toBe(`note ${5}`);
    expect(messages[0]?.color).toBe(99 % 8);
    expect(messages[0]?.reactions).toEqual([{ emoji: '🔥', who: ['ada'] }]);
    expect(nameColor('Ada')).toBeGreaterThanOrEqual(0);
    expect(nameColor('Ada')).toBeLessThan(8);
  });

  it('announces a username change, rejects an unchanged name, and escapes the line', () => {
    expect(renameNotice('Ali', 'Sara')).toBe('Ali is now Sara');
    expect(renameNotice('Ali', 'Ali')).toBeNull();
    const next = sanitizeName(`<img src=x>${'S'.repeat(30)}`);
    expect(next).toHaveLength(16);
    expect(next.startsWith('<img')).toBe(true);
    const notice = renameNotice('Ali', next);
    expect(notice).toBe(`Ali is now ${next}`);
    expect(escapeHtml(notice ?? '')).toBe(`Ali is now ${escapeHtml(next)}`);
    expect(escapeHtml(notice ?? '').includes('<img')).toBe(false);
  });
});
