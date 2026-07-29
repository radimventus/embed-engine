import type {
  ActiveProjectModel,
  AddAssetInput,
  AssetCategoryId,
  CreateWorkspaceProjectInput,
  ListWorkspaceProjectsInput,
  PartnerCard,
  Project,
  ProjectPipelineSnapshot,
  ProjectRecord,
  WorkspaceEvent,
  WorkspaceEventType,
  WorkspaceIndexEntry,
  WorkspacePackage,
  WorkspaceValidation,
  UpdateAssetMetadataInput,
  WorkspaceStructure,
} from '../model';
import {
  MOCK_PARTNER,
  MOCK_PIPELINE_BY_PROJECT,
} from './mock-data';
import {
  createAssetService,
  type AssetService,
} from './asset-service';
import type { ProjectRegistry } from './project-registry-service';
import {
  createBasicWorkspaceStrategy,
  type WorkspaceStrategy,
} from './workspace-strategy';
import {
  createWorkspaceValidator,
  type WorkspaceValidator,
} from './workspace-validator';
import { createWorkspaceIndex, type WorkspaceIndex } from './workspace-index';

export type WorkspaceService = {
  initialize(): WorkspacePackage;
  createProject(input: CreateWorkspaceProjectInput): Project;
  openProject(projectId: string): Project;
  archiveProject(projectId: string): Project;
  duplicateProject(projectId: string): Project;
  listProjects(input?: ListWorkspaceProjectsInput): readonly Project[];
  findProject(projectId: string): Project | null;
  validate(): WorkspaceValidation;
  dispose(): WorkspacePackage;
  getPackage(): WorkspacePackage | null;
  getEvents(): readonly WorkspaceEvent[];
  getIndex(): readonly WorkspaceIndexEntry[];
  getWorkspace(): WorkspaceStructure;
  getActiveProject(): ProjectRecord | null;
  getActiveProjectModel(): ActiveProjectModel | null;
  getPipelineSnapshot(): ProjectPipelineSnapshot | null;
  setActiveProject(projectId: string): ProjectRecord;
  createAndActivateProject(name: string): ProjectRecord;
  addAsset(categoryId: AssetCategoryId, input: AddAssetInput): void;
  removeAsset(categoryId: AssetCategoryId, assetId: string): void;
  updateAssetMetadata(
    categoryId: AssetCategoryId,
    assetId: string,
    patch: UpdateAssetMetadataInput,
  ): void;
};

const EMPTY_PIPELINE: ProjectPipelineSnapshot = {
  projectId: '',
  validationStatus: 'Pending',
  buildStatus: 'Idle',
  publishStatus: 'Idle',
  mediaReadyPercent: 0,
  layoutReadyPercent: 0,
  knowledgeReadyPercent: 0,
  localPreviewUrl: '',
  embedSnippet: '',
};

function createDefaultPipeline(project: ProjectRecord): ProjectPipelineSnapshot {
  return {
    ...EMPTY_PIPELINE,
    projectId: project.projectId,
    localPreviewUrl: `http://localhost:3000/${project.projectId}`,
    embedSnippet: `<script src="https://embed.conis.ai/${project.projectId}.js"></script>`,
  };
}

function filterAndSortProjects(
  projects: readonly Project[],
  input: ListWorkspaceProjectsInput = {},
): readonly Project[] {
  const query = input.query?.trim().toLowerCase() ?? '';
  const filtered =
    query.length === 0
      ? [...projects]
      : projects.filter((project) => project.name.toLowerCase().includes(query));

  const sortBy = input.sortBy ?? 'updatedAt';
  filtered.sort((left, right) => {
    if (sortBy === 'name') {
      return left.name.localeCompare(right.name);
    }
    if (sortBy === 'status') {
      return left.status.localeCompare(right.status);
    }
    return right.updatedAt.localeCompare(left.updatedAt);
  });
  return filtered;
}

/**
 * Project Workspace service (EPIC-BX-01).
 * Organizational entry layer only — no object editing, publish, Runtime, AI.
 */
export function createWorkspaceService(options: {
  readonly registry: ProjectRegistry;
  readonly assets?: AssetService;
  readonly partner?: PartnerCard;
  readonly initialActiveProjectId?: string | null;
  readonly pipelineByProject?: Readonly<
    Record<string, ProjectPipelineSnapshot>
  >;
  readonly strategy?: WorkspaceStrategy;
  readonly validator?: WorkspaceValidator;
  readonly index?: WorkspaceIndex;
  readonly now?: () => Date;
}): WorkspaceService {
  const partner = options.partner ?? MOCK_PARTNER;
  const assets = options.assets ?? createAssetService();
  const strategy = options.strategy ?? createBasicWorkspaceStrategy();
  const validator = options.validator ?? createWorkspaceValidator();
  const index = options.index ?? createWorkspaceIndex();
  const now = options.now ?? (() => new Date());
  const pipelineByProject = new Map(
    Object.entries(options.pipelineByProject ?? MOCK_PIPELINE_BY_PROJECT),
  );
  const descriptions = new Map<string, string>();
  const lastOpenedAt = new Map<string, string>();

  const projects = options.registry.listProjects();
  let activeProjectId: string | null =
    options.initialActiveProjectId ?? projects[0]?.projectId ?? null;

  if (activeProjectId !== null) {
    const opened = options.registry.openProject(activeProjectId);
    assets.ensureProject(opened);
    lastOpenedAt.set(activeProjectId, now().toISOString());
  }

  let eventSequence = 0;
  let workspacePackage: WorkspacePackage | null = null;
  const events: WorkspaceEvent[] = [];

  const requireActiveProjectId = (): string => {
    if (activeProjectId === null) {
      throw new Error('No active project');
    }
    return activeProjectId;
  };

  const mapStatus = (status: ProjectRecord['status']): Project['status'] => {
    switch (status) {
      case 'Published':
        return 'PUBLISHED';
      case 'Archived':
        return 'ARCHIVED';
      case 'Built':
      case 'ReadyForBuild':
      case 'ReadyForPublish':
        return 'READY';
      default:
        return 'DRAFT';
    }
  };

  const toThumbnail = (record: ProjectRecord): string =>
    `https://dummyimage.com/640x360/e8eef7/22304a&text=${encodeURIComponent(
      record.name,
    )}`;

  const toProject = (record: ProjectRecord): Project => ({
    id: record.projectId,
    name: record.name,
    slug: record.projectId,
    description:
      descriptions.get(record.projectId) ??
      `${record.name} — ${record.customer}`,
    status: mapStatus(record.status),
    thumbnail: toThumbnail(record),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastOpenedAt: lastOpenedAt.get(record.projectId) ?? null,
    metadata: {
      customer: record.customer,
      manifestPath: record.manifestPath,
      lastSyncedAt: record.lastSyncedAt,
      syncStatus: record.syncStatus,
    },
  });

  const snapshotProjects = (): readonly Project[] =>
    options.registry.listProjects().map(toProject);

  const refreshPackage = (): WorkspacePackage => {
    const stamp = now().toISOString();
    workspacePackage = {
      id: workspacePackage?.id ?? 'builder-project-workspace',
      version: '1.0.0',
      createdAt: workspacePackage?.createdAt ?? stamp,
      updatedAt: stamp,
      projects: snapshotProjects(),
      metadata: {
        title: 'Projects',
        activeProjectId,
        projectCount: options.registry.listProjects().length,
        status: 'Ready',
      },
    };
    index.rebuild(workspacePackage.projects);
    return workspacePackage;
  };

  const emit = (
    type: WorkspaceEventType,
    projectId: string,
    message: string,
  ): void => {
    eventSequence += 1;
    events.push({
      eventId: `workspace-event-${String(eventSequence).padStart(4, '0')}`,
      type,
      projectId,
      at: now().toISOString(),
      message,
    });
  };

  const buildWorkspace = (): WorkspaceStructure => ({
    workspaceId: 'builder-workspace-local',
    partner,
    projects: options.registry.listProjects(),
    activeProjectId,
    assets: { placeholder: true },
    runtime: { placeholder: true },
    publish: { placeholder: true },
  });

  return {
    initialize() {
      return refreshPackage();
    },

    createProject(input) {
      const normalized: CreateWorkspaceProjectInput = {
        name: input.name.trim(),
        description: input.description?.trim(),
      };
      if (!strategy.supports(normalized)) {
        throw new Error('Workspace strategy does not support this input.');
      }
      const project = strategy.create(
        normalized,
        snapshotProjects(),
        (createInput) => {
          const record = options.registry.createProject({
            name: createInput.name,
            customer: partner.name,
          });
          if (createInput.description !== undefined) {
            descriptions.set(record.projectId, createInput.description);
          }
          return toProject(record);
        },
      );
      const record = options.registry.getProject(project.id);
      if (record !== null) {
        assets.ensureProject(record);
        pipelineByProject.set(record.projectId, createDefaultPipeline(record));
        activeProjectId = record.projectId;
        lastOpenedAt.set(record.projectId, now().toISOString());
      }
      refreshPackage();
      emit('ProjectCreated', project.id, `Project created: ${project.name}`);
      return this.findProject(project.id) ?? project;
    },

    openProject(projectId) {
      const project = options.registry.openProject(projectId);
      assets.ensureProject(project);
      activeProjectId = project.projectId;
      lastOpenedAt.set(project.projectId, now().toISOString());
      refreshPackage();
      emit('ProjectOpened', project.projectId, `Project opened: ${project.name}`);
      return toProject(project);
    },

    archiveProject(projectId) {
      const before = options.registry.getProject(projectId);
      if (before === null) {
        throw new Error(`Project not found: ${projectId}`);
      }
      const previousStatus = mapStatus(before.status);
      const project = options.registry.archiveProject(projectId);
      if (activeProjectId === projectId) {
        activeProjectId =
          options.registry
            .listProjects()
            .find(
              (item) =>
                item.projectId !== projectId && item.status !== 'Archived',
            )?.projectId ?? null;
      }
      refreshPackage();
      emit(
        'ProjectArchived',
        project.projectId,
        `Project archived: ${project.name}`,
      );
      emit(
        'ProjectStatusChanged',
        project.projectId,
        `Status changed ${previousStatus} → ARCHIVED`,
      );
      return toProject(project);
    },

    duplicateProject(projectId) {
      const source = options.registry.getProject(projectId);
      if (source === null) {
        throw new Error(`Project not found: ${projectId}`);
      }
      const duplicatedRecord = options.registry.createProject({
        name: `${source.name} Copy`,
        customer: source.customer,
      });
      const sourceDescription = descriptions.get(projectId);
      if (sourceDescription !== undefined) {
        descriptions.set(duplicatedRecord.projectId, sourceDescription);
      }
      assets.cloneProject(projectId, duplicatedRecord);
      pipelineByProject.set(
        duplicatedRecord.projectId,
        pipelineByProject.get(projectId) ??
          createDefaultPipeline(duplicatedRecord),
      );
      activeProjectId = duplicatedRecord.projectId;
      lastOpenedAt.set(duplicatedRecord.projectId, now().toISOString());
      refreshPackage();
      emit(
        'ProjectDuplicated',
        duplicatedRecord.projectId,
        `Project duplicated from ${projectId}`,
      );
      return toProject(duplicatedRecord);
    },

    listProjects(input) {
      return filterAndSortProjects(snapshotProjects(), input);
    },

    findProject(projectId) {
      const record = options.registry.getProject(projectId);
      return record === null ? null : toProject(record);
    },

    validate() {
      return validator.validate(refreshPackage());
    },

    dispose() {
      const pkg = refreshPackage();
      workspacePackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
        },
      };
      return workspacePackage;
    },

    getPackage() {
      return workspacePackage;
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },

    getWorkspace(): WorkspaceStructure {
      return buildWorkspace();
    },

    getActiveProject(): ProjectRecord | null {
      if (activeProjectId === null) {
        return null;
      }
      return options.registry.getProject(activeProjectId);
    },

    getActiveProjectModel(): ActiveProjectModel | null {
      if (activeProjectId === null) {
        return null;
      }
      const record = options.registry.getProject(activeProjectId);
      if (record === null) {
        return null;
      }
      return assets.ensureProject(record);
    },

    getPipelineSnapshot(): ProjectPipelineSnapshot | null {
      const project = this.getActiveProject();
      if (project === null) {
        return null;
      }
      return (
        pipelineByProject.get(project.projectId) ??
        createDefaultPipeline(project)
      );
    },

    setActiveProject(projectId: string): ProjectRecord {
      const project = this.openProject(projectId);
      const record = options.registry.getProject(project.id);
      if (record === null) {
        throw new Error(`Project not found: ${project.id}`);
      }
      return record;
    },

    createAndActivateProject(name: string): ProjectRecord {
      const project = this.createProject({ name });
      const record = options.registry.getProject(project.id);
      if (record === null) {
        throw new Error(`Project not found: ${project.id}`);
      }
      return record;
    },

    addAsset(categoryId: AssetCategoryId, input: AddAssetInput): void {
      assets.addAsset(requireActiveProjectId(), categoryId, input);
    },

    removeAsset(categoryId: AssetCategoryId, assetId: string): void {
      assets.removeAsset(requireActiveProjectId(), categoryId, assetId);
    },

    updateAssetMetadata(
      categoryId: AssetCategoryId,
      assetId: string,
      patch: UpdateAssetMetadataInput,
    ): void {
      assets.updateMetadata(
        requireActiveProjectId(),
        categoryId,
        assetId,
        patch,
      );
    },
  };
}
