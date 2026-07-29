import type {
  ArtifactExportEvent,
  ArtifactExportIndexEntry,
  ArtifactExportModel,
  ArtifactExportPackage,
  ArtifactExportValidation,
  BuildArtifactExportInput,
  InitializeArtifactExportInput,
} from '../../model';
import {
  type ArtifactExportContract,
  createArtifactExportContract,
} from './artifact-export-contract';

export type ArtifactExportApi = {
  buildArtifactExport(
    packageId: string | null,
    input: BuildArtifactExportInput,
    init?: InitializeArtifactExportInput,
  ): ArtifactExportPackage;
  exportArtifact(packageId: string): ArtifactExportPackage;
  listArtifactExports(): readonly ArtifactExportModel[];
  findArtifactExport(artifactId: string): ArtifactExportModel | null;
  validateArtifactExport(packageId: string): ArtifactExportValidation;
  initialize(input: InitializeArtifactExportInput): ArtifactExportPackage;
  getPackage(packageId: string): ArtifactExportPackage | null;
  listPackages(): readonly ArtifactExportPackage[];
  listEvents(): readonly ArtifactExportEvent[];
  listIndex(): readonly ArtifactExportIndexEntry[];
  disposeArtifactExport(packageId: string): ArtifactExportPackage;
};

export function createArtifactExportApi(
  contract?: ArtifactExportContract,
): ArtifactExportApi {
  const service = contract ?? createArtifactExportContract();

  return {
    buildArtifactExport(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'artifact-export-session-demo',
          title: init?.title ?? 'Builder Artifact Export',
          export: init?.export ?? input,
        });
      }
      return service.build(packageId, input);
    },
    exportArtifact(packageId) {
      return service.export(packageId);
    },
    listArtifactExports() {
      return service.listArtifactExports();
    },
    findArtifactExport(artifactId) {
      return service.findArtifactExport(artifactId);
    },
    validateArtifactExport(packageId) {
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
    disposeArtifactExport(packageId) {
      return service.dispose(packageId);
    },
  };
}

