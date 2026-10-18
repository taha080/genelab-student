/** Plain-text chat rules for a live room. Messages are escaped by rendering as text. */

export const CHAT_LIMIT = 200;
export const CHAT_HISTORY = 40;
export const CHAT_EMOJIS = ['👍', '✅', '😂', '🔥', '👏'] as const;
export type ChatEmoji = (typeof CHAT_EMOJIS)[number];

export interface Reaction {
  emoji: string;
  who: string[];
}

export interface ChatMessage {
  id: string;
  name: string;
  color: number;
  at: number;
  text: string;
  system: boolean;
  reactions: Reaction[];
}

export function prepareChatText(raw: string): string | null {
  const text = raw.replace(/[\u0000-\u001F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, CHAT_LIMIT);
  return text || null;
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function nameColor(name: string): number {
  let hash = 0;
  for (const character of name) hash = (hash * 33 + character.charCodeAt(0)) >>> 0;
  return hash % 8;
}

export function formatChatTime(at: number): string {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export function isChatEmoji(emoji: string): emoji is ChatEmoji {
  return (CHAT_EMOJIS as readonly string[]).includes(emoji);
}

/** System line when a nickname changes. The same name produces no line. */
export function renameNotice(previous: string, next: string): string | null {
  if (previous === next) return null;
  return `${previous} is now ${next}`;
}

export function applyReaction(reactions: readonly Reaction[], emoji: string, who: string): Reaction[] {
  if (!isChatEmoji(emoji) || !who) return reactions.map((item) => ({ emoji: item.emoji, who: [...item.who] }));
  const next = reactions.map((item) => ({ emoji: item.emoji, who: [...item.who] }));
  const row = next.find((item) => item.emoji === emoji) ?? { emoji, who: [] as string[] };
  if (!next.includes(row)) next.push(row);
  row.who = row.who.includes(who) ? row.who.filter((id) => id !== who) : [...row.who, who];
  return next.filter((item) => item.who.length > 0);
}

export function readMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const messages: ChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const message = item as Partial<ChatMessage>;
    if (typeof message.id !== 'string' || typeof message.text !== 'string' || typeof message.at !== 'number') continue;
    const text = message.text.slice(0, CHAT_LIMIT);
    if (!text) continue;
    messages.push({
      id: message.id.slice(0, 40),
      name: typeof message.name === 'string' ? message.name.slice(0, 16) : '',
      color: typeof message.color === 'number' ? Math.abs(message.color) % 8 : nameColor(typeof message.name === 'string' ? message.name : ''),
      at: message.at,
      text,
      system: message.system === true,
      reactions: readReactions(message.reactions),
    });
  }
  return messages.slice(-CHAT_HISTORY);
}

function readReactions(raw: unknown): Reaction[] {
  if (!Array.isArray(raw)) return [];
  const reactions: Reaction[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const reaction = item as Partial<Reaction>;
    if (typeof reaction.emoji !== 'string' || !isChatEmoji(reaction.emoji) || !Array.isArray(reaction.who)) continue;
    const who = reaction.who.filter((id): id is string => typeof id === 'string').slice(0, 12);
    if (who.length) reactions.push({ emoji: reaction.emoji, who });
  }
  return reactions;
}
