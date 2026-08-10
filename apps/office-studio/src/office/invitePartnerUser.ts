import {
  createPilotInvite,
  listInvites,
  resolvePilotWorkspace,
  type PilotInvite,
  type PlatformRole,
} from '@embed-engine/platform-access';

import { canonicalPartnerIdForOfficePartner } from './officeReferencePartner';

export type PartnerInviteRole = 'manager' | 'salesman';

export type InvitePartnerUserResult =
  | {
      readonly ok: true;
      readonly invite: PilotInvite;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

function rolesForPartnerInvite(role: PartnerInviteRole): readonly PlatformRole[] {
  return [role];
}

/**
 * Office access operation: resolve Builder-owned scope, then create a pending
 * invite. Project and House data are never authored here.
 */
export function invitePartnerUser(input: {
  readonly partnerId: string;
  readonly name: string;
  readonly email: string;
  readonly role?: PartnerInviteRole;
  readonly invitedByUserId: string;
}): InvitePartnerUserResult {
  const companyId = canonicalPartnerIdForOfficePartner(input.partnerId);
  const provision = resolvePilotWorkspace(companyId);
  if (provision === null) {
    return {
      ok: false,
      error: 'Partner environment is not prepared in Builder Studio.',
    };
  }

  const email = input.email.trim().toLowerCase();
  if (email.length === 0) {
    return { ok: false, error: 'Zadejte e-mail partnera.' };
  }
  const existing = listInvites().find(
    (invite) =>
      invite.status === 'pending' &&
      invite.email === email &&
      invite.companyId === provision.company.id &&
      invite.projectId === provision.project.id,
  );
  if (existing !== undefined) {
    return {
      ok: false,
      error: 'Pro tohoto uživatele již čeká pozvánka partnera.',
    };
  }

  return {
    ok: true,
    invite: createPilotInvite({
      email,
      displayName: input.name,
      roles: rolesForPartnerInvite(input.role ?? 'manager'),
      invitedByUserId: input.invitedByUserId,
      tenantId: provision.tenant.id,
      companyId: provision.company.id,
      workspaceId: provision.workspace.id,
      projectId: provision.project.id,
    }),
  };
}

export function listPartnerUserInvites(
  partnerId: string,
): readonly PilotInvite[] {
  const companyId = canonicalPartnerIdForOfficePartner(partnerId);
  const provision = resolvePilotWorkspace(companyId);
  if (provision === null) return [];
  return listInvites().filter(
    (invite) =>
      invite.companyId === provision.company.id &&
      invite.projectId === provision.project.id,
  );
}
