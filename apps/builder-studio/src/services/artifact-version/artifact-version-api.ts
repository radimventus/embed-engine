import type {
  ArtifactVersion,
  ArtifactVersionEvent,
  ArtifactVersionIndexEntry,
  ArtifactVersionPackage,
  ArtifactVersionValidation,
  InitializeArtifactVersionManagerInput,
  RegisterArtifactVersionInput,
} from '../../model';
import {
  createArtifactVersionManager,
  type ArtifactVersionManager,
} from './artifact-version-manager';

export type ArtifactVersionApi = {
  registerArtifactVersion(
    packageId: string | null,
    input: RegisterArtifactVersionInput,
    init?: InitializeArtifactVersionManagerInput,
  ): ArtifactVersionPackage;
  activateArtifactVersion(
    packageId: string,
    artifactVersionId: string,
  ): ArtifactVersionPackage;
  listArtifactVersions(): readonly ArtifactVersion[];
  findArtifactVersion(artifactId: string): readonly ArtifactVersion[];
  validateArtifactVersion(packageId: string): ArtifactVersionValidation;
  initialize(input: InitializeArtifactVersionManagerInput): ArtifactVersionPackage;
  getPackage(packageId: string): ArtifactVersionPackage | null;
  listPackages(): readonly ArtifactVersionPackage[];
  listEvents(): readonly ArtifactVersionEvent[];
  listIndex(): readonly ArtifactVersionIndexEntry[];
  deprecateArtifactVersion(
    packageId: string,
    artifactVersionId: string,
  ): ArtifactVersionPackage;
  dispose(packageId: string): ArtifactVersionPackage;
};

export function createArtifactVersionApi(
  manager?: ArtifactVersionManager,
): ArtifactVersionApi {
  const service = manager ?? createArtifactVersionManager();

  return {
    registerArtifactVersion(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'artifact-version-session-demo',
          title: init?.title ?? 'Builder Artifact Versions',
          version: init?.version ?? input,
        });
      }
      return service.register(packageId, input);
    },
    activateArtifactVersion(packageId, artifactVersionId) {
      return service.activate(packageId, artifactVersionId);
    },
    listArtifactVersions() {
      return service.listArtifactVersions();
    },
    findArtifactVersion(artifactId) {
      return service.findArtifactVersion(artifactId);
    },
    validateArtifactVersion(packageId) {
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
    deprecateArtifactVersion(packageId, artifactVersionId) {
      return service.deprecate(packageId, artifactVersionId);
    },
    dispose(packageId) {
      return service.dispose(packageId);
    },
  };
}
