/**
 * Platform-independent projection of Runtime interpretation.
 * Renderers consume this contract only — never reconstruct domain state.
 */

export type DecisionId = string;

export interface ExperienceChoice {
  readonly id: string;
  readonly label: string;
}

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
  readonly choices?: readonly ExperienceChoice[];
}

export interface ExperienceHouseRoom {
  readonly id: string;
  readonly name: string;
  readonly area: number;
  readonly floor: number;
}

export interface ExperienceHouseMedia {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly url: string;
}

/**
 * Projected house for Experience rendering.
 * Derived from Object Package — never the Object Package itself.
 */
export interface ExperienceHouse {
  readonly id: string;
  readonly title: string;
  readonly reference: string;
  readonly price: number;
  readonly usableArea: number;
  readonly landArea: number;
  readonly roomCount: number;
  readonly hasGarden: boolean;
  readonly city: string;
  readonly district: string;
  readonly energyClass: string;
  readonly construction: string;
  readonly media: readonly ExperienceHouseMedia[];
  readonly rooms: readonly ExperienceHouseRoom[];
}

/** Projected visitor filter for rendering. */
export interface ExperienceDecisionFilter {
  readonly preferPrice: boolean;
  readonly preferSpace: boolean;
  readonly preferGarden: boolean;
}

export type ExperienceHighlightTarget =
  | "price"
  | "layout"
  | "garden"
  | "location"
  | "energy";

/** Projected interpretation highlight — renderer only paints. */
export interface ExperienceHighlight {
  readonly target: ExperienceHighlightTarget;
  readonly label: string;
  readonly reason: string;
}

export interface ReactExperienceModel {
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
  /** Projected house object for this experience. */
  readonly house: ExperienceHouse | null;
  /** Projected DecisionFilter, when answers exist. */
  readonly decisionFilter: ExperienceDecisionFilter | null;
  /** Interpretation highlights derived in the projection layer. */
  readonly highlights: readonly ExperienceHighlight[];
  /**
   * Recommended room order from interpretation (e.g. space preference).
   * Empty when not applicable.
   */
  readonly recommendedRooms: readonly ExperienceHouseRoom[];
  /** True when the visitor has reached the summary step. */
  readonly summaryReady: boolean;
}
