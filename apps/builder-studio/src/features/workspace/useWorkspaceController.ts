import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { requestWorkspaceActive } from './requestWorkspaceActive';
import {
  closeWorkspaceProject,
  createWorkspaceProjectFromInput,
  decideProjectSwitch,
  getActiveWorkspaceProject,
  openWorkspaceFolder,
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
  readonly requestOpenFolder: (
    folderId: string,
    options: { readonly dirty: boolean },
  ) => Promise<string | null>;
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
 * CAP-BLD-08 / PR-003A — serialized latest-wins activation (no abort timeout).
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
  const registryRef = useRef(registry);
  const pendingTargetRef = useRef<WorkspaceProject | null>(null);
  const drainRunningRef = useRef(false);
  const hostActiveRef = useRef<{
    projectId: string;
    packageRoot: string;
  } | null>(null);

  useEffect(() => {
    registryRef.current = registry;
  }, [registry]);

  useEffect(() => {
    saveWorkspaceRegistryToStorage(registry);
  }, [registry]);

  const activeProject = useMemo(
    () => getActiveWorkspaceProject(registry),
    [registry],
  );

  const drainActivationQueue = useCallback(async (): Promise<boolean> => {
    if (drainRunningRef.current) {
      return true;
    }
    drainRunningRef.current = true;
    setSwitching(true);
    setSwitchError(null);
    let lastOk = true;

    try {
      while (pendingTargetRef.current !== null) {
        const target = pendingTargetRef.current;
        pendingTargetRef.current = null;

        const alreadyHost =
          hostActiveRef.current !== null &&
          hostActiveRef.current.projectId === target.id &&
          hostActiveRef.current.packageRoot === target.packageRoot;

        if (!alreadyHost) {
          const result = await requestWorkspaceActive({
            projectId: target.id,
            packageRoot: target.packageRoot,
          });
          // A newer target was queued while we awaited — discard this result.
          if (pendingTargetRef.current !== null) {
            continue;
          }
          if (!result.ok) {
            setSwitchError(result.error);
            lastOk = false;
            break;
          }
          hostActiveRef.current = {
            projectId: target.id,
            packageRoot: target.packageRoot,
          };
        }

        if (pendingTargetRef.current !== null) {
          continue;
        }

        setRegistry((prev) => openWorkspaceProject(prev, target.id));
        setDirtyPrompt(null);
        lastOk = true;
      }
      return lastOk;
    } finally {
      drainRunningRef.current = false;
      setSwitching(false);
      if (pendingTargetRef.current !== null) {
        void drainActivationQueue();
      }
    }
  }, []);

  const activate = useCallback(
    async (project: WorkspaceProject) => {
      pendingTargetRef.current = project;
      return drainActivationQueue();
    },
    [drainActivationQueue],
  );

  const requestOpenProject = useCallback(
    async (
      projectId: string,
      options: {
        readonly dirty: boolean;
        readonly onBeforeSwitch?: () => Promise<void>;
      },
    ) => {
      const current = registryRef.current;
      const target = current.projects.find(
        (project) => project.id === projectId,
      );
      if (target === undefined) {
        setSwitchError(`Neznámý dům: ${projectId}`);
        return false;
      }

      if (target.id === current.activeProjectId && !options.dirty) {
        setRegistry((prev) => openWorkspaceProject(prev, target.id));
        const alreadyHost =
          hostActiveRef.current !== null &&
          hostActiveRef.current.projectId === target.id &&
          hostActiveRef.current.packageRoot === target.packageRoot;
        if (alreadyHost) {
          return true;
        }
        return activate(target);
      }

      const decision = decideProjectSwitch({
        dirty: options.dirty,
        activeProjectId: current.activeProjectId,
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
    [activate],
  );

  const requestOpenFolder = useCallback(
    async (folderId: string, options: { readonly dirty: boolean }) => {
      const current = registryRef.current;
      const opened = openWorkspaceFolder(current, folderId);
      if (opened.houseId === null) {
        setRegistry(opened.state);
        setSwitchError('Vybraný projekt nemá žádný dům.');
        return null;
      }

      if (opened.houseId === current.activeProjectId) {
        setRegistry(opened.state);
        return opened.houseId;
      }

      const decision = decideProjectSwitch({
        dirty: options.dirty,
        activeProjectId: current.activeProjectId,
        targetProjectId: opened.houseId,
      });
      if (decision.action === 'confirm-dirty') {
        const target = current.projects.find(
          (project) => project.id === opened.houseId,
        );
        if (target !== undefined) {
          setDirtyPrompt({ kind: 'switch', target });
        }
        return null;
      }

      const ok = await requestOpenProject(opened.houseId, { dirty: false });
      return ok ? opened.houseId : null;
    },
    [requestOpenProject],
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
      if (registryRef.current.activeProjectId === null) {
        return;
      }
      if (options.dirty) {
        setDirtyPrompt({ kind: 'close' });
        return;
      }
      closeActiveProject();
    },
    [closeActiveProject],
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
        setSwitchError('Nejdřív uložte nebo zahoďte změny aktivního domu.');
        return null;
      }

      const created = createWorkspaceProjectFromInput(
        registryRef.current,
        input,
      );
      setRegistry(created.state);
      registryRef.current = created.state;

      const ok = await activate(created.project);
      if (!ok) {
        setSwitchError(
          (prev) =>
            prev ??
            'Projekt je založen, ale aktivace domu se nepovedla — vyberte dům vlevo.',
        );
      }
      return created.project;
    },
    [activate],
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

  useEffect(() => {
    const project = getActiveWorkspaceProject(registryRef.current);
    if (project === null) {
      return;
    }
    void requestWorkspaceActive({
      projectId: project.id,
      packageRoot: project.packageRoot,
    })
      .then((result) => {
        if (result.ok) {
          hostActiveRef.current = {
            projectId: project.id,
            packageRoot: project.packageRoot,
          };
        }
      })
      .catch(() => {
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
    requestOpenFolder,
    confirmDirtySave,
    confirmDirtyDiscard,
    cancelDirtySwitch,
    closeActiveProject,
    requestCloseProject,
    createProject,
    updateProject,
  };
}
