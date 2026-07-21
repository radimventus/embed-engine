import type { Experience } from "./Experience";
import { resolveInterpretationRule } from "./interpretationRules";
import type { PrioritySelection } from "./PrioritySelection";

/**
 * Object reference for Experience composition.
 * Identity only — Object Package payload is never mutated here.
 */
export type ExperienceObjectRef = {
  readonly id: string;
};

export type ExperienceComposeInput = {
  readonly object: ExperienceObjectRef;
  readonly priorities: PrioritySelection;
};

/**
 * Deterministic Experience from Object identity + PrioritySelection.
 * Interpretation rules are hardcoded; priorities select the lens only.
 */
export function composeExperience(input: ExperienceComposeInput): Experience {
  const rule = resolveInterpretationRule(input.priorities.selected);

  return Object.freeze({
    id: `experience.${input.object.id}.${rule.key}`,
    title: rule.title,
    summary: rule.summary,
    focus: rule.focus,
    recommendations: rule.recommendations,
    evidence: rule.evidence,
    concerns: rule.concerns,
    confidence: rule.confidence,
  });
}

export type ExperienceComposer = (
  input: ExperienceComposeInput,
) => Experience;

export function createExperienceComposer(): ExperienceComposer {
  return composeExperience;
}
