/**
 * CAP-BLD-08 — Workspace / Project registry metadata only (ADR-023).
 * Content remains in each House Package root. No parallel content model.
 */

export type WorkspaceProject = {
  readonly id: string;
  readonly name: string;
  /** Repo-relative HP-002 root. */
  readonly packageRoot: string;
};

export type WorkspaceRegistryState = {
  readonly projects: readonly WorkspaceProject[];
  readonly activeProjectId: string | null;
  readonly recentProjectIds: readonly string[];
  readonly lastOpenedProjectId: string | null;
};

export const DEFAULT_WORKSPACE_PROJECTS: readonly WorkspaceProject[] = [
  {
    id: 'family-98',
    name: 'Family 98',
    packageRoot: 'apps/client-studio/public/house-packages/family-98',
  },
  {
    id: 'harmony-124',
    name: 'Harmony 124',
    packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
  },
  {
    id: 'villa-168',
    name: 'Villa 168',
    packageRoot: 'apps/client-studio/public/house-package',
  },
] as const;

export const DEFAULT_ACTIVE_PROJECT_ID = 'villa-168' as const;

export const WORKSPACE_STORAGE_KEY = 'conis.builder.workspace.v1';

const MAX_RECENT = 8;

export function createInitialWorkspaceRegistry(
  projects: readonly WorkspaceProject[] = DEFAULT_WORKSPACE_PROJECTS,
  activeProjectId: string | null = DEFAULT_ACTIVE_PROJECT_ID,
): WorkspaceRegistryState {
  const active =
    activeProjectId !== null &&
    projects.some((project) => project.id === activeProjectId)
      ? activeProjectId
      : (projects[0]?.id ?? null);

  return {
    projects: [...projects],
    activeProjectId: active,
    recentProjectIds: active !== null ? [active] : [],
    lastOpenedProjectId: active,
  };
}

export function findWorkspaceProject(
  state: WorkspaceRegistryState,
  projectId: string,
): WorkspaceProject | null {
  return state.projects.find((project) => project.id === projectId) ?? null;
}

export function getActiveWorkspaceProject(
  state: WorkspaceRegistryState,
): WorkspaceProject | null {
  if (state.activeProjectId === null) {
    return null;
  }
  return findWorkspaceProject(state, state.activeProjectId);
}

function pushRecent(
  recent: readonly string[],
  projectId: string,
): readonly string[] {
  return [
    projectId,
    ...recent.filter((id) => id !== projectId),
  ].slice(0, MAX_RECENT);
}

/** Open / switch active project (metadata only). */
export function openWorkspaceProject(
  state: WorkspaceRegistryState,
  projectId: string,
): WorkspaceRegistryState {
  const project = findWorkspaceProject(state, projectId);
  if (project === null) {
    return state;
  }
  return {
    ...state,
    activeProjectId: projectId,
    lastOpenedProjectId: projectId,
    recentProjectIds: pushRecent(state.recentProjectIds, projectId),
  };
}

/** Close active project (keeps registry; clears active). */
export function closeWorkspaceProject(
  state: WorkspaceRegistryState,
): WorkspaceRegistryState {
  return {
    ...state,
    activeProjectId: null,
  };
}

export function registerWorkspaceProject(
  state: WorkspaceRegistryState,
  project: WorkspaceProject,
): WorkspaceRegistryState {
  const without = state.projects.filter((item) => item.id !== project.id);
  return {
    ...state,
    projects: [...without, project],
  };
}

export type WorkspacePersistedSlice = {
  readonly activeProjectId: string | null;
  readonly recentProjectIds: readonly string[];
  readonly lastOpenedProjectId: string | null;
  /** Extra projects opened beyond defaults (metadata only). */
  readonly extraProjects: readonly WorkspaceProject[];
};

export function toPersistedWorkspaceSlice(
  state: WorkspaceRegistryState,
): WorkspacePersistedSlice {
  const defaultIds = new Set(DEFAULT_WORKSPACE_PROJECTS.map((p) => p.id));
  return {
    activeProjectId: state.activeProjectId,
    recentProjectIds: state.recentProjectIds,
    lastOpenedProjectId: state.lastOpenedProjectId,
    extraProjects: state.projects.filter((p) => !defaultIds.has(p.id)),
  };
}

export function mergePersistedWorkspaceSlice(
  persisted: WorkspacePersistedSlice | null,
): WorkspaceRegistryState {
  const base = createInitialWorkspaceRegistry();
  if (persisted === null) {
    return base;
  }

  const extras = Array.isArray(persisted.extraProjects)
    ? persisted.extraProjects.filter(
        (project) =>
          typeof project?.id === 'string' &&
          typeof project?.name === 'string' &&
          typeof project?.packageRoot === 'string',
      )
    : [];

  const projects = [...DEFAULT_WORKSPACE_PROJECTS, ...extras];
  const activeCandidate =
    persisted.activeProjectId ?? persisted.lastOpenedProjectId ?? base.activeProjectId;
  const active =
    activeCandidate !== null &&
    projects.some((project) => project.id === activeCandidate)
      ? activeCandidate
      : base.activeProjectId;

  const recent = (
    Array.isArray(persisted.recentProjectIds)
      ? persisted.recentProjectIds.filter((id) =>
          projects.some((project) => project.id === id),
        )
      : []
  ).slice(0, MAX_RECENT);

  return {
    projects,
    activeProjectId: active,
    recentProjectIds:
      recent.length > 0
        ? recent
        : active !== null
          ? [active]
          : [],
    lastOpenedProjectId:
      persisted.lastOpenedProjectId !== null &&
      projects.some((project) => project.id === persisted.lastOpenedProjectId)
        ? persisted.lastOpenedProjectId
        : active,
  };
}

export type ProjectSwitchDecision =
  | { readonly action: 'switch' }
  | { readonly action: 'confirm-dirty' };

export function decideProjectSwitch(input: {
  readonly dirty: boolean;
  readonly targetProjectId: string;
  readonly activeProjectId: string | null;
}): ProjectSwitchDecision {
  if (
    input.activeProjectId !== null &&
    input.targetProjectId === input.activeProjectId
  ) {
    return { action: 'switch' };
  }
  if (input.dirty) {
    return { action: 'confirm-dirty' };
  }
  return { action: 'switch' };
}
