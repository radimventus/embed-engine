/**
 * Minimal Interpretation for the Client Studio priority vertical slice.
 * Derived, read-only — never written by React.
 */
export type InterpretationPriority = {
  readonly id: string;
  readonly weight: number;
};

export type Interpretation = {
  readonly priorities: readonly InterpretationPriority[];
};
