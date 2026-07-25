/**
 * PT-005 — SystemPromptFactory.
 * System prompt lives here — never hardcoded in a Provider.
 */

import { createSystemPrompt, type SystemPrompt } from "../models/SystemPrompt";

export const DEFAULT_SYSTEM_PROMPT_LINES = [
  "Jsi AI poradce partnera.",
  "Nevymýšlej informace.",
  "Odpovídej pouze z poskytnutého kontextu.",
  "Pokud odpověď neznáš, přiznej to.",
] as const;

export type SystemPromptFactoryOptions = {
  readonly lines?: readonly string[];
};

export function createSystemPromptFactory(
  options: SystemPromptFactoryOptions = {},
): SystemPrompt {
  const lines = options.lines ?? DEFAULT_SYSTEM_PROMPT_LINES;
  return createSystemPrompt(lines.join("\n"));
}
