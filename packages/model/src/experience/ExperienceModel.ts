/**
 * Platform-independent projection of Runtime interpretation.
 * MVP: only data already available from DecisionState + ExecutionContext + Registry.
 */
export interface ExperienceDecision {
  readonly id: string;
  readonly question: string;
  readonly type: "single-choice" | "multi-choice" | "number" | "text";
}

export interface ExperienceModel {
  /** Current scene from Runtime ExecutionContext. */
  readonly currentSceneId: string;
  /** Snapshot of DecisionState.answers. */
  readonly answers: Readonly<Record<string, unknown>>;
  /**
   * Registry definitions resolved for answered decision ids.
   * Unknown ids (no registry entry) are omitted.
   */
  readonly decisions: readonly ExperienceDecision[];
}
