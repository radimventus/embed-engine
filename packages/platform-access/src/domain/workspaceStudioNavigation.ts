/**
 * OF-13 / PT-OS-02 — Workspace Studio Navigation (role-filtered).
 * Order aligned with PlatformShell SSOT: Client · Sales · Manager · Builder · Office
 */

import { canAccessStudio } from './roles';
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
    'sales',
    'manager',
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
  return WORKSPACE_STUDIO_SWITCH_ORDER.filter((surface) =>
    canAccessStudio(roles, surface as PlatformStudioId),
  );
}

export function isWorkspaceStudioSurface(
  value: string,
): value is WorkspaceStudioSurface {
  return (WORKSPACE_STUDIO_SWITCH_ORDER as readonly string[]).includes(value);
}
