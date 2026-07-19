import type {
  ExperienceDecision,
  ReactExperienceModel,
} from "@embed-engine/model";
import type { HousePackage } from "@embed-engine/object-house";

import { buildInterpretation } from "./buildInterpretation";
import type { DecisionRegistry } from "./DecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { interpretHouseHighlights } from "./interpretHouseHighlights";
import { projectHouse } from "./projectHouse";

/**
 * Presentation order from the Decision Graph.
 * Walks static next edges from the graph start; appends any remaining nodes.
 */
function orderDecisionIds(registry: DecisionRegistry): string[] {
  const definitions = registry.list();
  if (definitions.length === 0) {
    return [];
  }

  const start =
    definitions.find((definition) => definition.previous === undefined) ??
    definitions.find(
      (definition) =>
        !definitions.some((other) => other.next === definition.id),
    ) ??
    definitions[0];

  const ordered: string[] = [];
  const seen = new Set<string>();
  let currentId: string | undefined = start.id;

  while (currentId !== undefined && !seen.has(currentId)) {
    seen.add(currentId);
    ordered.push(currentId);
    currentId = registry.getNext(currentId);
  }

  for (const definition of definitions) {
    if (!seen.has(definition.id)) {
      ordered.push(definition.id);
    }
  }

  return ordered;
}

function projectDecisionFlow(
  registry: DecisionRegistry,
  state: DecisionState,
): ExperienceDecision[] {
  const visitedIds = new Set(state.history);

  return orderDecisionIds(registry).flatMap((id) => {
    const definition = registry.get(id);
    if (!definition) {
      return [];
    }

    return [
      {
        id: definition.id,
        title: definition.question,
        visited: visitedIds.has(id),
        current: state.currentDecisionId === id,
        choices: definition.choices?.map((choice) => ({
          id: choice.id,
          label: choice.label,
        })),
      },
    ];
  });
}

/**
 * Pure interpretation: DecisionRegistry + DecisionState (+ scene, house)
 * → ReactExperienceModel.
 */
export function interpretDecision(
  registry: DecisionRegistry,
  state: DecisionState,
  currentSceneId: string,
  house: HousePackage | null = null,
): ReactExperienceModel {
  const answers: Record<string, unknown> = Object.fromEntries(
    state.answers.entries(),
  );

  const decisionFlow = projectDecisionFlow(registry, state);
  const currentDecision =
    decisionFlow.find((decision) => decision.current) ?? null;

  const decisions = [...state.answers.keys()].flatMap((id) => {
    const projected = decisionFlow.find((decision) => decision.id === id);
    if (projected) {
      return [projected];
    }

    const definition = registry.get(id);
    if (!definition) {
      return [];
    }

    return [
      {
        id: definition.id,
        title: definition.question,
        visited: state.history.includes(id),
        current: state.currentDecisionId === id,
        choices: definition.choices?.map((choice) => ({
          id: choice.id,
          label: choice.label,
        })),
      },
    ];
  });

  const interpretation = buildInterpretation(state);

  const houseInterpretation =
    interpretation.decisionFilter === null || house === null
      ? { highlights: [], recommendedRooms: [] }
      : interpretHouseHighlights(interpretation.decisionFilter, house);

  return {
    currentSceneId,
    answers,
    decisions,
    currentDecisionId: state.currentDecisionId,
    history: [...state.history],
    currentDecision,
    decisionFlow,
    house: projectHouse(house),
    decisionFilter: interpretation.decisionFilter,
    highlights: houseInterpretation.highlights,
    recommendedRooms: houseInterpretation.recommendedRooms,
    summaryReady: state.currentDecisionId === "summary",
  };
}
