import { Runtime } from "./Runtime";

/** Creates a platform Runtime with an internal Kernel. */
export function createRuntime(): Runtime {
  return new Runtime();
}
