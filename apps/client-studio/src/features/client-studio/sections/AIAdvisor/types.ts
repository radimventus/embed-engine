export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
};

export const AI_PLACEHOLDER_RESPONSE =
  'AI odpověď bude implementována v další fázi.';

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'initial-1',
    role: 'assistant',
    text: 'Z prodeje 4–6 jednotek získáte zisk, který pokryje náklady na dům.',
    time: '10:40',
  },
  {
    id: 'initial-2',
    role: 'user',
    text: 'Tento dům je i pro úzký pozemek?',
    time: '10:42',
  },
  {
    id: 'initial-3',
    role: 'assistant',
    text: 'Bezproblémový přístup, studie na míru a fotorealistické 3D vizualizace jsou součástí naší nabídky.',
    time: '10:43',
  },
];

export function formatMessageTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function createMessageId(): string {
  return crypto.randomUUID();
}
