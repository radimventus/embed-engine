/**
 * PT-004 — System prompt for LLM chat.
 * Provider-neutral. No vendor fields.
 */
export type SystemPrompt = {
  readonly content: string;
};

export function createSystemPrompt(content: string): SystemPrompt {
  return Object.freeze({ content });
}
