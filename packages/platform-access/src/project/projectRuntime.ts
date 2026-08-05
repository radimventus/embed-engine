/**
 * PT-PDM-02 — Shared Project Runtime: openProject is the sole consumer entry.
 */

import { packageRootToPublicUrl } from './packagePublicUrl';
import {
  getSharedProject,
  listPublishedProjects,
  listSharedProjects,
} from './projectRepository';
import type { SharedProjectRuntimeView } from './sharedProjectTypes';

/**
 * Open a Projekt for any Studio. Returns null when missing.
 * Consumers should prefer published projects; draft/ready are Builder-only.
 */
export function openProject(projectId: string): SharedProjectRuntimeView | null {
  const project = getSharedProject(projectId);
  if (project === null) return null;
  return {
    project,
    packagePublicRoot: packageRootToPublicUrl(project.packageRoot),
    isPublished: project.status === 'published',
  };
}

/** Resolve active session project, falling back to first published. */
export function resolveActiveProjectView(
  projectId: string | null | undefined,
): SharedProjectRuntimeView | null {
  if (typeof projectId === 'string' && projectId.length > 0) {
    const opened = openProject(projectId);
    if (opened !== null) return opened;
  }
  const published = listPublishedProjects();
  const first = published[0];
  if (first === undefined) {
    const any = listSharedProjects()[0];
    return any === undefined ? null : openProject(any.id);
  }
  return openProject(first.id);
}

export function listOpenablePublishedProjects(): readonly SharedProjectRuntimeView[] {
  return listPublishedProjects()
    .map((project) => openProject(project.id))
    .filter((view): view is SharedProjectRuntimeView => view !== null);
}
