/**
 * CAP-PLAT-02 / CAP-PLAT-04d — Canonical Projection Layer types.
 * Domain-only. No UI. No workflow. No Runtime / Experience logic.
 *
 * Hierarchy slices: partner → project → house (Project has no House fields).
 */

import type { HouseDataMode, PlatformProjectStatus } from '../domain/types';
import type { SharedProjectDocumentRef } from '../project/sharedProjectTypes';

/** How the active house / project id was chosen for runtime hosts. */
export type CanonicalBindSource =
  | 'explicit'
  | 'url'
  | 'session'
  | 'workspace-context'
  | 'embed'
  | 'published-default'
  | 'none';

export type CanonicalPartnerProjection = {
  readonly companyId: string;
  readonly companyName: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
};

/** CAP-PLAT-04d — Project only (no House fields). */
export type CanonicalProjectIdentity = {
  readonly projectId: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
};

/**
 * CAP-PLAT-04d — House identity + package pointer (objectType is House-owned).
 */
export type CanonicalHouseProjection = {
  readonly houseId: string;
  readonly name: string;
  readonly slug: string;
  readonly objectType: string;
  readonly packageRoot: string;
  readonly packagePublicRoot: string;
  /** CAP-VR35a — explicit reference/demo vs real operational-data state. */
  readonly dataMode: HouseDataMode;
};

/**
 * CAP-PLAT-04a — Company → Project → House as separately addressable entities.
 * CAP-PLAT-04R2a — House may be null when the Project has no Houses yet.
 */
export type CanonicalEntityHierarchy = {
  readonly company: {
    readonly companyId: string;
    readonly name: string;
  };
  readonly project: {
    readonly projectId: string;
    readonly name: string;
    readonly companyId: string;
  };
  readonly house: CanonicalHouseProjection | null;
};

export type CanonicalBrandingProjection = {
  readonly logoLabel: string;
  readonly heroLabel: string;
  readonly websiteUrl: string;
  readonly documents: readonly SharedProjectDocumentRef[];
};

/**
 * CAP-PLAT-04d — Project and House publication slots.
 * Compat: `status` / `isPublished` mirror house (fallback project) for legacy readers.
 */
export type CanonicalPublicationProjection = {
  readonly projectStatus: PlatformProjectStatus | null;
  readonly houseStatus: PlatformProjectStatus | null;
  readonly isProjectPublished: boolean;
  readonly isHousePublished: boolean;
  readonly publishedAt: string | null;
  readonly isSeed: boolean;
  /** @deprecated CAP-PLAT-04d — mirror of houseStatus ?? projectStatus */
  readonly status: PlatformProjectStatus;
  /** @deprecated CAP-PLAT-04d — mirror of isHousePublished || isProjectPublished */
  readonly isPublished: boolean;
};

export type CanonicalExperienceRefs = {
  readonly offerTemplateId: string | null;
  readonly authorStudio: 'builder';
};

/**
 * CAP-PLAT-04d — bind targets House; parent Project is separate.
 * Compat: hosts that still read only `runtimeProjectId` as bind key should prefer
 * `runtimeHouseId` (House) once migrated; `runtimeProjectId` is the Canonical Project id.
 */
export type CanonicalRuntimeBinding = {
  readonly runtimeHouseId: string | null;
  readonly runtimeProjectId: string | null;
  readonly packagePublicRoot: string | null;
  readonly isPublished: boolean;
  readonly bindSource: CanonicalBindSource;
  /** Full bound context (House + parent Project + partner). */
  readonly project: CanonicalProjectProjection | null;
};

/**
 * Bound context projection (name retained for API stability).
 * CAP-PLAT-04R2a — `house` is null when the Project has zero Houses.
 */
export type CanonicalProjectProjection = {
  readonly partner: CanonicalPartnerProjection;
  readonly project: CanonicalProjectIdentity;
  readonly house: CanonicalHouseProjection | null;
  readonly branding: CanonicalBrandingProjection;
  readonly publication: CanonicalPublicationProjection;
  readonly experience: CanonicalExperienceRefs;
};

/** CAP-PLAT-04R2a — Company identity from Canonical Registry (independent of Houses). */
export type CanonicalCompanyProjection = {
  readonly companyId: string;
  readonly name: string;
  readonly tenantId: string;
};

export type ResolveCanonicalRuntimeBindingInput = {
  /** Highest priority when non-empty. */
  readonly explicitProjectId?: string | null;
  readonly urlProjectId?: string | null;
  readonly workspaceContextProjectId?: string | null;
  readonly sessionProjectId?: string | null;
  readonly embedObjectId?: string | null;
  /**
   * When no candidate resolves, bind the first published house (Client/Manager boot).
   * bindSource becomes `published-default`.
   */
  readonly fallbackToFirstPublished?: boolean;
};
