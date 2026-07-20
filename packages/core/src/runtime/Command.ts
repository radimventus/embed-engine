/**
 * Domain-agnostic command accepted by Runtime.dispatch().
 */
export interface Command {
  readonly type: string;
  readonly payload?: unknown;
}
