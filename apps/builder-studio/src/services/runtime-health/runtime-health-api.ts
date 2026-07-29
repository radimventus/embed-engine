import type {
  InspectRuntimeInput,
  RuntimeHealthEvent,
  RuntimeHealthIndexEntry,
  RuntimeHealthPackage,
  RuntimeHealthReport,
  RuntimeHealthValidation,
} from '../../model';
import {
  createRuntimeHealthEngine,
  type RuntimeHealthEngine,
} from './runtime-health-engine';

/**
 * Runtime Health API (EPIC-BLD-37).
 */
export type RuntimeHealthApi = {
  inspectRuntime(input: InspectRuntimeInput): RuntimeHealthPackage;
  publishHealth(packageId: string): RuntimeHealthPackage;
  previewHealth(packageId: string): RuntimeHealthPackage | null;
  listHealthReports(): readonly RuntimeHealthReport[];
  validateHealth(packageId: string): RuntimeHealthValidation;
  listPackages(): readonly RuntimeHealthPackage[];
  listEvents(): readonly RuntimeHealthEvent[];
  listIndex(): readonly RuntimeHealthIndexEntry[];
  dispose(packageId: string): RuntimeHealthPackage;
};

export function createRuntimeHealthApi(
  engine?: RuntimeHealthEngine,
): RuntimeHealthApi {
  const health = engine ?? createRuntimeHealthEngine();

  return {
    inspectRuntime(input) {
      return health.inspect(input);
    },
    publishHealth(packageId) {
      health.analyze(packageId);
      return health.publish(packageId);
    },
    previewHealth(packageId) {
      return health.getPackage(packageId);
    },
    listHealthReports() {
      return health.listReports();
    },
    validateHealth(packageId) {
      return health.analyze(packageId);
    },
    listPackages() {
      return health.listPackages();
    },
    listEvents() {
      return health.getEvents();
    },
    listIndex() {
      return health.getIndex();
    },
    dispose(packageId) {
      return health.dispose(packageId);
    },
  };
}
