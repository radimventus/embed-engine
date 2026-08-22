import { getHydratedCanonicalHouses } from '../registry/companyRegistry';
/**
 * CAP-PLAT-02 / CAP-PLAT-04d — Canonical Projection Layer (read-only).
 *
 * Registry = SSOT. CPL = sole domain projection for Studio consumers.
 * No UI. No workflow. Writes stay on Shared Project Runtime.
 */

import {
  isSeedProjectId,
  getDefaultCompanyRegistry,
  resolveCanonicalProjectForHouseRow,
} from '../registry/companyRegistry';
import {
  getSharedProject,
  listPublishedProjects,
} from '../project/projectRepository';
import { packageRootToPublicUrl } from '../project/packagePublicUrl';
import {
  normalizeProjectIdCandidate,
  resolveBindHouseId,
  resolveMountProjectView,
} from '../project/projectRuntime';
import type { SharedProject } from '../project/sharedProjectTypes';
import type {
  CanonicalCompanyProjection,
  CanonicalEntityHierarchy,
  CanonicalHouseProjection,
  CanonicalProjectIdentity,
  CanonicalProjectProjection,
  CanonicalPublicationProjection,
  CanonicalRuntimeBinding,
  ResolveCanonicalRuntimeBindingInput,
} from './canonicalProjectTypes';
import type { HouseDataMode, PlatformCanonicalProject } from '../domain/types';

const DEFAULT_HOUSE_DATA_MODE: HouseDataMode = 'LIVE_EMPTY';

/**
 * CAP-PLAT-04d — House slice from legacy Shared / Registry house row.
 * objectType / package live only here — never on Project.
 */
function houseFromSharedLegacy(
  shared: SharedProject,
  packagePublicRoot: string,
): CanonicalHouseProjection {
  const registryHouse = getDefaultCompanyRegistry().projects.find(
    (row) => row.id === shared.id,
  );
  const dataMode = registryHouse?.dataMode ?? DEFAULT_HOUSE_DATA_MODE;
  return {
    houseId: shared.id,
    name: shared.name,
    slug: shared.slug,
    objectType: shared.objectType,
    packageRoot: shared.packageRoot,
    packagePublicRoot,
    dataMode,
    referenceProvenance: registryHouse?.referenceProvenance,
  };
}

/**
 * CAP-PLAT-04d — Project identity from Registry Canonical Projects only.
 */
function projectIdentityFromRegistry(
  shared: SharedProject,
): CanonicalProjectIdentity {
  const registry = getDefaultCompanyRegistry();
  const houseRow = registry.projects.find((row) => row.id === shared.id);
  const canonical = resolveCanonicalProjectForHouseRow(
    houseRow ?? {
      id: shared.id,
      companyId: shared.companyId,
      canonicalProjectId: undefined,
    },
  );
  if (canonical !== null) {
    return {
      projectId: canonical.id,
      name: canonical.name,
      slug: canonical.slug,
      description: canonical.description,
      privacyUrl: canonical.privacyUrl,
    };
  }
  return {
    projectId: shared.id,
    name: shared.companyName,
    slug: shared.slug,
    description: shared.description,
  };
}

function publicationFromShared(
  shared: SharedProject,
): CanonicalPublicationProjection {
  const houseStatus = shared.status;
  const isHousePublished = houseStatus === 'published';
  const isSeed = isSeedProjectId(shared.id);
  return {
    projectStatus: houseStatus,
    houseStatus,
    isProjectPublished: isHousePublished,
    isHousePublished,
    publishedAt: shared.publishedAt,
    isSeed,
    status: houseStatus,
    isPublished: isHousePublished,
  };
}

export function projectCanonicalFromShared(
  shared: SharedProject,
): CanonicalProjectProjection {
  const packagePublicRoot = packageRootToPublicUrl(shared.packageRoot);
  const registry = getDefaultCompanyRegistry();
  const workspace = registry.workspaces.find(
    (item) => item.id === shared.workspaceId,
  );
  return {
    partner: {
      companyId: shared.companyId,
      companyName: shared.companyName,
      workspaceId: shared.workspaceId,
      workspaceName: workspace?.name ?? shared.workspaceId,
    },
    project: projectIdentityFromRegistry(shared),
    house: houseFromSharedLegacy(shared, packagePublicRoot),
    branding: {
      logoLabel: shared.logoLabel,
      heroLabel: shared.heroLabel,
      websiteUrl: shared.websiteUrl,
      documents: shared.documents,
    },
    publication: publicationFromShared(shared),
    experience: {
      offerTemplateId: shared.offerTemplateId,
      authorStudio: shared.authorStudio,
    },
  };
}

/**
 * CAP-PLAT-04R2a — Project-only projection (zero Houses allowed).
 * Never invents a House identity from Project.name.
 */
function projectCanonicalFromDelivery(
  delivery: PlatformCanonicalProject,
): CanonicalProjectProjection {
  const registry = getDefaultCompanyRegistry();
  const company = registry.companies.find(
    (item) => item.id === delivery.companyId,
  );
  const workspace = registry.workspaces.find(
    (item) => item.id === delivery.workspaceId,
  );
  return {
    partner: {
      companyId: delivery.companyId,
      companyName: company?.name ?? delivery.companyId,
      workspaceId: delivery.workspaceId,
      workspaceName: workspace?.name ?? delivery.workspaceId,
    },
    project: {
      projectId: delivery.id,
      name: delivery.name,
      slug: delivery.slug,
      description: delivery.description,
      privacyUrl: delivery.privacyUrl,
    },
    house: null,
    branding: {
      logoLabel: company?.name ?? '',
      heroLabel: '',
      websiteUrl: '',
      documents: [],
    },
    publication: {
      projectStatus: null,
      houseStatus: null,
      isProjectPublished: false,
      isHousePublished: false,
      publishedAt: null,
      isSeed: false,
      status: 'draft',
      isPublished: false,
    },
    experience: {
      offerTemplateId: null,
      authorStudio: 'builder',
    },
  };
}

/**
 * CAP-PLAT-04R2a — Companies from Canonical Registry (independent of Projects/Houses).
 */
export function listCanonicalCompanies(): readonly CanonicalCompanyProjection[] {
  return getDefaultCompanyRegistry().companies.map((company) => ({
    companyId: company.id,
    name: company.name,
    tenantId: company.tenantId,
  }));
}

export function getCanonicalCompany(
  companyId: string,
): CanonicalCompanyProjection | null {
  const normalized = companyId.trim();
  if (normalized.length === 0) return null;
  const company = getDefaultCompanyRegistry().companies.find(
    (item) => item.id === normalized,
  );
  if (company === undefined) return null;
  return {
    companyId: company.id,
    name: company.name,
    tenantId: company.tenantId,
  };
}

/**
 * CAP-PLAT-04a — expose Company / Project / House as independent entity views.
 */
export function toCanonicalEntityHierarchy(
  projection: CanonicalProjectProjection,
): CanonicalEntityHierarchy {
  return {
    company: {
      companyId: projection.partner.companyId,
      name: projection.partner.companyName,
    },
    project: {
      projectId: projection.project.projectId,
      name: projection.project.name,
      companyId: projection.partner.companyId,
    },
    house: projection.house,
  };
}

/** House slices only. */
export function listCanonicalHouseEntities(): readonly CanonicalHouseProjection[] {
  return listPublishedProjects().map((shared) =>
    houseFromSharedLegacy(shared, packageRootToPublicUrl(shared.packageRoot)),
  );
}

/**
 * CAP-PLAT-04b/04d — House slice by id (not via Project fields).
 */
export function getCanonicalHouseEntity(
  houseId: string,
): CanonicalHouseProjection | null {
  const normalized = normalizeProjectIdCandidate(houseId) ?? houseId.trim();
  if (normalized.length === 0) return null;
  const fromList = listCanonicalHouseEntities().find(
    (house) => house.houseId === normalized,
  );
  if (fromList !== undefined) return fromList;

  const shared = getSharedProject(normalized);
  if (shared === null) return null;
  return houseFromSharedLegacy(
    shared,
    packageRootToPublicUrl(shared.packageRoot),
  );
}

/**
 * CAP-PLAT-04d — full projection rooted at House.
 */
export function getCanonicalHouse(
  houseId: string,
): CanonicalProjectProjection | null {
  const normalized = normalizeProjectIdCandidate(houseId) ?? houseId.trim();
  if (normalized.length === 0) return null;
  const shared = getSharedProject(normalized);
  if (shared === null) return null;
  return projectCanonicalFromShared(shared);
}

/**
 * CAP-PLAT-04d / CAP-PLAT-04R2a — true Canonical Projects (one row per Registry Project).
 * Projects with zero Houses are included; `house` is null until a House is linked.
 */
export function listCanonicalProjects(
  companyId?: string | null,
): readonly CanonicalProjectProjection[] {
  const registry = getDefaultCompanyRegistry();
  const projects = registry.canonicalProjects.filter((project) =>
    companyId === undefined ||
    companyId === null ||
    companyId.trim().length === 0
      ? true
      : project.companyId === companyId.trim(),
  );

  const publishedHouses = listPublishedProjects();
  const result: CanonicalProjectProjection[] = [];
  for (const project of projects) {
    const houseShared = publishedHouses.find((shared) => {
      const row = registry.projects.find((item) => item.id === shared.id);
      return row?.canonicalProjectId === project.id;
    });
    if (houseShared !== undefined) {
      result.push(projectCanonicalFromShared(houseShared));
      continue;
    }
    result.push(projectCanonicalFromDelivery(project));
  }
  return result;
}

/**
 * CAP-PLAT-04d / CAP-PLAT-04k — published House-rooted projections (internal).
 * Public consumers use {@link listCanonicalHouses} — collapse alias retired.
 */
function listPublishedHouseProjections(): readonly CanonicalProjectProjection[] {
  return listPublishedProjects().map(projectCanonicalFromShared);
}

/**
 * CAP-PLAT-04d — true House list (optional filter by parent Project id).
 */
export function listCanonicalHouses(
  projectId?: string | null,
): readonly CanonicalProjectProjection[] {

  const base = (() => {
    const all = listPublishedHouseProjections();
  const filter = projectId?.trim();
  if (filter === undefined || filter.length === 0) return all;
  return all.filter((item) => item.project.projectId === filter);
  })();

  const dynamic = typeof getHydratedCanonicalHouses === 'function' ? getHydratedCanonicalHouses() : [];
  const filter = projectId?.trim();

  const dynamicProjections = dynamic
    .filter((h: any) => {
      if (!h) return false;
      if (!filter) return true;
      return h.canonicalProjectId === filter || h.projectId === filter;
    })
    .map((h: any) => {
      const pId = h.canonicalProjectId ?? filter ?? '';
      const hId = h.id ?? h.houseId;
      const housePayload: any = {
        id: hId,
        houseId: hId,
        canonicalProjectId: pId,
        name: h.name,
        packageRoot: h.packageRoot ?? `/house-packages/${hId}`,
        status: h.status ?? 'draft',
        dataMode: h.dataMode ?? 'LIVE_EMPTY',
        ...h,
      };

      return {
        ...housePayload,
        house: housePayload,
        project: {
          projectId: pId,
          canonicalProjectId: pId,
          name: pId,
        },
      };
    });

  const map = new Map<string, any>();
  for (const item of base) {
    const id = (item as any)?.house?.id ?? (item as any)?.house?.houseId ?? (item as any)?.id ?? (item as any)?.houseId;
    if (id) map.set(id, item);
  }
  for (const dyn of dynamicProjections) {
    const id = dyn?.house?.id ?? dyn?.id;
    if (id && !map.has(id)) {
      map.set(id, dyn);
    }
  }

  return [...map.values()];

}

/**
 * CAP-PLAT-04d — Project by Canonical Project id.
 * Compat: House id still resolves to the House-rooted bound context.
 */
export function getCanonicalProject(
  projectId: string,
): CanonicalProjectProjection | null {
  const normalized = normalizeProjectIdCandidate(projectId) ?? projectId.trim();
  if (normalized.length === 0) return null;

  const asHouse = getSharedProject(normalized);
  if (asHouse !== null) {
    return projectCanonicalFromShared(asHouse);
  }

  const registry = getDefaultCompanyRegistry();
  const delivery = registry.canonicalProjects.find(
    (project) => project.id === normalized,
  );
  if (delivery === undefined) return null;
  const linked = listCanonicalHouses(delivery.id)[0];
  return linked ?? projectCanonicalFromDelivery(delivery);
}

/** Strict CPL Project identity check; unlike compatibility reads, never accepts House ids. */
export function isCanonicalProjectId(projectId: string): boolean {
  const candidate = projectId.trim();
  return (
    candidate.length > 0 &&
    listCanonicalProjects().some(
      (projection) => projection.project.projectId === candidate,
    )
  );
}

export function isCanonicalSeedProject(projectId: string): boolean {
  return isSeedProjectId(projectId);
}

function firstNonEmpty(
  ...candidates: readonly (string | null | undefined)[]
): string | null {
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed !== undefined && trimmed.length > 0) return trimmed;
  }
  return null;
}

/**
 * CAP-PLAT-04d — bind House; runtimeHouseId + parent runtimeProjectId.
 */
export function resolveCanonicalRuntimeBinding(
  input: ResolveCanonicalRuntimeBindingInput,
): CanonicalRuntimeBinding {
  const explicit = firstNonEmpty(input.explicitProjectId);
  if (explicit !== null) {
    return bindingFromCandidate(explicit, 'explicit');
  }

  const url = firstNonEmpty(input.urlProjectId);
  if (url !== null) {
    return bindingFromCandidate(url, 'url');
  }

  const workspace = firstNonEmpty(input.workspaceContextProjectId);
  if (workspace !== null) {
    return bindingFromCandidate(workspace, 'workspace-context');
  }

  const session = firstNonEmpty(input.sessionProjectId);
  if (session !== null) {
    return bindingFromCandidate(session, 'session');
  }

  const embed = firstNonEmpty(input.embedObjectId);
  if (embed !== null) {
    return bindingFromCandidate(embed, 'embed');
  }

  if (input.fallbackToFirstPublished === true) {
    const firstHouse = listCanonicalHouseEntities()[0];
    if (firstHouse !== undefined) {
      return bindingFromCanonicalHouse(firstHouse, 'published-default');
    }
  }

  return {
    runtimeHouseId: null,
    runtimeProjectId: null,
    packagePublicRoot: null,
    isPublished: false,
    bindSource: 'none',
    project: null,
  };
}

function bindingFromCanonicalHouse(
  house: CanonicalHouseProjection,
  bindSource: CanonicalRuntimeBinding['bindSource'],
): CanonicalRuntimeBinding {
  const parent = getCanonicalHouse(house.houseId);
  if (parent === null) {
    return {
      runtimeHouseId: house.houseId,
      runtimeProjectId: null,
      packagePublicRoot: house.packagePublicRoot,
      isPublished: false,
      bindSource,
      project: null,
    };
  }

  const projection: CanonicalProjectProjection = {
    ...parent,
    house,
  };

  return {
    runtimeHouseId: house.houseId,
    runtimeProjectId: projection.project.projectId,
    packagePublicRoot: house.packagePublicRoot,
    isPublished: projection.publication.isPublished,
    bindSource,
    project: projection,
  };
}

/**
 * CAP-PLAT-04d / CAP-PLAT-04e — bind House.
 * Dual-read: candidate may be House id, Canonical Project id, or Gen1 alias.
 */
function bindingFromCandidate(
  rawId: string,
  bindSource: CanonicalRuntimeBinding['bindSource'],
): CanonicalRuntimeBinding {
  const houseId = resolveBindHouseId(rawId);
  if (houseId !== null) {
    const house = getCanonicalHouseEntity(houseId);
    if (house !== null) {
      return bindingFromCanonicalHouse(house, bindSource);
    }
  }

  // Compat: mount path for residual aliases not covered by resolveBindHouseId.
  const mount = resolveMountProjectView(rawId);
  if (mount !== null) {
    const projected = projectCanonicalFromShared(mount.project);
    if (projected.house !== null) {
      return bindingFromCanonicalHouse(projected.house, bindSource);
    }
  }

  return {
    runtimeHouseId: null,
    runtimeProjectId: null,
    packagePublicRoot: null,
    isPublished: false,
    bindSource,
    project: null,
  };
}
