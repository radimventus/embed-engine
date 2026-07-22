import type {
  AIContextContract,
  DecisionTerminalContract,
} from '@embed-engine/runtime';

/**
 * Presentation projection from Decision Terminal (ED-DA-01R).
 * Reads Runtime keys only — does not compose, interpret, or enrich semantics.
 */
export type TerminalPresentation = {
  readonly id: string;
  readonly recommendation: string;
  readonly status: string;
  readonly confidence: number;
  readonly rationale: readonly string[];
  readonly unresolvedQuestions: readonly string[];
  readonly recommendedNextAction: string;
  readonly completedMoveIds: readonly string[];
  readonly unresolvedMoveIds: readonly string[];
};

export function projectTerminalPresentation(
  terminal: DecisionTerminalContract,
): TerminalPresentation {
  const { outcome } = terminal;
  return Object.freeze({
    id: terminal.id,
    recommendation: outcome.recommendation,
    status: outcome.status,
    confidence: outcome.confidence,
    rationale: outcome.rationale,
    unresolvedQuestions: outcome.unresolvedQuestions,
    recommendedNextAction: outcome.recommendedNextAction,
    completedMoveIds: outcome.completedMoveIds,
    unresolvedMoveIds: outcome.unresolvedMoveIds,
  });
}

export type AiAdvisorPresentation = {
  readonly id: string;
  readonly intro: string;
  readonly faqItems: readonly {
    readonly id: string;
    readonly question: string;
    readonly answer: string;
  }[];
};

/**
 * AI Advisor projection from AIContext (Terminal-only keys).
 * FAQ pairs project rationale keys; intro projects recommendation key.
 */
export function projectAiAdvisorPresentation(
  ai: AIContextContract,
): AiAdvisorPresentation {
  const { outcome } = ai;
  return Object.freeze({
    id: ai.id,
    intro: outcome.recommendation,
    faqItems: Object.freeze(
      outcome.rationale.map((key, index) =>
        Object.freeze({
          id: `${ai.id}:rationale:${index}`,
          question: key,
          answer: outcome.status,
        }),
      ),
    ),
  });
}
