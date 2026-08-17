import type {
  PlatformCanonicalProject,
  PlatformCompany,
  PlatformProject,
  PlatformUser,
  PlatformWorkspace,
} from '../domain/types';
import type { PlatformTenant } from '../domain/pilotTypes';
import {
  BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  derivePartnerDraftHouseId,
  deriveReferenceInstanceHouseId,
} from '../reference/referenceSourceRegistry';

export const DEFAULT_TENANT_ID = 'tenant-ac-modular' as const;
export const DEFAULT_COMPANY_ID = 'ac-modular' as const;
export const DEFAULT_WORKSPACE_ID = 'ac-modular-main' as const;
/** Legacy default bind target — House id (villa), not Canonical Project id. */
export const DEFAULT_PROJECT_ID = 'villa-168' as const;
/** CAP-PLAT-04c — Canonical delivery Project for AC Modular seeds. */
export const DEFAULT_CANONICAL_PROJECT_ID = 'project-ac-modular' as const;
export const DSE_TENANT_ID = 'tenant-domy-s-energii' as const;
export const DSE_COMPANY_ID = 'company-domy-s-energii' as const;
export const DSE_WORKSPACE_ID = 'domy-s-energii-main' as const;
export const DSE_CANONICAL_PROJECT_ID = 'project-domy-s-energii' as const;
export const DSE_BUNGALOV_4KK_HOUSE_ID = deriveReferenceInstanceHouseId({
  sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  companyId: DSE_COMPANY_ID,
  projectId: DSE_CANONICAL_PROJECT_ID,
});
/** Canonical/default DSE reference House. */
export const DSE_CANONICAL_REFERENCE_HOUSE_ID = DSE_BUNGALOV_4KK_HOUSE_ID;
/** Historical DSE reference House retained as demo data. */
export const DSE_HISTORICAL_MODERN_4KK_HOUSE_ID = 'modern-4kk' as const;
export const DSE_FIRST_DRAFT_HOUSE_ID = derivePartnerDraftHouseId({
  companyId: DSE_COMPANY_ID,
  projectId: DSE_CANONICAL_PROJECT_ID,
  houseSlug: 'vas-prvni-dum-5kk',
});
export const DSE_BUNGALOV_4KK_PACKAGE_ROOT =
  'apps/client-studio/public/house-packages/bungalov-4kk' as const;

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
  {
    id: DSE_TENANT_ID,
    name: 'Domy s energií',
    companyId: DSE_COMPANY_ID,
    pilot: false,
    createdAt: '2026-08-07T00:00:00.000Z',
  },
] as const;

export const DEFAULT_COMPANIES: readonly PlatformCompany[] = [
  {
    id: DEFAULT_COMPANY_ID,
    name: 'AC Modular',
    tenantId: DEFAULT_TENANT_ID,
  },
  {
    id: DSE_COMPANY_ID,
    name: 'Domy s energií',
    tenantId: DSE_TENANT_ID,
  },
] as const;

export const DEFAULT_WORKSPACES: readonly PlatformWorkspace[] = [
  {
    id: DEFAULT_WORKSPACE_ID,
    companyId: DEFAULT_COMPANY_ID,
    name: 'AC Modular Main',
  },
  {
    id: DSE_WORKSPACE_ID,
    companyId: DSE_COMPANY_ID,
    name: 'Domy s energií',
  },
] as const;

/**
 * CAP-PLAT-04c — true Company → Project Registry seeds (no House Package fields).
 */
export const DEFAULT_CANONICAL_PROJECTS: readonly PlatformCanonicalProject[] = [
  {
    id: DEFAULT_CANONICAL_PROJECT_ID,
    companyId: DEFAULT_COMPANY_ID,
    workspaceId: DEFAULT_WORKSPACE_ID,
    name: 'AC Modular',
    slug: 'ac-modular',
    description: 'AC Modular delivery Projekt — houses Family / Harmony / Villa.',
  },
  {
    id: DSE_CANONICAL_PROJECT_ID,
    companyId: DSE_COMPANY_ID,
    workspaceId: DSE_WORKSPACE_ID,
    name: 'Domy s energií',
    slug: 'domy-s-energii',
    description: 'Canonical Reference House delivery project.',
  },
] as const;

/**
 * PT-PDM-02 — Seed House rows (legacy PlatformProject shape with packageRoot).
 * CAP-PLAT-04c — each seed links to {@link DEFAULT_CANONICAL_PROJECT_ID}.
 */
export const DEFAULT_PROJECTS: readonly PlatformProject[] = [
  {
    id: DSE_BUNGALOV_4KK_HOUSE_ID,
    workspaceId: DSE_WORKSPACE_ID,
    companyId: DSE_COMPANY_ID,
    name: 'BUNGALOV 4KK',
    packageRoot: DSE_BUNGALOV_4KK_PACKAGE_ROOT,
    status: 'published',
    slug: 'bungalov-4kk',
    objectType: 'reference-house',
    description:
      'DSE materialization of reference source bungalov-4kk-reference-v1.',
    dataMode: 'REFERENCE_DEMO',
    referenceProvenance: {
      sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
      sourceVersion: 'v1',
    },
    canonicalProjectId: DSE_CANONICAL_PROJECT_ID,
  },
  {
    id: DSE_HISTORICAL_MODERN_4KK_HOUSE_ID,
    workspaceId: DEFAULT_WORKSPACE_ID,
    companyId: DEFAULT_COMPANY_ID,
    name: 'MODERN 4KK',
    packageRoot: '/canonical-houses/modern-4kk',
    status: 'published',
    slug: 'modern-4kk',
    objectType: 'reference-house',
    description: 'Historical development/reference House retained under AC Modular.',
    dataMode: 'REFERENCE_DEMO',
    canonicalProjectId: DEFAULT_CANONICAL_PROJECT_ID,
  },
  {
    id: DSE_FIRST_DRAFT_HOUSE_ID,
    workspaceId: DSE_WORKSPACE_ID,
    companyId: DSE_COMPANY_ID,
    name: 'Váš první dům',
    packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
    status: 'draft',
    slug: 'vas-prvni-dum-5kk',
    objectType: 'partner-house',
    description: 'Partner-owned AUTHORING_DRAFT House for Domy s energií.',
    dataMode: 'LIVE_EMPTY',
    canonicalProjectId: DSE_CANONICAL_PROJECT_ID,
  },
  {
    id: 'family-98',
    workspaceId: DEFAULT_WORKSPACE_ID,
    companyId: DEFAULT_COMPANY_ID,
    name: 'Family 98',
    packageRoot: 'apps/client-studio/public/house-packages/family-98',
    status: 'published',
    slug: 'family-98',
    objectType: 'family',
    description: 'Modulární rodinný dům Family 98.',
    dataMode: 'LIVE_EMPTY',
    canonicalProjectId: DEFAULT_CANONICAL_PROJECT_ID,
  },
  {
    id: 'harmony-124',
    workspaceId: DEFAULT_WORKSPACE_ID,
    companyId: DEFAULT_COMPANY_ID,
    name: 'Harmony 124',
    packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
    status: 'published',
    slug: 'harmony-124',
    objectType: 'harmony',
    description: 'Modulární dům Harmony 124.',
    dataMode: 'LIVE_EMPTY',
    canonicalProjectId: DEFAULT_CANONICAL_PROJECT_ID,
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
    dataMode: 'LIVE_EMPTY',
    canonicalProjectId: DEFAULT_CANONICAL_PROJECT_ID,
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
    lastStudioId: null,
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
    lastStudioId: null,
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
    lastStudioId: null,
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
    lastStudioId: null,
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
    lastStudioId: null,
    password: 'demo',
  },
] as const;
