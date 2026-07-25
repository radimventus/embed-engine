export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
};

/** Non-semantic chrome while AIService processes a turn (PT-011). */
export const AI_LOADING_RESPONSE = 'Přemýšlím…';

export function formatMessageTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function createMessageId(): string {
  return crypto.randomUUID();
}
