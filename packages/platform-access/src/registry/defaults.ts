import type {
  PlatformCompany,
  PlatformProject,
  PlatformUser,
  PlatformWorkspace,
} from '../domain/types';
import type { PlatformTenant } from '../domain/pilotTypes';

export const DEFAULT_TENANT_ID = 'tenant-ac-modular' as const;
export const DEFAULT_COMPANY_ID = 'ac-modular' as const;
export const DEFAULT_WORKSPACE_ID = 'ac-modular-main' as const;
export const DEFAULT_PROJECT_ID = 'villa-168' as const;

/** Canonical House Package seed for automatic pilot project provisioning. */
export const PILOT_HOUSE_PACKAGE_ROOT =
  'apps/client-studio/public/house-package' as const;

export const DEFAULT_TENANTS: readonly PlatformTenant[] = [
  {
    id: DEFAULT_TENANT_ID,
    name: 'AC Modular Pilot',
    companyId: DEFAULT_COMPANY_ID,
    pilot: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
] as const;

export const DEFAULT_COMPANIES: readonly PlatformCompany[] = [
  {
    id: DEFAULT_COMPANY_ID,
    name: 'AC Modular',
    tenantId: DEFAULT_TENANT_ID,
  },
] as const;

export const DEFAULT_WORKSPACES: readonly PlatformWorkspace[] = [
  {
    id: DEFAULT_WORKSPACE_ID,
    companyId: DEFAULT_COMPANY_ID,
    name: 'AC Modular Main',
  },
] as const;

export const DEFAULT_PROJECTS: readonly PlatformProject[] = [
  {
    id: 'family-98',
    workspaceId: DEFAULT_WORKSPACE_ID,
    companyId: DEFAULT_COMPANY_ID,
    name: 'Family 98',
    packageRoot: 'apps/client-studio/public/house-packages/family-98',
    status: 'ready',
    slug: 'family-98',
    objectType: 'family',
    description: 'Modulární rodinný dům Family 98.',
  },
  {
    id: 'harmony-124',
    workspaceId: DEFAULT_WORKSPACE_ID,
    companyId: DEFAULT_COMPANY_ID,
    name: 'Harmony 124',
    packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
    status: 'ready',
    slug: 'harmony-124',
    objectType: 'harmony',
    description: 'Modulární dům Harmony 124.',
  },
  {
    id: 'villa-168',
    workspaceId: DEFAULT_WORKSPACE_ID,
    companyId: DEFAULT_COMPANY_ID,
    name: 'Villa 168',
    packageRoot: PILOT_HOUSE_PACKAGE_ROOT,
    status: 'published',
    slug: 'villa-168',
    objectType: 'villa',
    description: 'Referenční projekt Villa 168.',
  },
] as const;

/** Pilot demo accounts — not production IAM. */
export const DEMO_USERS: readonly (PlatformUser & {
  readonly password: string;
})[] = [
  {
    id: 'user-radim',
    email: 'radim@conis.local',
    displayName: 'Radim',
    roles: ['conis-admin'],
    status: 'active',
    lastLoginAt: null,
    lastActivityAt: null,
    password: 'demo',
  },
  {
    id: 'user-builder',
    email: 'builder@ac.local',
    displayName: 'Builder',
    roles: ['builder'],
    status: 'active',
    lastLoginAt: null,
    lastActivityAt: null,
    password: 'demo',
  },
  {
    id: 'user-manager',
    email: 'manager@ac.local',
    displayName: 'Manager',
    roles: ['manager'],
    status: 'active',
    lastLoginAt: null,
    lastActivityAt: null,
    password: 'demo',
  },
  {
    id: 'user-sales',
    email: 'sales@ac.local',
    displayName: 'Salesman',
    roles: ['salesman'],
    status: 'active',
    lastLoginAt: null,
    lastActivityAt: null,
    password: 'demo',
  },
  {
    id: 'user-padmin',
    email: 'admin@ac.local',
    displayName: 'Project Admin',
    roles: ['project-admin'],
    status: 'active',
    lastLoginAt: null,
    lastActivityAt: null,
    password: 'demo',
  },
] as const;
