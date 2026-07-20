/**
 * Cognitive Layer supporting types for Decision State.
 * Data contracts only — no behavior.
 */

/** Current decision environment. */
export type Context = {
  readonly locale?: string;
  readonly channel?: string;
};

/**
 * Meaningful interaction event.
 * Signal processing is out of scope for CAP-02.
 */
export type Signal = {
  readonly id: string;
  readonly type: string;
};

/**
 * User preference entry stored in Decision State.
 * Not an engine or service.
 */
export type Priority = {
  readonly id: string;
  readonly rank?: number;
};

/** Established decision fact. */
export type DecisionFact = {
  readonly id: string;
  readonly key: string;
  readonly value: unknown;
};

/** Recorded conflict between decision inputs. */
export type DecisionConflict = {
  readonly id: string;
  readonly code: string;
};

/** Opaque decision-process metadata. */
export type DecisionMetadata = {
  readonly source?: string;
};
