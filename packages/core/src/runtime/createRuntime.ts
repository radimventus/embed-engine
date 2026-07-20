import { Runtime } from "./Runtime";

/**
 * Creates a fresh platform Runtime instance.
 */
export function createRuntime(): Runtime {
  return new Runtime();
}
