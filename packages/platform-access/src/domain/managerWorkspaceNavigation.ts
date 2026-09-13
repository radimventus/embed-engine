import {authorizedStudioForRoles, primaryRole, canAccessStudio} from './roles';
import type {PlatformRole, PlatformStudioId} from './types';

/** Manager's existing Workspace surfaces; stale standalone state must not select Office/Builder. */
export function managerWorkspaceStudio(studio: string | null | undefined): PlatformStudioId {
  const candidate = studio === 'client' || studio === 'sales' || studio === 'manager' ||
    studio === 'builder' || studio === 'office' ? studio : null;
  return authorizedStudioForRoles(['manager'], candidate);
}

export function shouldRedirectManagerToWorkspace(input: {
  roles: readonly PlatformRole[];
  studioId: PlatformStudioId;
  onWorkspaceHost: boolean;
  nestedWorkspaceView: boolean;
}): boolean {
  return primaryRole(input.roles) === 'manager' && !input.onWorkspaceHost &&
    (!canAccessStudio(input.roles, input.studioId) || !input.nestedWorkspaceView);
}
