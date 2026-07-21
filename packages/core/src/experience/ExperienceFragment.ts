import type { Experience } from "./Experience";
import type { PriorityId } from "./PrioritySelection";

/**
 * Reusable contribution to an interpreted Experience.
 * Owns one concern only — not a rule engine.
 */
export type ExperienceFragment = {
  readonly id: string;
  readonly appliesTo: readonly PriorityId[];
  readonly build: () => Partial<Experience>;
};
