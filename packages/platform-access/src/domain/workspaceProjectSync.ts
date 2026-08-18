/**
 * CAP-VR33E — Studio → Workspace Host active Project synchronization.
 * Payload carries canonical Project identity only; House identities are invalid.
 */

export const WORKSPACE_PROJECT_CHANGE_MESSAGE_TYPE =
  'conis:workspace-project-change';
export const WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE =
  'conis:workspace-house-change';
export const WORKSPACE_HOUSE_SCOPE_REQUEST_MESSAGE_TYPE =
  'conis:workspace-house-scope-request';

export type WorkspaceProjectChangeMessage = {
  readonly type: typeof WORKSPACE_PROJECT_CHANGE_MESSAGE_TYPE;
  readonly projectId: string;
};

export type WorkspaceHouseChangeMessage = {
  readonly type: typeof WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE;
  /** null retains Project scope; a non-null value is validated by the host. */
  readonly houseId: string | null;
};

/**
 * A Studio asks its Workspace Host to durably authorize a House scope before
 * it begins reading or mounting that House Package. The response travels over
 * the transferred MessagePort, so it cannot be confused with another frame's
 * scope update.
 */
export type WorkspaceHouseScopeRequestMessage = {
  readonly type: typeof WORKSPACE_HOUSE_SCOPE_REQUEST_MESSAGE_TYPE;
  readonly houseId: string | null;
  readonly authoredHouseIdentity?: import('./workspaceContext').WorkspaceAuthoredHouseIdentity;
};

export function createWorkspaceProjectChangeMessage(
  projectId: string,
): WorkspaceProjectChangeMessage {
  return {
    type: WORKSPACE_PROJECT_CHANGE_MESSAGE_TYPE,
    projectId,
  };
}

export function isWorkspaceProjectChangeMessage(
  value: unknown,
): value is WorkspaceProjectChangeMessage {
  if (value === null || typeof value !== 'object') return false;
  const message = value as Partial<WorkspaceProjectChangeMessage>;
  return (
    message.type === WORKSPACE_PROJECT_CHANGE_MESSAGE_TYPE &&
    typeof message.projectId === 'string' &&
    message.projectId.trim().length > 0
  );
}

export function createWorkspaceHouseChangeMessage(
  houseId: string | null,
): WorkspaceHouseChangeMessage {
  return {
    type: WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE,
    houseId,
  };
}

export function isWorkspaceHouseChangeMessage(
  value: unknown,
): value is WorkspaceHouseChangeMessage {
  if (value === null || typeof value !== 'object') return false;
  const message = value as Partial<WorkspaceHouseChangeMessage>;
  return (
    message.type === WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE &&
    (message.houseId === null ||
      (typeof message.houseId === 'string' && message.houseId.trim().length > 0))
  );
}

export function createWorkspaceHouseScopeRequestMessage(input: {
  readonly houseId: string | null;
  readonly authoredHouseIdentity?: import('./workspaceContext').WorkspaceAuthoredHouseIdentity;
}): WorkspaceHouseScopeRequestMessage {
  return {
    type: WORKSPACE_HOUSE_SCOPE_REQUEST_MESSAGE_TYPE,
    ...input,
  };
}

export function isWorkspaceHouseScopeRequestMessage(
  value: unknown,
): value is WorkspaceHouseScopeRequestMessage {
  if (value === null || typeof value !== 'object') return false;
  const message = value as Partial<WorkspaceHouseScopeRequestMessage>;
  return (
    message.type === WORKSPACE_HOUSE_SCOPE_REQUEST_MESSAGE_TYPE &&
    (message.houseId === null ||
      (typeof message.houseId === 'string' && message.houseId.trim().length > 0))
  );
}
