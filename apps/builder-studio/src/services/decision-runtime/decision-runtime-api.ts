import type { CreateRuntimeInput, RuntimeModel } from '../../model';
import type { DecisionRuntime } from './decision-runtime';

/**
 * Public Decision Runtime API (EPIC-BLD-16 Runtime Foundation).
 */
export type DecisionRuntimeApi = {
  createRuntime(input: CreateRuntimeInput): RuntimeModel;
  loadRuntime(id: string): RuntimeModel | null;
  previewRuntime(id: string): RuntimeModel | null;
};

export function createDecisionRuntimeApi(
  runtime: DecisionRuntime,
): DecisionRuntimeApi {
  return {
    createRuntime(input) {
      return runtime.createRuntime(input);
    },
    loadRuntime(id) {
      return runtime.loadRuntime(id);
    },
    previewRuntime(id) {
      return runtime.previewRuntime(id);
    },
  };
}
