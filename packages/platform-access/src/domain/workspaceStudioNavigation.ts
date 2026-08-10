/**
 * OF-13 / PT-OS-02 — Workspace Studio Navigation (role-filtered).
 * Order aligned with PlatformShell SSOT: Client · Manager · Sales · Office · Builder
 */

import { isPilotPartnerRoles } from './pilotPartnerAccess';
import { canAccessStudio, isPlatformAdmin } from './roles';
import type { PlatformRole, PlatformStudioId } from './types';

export type WorkspaceStudioSurface =
  | 'client'
  | 'manager'
  | 'sales'
  | 'builder'
  | 'office';

/** Canonical Workspace switcher order — aligned with PlatformShell SSOT (PT-OS-02 / B-01). */
export const WORKSPACE_STUDIO_SWITCH_ORDER: readonly WorkspaceStudioSurface[] =
  Object.freeze([
    'client',
    'manager',
    'sales',
    'builder',
    'office',
  ]);

export const WORKSPACE_STUDIO_LABELS: Readonly<
  Record<WorkspaceStudioSurface, string>
> = Object.freeze({
  client: 'Client Studio',
  manager: 'Manager Studio',
  sales: 'Sales Studio',
  builder: 'Builder Studio',
  office: 'Office Studio',
});

/**
 * Role Engine filter for Workspace Navigation.
 * Uses existing Permission Matrix — no new roles.
 */
export function workspaceStudiosForRoles(
  roles: readonly PlatformRole[],
): readonly WorkspaceStudioSurface[] {
  return WORKSPACE_STUDIO_SWITCH_ORDER.filter((surface) => {
    if (surface === 'client') {
      return (
        isPlatformAdmin(roles) ||
        isPilotPartnerRoles(roles) ||
        roles.includes('manager') ||
        roles.includes('salesman') ||
        roles.includes('builder')
      );
    }
    if (surface === 'manager') {
      return isPlatformAdmin(roles) || roles.includes('manager');
    }
    if (surface === 'sales') {
      // Managers need Sales surface in Workspace (partner ops), not only salesmen.
      return (
        isPlatformAdmin(roles) ||
        roles.includes('manager') ||
        roles.includes('salesman')
      );
    }
    return canAccessStudio(roles, surface as PlatformStudioId);
  });
}

export function isWorkspaceStudioSurface(
  value: string,
): value is WorkspaceStudioSurface {
  return (WORKSPACE_STUDIO_SWITCH_ORDER as readonly string[]).includes(value);
}
