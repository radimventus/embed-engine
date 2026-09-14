import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";
import { login } from "../session/authService";
import {
  clearPlatformSession,
  loadPlatformSession,
  savePlatformSession,
} from "../session/sessionStore";
import { switchAuthoritativeProjectContext } from "../pilot/authoritativeProjectContext";

test("DSE → NEMA → DSE keeps API, memory session and React context on the latest durable project", async () => {
  clearPlatformSession();
  const authenticated = login({
    email: "radim@conis.local",
    password: "demo",
    rememberMe: false,
  });
  assert.ok(authenticated.ok);
  if (!authenticated.ok) return;
  const dse = { ...authenticated.session, projectId: "project-domy-s-energii" };
  savePlatformSession(dse);

  const window = new Window({ url: "https://conis.cz/studio/office/" });
  const contextBodies: Array<Record<string, unknown>> = [];
  let durable = dse;
  const fetch = async (url: unknown, init?: RequestInit) => {
    const href = String(url);
    if (href.endsWith("/public/auth/me")) return Response.json(durable);
    if (
      href.endsWith("/public/auth/canonical-project-authority") &&
      init?.method === "POST"
    ) {
      return Response.json({ ok: true });
    }
    if (href.endsWith("/public/auth/canonical-registry")) {
      return Response.json({
        ok: true,
        registry: {
          tenants: [
            {
              id: "tenant-nema",
              name: "Nema",
              companyId: "company-nema",
              pilot: false,
              createdAt: "2026-09-14T00:00:00.000Z",
            },
          ],
          companies: [
            { id: "company-nema", name: "Nema", tenantId: "tenant-nema" },
          ],
          workspaces: [
            {
              id: "workspace-nema",
              name: "Nema Workspace",
              companyId: "company-nema",
            },
          ],
          projects: [
            {
              id: "project-nema-cz",
              name: "Nema.cz",
              companyId: "company-nema",
              workspaceId: "workspace-nema",
              status: "draft",
              slug: "nema-cz",
              description: "",
              createdAt: "2026-09-14T00:00:00.000Z",
            },
          ],
          houses: [],
        },
      });
    }
    if (href.endsWith("/public/auth/context")) {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      contextBodies.push(body);
      durable = {
        ...durable,
        projectId: String(body.projectId),
        activeStudioId: String(
          body.activeStudio,
        ) as typeof durable.activeStudioId,
      };
      return Response.json({ ok: true, session: durable });
    }
    return Response.json({}, { status: 404 });
  };
  const globals = {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    navigator: window.navigator,
    CustomEvent: window.CustomEvent,
    fetch,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const previous = new Map(
    Object.keys(globals).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  for (const [key, value] of Object.entries(globals))
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });

  const { act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { SessionProvider, usePlatformSession } =
    await import("./SessionProvider");
  let reactProjectId: string | null = null;
  function Probe() {
    reactProjectId = usePlatformSession().session?.projectId ?? null;
    return null;
  }
  const host = window.document.createElement("div");
  window.document.body.append(host);
  const root = createRoot(host as unknown as HTMLElement);
  try {
    await act(async () =>
      root.render(
        <SessionProvider bindStudioId="office">
          <Probe />
        </SessionProvider>,
      ),
    );
    for (const [projectId, studio] of [
      ["project-nema-cz", "client"],
      ["project-domy-s-energii", "builder"],
    ] as const) {
      await act(async () => {
        const result = await switchAuthoritativeProjectContext(
          projectId,
          studio,
        );
        assert.equal(result.ok, true, JSON.stringify(result));
      });
      assert.equal(contextBodies.at(-1)?.projectId, projectId);
      assert.equal(durable.projectId, projectId);
      assert.equal(loadPlatformSession()?.projectId, projectId);
      assert.equal(reactProjectId, projectId);
    }
    assert.deepEqual(
      contextBodies.map((body) => body.projectId),
      ["project-nema-cz", "project-domy-s-energii"],
    );
  } finally {
    await act(async () => root.unmount());
    await window.happyDOM.abort();
    for (const [key, descriptor] of previous)
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : Reflect.deleteProperty(globalThis, key);
    clearPlatformSession();
  }
});
