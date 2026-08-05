/**
 * PT-PDM-02 — Shared Project types (Platform Data Constitution §1 / §3).
 * Builder is the sole author. Other Studios consume published projects only.
 */

import type { PlatformProject, PlatformProjectStatus } from '../domain/types';

export type SharedProjectDocumentRef = {
  readonly id: string;
  readonly label: string;
};

/**
 * Canonical Projekt surface for all Studios.
 * Content (House Package bytes) stays in object-house at `packageRoot`.
 */
export type SharedProject = {
  readonly id: string;
  readonly companyId: string;
  readonly companyName: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly packageRoot: string;
  readonly status: PlatformProjectStatus;
  readonly slug: string;
  readonly objectType: string;
  readonly description: string;
  readonly logoLabel: string;
  readonly heroLabel: string;
  readonly websiteUrl: string;
  readonly documents: readonly SharedProjectDocumentRef[];
  /** Offer template id when authored; partner offer instances remain Office-owned. */
  readonly offerTemplateId: string | null;
  readonly publishedAt: string | null;
  readonly authorStudio: 'builder';
};

/** Resolved view after openProject — entry point for consumer Studios. */
export type SharedProjectRuntimeView = {
  readonly project: SharedProject;
  /** Browser-public path for House Package CSVs (e.g. `/house-package`). */
  readonly packagePublicRoot: string;
  readonly isPublished: boolean;
};

export type BuilderProjectWriteInput = {
  readonly id: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly packageRoot: string;
  readonly status: PlatformProjectStatus;
  readonly slug: string;
  readonly objectType: string;
  readonly description: string;
  readonly logoLabel?: string;
  readonly heroLabel?: string;
  readonly websiteUrl?: string;
  readonly documents?: readonly SharedProjectDocumentRef[];
  readonly offerTemplateId?: string | null;
};

export type SharedProjectManifest = {
  readonly projectId: string;
  readonly logoLabel: string;
  readonly heroLabel: string;
  readonly websiteUrl: string;
  readonly documents: readonly SharedProjectDocumentRef[];
  readonly offerTemplateId: string | null;
  readonly publishedAt: string | null;
};

export function platformProjectFromWrite(
  input: BuilderProjectWriteInput,
): PlatformProject {
  return {
    id: input.id,
    companyId: input.companyId,
    workspaceId: input.workspaceId,
    name: input.name,
    packageRoot: input.packageRoot,
    status: input.status,
    slug: input.slug,
    objectType: input.objectType,
    description: input.description,
  };
}
