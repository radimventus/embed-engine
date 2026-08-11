import {
  createPlatformAccessInviteClient,
  resolvePartnerInviteHref,
  resolvePilotWorkspace,
  type PlatformAccessInvite,
  type PlatformAccessInviteClient,
  type PlatformRole,
} from "@embed-engine/platform-access";

import { canonicalPartnerIdForOfficePartner } from "./officeReferencePartner";

export type PartnerInviteRole = "manager" | "salesman";

export type InvitePartnerUserResult =
  | {
      readonly ok: true;
      readonly invite: PlatformAccessInvite;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export type ReissuePartnerUserInviteResult =
  | {
      readonly ok: true;
      readonly invite: PlatformAccessInvite;
      readonly activationHref: string;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

const platformAccessInviteClient = createPlatformAccessInviteClient();

function rolesForPartnerInvite(
  role: PartnerInviteRole,
): readonly PlatformRole[] {
  return [role];
}

/**
 * Office access operation: resolve Builder-owned scope, then create a pending
 * invite. Project and House data are never authored here.
 */
export async function invitePartnerUser(
  input: {
    readonly partnerId: string;
    readonly name: string;
    readonly email: string;
    readonly role?: PartnerInviteRole;
    readonly invitedByUserId: string;
  },
  client: PlatformAccessInviteClient = platformAccessInviteClient,
): Promise<InvitePartnerUserResult> {
  const companyId = canonicalPartnerIdForOfficePartner(input.partnerId);
  const provision = resolvePilotWorkspace(companyId);
  if (provision === null) {
    return {
      ok: false,
      error: "Partner environment is not prepared in Builder Studio.",
    };
  }

  const email = input.email.trim().toLowerCase();
  if (email.length === 0) {
    return { ok: false, error: "Zadejte e-mail partnera." };
  }

  try {
    return {
      ok: true,
      invite: await client.createInvite({
        email,
        displayName: input.name,
        roles: rolesForPartnerInvite(input.role ?? "manager"),
        invitedByUserId: input.invitedByUserId,
        tenantId: provision.tenant.id,
        companyId: provision.company.id,
        workspaceId: provision.workspace.id,
        projectId: provision.project.id,
      }),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Pozvánku se nepodařilo vytvořit.",
    };
  }
}

export async function reissuePartnerUserInvite(
  inviteId: string,
  client: PlatformAccessInviteClient = platformAccessInviteClient,
): Promise<ReissuePartnerUserInviteResult> {
  try {
    const issued = await client.reissueInvite(inviteId);
    if (issued === null) {
      return { ok: false, error: "Pozvánku se nepodařilo obnovit." };
    }
    const { token, ...invite } = issued;
    return {
      ok: true,
      invite,
      activationHref: resolvePartnerInviteHref(token),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Pozvánku se nepodařilo obnovit.",
    };
  }
}
