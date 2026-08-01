import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestWorkspaceActive } from './requestWorkspaceActive';
import {
  closeWorkspaceProject,
  createWorkspaceProjectFromInput,
  decideProjectSwitch,
  getActiveWorkspaceProject,
  openWorkspaceProject,
  updateWorkspaceProject,
  type CreateWorkspaceProjectInput,
  type WorkspaceProject,
  type WorkspaceProjectStatus,
  type WorkspaceRegistryState,
} from './workspaceRegistry';
import {
  loadWorkspaceRegistryFromStorage,
  saveWorkspaceRegistryToStorage,
} from './workspaceStorage';

export type DirtySwitchPrompt =
  | { readonly kind: 'switch'; readonly target: WorkspaceProject }
  | { readonly kind: 'close' };

export type UpdateWorkspaceProjectInput = {
  readonly name: string;
  readonly companyId: string;
  readonly description: string;
  readonly status: WorkspaceProjectStatus;
  readonly slug: string;
  readonly metadata: string;
};

export type WorkspaceController = {
  readonly registry: WorkspaceRegistryState;
  readonly activeProject: WorkspaceProject | null;
  readonly dirtyPrompt: DirtySwitchPrompt | null;
  readonly switching: boolean;
  readonly switchError: string | null;
  readonly requestOpenProject: (
    projectId: string,
    options: {
      readonly dirty: boolean;
      readonly onBeforeSwitch?: () => Promise<void>;
    },
  ) => Promise<boolean>;
  readonly confirmDirtySave: (save: () => Promise<void>) => Promise<boolean>;
  readonly confirmDirtyDiscard: () => Promise<boolean>;
  readonly cancelDirtySwitch: () => void;
  readonly closeActiveProject: () => void;
  readonly requestCloseProject: (options: {
    readonly dirty: boolean;
  }) => void;
  readonly createProject: (
    input: CreateWorkspaceProjectInput,
    options: { readonly dirty: boolean },
  ) => Promise<WorkspaceProject | null>;
  readonly updateProject: (
    projectId: string,
    input: UpdateWorkspaceProjectInput,
  ) => void;
};

/**
 * CAP-BLD-08 / EPIC-BX-01 — workspace registry + single-project mount switching.
 */
export function useWorkspaceController(): WorkspaceController {
  const [registry, setRegistry] = useState<WorkspaceRegistryState>(() =>
    loadWorkspaceRegistryFromStorage(),
  );
  const [dirtyPrompt, setDirtyPrompt] = useState<DirtySwitchPrompt | null>(
    null,
  );
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  useEffect(() => {
    saveWorkspaceRegistryToStorage(registry);
  }, [registry]);

  const activeProject = useMemo(
    () => getActiveWorkspaceProject(registry),
    [registry],
  );

  const activate = useCallback(async (project: WorkspaceProject) => {
    setSwitching(true);
    setSwitchError(null);
    try {
      const result = await requestWorkspaceActive({
        projectId: project.id,
        packageRoot: project.packageRoot,
      });
      if (!result.ok) {
        setSwitchError(result.error);
        return false;
      }
      setRegistry((prev) => openWorkspaceProject(prev, project.id));
      setDirtyPrompt(null);
      return true;
    } catch (error: unknown) {
      setSwitchError(
        error instanceof Error ? error.message : 'Přepnutí projektu selhalo.',
      );
      return false;
    } finally {
      setSwitching(false);
    }
  }, []);

  const requestOpenProject = useCallback(
    async (
      projectId: string,
      options: {
        readonly dirty: boolean;
        readonly onBeforeSwitch?: () => Promise<void>;
      },
    ) => {
      const target = registry.projects.find((project) => project.id === projectId);
      if (target === undefined) {
        setSwitchError(`Neznámý projekt: ${projectId}`);
        return false;
      }

      const decision = decideProjectSwitch({
        dirty: options.dirty,
        activeProjectId: registry.activeProjectId,
        targetProjectId: projectId,
      });

      if (decision.action === 'confirm-dirty') {
        setDirtyPrompt({ kind: 'switch', target });
        return false;
      }

      if (options.onBeforeSwitch) {
        await options.onBeforeSwitch();
      }
      return activate(target);
    },
    [activate, registry.activeProjectId, registry.projects],
  );

  const confirmDirtySave = useCallback(
    async (save: () => Promise<void>) => {
      if (dirtyPrompt === null) {
        return false;
      }
      await save();
      if (dirtyPrompt.kind === 'close') {
        setRegistry((prev) => closeWorkspaceProject(prev));
        setDirtyPrompt(null);
        return true;
      }
      return activate(dirtyPrompt.target);
    },
    [activate, dirtyPrompt],
  );

  const confirmDirtyDiscard = useCallback(async () => {
    if (dirtyPrompt === null) {
      return false;
    }
    if (dirtyPrompt.kind === 'close') {
      setRegistry((prev) => closeWorkspaceProject(prev));
      setDirtyPrompt(null);
      return true;
    }
    return activate(dirtyPrompt.target);
  }, [activate, dirtyPrompt]);

  const cancelDirtySwitch = useCallback(() => {
    setDirtyPrompt(null);
  }, []);

  const closeActiveProject = useCallback(() => {
    setRegistry((prev) => closeWorkspaceProject(prev));
    setDirtyPrompt(null);
  }, []);

  const requestCloseProject = useCallback(
    (options: { readonly dirty: boolean }) => {
      if (registry.activeProjectId === null) {
        return;
      }
      if (options.dirty) {
        setDirtyPrompt({ kind: 'close' });
        return;
      }
      closeActiveProject();
    },
    [closeActiveProject, registry.activeProjectId],
  );

  const createProject = useCallback(
    async (
      input: CreateWorkspaceProjectInput,
      options: { readonly dirty: boolean },
    ) => {
      const name = input.name.trim();
      if (name.length === 0) {
        setSwitchError('Zadejte název projektu.');
        return null;
      }
      if (options.dirty) {
        setSwitchError('Nejdřív uložte nebo zahoďte změny aktivního projektu.');
        return null;
      }

      const created = createWorkspaceProjectFromInput(registry, input);
      setRegistry(created.state);
      const ok = await activate(created.project);
      return ok ? created.project : null;
    },
    [activate, registry],
  );

  const updateProject = useCallback(
    (projectId: string, input: UpdateWorkspaceProjectInput) => {
      setRegistry((prev) =>
        updateWorkspaceProject(prev, projectId, {
          name: input.name.trim(),
          companyId: input.companyId,
          description: input.description.trim(),
          status: input.status,
          slug: input.slug.trim() || projectId,
          metadata: input.metadata.trim(),
        }),
      );
    },
    [],
  );

  // Sync host active root on first load.
  useEffect(() => {
    const project = getActiveWorkspaceProject(registry);
    if (project === null) {
      return;
    }
    void requestWorkspaceActive({
      projectId: project.id,
      packageRoot: project.packageRoot,
    }).catch(() => {
      // Host may not be ready in unit tests.
    });
    // Intentional: once on mount with initial registry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    registry,
    activeProject,
    dirtyPrompt,
    switching,
    switchError,
    requestOpenProject,
    confirmDirtySave,
    confirmDirtyDiscard,
    cancelDirtySwitch,
    closeActiveProject,
    requestCloseProject,
    createProject,
    updateProject,
  };
}
