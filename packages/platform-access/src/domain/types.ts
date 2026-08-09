/**
 * EPIC-BX-14 / OF-07 — Platform Access domain model.
 * Shared Identity & Access for all Studios (MVP pilot — not production IAM).
 */

import type { SharedWorkspaceContext } from './workspaceContext';

export type PlatformStudioId =
  | 'client'
  | 'office'
  | 'builder'
  | 'manager'
  | 'sales';

/**
 * Prepared role hierarchy (Permission Matrix).
 * CONIS Admin → Project Admin → Builder | Manager | Salesman
 */
export type PlatformRole =
  | 'conis-admin'
  | 'project-admin'
  | 'builder'
  | 'manager'
  | 'salesman';

/** Account lifecycle — OF-07 Identity. */
export type PlatformAccountStatus = 'active' | 'inactive';

export type PlatformUser = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly status: PlatformAccountStatus;
  readonly lastLoginAt: string | null;
  readonly lastActivityAt: string | null;
  /** PE-09 — last visited partner/studio surface (includes Client). */
  readonly lastStudioId: PlatformStudioId | 'client' | null;
};

export type PlatformCompany = {
  readonly id: string;
  readonly name: string;
  readonly tenantId: string;
};

export type PlatformWorkspace = {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
};

export type PlatformProjectStatus = 'draft' | 'ready' | 'published';

/** CAP-VR35a — operational/customer-data state belongs to the House. */
export type HouseDataMode = 'REFERENCE_DEMO' | 'LIVE_EMPTY' | 'LIVE';

/**
 * Explicit origin of a Partner-owned House materialized from a versioned
 * immutable reference source. This is provenance, not operational data mode.
 */
export type ReferenceHouseProvenance = {
  readonly sourceId: string;
  readonly sourceVersion: string;
};

/**
 * CAP-PLAT-04c — true commercial / delivery Project (Registry entity).
 * No House Package fields — Houses reference this via {@link PlatformProject.canonicalProjectId}.
 */
export type PlatformCanonicalProject = {
  readonly id: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
};

/**
 * Legacy Registry row that still carries House Package pointer (compat).
 * CAP-PLAT-04 — House Package belongs on {@link PlatformHouse}; this row remains
 * until CAP-PLAT-04d stores Houses separately. Links to Project via canonicalProjectId.
 */
export type PlatformProject = {
  readonly id: string;
  readonly workspaceId: string;
  readonly companyId: string;
  readonly name: string;
  /** @deprecated CAP-PLAT-04 — moves to PlatformHouse; retained for Registry compat. */
  readonly packageRoot: string;
  readonly status: PlatformProjectStatus;
  readonly slug: string;
  /** @deprecated CAP-PLAT-04 — moves to PlatformHouse; retained for Registry compat. */
  readonly objectType: string;
  readonly description: string;
  /**
   * CAP-VR35a — explicit House operational data state.
   * Missing legacy rows project as LIVE_EMPTY.
   */
  readonly dataMode?: HouseDataMode;
  /**
   * CAP-PLAT-04c — parent Canonical Project id.
   * Required for seeds; extras may omit (compat adapter assigns default).
   */
  readonly canonicalProjectId?: string;
};

/**
 * CAP-PLAT-04a — House identity (product object under a Project).
 * Registry persistence of Houses is CAP-PLAT-04d; this is the canonical shape.
 *
 * Hierarchy: Company 1 ─── * Project 1 ─── * House
 */
export type PlatformHouse = {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly slug: string;
  readonly packageRoot: string;
  readonly objectType: string;
  /** Present only for a Partner-owned materialization of a reference source. */
  readonly referenceProvenance?: ReferenceHouseProvenance;
};

export type PlatformSession = {
  readonly user: PlatformUser;
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  /** CAP-VR38a — null means Project scope; otherwise a House under projectId. */
  readonly activeHouseId: string | null;
  readonly projectId: string | null;
  /** null = Platform Landing (studio not chosen yet). */
  readonly activeStudioId: PlatformStudioId | null;
  /**
   * OF-14 — Shared Workspace Context (cookie-backed with this session).
   * null = not in operator Workspace mode (partner journey unaffected).
   */
  readonly workspaceContext: SharedWorkspaceContext | null;
  readonly rememberMe: boolean;
  readonly issuedAt: string;
  readonly expiresAt: string | null;
  readonly lastLoginAt: string;
};

export type LoginCredentials = {
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
};

export type WorkspaceBootstrap = {
  readonly user: PlatformUser;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject | null;
  readonly studioId: PlatformStudioId | null;
};

export type ProjectBootstrap = {
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject;
  readonly company: PlatformCompany;
  readonly housePackageRoot: string;
  readonly capabilitiesReady: boolean;
  readonly intelligenceReady: boolean;
};
