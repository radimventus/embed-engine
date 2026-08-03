import {
  createContext,
  useCallback,
  useContext,
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
  login as authLogin,
  logout as authLogout,
  restoreSession,
  updateSession,
} from '../session/authService';
import { touchUserLastStudio } from '../registry/userRegistry';
import {
  getOperatorPartnerEnvironment,
  returnFromOperatorPartnerEnvironment,
  clearOperatorPartnerEnvironment,
} from '../pilot/operatorPartnerEnvironment';

export type PlatformSessionContextValue = {
  readonly session: PlatformSession | null;
  readonly registry: CompanyRegistryState;
  readonly bootstrap: WorkspaceBootstrap | null;
  readonly login: (credentials: LoginCredentials) => { ok: true } | { ok: false; error: string };
  readonly logout: () => void;
  readonly selectStudio: (studioId: PlatformStudioId) => void;
  readonly clearStudio: () => void;
  readonly selectProject: (projectId: string) => void;
  readonly selectWorkspace: (workspaceId: string) => void;
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
  const [session, setSession] = useState<PlatformSession | null>(() => {
    const restored = restoreSession();
    if (restored === null) return null;
    if (bindStudioId !== undefined && restored.activeStudioId === null) {
      // Direct deep-link into a studio after login from another tab — keep landing
      // until user explicitly selects, unless they already picked this studio.
      return restored;
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
      return next ?? restored;
    }
    if (bindStudioId !== undefined && restored.activeStudioId === bindStudioId) {
      touchUserLastStudio(restored.user.id, bindStudioId);
    }
    return restored;
  });

  const bootstrap = useMemo(
    () => (session !== null ? bootstrapWorkspace(session) : null),
    [session],
  );

  const login = useCallback((credentials: LoginCredentials) => {
    const result = authLogin(credentials);
    if (!result.ok) {
      return { ok: false as const, error: result.error };
    }
    setSession(result.session);
    // RC-002 — after login, land on the studio that matches the user's role.
    const studioId = defaultStudioForRoles(result.session.user.roles);
    const next = updateSession({ activeStudioId: studioId });
    if (next !== null) {
      setSession(next);
      const href = resolveStudioHref(studioId);
      if (typeof window !== 'undefined' && window.location.href !== href) {
        window.location.assign(href);
      }
    }
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    clearOperatorPartnerEnvironment();
    authLogout();
    setSession(null);
  }, []);

  const selectStudio = useCallback((studioId: PlatformStudioId) => {
    const operatorPe = getOperatorPartnerEnvironment();
    if (operatorPe !== null) {
      if (studioId === 'office') {
        returnFromOperatorPartnerEnvironment();
        return;
      }
      if (studioId === 'builder') {
        // Partner Environment does not include Builder.
        return;
      }
      const next = updateSession({
        companyId: operatorPe.companyId,
        workspaceId: operatorPe.workspaceId,
        projectId: operatorPe.projectId,
        activeStudioId: studioId,
      });
      if (next !== null) {
        touchUserLastStudio(next.user.id, studioId);
        setSession(next);
        const href = resolveStudioHref(studioId);
        if (typeof window !== 'undefined' && window.location.href !== href) {
          window.location.assign(href);
        }
      }
      return;
    }

    const next = updateSession({ activeStudioId: studioId });
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
      registry,
      bootstrap,
      login,
      logout,
      selectStudio,
      clearStudio,
      selectProject,
      selectWorkspace,
      bootstrapActiveProject,
      canOpenStudio,
      availableStudios,
      refreshRegistry,
    }),
    [
      session,
      registry,
      bootstrap,
      login,
      logout,
      selectStudio,
      clearStudio,
      selectProject,
      selectWorkspace,
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
