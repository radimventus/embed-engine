/**
 * Internal Runtime operating context.
 * Holds infrastructure fields and an opaque reference to domain state.
 */
export interface ExecutionContext {
  currentSceneId: string;
  /** Domain module state (e.g. DecisionState). Core treats this as opaque. */
  state: unknown;
}
