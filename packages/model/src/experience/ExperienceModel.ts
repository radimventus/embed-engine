/**
 * Platform-independent projection of Runtime interpretation.
 * Renderers consume this contract only — never reconstruct domain state.
 */

export type DecisionId = string;

/**
 * Projected decision step for rendering.
 * visited/current are computed during projection, not stored as domain truth.
 */
export interface ExperienceDecision {
  readonly id: DecisionId;
  readonly title: string;
  readonly description?: string;
  readonly visited: boolean;
  readonly current: boolean;
}

export interface ExperienceModel {
  /** Current scene from Runtime ExecutionContext. */
  readonly currentSceneId: string;
  /** Snapshot of DecisionState.answers. */
  readonly answers: Readonly<Record<string, unknown>>;
  /**
   * Answered decisions projected for convenience.
   * Prefer decisionFlow for complete flow rendering.
   */
  readonly decisions: readonly ExperienceDecision[];
  /** Current decision id from DecisionState. */
  readonly currentDecisionId: string | null;
  /** Navigation history from DecisionState (oldest → newest). */
  readonly history: readonly string[];
  /** Current step from decisionFlow, if any. */
  readonly currentDecision: ExperienceDecision | null;
  /**
   * Complete Decision Flow in presentation order.
   * Ordering comes from the Decision Graph / Registry.
   */
  readonly decisionFlow: readonly ExperienceDecision[];
}
