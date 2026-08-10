import type { PlatformRole, PlatformStudioId } from './types';

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  'conis-admin': 'Administrátor CONIS',
  'project-admin': 'Administrátor projektu',
  builder: 'Builder',
  manager: 'Manager',
  salesman: 'Obchodník',
};

const ROLE_RANK: Record<PlatformRole, number> = {
  'conis-admin': 100,
  'project-admin': 80,
  builder: 50,
  manager: 50,
  salesman: 50,
};

export function primaryRole(
  roles: readonly PlatformRole[],
): PlatformRole {
  if (roles.length === 0) return 'builder';
  return [...roles].sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a])[0]!;
}

export function hasRole(
  roles: readonly PlatformRole[],
  role: PlatformRole,
): boolean {
  return roles.includes(role) || roles.includes('conis-admin');
}

/** Soft studio access — prepared for future RBAC enforcement. */
export function canAccessStudio(
  roles: readonly PlatformRole[],
  studioId: PlatformStudioId,
): boolean {
  if (roles.includes('conis-admin') || roles.includes('project-admin')) {
    return true;
  }
  switch (studioId) {
    case 'client':
      return (
        roles.includes('manager') ||
        roles.includes('salesman') ||
        roles.includes('builder')
      );
    case 'office':
      // OF-01 — Office is operational CONIS center (admins only until RBAC expands).
      return false;
    case 'builder':
      return roles.includes('builder') || roles.includes('project-admin');
    case 'manager':
      return roles.includes('manager');
    case 'sales':
      return roles.includes('salesman');
  }
}

export function studiosForRoles(
  roles: readonly PlatformRole[],
): readonly PlatformStudioId[] {
  return (
    ['client', 'manager', 'sales', 'builder', 'office'] as const
  ).filter((studio) => canAccessStudio(roles, studio));
}

/**
 * RC-002 — post-login studio: occupational role first, else Manager → Sales → Builder.
 */
export function defaultStudioForRoles(
  roles: readonly PlatformRole[],
): PlatformStudioId {
  const available = studiosForRoles(roles);
  if (available.length === 0) return 'builder';
  const primary = primaryRole(roles);
  if (primary === 'builder' && available.includes('builder')) return 'builder';
  if (primary === 'manager' && available.includes('manager')) return 'manager';
  if (primary === 'salesman' && available.includes('sales')) return 'sales';
  if (available.includes('manager')) return 'manager';
  if (available.includes('sales')) return 'sales';
  return available[0]!;
}

/** Soft admin gate for Platform Landing ops (invite, provision, GM). */
export function isPlatformAdmin(roles: readonly PlatformRole[]): boolean {
  return roles.includes('conis-admin') || roles.includes('project-admin');
}
