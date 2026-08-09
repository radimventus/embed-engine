/**
 * CAP-BLD-08 / CAP-PLAT-02a / CAP-PLAT-04f — Builder workspace over CPL.
 *
 * Domain SSOT: Canonical Registry + CPL (Company / Project / House).
 * CAP-PLAT-04f — Projekt folder ↔ Project; DOMY ↔ House via CPL lists.
 * This module holds presentation types + UI selection/folder grouping only.
 *
 * @deprecated Domain registry behaviour — removed in CAP-PLAT-02a.
 * `DEFAULT_WORKSPACE_PROJECTS` and import-time snapshots are Legacy aliases.
 */

import {
  DEFAULT_COMPANY_ID as PLATFORM_DEFAULT_COMPANY_ID,
  DEFAULT_PROJECT_ID as PLATFORM_DEFAULT_PROJECT_ID,
  DEFAULT_TENANT_ID,
  DEFAULT_WORKSPACE_ID,
  getCanonicalWorkspaceForCompany,
  getCanonicalHouse,
  isCanonicalSeedProject,
  listCanonicalCompanies,
  listCanonicalHouses,
  listCanonicalProjects,
  upsertWorkspaceAuthoredHouse,
  syncBuilderWorkspaceHouse,
  upsertBuilderCanonicalProject,
  upsertBuilderCompany,
  upsertBuilderProject,
  type CanonicalProjectProjection,
} from '@embed-engine/platform-access';
export type WorkspaceProjectStatus = 'draft' | 'ready' | 'published';

export type WorkspaceCompany = {
  readonly id: string;
  readonly name: string;
};

/** UI „Projekt“ — presentation folder (not Shared Project identity). */
export type WorkspaceProjectFolder = {
  readonly id: string;
  readonly name: string;
  readonly companyId: string;
};

/** UI „Dům“ — presentation of CPL House (DOMY). */
export type WorkspaceProject = {
  readonly id: string;
  readonly name: string;
  readonly packageRoot: string;
  readonly companyId: string;
  readonly folderId: string;
  readonly description: string;
  readonly status: WorkspaceProjectStatus;
  readonly slug: string;
  readonly objectType: string;
  readonly metadata: string;
};

export type WorkspaceRegistryState = {
  readonly companies: readonly WorkspaceCompany[];
  readonly folders: readonly WorkspaceProjectFolder[];
  readonly projects: readonly WorkspaceProject[];
  readonly activeFolderId: string | null;
  readonly activeProjectId: string | null;
  readonly recentProjectIds: readonly string[];
  readonly lastOpenedProjectId: string | null;
  /** UI grouping: CPL house id → presentation folder id. */
  readonly houseFolderIds: Readonly<Record<string, string>>;
  /**
   * Presentation-only Builder DOMY labels (may differ from Shared Project name
   * used by Office/Client). Not a domain registry.
   */
  readonly houseLabels: Readonly<Record<string, string>>;
  /** Presentation-only freeform metadata tags (Builder UI). */
  readonly houseMetadata: Readonly<Record<string, string>>;
};

export const DEFAULT_COMPANY_ID = PLATFORM_DEFAULT_COMPANY_ID;

export const OBJECT_TYPE_OPTIONS: readonly {
  readonly id: string;
  readonly label: string;
  readonly packageRoot: string;
}[] = [
  {
    id: 'family',
    label: 'Family',
    packageRoot: 'apps/client-studio/public/house-packages/family-98',
  },
  {
    id: 'harmony',
    label: 'Harmony',
    packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
  },
  {
    id: 'villa',
    label: 'Villa',
    packageRoot: 'apps/client-studio/public/house-package',
  },
] as const;

/** CAP-PLAT-04f — seed Projekt folder id = Canonical Project id. */
const DEFAULT_FOLDER_AC = 'project-ac-modular';
const REFERENCE_PROJECT_DSE = 'project-domy-s-energii';
const CANONICAL_REFERENCE_PROJECT_IDS = new Set([
  DEFAULT_FOLDER_AC,
  REFERENCE_PROJECT_DSE,
]);
const BUILDER_AUTHORED_HOUSE_MARKER = '__builder-authored-house__';
const LEGACY_BUILDER_AUTHORED_HOUSE_MARKER = 'builder-authored-house';
/** Pre-04f presentation folder id — dual-read alias into DEFAULT_FOLDER_AC. */
const LEGACY_FOLDER_AC = 'project-ac-modular-pilot';

export const DEFAULT_WORKSPACE_FOLDERS: readonly WorkspaceProjectFolder[] = [
  {
    id: DEFAULT_FOLDER_AC,
    name: 'AC Modular',
    companyId: DEFAULT_COMPANY_ID,
  },
];

function canonicalizeFolderId(folderId: string): string {
  return folderId === LEGACY_FOLDER_AC ? DEFAULT_FOLDER_AC : folderId;
}

export const DEFAULT_ACTIVE_PROJECT_ID = PLATFORM_DEFAULT_PROJECT_ID;

export const WORKSPACE_STORAGE_KEY = 'conis.builder.workspace.v2';
/** Legacy key — auto-migrated on load (PR-012). */
export const WORKSPACE_STORAGE_KEY_LEGACY = 'conis.builder.workspace.v1';

const MAX_RECENT = 8;

const STATUS_VALUES = new Set<WorkspaceProjectStatus>([
  'draft',
  'ready',
  'published',
]);

function houseFromCanonical(
  projection: CanonicalProjectProjection,
  folderId: string,
): WorkspaceProject {
  const house = projection.house;
  if (house === null) {
    throw new Error('houseFromCanonical: House slice required');
  }
  return {
    id: house.houseId,
    name: house.name,
    packageRoot: house.packageRoot,
    companyId: projection.partner.companyId,
    folderId,
    description: '',
    status: projection.publication.status,
    slug: house.slug,
    objectType: house.objectType,
    metadata: '',
  };
}

function resolveFolderId(
  houseId: string,
  houseFolderIds: Readonly<Record<string, string>>,
  folders: readonly WorkspaceProjectFolder[],
  parentProjectId: string,
): string {
  const mapped = houseFolderIds[houseId];
  if (mapped !== undefined) {
    const folderId = canonicalizeFolderId(mapped);
    if (folders.some((folder) => folder.id === folderId)) {
      return folderId;
    }
  }
  if (folders.some((folder) => folder.id === parentProjectId)) {
    return parentProjectId;
  }
  if (isCanonicalSeedProject(houseId)) {
    return DEFAULT_FOLDER_AC;
  }
  return folders[0]?.id ?? DEFAULT_FOLDER_AC;
}

/** CAP-PLAT-04f — Projekt folders from true CPL Projects. */
function foldersFromCanonicalProjects(): WorkspaceProjectFolder[] {
  return listCanonicalProjects().map((projection) => ({
    id: projection.project.projectId,
    name: projection.project.name,
    companyId: projection.partner.companyId,
  }));
}

/**
 * CAP-PLAT-04f — DOMY from CPL Houses, plus Builder-authored drafts resolved by id.
 * `listCanonicalHouses` is published-scoped; authoring ids stay addressable via getCanonicalHouse.
 */
function isVisibleCanonicalHouse(
  projection: CanonicalProjectProjection,
): boolean {
  return (
    projection.house !== null &&
    (!CANONICAL_REFERENCE_PROJECT_IDS.has(projection.project.projectId) ||
      isCanonicalSeedProject(projection.house.houseId))
  );
}

function resolveAuthoringHouses(input: {
  readonly houseFolderIds: Readonly<Record<string, string>>;
  readonly houseLabels: Readonly<Record<string, string>>;
  readonly houseMetadata: Readonly<Record<string, string>>;
}): CanonicalProjectProjection[] {
  const byId = new Map<string, CanonicalProjectProjection>();
  for (const projection of listCanonicalHouses()) {
    if (projection.house === null) continue;
    if (!isVisibleCanonicalHouse(projection)) continue;
    byId.set(projection.house.houseId, projection);
  }
  const authoredIds = new Set([
    ...Object.keys(input.houseFolderIds),
    ...Object.keys(input.houseLabels),
    ...Object.keys(input.houseMetadata),
  ]);
  for (const houseId of authoredIds) {
    if (byId.has(houseId)) continue;
    const hit = getCanonicalHouse(houseId);
    const isExplicitlyAuthored = isBuilderAuthoredHouse(
      input.houseMetadata[houseId],
    );
    if (
      hit !== null &&
      (isVisibleCanonicalHouse(hit) || isExplicitlyAuthored)
    ) {
      byId.set(houseId, hit);
    }
  }
  return [...byId.values()];
}

function isBuilderAuthoredHouse(metadata: string | undefined): boolean {
  return (
    metadata === BUILDER_AUTHORED_HOUSE_MARKER ||
    metadata === LEGACY_BUILDER_AUTHORED_HOUSE_MARKER
  );
}

/** CAP-PLAT-02a.1 — workspace id for a company from CPL partner slice only. */
function workspaceIdFromCanonical(companyId: string): string {
  const workspace = getCanonicalWorkspaceForCompany(companyId);
  if (workspace !== null) return workspace.id;
  const hit = listCanonicalProjects().find(
    (projection) => projection.partner.companyId === companyId,
  );
  if (hit !== undefined) return hit.partner.workspaceId;
  // CAP-PLAT-04R2b — Company may exist with zero Projects; match upsertBuilderWorkspace id.
  return `${companyId}-main`;
}

/** CAP-PLAT-04R2a/R2b — Company known via CPL Company reads (independent of Projects/Houses). */
function companyKnownInCanonical(companyId: string): boolean {
  return listCanonicalCompanies().some(
    (company) => company.companyId === companyId,
  );
}

/**
 * CAP-PLAT-02a / CAP-PLAT-04f — compose Builder sidebar from CPL + UI pointers.
 * Projekt folders ← `listCanonicalProjects`; DOMY ← `listCanonicalHouses`.
 */
export function composeWorkspaceRegistry(input: {
  readonly folders?: readonly WorkspaceProjectFolder[];
  readonly houseFolderIds?: Readonly<Record<string, string>>;
  readonly houseLabels?: Readonly<Record<string, string>>;
  readonly houseMetadata?: Readonly<Record<string, string>>;
  readonly activeFolderId?: string | null;
  readonly activeProjectId?: string | null;
  readonly recentProjectIds?: readonly string[];
  readonly lastOpenedProjectId?: string | null;
}): WorkspaceRegistryState {
  const deliveryProjects = listCanonicalProjects();
  const houseFolderIds: Record<string, string> = {};
  for (const [houseId, folderId] of Object.entries(input.houseFolderIds ?? {})) {
    houseFolderIds[houseId] = canonicalizeFolderId(folderId);
  }
  const houseLabels = { ...(input.houseLabels ?? {}) };
  const houseMetadata = { ...(input.houseMetadata ?? {}) };
  const canonicalHouses = resolveAuthoringHouses({
    houseFolderIds,
    houseLabels,
    houseMetadata,
  });

  const folders: WorkspaceProjectFolder[] = [];
  const pushFolder = (folder: WorkspaceProjectFolder): void => {
    const id = canonicalizeFolderId(folder.id);
    if (folders.some((item) => item.id === id)) return;
    folders.push({
      id,
      name: folder.name,
      companyId: folder.companyId,
    });
  };

  if (input.folders !== undefined && input.folders.length > 0) {
    for (const folder of input.folders) {
      pushFolder(folder);
    }
  } else {
    const fromCpl = foldersFromCanonicalProjects();
    if (fromCpl.length > 0) {
      for (const folder of fromCpl) {
        pushFolder(folder);
      }
    } else {
      for (const folder of DEFAULT_WORKSPACE_FOLDERS) {
        pushFolder(folder);
      }
    }
  }

  for (const projection of deliveryProjects) {
    pushFolder({
      id: projection.project.projectId,
      name: projection.project.name,
      companyId: projection.partner.companyId,
    });
  }

  // Prefer CPL Project.name for the seed Projekt folder when present.
  for (const projection of deliveryProjects) {
    const index = folders.findIndex(
      (folder) => folder.id === projection.project.projectId,
    );
    if (index >= 0) {
      folders[index] = {
        id: projection.project.projectId,
        name: projection.project.name,
        companyId: projection.partner.companyId,
      };
    }
  }

  for (const projection of canonicalHouses) {
    if (projection.house === null) continue;
    const id = projection.house.houseId;
    const canonicalFolderId = projection.project.projectId;
    houseFolderIds[id] = folders.some(
      (folder) => folder.id === canonicalFolderId,
    )
      ? canonicalFolderId
      : resolveFolderId(id, houseFolderIds, folders, canonicalFolderId);
  }

  const folderIds = new Set(folders.map((folder) => folder.id));
  for (const folderId of Object.values(houseFolderIds)) {
    const id = canonicalizeFolderId(folderId);
    if (!folderIds.has(id)) {
      folders.push({
        id,
        name: id,
        companyId: DEFAULT_COMPANY_ID,
      });
      folderIds.add(id);
    }
  }

  const companiesMap = new Map<string, WorkspaceCompany>();
  for (const company of listCanonicalCompanies()) {
    companiesMap.set(company.companyId, {
      id: company.companyId,
      name: company.name,
    });
  }
  for (const projection of deliveryProjects) {
    companiesMap.set(projection.partner.companyId, {
      id: projection.partner.companyId,
      name: projection.partner.companyName,
    });
  }
  for (const projection of canonicalHouses) {
    companiesMap.set(projection.partner.companyId, {
      id: projection.partner.companyId,
      name: projection.partner.companyName,
    });
  }

  const projects = canonicalHouses.flatMap((projection) => {
    if (projection.house === null) return [];
    const id = projection.house.houseId;
    const base = houseFromCanonical(
      projection,
      resolveFolderId(
        id,
        houseFolderIds,
        folders,
        projection.project.projectId,
      ),
    );
    const label = houseLabels[id];
    const metadata = houseMetadata[id];
    return [
      {
        ...base,
        name:
          label !== undefined && label.length > 0 ? label : base.name,
        metadata:
          metadata !== undefined ? metadata : base.metadata,
      },
    ];
  });
  const canonicalProjectIds = new Set(
    deliveryProjects.map((projection) => projection.project.projectId),
  );
  const projectedHouseIds = new Set(projects.map((project) => project.id));
  for (const houseId of Object.keys(houseMetadata)) {
    if (
      projectedHouseIds.has(houseId) ||
      !isBuilderAuthoredHouse(houseMetadata[houseId])
    ) {
      continue;
    }
    const folderId = canonicalizeFolderId(houseFolderIds[houseId] ?? '');
    const folder = folders.find((item) => item.id === folderId);
    if (folder === undefined || !canonicalProjectIds.has(folderId)) {
      continue;
    }
    projects.push({
      id: houseId,
      name: houseLabels[houseId] ?? houseId,
      packageRoot: '',
      companyId: folder.companyId,
      folderId,
      description: '',
      status: 'draft',
      slug: houseId,
      objectType: 'house',
      metadata: houseMetadata[houseId],
    });
  }

  const activeFolderCandidate =
    input.activeFolderId !== undefined && input.activeFolderId !== null
      ? canonicalizeFolderId(input.activeFolderId)
      : null;

  const activeCandidate =
    input.activeProjectId !== undefined
      ? input.activeProjectId
      : (input.lastOpenedProjectId ?? DEFAULT_ACTIVE_PROJECT_ID);
  const active =
    activeCandidate !== null &&
    projects.some((project) => project.id === activeCandidate)
      ? activeCandidate
      : input.activeProjectId === null
        ? null
        : (projects[0]?.id ?? null);

  const activeHouse =
    active !== null ? projects.find((project) => project.id === active) : null;
  const folderCandidate =
    activeFolderCandidate ??
    activeHouse?.folderId ??
    folders[0]?.id ??
    null;
  const activeFolderId =
    folderCandidate !== null &&
    folders.some((folder) => folder.id === folderCandidate)
      ? folderCandidate
      : (folders[0]?.id ?? null);

  const recent = (
    Array.isArray(input.recentProjectIds)
      ? input.recentProjectIds.filter((id) =>
          projects.some((project) => project.id === id),
        )
      : []
  ).slice(0, MAX_RECENT);

  const activeProjectId =
    active === null
      ? null
      : activeHouse !== null &&
          activeHouse !== undefined &&
          activeHouse.folderId === activeFolderId
        ? activeHouse.id
        : (projects.find((project) => project.folderId === activeFolderId)?.id ??
          null);

  return {
    companies: [...companiesMap.values()],
    folders,
    projects,
    activeFolderId,
    activeProjectId,
    recentProjectIds:
      recent.length > 0
        ? recent
        : activeProjectId !== null
          ? [activeProjectId]
          : [],
    lastOpenedProjectId:
      input.lastOpenedProjectId !== null &&
      input.lastOpenedProjectId !== undefined &&
      projects.some((project) => project.id === input.lastOpenedProjectId)
        ? input.lastOpenedProjectId
        : activeProjectId,
    houseFolderIds,
    houseLabels,
    houseMetadata,
  };
}

/**
 * @deprecated CAP-PLAT-02a Legacy — was import-time Registry snapshot.
 * Resolves seed houses from CPL for compatibility.
 */
export const DEFAULT_WORKSPACE_PROJECTS: readonly WorkspaceProject[] =
  composeWorkspaceRegistry({}).projects.filter((project) =>
    isCanonicalSeedProject(project.id),
  );

/**
 * @deprecated CAP-PLAT-02a Legacy — was import-time company snapshot.
 */
export const DEFAULT_WORKSPACE_COMPANIES: readonly WorkspaceCompany[] =
  composeWorkspaceRegistry({}).companies;

export function normalizeWorkspaceProject(
  input: Partial<WorkspaceProject> &
    Pick<WorkspaceProject, 'id' | 'name' | 'packageRoot'>,
): WorkspaceProject {
  const status = STATUS_VALUES.has(input.status as WorkspaceProjectStatus)
    ? (input.status as WorkspaceProjectStatus)
    : 'draft';
  return {
    id: input.id,
    name: input.name,
    packageRoot: input.packageRoot,
    companyId:
      typeof input.companyId === 'string' && input.companyId.length > 0
        ? input.companyId
        : DEFAULT_COMPANY_ID,
    folderId:
      typeof input.folderId === 'string' && input.folderId.length > 0
        ? input.folderId
        : DEFAULT_FOLDER_AC,
    description:
      typeof input.description === 'string' ? input.description : '',
    status,
    slug:
      typeof input.slug === 'string' && input.slug.length > 0
        ? input.slug
        : input.id,
    objectType:
      typeof input.objectType === 'string' && input.objectType.length > 0
        ? input.objectType
        : 'villa',
    metadata: typeof input.metadata === 'string' ? input.metadata : '',
  };
}

export function createInitialWorkspaceRegistry(): WorkspaceRegistryState {
  return composeWorkspaceRegistry({
    folders: DEFAULT_WORKSPACE_FOLDERS,
    activeProjectId: DEFAULT_ACTIVE_PROJECT_ID,
  });
}

export function findWorkspaceProject(
  state: WorkspaceRegistryState,
  projectId: string,
): WorkspaceProject | null {
  return state.projects.find((project) => project.id === projectId) ?? null;
}

export function findWorkspaceCompany(
  state: WorkspaceRegistryState,
  companyId: string,
): WorkspaceCompany | null {
  return state.companies.find((company) => company.id === companyId) ?? null;
}

export function findWorkspaceFolder(
  state: WorkspaceRegistryState,
  folderId: string,
): WorkspaceProjectFolder | null {
  return state.folders.find((folder) => folder.id === folderId) ?? null;
}

export function getActiveWorkspaceProject(
  state: WorkspaceRegistryState,
): WorkspaceProject | null {
  if (state.activeProjectId === null) {
    return null;
  }
  return findWorkspaceProject(state, state.activeProjectId);
}

export function getActiveWorkspaceFolder(
  state: WorkspaceRegistryState,
): WorkspaceProjectFolder | null {
  if (state.activeFolderId === null) {
    return null;
  }
  return findWorkspaceFolder(state, state.activeFolderId);
}

export function projectsForCompany(
  state: WorkspaceRegistryState,
  companyId: string,
): readonly WorkspaceProject[] {
  return state.projects.filter((project) => project.companyId === companyId);
}

export function housesForFolder(
  state: WorkspaceRegistryState,
  folderId: string,
): readonly WorkspaceProject[] {
  return state.projects.filter((project) => project.folderId === folderId);
}

function pushRecent(
  recent: readonly string[],
  projectId: string,
): readonly string[] {
  return [
    projectId,
    ...recent.filter((id) => id !== projectId),
  ].slice(0, MAX_RECENT);
}

function recompose(
  state: WorkspaceRegistryState,
  patch: Partial<{
    folders: readonly WorkspaceProjectFolder[];
    houseFolderIds: Readonly<Record<string, string>>;
    houseLabels: Readonly<Record<string, string>>;
    houseMetadata: Readonly<Record<string, string>>;
    activeFolderId: string | null;
    activeProjectId: string | null;
    recentProjectIds: readonly string[];
    lastOpenedProjectId: string | null;
  }>,
): WorkspaceRegistryState {
  return composeWorkspaceRegistry({
    folders: patch.folders ?? state.folders,
    houseFolderIds: patch.houseFolderIds ?? state.houseFolderIds,
    houseLabels: patch.houseLabels ?? state.houseLabels,
    houseMetadata: patch.houseMetadata ?? state.houseMetadata,
    activeFolderId:
      patch.activeFolderId !== undefined
        ? patch.activeFolderId
        : state.activeFolderId,
    activeProjectId:
      patch.activeProjectId !== undefined
        ? patch.activeProjectId
        : state.activeProjectId,
    recentProjectIds: patch.recentProjectIds ?? state.recentProjectIds,
    lastOpenedProjectId:
      patch.lastOpenedProjectId !== undefined
        ? patch.lastOpenedProjectId
        : state.lastOpenedProjectId,
  });
}

/** Open / switch active house (UI selection only). */
export function openWorkspaceProject(
  state: WorkspaceRegistryState,
  projectId: string,
): WorkspaceRegistryState {
  const project = findWorkspaceProject(state, projectId);
  if (project === null) {
    return state;
  }
  return recompose(state, {
    activeProjectId: projectId,
    activeFolderId: project.folderId,
    lastOpenedProjectId: projectId,
    recentProjectIds: pushRecent(state.recentProjectIds, projectId),
  });
}

/** Switch project folder and open its first house. */
export function openWorkspaceFolder(
  state: WorkspaceRegistryState,
  folderId: string,
): { readonly state: WorkspaceRegistryState; readonly houseId: string | null } {
  const folder = findWorkspaceFolder(state, folderId);
  if (folder === null) {
    return { state, houseId: null };
  }
  const houses = housesForFolder(state, folderId);
  const preferred =
    houses.find((house) => house.id === state.activeProjectId) ??
    houses[0] ??
    null;
  if (preferred === null) {
    return {
      state: recompose(state, {
        activeFolderId: folderId,
        activeProjectId: null,
      }),
      houseId: null,
    };
  }
  return {
    state: openWorkspaceProject(
      recompose(state, { activeFolderId: folderId }),
      preferred.id,
    ),
    houseId: preferred.id,
  };
}

export function closeWorkspaceProject(
  state: WorkspaceRegistryState,
): WorkspaceRegistryState {
  return recompose(state, { activeProjectId: null });
}

export function registerWorkspaceCompany(
  state: WorkspaceRegistryState,
  company: WorkspaceCompany,
): WorkspaceRegistryState {
  upsertBuilderCompany({
    id: company.id,
    name: company.name,
    tenantId: DEFAULT_TENANT_ID,
  });
  return recompose(state, {});
}

export function registerWorkspaceFolder(
  state: WorkspaceRegistryState,
  folder: WorkspaceProjectFolder,
): WorkspaceRegistryState {
  const without = state.folders.filter((item) => item.id !== folder.id);
  return recompose(state, {
    folders: [...without, folder],
  });
}

/**
 * Author House into Canonical Registry, then re-read via CPL.
 * CAP-PLAT-04R2c — persist parent Project via canonicalProjectId = Projekt folder id.
 */
export function registerWorkspaceProject(
  state: WorkspaceRegistryState,
  project: WorkspaceProject,
): WorkspaceRegistryState {
  const normalized = normalizeWorkspaceProject(project);
  const workspaceId = workspaceIdFromCanonical(normalized.companyId);
  const canonicalProjectId = canonicalizeFolderId(normalized.folderId);

  // CAP-PLAT-04R2c — write the House with its parent Project in one canonical step.
  upsertBuilderProject({
    id: normalized.id,
    companyId: normalized.companyId,
    workspaceId,
    name: normalized.name,
    packageRoot: normalized.packageRoot,
    status: normalized.status,
    slug: normalized.slug,
    objectType: normalized.objectType,
    description: normalized.description,
    canonicalProjectId,
  });

  return recompose(state, {
    houseFolderIds: {
      ...state.houseFolderIds,
      [normalized.id]: canonicalProjectId,
    },
    houseLabels: {
      ...state.houseLabels,
      [normalized.id]: normalized.name,
    },
    houseMetadata: {
      ...state.houseMetadata,
      [normalized.id]: normalized.metadata,
    },
  });
}

export function updateWorkspaceProject(
  state: WorkspaceRegistryState,
  projectId: string,
  patch: Partial<
    Pick<
      WorkspaceProject,
      | 'name'
      | 'companyId'
      | 'folderId'
      | 'description'
      | 'status'
      | 'slug'
      | 'metadata'
      | 'objectType'
    >
  >,
): WorkspaceRegistryState {
  const current = findWorkspaceProject(state, projectId);
  if (current === null) {
    return state;
  }
  return registerWorkspaceProject(state, {
    ...current,
    ...patch,
  });
}

export function slugifyProjectName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function resolvePackageRootForObjectType(objectType: string): string {
  const match = OBJECT_TYPE_OPTIONS.find((option) => option.id === objectType);
  return match?.packageRoot ?? OBJECT_TYPE_OPTIONS[2]!.packageRoot;
}

export type CreateWorkspaceProjectInput = {
  readonly name: string;
  readonly companyId: string;
  readonly description: string;
};

/**
 * CAP-PLAT-04R1 / CAP-PLAT-04R2b — ⊕ Nový projekt persists PlatformCanonicalProject.
 * Builder Projekt folder id === canonical projectId. Does not author a House.
 */
export function createWorkspaceProjectFromInput(
  state: WorkspaceRegistryState,
  input: CreateWorkspaceProjectInput,
): {
  readonly state: WorkspaceRegistryState;
  readonly folder: WorkspaceProjectFolder;
} {
  let next = state;
  const companyId = input.companyId.trim();

  if (companyId.length === 0) {
    throw new Error('Vyberte partnera pro nový projekt.');
  }

  if (!companyKnownInCanonical(companyId)) {
    throw new Error('Vybraný partner neexistuje v kanonickém registru.');
  }

  const baseSlug = slugifyProjectName(input.name) || 'project';
  let folderSlug = baseSlug;
  let folderId = `project-${folderSlug}`;
  let suffix = 2;
  const knownProjectIds = () =>
    new Set([
      ...state.folders.map((folder) => folder.id),
      ...listCanonicalProjects().map((item) => item.project.projectId),
    ]);
  while (knownProjectIds().has(folderId)) {
    folderSlug = `${baseSlug}-${suffix}`;
    folderId = `project-${folderSlug}`;
    suffix += 1;
  }

  const projectName = input.name.trim();
  upsertBuilderCanonicalProject({
    id: folderId,
    companyId,
    workspaceId: workspaceIdFromCanonical(companyId),
    name: projectName,
    slug: folderSlug,
    description: input.description.trim(),
  });

  const folder: WorkspaceProjectFolder = {
    id: folderId,
    name: projectName,
    companyId,
  };
  next = registerWorkspaceFolder(next, folder);

  next = recompose(next, {
    folders: next.folders,
    activeFolderId: folder.id,
    activeProjectId: null,
  });

  return { state: next, folder };
}

export type CreateWorkspaceObjectInput = {
  readonly name: string;
  readonly internalId?: string;
};

export type WorkspaceObjectIdentity = {
  readonly houseId: string;
  readonly houseSlug: string;
};

export function resolveWorkspaceObjectIdentity(
  state: WorkspaceRegistryState,
  input: CreateWorkspaceObjectInput,
): WorkspaceObjectIdentity | null {
  const name = input.name.trim();
  if (name.length === 0) {
    return null;
  }

  const requestedId = (input.internalId ?? '').trim();
  const baseSlug =
    slugifyProjectName(requestedId.length > 0 ? requestedId : name) || 'dum';

  let houseSlug = baseSlug;
  let houseId = houseSlug;
  let suffix = 2;
  while (state.projects.some((project) => project.id === houseId)) {
    houseSlug = `${baseSlug}-${suffix}`;
    houseId = houseSlug;
    suffix += 1;
  }

  return { houseId, houseSlug };
}

/**
 * ⊕ Nový objekt — House into Canonical Registry under active UI folder.
 */
export function createWorkspaceObjectFromInput(
  state: WorkspaceRegistryState,
  input: CreateWorkspaceObjectInput,
  packageRoot = '',
): {
  readonly state: WorkspaceRegistryState;
  readonly project: WorkspaceProject;
} | null {
  const folder = getActiveWorkspaceFolder(state);
  if (folder === null) {
    return null;
  }

  const identity = resolveWorkspaceObjectIdentity(state, input);
  if (identity === null) {
    return null;
  }
  const name = input.name.trim();

  const project = normalizeWorkspaceProject({
    id: identity.houseId,
    name,
    packageRoot,
    companyId: folder.companyId,
    folderId: folder.id,
    description: '',
    status: 'draft',
    slug: identity.houseSlug,
    objectType: 'house',
    metadata: BUILDER_AUTHORED_HOUSE_MARKER,
  });

  let next = registerWorkspaceProject(state, project);
  upsertWorkspaceAuthoredHouse({
    houseId: project.id,
    name: project.name,
    canonicalProjectId: folder.id,
    dataMode: 'LIVE_EMPTY',
    status: 'draft',
  });
  next = recompose(next, {
    houseLabels: {
      ...next.houseLabels,
      [project.id]: name,
    },
    activeFolderId: folder.id,
    activeProjectId: project.id,
    lastOpenedProjectId: project.id,
    recentProjectIds: pushRecent(next.recentProjectIds, project.id),
  });

  return { state: next, project: findWorkspaceProject(next, project.id) ?? project };
}

/** CAP-PLAT-02a — UI state only (no Company / Project / House documents). */
export type WorkspacePersistedSlice = {
  readonly version?: number;
  readonly activeFolderId?: string | null;
  readonly activeProjectId: string | null;
  readonly recentProjectIds: readonly string[];
  readonly lastOpenedProjectId: string | null;
  readonly folders?: readonly WorkspaceProjectFolder[];
  readonly houseFolderIds?: Readonly<Record<string, string>>;
  readonly houseLabels?: Readonly<Record<string, string>>;
  readonly houseMetadata?: Readonly<Record<string, string>>;
  /** @deprecated CAP-PLAT-02a — migrated into Canonical Registry on load. */
  readonly extraProjects?: readonly WorkspaceProject[];
  /** @deprecated CAP-PLAT-02a */
  readonly extraCompanies?: readonly WorkspaceCompany[];
  /** @deprecated CAP-PLAT-02a — folded into `folders`. */
  readonly extraFolders?: readonly WorkspaceProjectFolder[];
};

export function toPersistedWorkspaceSlice(
  state: WorkspaceRegistryState,
): WorkspacePersistedSlice {
  return {
    version: 3,
    activeFolderId: state.activeFolderId,
    activeProjectId: state.activeProjectId,
    recentProjectIds: state.recentProjectIds,
    lastOpenedProjectId: state.lastOpenedProjectId,
    folders: state.folders,
    houseFolderIds: state.houseFolderIds,
    houseLabels: state.houseLabels,
    houseMetadata: state.houseMetadata,
  };
}

function migrateLegacyDomainExtras(
  persisted: WorkspacePersistedSlice,
): {
  folders: WorkspaceProjectFolder[];
  houseFolderIds: Record<string, string>;
  houseLabels: Record<string, string>;
  houseMetadata: Record<string, string>;
} {
  const RETIRED_REGIONAL_SEED_IDS = new Set([
    'opava-harmony',
    'opava-family',
    'brno-villa',
    'brno-harmony',
  ]);
  const RETIRED_REGIONAL_FOLDER_IDS = new Set([
    'project-opava-pilot',
    'project-brno-pilot',
  ]);

  const folders: WorkspaceProjectFolder[] = [...DEFAULT_WORKSPACE_FOLDERS];
  const houseFolderIds: Record<string, string> = {};
  for (const [houseId, folderId] of Object.entries(
    persisted.houseFolderIds ?? {},
  )) {
    houseFolderIds[houseId] = canonicalizeFolderId(folderId);
  }
  const houseLabels: Record<string, string> = {
    ...(persisted.houseLabels ?? {}),
  };
  const houseMetadata: Record<string, string> = {
    ...(persisted.houseMetadata ?? {}),
  };

  for (const folder of persisted.folders ?? []) {
    if (
      typeof folder?.id === 'string' &&
      typeof folder?.name === 'string' &&
      typeof folder?.companyId === 'string' &&
      !RETIRED_REGIONAL_FOLDER_IDS.has(folder.id) &&
      !RETIRED_REGIONAL_FOLDER_IDS.has(canonicalizeFolderId(folder.id))
    ) {
      const id = canonicalizeFolderId(folder.id);
      if (!folders.some((item) => item.id === id)) {
        folders.push({
          id,
          name: folder.name,
          companyId: folder.companyId,
        });
      }
    }
  }

  const legacyFolderRefs = new Set<string>();

  for (const company of persisted.extraCompanies ?? []) {
    if (typeof company?.id === 'string' && typeof company?.name === 'string') {
      upsertBuilderCompany({
        id: company.id,
        name: company.name,
        tenantId: DEFAULT_TENANT_ID,
      });
    }
  }

  for (const project of persisted.extraProjects ?? []) {
    if (
      typeof project?.id !== 'string' ||
      typeof project?.name !== 'string' ||
      typeof project?.packageRoot !== 'string' ||
      RETIRED_REGIONAL_SEED_IDS.has(project.id)
    ) {
      continue;
    }
    const normalized = normalizeWorkspaceProject(project);
    if (
      typeof normalized.companyId === 'string' &&
      !companyKnownInCanonical(normalized.companyId)
    ) {
      upsertBuilderCompany({
        id: normalized.companyId,
        name: normalized.companyId,
        tenantId: DEFAULT_TENANT_ID,
      });
    }
    syncBuilderWorkspaceHouse({
      id: normalized.id,
      name: normalized.name,
      packageRoot: normalized.packageRoot,
      companyId: normalized.companyId,
      status: normalized.status,
      slug: normalized.slug,
      objectType: normalized.objectType,
      description: normalized.description,
      workspaceId: DEFAULT_WORKSPACE_ID,
    });
    const folderId = canonicalizeFolderId(normalized.folderId);
    upsertBuilderProject({
      id: normalized.id,
      companyId: normalized.companyId,
      workspaceId: DEFAULT_WORKSPACE_ID,
      name: normalized.name,
      packageRoot: normalized.packageRoot,
      status: normalized.status,
      slug: normalized.slug,
      objectType: normalized.objectType,
      description: normalized.description,
      canonicalProjectId: folderId,
    });
    houseFolderIds[normalized.id] = folderId;
    legacyFolderRefs.add(folderId);
    if (
      typeof normalized.name === 'string' &&
      normalized.name.length > 0 &&
      houseLabels[normalized.id] === undefined
    ) {
      houseLabels[normalized.id] = normalized.name;
    }
    if (
      typeof normalized.metadata === 'string' &&
      normalized.metadata.length > 0
    ) {
      houseMetadata[normalized.id] = normalized.metadata;
    }
    if (!folders.some((folder) => folder.id === folderId)) {
      folders.push({
        id: folderId,
        name: folderId,
        companyId: normalized.companyId,
      });
    }
  }

  for (const folder of persisted.extraFolders ?? []) {
    if (
      typeof folder?.id === 'string' &&
      typeof folder?.name === 'string' &&
      typeof folder?.companyId === 'string' &&
      !RETIRED_REGIONAL_FOLDER_IDS.has(folder.id) &&
      legacyFolderRefs.has(canonicalizeFolderId(folder.id))
    ) {
      const id = canonicalizeFolderId(folder.id);
      if (!folders.some((item) => item.id === id)) {
        folders.push({
          id,
          name: folder.name,
          companyId: folder.companyId,
        });
      }
    }
  }

  for (const seedId of ['family-98', 'harmony-124', 'villa-168']) {
    if (houseFolderIds[seedId] === undefined) {
      houseFolderIds[seedId] = DEFAULT_FOLDER_AC;
    }
  }

  return { folders, houseFolderIds, houseLabels, houseMetadata };
}

export function mergePersistedWorkspaceSlice(
  persisted: WorkspacePersistedSlice | null,
): WorkspaceRegistryState {
  if (persisted === null) {
    return createInitialWorkspaceRegistry();
  }

  const migrated = migrateLegacyDomainExtras(persisted);
  return composeWorkspaceRegistry({
    folders: migrated.folders,
    houseFolderIds: migrated.houseFolderIds,
    houseLabels: migrated.houseLabels,
    houseMetadata: migrated.houseMetadata,
    activeFolderId: persisted.activeFolderId,
    activeProjectId: persisted.activeProjectId,
    recentProjectIds: persisted.recentProjectIds,
    lastOpenedProjectId: persisted.lastOpenedProjectId,
  });
}

export type ProjectSwitchDecision =
  | { readonly action: 'switch' }
  | { readonly action: 'confirm-dirty' };

export function decideProjectSwitch(input: {
  readonly dirty: boolean;
  readonly targetProjectId: string;
  readonly activeProjectId: string | null;
}): ProjectSwitchDecision {
  if (
    input.activeProjectId !== null &&
    input.targetProjectId === input.activeProjectId
  ) {
    return { action: 'switch' };
  }
  if (input.dirty) {
    return { action: 'confirm-dirty' };
  }
  return { action: 'switch' };
}
