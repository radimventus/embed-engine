/**
 * Interpretation Rules Engine (CAP-HP-003.5).
 *
 * Deterministic rules that turn Object Package + Runtime State into meaning.
 * Rules never read UI state. Rules never project Experience.
 */

export type InterpretationRuleId = string;

/**
 * Rule responsibility domains for Decision Session interpretation.
 */
export type InterpretationRuleKind =
  | "room-importance"
  | "hero-emphasis"
  | "media-prioritization"
  | "recommendation-ordering"
  | "contextual-messaging";

/**
 * Recommended media role — semantic, not a URL.
 * Presentation resolves assets from projected Experience media.
 */
export type RecommendedMediaRole =
  | "hero"
  | "gallery"
  | "video"
  | "document"
  | "thumbnail";

export type RecommendedMediaRef = {
  readonly role: RecommendedMediaRole;
  readonly rank: number;
  readonly reason: string;
};

export type FocusRoom = {
  readonly id: string;
  readonly name: string;
};

/**
 * Kind-specific configuration. Frozen at ruleset construction.
 */
export type RoomImportanceConfig = {
  /** Highest importance first. Unknown rooms sort after listed ones by package order. */
  readonly order: readonly string[];
};

export type HeroEmphasisConfig = {
  /** Machine reason keys keyed by room id. */
  readonly reasonsByRoomId: Readonly<Record<string, string>>;
  readonly defaultReason: string;
};

export type MediaPrioritizationConfig = {
  /** Preferred media role order (first = strongest recommendation). */
  readonly roleOrder: readonly RecommendedMediaRole[];
  /** Optional per-room overrides of role order. */
  readonly roleOrderByRoomId?: Readonly<
    Record<string, readonly RecommendedMediaRole[]>
  >;
};

export type RecommendationOrderingConfig = {
  /** Highlight message keys to prefer first when present. */
  readonly highlightOrder: readonly string[];
};

export type ContextualMessagingConfig = {
  readonly messagesByRoomId: Readonly<Record<string, readonly string[]>>;
  readonly defaultMessages: readonly string[];
  /** Optional messages when priority ids are active (appended, deterministic). */
  readonly messagesByPriorityId?: Readonly<Record<string, string>>;
};

export type InterpretationRuleConfig =
  | { readonly kind: "room-importance"; readonly config: RoomImportanceConfig }
  | { readonly kind: "hero-emphasis"; readonly config: HeroEmphasisConfig }
  | {
      readonly kind: "media-prioritization";
      readonly config: MediaPrioritizationConfig;
    }
  | {
      readonly kind: "recommendation-ordering";
      readonly config: RecommendationOrderingConfig;
    }
  | {
      readonly kind: "contextual-messaging";
      readonly config: ContextualMessagingConfig;
    };

/**
 * Formal interpretation rule — identity, priority, and config.
 * Higher `priority` wins when rules write the same semantic field.
 */
export type InterpretationRule = {
  readonly id: InterpretationRuleId;
  readonly kind: InterpretationRuleKind;
  /** Higher number = higher precedence on conflicting outputs. */
  readonly priority: number;
  readonly enabled: boolean;
  readonly version: number;
  readonly config: InterpretationRuleConfig["config"];
};

export type InterpretationRuleset = {
  readonly id: string;
  readonly version: number;
  readonly rules: readonly InterpretationRule[];
};

/**
 * Semantic outputs produced by rule evaluation (before Experience projection).
 */
export type InterpretedSemantics = {
  readonly focusRoom: FocusRoom | null;
  readonly primaryReason: string;
  readonly highlights: readonly string[];
  readonly recommendedMedia: readonly RecommendedMediaRef[];
  /** Room ids ordered by interpreted importance (package ∩ rules). */
  readonly roomImportanceRank: readonly string[];
  /** Enabled rules that contributed, sorted by priority desc then id. */
  readonly appliedRuleIds: readonly InterpretationRuleId[];
};
