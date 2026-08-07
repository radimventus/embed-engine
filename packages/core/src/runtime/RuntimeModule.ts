/**
 * Minimal module contract for future Kernel extensibility.
 * Intentionally tiny — no lifecycle or execution yet.
 */
export interface RuntimeModule {
  readonly id: string;
}
