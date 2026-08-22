import {
  createPlatformAccessAuthClient,
} from '../api/platformAccessClient';
import type {
  PlatformSession,
} from '../domain/types';

export type AuthoritativeProjectTarget = {
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
};

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
      'Platform API nepotvrdilo požadovaný Project.',
    );
  }

  return session;
}

/**
 * TASK 66B
 *
 * Project selection is authorized by the server-owned canonical Project
 * authority. Partner Environment remains legacy compatibility metadata and is
 * not a prerequisite for selecting a valid Project.
 *
 * The browser only requests the target identity. The Platform API remains the
 * authority and persists the resulting session before this function returns.
 */
export async function selectProjectAuthoritatively(input: {
  readonly session: PlatformSession;
  readonly target: AuthoritativeProjectTarget;
  readonly activeStudio: 'client' | 'builder' | 'manager' | 'sales';
  readonly officeReturnHref: string;
}): Promise<PlatformSession> {
  const client = createPlatformAccessAuthClient();

  const switched = await client.mutateSessionContext({
    action: 'switch',
    activeStudio: input.activeStudio,
    tenantId: input.target.companyId === input.session.companyId
      ? input.session.tenantId
      : undefined,
    companyId: input.target.companyId,
    workspaceId: input.target.workspaceId,
    projectId: input.target.projectId,
    activeHouseId: null,
  });

  if (!switched.ok) {
    throw new Error(switched.error);
  }

  return assertTargetSession(
    switched.session,
    input.target,
  );
}
