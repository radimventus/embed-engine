/**
 * Minimal House Decision Experience flow.
 * Start → Priority → Garden → Summary
 *
 * Choice / decision ids must stay aligned with
 * `@embed-engine/decision` `buildDecisionFilter` constants.
 */
export const HOUSE_DECISION_FLOW_START_ID = "start";

export const HOUSE_DECISION_FLOW = [
  {
    id: "start",
    question: "House Package",
    type: "text" as const,
    next: "priority-focus",
  },
  {
    id: "priority-focus",
    question: "Co je pro vás důležitější?",
    type: "single-choice" as const,
    previous: "start",
    next: "garden-importance",
    choices: [
      { id: "price", label: "Cena" },
      { id: "space", label: "Prostor" },
    ],
  },
  {
    id: "garden-importance",
    question: "Je pro vás důležitá zahrada?",
    type: "single-choice" as const,
    previous: "priority-focus",
    next: "summary",
    choices: [
      { id: "yes", label: "Ano" },
      { id: "no", label: "Ne" },
    ],
  },
  {
    id: "summary",
    question: "Decision Summary",
    type: "text" as const,
    previous: "garden-importance",
  },
];
