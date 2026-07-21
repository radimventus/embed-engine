import type { Experience } from "./Experience";
import {
  LENS_KEY_BY_PRIORITY,
  mergeExperiencePartials,
  resolveActiveLens,
  selectExperienceFragments,
} from "./experienceFragments";
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
 * Assembles Experience from selected ExperienceFragments.
 * Behaviour matches the previous monolithic interpretation mapping.
 */
export function composeExperience(input: ExperienceComposeInput): Experience {
  const activeLens = resolveActiveLens(input.priorities.selected);
  const fragments = selectExperienceFragments(activeLens);
  const partials = fragments.map((entry) => entry.build());
  const assembled = mergeExperiencePartials(partials);
  const lensKey =
    activeLens === null
      ? "baseline"
      : (LENS_KEY_BY_PRIORITY[activeLens] ?? "baseline");

  return Object.freeze({
    id: `experience.${input.object.id}.${lensKey}`,
    ...assembled,
  });
}

export type ExperienceComposer = (
  input: ExperienceComposeInput,
) => Experience;

export function createExperienceComposer(): ExperienceComposer {
  return composeExperience;
}
