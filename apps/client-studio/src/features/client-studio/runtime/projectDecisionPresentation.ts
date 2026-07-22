import type {
  DecisionFocus,
  DecisionMoveContract,
  DecisionOutcomeContract,
  DecisionStoryContract,
  DecisionTerminalContract,
} from '@embed-engine/runtime';

/**
 * Decision Terminal presentation DTO (CSCB-05).
 * Pass-through of Runtime Context — no ranking, filtering, or semantic invention.
 */
export type DecisionPresentation = {
  readonly terminalId: string;
  readonly summary: {
    readonly recommendation: string;
    readonly status: string;
    readonly confidence: number;
    readonly primaryExplanation: string;
    readonly focusRoomName: string | null;
    readonly focusReason: string;
    readonly recommendedNextAction: string;
  };
  readonly story: {
    readonly id: string;
    readonly chapters: readonly {
      readonly id: string;
      readonly kind: string;
      readonly key: string;
      readonly order: number;
    }[];
    readonly nextDecisionStep: string;
  };
  readonly moves: {
    readonly storyId: string;
    readonly activeMoveId: string | null;
    readonly moves: readonly {
      readonly id: string;
      readonly order: number;
      readonly objective: string;
      readonly status: string;
      readonly recommendedAction: string;
    }[];
  };
  readonly drivers: {
    readonly priorityIds: readonly string[];
    readonly focusPriorityId: string | null;
    readonly focusSignalKind: string | null;
    readonly supportingArguments: readonly string[];
    readonly rationale: readonly string[];
  };
  readonly outcome: {
    readonly id: string;
    readonly status: string;
    readonly confidence: number;
    readonly recommendation: string;
    readonly strengths: readonly string[];
    readonly considerations: readonly string[];
    readonly unresolvedMoveIds: readonly string[];
    readonly completedMoveIds: readonly string[];
    readonly recommendedNextAction: string;
  };
};

export type ProjectDecisionPresentationInput = {
  readonly terminal: DecisionTerminalContract;
  readonly story: DecisionStoryContract;
  readonly moves: DecisionMoveContract;
  readonly focus: DecisionFocus;
  readonly priorityIds: readonly string[];
};

/**
 * Project Decision Presentation from Runtime Context slices only.
 * Story/Move order is Runtime order — never re-sorted in Client Studio.
 */
export function projectDecisionPresentation(
  input: ProjectDecisionPresentationInput,
): DecisionPresentation {
  const { terminal, story, moves, focus, priorityIds } = input;
  const outcome: DecisionOutcomeContract = terminal.outcome;

  return Object.freeze({
    terminalId: terminal.id,
    summary: Object.freeze({
      recommendation: outcome.recommendation,
      status: outcome.status,
      confidence: outcome.confidence,
      primaryExplanation: story.primaryExplanation,
      focusRoomName: focus.focusRoomName,
      focusReason: focus.focusReason,
      recommendedNextAction: outcome.recommendedNextAction,
    }),
    story: Object.freeze({
      id: story.id,
      chapters: Object.freeze(
        story.chapters.map((chapter) =>
          Object.freeze({
            id: chapter.id,
            kind: chapter.kind,
            key: chapter.key,
            order: chapter.order,
          }),
        ),
      ),
      nextDecisionStep: story.nextDecisionStep,
    }),
    moves: Object.freeze({
      storyId: moves.storyId,
      activeMoveId: moves.activeMoveId,
      moves: Object.freeze(
        moves.moves.map((move) =>
          Object.freeze({
            id: move.id,
            order: move.order,
            objective: move.objective,
            status: move.status,
            recommendedAction: move.recommendedAction,
          }),
        ),
      ),
    }),
    drivers: Object.freeze({
      priorityIds: Object.freeze([...priorityIds]),
      focusPriorityId: focus.focusPriorityId,
      focusSignalKind: focus.focusSignalKind,
      supportingArguments: Object.freeze([...story.supportingArguments]),
      rationale: Object.freeze([...outcome.rationale]),
    }),
    outcome: Object.freeze({
      id: outcome.id,
      status: outcome.status,
      confidence: outcome.confidence,
      recommendation: outcome.recommendation,
      strengths: Object.freeze([...outcome.rationale]),
      considerations: Object.freeze([...outcome.unresolvedQuestions]),
      unresolvedMoveIds: Object.freeze([...outcome.unresolvedMoveIds]),
      completedMoveIds: Object.freeze([...outcome.completedMoveIds]),
      recommendedNextAction: outcome.recommendedNextAction,
    }),
  });
}
