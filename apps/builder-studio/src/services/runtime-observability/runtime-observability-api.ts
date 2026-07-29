import type {
  CollectRuntimeInput,
  RuntimeObservabilityEvent,
  RuntimeObservabilityIndexEntry,
  RuntimeObservabilityPackage,
  RuntimeObservabilityValidation,
} from '../../model';
import {
  createRuntimeObservabilityEngine,
  type RuntimeObservabilityEngine,
} from './runtime-observability-engine';

/**
 * Runtime Observability API (EPIC-BLD-36).
 */
export type RuntimeObservabilityApi = {
  collectRuntime(input: CollectRuntimeInput): RuntimeObservabilityPackage;
  publishObservability(packageId: string): RuntimeObservabilityPackage;
  previewObservability(packageId: string): RuntimeObservabilityPackage | null;
  listObservations(
    packageId: string,
  ): RuntimeObservabilityPackage['timeline']['events'];
  validateObservability(packageId: string): RuntimeObservabilityValidation;
  listPackages(): readonly RuntimeObservabilityPackage[];
  listEvents(): readonly RuntimeObservabilityEvent[];
  listIndex(): readonly RuntimeObservabilityIndexEntry[];
  dispose(packageId: string): RuntimeObservabilityPackage;
};

export function createRuntimeObservabilityApi(
  engine?: RuntimeObservabilityEngine,
): RuntimeObservabilityApi {
  const observability = engine ?? createRuntimeObservabilityEngine();

  return {
    collectRuntime(input) {
      return observability.collect(input);
    },
    publishObservability(packageId) {
      observability.analyze(packageId);
      return observability.publish(packageId);
    },
    previewObservability(packageId) {
      return observability.getPackage(packageId);
    },
    listObservations(packageId) {
      return observability.listObservations(packageId);
    },
    validateObservability(packageId) {
      return observability.analyze(packageId);
    },
    listPackages() {
      return observability.listPackages();
    },
    listEvents() {
      return observability.getEvents();
    },
    listIndex() {
      return observability.getIndex();
    },
    dispose(packageId) {
      return observability.dispose(packageId);
    },
  };
}
