/**
 * VR-FIX-04 — Shared Project Switcher state from platform registry (all studios).
 */

import type {
  PlatformWorkspaceOption,
  PlatformWorkspaceState,
} from './platformTypes';

export type PlatformRegistryProject = {
  readonly id: string;
  readonly label: string;
  readonly companyLabel: string;
};

export function buildPlatformWorkspaceState(input: {
  readonly companyLabel: string;
  readonly projectLabel: string;
  readonly projects: readonly PlatformRegistryProject[];
  readonly onSelectProject?: (projectId: string) => void;
}): PlatformWorkspaceState {
  const projects: readonly PlatformWorkspaceOption[] = input.projects.map(
    (project) => ({
      id: project.id,
      label: project.label,
      companyLabel: project.companyLabel,
    }),
  );

  return {
    companyLabel: input.companyLabel,
    projectLabel: input.projectLabel,
    projects,
    onSelectProject: input.onSelectProject,
  };
}
