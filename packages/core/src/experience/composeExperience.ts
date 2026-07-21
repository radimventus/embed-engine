import type { Experience } from "./Experience";
import type { PrioritySelection } from "./PrioritySelection";

/**
 * Object reference for Experience composition.
 * Slice 2 — identity only; no domain payload.
 */
export type ExperienceObjectRef = {
  readonly id: string;
};

export type ExperienceComposeInput = {
  readonly object: ExperienceObjectRef;
  readonly priorities: PrioritySelection;
};

/**
 * Deterministic Experience from compose input.
 * Priorities are accepted for pipeline wiring; ignored until a later slice.
 */
export function composeExperience(input: ExperienceComposeInput): Experience {
  void input.object;
  void input.priorities;

  return Object.freeze({
    id: "experience.pilot.static",
    title: "Disposition Layout",
    summary:
      "Interpreted representation of the active object for decision guidance.",
    focus: Object.freeze(["disposition", "layout"]),
  });
}

export type ExperienceComposer = (
  input: ExperienceComposeInput,
) => Experience;

export function createExperienceComposer(): ExperienceComposer {
  return composeExperience;
}
