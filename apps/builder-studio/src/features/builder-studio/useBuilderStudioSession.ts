import { useMemo, useState } from 'react';

import type {
  ActiveProjectModel,
  AIContextPackage,
  AssetCategoryId,
  BuildAIContextInput,
  BuildResult,
  BuilderProjectManifest,
  ComposerEvent,
  ContextEvent,
  Experience,
  ExperienceStructureReport,
  BuildDecisionModelInput,
  CreateRuntimeInput,
  DecisionEngineEvent,
  DecisionEvent,
  DecisionKnowledgePackage,
  DecisionModel,
  DecisionRuntimeEvent,
  KnowledgeEvent,
  RuntimeModel,
  KnowledgeLayerBundle,
  KnowledgeLayerDefinition,
  KnowledgeLayerEvent,
  KnowledgePackage,
  KnowledgeReference,
  LearningEvent,
  LearningOriginDefinition,
  LearningPackage,
  ResolvedLayerReferences,
  ObjectEvent,
  PriorityDefinition,
  PriorityId,
  ObjectModuleDefinition,
  ObjectModuleId,
  ObjectPackage,
  PreviewEvent,
  PreviewSnapshot,
  ProjectPipelineSnapshot,
  PublishResult,
  ReadinessReport,
  TimelineEntry,
  UpdateAssetMetadataInput,
  UpdateObjectMetadataInput,
  ValidationEvent,
  ValidationReport,
  VersionInfo,
  WorkspaceSectionId,
  WorkspaceStructure,
} from '../../model';
import {
  createAssetService,
  createBuildService,
  createExperienceComposerApi,
  createExperienceComposerService,
  createAIContextApi,
  createAIContextBuilderService,
  createDecisionEngine,
  createDecisionEngineApi,
  createDecisionKnowledgeApi,
  createDecisionRuntime,
  createDecisionRuntimeApi,
  createDecisionKnowledgeService,
  createKnowledgeApi,
  createKnowledgeContextResolver,
  createKnowledgeLayerApi,
  createKnowledgeLayerService,
  createKnowledgeService,
  createLearningApi,
  createLearningService,
  listKnowledgeLayers,
  listLearningOrigins,
  createLifecycleService,
  createObjectApi,
  createObjectService,
  createPlatformEventBus,
  createProjectRegistry,
  createPublishService,
  createReadinessService,
  createRuntimePreviewService,
  createValidationService,
  createWorkspaceService,
  isPublishAllowedByQualityGate,
  listObjectModules,
  listPriorities,
  toTimelineEntries,
  type DecisionKnowledgeService,
  type ExperienceComposerService,
  type KnowledgeService,
  type ObjectService,
} from '../../services';

export type BuilderStudioViewModel = {
  readonly workspace: WorkspaceStructure;
  readonly activeProjectModel: ActiveProjectModel | null;
  readonly objectPackage: ObjectPackage | null;
  readonly experience: Experience | null;
  readonly experienceStructure: ExperienceStructureReport | null;
  readonly composerEvents: readonly ComposerEvent[];
  readonly selectedSceneId: string | null;
  readonly knowledgePackage: KnowledgePackage | null;
  readonly knowledgeEvents: readonly KnowledgeEvent[];
  readonly decisionKnowledge: DecisionKnowledgePackage | null;
  readonly decisionEvents: readonly DecisionEvent[];
  readonly aiContext: AIContextPackage | null;
  readonly contextEvents: readonly ContextEvent[];
  readonly knowledgeLayerRegistry: readonly KnowledgeLayerDefinition[];
  readonly knowledgeLayerBundle: KnowledgeLayerBundle | null;
  readonly knowledgeLayerEvents: readonly KnowledgeLayerEvent[];
  readonly knowledgeReferences: readonly KnowledgeReference[];
  readonly resolvedLayers: {
    readonly platform: ResolvedLayerReferences;
    readonly company: ResolvedLayerReferences;
    readonly object: ResolvedLayerReferences;
    readonly session: ResolvedLayerReferences;
  } | null;
  readonly learningPackage: LearningPackage | null;
  readonly learningEvents: readonly LearningEvent[];
  readonly learningOrigins: readonly LearningOriginDefinition[];
  readonly decisionModel: DecisionModel | null;
  readonly decisionEngineEvents: readonly DecisionEngineEvent[];
  readonly runtimeModel: RuntimeModel | null;
  readonly decisionRuntimeEvents: readonly DecisionRuntimeEvent[];
  readonly priorityRegistry: readonly PriorityDefinition[];
  readonly moduleRegistry: readonly ObjectModuleDefinition[];
  readonly objectEvents: readonly ObjectEvent[];
  readonly pipeline: ProjectPipelineSnapshot | null;
  readonly activeSection: WorkspaceSectionId;
  readonly latestBuild: BuildResult | null;
  readonly buildHistory: readonly BuildResult[];
  readonly latestPublish: PublishResult | null;
  readonly publishHistory: readonly PublishResult[];
  readonly preview: PreviewSnapshot;
  readonly previewHistory: readonly PreviewEvent[];
  readonly projectManifest: BuilderProjectManifest | null;
  readonly versions: VersionInfo | null;
  readonly readiness: ReadinessReport | null;
  readonly timeline: readonly TimelineEntry[];
  readonly validationReport: ValidationReport | null;
  readonly validationHistory: readonly ValidationReport[];
  readonly validationEvents: readonly ValidationEvent[];
  readonly openProject: (projectId: string) => void;
  readonly createProject: () => void;
  readonly selectSection: (sectionId: WorkspaceSectionId) => void;
  readonly addAsset: (categoryId: AssetCategoryId) => void;
  readonly removeAsset: (
    categoryId: AssetCategoryId,
    assetId: string,
  ) => void;
  readonly updateAssetMetadata: (
    categoryId: AssetCategoryId,
    assetId: string,
    patch: UpdateAssetMetadataInput,
  ) => void;
  readonly updateObjectMetadata: (patch: UpdateObjectMetadataInput) => void;
  readonly toggleObjectModule: (moduleId: ObjectModuleId) => void;
  readonly saveObject: () => void;
  readonly duplicateObject: () => void;
  readonly selectScene: (sceneId: string) => void;
  readonly addScene: () => void;
  readonly renameScene: (sceneId: string, title: string) => void;
  readonly moveScene: (sceneId: string, direction: 'up' | 'down') => void;
  readonly removeScene: (sceneId: string) => void;
  readonly toggleSceneModule: (
    sceneId: string,
    moduleId: ObjectModuleId,
  ) => void;
  readonly saveKnowledge: () => void;
  readonly addFact: () => void;
  readonly addEntity: () => void;
  readonly addRelationship: () => void;
  readonly addFaq: () => void;
  readonly saveDecisionKnowledge: () => void;
  readonly addDecisionRule: () => void;
  readonly addDecisionSignal: () => void;
  readonly addDecisionStrategy: () => void;
  readonly toggleDecisionPriority: (priorityId: PriorityId) => void;
  readonly buildAIContext: () => void;
  readonly refreshAIContext: () => void;
  readonly clearAIContext: () => void;
  readonly ensureKnowledgeLayers: () => void;
  readonly addDemoLayerReferences: () => void;
  readonly removeLayerReference: (referenceId: string) => void;
  readonly saveLearning: () => void;
  readonly addLearningObservation: () => void;
  readonly addLearningPattern: () => void;
  readonly addLearningHeuristic: () => void;
  readonly buildDecisionModel: () => void;
  readonly validateDecisionModel: () => void;
  readonly disposeDecisionModel: () => void;
  readonly createDecisionRuntime: () => void;
  readonly validateDecisionRuntime: () => void;
  readonly disposeDecisionRuntime: () => void;
  readonly validateProject: () => void;
  readonly buildProject: () => void;
  readonly publishPackage: () => void;
  readonly openPreview: () => void;
  readonly refreshPreview: () => void;
  readonly closePreview: () => void;
};

function ensureObjectPackage(
  objectService: ObjectService,
  project: ActiveProjectModel,
): ObjectPackage {
  const existing = objectService.loadObjectByProject(project.projectId);
  const objectPackage =
    existing ??
    objectService.createObject({
      projectId: project.projectId,
      name: project.record.name,
      location: project.metadata.locationLabel,
      description: project.metadata.notes,
      tags:
        project.projectId === 'harmony-124'
          ? ['modular', 'harmony']
          : project.projectId === 'family-98'
            ? ['family']
            : [],
    });
  return objectService.syncContentFromProject(
    objectPackage.objectId,
    project,
  );
}

function ensureExperience(
  composer: ExperienceComposerService,
  objectService: ObjectService,
  objectPackage: ObjectPackage,
): Experience {
  const existing = composer.loadExperienceByObject(objectPackage.objectId);
  const experience =
    existing ??
    composer.createExperience({
      objectId: objectPackage.objectId,
      title: `${objectPackage.metadata.name} Experience`,
      description: objectPackage.metadata.description,
      availableModules: objectPackage.modules,
    });
  objectService.setExperience(objectPackage.objectId, experience);
  return experience;
}


function ensureKnowledge(
  knowledgeService: KnowledgeService,
  objectService: ObjectService,
  objectPackage: ObjectPackage,
  project: ActiveProjectModel | null,
): KnowledgePackage {
  const existing = knowledgeService.loadKnowledgeByObject(objectPackage.objectId);
  const knowledge =
    existing ??
    knowledgeService.createKnowledge({
      objectId: objectPackage.objectId,
      title: `${objectPackage.metadata.name} Knowledge`,
      description: objectPackage.metadata.description,
    });
  const synced =
    project === null
      ? knowledge
      : knowledgeService.syncDocumentsFromProject(knowledge.knowledgeId, project);
  objectService.setKnowledgePackage(objectPackage.objectId, synced);
  return synced;
}





function toCreateRuntimeInput(model: DecisionModel): CreateRuntimeInput {
  return {
    decisionModelId: model.id,
    objectId: model.objectId,
    title: `${model.metadata.title} Runtime`,
    knowledgeId: model.knowledge,
    decisionKnowledgeId: model.decisionKnowledge,
    experienceId: model.experience,
    learningId: model.learning,
    graph: {
      nodes: model.graph.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        label: node.label,
        sourceId: node.sourceId,
      })),
      edges: model.graph.edges.map((edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        relation: edge.relation,
      })),
    },
  };
}

function toBuildDecisionModelInput(
  objectPackage: ObjectPackage,
  experience: Experience | null,
  knowledge: KnowledgePackage | null,
  decision: DecisionKnowledgePackage | null,
  learning: LearningPackage | null,
): BuildDecisionModelInput {
  return {
    objectId: objectPackage.objectId,
    title: `${objectPackage.metadata.name} Decision Model`,
    knowledgeId: knowledge?.knowledgeId ?? null,
    decisionKnowledgeId: decision?.id ?? null,
    experienceId: experience?.experienceId ?? null,
    learningId: learning?.id ?? null,
    knowledgeFacts: knowledge?.facts.map((fact) => ({
      id: fact.id,
      title: fact.title,
    })),
    knowledgeFaqs: knowledge?.faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
    })),
    priorities: decision?.priorities,
    rules: decision?.decisionRules.map((rule) => ({
      id: rule.id,
      condition: rule.condition,
      outcome: rule.outcome,
    })),
    signals: decision?.decisionSignals.map((signal) => ({
      id: signal.id,
      label: signal.label,
      source: signal.source,
      type: signal.type,
    })),
    scenes: experience?.scenes.map((scene) => ({
      sceneId: scene.sceneId,
      title: scene.title,
      modules: scene.modules,
    })),
  };
}

function toBuildAIContextInput(
  objectPackage: ObjectPackage,
  experience: Experience | null,
  knowledge: KnowledgePackage | null,
  decision: DecisionKnowledgePackage | null,
): BuildAIContextInput {
  return {
    objectId: objectPackage.objectId,
    projectId: objectPackage.projectId,
    title: `${objectPackage.metadata.name} AI Context`,
    objectPackage: {
      objectId: objectPackage.objectId,
      projectId: objectPackage.projectId,
      version: objectPackage.version,
      metadata: {
        name: objectPackage.metadata.name,
        objectType: objectPackage.metadata.objectType,
        location: objectPackage.metadata.location,
        status: objectPackage.metadata.status,
        description: objectPackage.metadata.description,
        tags: objectPackage.metadata.tags,
      },
      modules: objectPackage.modules,
    },
    experience:
      experience === null
        ? null
        : {
            experienceId: experience.experienceId,
            version: experience.version,
            metadata: {
              title: experience.metadata.title,
              description: experience.metadata.description,
            },
            scenes: experience.scenes.map((scene) => ({
              sceneId: scene.sceneId,
              title: scene.title,
              modules: scene.modules,
            })),
            navigation: {
              defaultScene: experience.navigation.defaultScene,
              order: experience.navigation.order,
            },
          },
    knowledge:
      knowledge === null
        ? null
        : {
            knowledgeId: knowledge.knowledgeId,
            version: knowledge.version,
            facts: knowledge.facts.map((fact) => ({
              id: fact.id,
              title: fact.title,
              value: fact.value,
              category: fact.category,
            })),
            entities: knowledge.entities.map((entity) => ({
              id: entity.id,
              type: entity.type,
              label: entity.label,
            })),
            faqs: knowledge.faqs.map((faq) => ({
              id: faq.id,
              question: faq.question,
              answer: faq.answer,
            })),
            documents: knowledge.documents.map((doc) => ({
              id: doc.id,
              title: doc.title,
              type: doc.type,
            })),
          },
    decision:
      decision === null
        ? null
        : {
            id: decision.id,
            version: decision.version,
            decisionRules: decision.decisionRules.map((rule) => ({
              id: rule.id,
              condition: rule.condition,
              outcome: rule.outcome,
              priority: rule.priority,
              weight: rule.weight,
            })),
            decisionSignals: decision.decisionSignals.map((signal) => ({
              id: signal.id,
              source: signal.source,
              type: signal.type,
              label: signal.label,
              importance: signal.importance,
            })),
            priorities: decision.priorities,
            strategies: decision.strategies.map((strategy) => ({
              id: strategy.id,
              title: strategy.title,
              description: strategy.description,
              targetSignals: strategy.targetSignals,
            })),
          },
  };
}

function ensureDecisionKnowledge(
  decisionService: DecisionKnowledgeService,
  objectService: ObjectService,
  objectPackage: ObjectPackage,
): DecisionKnowledgePackage {
  const existing = decisionService.loadByObject(objectPackage.objectId);
  const decision =
    existing ??
    decisionService.create({
      objectId: objectPackage.objectId,
      title: `${objectPackage.metadata.name} Decision Knowledge`,
      description: objectPackage.metadata.description,
    });
  objectService.setDecisionKnowledge(objectPackage.objectId, decision);
  return decision;
}

function nextMockFileName(categoryId: AssetCategoryId, count: number): string {
  const stamp = count + 1;
  switch (categoryId) {
    case 'photographs':
    case 'hero':
      return `upload-${stamp}.jpg`;
    case 'video':
      return `https://youtu.be/mock-${stamp}`;
    case 'svg':
      return `layout-${stamp}.svg`;
    case 'csv-rooms':
      return `rooms-${stamp}.csv`;
    case 'csv-images':
      return `images-${stamp}.csv`;
    case 'floorplan':
      return `floorplan-${stamp}.png`;
    case 'pdf':
      return `document-${stamp}.pdf`;
    case 'docx':
      return `notes-${stamp}.docx`;
    case 'xlsx':
      return `table-${stamp}.xlsx`;
  }
}

function pipelineFromBuild(
  base: ProjectPipelineSnapshot,
  build: BuildResult,
  publish: PublishResult | null,
  validation: ValidationReport | null,
): ProjectPipelineSnapshot {
  return {
    ...base,
    validationStatus:
      validation === null
        ? build.errors.length === 0
          ? 'Pending'
          : 'Validation Error'
        : validation.qualityGate === 'Failed'
          ? 'Validation Error'
          : 'Ready',
    buildStatus: build.success ? 'Ready' : 'Failed',
    publishStatus:
      publish === null
        ? 'Idle'
        : publish.success
          ? 'Ready'
          : 'Blocked',
    mediaReadyPercent: Math.min(
      100,
      Math.round((build.statistics.assetCount / 8) * 100),
    ),
    layoutReadyPercent: Math.min(
      100,
      Math.round((build.statistics.layoutCount / 4) * 100),
    ),
    knowledgeReadyPercent: Math.min(
      100,
      Math.round((build.statistics.knowledgeCount / 3) * 100),
    ),
  };
}

/**
 * Thin application controller. UI calls only these handlers;
 * business rules live in services.
 */
export function useBuilderStudioSession(): BuilderStudioViewModel {
  const services = useMemo(() => {
    const registry = createProjectRegistry();
    const assets = createAssetService();
    const events = createPlatformEventBus();
    const lifecycle = createLifecycleService({ registry, events });
    const readiness = createReadinessService();
    const workspaceService = createWorkspaceService({ registry, assets });
    const buildService = createBuildService({
      getProject: (projectId) => assets.getActiveProject(projectId),
    });
    const publishService = createPublishService({
      getPackage: (packageId) => buildService.getPackage(packageId),
    });
    const previewService = createRuntimePreviewService({
      getPublishedPackage: (packageId) =>
        publishService.getPublishedPackage(packageId),
    });
    const validationService = createValidationService({
      getProject: (projectId) => assets.getActiveProject(projectId),
      getLatestBuild: (projectId) => buildService.getLatestBuild(projectId),
      getLatestPublish: (projectId) => {
        const build = buildService.getLatestBuild(projectId);
        if (build === null) {
          return null;
        }
        return publishService.getLatestPublish(build.package.packageId);
      },
      getPreviewState: () => previewService.getPreviewState(),
    });
    const objectService = createObjectService();
    const objectApi = createObjectApi(objectService);
    const composerService = createExperienceComposerService();
    const composerApi = createExperienceComposerApi(composerService);
    const knowledgeService = createKnowledgeService();
    const knowledgeApi = createKnowledgeApi(knowledgeService);
    const decisionService = createDecisionKnowledgeService();
    const decisionApi = createDecisionKnowledgeApi(decisionService);
    const aiContextService = createAIContextBuilderService();
    const aiContextApi = createAIContextApi(aiContextService);
    const knowledgeLayerService = createKnowledgeLayerService();
    const knowledgeContextResolver = createKnowledgeContextResolver();
    const knowledgeLayerApi = createKnowledgeLayerApi(
      knowledgeLayerService,
      knowledgeContextResolver,
    );
    const learningService = createLearningService();
    const learningApi = createLearningApi(learningService);
    learningService.create();
    const decisionEngine = createDecisionEngine();
    const decisionEngineApi = createDecisionEngineApi(decisionEngine);
    const decisionRuntime = createDecisionRuntime();
    const decisionRuntimeApi = createDecisionRuntimeApi(decisionRuntime);
    for (const record of registry.listProjects()) {
      const project = assets.getActiveProject(record.projectId);
      if (project !== null) {
        const objectPackage = ensureObjectPackage(objectService, project);
        ensureExperience(composerService, objectService, objectPackage);
        ensureKnowledge(knowledgeService, objectService, objectPackage, project);
        ensureDecisionKnowledge(decisionService, objectService, objectPackage);
      }
    }
    return {
      registry,
      assets,
      events,
      lifecycle,
      readiness,
      workspaceService,
      buildService,
      publishService,
      previewService,
      validationService,
      objectService,
      objectApi,
      composerService,
      composerApi,
      knowledgeService,
      knowledgeApi,
      decisionService,
      decisionApi,
      aiContextService,
      aiContextApi,
      knowledgeLayerService,
      knowledgeContextResolver,
      knowledgeLayerApi,
      learningService,
      learningApi,
      decisionEngine,
      decisionEngineApi,
      decisionRuntime,
      decisionRuntimeApi,
    };
  }, []);

  const [workspace, setWorkspace] = useState(() =>
    services.workspaceService.getWorkspace(),
  );
  const [activeProjectModel, setActiveProjectModel] = useState(() =>
    services.workspaceService.getActiveProjectModel(),
  );
  const [pipeline, setPipeline] = useState(() =>
    services.workspaceService.getPipelineSnapshot(),
  );
  const [activeSection, setActiveSection] =
    useState<WorkspaceSectionId>('overview');
  const [objectPackage, setObjectPackage] = useState<ObjectPackage | null>(
    () => {
      const model = services.workspaceService.getActiveProjectModel();
      return model === null
        ? null
        : ensureObjectPackage(services.objectService, model);
    },
  );
  const [objectEvents, setObjectEvents] = useState<readonly ObjectEvent[]>(
    () => {
      const model = services.workspaceService.getActiveProjectModel();
      if (model === null) {
        return [];
      }
      const pkg = services.objectService.loadObjectByProject(model.projectId);
      return pkg === null
        ? []
        : services.objectService.getHistory(pkg.objectId);
    },
  );
  const [experience, setExperience] = useState<Experience | null>(() => {
    const model = services.workspaceService.getActiveProjectModel();
    if (model === null) {
      return null;
    }
    const pkg = ensureObjectPackage(services.objectService, model);
    return ensureExperience(
      services.composerService,
      services.objectService,
      pkg,
    );
  });
  const [experienceStructure, setExperienceStructure] =
    useState<ExperienceStructureReport | null>(() => {
      const model = services.workspaceService.getActiveProjectModel();
      if (model === null) {
        return null;
      }
      const pkg = ensureObjectPackage(services.objectService, model);
      const exp = ensureExperience(
        services.composerService,
        services.objectService,
        pkg,
      );
      return services.composerService.validateStructure(exp.experienceId);
    });
  const [composerEvents, setComposerEvents] = useState<
    readonly ComposerEvent[]
  >(() => {
    if (experience === null) {
      return [];
    }
    return services.composerService.getHistory(experience.experienceId);
  });
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    () => experience?.navigation.defaultScene ?? null,
  );
  const [knowledgePackage, setKnowledgePackage] =
    useState<KnowledgePackage | null>(() => {
      const model = services.workspaceService.getActiveProjectModel();
      if (model === null) {
        return null;
      }
      const pkg = ensureObjectPackage(services.objectService, model);
      return ensureKnowledge(
        services.knowledgeService,
        services.objectService,
        pkg,
        model,
      );
    });
  const [knowledgeEvents, setKnowledgeEvents] = useState<
    readonly KnowledgeEvent[]
  >(() => {
    if (knowledgePackage === null) {
      return [];
    }
    return services.knowledgeService.getHistory(knowledgePackage.knowledgeId);
  });
  const [decisionKnowledge, setDecisionKnowledge] =
    useState<DecisionKnowledgePackage | null>(() => {
      const model = services.workspaceService.getActiveProjectModel();
      if (model === null) {
        return null;
      }
      const pkg = ensureObjectPackage(services.objectService, model);
      return ensureDecisionKnowledge(
        services.decisionService,
        services.objectService,
        pkg,
      );
    });
  const [decisionEvents, setDecisionEvents] = useState<
    readonly DecisionEvent[]
  >(() => {
    if (decisionKnowledge === null) {
      return [];
    }
    return services.decisionService.getHistory(decisionKnowledge.id);
  });
  const [aiContext, setAIContext] = useState<AIContextPackage | null>(null);
  const [contextEvents, setContextEvents] = useState<readonly ContextEvent[]>(
    [],
  );
  const [knowledgeLayerBundle, setKnowledgeLayerBundle] =
    useState<KnowledgeLayerBundle | null>(null);
  const [knowledgeLayerEvents, setKnowledgeLayerEvents] = useState<
    readonly KnowledgeLayerEvent[]
  >([]);
  const [learningPackage, setLearningPackage] =
    useState<LearningPackage | null>(() =>
      services.learningService.load() ?? services.learningService.create(),
    );
  const [learningEvents, setLearningEvents] = useState<
    readonly LearningEvent[]
  >(() => {
    if (learningPackage === null) {
      return [];
    }
    return services.learningService.getHistory(learningPackage.id);
  });
  const [decisionModel, setDecisionModel] = useState<DecisionModel | null>(
    null,
  );
  const [decisionEngineEvents, setDecisionEngineEvents] = useState<
    readonly DecisionEngineEvent[]
  >([]);
  const [runtimeModel, setRuntimeModel] = useState<RuntimeModel | null>(null);
  const [decisionRuntimeEvents, setDecisionRuntimeEvents] = useState<
    readonly DecisionRuntimeEvent[]
  >([]);
  const [latestBuild, setLatestBuild] = useState<BuildResult | null>(null);
  const [buildHistory, setBuildHistory] = useState<readonly BuildResult[]>(
    [],
  );
  const [latestPublish, setLatestPublish] = useState<PublishResult | null>(
    null,
  );
  const [publishHistory, setPublishHistory] = useState<
    readonly PublishResult[]
  >([]);
  const [preview, setPreview] = useState(() =>
    services.previewService.getPreviewState(),
  );
  const [previewHistory, setPreviewHistory] = useState<
    readonly PreviewEvent[]
  >([]);
  const [projectManifest, setProjectManifest] =
    useState<BuilderProjectManifest | null>(() => {
      const activeId = services.workspaceService.getWorkspace().activeProjectId;
      return activeId !== null
        ? services.lifecycle.getManifest(activeId)
        : null;
    });
  const [versions, setVersions] = useState<VersionInfo | null>(() => {
    const activeId = services.workspaceService.getWorkspace().activeProjectId;
    return activeId !== null
      ? services.lifecycle.getVersionInfo(activeId)
      : null;
  });
  const [readiness, setReadiness] = useState<ReadinessReport | null>(() => {
    const model = services.workspaceService.getActiveProjectModel();
    if (model === null) {
      return null;
    }
    return services.readiness.evaluate({
      project: model,
      latestBuild: null,
      latestPublish: null,
    });
  });
  const [timeline, setTimeline] = useState<readonly TimelineEntry[]>(() => {
    const activeId = services.workspaceService.getWorkspace().activeProjectId;
    return activeId !== null
      ? toTimelineEntries(services.events.getHistory(activeId))
      : [];
  });
  const [validationReport, setValidationReport] =
    useState<ValidationReport | null>(null);
  const [validationHistory, setValidationHistory] = useState<
    readonly ValidationReport[]
  >([]);
  const [validationEvents, setValidationEvents] = useState<
    readonly ValidationEvent[]
  >([]);

  const syncPreview = (): void => {
    setPreview(services.previewService.getPreviewState());
    setPreviewHistory(services.previewService.getPreviewHistory());
  };

  const syncValidation = (projectId: string | null): void => {
    if (projectId === null) {
      setValidationReport(null);
      setValidationHistory([]);
      setValidationEvents([]);
      return;
    }
    setValidationReport(
      services.validationService.getLatestReport(projectId),
    );
    setValidationHistory(services.validationService.getHistory(projectId));
    setValidationEvents(services.validationService.getEvents(projectId));
  };

  const syncObject = (projectId: string | null): void => {
    if (projectId === null) {
      setObjectPackage(null);
      setObjectEvents([]);
      setExperience(null);
      setExperienceStructure(null);
      setComposerEvents([]);
      setSelectedSceneId(null);
      setKnowledgePackage(null);
      setKnowledgeEvents([]);
      setDecisionKnowledge(null);
      setDecisionEvents([]);
      setAIContext(null);
      setContextEvents([]);
      setKnowledgeLayerBundle(null);
      setKnowledgeLayerEvents([]);
      setDecisionModel(null);
      setDecisionEngineEvents([]);
      setRuntimeModel(null);
      setDecisionRuntimeEvents([]);
      return;
    }
    const model = services.assets.getActiveProject(projectId);
    if (model === null) {
      setObjectPackage(null);
      setObjectEvents([]);
      setExperience(null);
      setExperienceStructure(null);
      setComposerEvents([]);
      setSelectedSceneId(null);
      setKnowledgePackage(null);
      setKnowledgeEvents([]);
      setDecisionKnowledge(null);
      setDecisionEvents([]);
      setAIContext(null);
      setContextEvents([]);
      setKnowledgeLayerBundle(null);
      setKnowledgeLayerEvents([]);
      setDecisionModel(null);
      setDecisionEngineEvents([]);
      setRuntimeModel(null);
      setDecisionRuntimeEvents([]);
      return;
    }
    const pkg = ensureObjectPackage(services.objectService, model);
    const exp = ensureExperience(
      services.composerService,
      services.objectService,
      pkg,
    );
    const refreshed = services.objectService.loadObject(pkg.objectId);
    setObjectPackage(refreshed);
    setObjectEvents(services.objectService.getHistory(pkg.objectId));
    setExperience(exp);
    setExperienceStructure(
      services.composerService.validateStructure(exp.experienceId),
    );
    setComposerEvents(
      services.composerService.getHistory(exp.experienceId),
    );
    setSelectedSceneId((current) => {
      if (
        current !== null &&
        exp.scenes.some((scene) => scene.sceneId === current)
      ) {
        return current;
      }
      return exp.navigation.defaultScene;
    });
    const kp = ensureKnowledge(
      services.knowledgeService,
      services.objectService,
      refreshed ?? pkg,
      model,
    );
    setKnowledgePackage(kp);
    setKnowledgeEvents(services.knowledgeService.getHistory(kp.knowledgeId));
    const dk = ensureDecisionKnowledge(
      services.decisionService,
      services.objectService,
      services.objectService.loadObject(pkg.objectId) ?? pkg,
    );
    setDecisionKnowledge(dk);
    setDecisionEvents(services.decisionService.getHistory(dk.id));
    services.aiContextService.clear();
    setAIContext(null);
    setContextEvents([]);
    const companyId = model.record.customer
      ? `partner-${model.record.customer.toLowerCase().replace(/\s+/g, '-')}`
      : 'partner-unknown';
    const existingBundle = services.knowledgeLayerService.getBundle(
      pkg.objectId,
      companyId,
    );
    if (existingBundle === null) {
      const ensured = services.knowledgeLayerService.ensureLayers({
        companyId,
        companyName: model.record.customer || 'Company',
        objectId: pkg.objectId,
        objectName: pkg.metadata.name,
      });
      setKnowledgeLayerBundle(ensured);
    } else {
      setKnowledgeLayerBundle(existingBundle);
    }
    setKnowledgeLayerEvents(services.knowledgeLayerService.getHistory());
    setDecisionModel(null);
    setDecisionEngineEvents([]);
    setRuntimeModel(null);
    setDecisionRuntimeEvents([]);
    setObjectPackage(services.objectService.loadObject(pkg.objectId));
  };

  const syncComposer = (experienceId: string): void => {
    const exp = services.composerService.loadExperience(experienceId);
    if (exp === null) {
      return;
    }
    services.objectService.setExperience(exp.objectId, exp);
    setExperience(exp);
    setObjectPackage(services.objectService.loadObject(exp.objectId));
    setExperienceStructure(
      services.composerService.validateStructure(exp.experienceId),
    );
    setComposerEvents(
      services.composerService.getHistory(exp.experienceId),
    );
    setSelectedSceneId((current) => {
      if (
        current !== null &&
        exp.scenes.some((scene) => scene.sceneId === current)
      ) {
        return current;
      }
      return exp.navigation.defaultScene;
    });
  };

  const syncLifecycleView = (
    projectId: string,
    build: BuildResult | null,
    publish: PublishResult | null,
  ): void => {
    const model = services.workspaceService.getActiveProjectModel();
    setProjectManifest(services.lifecycle.getManifest(projectId));
    setVersions(services.lifecycle.getVersionInfo(projectId));
    setTimeline(toTimelineEntries(services.events.getHistory(projectId)));
    if (model !== null) {
      setReadiness(
        services.readiness.evaluate({
          project: model,
          latestBuild: build,
          latestPublish: publish,
        }),
      );
    } else {
      setReadiness(null);
    }
  };

  const syncFromServices = (projectId?: string | null): void => {
    setWorkspace(services.workspaceService.getWorkspace());
    setActiveProjectModel(services.workspaceService.getActiveProjectModel());
    const activeId =
      projectId ?? services.workspaceService.getWorkspace().activeProjectId;
    if (activeId !== null && activeId !== undefined) {
      const build = services.buildService.getLatestBuild(activeId);
      setLatestBuild(build);
      setBuildHistory(services.buildService.getBuildHistory(activeId));
      const packageId = build?.package.packageId;
      let publish: PublishResult | null = null;
      if (packageId !== undefined) {
        publish = services.publishService.getLatestPublish(packageId);
        setLatestPublish(publish);
        setPublishHistory(
          services.publishService.getPublishHistory(packageId),
        );
      } else {
        setLatestPublish(null);
        setPublishHistory([]);
      }
      syncLifecycleView(activeId, build, publish);
      syncValidation(activeId);
      syncObject(activeId);
    } else {
      setLatestBuild(null);
      setBuildHistory([]);
      setLatestPublish(null);
      setPublishHistory([]);
      setProjectManifest(null);
      setVersions(null);
      setReadiness(null);
      setTimeline([]);
      syncValidation(null);
      syncObject(null);
    }
    syncPreview();
  };

  return {
    workspace,
    activeProjectModel,
    objectPackage,
    experience,
    experienceStructure,
    composerEvents,
    selectedSceneId,
    knowledgePackage,
    knowledgeEvents,
    decisionKnowledge,
    decisionEvents,
    aiContext,
    contextEvents,
    knowledgeLayerRegistry: listKnowledgeLayers(),
    knowledgeLayerBundle,
    knowledgeLayerEvents,
    knowledgeReferences: knowledgePackage?.references ?? [],
    learningPackage,
    learningEvents,
    learningOrigins: listLearningOrigins(),
    decisionModel,
    decisionEngineEvents,
    runtimeModel,
    decisionRuntimeEvents,
    resolvedLayers:
      knowledgeLayerBundle === null
        ? null
        : {
            platform: services.knowledgeContextResolver.resolvePlatform(
              knowledgePackage?.references ?? [],
              knowledgeLayerBundle.platform,
            ),
            company: services.knowledgeContextResolver.resolveCompany(
              knowledgePackage?.references ?? [],
              knowledgeLayerBundle.company,
            ),
            object: services.knowledgeContextResolver.resolveObject(
              knowledgePackage?.references ?? [],
              knowledgeLayerBundle.object,
            ),
            session: services.knowledgeContextResolver.resolveSession(
              knowledgePackage?.references ?? [],
              knowledgeLayerBundle.session,
            ),
          },
    priorityRegistry: listPriorities(),
    moduleRegistry: listObjectModules(),
    objectEvents,
    pipeline,
    activeSection,
    latestBuild,
    buildHistory,
    latestPublish,
    publishHistory,
    preview,
    previewHistory,
    projectManifest,
    versions,
    readiness,
    timeline,
    validationReport,
    validationHistory,
    validationEvents,
    openProject(projectId: string): void {
      services.workspaceService.setActiveProject(projectId);
      const base = services.workspaceService.getPipelineSnapshot();
      const latest = services.buildService.getLatestBuild(projectId);
      const packageId = latest?.package.packageId;
      const publish =
        packageId !== undefined
          ? services.publishService.getLatestPublish(packageId)
          : null;
      const validation =
        services.validationService.getLatestReport(projectId);
      setPipeline(
        base !== null && latest !== null
          ? pipelineFromBuild(base, latest, publish, validation)
          : base,
      );
      syncFromServices(projectId);
    },
    createProject(): void {
      const count = services.registry.listProjects().length + 1;
      const created = services.lifecycle.createProject({
        name: `Nový projekt ${count}`,
      });
      services.workspaceService.setActiveProject(created.projectId);
      const model = services.workspaceService.getActiveProjectModel();
      if (model !== null) {
        const pkg = ensureObjectPackage(services.objectService, model);
        ensureExperience(
          services.composerService,
          services.objectService,
          pkg,
        );
        ensureKnowledge(
          services.knowledgeService,
          services.objectService,
          pkg,
          model,
        );
        ensureDecisionKnowledge(
          services.decisionService,
          services.objectService,
          pkg,
        );
      }
      setPipeline(services.workspaceService.getPipelineSnapshot());
      setActiveSection('overview');
      syncFromServices(created.projectId);
    },
    selectSection(sectionId: WorkspaceSectionId): void {
      setActiveSection(sectionId);
    },
    addAsset(categoryId: AssetCategoryId): void {
      const model = services.workspaceService.getActiveProjectModel();
      const collection = [
        ...(model?.assets.media ?? []),
        ...(model?.assets.layout ?? []),
        ...(model?.assets.knowledge ?? []),
      ].find((item) => item.categoryId === categoryId);
      const count = collection?.files.length ?? 0;
      services.workspaceService.addAsset(categoryId, {
        name: nextMockFileName(categoryId, count),
        sizeBytes: categoryId === 'video' ? 0 : 256_000 + count * 1_024,
      });
      syncFromServices();
    },
    removeAsset(categoryId: AssetCategoryId, assetId: string): void {
      services.workspaceService.removeAsset(categoryId, assetId);
      syncFromServices();
    },
    updateAssetMetadata(
      categoryId: AssetCategoryId,
      assetId: string,
      patch: UpdateAssetMetadataInput,
    ): void {
      services.workspaceService.updateAssetMetadata(
        categoryId,
        assetId,
        patch,
      );
      syncFromServices();
    },
    updateObjectMetadata(patch: UpdateObjectMetadataInput): void {
      if (objectPackage === null) {
        return;
      }
      services.objectService.updateObject(objectPackage.objectId, patch);
      syncObject(objectPackage.projectId);
    },
    toggleObjectModule(moduleId: ObjectModuleId): void {
      if (objectPackage === null) {
        return;
      }
      if (objectPackage.modules.includes(moduleId)) {
        services.objectService.unassignModule(
          objectPackage.objectId,
          moduleId,
        );
      } else {
        services.objectService.assignModule(objectPackage.objectId, moduleId);
      }
      syncObject(objectPackage.projectId);
    },
    saveObject(): void {
      if (objectPackage === null) {
        return;
      }
      services.objectApi.saveObject(objectPackage.objectId);
      syncObject(objectPackage.projectId);
    },
    duplicateObject(): void {
      if (objectPackage === null) {
        return;
      }
      services.objectApi.duplicateObject(objectPackage.objectId);
      syncObject(objectPackage.projectId);
    },
    selectScene(sceneId: string): void {
      setSelectedSceneId(sceneId);
    },
    addScene(): void {
      if (experience === null) {
        return;
      }
      const next = services.composerService.addScene(experience.experienceId);
      const added = next.scenes[next.scenes.length - 1];
      if (added !== undefined) {
        setSelectedSceneId(added.sceneId);
      }
      syncComposer(next.experienceId);
    },
    renameScene(sceneId: string, title: string): void {
      if (experience === null) {
        return;
      }
      const next = services.composerService.updateScene(
        experience.experienceId,
        sceneId,
        { title },
      );
      syncComposer(next.experienceId);
    },
    moveScene(sceneId: string, direction: 'up' | 'down'): void {
      if (experience === null) {
        return;
      }
      const next = services.composerService.moveScene(
        experience.experienceId,
        sceneId,
        direction,
      );
      syncComposer(next.experienceId);
    },
    removeScene(sceneId: string): void {
      if (experience === null) {
        return;
      }
      try {
        const next = services.composerService.removeScene(
          experience.experienceId,
          sceneId,
        );
        syncComposer(next.experienceId);
      } catch {
        // Keep at least one scene — service enforces.
      }
    },
    toggleSceneModule(sceneId: string, moduleId: ObjectModuleId): void {
      if (experience === null) {
        return;
      }
      const scene = experience.scenes.find((item) => item.sceneId === sceneId);
      if (scene === undefined) {
        return;
      }
      const next = scene.modules.includes(moduleId)
        ? services.composerService.unassignModule(
            experience.experienceId,
            sceneId,
            moduleId,
          )
        : services.composerService.assignModule(
            experience.experienceId,
            sceneId,
            moduleId,
          );
      syncComposer(next.experienceId);
    },

    saveKnowledge(): void {
      if (knowledgePackage === null) {
        return;
      }
      const saved = services.knowledgeApi.saveKnowledge(
        knowledgePackage.knowledgeId,
      );
      services.objectService.setKnowledgePackage(saved.objectId, saved);
      setKnowledgePackage(saved);
      setKnowledgeEvents(
        services.knowledgeService.getHistory(saved.knowledgeId),
      );
      setObjectPackage(services.objectService.loadObject(saved.objectId));
    },
    addFact(): void {
      if (knowledgePackage === null) {
        return;
      }
      const next = services.knowledgeService.addFact(
        knowledgePackage.knowledgeId,
        {
          title: `Fact ${knowledgePackage.facts.length + 1}`,
          value: 'Doplňte hodnotu',
          category: 'other',
        },
      );
      services.objectService.setKnowledgePackage(next.objectId, next);
      setKnowledgePackage(next);
      setKnowledgeEvents(services.knowledgeService.getHistory(next.knowledgeId));
      setObjectPackage(services.objectService.loadObject(next.objectId));
    },
    addEntity(): void {
      if (knowledgePackage === null) {
        return;
      }
      const next = services.knowledgeService.addEntity(
        knowledgePackage.knowledgeId,
        {
          label: `Entity ${knowledgePackage.entities.length + 1}`,
          type: 'feature',
        },
      );
      services.objectService.setKnowledgePackage(next.objectId, next);
      setKnowledgePackage(next);
      setKnowledgeEvents(services.knowledgeService.getHistory(next.knowledgeId));
      setObjectPackage(services.objectService.loadObject(next.objectId));
    },
    addRelationship(): void {
      if (knowledgePackage === null) {
        return;
      }
      const from = knowledgePackage.entities[0]?.id ?? 'entity-unknown';
      const to = knowledgePackage.facts[0]?.id ?? 'fact-unknown';
      const next = services.knowledgeService.addRelationship(
        knowledgePackage.knowledgeId,
        {
          from,
          to,
          relation: 'related-to',
          confidence: 0.8,
        },
      );
      services.objectService.setKnowledgePackage(next.objectId, next);
      setKnowledgePackage(next);
      setKnowledgeEvents(services.knowledgeService.getHistory(next.knowledgeId));
      setObjectPackage(services.objectService.loadObject(next.objectId));
    },
    addFaq(): void {
      if (knowledgePackage === null) {
        return;
      }
      const next = services.knowledgeService.addFaq(
        knowledgePackage.knowledgeId,
        {
          question: `Otázka ${knowledgePackage.faqs.length + 1}?`,
          answer: 'Doplňte odpověď.',
        },
      );
      services.objectService.setKnowledgePackage(next.objectId, next);
      setKnowledgePackage(next);
      setKnowledgeEvents(services.knowledgeService.getHistory(next.knowledgeId));
      setObjectPackage(services.objectService.loadObject(next.objectId));
    },

    saveDecisionKnowledge(): void {
      if (decisionKnowledge === null) {
        return;
      }
      const saved = services.decisionApi.saveDecisionKnowledge(
        decisionKnowledge.id,
      );
      services.objectService.setDecisionKnowledge(saved.objectId, saved);
      setDecisionKnowledge(saved);
      setDecisionEvents(services.decisionService.getHistory(saved.id));
      setObjectPackage(services.objectService.loadObject(saved.objectId));
    },
    addDecisionRule(): void {
      if (decisionKnowledge === null) {
        return;
      }
      const next = services.decisionService.addRule(decisionKnowledge.id, {
        condition: `condition-${decisionKnowledge.decisionRules.length + 1}`,
        outcome: `outcome-${decisionKnowledge.decisionRules.length + 1}`,
        priority: decisionKnowledge.decisionRules.length + 1,
        weight: 0.5,
      });
      services.objectService.setDecisionKnowledge(next.objectId, next);
      setDecisionKnowledge(next);
      setDecisionEvents(services.decisionService.getHistory(next.id));
      setObjectPackage(services.objectService.loadObject(next.objectId));
    },
    addDecisionSignal(): void {
      if (decisionKnowledge === null) {
        return;
      }
      const next = services.decisionService.addSignal(decisionKnowledge.id, {
        source: 'form',
        label: `Signal ${decisionKnowledge.decisionSignals.length + 1}`,
        type: 'intent',
      });
      services.objectService.setDecisionKnowledge(next.objectId, next);
      setDecisionKnowledge(next);
      setDecisionEvents(services.decisionService.getHistory(next.id));
      setObjectPackage(services.objectService.loadObject(next.objectId));
    },
    addDecisionStrategy(): void {
      if (decisionKnowledge === null) {
        return;
      }
      const next = services.decisionService.addStrategy(decisionKnowledge.id, {
        title: `Strategy ${decisionKnowledge.strategies.length + 1}`,
        description: 'Autorská strategie — bez Runtime Story.',
        targetSignals: decisionKnowledge.decisionSignals
          .slice(0, 2)
          .map((item) => item.id),
      });
      services.objectService.setDecisionKnowledge(next.objectId, next);
      setDecisionKnowledge(next);
      setDecisionEvents(services.decisionService.getHistory(next.id));
      setObjectPackage(services.objectService.loadObject(next.objectId));
    },
    toggleDecisionPriority(priorityId: PriorityId): void {
      if (decisionKnowledge === null) {
        return;
      }
      const next = decisionKnowledge.priorities.includes(priorityId)
        ? services.decisionService.unregisterPriority(
            decisionKnowledge.id,
            priorityId,
          )
        : services.decisionService.registerPriority(
            decisionKnowledge.id,
            priorityId,
          );
      services.objectService.setDecisionKnowledge(next.objectId, next);
      setDecisionKnowledge(next);
      setDecisionEvents(services.decisionService.getHistory(next.id));
      setObjectPackage(services.objectService.loadObject(next.objectId));
    },

    buildAIContext(): void {
      if (objectPackage === null) {
        return;
      }
      const built = services.aiContextApi.buildContext(
        toBuildAIContextInput(
          objectPackage,
          experience,
          knowledgePackage,
          decisionKnowledge,
        ),
      );
      setAIContext(built);
      setContextEvents(services.aiContextService.getHistory(built.id));
    },
    refreshAIContext(): void {
      if (objectPackage === null) {
        return;
      }
      const refreshed = services.aiContextApi.refreshContext(
        toBuildAIContextInput(
          objectPackage,
          experience,
          knowledgePackage,
          decisionKnowledge,
        ),
      );
      setAIContext(refreshed);
      setContextEvents(services.aiContextService.getHistory(refreshed.id));
    },
    clearAIContext(): void {
      const cleared = services.aiContextService.clear(
        aiContext?.id,
      );
      setAIContext(cleared);
      setContextEvents(
        cleared === null
          ? []
          : services.aiContextService.getHistory(cleared.id),
      );
    },

    ensureKnowledgeLayers(): void {
      if (objectPackage === null || activeProjectModel === null) {
        return;
      }
      const companyId = `partner-${activeProjectModel.record.customer
        .toLowerCase()
        .replace(/\s+/g, '-')}`;
      const ensured = services.knowledgeLayerService.ensureLayers({
        companyId,
        companyName: activeProjectModel.record.customer,
        objectId: objectPackage.objectId,
        objectName: objectPackage.metadata.name,
      });
      setKnowledgeLayerBundle(ensured);
      setKnowledgeLayerEvents(services.knowledgeLayerService.getHistory());
    },
    addDemoLayerReferences(): void {
      if (knowledgePackage === null || knowledgeLayerBundle === null) {
        return;
      }
      let current = knowledgePackage;
      if (!current.references.some((item) => item.layer === 'platform')) {
        current = services.knowledgeLayerService.attachReference(current, {
          layer: 'platform',
          targetId: knowledgeLayerBundle.platform.id,
          type: 'catalog',
        }).knowledge;
      }
      if (!current.references.some((item) => item.layer === 'company')) {
        current = services.knowledgeLayerService.attachReference(current, {
          layer: 'company',
          targetId: knowledgeLayerBundle.company.id,
          type: 'policy',
        }).knowledge;
      }
      if (!current.references.some((item) => item.layer === 'object')) {
        current = services.knowledgeLayerService.attachReference(current, {
          layer: 'object',
          targetId: knowledgeLayerBundle.object.id,
          type: 'fact',
        }).knowledge;
      }
      if (!current.references.some((item) => item.layer === 'session')) {
        current = services.knowledgeLayerService.attachReference(current, {
          layer: 'session',
          targetId: knowledgeLayerBundle.session.id,
          type: 'other',
        }).knowledge;
      }
      const saved = services.knowledgeService.upsertKnowledge(current);
      services.objectService.setKnowledgePackage(saved.objectId, saved);
      setKnowledgePackage(saved);
      setKnowledgeEvents(services.knowledgeService.getHistory(saved.knowledgeId));
      setKnowledgeLayerEvents(services.knowledgeLayerService.getHistory());
      setObjectPackage(services.objectService.loadObject(saved.objectId));
    },
    removeLayerReference(referenceId: string): void {
      if (knowledgePackage === null) {
        return;
      }
      const next = services.knowledgeLayerService.detachReference(
        knowledgePackage,
        referenceId,
      );
      const saved = services.knowledgeService.upsertKnowledge(next);
      services.objectService.setKnowledgePackage(saved.objectId, saved);
      setKnowledgePackage(saved);
      setKnowledgeEvents(services.knowledgeService.getHistory(saved.knowledgeId));
      setKnowledgeLayerEvents(services.knowledgeLayerService.getHistory());
      setObjectPackage(services.objectService.loadObject(saved.objectId));
    },

    saveLearning(): void {
      if (learningPackage === null) {
        return;
      }
      const saved = services.learningApi.saveLearning(learningPackage.id);
      setLearningPackage(saved);
      setLearningEvents(services.learningService.getHistory(saved.id));
    },
    addLearningObservation(): void {
      if (learningPackage === null) {
        return;
      }
      const next = services.learningService.registerObservation(
        learningPackage.id,
        {
          origin: 'platform',
          category: 'form-opened',
          payload: { anonymizedBucket: 'D' },
          confidence: 0.55,
          notes: 'Form otevřen (anonymizováno)',
        },
      );
      setLearningPackage(next);
      setLearningEvents(services.learningService.getHistory(next.id));
    },
    addLearningPattern(): void {
      if (learningPackage === null) {
        return;
      }
      const next = services.learningService.registerPattern(learningPackage.id, {
        description: `Pattern ${learningPackage.patterns.length + 1}`,
        observations: learningPackage.observations.slice(0, 2).map((item) => item.id),
        confidence: 0.5,
      });
      setLearningPackage(next);
      setLearningEvents(services.learningService.getHistory(next.id));
    },
    addLearningHeuristic(): void {
      if (learningPackage === null) {
        return;
      }
      const next = services.learningService.registerHeuristic(
        learningPackage.id,
        {
          title: `Heuristic ${learningPackage.heuristics.length + 1}`,
          description: 'Autorská heuristika — bez Decision Engine.',
          scope: 'platform',
          weight: 0.5,
        },
      );
      setLearningPackage(next);
      setLearningEvents(services.learningService.getHistory(next.id));
    },

    buildDecisionModel(): void {
      if (objectPackage === null) {
        return;
      }
      const built = services.decisionEngineApi.buildDecisionModel(
        toBuildDecisionModelInput(
          objectPackage,
          experience,
          knowledgePackage,
          decisionKnowledge,
          learningPackage,
        ),
      );
      setDecisionModel(built);
      setDecisionEngineEvents(
        services.decisionEngine.getHistory(built.id),
      );
    },
    validateDecisionModel(): void {
      if (decisionModel === null) {
        return;
      }
      const validated = services.decisionEngine.validateDecisionModel(
        decisionModel.id,
      );
      setDecisionModel(validated);
      setDecisionEngineEvents(
        services.decisionEngine.getHistory(validated.id),
      );
    },
    disposeDecisionModel(): void {
      if (decisionModel === null) {
        return;
      }
      const disposed = services.decisionEngine.dispose(decisionModel.id);
      setDecisionModel(disposed);
      setDecisionEngineEvents(
        services.decisionEngine.getHistory(disposed.id),
      );
    },

    createDecisionRuntime(): void {
      if (decisionModel === null) {
        return;
      }
      const created = services.decisionRuntimeApi.createRuntime(
        toCreateRuntimeInput(decisionModel),
      );
      setRuntimeModel(created);
      setDecisionRuntimeEvents(
        services.decisionRuntime.getHistory(created.id),
      );
    },
    validateDecisionRuntime(): void {
      if (runtimeModel === null) {
        return;
      }
      const validated = services.decisionRuntime.validateRuntime(
        runtimeModel.id,
      );
      setRuntimeModel(validated);
      setDecisionRuntimeEvents(
        services.decisionRuntime.getHistory(validated.id),
      );
    },
    disposeDecisionRuntime(): void {
      if (runtimeModel === null) {
        return;
      }
      const disposed = services.decisionRuntime.dispose(runtimeModel.id);
      setRuntimeModel(disposed);
      setDecisionRuntimeEvents(
        services.decisionRuntime.getHistory(disposed.id),
      );
    },
    buildProject(): void {
      const projectId =
        services.workspaceService.getWorkspace().activeProjectId;
      if (projectId === null) {
        return;
      }
      const result = services.buildService.buildProject(projectId);
      if (result.success) {
        services.lifecycle.syncBuildVersion(
          projectId,
          result.manifest.version,
        );
        if (result.package.publishable) {
          services.lifecycle.changeStatus(projectId, 'ReadyForPublish');
        }
      }
      const validation = services.validationService.validateProject(projectId);
      const base = services.workspaceService.getPipelineSnapshot();
      if (base !== null) {
        setPipeline(pipelineFromBuild(base, result, null, validation));
      }
      syncFromServices(projectId);
    },
    validateProject(): void {
      const projectId =
        services.workspaceService.getWorkspace().activeProjectId;
      if (projectId === null) {
        return;
      }
      const report = services.validationService.validateProject(projectId);
      const base = services.workspaceService.getPipelineSnapshot();
      const latest = services.buildService.getLatestBuild(projectId);
      if (base !== null && latest !== null) {
        const packageId = latest.package.packageId;
        const publish = services.publishService.getLatestPublish(packageId);
        setPipeline(pipelineFromBuild(base, latest, publish, report));
      }
      syncFromServices(projectId);
    },
    publishPackage(): void {
      const projectId =
        services.workspaceService.getWorkspace().activeProjectId;
      if (projectId === null) {
        return;
      }
      const latest = services.buildService.getLatestBuild(projectId);
      if (latest === null) {
        return;
      }
      const report = services.validationService.validateProject(projectId);
      if (!isPublishAllowedByQualityGate(report.qualityGate)) {
        const base = services.workspaceService.getPipelineSnapshot();
        if (base !== null) {
          setPipeline(pipelineFromBuild(base, latest, null, report));
        }
        syncFromServices(projectId);
        return;
      }
      const result = services.publishService.publishPackage(
        latest.package.packageId,
      );
      if (result.success && result.publishManifest !== null) {
        services.lifecycle.syncPublishVersion(
          projectId,
          result.publishManifest.version,
        );
      }
      const base = services.workspaceService.getPipelineSnapshot();
      if (base !== null) {
        setPipeline(pipelineFromBuild(base, latest, result, report));
      }
      syncFromServices(projectId);
    },
    openPreview(): void {
      const projectId =
        services.workspaceService.getWorkspace().activeProjectId;
      if (projectId === null) {
        return;
      }
      const latest = services.buildService.getLatestBuild(projectId);
      if (latest === null) {
        return;
      }
      const session = services.previewService.openPreview(
        latest.package.packageId,
      );
      if (session.previewState === 'Ready') {
        services.lifecycle.syncRuntimeVersion(
          projectId,
          session.runtimeVersion,
        );
        services.events.publish(
          'PreviewOpened',
          projectId,
          `Preview session ${session.sessionId}`,
        );
      }
      syncFromServices(projectId);
    },
    refreshPreview(): void {
      services.previewService.refreshPreview();
      syncPreview();
    },
    closePreview(): void {
      services.previewService.closePreview();
      syncPreview();
    },
  };
}
