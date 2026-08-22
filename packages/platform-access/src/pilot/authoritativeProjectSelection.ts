import {
  createPlatformAccessAuthClient,
  platformApiOrigin,
} from '../api/platformAccessClient';
import type {
  PlatformSession,
} from '../domain/types';
import type { DurableOfficePartner } from '../partner/officePartnerRecord';

export type AuthoritativeProjectTarget = {
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
};

type OfficePartnersResponse = {
  readonly partners: readonly DurableOfficePartner[];
};

async function requestDurableOfficePartners(): Promise<
  readonly DurableOfficePartner[]
> {
  const response = await fetch(
    `${platformApiOrigin().replace(/\/$/, '')}/office/partners`,
    {
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(
      'Nepodařilo se načíst autoritativní Partner Environment.',
    );
  }

  const body = (await response.json()) as OfficePartnersResponse;

  if (!Array.isArray(body.partners)) {
    throw new Error('Neplatná odpověď Partner Environment.');
  }

  return body.partners;
}

function resolveTargetPartner(
  partners: readonly DurableOfficePartner[],
  target: AuthoritativeProjectTarget,
): DurableOfficePartner {
  const partner = partners.find((candidate) => {
    const scope = candidate.partnerEnvironmentScope;
    return (
      scope !== null &&
      scope.companyId === target.companyId &&
      scope.workspaceId === target.workspaceId &&
      scope.projectId === target.projectId
    );
  });

  if (partner === undefined) {
    throw new Error(
      'Pro požadovaný Project neexistuje autoritativní Partner Environment.',
    );
  }

  return partner;
}

function assertTargetSession(
  session: PlatformSession,
  target: AuthoritativeProjectTarget,
): PlatformSession {
  if (
    session.companyId !== target.companyId ||
    session.workspaceId !== target.workspaceId ||
    session.projectId !== target.projectId
  ) {
    throw new Error(
      'Platform API nepotvrdilo požadovaný Partner Environment.',
    );
  }

  return session;
}

/**
 * TASK 66VR-FIX-04
 *
 * Project selection has two authoritative paths:
 *
 * - the already-bound Project => switch, remaining inside the current PE;
 * - another Project/PE => resolve its durable Office Partner and enter using
 *   the already persisted server-owned Partner Environment scope.
 *
 * This function NEVER persists/redefines Partner Environment scope.
 */
export async function selectProjectAuthoritatively(input: {
  readonly session: PlatformSession;
  readonly target: AuthoritativeProjectTarget;
  readonly activeStudio: 'client' | 'builder' | 'manager' | 'sales';
  readonly officeReturnHref: string;
}): Promise<PlatformSession> {
  const { session, target } = input;
  const client = createPlatformAccessAuthClient();

  const alreadyBoundToTarget =
    session.companyId === target.companyId &&
    session.workspaceId === target.workspaceId &&
    session.projectId === target.projectId;

  if (alreadyBoundToTarget) {
    const switched = await client.mutateSessionContext({
      action: 'switch',
      activeStudio: input.activeStudio,
      projectId: target.projectId,
      activeHouseId: null,
    });

    if (!switched.ok) {
      throw new Error(switched.error);
    }

    return assertTargetSession(switched.session, target);
  }

  const partners = await requestDurableOfficePartners();
  const partner = resolveTargetPartner(partners, target);
  const scope = partner.partnerEnvironmentScope;

  if (scope === null) {
    throw new Error('Partner Environment není připraven.');
  }

  const entered = await client.mutateSessionContext({
    action: 'enter',
    partnerId: partner.id,
    tenantId: scope.tenantId,
    companyId: scope.companyId,
    workspaceId: scope.workspaceId,
    projectId: scope.projectId,
    activeHouseId: null,
    activeStudio: input.activeStudio,
    officeReturnHref: input.officeReturnHref,
  });

  if (!entered.ok) {
    throw new Error(entered.error);
  }

  return assertTargetSession(entered.session, target);
}
