import type {
  CollectOperationsInput,
  OperationsSnapshot,
  RuntimeOperationsEvent,
  RuntimeOperationsIndexEntry,
  RuntimeOperationsPackage,
  RuntimeOperationsValidation,
} from '../../model';
import {
  createRuntimeOperationsDashboard,
  type RuntimeOperationsDashboard,
} from './runtime-operations-dashboard';

/**
 * Runtime Operations Dashboard API (EPIC-BLD-47).
 */
export type RuntimeOperationsApi = {
  collectOperations(input: CollectOperationsInput): RuntimeOperationsPackage;
  publishOperations(packageId: string): RuntimeOperationsPackage;
  previewOperations(packageId: string): RuntimeOperationsPackage | null;
  listSnapshots(): readonly OperationsSnapshot[];
  validateOperations(packageId: string): RuntimeOperationsValidation;
  listPackages(): readonly RuntimeOperationsPackage[];
  listEvents(): readonly RuntimeOperationsEvent[];
  listIndex(): readonly RuntimeOperationsIndexEntry[];
  dispose(packageId: string): RuntimeOperationsPackage;
};

export function createRuntimeOperationsApi(
  dashboard?: RuntimeOperationsDashboard,
): RuntimeOperationsApi {
  const operations = dashboard ?? createRuntimeOperationsDashboard();

  return {
    collectOperations(input) {
      return operations.refresh(input);
    },
    publishOperations(packageId) {
      operations.validate(packageId);
      return operations.publish(packageId);
    },
    previewOperations(packageId) {
      return operations.getPackage(packageId);
    },
    listSnapshots() {
      return operations.listSnapshots();
    },
    validateOperations(packageId) {
      return operations.validate(packageId);
    },
    listPackages() {
      return operations.listPackages();
    },
    listEvents() {
      return operations.getEvents();
    },
    listIndex() {
      return operations.getIndex();
    },
    dispose(packageId) {
      return operations.dispose(packageId);
    },
  };
}
