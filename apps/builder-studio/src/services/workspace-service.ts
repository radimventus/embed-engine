import type {
  ActiveProjectModel,
  AddAssetInput,
  AssetCategoryId,
  PartnerCard,
  ProjectPipelineSnapshot,
  ProjectRecord,
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

export type WorkspaceService = {
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

/**
 * Application Workspace service (IMP-01 / EPIC-BLD-02).
 * Coordinates registry + asset management. No Runtime / Build / Publish.
 */
export function createWorkspaceService(options: {
  readonly registry: ProjectRegistry;
  readonly assets?: AssetService;
  readonly partner?: PartnerCard;
  readonly initialActiveProjectId?: string | null;
  readonly pipelineByProject?: Readonly<
    Record<string, ProjectPipelineSnapshot>
  >;
}): WorkspaceService {
  const partner = options.partner ?? MOCK_PARTNER;
  const assets = options.assets ?? createAssetService();
  const pipelineByProject = new Map(
    Object.entries(options.pipelineByProject ?? MOCK_PIPELINE_BY_PROJECT),
  );

  const projects = options.registry.listProjects();
  let activeProjectId =
    options.initialActiveProjectId ?? projects[0]?.projectId ?? null;

  if (activeProjectId !== null) {
    const opened = options.registry.openProject(activeProjectId);
    assets.ensureProject(opened);
  }

  const requireActiveProjectId = (): string => {
    if (activeProjectId === null) {
      throw new Error('No active project');
    }
    return activeProjectId;
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
      const project = options.registry.openProject(projectId);
      assets.ensureProject(project);
      activeProjectId = project.projectId;
      return project;
    },

    createAndActivateProject(name: string): ProjectRecord {
      const project = options.registry.createProject({
        name,
        customer: partner.name,
      });
      assets.ensureProject(project);
      pipelineByProject.set(project.projectId, createDefaultPipeline(project));
      activeProjectId = project.projectId;
      return project;
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
