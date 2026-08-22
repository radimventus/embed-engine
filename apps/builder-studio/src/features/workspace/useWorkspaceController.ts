import { ensureCanonicalProjectAuthority } from '@embed-engine/platform-access';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createWorkspaceProjectChangeMessage,
  createWorkspaceHouseChangeMessage,
  createWorkspaceHouseScopeRequestMessage,
  createPlatformAccessAuthClient,
  getCanonicalHouse,
  isHouseInProject,
  isCanonicalProjectId,
  loadPlatformSession,
  resolveWorkspaceHostHref,
  savePlatformSession,
  upsertWorkspaceAuthoredHouse,
  updateSession,
  type WorkspaceAuthoredHouseIdentity,
} from '@embed-engine/platform-access';

import { requestWorkspaceActive } from './requestWorkspaceActive';
import {
  closeWorkspaceProject,
  createWorkspaceObjectFromInput,
  createWorkspaceProjectFromInput,
  recoverDefaultProjectHousesInWorkspace,
  decideProjectSwitch,
  getActiveWorkspaceProject,
  openWorkspaceFolder,
  openWorkspaceProject,
  registerWorkspaceProject,
  resolveWorkspaceObjectIdentity,
  updateWorkspaceProject,
  type CreateWorkspaceObjectInput,
  type CreateWorkspaceProjectInput,
  type WorkspaceProject,
  type WorkspaceProjectFolder,
  type WorkspaceProjectStatus,
  type WorkspaceRegistryState,
} from './workspaceRegistry';
import {
  loadWorkspaceRegistryFromStorage,
  saveWorkspaceRegistryToStorage,
} from './workspaceStorage';

const HOUSE_PACKAGE_INITIALIZE_API = '/__builder/house-package/initialize';

async function initializeHousePackageForBuilder(
  houseId: string,
): Promise<string> {
  const response = await fetch(HOUSE_PACKAGE_INITIALIZE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ houseId }),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (
    payload !== null &&
    typeof payload === 'object' &&
    (payload as { ok?: unknown }).ok === true &&
    (payload as { houseId?: unknown }).houseId === houseId &&
    typeof (payload as { packageRoot?: unknown }).packageRoot === 'string' &&
    (payload as { packageRoot: string }).packageRoot.trim().length > 0
  ) {
    return (payload as { packageRoot: string }).packageRoot;
  }
  const error =
    payload !== null &&
    typeof payload === 'object' &&
    typeof (payload as { error?: unknown }).error === 'string'
      ? (payload as { error: string }).error
      : `House Package initialization failed (HTTP ${response.status}).`;
  throw new Error(error);
}

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

export type CreateWorkspaceProjectResult =
  | { readonly folder: WorkspaceProjectFolder; readonly error: null }
  | { readonly folder: null; readonly error: string };

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
  ) => Promise<CreateWorkspaceProjectResult>;
  readonly createObject: (
    input: CreateWorkspaceObjectInput,
    options: { readonly dirty: boolean },
  ) => Promise<WorkspaceProject | null>;
  readonly recoverDefaultHouses: () => {
    readonly message: string;
    readonly createdCount: number;
  } | null;
  readonly updateProject: (
    projectId: string,
    input: UpdateWorkspaceProjectInput,
  ) => void;
};

/** Canonical Reference content is activated without the Builder HP-002 host. */
export function requiresLegacyWorkspaceActivation(
  houseId: string,
  packageRoot?: string,
): boolean {
  const canonicalHouse = getCanonicalHouse(houseId)?.house ?? null;

  if (canonicalHouse?.dataMode === 'REFERENCE_DEMO') {
    return false;
  }

  return (
    packageRoot === undefined ||
    packageRoot.trim().length > 0
  );
}

/**
 * `/api/workspace/active` is Vite middleware that selects a disk package for
 * the local Builder host. Published Studio is static and has no such endpoint.
 */
export function canUseLegacyWorkspaceActivation(
  isDevelopment = import.meta.env?.DEV ?? false,
): boolean {
  return isDevelopment;
}

function publishWorkspaceProjectChange(projectId: string): void {
  if (
    typeof window === 'undefined' ||
    window.parent === window ||
    !isCanonicalProjectId(projectId)
  ) {
    return;
  }
  const targetOrigin = new URL(resolveWorkspaceHostHref()).origin;
  window.parent.postMessage(
    createWorkspaceProjectChangeMessage(projectId),
    targetOrigin,
  );
}

function publishWorkspaceHouseChange(houseId: string | null): void {
  if (typeof window === 'undefined' || window.parent === window) {
    return;
  }
  const targetOrigin = new URL(resolveWorkspaceHostHref()).origin;
  window.parent.postMessage(
    createWorkspaceHouseChangeMessage(houseId),
    targetOrigin,
  );
}

/**
 * Builder-authored drafts restore from the Builder registry before their
 * transient CPL projection is available, so their scoped folder is the local
 * ownership proof; canonical Houses use the shared CPL validator.
 */
export function resolveBuilderActiveHouseId(
  projectId: string,
  house: WorkspaceProject | null,
): string | null {
  if (
    house === null ||
    house.folderId !== projectId ||
    !isCanonicalProjectId(projectId)
  ) {
    return null;
  }
  return isHouseInProject(house.id, projectId) || house.status === 'draft'
    ? house.id
    : null;
}

export function isBuilderAuthoredHouseForScope(
  projectId: string,
  house: WorkspaceProject | null,
): house is WorkspaceProject {
  return (
    house !== null &&
    house.status === 'draft' &&
    house.folderId === projectId &&
    isCanonicalProjectId(projectId)
  );
}

export function shouldRecoverLegacyLiveEmptyHouse(
  projectId: string,
  house: WorkspaceProject,
): boolean {
  return (
    isBuilderAuthoredHouseForScope(projectId, house) &&
    house.packageRoot.trim().length === 0
  );
}

function prepareBuilderHouseScope(
  projectId: string,
  house: WorkspaceProject | null,
): {
  readonly activeHouseId: string | null;
  readonly authoredHouseIdentity: WorkspaceAuthoredHouseIdentity | undefined;
} {
  const activeHouseId = resolveBuilderActiveHouseId(projectId, house);
  const isAuthoredHouse = isBuilderAuthoredHouseForScope(projectId, house);
  updateSession({
    projectId,
    activeHouseId: isAuthoredHouse ? null : activeHouseId,
  });
  let authoredHouseIdentity: WorkspaceAuthoredHouseIdentity | undefined;
  if (isAuthoredHouse) {
    authoredHouseIdentity = {
      houseId: house.id,
      name: house.name,
      canonicalProjectId: projectId,
      packageRoot: house.packageRoot,
      dataMode: 'LIVE_EMPTY',
      status: 'draft',
    };
    upsertWorkspaceAuthoredHouse(authoredHouseIdentity);
    updateSession({ projectId, activeHouseId });
  }
  return { activeHouseId, authoredHouseIdentity };
}

async function awaitAuthoritativeBuilderHouseScope(input: {
  readonly projectId: string;
  readonly activeHouseId: string | null;
  readonly authoredHouseIdentity: WorkspaceAuthoredHouseIdentity | undefined;
}): Promise<void> {
  if (typeof window !== 'undefined' && window.parent !== window) {
    const channel = new MessageChannel();
    const response = new Promise<{ readonly ok: boolean; readonly error?: string }>(
      (resolve) => {
        channel.port1.onmessage = (event: MessageEvent<unknown>) => {
          const value = event.data as { readonly ok?: unknown; readonly error?: unknown };
          resolve({
            ok: value.ok === true,
            ...(typeof value.error === 'string' ? { error: value.error } : {}),
          });
        };
      },
    );
    window.parent.postMessage(
      createWorkspaceHouseScopeRequestMessage({
        houseId: input.activeHouseId,
        ...(input.authoredHouseIdentity === undefined
          ? {}
          : { authoredHouseIdentity: input.authoredHouseIdentity }),
      }),
      new URL(resolveWorkspaceHostHref()).origin,
      [channel.port2],
    );
    const result = await response;
    if (!result.ok) {
      throw new Error(
        result.error ?? 'Platform API nepotvrdilo oprávnění House Package.',
      );
    }
    return;
  }

  const session = loadPlatformSession();
  if (session === null) {
    throw new Error('Nejste přihlášeni.');
  }
  const reconciled =
    await ensureCanonicalProjectAuthority(input.projectId);
  if (!reconciled.ok) {
    throw new Error(reconciled.error);
  }

  const result = await createPlatformAccessAuthClient().mutateSessionContext({
    action: 'switch',
    activeStudio: 'builder',
    projectId: input.projectId,
    activeHouseId: input.activeHouseId,
    authoredHouseIdentities: [
      ...(session.workspaceContext?.authoredHouseIdentities ?? []).filter(
        (identity) => identity.houseId !== input.authoredHouseIdentity?.houseId,
      ),
      ...(input.authoredHouseIdentity === undefined
        ? []
        : [input.authoredHouseIdentity]),
    ],
  });
  if (
    !result.ok ||
    result.session.projectId !== input.projectId ||
    result.session.activeHouseId !== input.activeHouseId
  ) {
    throw new Error(
      result.ok
        ? 'Platform API nepotvrdilo požadovaný House scope.'
        : result.error,
    );
  }
  savePlatformSession(result.session);
}

/**
 * Activation boundary: no House Package read or mount may begin until the
 * authoritative Platform API scope transition has resolved successfully.
 */
export async function runBuilderHouseActivation(input: {
  readonly prepareLocalScope: () => void;
  readonly authorizeScope: () => Promise<void>;
  readonly mountHousePackage: () => Promise<void>;
}): Promise<void> {
  input.prepareLocalScope();
  await input.authorizeScope();
  await input.mountHousePackage();
}

function publishBuilderHouseScope(
  projectId: string,
  house: WorkspaceProject | null,
): void {
  const scope = prepareBuilderHouseScope(projectId, house);
  publishWorkspaceHouseChange(scope.activeHouseId);
}

/**
 * CAP-BLD-08 / CAP-PLAT-02a — workspace controller.
 * Domain lists from CPL via workspaceRegistry compose; local state = selection + UI.
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
        let target = pendingTargetRef.current;
        pendingTargetRef.current = null;
        const previousSession = loadPlatformSession();
        try {
          let targetScope: ReturnType<typeof prepareBuilderHouseScope> | null =
            null;
          await runBuilderHouseActivation({
            prepareLocalScope: () => {
              targetScope = prepareBuilderHouseScope(target.folderId, target);
            },
            authorizeScope: () => {
              if (targetScope === null) {
                throw new Error('House scope nebyl připraven.');
              }
              return awaitAuthoritativeBuilderHouseScope({
                projectId: target.folderId,
                activeHouseId: targetScope.activeHouseId,
                authoredHouseIdentity: targetScope.authoredHouseIdentity,
              });
            },
            // The concrete Builder package activation follows this boundary.
            mountHousePackage: async () => undefined,
          });
        } catch (error) {
          // Optimistic local session was written before authorization.
          // Restore the previous server-backed Partner Environment; never
          // substitute a Builder-local previous house (that was DSE).
          if (previousSession !== null) {
            savePlatformSession(previousSession);
          }
          setSwitchError(
            error instanceof Error
              ? error.message
              : 'Oprávnění House Package se nepodařilo potvrdit.',
          );
          lastOk = false;
          break;
        }

        if (shouldRecoverLegacyLiveEmptyHouse(target.folderId, target)) {
          try {
            const packageRoot = await initializeHousePackageForBuilder(target.id);
            if (pendingTargetRef.current !== null) {
              continue;
            }
            const recoveredState = registerWorkspaceProject(
              registryRef.current,
              { ...target, packageRoot },
            );
            const recoveredTarget = recoveredState.projects.find(
              (project) => project.id === target.id,
            );
            if (recoveredTarget === undefined) {
              setSwitchError('Dům se po obnově House Package nepodařilo načíst.');
              lastOk = false;
              break;
            }
            registryRef.current = recoveredState;
            setRegistry(recoveredState);
            saveWorkspaceRegistryToStorage(recoveredState);
            target = recoveredTarget;
          } catch (error) {
            setSwitchError(
              error instanceof Error
                ? error.message
                : 'Obnovu House Package se nepodařilo dokončit.',
            );
            lastOk = false;
            break;
          }
        }

        const alreadyHost =
          hostActiveRef.current !== null &&
          hostActiveRef.current.projectId === target.id &&
          hostActiveRef.current.packageRoot === target.packageRoot;

        if (
          !alreadyHost &&
          canUseLegacyWorkspaceActivation() &&
          requiresLegacyWorkspaceActivation(target.id, target.packageRoot)
        ) {
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
        registryRef.current = opened.state;
        publishBuilderHouseScope(folderId, null);
        publishWorkspaceProjectChange(folderId);
        setSwitchError(null);
        return null;
      }

      if (opened.houseId === current.activeProjectId) {
        setRegistry(opened.state);
        publishBuilderHouseScope(
          folderId,
          current.projects.find((project) => project.id === opened.houseId) ??
            null,
        );
        publishWorkspaceProjectChange(folderId);
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

      publishBuilderHouseScope(folderId, null);
      publishWorkspaceProjectChange(folderId);
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
        const error = 'Zadejte název projektu.';
        setSwitchError(error);
        return { folder: null, error };
      }
      if (options.dirty) {
        const error = 'Nejdřív uložte nebo zahoďte změny aktivního domu.';
        setSwitchError(error);
        return { folder: null, error };
      }

      let created: ReturnType<typeof createWorkspaceProjectFromInput>;
      try {
        created = createWorkspaceProjectFromInput(
          registryRef.current,
          input,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Nepodařilo se založit projekt.';
        setSwitchError(message);
        return { folder: null, error: message };
      }
      const opened = openWorkspaceFolder(created.state, created.folder.id);
      setRegistry(opened.state);
      registryRef.current = opened.state;
      saveWorkspaceRegistryToStorage(opened.state);
      publishBuilderHouseScope(created.folder.id, null);
      publishWorkspaceProjectChange(created.folder.id);
      setSwitchError(null);
      return { folder: created.folder, error: null };
    },
    [],
  );

  const createObject = useCallback(
    async (
      input: CreateWorkspaceObjectInput,
      options: { readonly dirty: boolean },
    ) => {
      const name = input.name.trim();
      if (name.length === 0) {
        setSwitchError('Zadejte název objektu.');
        return null;
      }
      if (registryRef.current.activeFolderId === null) {
        setSwitchError('Nejdřív vyberte projekt.');
        return null;
      }
      if (options.dirty) {
        setSwitchError('Nejdřív uložte nebo zahoďte změny aktivního domu.');
        return null;
      }

      const identity = resolveWorkspaceObjectIdentity(
        registryRef.current,
        input,
      );
      if (identity === null) {
        setSwitchError('Objekt se nepodařilo založit.');
        return null;
      }

      let created: ReturnType<typeof createWorkspaceObjectFromInput>;
      try {
        const packageRoot = await initializeHousePackageForBuilder(
          identity.houseId,
        );
        created = createWorkspaceObjectFromInput(
          registryRef.current,
          input,
          packageRoot,
        );
      } catch (error) {
        setSwitchError(
          error instanceof Error
            ? error.message
            : 'Objekt se nepodařilo založit.',
        );
        return null;
      }
      if (created === null) {
        setSwitchError('Objekt se nepodařilo založit.');
        return null;
      }

      setRegistry(created.state);
      registryRef.current = created.state;
      saveWorkspaceRegistryToStorage(created.state);

      const ok = await activate(created.project);
      if (!ok) {
        setSwitchError(
          (prev) =>
            prev ??
            'Objekt je založen, ale aktivace se nepovedla — vyberte dům vlevo.',
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

  const recoverDefaultHouses = useCallback(() => {
    if (registryRef.current.activeFolderId === null) {
      setSwitchError('Nejdřív vyberte projekt.');
      return null;
    }
    const recovered = recoverDefaultProjectHousesInWorkspace(registryRef.current);
    if (recovered === null) {
      setSwitchError('Nejdřív vyberte projekt.');
      return null;
    }
    setRegistry(recovered.state);
    registryRef.current = recovered.state;
    setSwitchError(null);
    return {
      message: recovered.result.message,
      createdCount: recovered.result.createdCount,
    };
  }, []);

  useEffect(() => {
    const project = getActiveWorkspaceProject(registryRef.current);
    if (project === null) {
      return;
    }
    if (
      canUseLegacyWorkspaceActivation() &&
      requiresLegacyWorkspaceActivation(project.id, project.packageRoot)
    ) {
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
    }
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
    createObject,
    recoverDefaultHouses,
    updateProject,
  };
}
