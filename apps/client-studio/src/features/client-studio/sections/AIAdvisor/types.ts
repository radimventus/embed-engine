export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
};

/** Non-semantic system chrome — not an interpretation claim. */
export const AI_PLACEHOLDER_RESPONSE =
  'AI odpověď bude implementována v další fázi.';

export function formatMessageTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function createMessageId(): string {
  return crypto.randomUUID();
}
