/**
 * CAP-BLD-08 + EPIC-BX-01 / BX-14 / PT-PDM-02 — Workspace registry (Projekt → Domy).
 * Content remains in each House Package root. Identity syncs to Shared Project Runtime.
 */

import {
  DEFAULT_COMPANY_ID as PLATFORM_DEFAULT_COMPANY_ID,
  DEFAULT_PROJECT_ID as PLATFORM_DEFAULT_PROJECT_ID,
  DEFAULT_WORKSPACE_ID,
  getDefaultCompanyRegistry,
  syncBuilderWorkspaceHouse,
} from '@embed-engine/platform-access';

export type WorkspaceProjectStatus = 'draft' | 'ready' | 'published';

export type WorkspaceCompany = {
  readonly id: string;
  readonly name: string;
};

/** UI „Projekt“ — kontejner domů (ne HP obsah). */
export type WorkspaceProjectFolder = {
  readonly id: string;
  readonly name: string;
  readonly companyId: string;
};

/** UI „Dům“ — House Package mount. */
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
};

export const DEFAULT_COMPANY_ID = PLATFORM_DEFAULT_COMPANY_ID;

const platformRegistry = getDefaultCompanyRegistry();

export const DEFAULT_WORKSPACE_COMPANIES: readonly WorkspaceCompany[] =
  platformRegistry.companies.map((company) => ({
    id: company.id,
    name: company.name,
  }));

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

const DEFAULT_FOLDER_AC = 'project-ac-modular-pilot';
const DEFAULT_FOLDER_OPAVA = 'project-opava-pilot';
const DEFAULT_FOLDER_BRNO = 'project-brno-pilot';

export const DEFAULT_WORKSPACE_FOLDERS: readonly WorkspaceProjectFolder[] = [
  {
    id: DEFAULT_FOLDER_AC,
    name: 'AC Modular Pilot',
    companyId: DEFAULT_COMPANY_ID,
  },
  {
    id: DEFAULT_FOLDER_OPAVA,
    name: 'Opava Pilot',
    companyId: DEFAULT_COMPANY_ID,
  },
  {
    id: DEFAULT_FOLDER_BRNO,
    name: 'Brno Pilot',
    companyId: DEFAULT_COMPANY_ID,
  },
];

const PLATFORM_HOUSES: readonly WorkspaceProject[] =
  platformRegistry.projects.map((project) => ({
    id: project.id,
    name: project.name,
    packageRoot: project.packageRoot,
    companyId: project.companyId,
    folderId: DEFAULT_FOLDER_AC,
    description: project.description,
    status: project.status,
    slug: project.slug,
    objectType: project.objectType,
    metadata: '',
  }));

/** PR-003A — Product Review seed: ≥3 projekty, každý ≥2 domy. */
export const DEFAULT_WORKSPACE_PROJECTS: readonly WorkspaceProject[] = [
  ...PLATFORM_HOUSES,
  {
    id: 'opava-harmony',
    name: 'Harmony 124',
    packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
    companyId: DEFAULT_COMPANY_ID,
    folderId: DEFAULT_FOLDER_OPAVA,
    description: 'Opava — Harmony',
    status: 'ready',
    slug: 'opava-harmony',
    objectType: 'harmony',
    metadata: '',
  },
  {
    id: 'opava-family',
    name: 'Family 98',
    packageRoot: 'apps/client-studio/public/house-packages/family-98',
    companyId: DEFAULT_COMPANY_ID,
    folderId: DEFAULT_FOLDER_OPAVA,
    description: 'Opava — Family',
    status: 'draft',
    slug: 'opava-family',
    objectType: 'family',
    metadata: '',
  },
  {
    id: 'brno-villa',
    name: 'Villa 168',
    packageRoot: 'apps/client-studio/public/house-package',
    companyId: DEFAULT_COMPANY_ID,
    folderId: DEFAULT_FOLDER_BRNO,
    description: 'Brno — Villa',
    status: 'published',
    slug: 'brno-villa',
    objectType: 'villa',
    metadata: '',
  },
  {
    id: 'brno-harmony',
    name: 'Harmony 124',
    packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
    companyId: DEFAULT_COMPANY_ID,
    folderId: DEFAULT_FOLDER_BRNO,
    description: 'Brno — Harmony',
    status: 'ready',
    slug: 'brno-harmony',
    objectType: 'harmony',
    metadata: '',
  },
];

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

export function createInitialWorkspaceRegistry(
  projects: readonly WorkspaceProject[] = DEFAULT_WORKSPACE_PROJECTS,
  activeProjectId: string | null = DEFAULT_ACTIVE_PROJECT_ID,
  companies: readonly WorkspaceCompany[] = DEFAULT_WORKSPACE_COMPANIES,
  folders: readonly WorkspaceProjectFolder[] = DEFAULT_WORKSPACE_FOLDERS,
): WorkspaceRegistryState {
  const normalized = projects.map((project) =>
    normalizeWorkspaceProject(project),
  );
  const active =
    activeProjectId !== null &&
    normalized.some((project) => project.id === activeProjectId)
      ? activeProjectId
      : (normalized[0]?.id ?? null);
  const activeHouse =
    active !== null ? normalized.find((project) => project.id === active) : null;
  const activeFolderId =
    activeHouse?.folderId ?? folders[0]?.id ?? null;

  return {
    companies: [...companies],
    folders: [...folders],
    projects: normalized,
    activeFolderId,
    activeProjectId: active,
    recentProjectIds: active !== null ? [active] : [],
    lastOpenedProjectId: active,
  };
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

/** Open / switch active house (metadata only). */
export function openWorkspaceProject(
  state: WorkspaceRegistryState,
  projectId: string,
): WorkspaceRegistryState {
  const project = findWorkspaceProject(state, projectId);
  if (project === null) {
    return state;
  }
  return {
    ...state,
    activeProjectId: projectId,
    activeFolderId: project.folderId,
    lastOpenedProjectId: projectId,
    recentProjectIds: pushRecent(state.recentProjectIds, projectId),
  };
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
      state: {
        ...state,
        activeFolderId: folderId,
        activeProjectId: null,
      },
      houseId: null,
    };
  }
  return {
    state: openWorkspaceProject(
      { ...state, activeFolderId: folderId },
      preferred.id,
    ),
    houseId: preferred.id,
  };
}

export function closeWorkspaceProject(
  state: WorkspaceRegistryState,
): WorkspaceRegistryState {
  return {
    ...state,
    activeProjectId: null,
  };
}

export function registerWorkspaceCompany(
  state: WorkspaceRegistryState,
  company: WorkspaceCompany,
): WorkspaceRegistryState {
  const without = state.companies.filter((item) => item.id !== company.id);
  return {
    ...state,
    companies: [...without, company],
  };
}

export function registerWorkspaceFolder(
  state: WorkspaceRegistryState,
  folder: WorkspaceProjectFolder,
): WorkspaceRegistryState {
  const without = state.folders.filter((item) => item.id !== folder.id);
  return {
    ...state,
    folders: [...without, folder],
  };
}

export function registerWorkspaceProject(
  state: WorkspaceRegistryState,
  project: WorkspaceProject,
): WorkspaceRegistryState {
  const normalized = normalizeWorkspaceProject(project);
  const without = state.projects.filter((item) => item.id !== normalized.id);
  /** PDM-02 — Builder is the sole author of Shared Project identity. */
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
  return {
    ...state,
    projects: [...without, normalized],
  };
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
  readonly companyName?: string;
  readonly objectType: string;
  readonly description: string;
};

/**
 * ⊕ Nový projekt — vytvoří Projekt (folder) + první dům.
 */
export function createWorkspaceProjectFromInput(
  state: WorkspaceRegistryState,
  input: CreateWorkspaceProjectInput,
): {
  readonly state: WorkspaceRegistryState;
  readonly project: WorkspaceProject;
  readonly folder: WorkspaceProjectFolder;
} {
  let next = state;
  let companyId = input.companyId;

  if (companyId === '__new__') {
    const companyName = (input.companyName ?? '').trim();
    const companySlug = slugifyProjectName(companyName) || 'company';
    companyId = `company-${companySlug}`;
    next = registerWorkspaceCompany(next, {
      id: companyId,
      name: companyName.length > 0 ? companyName : 'Nová firma',
    });
  }

  const baseSlug = slugifyProjectName(input.name) || 'project';
  let folderSlug = baseSlug;
  let folderId = `project-${folderSlug}`;
  let suffix = 2;
  while (next.folders.some((folder) => folder.id === folderId)) {
    folderSlug = `${baseSlug}-${suffix}`;
    folderId = `project-${folderSlug}`;
    suffix += 1;
  }

  const folder: WorkspaceProjectFolder = {
    id: folderId,
    name: input.name.trim(),
    companyId,
  };
  next = registerWorkspaceFolder(next, folder);

  let houseSlug = `${folderSlug}-dum`;
  let houseId = houseSlug;
  suffix = 2;
  while (next.projects.some((project) => project.id === houseId)) {
    houseSlug = `${folderSlug}-dum-${suffix}`;
    houseId = houseSlug;
    suffix += 1;
  }

  const objectLabel =
    OBJECT_TYPE_OPTIONS.find((option) => option.id === input.objectType)
      ?.label ?? 'Dům';

  const project = normalizeWorkspaceProject({
    id: houseId,
    name: objectLabel,
    packageRoot: resolvePackageRootForObjectType(input.objectType),
    companyId,
    folderId: folder.id,
    description: input.description.trim(),
    status: 'draft',
    slug: houseSlug,
    objectType: input.objectType,
    metadata: '',
  });

  next = registerWorkspaceProject(next, project);
  next = {
    ...next,
    activeFolderId: folder.id,
    activeProjectId: project.id,
    lastOpenedProjectId: project.id,
    recentProjectIds: pushRecent(next.recentProjectIds, project.id),
  };

  return { state: next, project, folder };
}

export type CreateWorkspaceObjectInput = {
  readonly name: string;
  /** Optional internal identifier → house id/slug. */
  readonly internalId?: string;
};

/**
 * ⊕ Nový objekt — přidá dům do aktivního projektu (folderu).
 */
export function createWorkspaceObjectFromInput(
  state: WorkspaceRegistryState,
  input: CreateWorkspaceObjectInput,
): {
  readonly state: WorkspaceRegistryState;
  readonly project: WorkspaceProject;
} | null {
  const folder = getActiveWorkspaceFolder(state);
  if (folder === null) {
    return null;
  }

  const siblings = housesForFolder(state, folder.id);
  const template =
    siblings.find((house) => house.id === state.activeProjectId) ??
    siblings[0] ??
    null;

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

  const project = normalizeWorkspaceProject({
    id: houseId,
    name,
    packageRoot:
      template?.packageRoot ?? resolvePackageRootForObjectType('villa'),
    companyId: folder.companyId,
    folderId: folder.id,
    description: '',
    status: 'draft',
    slug: houseSlug,
    objectType: template?.objectType ?? 'villa',
    metadata: '',
  });

  let next = registerWorkspaceProject(state, project);
  next = {
    ...next,
    activeFolderId: folder.id,
    activeProjectId: project.id,
    lastOpenedProjectId: project.id,
    recentProjectIds: pushRecent(next.recentProjectIds, project.id),
  };

  return { state: next, project };
}

export type WorkspacePersistedSlice = {
  readonly activeFolderId?: string | null;
  readonly activeProjectId: string | null;
  readonly recentProjectIds: readonly string[];
  readonly lastOpenedProjectId: string | null;
  readonly extraProjects: readonly WorkspaceProject[];
  readonly extraCompanies?: readonly WorkspaceCompany[];
  readonly extraFolders?: readonly WorkspaceProjectFolder[];
};

export function toPersistedWorkspaceSlice(
  state: WorkspaceRegistryState,
): WorkspacePersistedSlice {
  const defaultIds = new Set(DEFAULT_WORKSPACE_PROJECTS.map((p) => p.id));
  const defaultCompanyIds = new Set(
    DEFAULT_WORKSPACE_COMPANIES.map((company) => company.id),
  );
  const defaultFolderIds = new Set(
    DEFAULT_WORKSPACE_FOLDERS.map((folder) => folder.id),
  );
  return {
    activeFolderId: state.activeFolderId,
    activeProjectId: state.activeProjectId,
    recentProjectIds: state.recentProjectIds,
    lastOpenedProjectId: state.lastOpenedProjectId,
    extraProjects: state.projects.filter((p) => !defaultIds.has(p.id)),
    extraCompanies: state.companies.filter(
      (company) => !defaultCompanyIds.has(company.id),
    ),
    extraFolders: state.folders.filter(
      (folder) => !defaultFolderIds.has(folder.id),
    ),
  };
}

export function mergePersistedWorkspaceSlice(
  persisted: WorkspacePersistedSlice | null,
): WorkspaceRegistryState {
  const base = createInitialWorkspaceRegistry();
  if (persisted === null) {
    return base;
  }

  const extras = Array.isArray(persisted.extraProjects)
    ? persisted.extraProjects
        .filter(
          (project) =>
            typeof project?.id === 'string' &&
            typeof project?.name === 'string' &&
            typeof project?.packageRoot === 'string',
        )
        .map((project) => normalizeWorkspaceProject(project))
    : [];

  const extraCompanies = Array.isArray(persisted.extraCompanies)
    ? persisted.extraCompanies.filter(
        (company) =>
          typeof company?.id === 'string' &&
          typeof company?.name === 'string',
      )
    : [];

  const extraFolders = Array.isArray(persisted.extraFolders)
    ? persisted.extraFolders.filter(
        (folder) =>
          typeof folder?.id === 'string' &&
          typeof folder?.name === 'string' &&
          typeof folder?.companyId === 'string',
      )
    : [];

  const companies = [...DEFAULT_WORKSPACE_COMPANIES, ...extraCompanies];
  const folders = [...DEFAULT_WORKSPACE_FOLDERS, ...extraFolders];
  const projects = [...DEFAULT_WORKSPACE_PROJECTS, ...extras].map((project) =>
    normalizeWorkspaceProject(project),
  );
  const activeCandidate =
    persisted.activeProjectId ??
    persisted.lastOpenedProjectId ??
    base.activeProjectId;
  const active =
    activeCandidate !== null &&
    projects.some((project) => project.id === activeCandidate)
      ? activeCandidate
      : base.activeProjectId;
  const activeHouse =
    active !== null ? projects.find((project) => project.id === active) : null;
  const folderCandidate =
    persisted.activeFolderId ?? activeHouse?.folderId ?? base.activeFolderId;
  const activeFolderId =
    folderCandidate !== null &&
    folders.some((folder) => folder.id === folderCandidate)
      ? folderCandidate
      : (folders[0]?.id ?? null);

  const recent = (
    Array.isArray(persisted.recentProjectIds)
      ? persisted.recentProjectIds.filter((id) =>
          projects.some((project) => project.id === id),
        )
      : []
  ).slice(0, MAX_RECENT);

  return {
    companies,
    folders,
    projects,
    activeFolderId,
    activeProjectId: active,
    recentProjectIds:
      recent.length > 0 ? recent : active !== null ? [active] : [],
    lastOpenedProjectId:
      persisted.lastOpenedProjectId !== null &&
      projects.some((project) => project.id === persisted.lastOpenedProjectId)
        ? persisted.lastOpenedProjectId
        : active,
  };
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
