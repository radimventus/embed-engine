import type { DecisionDefinition } from "./DecisionDefinition";

/**
 * Reference linear Decision Flow.
 * Start → Preference A → Preference B → Preference C → Summary
 */
export const CANONICAL_DECISION_FLOW_START_ID = "start";

export const CANONICAL_DECISION_FLOW: readonly DecisionDefinition[] = [
  {
    id: "start",
    question: "Start",
    type: "text",
    next: "preference-a",
  },
  {
    id: "preference-a",
    question: "Preference A",
    type: "single-choice",
    next: "preference-b",
    previous: "start",
  },
  {
    id: "preference-b",
    question: "Preference B",
    type: "single-choice",
    next: "preference-c",
    previous: "preference-a",
  },
  {
    id: "preference-c",
    question: "Preference C",
    type: "single-choice",
    next: "summary",
    previous: "preference-b",
  },
  {
    id: "summary",
    question: "Summary",
    type: "text",
    previous: "preference-c",
  },
];
