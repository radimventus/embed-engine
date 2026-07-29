import type {
  ArtifactDependency,
  ArtifactDependencyEvent,
  ArtifactDependencyIndexEntry,
  ArtifactDependencyPackage,
  ArtifactDependencyValidation,
  InitializeArtifactDependencyRegistryInput,
  RegisterArtifactDependencyInput,
} from '../../model';
import {
  createArtifactDependencyRegistry,
  type ArtifactDependencyRegistry,
} from './artifact-dependency-registry';

export type ArtifactDependencyApi = {
  registerArtifactDependency(
    packageId: string | null,
    input: RegisterArtifactDependencyInput,
    init?: InitializeArtifactDependencyRegistryInput,
  ): ArtifactDependencyPackage;
  removeArtifactDependency(
    packageId: string,
    dependencyId: string,
  ): ArtifactDependencyPackage;
  listArtifactDependencies(): readonly ArtifactDependency[];
  findArtifactDependency(artifactId: string): readonly ArtifactDependency[];
  validateArtifactDependencies(packageId: string): ArtifactDependencyValidation;
  initialize(
    input: InitializeArtifactDependencyRegistryInput,
  ): ArtifactDependencyPackage;
  getPackage(packageId: string): ArtifactDependencyPackage | null;
  listPackages(): readonly ArtifactDependencyPackage[];
  listEvents(): readonly ArtifactDependencyEvent[];
  listIndex(): readonly ArtifactDependencyIndexEntry[];
  dispose(packageId: string): ArtifactDependencyPackage;
};

export function createArtifactDependencyApi(
  registry?: ArtifactDependencyRegistry,
): ArtifactDependencyApi {
  const service = registry ?? createArtifactDependencyRegistry();

  return {
    registerArtifactDependency(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'artifact-dependency-session-demo',
          title: init?.title ?? 'Builder Artifact Dependencies',
          dependency: init?.dependency ?? input,
        });
      }
      return service.register(packageId, input);
    },
    removeArtifactDependency(packageId, dependencyId) {
      return service.remove(packageId, dependencyId);
    },
    listArtifactDependencies() {
      return service.listArtifactDependencies();
    },
    findArtifactDependency(artifactId) {
      return service.find(artifactId);
    },
    validateArtifactDependencies(packageId) {
      return service.validate(packageId);
    },
    initialize(input) {
      return service.initialize(input);
    },
    getPackage(packageId) {
      return service.getPackage(packageId);
    },
    listPackages() {
      return service.list();
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
