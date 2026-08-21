import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  bootstrapProject,
} from '../bootstrap/projectBootstrap';
import {
  bootstrapWorkspace,
  resolveStudioHref,
} from '../bootstrap/workspaceBootstrap';
import {
  canAccessStudio,
  defaultStudioForRoles,
  primaryRole,
  studiosForRoles,
} from '../domain/roles';
import type {
  LoginCredentials,
  PlatformSession,
  PlatformStudioId,
  ProjectBootstrap,
  WorkspaceBootstrap,
} from '../domain/types';
import {
  getDefaultCompanyRegistry,
  listProjectsForWorkspace,
  type CompanyRegistryState,
} from '../registry/companyRegistry';
import {
  updateSession,
  getSharedWorkspaceContext,
} from '../session/authService';
import {
  createPlatformAccessAuthClient,
} from '../api/platformAccessClient';
import {
  clearPlatformSession,
  savePlatformSession,
} from '../session/sessionStore';
import { urlWithoutInviteParam } from './inviteRouting';
import { touchUserLastStudio } from '../registry/userRegistry';
import { isWorkspaceShellEmbed } from '../domain/workspaceShellEmbed';
import {
  clearOperatorPartnerEnvironment,
  switchOperatorPartnerStudio,
} from '../pilot/operatorPartnerEnvironment';

export type PlatformSessionContextValue = {
  readonly session: PlatformSession | null;
  /** True while the HttpOnly Platform API session is being restored. */
  readonly isRestoring: boolean;
  readonly registry: CompanyRegistryState;
  readonly bootstrap: WorkspaceBootstrap | null;
  readonly login: (credentials: LoginCredentials) => Promise<{ ok: true } | { ok: false; error: string }>;
  readonly acceptAuthenticatedSession: (session: PlatformSession) => void;
  readonly logout: () => Promise<void>;
  readonly selectStudio: (studioId: PlatformStudioId) => void;
  readonly clearStudio: () => void;
  readonly selectProject: (projectId: string) => void;
  readonly selectWorkspace: (workspaceId: string) => void;
  readonly updateWorkspaceScope: (input: {
    readonly projectId?: string | null;
    readonly activeHouseId?: string | null;
  }) => PlatformSession | null;
  readonly bootstrapActiveProject: (
    studioId: PlatformStudioId,
  ) => ProjectBootstrap | null;
  readonly canOpenStudio: (studioId: PlatformStudioId) => boolean;
  readonly availableStudios: readonly PlatformStudioId[];
  readonly refreshRegistry: () => void;
};

const PlatformSessionContext =
  createContext<PlatformSessionContextValue | null>(null);

type SessionProviderProps = {
  readonly children: ReactNode;
  /** When mounting a Studio app, bind session.activeStudioId to this studio. */
  readonly bindStudioId?: PlatformStudioId;
};

/**
 * Shared Session Provider for Builder / Manager / Sales (EPIC-BX-14).
 */
export function SessionProvider({
  children,
  bindStudioId,
}: SessionProviderProps) {
  const [registryTick, setRegistryTick] = useState(0);
  const registry = useMemo(
    () => getDefaultCompanyRegistry(),
    [registryTick],
  );
  const refreshRegistry = useCallback(() => {
    setRegistryTick((value) => value + 1);
  }, []);
  const [session, setSession] = useState<PlatformSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const applySession = useCallback((restored: PlatformSession) => {
    savePlatformSession(restored);
    // VR-04 — nested Workspace Shell views must not rewrite activeStudio.
    if (isWorkspaceShellEmbed()) {
      setSession(restored);
      return;
    }
    if (bindStudioId !== undefined && restored.activeStudioId === null) {
      // The server session has no app-local activeStudioId. Adopt the mounted
      // Studio in the in-memory projection so valid restores open its shell.
      const next = updateSession({ activeStudioId: bindStudioId });
      if (next !== null) {
        touchUserLastStudio(next.user.id, bindStudioId);
      }
      setSession(next ?? restored);
      return;
    }
    const workspaceContext = getSharedWorkspaceContext();
    if (
      bindStudioId !== undefined &&
      workspaceContext !== null &&
      (restored.activeStudioId !== bindStudioId ||
        workspaceContext.activeStudio !== bindStudioId)
    ) {
      // OF-14 — adopt this studio host; keep partner Workspace Context.
      const next = updateSession({
        activeStudioId: bindStudioId,
        workspaceContext: {
          ...workspaceContext,
          activeStudio: bindStudioId,
        },
      });
      if (next !== null) {
        touchUserLastStudio(next.user.id, bindStudioId);
      }
      setSession(next ?? restored);
      return;
    }
    if (
      bindStudioId !== undefined &&
      restored.activeStudioId !== null &&
      restored.activeStudioId !== bindStudioId
    ) {
      // Arrived via Studio Switcher — adopt this studio while keeping context.
      const next = updateSession({ activeStudioId: bindStudioId });
      if (next !== null) {
        touchUserLastStudio(next.user.id, bindStudioId);
      }
      setSession(next ?? restored);
      return;
    }
    if (bindStudioId !== undefined && restored.activeStudioId === bindStudioId) {
      touchUserLastStudio(restored.user.id, bindStudioId);
    }
    setSession(restored);
  }, [bindStudioId]);

  useEffect(() => {
    let active = true;
    setIsRestoring(true);
    void createPlatformAccessAuthClient().restoreSession()
      .then((restored) => {
        if (active && restored !== null) applySession(restored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsRestoring(false);
      });
    return () => {
      active = false;
    };
  }, [applySession]);

  const bootstrap = useMemo(
    () => (session !== null ? bootstrapWorkspace(session) : null),
    [session],
  );

  const login = useCallback(async (credentials: LoginCredentials) => {
    let result;
    try {
      result = await createPlatformAccessAuthClient().login(credentials);
    } catch {
      return {
        ok: false as const,
        error: 'Přihlášení se nepodařilo spojit s Platform API.',
      };
    }
    if (!result.ok) {
      return { ok: false as const, error: result.error };
    }
    savePlatformSession(result.session);
    setSession(result.session);
    // CAP-GOV-06 / RC-002 — prefer the Studio host that mounted SessionProvider
    // (bindStudioId). Deep-link login on Office must not teleport to Manager/Sales
    // when that host is down (white screen / endless navigation).
    const studioId =
      bindStudioId ?? defaultStudioForRoles(result.session.user.roles);
    const next = updateSession({ activeStudioId: studioId });
    if (next !== null) {
      setSession(next);
      const href = resolveStudioHref(studioId);
      if (typeof window !== 'undefined' && window.location.href !== href) {
        window.location.assign(href);
      }
    }
    return { ok: true as const };
  }, [bindStudioId]);

  const acceptAuthenticatedSession = useCallback((next: PlatformSession) => {
    applySession(next);
  }, [applySession]);

  const logout = useCallback(async () => {
    clearOperatorPartnerEnvironment();
    clearPlatformSession();
    try {
      await createPlatformAccessAuthClient().logout();
    } catch {
      // Local session projection is already cleared; server logout is best-effort.
    }
    setSession(null);
    if (typeof window !== 'undefined') {
      const nextHref = urlWithoutInviteParam(window.location.href);
      if (nextHref !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(null, '', nextHref);
      }
    }
  }, []);

  const selectStudio = useCallback((studioId: PlatformStudioId) => {
    const workspaceContext = getSharedWorkspaceContext();
    if (workspaceContext !== null) {
      // VR-04 / PT-OS-02 — PE mode stays on Workspace Host; switch in-shell surface.
      const surface =
        studioId === 'client' ||
        studioId === 'office' ||
        studioId === 'manager' ||
        studioId === 'sales' ||
        studioId === 'builder'
          ? studioId
          : 'client';
      switchOperatorPartnerStudio(surface, { retainWorkspace: true });
      return;
    }

    const next = updateSession({
      activeStudioId: studioId === 'client' ? null : studioId,
    });
    if (next !== null) {
      touchUserLastStudio(next.user.id, studioId);
      setSession(next);
      const href = resolveStudioHref(studioId);
      if (typeof window !== 'undefined' && window.location.href !== href) {
        window.location.assign(href);
      }
    }
  }, []);

  const clearStudio = useCallback(() => {
    if (getSharedWorkspaceContext() !== null) {
      // OF-13A / VR-04 — stay in Workspace; default surface is Client Studio.
      switchOperatorPartnerStudio('client', {
        retainWorkspace: true,
        navigate: false,
      });
      return;
    }
    const next = updateSession({ activeStudioId: null });
    setSession(next);
  }, []);

  const selectProject = useCallback((projectId: string) => {
    const project = registry.projects.find((item) => item.id === projectId);
    if (project === undefined) return;
    const next = updateSession({
      projectId,
      workspaceId: project.workspaceId,
      companyId: project.companyId,
    });
    setSession(next);
  }, [registry.projects]);

  const selectWorkspace = useCallback((workspaceId: string) => {
    const workspace = registry.workspaces.find((item) => item.id === workspaceId);
    if (workspace === undefined) return;
    const projects = listProjectsForWorkspace(registry, workspaceId);
    const next = updateSession({
      workspaceId,
      companyId: workspace.companyId,
      projectId: projects[0]?.id ?? null,
    });
    setSession(next);
  }, [registry]);

  /** CAP-VR38e — shared Project/House mutation with immediate React update. */
  const updateWorkspaceScope = useCallback(
    (input: {
      readonly projectId?: string | null;
      readonly activeHouseId?: string | null;
    }): PlatformSession | null => {
      if (session === null) return null;
      const projectId =
        input.projectId !== undefined ? input.projectId : session.projectId;

      const canonicalProject =
        projectId === null
          ? undefined
          : registry.canonicalProjects.find(
              (project) => project.id === projectId,
            );

      const projectChanged =
        input.projectId !== undefined && projectId !== session.projectId;
      const activeHouseId =
        input.activeHouseId !== undefined
          ? input.activeHouseId
          : projectChanged
            ? null
            : session.activeHouseId;
      const workspaceContext =
        session.workspaceContext === null
          ? null
          : {
              ...session.workspaceContext,
              projectId:
                projectId === null
                  ? session.workspaceContext.projectId
                  : projectId,
              activeHouseId,
            };
      const next = updateSession({
        ...(canonicalProject === undefined
          ? {}
          : {
              companyId: canonicalProject.companyId,
              workspaceId: canonicalProject.workspaceId,
            }),
        projectId,
        activeHouseId,
        workspaceContext:
          workspaceContext === null || canonicalProject === undefined
            ? workspaceContext
            : {
                ...workspaceContext,
                companyId: canonicalProject.companyId,
                workspaceId: canonicalProject.workspaceId,
              },
      });
      setSession(next);
      return next;
    },
    [registry.canonicalProjects, session],
  );

  const bootstrapActiveProject = useCallback(
    (studioId: PlatformStudioId) => {
      if (session === null || session.projectId === null) return null;
      return bootstrapProject({
        session,
        projectId: session.projectId,
        studioId,
      });
    },
    [session],
  );

  const availableStudios = useMemo(
    () =>
      session !== null ? studiosForRoles(session.user.roles) : [],
    [session],
  );

  const canOpenStudio = useCallback(
    (studioId: PlatformStudioId) =>
      session !== null && canAccessStudio(session.user.roles, studioId),
    [session],
  );

  const value = useMemo<PlatformSessionContextValue>(
    () => ({
      session,
      isRestoring,
      registry,
      bootstrap,
      login,
      acceptAuthenticatedSession,
      logout,
      selectStudio,
      clearStudio,
      selectProject,
      selectWorkspace,
      updateWorkspaceScope,
      bootstrapActiveProject,
      canOpenStudio,
      availableStudios,
      refreshRegistry,
    }),
    [
      session,
      isRestoring,
      registry,
      bootstrap,
      login,
      acceptAuthenticatedSession,
      logout,
      selectStudio,
      clearStudio,
      selectProject,
      selectWorkspace,
      updateWorkspaceScope,
      bootstrapActiveProject,
      canOpenStudio,
      availableStudios,
      refreshRegistry,
    ],
  );

  return (
    <PlatformSessionContext.Provider value={value}>
      {children}
    </PlatformSessionContext.Provider>
  );
}

export function usePlatformSession(): PlatformSessionContextValue {
  const ctx = useContext(PlatformSessionContext);
  if (ctx === null) {
    throw new Error('usePlatformSession requires SessionProvider');
  }
  return ctx;
}

export function usePlatformUserLabel(): string {
  const { session } = usePlatformSession();
  if (session === null) return 'Host';
  return session.user.displayName;
}

export function usePlatformRoleLabel(): string {
  const { session } = usePlatformSession();
  if (session === null) return '';
  return primaryRole(session.user.roles);
}
