/**
 * Minimal Interpretation for the Client Studio living priority slice.
 * Derived, read-only — never written by React.
 */
export type InterpretationPriority = {
  readonly id: string;
  readonly weight: number;
  /** Short human explanation when this priority is elevated. */
  readonly reason?: string;
  /** True when this priority is currently emphasized by Focus. */
  readonly highlighted?: boolean;
};

/** Timeline entry projected from DecisionState.signals. */
export type InterpretationEvent = {
  readonly id: string;
  readonly label: string;
  readonly signalType: string;
  readonly timestamp: number;
};

export type Interpretation = {
  readonly priorities: readonly InterpretationPriority[];
  readonly events: readonly InterpretationEvent[];
};
