import assert from 'node:assert/strict';
import test from 'node:test';

import { Window } from 'happy-dom';

import type { PlatformSession } from '../domain/types';
import {
  getDefaultCompanyRegistry,
  resetCompanyRegistryExtras,
} from '../registry/companyRegistry';
import {
  clearPlatformSession,
  loadPlatformSession,
} from '../session/sessionStore';

const P2_SESSION: PlatformSession = {
  user: {
    id: 'user-p2',
    email: 'manager@p2.test',
    displayName: 'P2 Manager',
    roles: ['manager'],
    status: 'active',
    lastLoginAt: '2026-09-16T00:00:00.000Z',
    lastActivityAt: '2026-09-16T00:00:00.000Z',
    lastStudioId: null,
  },
  tenantId: 'tenant-p2',
  companyId: 'company-p2',
  workspaceId: 'workspace-p2',
  projectId: 'project-p2',
  activeHouseId: null,
  activeStudioId: null,
  workspaceContext: null,
  rememberMe: true,
  issuedAt: '2026-09-16T00:00:00.000Z',
  expiresAt: '2026-10-16T00:00:00.000Z',
  lastLoginAt: '2026-09-16T00:00:00.000Z',
};

const P2_REGISTRY = {
  ok: true as const,
  registry: {
    tenants: [
      {
        id: 'tenant-p2',
        name: 'P2',
        companyId: 'company-p2',
        pilot: true,
        createdAt: '2026-09-16T00:00:00.000Z',
      },
    ],
    companies: [
      { id: 'company-p2', name: 'P2', tenantId: 'tenant-p2' },
    ],
    workspaces: [
      {
        id: 'workspace-p2',
        name: 'P2 Workspace',
        companyId: 'company-p2',
      },
    ],
    projects: [
      {
        id: 'project-p2',
        companyId: 'company-p2',
        workspaceId: 'workspace-p2',
        name: 'P2 Project',
        slug: 'p2',
        description: '',
        status: 'draft' as const,
        createdAt: '2026-09-16T00:00:00.000Z',
      },
    ],
    houses: [
      {
        id: 'house-p2',
        canonicalProjectId: 'project-p2',
        name: 'P2 House',
        status: 'draft',
        dataMode: 'LIVE_EMPTY' as const,
      },
    ],
  },
};

type SessionContext = ReturnType<
  typeof import('./SessionProvider')['usePlatformSession']
>;

async function withSessionProvider(
  registryStatus: number,
  assertion: (
    getContext: () => SessionContext,
    calls: string[],
    act: typeof import('react')['act'],
  ) => Promise<void>,
): Promise<void> {
  resetCompanyRegistryExtras();
  clearPlatformSession();
  assert.equal(
    getDefaultCompanyRegistry().canonicalProjects.some(
      (project) => project.id === P2_SESSION.projectId,
    ),
    false,
  );

  const window = new Window({ url: 'https://conis.cz/studio/workspace/' });
  const calls: string[] = [];
  const fetch = async (url: unknown) => {
    const pathname = new URL(String(url)).pathname;
    calls.push(pathname);
    if (pathname === '/public/auth/me') {
      return Response.json({}, { status: 401 });
    }
    if (pathname === '/public/auth/canonical-registry') {
      return registryStatus === 200
        ? Response.json(P2_REGISTRY)
        : Response.json(
            { error: 'registry unavailable' },
            { status: registryStatus },
          );
    }
    return Response.json({}, { status: 404 });
  };
  const globals = {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    navigator: window.navigator,
    fetch,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const previous = new Map(
    Object.keys(globals).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }

  const { act } = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { SessionProvider, usePlatformSession } = await import('./SessionProvider');
  let context!: ReturnType<typeof usePlatformSession>;
  function Probe() {
    context = usePlatformSession();
    return null;
  }
  const host = window.document.createElement('div');
  window.document.body.append(host);
  const root = createRoot(host as unknown as HTMLElement);
  try {
    await act(async () => {
      root.render(
        <SessionProvider>
          <Probe />
        </SessionProvider>,
      );
    });
    await assertion(() => context, calls, act);
  } finally {
    await act(async () => root.unmount());
    await window.happyDOM.abort();
    for (const [key, descriptor] of previous) {
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : Reflect.deleteProperty(globalThis, key);
    }
    clearPlatformSession();
    resetCompanyRegistryExtras();
  }
}

test('durable-only invite hydrates canonical registry before exposing P2 session to START', async () => {
  await withSessionProvider(200, async (getContext, calls, act) => {
    let accepted = false;
    await act(async () => {
      accepted = await getContext().acceptAuthenticatedSession(P2_SESSION);
    });
    const context = getContext();
    assert.equal(accepted, true);
    assert.equal(calls.at(-1), '/public/auth/canonical-registry');
    assert.equal(context.session?.projectId, 'project-p2');
    assert.equal(context.bootstrap?.company.id, 'company-p2');
    assert.equal(context.bootstrap?.workspace.id, 'workspace-p2');
    assert.equal(
      context.registry.canonicalProjects.some(
        (project) => project.id === 'project-p2',
      ),
      true,
    );
    assert.equal(
      context.registry.houses.some((house) => house.id === 'house-p2'),
      true,
    );
  });
});

test('failed invite registry hydration exposes neither P2 nor a default Project', async () => {
  await withSessionProvider(503, async (getContext, _calls, act) => {
    let accepted = true;
    await act(async () => {
      accepted = await getContext().acceptAuthenticatedSession(P2_SESSION);
    });
    const context = getContext();
    assert.equal(accepted, false);
    assert.equal(context.session, null);
    assert.equal(context.bootstrap, null);
    assert.equal(loadPlatformSession(), null);
  });
});
