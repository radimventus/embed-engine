import type { Experience } from "./Experience";
import {
  LENS_KEY_BY_PRIORITY,
  mergeExperiencePartials,
  resolveActiveLens,
  selectExperienceFragments,
} from "./experienceFragments";
import type { PriorityId, PrioritySelection } from "./PrioritySelection";
import {
  interpretationEngine,
  type Interpretation,
} from "../interpretation";

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
 * Builds Experience from Interpretation (ADR-012 communication layer).
 * Does not read Object facts — only Interpretation meaning + fragment communication.
 */
export function createExperienceFromInterpretation(
  interpretation: Interpretation,
): Experience {
  const activeLens = resolveActiveLens(
    interpretation.priorityIds as readonly PriorityId[],
  );
  const fragments = selectExperienceFragments(activeLens);
  const partials = fragments.map((entry) => entry.build());
  const assembled = mergeExperiencePartials(partials);
  const lensKey =
    activeLens === null
      ? "baseline"
      : (LENS_KEY_BY_PRIORITY[activeLens] ?? "baseline");

  return Object.freeze({
    id: `experience.${interpretation.objectId}.${lensKey}`,
    ...assembled,
  });
}

/**
 * Canonical runtime path (ADR-012 / PT15):
 * Object + PrioritySelection → InterpretationEngine → Experience
 */
export function composeExperience(input: ExperienceComposeInput): Experience {
  const interpretation = interpretationEngine.interpret({
    objectId: input.object.id,
    priorityIds: input.priorities.selected,
  });
  return createExperienceFromInterpretation(interpretation);
}

export type ExperienceComposer = (
  input: ExperienceComposeInput,
) => Experience;

export function createExperienceComposer(): ExperienceComposer {
  return composeExperience;
}
