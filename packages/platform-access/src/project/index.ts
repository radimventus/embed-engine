/**
 * PT-PDM-02 — Shared Project Runtime public surface.
 */

export type {
  SharedProject,
  SharedProjectDocumentRef,
  SharedProjectRuntimeView,
  SharedProjectManifest,
  BuilderProjectWriteInput,
} from './sharedProjectTypes';
export { platformProjectFromWrite } from './sharedProjectTypes';

export { packageRootToPublicUrl } from './packagePublicUrl';

export {
  listSharedProjects,
  listPublishedProjects,
  getSharedProject,
  upsertBuilderSharedProject,
  publishSharedProject,
  deleteSharedProject,
  setSharedProjectStatus,
  updateSharedProjectManifest,
  syncBuilderWorkspaceHouse,
  resetSharedProjectManifestsForTests,
  MANIFEST_STORAGE_KEY,
} from './projectRepository';

export {
  openProject,
  resolveActiveProjectView,
  listOpenablePublishedProjects,
  resolveMountProjectView,
  normalizeProjectIdCandidate,
  resolveBindHouseId,
  LEGACY_OBJECT_ID_TO_PROJECT_ID,
} from './projectRuntime';
