import { Runtime, type RuntimeOptions } from "./Runtime";

/** Creates a platform Runtime with an internal Kernel. */
export function createRuntime(options: RuntimeOptions = {}): Runtime {
  return new Runtime(options);
}
