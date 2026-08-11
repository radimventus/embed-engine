import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import {
  type PlatformAccessInvite,
  type PlatformAccessInviteClient,
  type PlatformAccessInviteCreateInput,
  type PlatformAccessInviteIssue,
} from "@embed-engine/platform-access";

import { shouldShowActivationLinkAction } from "../features/partners/PartnerUserInvitationSection.tsx";
import {
  invitePartnerUser,
  reissuePartnerUserInvite,
} from "./invitePartnerUser.ts";

describe("Office partner user invitation", () => {
  function createInviteClient(): {
    readonly client: PlatformAccessInviteClient;
    readonly creates: PlatformAccessInviteCreateInput[];
  } {
    const creates: PlatformAccessInviteCreateInput[] = [];
    const resolvedTokens = new Map<string, PlatformAccessInvite>();
    let sequence = 0;

    function issue(
      input: PlatformAccessInviteCreateInput,
      token = `token-${++sequence}`,
    ): PlatformAccessInviteIssue {
      const invite: PlatformAccessInviteIssue = {
        id: "invite-anna",
        email: input.email,
        displayName: input.displayName,
        roles: input.roles,
        tenantId: input.tenantId,
        companyId: input.companyId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        status: "pending",
        createdAt: "2026-08-10T10:00:00.000Z",
        activatedAt: null,
        ndaAcceptedAt: null,
        expiresAt: "2026-08-17T10:00:00.000Z",
        token,
      };
      resolvedTokens.set(token, invite);
      return invite;
    }

    return {
      creates,
      client: {
        async createInvite(input) {
          creates.push(input);
          return issue(input);
        },
        async reissueInvite(id) {
          if (id !== "invite-anna") return null;
          for (const token of resolvedTokens.keys())
            resolvedTokens.delete(token);
          return issue(creates[0]!, "token-reissued");
        },
        async revokeInvite() {
          return null;
        },
        async resolveInvite(token) {
          return resolvedTokens.get(token) ?? null;
        },
        async activateInvite() {
          return { ok: false, error: "Not used by this test." };
        },
      },
    };
  }

  it("binds a default Manager invite to DSE canonical context through the shared client", async () => {
    const { client, creates } = createInviteClient();

    const result = await invitePartnerUser(
      {
        partnerId: "p-dse",
        name: "Anna Manager",
        email: "anna.manager@dse.test",
        invitedByUserId: "user-radim",
      },
      client,
    );

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.invite.status, "pending");
    assert.deepEqual(result.invite.roles, ["manager"]);
    assert.equal(result.invite.tenantId, "tenant-domy-s-energii");
    assert.equal(result.invite.companyId, "company-domy-s-energii");
    assert.equal(result.invite.workspaceId, "domy-s-energii-main");
    assert.equal(result.invite.projectId, "project-domy-s-energii");
    assert.deepEqual(creates[0]?.roles, ["manager"]);
  });

  it("preserves Sales role and invalidates the old token when reissuing", async () => {
    const { client, creates } = createInviteClient();

    const created = await invitePartnerUser(
      {
        partnerId: "p-dse",
        name: "Petr Sales",
        email: "petr.sales@dse.test",
        role: "salesman",
        invitedByUserId: "user-radim",
      },
      client,
    );

    assert.equal(created.ok, true);
    if (!created.ok) return;
    assert.deepEqual(creates[0]?.roles, ["salesman"]);

    const reissued = await reissuePartnerUserInvite(created.invite.id, client);
    assert.equal(reissued.ok, true);
    if (!reissued.ok) return;
    assert.match(reissued.activationHref, /[?&]invite=token-reissued$/);
    assert.equal(await client.resolveInvite("token-1"), null);
    assert.equal(
      (await client.resolveInvite("token-reissued"))?.status,
      "pending",
    );
  });

  it("shows the activation-link action for every pending shared invite", async () => {
    const { client } = createInviteClient();
    const created = await invitePartnerUser(
      {
        partnerId: "p-dse",
        name: "Anna Manager",
        email: "anna.copy-link@dse.test",
        invitedByUserId: "user-radim",
      },
      client,
    );

    assert.equal(created.ok, true);
    if (!created.ok) return;
    assert.equal(shouldShowActivationLinkAction(created.invite), true);
    assert.equal(
      shouldShowActivationLinkAction({
        ...created.invite,
        status: "activated",
      }),
      false,
    );
  });

  it("does not use the legacy local invite store", async () => {
    const source = await readFile(
      new URL("./invitePartnerUser.ts", import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(source, /inviteStore/);
  });
});
