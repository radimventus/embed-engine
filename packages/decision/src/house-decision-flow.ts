import type { DecisionDefinition } from "./DecisionDefinition";
import {
  GARDEN_IMPORTANCE_DECISION_ID,
  GARDEN_IMPORTANCE_NO,
  GARDEN_IMPORTANCE_YES,
  PRIORITY_FOCUS_DECISION_ID,
  PRIORITY_FOCUS_PRICE,
  PRIORITY_FOCUS_SPACE,
} from "./buildDecisionFilter";

/**
 * Minimal House Decision Experience flow.
 * Start → Priority → Garden → Summary
 */
export const HOUSE_DECISION_FLOW_START_ID = "start";

export const HOUSE_DECISION_FLOW: readonly DecisionDefinition[] = [
  {
    id: "start",
    question: "House Package",
    type: "text",
    next: PRIORITY_FOCUS_DECISION_ID,
  },
  {
    id: PRIORITY_FOCUS_DECISION_ID,
    question: "Co je pro vás důležitější?",
    type: "single-choice",
    previous: "start",
    next: GARDEN_IMPORTANCE_DECISION_ID,
    choices: [
      { id: PRIORITY_FOCUS_PRICE, label: "Cena" },
      { id: PRIORITY_FOCUS_SPACE, label: "Prostor" },
    ],
  },
  {
    id: GARDEN_IMPORTANCE_DECISION_ID,
    question: "Je pro vás důležitá zahrada?",
    type: "single-choice",
    previous: PRIORITY_FOCUS_DECISION_ID,
    next: "summary",
    choices: [
      { id: GARDEN_IMPORTANCE_YES, label: "Ano" },
      { id: GARDEN_IMPORTANCE_NO, label: "Ne" },
    ],
  },
  {
    id: "summary",
    question: "Decision Summary",
    type: "text",
    previous: GARDEN_IMPORTANCE_DECISION_ID,
  },
];
