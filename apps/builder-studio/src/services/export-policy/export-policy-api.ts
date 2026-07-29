import type {
  ExportPolicy,
  ExportPolicyEvent,
  ExportPolicyIndexEntry,
  ExportPolicyPackage,
  ExportPolicyValidation,
  InitializeExportPolicyRegistryInput,
  RegisterExportPolicyInput,
} from '../../model';
import {
  createExportPolicyRegistry,
  type ExportPolicyRegistry,
} from './export-policy-registry';

export type ExportPolicyApi = {
  registerExportPolicy(
    packageId: string | null,
    input: RegisterExportPolicyInput,
    init?: InitializeExportPolicyRegistryInput,
  ): ExportPolicyPackage;
  findExportPolicy(name: string): readonly ExportPolicy[];
  listExportPolicies(): readonly ExportPolicy[];
  validateExportPolicy(packageId: string): ExportPolicyValidation;
  disposeExportPolicy(packageId: string): ExportPolicyPackage;
  getPackage(packageId: string): ExportPolicyPackage | null;
  listPackages(): readonly ExportPolicyPackage[];
  listEvents(): readonly ExportPolicyEvent[];
  listIndex(): readonly ExportPolicyIndexEntry[];
};

export function createExportPolicyApi(
  registry?: ExportPolicyRegistry,
): ExportPolicyApi {
  const service = registry ?? createExportPolicyRegistry();

  return {
    registerExportPolicy(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'export-policy-session-demo',
          title: init?.title ?? 'Builder Export Policies',
          policy: init?.policy ?? input,
        });
      }
      return service.register(packageId, input);
    },

    findExportPolicy(name) {
      return service.find(name);
    },

    listExportPolicies() {
      return service.list();
    },

    validateExportPolicy(packageId) {
      return service.validate(packageId);
    },

    disposeExportPolicy(packageId) {
      return service.dispose(packageId);
    },

    getPackage(packageId) {
      return service.getPackage(packageId);
    },

    listPackages() {
      return service.listPackages();
    },

    listEvents() {
      return service.getEvents();
    },

    listIndex() {
      return service.getIndex();
    },
  };
}

