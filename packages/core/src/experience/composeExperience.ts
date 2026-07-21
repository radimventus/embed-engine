import type { Experience } from "./Experience";
import {
  LENS_KEY_BY_PRIORITY,
  mergeExperiencePartials,
  resolveActiveLens,
  selectExperienceFragments,
} from "./experienceFragments";
import type { PriorityId, PrioritySelection } from "./PrioritySelection";
import {
  createDecisionContext,
  interpretationEngine,
  type DecisionContext,
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

export type InterpretedExperience = {
  readonly interpretation: Interpretation;
  readonly experience: Experience;
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
 * Canonical reactive pipeline step:
 * Object + DecisionContext → InterpretationEngine → ExperienceComposer
 */
export function interpretAndCompose(input: {
  readonly object: ExperienceObjectRef;
  readonly context: DecisionContext;
}): InterpretedExperience {
  const interpretation = interpretationEngine.interpret({
    object: input.object,
    context: input.context,
  });
  return Object.freeze({
    interpretation,
    experience: createExperienceFromInterpretation(interpretation),
  });
}

/**
 * Canonical runtime path (ADR-012):
 * Object + PrioritySelection → DecisionContext → Interpretation → Experience
 */
export function composeExperience(input: ExperienceComposeInput): Experience {
  return interpretAndCompose({
    object: input.object,
    context: createDecisionContext({ priorities: input.priorities }),
  }).experience;
}

export type ExperienceComposer = (
  input: ExperienceComposeInput,
) => Experience;

export function createExperienceComposer(): ExperienceComposer {
  return composeExperience;
}
