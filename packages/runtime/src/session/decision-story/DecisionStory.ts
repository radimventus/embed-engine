/**
 * Decision Story — canonical semantic narrative of the current decision state (CAP-DST-001 / PT-004).
 * Deterministic Runtime artifact — never UI, never AI authorship.
 *
 * Move slots / progression units are produced by CAP-DST-002 from this Story
 * (`composeDecisionMoves(story)`). Moves MUST NOT be composed from Interpretation.
 */

export const DECISION_STORY_SCHEMA_VERSION = 1 as const;

/**
 * Ordered narrative chapter kinds required by PT-004.
 */
export type DecisionStoryChapterKind =
  | "primary-explanation"
  | "supporting-argument"
  | "recommendation"
  | "semantic-transition"
  | "next-decision-step";

export type DecisionStoryChapter = {
  readonly id: string;
  readonly kind: DecisionStoryChapterKind;
  /** Machine-readable semantic key — presentation may localize, never invent. */
  readonly key: string;
  readonly order: number;
};

/**
 * Provenance of a composed Story — inputs that must reproduce it.
 */
export type DecisionStoryProvenance = {
  readonly objectId: string;
  readonly rulesetId: string;
  readonly rulesetVersion: number;
  readonly appliedRuleIds: readonly string[];
  readonly signalKinds: readonly string[];
  readonly focusRoomId: string | null;
  readonly focusPriorityId: string | null;
  readonly focusAction: string;
};

/**
 * Canonical Decision Story model (Runtime-owned).
 */
export type DecisionStory = {
  /** Deterministic Story identity derived from semantic inputs. */
  readonly id: string;
  readonly schemaVersion: typeof DECISION_STORY_SCHEMA_VERSION;
  readonly primaryExplanation: string;
  readonly supportingArguments: readonly string[];
  readonly recommendationSequence: readonly string[];
  readonly semanticTransitions: readonly string[];
  readonly nextDecisionStep: string;
  /** Ordered chapters — single traversal of the narrative. */
  readonly chapters: readonly DecisionStoryChapter[];
  readonly confidence: number;
  readonly provenance: DecisionStoryProvenance;
};

/**
 * Public contract for Experience modules and integrations.
 * Alias of DecisionStory — presentation consumes this; never composes it.
 */
export type DecisionStoryContract = DecisionStory;
