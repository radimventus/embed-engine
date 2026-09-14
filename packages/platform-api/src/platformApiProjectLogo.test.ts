import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

import { createPlatformApiServer } from "./index.ts";
import { FileCanonicalRegistryAuthorityRepository } from "./canonicalRegistryAuthorityRepository.ts";
import { FileProjectConfigRepository } from "./projectConfigRepository.ts";

const PROJECT_ID = "project-dynamic-logo";
const COMPANY_ID = "company-dynamic-logo";
const identities = new Map([
  [
    "session-owner",
    {
      companyId: COMPANY_ID,
      user: { roles: ["project-admin"] },
      workspaceContext: { companyId: COMPANY_ID },
    },
  ],
  [
    "session-foreign",
    {
      companyId: "company-foreign",
      user: { roles: ["manager"] },
      workspaceContext: { companyId: "company-foreign" },
    },
  ],
  [
    "session-admin",
    {
      companyId: "conis",
      user: { roles: ["conis-admin"] },
      workspaceContext: { companyId: "conis" },
    },
  ],
]);

describe("Platform API dynamic Project logo", () => {
  let directory = "";
  let baseUrl = "";
  let server: ReturnType<typeof createPlatformApiServer>;

  before(async () => {
    directory = await mkdtemp(join(tmpdir(), "conis-project-logo-api-"));
    const authority = new FileCanonicalRegistryAuthorityRepository(
      join(directory, "canonical-registry.json"),
    );
    await authority.upsertAuthorityBundle({
      tenant: {
        id: "tenant-dynamic-logo",
        name: "Dynamic",
        companyId: COMPANY_ID,
        pilot: true,
        createdAt: "2026-09-14T00:00:00.000Z",
      },
      company: {
        id: COMPANY_ID,
        name: "Dynamic Logo",
        tenantId: "tenant-dynamic-logo",
      },
      workspace: {
        id: "workspace-dynamic-logo",
        companyId: COMPANY_ID,
        name: "Dynamic Logo",
      },
      project: {
        id: PROJECT_ID,
        companyId: COMPANY_ID,
        workspaceId: "workspace-dynamic-logo",
        name: "Dynamic Logo",
        slug: PROJECT_ID,
        description: "Dynamic test project.",
      },
    });
    const configs = new FileProjectConfigRepository(
      join(directory, "project-config.json"),
    );
    server = createPlatformApiServer(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        resolve: async (token: string) => identities.get(token) ?? null,
      } as never,
      undefined,
      undefined,
      undefined,
      configs,
      undefined,
      undefined,
      undefined,
      authority,
    );
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    assert.ok(address !== null && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await rm(directory, { recursive: true, force: true });
  });

  const endpoint = (projectId = PROJECT_ID) =>
    `${baseUrl}/public/projects/${projectId}/logo`;
  const mutation = (
    token: string,
    bytes: Uint8Array,
    contentType = "image/png",
  ) =>
    ({
      method: "PUT",
      headers: {
        cookie: `__Host-conis_partner_session=${token}`,
        "content-type": contentType,
      },
      body: bytes,
    }) as RequestInit;

  it("writes, reads, replaces and deletes a durable dynamic Project logo", async () => {
    const first = Uint8Array.from([137, 80, 78, 71, 1]);
    assert.equal(
      (await fetch(endpoint(), mutation("session-owner", first))).status,
      204,
    );
    let readback = await fetch(endpoint());
    assert.equal(readback.status, 200);
    assert.equal(readback.headers.get("content-type"), "image/png");
    assert.deepEqual(new Uint8Array(await readback.arrayBuffer()), first);

    const replacement = Uint8Array.from([82, 73, 70, 70, 2, 3]);
    assert.equal(
      (
        await fetch(
          endpoint(),
          mutation("session-owner", replacement, "image/webp"),
        )
      ).status,
      204,
    );
    readback = await fetch(endpoint());
    assert.equal(readback.headers.get("content-type"), "image/webp");
    assert.deepEqual(new Uint8Array(await readback.arrayBuffer()), replacement);

    assert.equal(
      (
        await fetch(endpoint(), {
          method: "DELETE",
          headers: { cookie: "__Host-conis_partner_session=session-owner" },
        })
      ).status,
      204,
    );
    assert.equal((await fetch(endpoint())).status, 404);
  });

  it("preserves company isolation and platform admin behavior", async () => {
    const bytes = Uint8Array.from([137, 80, 78, 71]);
    assert.equal(
      (await fetch(endpoint(), mutation("session-foreign", bytes))).status,
      403,
    );
    assert.equal(
      (await fetch(endpoint(), mutation("session-admin", bytes))).status,
      204,
    );
  });

  it("requires a session for mutations and returns 404 for unknown Projects", async () => {
    const bytes = Uint8Array.from([137, 80, 78, 71]);
    assert.equal(
      (await fetch(endpoint(), mutation("missing", bytes))).status,
      401,
    );
    assert.equal(
      (
        await fetch(
          endpoint("project-does-not-exist"),
          mutation("session-owner", bytes),
        )
      ).status,
      404,
    );
  });
});
