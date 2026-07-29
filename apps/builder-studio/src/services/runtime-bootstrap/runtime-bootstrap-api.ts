import type {
  BuildRuntimeBootstrapInput,
  InitializeRuntimeBootstrapInput,
  RuntimeBootstrapEvent,
  RuntimeBootstrapIndexEntry,
  RuntimeBootstrapPackage,
  RuntimeBootstrapValidation,
  RuntimeSessionModel,
} from '../../model';
import {
  createRuntimeSessionBootstrap,
  type RuntimeSessionBootstrap,
} from './runtime-session-bootstrap';

export type RuntimeBootstrapApi = {
  buildRuntimeBootstrap(
    packageId: string | null,
    input: BuildRuntimeBootstrapInput,
    init?: InitializeRuntimeBootstrapInput,
  ): RuntimeBootstrapPackage;
  publishRuntimeBootstrap(packageId: string): RuntimeBootstrapPackage;
  listRuntimeBootstraps(): readonly RuntimeSessionModel[];
  findRuntimeBootstrap(publicationId: string): RuntimeSessionModel | null;
  validateRuntimeBootstrap(packageId: string): RuntimeBootstrapValidation;
  initialize(input: InitializeRuntimeBootstrapInput): RuntimeBootstrapPackage;
  getPackage(packageId: string): RuntimeBootstrapPackage | null;
  listPackages(): readonly RuntimeBootstrapPackage[];
  listEvents(): readonly RuntimeBootstrapEvent[];
  listIndex(): readonly RuntimeBootstrapIndexEntry[];
  dispose(packageId: string): RuntimeBootstrapPackage;
};

export function createRuntimeBootstrapApi(
  bootstrap?: RuntimeSessionBootstrap,
): RuntimeBootstrapApi {
  const service = bootstrap ?? createRuntimeSessionBootstrap();

  return {
    buildRuntimeBootstrap(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'runtime-bootstrap-session-demo',
          title: init?.title ?? 'Builder Runtime Bootstrap',
          bootstrap: init?.bootstrap ?? input,
        });
      }
      return service.build(packageId, input);
    },
    publishRuntimeBootstrap(packageId) {
      return service.publish(packageId);
    },
    listRuntimeBootstraps() {
      return service.listRuntimeBootstraps();
    },
    findRuntimeBootstrap(publicationId) {
      return service.findRuntimeBootstrap(publicationId);
    },
    validateRuntimeBootstrap(packageId) {
      return service.validate(packageId);
    },
    initialize(input) {
      return service.initialize(input);
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
    dispose(packageId) {
      return service.dispose(packageId);
    },
  };
}
