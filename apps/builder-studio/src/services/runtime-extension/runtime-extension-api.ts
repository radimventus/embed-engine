import type {
  InitializeExtensionInput,
  RegisterRuntimeExtensionInput,
  RuntimeExtension,
  RuntimeExtensionEvent,
  RuntimeExtensionIndexEntry,
  RuntimeExtensionPackage,
  RuntimeExtensionValidation,
} from '../../model';
import {
  createRuntimeExtensionFramework,
  type RuntimeExtensionFramework,
} from './runtime-extension-framework';

/**
 * Runtime Extension Framework API (EPIC-BLD-54).
 */
export type RuntimeExtensionApi = {
  registerRuntimeExtension(
    packageId: string | null,
    input: RegisterRuntimeExtensionInput,
    init?: InitializeExtensionInput,
  ): RuntimeExtensionPackage;
  enableRuntimeExtension(
    packageId: string,
    extensionId: string,
  ): RuntimeExtensionPackage;
  disableRuntimeExtension(
    packageId: string,
    extensionId: string,
  ): RuntimeExtensionPackage;
  listRuntimeExtensions(packageId?: string): readonly RuntimeExtension[];
  validateRuntimeExtension(packageId: string): RuntimeExtensionValidation;
  publishRuntimeExtension(packageId: string): RuntimeExtensionPackage;
  initialize(input: InitializeExtensionInput): RuntimeExtensionPackage;
  preview(packageId: string): RuntimeExtensionPackage | null;
  listPackages(): readonly RuntimeExtensionPackage[];
  listEvents(): readonly RuntimeExtensionEvent[];
  listIndex(): readonly RuntimeExtensionIndexEntry[];
  dispose(packageId: string): RuntimeExtensionPackage;
};

export function createRuntimeExtensionApi(
  framework?: RuntimeExtensionFramework,
): RuntimeExtensionApi {
  const service = framework ?? createRuntimeExtensionFramework();

  return {
    initialize(input) {
      return service.initialize(input);
    },
    registerRuntimeExtension(packageId, input, init) {
      if (packageId === null) {
        const created = service.initialize(
          init ?? {
            sessionId: 'runtime-session-demo',
            title: 'Builder Runtime Extensions',
            extensions: [input],
          },
        );
        if (
          created.registry.extensions.some(
            (extension) =>
              extension.name === input.name &&
              extension.capability === input.capability &&
              extension.version === input.version,
          )
        ) {
          return created;
        }
        return service.register(created.id, input);
      }
      return service.register(packageId, input);
    },
    enableRuntimeExtension(packageId, extensionId) {
      return service.enable(packageId, extensionId);
    },
    disableRuntimeExtension(packageId, extensionId) {
      return service.disable(packageId, extensionId);
    },
    listRuntimeExtensions(packageId) {
      return service.listExtensions(packageId);
    },
    validateRuntimeExtension(packageId) {
      return service.validate(packageId);
    },
    publishRuntimeExtension(packageId) {
      service.validate(packageId);
      return service.publish(packageId);
    },
    preview(packageId) {
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
    dispose(packageId) {
      return service.dispose(packageId);
    },
  };
}
