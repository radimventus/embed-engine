import type { PlatformRole, PlatformStudioId } from './types';

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  'conis-admin': 'CONIS Admin',
  'project-admin': 'Project Admin',
  builder: 'Builder',
  manager: 'Manager',
  salesman: 'Salesman',
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
  return (['builder', 'manager', 'sales'] as const).filter((studio) =>
    canAccessStudio(roles, studio),
  );
}
