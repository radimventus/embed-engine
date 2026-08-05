/**
 * PT-PDM-02 — Shared Project Repository (sole Projekt identity store).
 * Builder writes; all Studios read. Manifest holds brand/docs metadata.
 */

import type { PlatformProject, PlatformProjectStatus } from '../domain/types';
import {
  findCompany,
  findProject,
  getDefaultCompanyRegistry,
  upsertBuilderProject,
  removeBuilderProject,
  setBuilderProjectStatus,
} from '../registry/companyRegistry';
import { DEFAULT_WORKSPACE_ID } from '../registry/defaults';
import {
  type BuilderProjectWriteInput,
  type SharedProject,
  type SharedProjectManifest,
  platformProjectFromWrite,
} from './sharedProjectTypes';

const MANIFEST_STORAGE_KEY = 'conis.platform.projectManifest.v1';

const DEFAULT_MANIFESTS: readonly SharedProjectManifest[] = [
  {
    projectId: 'villa-168',
    logoLabel: 'AC Modular Logo',
    heroLabel: 'Villa 168 Hero',
    websiteUrl: '',
    documents: [{ id: 'doc-villa-brief', label: 'Projektový brief' }],
    offerTemplateId: 'template-starter',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    projectId: 'harmony-124',
    logoLabel: 'AC Modular Logo',
    heroLabel: 'Harmony 124 Hero',
    websiteUrl: '',
    documents: [],
    offerTemplateId: 'template-pilot',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    projectId: 'family-98',
    logoLabel: 'AC Modular Logo',
    heroLabel: 'Family 98 Hero',
    websiteUrl: '',
    documents: [],
    offerTemplateId: 'template-studio',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
];

let manifestById = new Map<string, SharedProjectManifest>(
  DEFAULT_MANIFESTS.map((item) => [item.projectId, item]),
);
let manifestsHydrated = false;

function loadManifests(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(MANIFEST_STORAGE_KEY);
    if (raw === null || raw.length === 0) return;
    const parsed = JSON.parse(raw) as SharedProjectManifest[];
    if (!Array.isArray(parsed)) return;
    for (const item of parsed) {
      if (typeof item?.projectId === 'string') {
        manifestById.set(item.projectId, item);
      }
    }
  } catch {
    // ignore corrupt storage
  }
}

function persistManifests(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const extras = [...manifestById.values()].filter(
      (item) => !DEFAULT_MANIFESTS.some((seed) => seed.projectId === item.projectId),
    );
    const overrides = [...manifestById.values()].filter((item) => {
      const seed = DEFAULT_MANIFESTS.find((row) => row.projectId === item.projectId);
      return seed !== undefined && JSON.stringify(seed) !== JSON.stringify(item);
    });
    localStorage.setItem(
      MANIFEST_STORAGE_KEY,
      JSON.stringify([...extras, ...overrides]),
    );
  } catch {
    // quota / private mode
  }
}

function ensureManifestsHydrated(): void {
  if (manifestsHydrated) return;
  manifestsHydrated = true;
  loadManifests();
}

function emptyManifest(projectId: string): SharedProjectManifest {
  return {
    projectId,
    logoLabel: '',
    heroLabel: '',
    websiteUrl: '',
    documents: [],
    offerTemplateId: null,
    publishedAt: null,
  };
}

function getManifest(projectId: string): SharedProjectManifest {
  ensureManifestsHydrated();
  return manifestById.get(projectId) ?? emptyManifest(projectId);
}

function writeManifest(manifest: SharedProjectManifest): void {
  ensureManifestsHydrated();
  manifestById.set(manifest.projectId, manifest);
  persistManifests();
}

export function resetSharedProjectManifestsForTests(): void {
  manifestById = new Map(
    DEFAULT_MANIFESTS.map((item) => [item.projectId, item]),
  );
  manifestsHydrated = true;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(MANIFEST_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

function toSharedProject(project: PlatformProject): SharedProject {
  const registry = getDefaultCompanyRegistry();
  const company = findCompany(registry, project.companyId);
  const manifest = getManifest(project.id);
  return {
    id: project.id,
    companyId: project.companyId,
    companyName: company?.name ?? project.companyId,
    workspaceId: project.workspaceId,
    name: project.name,
    packageRoot: project.packageRoot,
    status: project.status,
    slug: project.slug,
    objectType: project.objectType,
    description: project.description,
    logoLabel: manifest.logoLabel,
    heroLabel: manifest.heroLabel,
    websiteUrl: manifest.websiteUrl,
    documents: manifest.documents,
    offerTemplateId: manifest.offerTemplateId,
    publishedAt: manifest.publishedAt,
    authorStudio: 'builder',
  };
}

/** All projects in the Shared Repository (draft + ready + published). */
export function listSharedProjects(): readonly SharedProject[] {
  return getDefaultCompanyRegistry().projects.map(toSharedProject);
}

/** Consumer Studios — published Projekt list only. */
export function listPublishedProjects(): readonly SharedProject[] {
  return listSharedProjects().filter((project) => project.status === 'published');
}

export function getSharedProject(projectId: string): SharedProject | null {
  const registry = getDefaultCompanyRegistry();
  const project = findProject(registry, projectId);
  if (project === undefined) return null;
  return toSharedProject(project);
}

/**
 * Builder-only write — create or replace project identity in the Shared Repository.
 */
export function upsertBuilderSharedProject(
  input: BuilderProjectWriteInput,
): SharedProject {
  const platform = platformProjectFromWrite(input);
  upsertBuilderProject(platform);
  const previous = getManifest(input.id);
  writeManifest({
    projectId: input.id,
    logoLabel: input.logoLabel ?? previous.logoLabel,
    heroLabel: input.heroLabel ?? previous.heroLabel,
    websiteUrl: input.websiteUrl ?? previous.websiteUrl,
    documents: input.documents ?? previous.documents,
    offerTemplateId:
      input.offerTemplateId !== undefined
        ? input.offerTemplateId
        : previous.offerTemplateId,
    publishedAt:
      input.status === 'published'
        ? (previous.publishedAt ?? new Date().toISOString())
        : previous.publishedAt,
  });
  const shared = getSharedProject(input.id);
  if (shared === null) {
    throw new Error(`Shared Project upsert failed for ${input.id}`);
  }
  return shared;
}

/** Builder-only — mark Projekt published for consumer Studios. */
export function publishSharedProject(projectId: string): SharedProject | null {
  const current = getSharedProject(projectId);
  if (current === null) return null;
  setBuilderProjectStatus(projectId, 'published');
  const manifest = getManifest(projectId);
  writeManifest({
    ...manifest,
    publishedAt: manifest.publishedAt ?? new Date().toISOString(),
  });
  return getSharedProject(projectId);
}

/** Builder-only — remove authored project (extras). Defaults remain unless overridden away. */
export function deleteSharedProject(projectId: string): boolean {
  ensureManifestsHydrated();
  manifestById.delete(projectId);
  persistManifests();
  return removeBuilderProject(projectId);
}

export function setSharedProjectStatus(
  projectId: string,
  status: PlatformProjectStatus,
): SharedProject | null {
  if (status === 'published') {
    return publishSharedProject(projectId);
  }
  setBuilderProjectStatus(projectId, status);
  return getSharedProject(projectId);
}

export function updateSharedProjectManifest(
  projectId: string,
  patch: Partial<
    Pick<
      SharedProjectManifest,
      | 'logoLabel'
      | 'heroLabel'
      | 'websiteUrl'
      | 'documents'
      | 'offerTemplateId'
    >
  >,
): SharedProject | null {
  if (getSharedProject(projectId) === null) return null;
  const current = getManifest(projectId);
  writeManifest({
    ...current,
    ...patch,
    documents: patch.documents ?? current.documents,
  });
  return getSharedProject(projectId);
}

/** Sync Builder workspace house → Shared Repository (identity only). */
export function syncBuilderWorkspaceHouse(input: {
  readonly id: string;
  readonly name: string;
  readonly packageRoot: string;
  readonly companyId: string;
  readonly status: PlatformProjectStatus;
  readonly slug: string;
  readonly objectType: string;
  readonly description: string;
  readonly workspaceId?: string;
}): SharedProject {
  return upsertBuilderSharedProject({
    id: input.id,
    companyId: input.companyId,
    workspaceId: input.workspaceId ?? DEFAULT_WORKSPACE_ID,
    name: input.name,
    packageRoot: input.packageRoot,
    status: input.status,
    slug: input.slug,
    objectType: input.objectType,
    description: input.description,
  });
}

export { MANIFEST_STORAGE_KEY };
