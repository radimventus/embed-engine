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
  ComposeStoryInput,
  AnalyticsEngineEvent,
  AnalyticsSnapshot,
  BehaviorEvaluation,
  IngestAnalyticsInput,
  LearningImportReport,
  LearningPackageManagerEvent,
  LearningPipelineEvent,
  LearningRecord,
  LearningRecordsPackage,
  LearningValidationResult,
  PatternCollection,
  PatternEngineEvent,
  PatternCatalog,
  PatternIntelligenceEvent,
  HeuristicCatalog,
  HeuristicEngineEvent,
  KnowledgeSynthesisEvent,
  SynthesizedKnowledgeBase,
  AIDecisionGatewayEvent,
  GatewayAIContextPackage,
  PersonalizationEngineEvent,
  PersonalizationPackage,
  PersonalizedContextPackage,
  PersonalizationRuntimeEvent,
  DecisionExecutionPackage,
  DecisionOrchestratorEvent,
  RuntimeExecutionPackage,
  ExperienceRuntimeEvent,
  ExperienceModulePackage,
  ModuleCoordinatorEvent,
  ExperienceStatePackage,
  ExperienceStateEvent,
  RuntimeEventSource,
  RuntimeObservabilityEvent,
  RuntimeObservabilityPackage,
  RuntimeHealthEvent,
  RuntimeHealthPackage,
  AuditEventSource,
  RuntimeAuditEvent,
  RuntimeAuditPackage,
  RuntimeGovernanceEvent,
  RuntimeGovernancePackage,
  RuntimePolicyEvent,
  RuntimePolicyPackage,
  RuntimeEnforcementEvent,
  RuntimeEnforcementPackage,
  RuntimeResilienceEvent,
  RuntimeResiliencePackage,
  RuntimeRecoveryEvent,
  RuntimeRecoveryPackage,
  RuntimeRecoveryExecutionEvent,
  RuntimeRecoveryExecutionPackage,
  RuntimeRecoveryCoordinatorEvent,
  RuntimeRecoverySummaryPackage,
  RuntimeRecoveryReportingEvent,
  RuntimeRecoveryReportPackage,
  RuntimeOperationsEvent,
  RuntimeOperationsPackage,
  RuntimeIntegrationEvent,
  RuntimeIntegrationPackage,
  RuntimeRegistryEvent,
  RuntimeRegistryPackage,
  RuntimeManifestEvent,
  RuntimeManifestPackage,
  RuntimeApiEvent,
  RuntimeApiPackage,
  RuntimeCompatibilityEvent,
  RuntimeCompatibilityPackage,
  RuntimeContractEvent,
  RuntimeContractPackage,
  RuntimeExtensionEvent,
  RuntimeExtensionPackage,
  ObjectPublicationEvent,
  PublicationPackage,
  PublishedObjectEvent,
  PublishedObjectPackage,
  PlatformPublicationEvent,
  PlatformPublicationPackage,
  ClientPublicationEvent,
  ClientPublicationPackage,
  PublicationReadinessEvent,
  PublicationReadinessPackage,
  RuntimeBootstrapEvent,
  RuntimeBootstrapPackage,
  ArtifactVersionEvent,
  ArtifactVersionPackage,
  ArtifactDependencyEvent,
  ArtifactDependencyPackage,
  PublicationPlanEvent,
  PublicationPlanPackage,
  PublicationExecutionEvent,
  PublicationExecutionPackage,
  ArtifactExportEvent,
  ArtifactExportPackage,
  ExportSchemaEvent,
  ExportSchemaPackage,
  ExportCompatibilityEvent,
  ExportCompatibilityPackage,
  ExportCapabilityEvent,
  ExportCapabilityPackage,
  ExportPolicyEvent,
  ExportPolicyPackage,
  ExportCertificationEvent,
  ExportCertificationPackage,
  Project,
  WorkspaceEvent,
  WorkspacePackage,
  Asset,
  AssetManagerEvent,
  AssetPackage,
  MetadataEvent,
  MetadataPackage,
  MetadataStatus,
  ObjectAttribute,
  ObjectMetadataDocument,
  BehaviorEvent,
  BehaviorSignal,
  CreateSessionInput,
  RecordAnalyticsEventInput,
  DecisionStory,
  EvaluateBehaviorInput,
  EvaluationEvent,
  EvaluationResult,
  KnowledgeEvent,
  RuleEvaluationInput,
  RuntimeModel,
  RuntimeSession,
  SessionEvent,
  StoryEvent,
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
  createRuleEvaluationApi,
  createRuleEvaluationEngine,
  createDecisionStoryApi,
  createDecisionStoryComposer,
  createRuntimeSessionApi,
  createRuntimeSessionEngine,
  createBehaviorApi,
  createBehaviorEngine,
  createDecisionAnalyticsApi,
  createDecisionAnalyticsEngine,
  createLearningPipeline,
  createLearningPipelineApi,
  createLearningPackageManager,
  createLearningPackageManagerApi,
  createPatternExtractionApi,
  createPatternExtractionEngine,
  createPatternIntelligenceApi,
  createPatternIntelligenceEngine,
  createHeuristicEngineApi,
  createHeuristicEngine,
  createKnowledgeSynthesisApi,
  createKnowledgeSynthesisEngine,
  createAIDecisionGatewayApi,
  createAIDecisionGateway,
  createPersonalizationEngineApi,
  createPersonalizationEngine,
  createPersonalizationRuntimeApi,
  createPersonalizationRuntimeEngine,
  createDecisionOrchestratorApi,
  createDecisionOrchestrator,
  createExperienceRuntimeApi,
  createExperienceRuntimeOrchestrator,
  createExperienceModuleCoordinatorApi,
  createExperienceModuleCoordinator,
  BASIC_MODULE_SEQUENCE,
  createExperienceStateApi,
  createExperienceStateManager,
  createRuntimeObservabilityApi,
  createRuntimeObservabilityEngine,
  createRuntimeHealthApi,
  createRuntimeHealthEngine,
  createRuntimeAuditApi,
  createRuntimeAuditEngine,
  createRuntimeGovernanceApi,
  createRuntimeGovernanceEngine,
  createRuntimePolicyApi,
  createRuntimePolicyEngine,
  createRuntimeEnforcementApi,
  createRuntimePolicyEnforcementEngine,
  createRuntimeResilienceApi,
  createRuntimeResilienceEngine,
  createRuntimeRecoveryApi,
  createRuntimeRecoveryOrchestrator,
  createRuntimeRecoveryExecutionApi,
  createRuntimeRecoveryExecutor,
  createRuntimeRecoveryCoordinatorApi,
  createRuntimeRecoveryCoordinator,
  createRuntimeRecoveryReportingApi,
  createRuntimeRecoveryReportingEngine,
  createRuntimeOperationsApi,
  createRuntimeOperationsDashboard,
  createRuntimeIntegrationApi,
  createRuntimeIntegrationHub,
  createRuntimeRegistryApi,
  createRuntimeIntegrationRegistry,
  createRuntimeManifestApi,
  createRuntimeManifestEngine,
  createRuntimeApiGatewayApi,
  createRuntimeApiGateway,
  createRuntimeCompatibilityApi,
  createRuntimeCompatibilityManager,
  createRuntimeContractApi,
  createRuntimeContractManager,
  createRuntimeExtensionApi,
  createRuntimeExtensionFramework,
  createObjectPublicationApi,
  createObjectPublicationPipeline,
  createPublishedObjectApi,
  createPublishedObjectRegistry,
  createPlatformPublicationApi,
  createPlatformPublicationCatalog,
  createClientPublicationApi,
  createClientPublicationAdapter,
  createPublicationReadinessApi,
  createPublicationReadinessValidator,
  createArtifactDependencyApi,
  createArtifactDependencyRegistry,
  createPublicationPlanApi,
  createPublicationPlanBuilder,
  createPublicationExecutionApi,
  createPublicationExecutionCoordinator,
  createArtifactExportContract,
  createArtifactExportApi,
  createExportSchemaRegistry,
  createExportSchemaApi,
  createExportCompatibilityRegistry,
  createExportCompatibilityApi,
  createExportCapabilityRegistry,
  createExportCapabilityApi,
  createExportPolicyRegistry,
  createExportPolicyApi,
  createExportCertificationService,
  createExportCertificationApi,
  createAssetManagerService,
  createAssetManagerApi,
  createMetadataService,
  createMetadataApi,
  createArtifactVersionApi,
  createArtifactVersionManager,
  createRuntimeBootstrapApi,
  createRuntimeSessionBootstrap,
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
  readonly evaluationResult: EvaluationResult | null;
  readonly evaluationEvents: readonly EvaluationEvent[];
  readonly evaluationValidationMessage: string | null;
  readonly decisionStory: DecisionStory | null;
  readonly storyEvents: readonly StoryEvent[];
  readonly storyMessage: string | null;
  readonly runtimeSession: RuntimeSession | null;
  readonly sessionEvents: readonly SessionEvent[];
  readonly sessionMessage: string | null;
  readonly behaviorEvaluation: BehaviorEvaluation | null;
  readonly behaviorSignals: readonly BehaviorSignal[];
  readonly behaviorEvents: readonly BehaviorEvent[];
  readonly behaviorMessage: string | null;
  readonly analyticsSnapshot: AnalyticsSnapshot | null;
  readonly analyticsEvents: readonly AnalyticsEngineEvent[];
  readonly analyticsMessage: string | null;
  readonly learningRecord: LearningRecord | null;
  readonly learningValidation: LearningValidationResult | null;
  readonly learningImportReport: LearningImportReport | null;
  readonly learningExportPayload: string | null;
  readonly learningPipelineEvents: readonly LearningPipelineEvent[];
  readonly learningPipelineMessage: string | null;
  readonly learningRecordsPackage: LearningRecordsPackage | null;
  readonly learningPackageManagerEvents: readonly LearningPackageManagerEvent[];
  readonly learningPackageIndexCount: number;
  readonly learningPackageManagerMessage: string | null;
  readonly patternCollection: PatternCollection | null;
  readonly patternExtractionEvents: readonly PatternEngineEvent[];
  readonly patternIndexCount: number;
  readonly patternExtractionMessage: string | null;
  readonly patternCatalog: PatternCatalog | null;
  readonly patternIntelligenceEvents: readonly PatternIntelligenceEvent[];
  readonly patternIntelligenceIndexCount: number;
  readonly patternIntelligenceMessage: string | null;
  readonly heuristicCatalog: HeuristicCatalog | null;
  readonly heuristicEngineEvents: readonly HeuristicEngineEvent[];
  readonly heuristicIndexCount: number;
  readonly heuristicEngineMessage: string | null;
  readonly synthesizedKnowledgeBase: SynthesizedKnowledgeBase | null;
  readonly knowledgeSynthesisEvents: readonly KnowledgeSynthesisEvent[];
  readonly knowledgeSynthesisIndexCount: number;
  readonly knowledgeSynthesisMessage: string | null;
  readonly gatewayAIContextPackage: GatewayAIContextPackage | null;
  readonly aiDecisionGatewayEvents: readonly AIDecisionGatewayEvent[];
  readonly aiDecisionGatewayIndexCount: number;
  readonly aiDecisionGatewayMessage: string | null;
  readonly personalizationPackage: PersonalizationPackage | null;
  readonly personalizationEngineEvents: readonly PersonalizationEngineEvent[];
  readonly personalizationIndexCount: number;
  readonly personalizationEngineMessage: string | null;
  readonly personalizedContextPackage: PersonalizedContextPackage | null;
  readonly personalizationRuntimeEvents: readonly PersonalizationRuntimeEvent[];
  readonly personalizationRuntimeIndexCount: number;
  readonly personalizationRuntimeMessage: string | null;
  readonly decisionExecutionPackage: DecisionExecutionPackage | null;
  readonly decisionOrchestratorEvents: readonly DecisionOrchestratorEvent[];
  readonly decisionOrchestratorIndexCount: number;
  readonly decisionOrchestratorMessage: string | null;
  readonly runtimeExecutionPackage: RuntimeExecutionPackage | null;
  readonly experienceRuntimeEvents: readonly ExperienceRuntimeEvent[];
  readonly experienceRuntimeIndexCount: number;
  readonly experienceRuntimeMessage: string | null;
  readonly experienceModulePackage: ExperienceModulePackage | null;
  readonly moduleCoordinatorEvents: readonly ModuleCoordinatorEvent[];
  readonly moduleCoordinatorIndexCount: number;
  readonly moduleCoordinatorMessage: string | null;
  readonly experienceStatePackage: ExperienceStatePackage | null;
  readonly experienceStateEvents: readonly ExperienceStateEvent[];
  readonly experienceStateIndexCount: number;
  readonly experienceStateMessage: string | null;
  readonly observabilityPackage: RuntimeObservabilityPackage | null;
  readonly observabilityEvents: readonly RuntimeObservabilityEvent[];
  readonly observabilityIndexCount: number;
  readonly observabilityMessage: string | null;
  readonly runtimeHealthPackage: RuntimeHealthPackage | null;
  readonly runtimeHealthEvents: readonly RuntimeHealthEvent[];
  readonly runtimeHealthIndexCount: number;
  readonly runtimeHealthMessage: string | null;
  readonly runtimeAuditPackage: RuntimeAuditPackage | null;
  readonly runtimeAuditEvents: readonly RuntimeAuditEvent[];
  readonly runtimeAuditIndexCount: number;
  readonly runtimeAuditMessage: string | null;
  readonly runtimeGovernancePackage: RuntimeGovernancePackage | null;
  readonly runtimeGovernanceEvents: readonly RuntimeGovernanceEvent[];
  readonly runtimeGovernanceIndexCount: number;
  readonly runtimeGovernanceMessage: string | null;
  readonly runtimePolicyPackage: RuntimePolicyPackage | null;
  readonly runtimePolicyEvents: readonly RuntimePolicyEvent[];
  readonly runtimePolicyIndexCount: number;
  readonly runtimePolicyMessage: string | null;
  readonly runtimeEnforcementPackage: RuntimeEnforcementPackage | null;
  readonly runtimeEnforcementEvents: readonly RuntimeEnforcementEvent[];
  readonly runtimeEnforcementIndexCount: number;
  readonly runtimeEnforcementMessage: string | null;
  readonly runtimeResiliencePackage: RuntimeResiliencePackage | null;
  readonly runtimeResilienceEvents: readonly RuntimeResilienceEvent[];
  readonly runtimeResilienceIndexCount: number;
  readonly runtimeResilienceMessage: string | null;
  readonly runtimeRecoveryPackage: RuntimeRecoveryPackage | null;
  readonly runtimeRecoveryEvents: readonly RuntimeRecoveryEvent[];
  readonly runtimeRecoveryIndexCount: number;
  readonly runtimeRecoveryMessage: string | null;
  readonly runtimeRecoveryExecutionPackage: RuntimeRecoveryExecutionPackage | null;
  readonly runtimeRecoveryExecutionEvents: readonly RuntimeRecoveryExecutionEvent[];
  readonly runtimeRecoveryExecutionIndexCount: number;
  readonly runtimeRecoveryExecutionMessage: string | null;
  readonly runtimeRecoveryCoordinatorPackage: RuntimeRecoverySummaryPackage | null;
  readonly runtimeRecoveryCoordinatorEvents: readonly RuntimeRecoveryCoordinatorEvent[];
  readonly runtimeRecoveryCoordinatorIndexCount: number;
  readonly runtimeRecoveryCoordinatorMessage: string | null;
  readonly runtimeRecoveryReportingPackage: RuntimeRecoveryReportPackage | null;
  readonly runtimeRecoveryReportingEvents: readonly RuntimeRecoveryReportingEvent[];
  readonly runtimeRecoveryReportingIndexCount: number;
  readonly runtimeRecoveryReportingMessage: string | null;
  readonly runtimeOperationsPackage: RuntimeOperationsPackage | null;
  readonly runtimeOperationsEvents: readonly RuntimeOperationsEvent[];
  readonly runtimeOperationsIndexCount: number;
  readonly runtimeOperationsMessage: string | null;
  readonly runtimeIntegrationPackage: RuntimeIntegrationPackage | null;
  readonly runtimeIntegrationEvents: readonly RuntimeIntegrationEvent[];
  readonly runtimeIntegrationIndexCount: number;
  readonly runtimeIntegrationMessage: string | null;
  readonly runtimeRegistryPackage: RuntimeRegistryPackage | null;
  readonly runtimeRegistryEvents: readonly RuntimeRegistryEvent[];
  readonly runtimeRegistryIndexCount: number;
  readonly runtimeRegistryMessage: string | null;
  readonly runtimeManifestPackage: RuntimeManifestPackage | null;
  readonly runtimeManifestEvents: readonly RuntimeManifestEvent[];
  readonly runtimeManifestIndexCount: number;
  readonly runtimeManifestMessage: string | null;
  readonly runtimeApiPackage: RuntimeApiPackage | null;
  readonly runtimeApiEvents: readonly RuntimeApiEvent[];
  readonly runtimeApiIndexCount: number;
  readonly runtimeApiMessage: string | null;
  readonly runtimeCompatibilityPackage: RuntimeCompatibilityPackage | null;
  readonly runtimeCompatibilityEvents: readonly RuntimeCompatibilityEvent[];
  readonly runtimeCompatibilityIndexCount: number;
  readonly runtimeCompatibilityMessage: string | null;
  readonly runtimeContractPackage: RuntimeContractPackage | null;
  readonly runtimeContractEvents: readonly RuntimeContractEvent[];
  readonly runtimeContractIndexCount: number;
  readonly runtimeContractMessage: string | null;
  readonly runtimeExtensionPackage: RuntimeExtensionPackage | null;
  readonly runtimeExtensionEvents: readonly RuntimeExtensionEvent[];
  readonly runtimeExtensionIndexCount: number;
  readonly runtimeExtensionMessage: string | null;
  readonly objectPublicationPackage: PublicationPackage | null;
  readonly objectPublicationEvents: readonly ObjectPublicationEvent[];
  readonly objectPublicationIndexCount: number;
  readonly objectPublicationMessage: string | null;
  readonly publishedObjectPackage: PublishedObjectPackage | null;
  readonly publishedObjectEvents: readonly PublishedObjectEvent[];
  readonly publishedObjectIndexCount: number;
  readonly publishedObjectMessage: string | null;
  readonly platformPublicationPackage: PlatformPublicationPackage | null;
  readonly platformPublicationEvents: readonly PlatformPublicationEvent[];
  readonly platformPublicationIndexCount: number;
  readonly platformPublicationMessage: string | null;
  readonly clientPublicationPackage: ClientPublicationPackage | null;
  readonly clientPublicationEvents: readonly ClientPublicationEvent[];
  readonly clientPublicationIndexCount: number;
  readonly clientPublicationMessage: string | null;
  readonly publicationReadinessPackage: PublicationReadinessPackage | null;
  readonly publicationReadinessEvents: readonly PublicationReadinessEvent[];
  readonly publicationReadinessIndexCount: number;
  readonly publicationReadinessMessage: string | null;
  readonly runtimeBootstrapPackage: RuntimeBootstrapPackage | null;
  readonly runtimeBootstrapEvents: readonly RuntimeBootstrapEvent[];
  readonly runtimeBootstrapIndexCount: number;
  readonly runtimeBootstrapMessage: string | null;
  readonly artifactVersionPackage: ArtifactVersionPackage | null;
  readonly artifactVersionEvents: readonly ArtifactVersionEvent[];
  readonly artifactVersionIndexCount: number;
  readonly artifactVersionMessage: string | null;
  readonly artifactDependencyPackage: ArtifactDependencyPackage | null;
  readonly artifactDependencyEvents: readonly ArtifactDependencyEvent[];
  readonly artifactDependencyIndexCount: number;
  readonly artifactDependencyMessage: string | null;
  readonly publicationPlanPackage: PublicationPlanPackage | null;
  readonly publicationPlanEvents: readonly PublicationPlanEvent[];
  readonly publicationPlanIndexCount: number;
  readonly publicationPlanMessage: string | null;
  readonly publicationExecutionPackage: PublicationExecutionPackage | null;
  readonly publicationExecutionEvents: readonly PublicationExecutionEvent[];
  readonly publicationExecutionIndexCount: number;
  readonly publicationExecutionMessage: string | null;
  readonly artifactExportPackage: ArtifactExportPackage | null;
  readonly artifactExportEvents: readonly ArtifactExportEvent[];
  readonly artifactExportIndexCount: number;
  readonly artifactExportMessage: string | null;
  readonly exportSchemaPackage: ExportSchemaPackage | null;
  readonly exportSchemaEvents: readonly ExportSchemaEvent[];
  readonly exportSchemaIndexCount: number;
  readonly exportSchemaMessage: string | null;
  readonly exportCompatibilityPackage: ExportCompatibilityPackage | null;
  readonly exportCompatibilityEvents: readonly ExportCompatibilityEvent[];
  readonly exportCompatibilityIndexCount: number;
  readonly exportCompatibilityMessage: string | null;
  readonly exportCapabilityPackage: ExportCapabilityPackage | null;
  readonly exportCapabilityEvents: readonly ExportCapabilityEvent[];
  readonly exportCapabilityIndexCount: number;
  readonly exportCapabilityMessage: string | null;
  readonly exportPolicyPackage: ExportPolicyPackage | null;
  readonly exportPolicyEvents: readonly ExportPolicyEvent[];
  readonly exportPolicyIndexCount: number;
  readonly exportPolicyMessage: string | null;
  readonly exportCertificationPackage: ExportCertificationPackage | null;
  readonly exportCertificationEvents: readonly ExportCertificationEvent[];
  readonly exportCertificationIndexCount: number;
  readonly exportCertificationMessage: string | null;
  readonly workspacePackage: WorkspacePackage | null;
  readonly workspaceProjects: readonly Project[];
  readonly workspaceEvents: readonly WorkspaceEvent[];
  readonly workspaceIndexCount: number;
  readonly workspaceMessage: string | null;
  readonly assetManagerPackage: AssetPackage | null;
  readonly managedAssets: readonly Asset[];
  readonly assetManagerEvents: readonly AssetManagerEvent[];
  readonly assetManagerIndexCount: number;
  readonly assetManagerMessage: string | null;
  readonly objectMetadataPackage: MetadataPackage | null;
  readonly objectMetadataDocument: ObjectMetadataDocument | null;
  readonly objectMetadataEvents: readonly MetadataEvent[];
  readonly objectMetadataIndexCount: number;
  readonly objectMetadataMessage: string | null;
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
  readonly duplicateProject: (projectId: string) => void;
  readonly archiveProject: (projectId: string) => void;
  readonly createManagedAsset: () => void;
  readonly renameManagedAsset: (assetId: string) => void;
  readonly archiveManagedAsset: (assetId: string) => void;
  readonly restoreManagedAsset: (assetId: string) => void;
  readonly createObjectMetadata: () => void;
  readonly updateObjectMetadataGeneral: (patch: {
    title: string;
    slug: string;
    summary: string;
    description: string;
    category: string;
    language: string;
    status: MetadataStatus;
  }) => void;
  readonly updateObjectMetadataSeo: (patch: {
    title: string;
    description: string;
    keywords: string;
    canonicalUrl: string;
    socialImageAssetId: string | null;
  }) => void;
  readonly attachObjectMetadataAsset: (assetId: string) => void;
  readonly detachObjectMetadataAsset: (assetId: string) => void;
  readonly openObjectMetadataAsset: (assetId: string) => void;
  readonly addObjectMetadataAttribute: (
    attribute: Omit<ObjectAttribute, 'id' | 'metadata'> & {
      readonly id?: string;
      readonly metadata?: ObjectAttribute['metadata'];
    },
  ) => void;
  readonly editObjectMetadataAttribute: (attribute: ObjectAttribute) => void;
  readonly removeObjectMetadataAttribute: (key: string) => void;
  readonly reorderObjectMetadataAttribute: (
    key: string,
    direction: 'up' | 'down',
  ) => void;
  readonly validateObjectMetadata: () => void;
  readonly publishObjectMetadataDraft: () => void;
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
  readonly evaluateRules: () => void;
  readonly validateEvaluation: () => void;
  readonly disposeEvaluation: () => void;
  readonly composeStory: () => void;
  readonly validateStory: () => void;
  readonly disposeStory: () => void;
  readonly createRuntimeSession: () => void;
  readonly startRuntimeSession: () => void;
  readonly nextSessionMove: () => void;
  readonly previousSessionMove: () => void;
  readonly completeRuntimeSession: () => void;
  readonly disposeRuntimeSession: () => void;
  readonly evaluateBehavior: () => void;
  readonly receiveDemoBehaviorSignals: () => void;
  readonly disposeBehavior: () => void;
  readonly recordAnalytics: () => void;
  readonly aggregateAnalytics: () => void;
  readonly exportAnalytics: () => void;
  readonly disposeAnalytics: () => void;
  readonly importLearning: () => void;
  readonly validateLearningPipeline: () => void;
  readonly anonymizeLearning: () => void;
  readonly transformLearning: () => void;
  readonly disposeLearningPipeline: () => void;
  readonly createLearningRecordsPackage: () => void;
  readonly addLearningRecordRef: () => void;
  readonly removeLastLearningRecordRef: () => void;
  readonly validateLearningRecordsPackage: () => void;
  readonly publishLearningRecordsPackage: () => void;
  readonly disposeLearningRecordsPackage: () => void;
  readonly extractPatterns: () => void;
  readonly validatePatterns: () => void;
  readonly publishPatterns: () => void;
  readonly disposePatterns: () => void;
  readonly extractIntelligencePatterns: () => void;
  readonly mergeIntelligencePatterns: () => void;
  readonly validateIntelligencePatterns: () => void;
  readonly publishIntelligencePatterns: () => void;
  readonly disposeIntelligencePatterns: () => void;
  readonly deriveHeuristics: () => void;
  readonly validateHeuristics: () => void;
  readonly publishHeuristics: () => void;
  readonly disposeHeuristics: () => void;
  readonly synthesizeKnowledge: () => void;
  readonly mergeKnowledge: () => void;
  readonly validateSynthesizedKnowledge: () => void;
  readonly publishSynthesizedKnowledge: () => void;
  readonly disposeSynthesizedKnowledge: () => void;
  readonly buildGatewayAIContext: () => void;
  readonly filterGatewayAIContext: () => void;
  readonly validateGatewayAIContext: () => void;
  readonly publishGatewayAIContext: () => void;
  readonly disposeGatewayAIContext: () => void;
  readonly personalizeContext: () => void;
  readonly rankPersonalization: () => void;
  readonly validatePersonalization: () => void;
  readonly publishPersonalization: () => void;
  readonly disposePersonalization: () => void;
  readonly projectDecisionContext: () => void;
  readonly rankDecisionContext: () => void;
  readonly validateDecisionContext: () => void;
  readonly publishDecisionContext: () => void;
  readonly disposeDecisionContext: () => void;
  readonly startDecisionExecution: () => void;
  readonly advanceDecisionExecution: () => void;
  readonly transitionDecisionExecution: () => void;
  readonly completeDecisionExecution: () => void;
  readonly validateDecisionExecution: () => void;
  readonly disposeDecisionExecution: () => void;
  readonly startExperienceRuntime: () => void;
  readonly nextExperienceRuntimeMove: () => void;
  readonly previousExperienceRuntimeMove: () => void;
  readonly jumpExperienceRuntimeMove: () => void;
  readonly completeExperienceRuntime: () => void;
  readonly validateExperienceRuntime: () => void;
  readonly disposeExperienceRuntime: () => void;
  readonly initializeExperienceModules: () => void;
  readonly activateExperienceModule: () => void;
  readonly transitionExperienceModule: () => void;
  readonly completeExperienceModules: () => void;
  readonly validateExperienceModules: () => void;
  readonly disposeExperienceModules: () => void;
  readonly createExperienceState: () => void;
  readonly updateExperienceState: () => void;
  readonly checkpointExperienceState: () => void;
  readonly restoreExperienceState: () => void;
  readonly completeExperienceState: () => void;
  readonly validateExperienceState: () => void;
  readonly disposeExperienceState: () => void;
  readonly collectRuntimeObservability: () => void;
  readonly publishRuntimeObservability: () => void;
  readonly validateRuntimeObservability: () => void;
  readonly disposeRuntimeObservability: () => void;
  readonly inspectRuntimeHealth: () => void;
  readonly publishRuntimeHealth: () => void;
  readonly validateRuntimeHealth: () => void;
  readonly disposeRuntimeHealth: () => void;
  readonly recordRuntimeAudit: () => void;
  readonly publishRuntimeAudit: () => void;
  readonly validateRuntimeAudit: () => void;
  readonly disposeRuntimeAudit: () => void;
  readonly evaluateRuntimeGovernance: () => void;
  readonly publishRuntimeGovernance: () => void;
  readonly validateRuntimeGovernance: () => void;
  readonly disposeRuntimeGovernance: () => void;
  readonly initializeRuntimePolicies: () => void;
  readonly registerRuntimePolicy: () => void;
  readonly publishRuntimePolicies: () => void;
  readonly validateRuntimePolicies: () => void;
  readonly disposeRuntimePolicies: () => void;
  readonly evaluateRuntimeEnforcement: () => void;
  readonly publishRuntimeEnforcement: () => void;
  readonly validateRuntimeEnforcement: () => void;
  readonly disposeRuntimeEnforcement: () => void;
  readonly evaluateRuntimeResilience: () => void;
  readonly publishRuntimeResilience: () => void;
  readonly validateRuntimeResilience: () => void;
  readonly disposeRuntimeResilience: () => void;
  readonly buildRuntimeRecovery: () => void;
  readonly publishRuntimeRecovery: () => void;
  readonly validateRuntimeRecovery: () => void;
  readonly disposeRuntimeRecovery: () => void;
  readonly executeRuntimeRecoveryExecution: () => void;
  readonly pauseRuntimeRecoveryExecution: () => void;
  readonly resumeRuntimeRecoveryExecution: () => void;
  readonly validateRuntimeRecoveryExecution: () => void;
  readonly publishRuntimeRecoveryExecution: () => void;
  readonly disposeRuntimeRecoveryExecution: () => void;
  readonly startRuntimeRecoveryCoordinator: () => void;
  readonly completeRuntimeRecoveryCoordinator: () => void;
  readonly publishRuntimeRecoveryCoordinator: () => void;
  readonly validateRuntimeRecoveryCoordinator: () => void;
  readonly disposeRuntimeRecoveryCoordinator: () => void;
  readonly generateRuntimeRecoveryReporting: () => void;
  readonly publishRuntimeRecoveryReporting: () => void;
  readonly validateRuntimeRecoveryReporting: () => void;
  readonly disposeRuntimeRecoveryReporting: () => void;
  readonly collectRuntimeOperations: () => void;
  readonly publishRuntimeOperations: () => void;
  readonly validateRuntimeOperations: () => void;
  readonly disposeRuntimeOperations: () => void;
  readonly registerRuntimeIntegration: () => void;
  readonly publishRuntimeIntegration: () => void;
  readonly validateRuntimeIntegration: () => void;
  readonly disposeRuntimeIntegration: () => void;
  readonly registerRuntimeRegistry: () => void;
  readonly publishRuntimeRegistry: () => void;
  readonly validateRuntimeRegistry: () => void;
  readonly disposeRuntimeRegistry: () => void;
  readonly generateRuntimeManifest: () => void;
  readonly publishRuntimeManifest: () => void;
  readonly validateRuntimeManifest: () => void;
  readonly disposeRuntimeManifest: () => void;
  readonly registerRuntimeApi: () => void;
  readonly publishRuntimeApi: () => void;
  readonly validateRuntimeApi: () => void;
  readonly disposeRuntimeApi: () => void;
  readonly registerRuntimeCompatibility: () => void;
  readonly evaluateRuntimeCompatibility: () => void;
  readonly publishRuntimeCompatibility: () => void;
  readonly validateRuntimeCompatibility: () => void;
  readonly disposeRuntimeCompatibility: () => void;
  readonly registerRuntimeContracts: () => void;
  readonly publishRuntimeContracts: () => void;
  readonly validateRuntimeContracts: () => void;
  readonly disposeRuntimeContracts: () => void;
  readonly registerRuntimeExtensions: () => void;
  readonly enableRuntimeExtensions: () => void;
  readonly disableRuntimeExtensions: () => void;
  readonly publishRuntimeExtensions: () => void;
  readonly validateRuntimeExtensions: () => void;
  readonly disposeRuntimeExtensions: () => void;
  readonly buildObjectPublication: () => void;
  readonly validateObjectPublication: () => void;
  readonly publishObjectPublication: () => void;
  readonly disposeObjectPublication: () => void;
  readonly registerPublishedObjects: () => void;
  readonly archivePublishedObjects: () => void;
  readonly validatePublishedObjects: () => void;
  readonly disposePublishedObjects: () => void;
  readonly registerPlatformPublications: () => void;
  readonly refreshPlatformPublications: () => void;
  readonly validatePlatformPublications: () => void;
  readonly disposePlatformPublications: () => void;
  readonly loadClientPublication: () => void;
  readonly transformClientPublication: () => void;
  readonly publishClientPublication: () => void;
  readonly validateClientPublication: () => void;
  readonly disposeClientPublication: () => void;
  readonly validatePublicationReadiness: () => void;
  readonly evaluatePublicationReadiness: () => void;
  readonly publishPublicationReadiness: () => void;
  readonly disposePublicationReadiness: () => void;
  readonly buildRuntimeBootstrap: () => void;
  readonly validateRuntimeBootstrap: () => void;
  readonly publishRuntimeBootstrap: () => void;
  readonly disposeRuntimeBootstrap: () => void;
  readonly registerArtifactVersion: () => void;
  readonly activateArtifactVersion: () => void;
  readonly deprecateArtifactVersion: () => void;
  readonly validateArtifactVersion: () => void;
  readonly disposeArtifactVersion: () => void;
  readonly registerArtifactDependency: () => void;
  readonly removeArtifactDependency: () => void;
  readonly validateArtifactDependencies: () => void;
  readonly disposeArtifactDependency: () => void;
  readonly buildPublicationPlan: () => void;
  readonly validatePublicationPlan: () => void;
  readonly publishPublicationPlan: () => void;
  readonly disposePublicationPlan: () => void;
  readonly startPublicationExecution: () => void;
  readonly executePublicationStep: () => void;
  readonly completePublicationExecution: () => void;
  readonly validatePublicationExecution: () => void;
  readonly disposePublicationExecution: () => void;
  readonly buildArtifactExport: () => void;
  readonly validateArtifactExport: () => void;
  readonly exportArtifact: () => void;
  readonly disposeArtifactExport: () => void;
  readonly registerExportSchema: () => void;
  readonly validateExportSchema: () => void;
  readonly disposeExportSchema: () => void;
  readonly registerExportCompatibility: () => void;
  readonly validateExportCompatibility: () => void;
  readonly disposeExportCompatibility: () => void;
  readonly registerExportCapability: () => void;
  readonly validateExportCapability: () => void;
  readonly disposeExportCapability: () => void;
  readonly registerExportPolicy: () => void;
  readonly validateExportPolicy: () => void;
  readonly disposeExportPolicy: () => void;
  readonly certifyExport: () => void;
  readonly validateExportCertification: () => void;
  readonly revokeExportCertification: () => void;
  readonly disposeExportCertification: () => void;
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






function toRuleEvaluationInput(
  decisionModel: DecisionModel,
  knowledge: KnowledgePackage | null,
  decision: DecisionKnowledgePackage | null,
): RuleEvaluationInput {
  return {
    decisionModelId: decisionModel.id,
    objectId: decisionModel.objectId,
    title: `${decisionModel.metadata.title} Evaluation`,
    context: {
      knowledge: {
        knowledgeId: knowledge?.knowledgeId ?? decisionModel.knowledge,
        factIds: knowledge?.facts.map((fact) => fact.id) ?? [],
        faqIds: knowledge?.faqs.map((faq) => faq.id) ?? [],
      },
      decisionKnowledge: {
        decisionKnowledgeId:
          decision?.id ?? decisionModel.decisionKnowledge,
        ruleIds: decision?.decisionRules.map((rule) => rule.id) ?? [],
      },
      signals:
        decision?.decisionSignals.map((signal) => ({
          id: signal.id,
          source: signal.source,
          label: signal.label,
          type: signal.type,
          importance: signal.importance,
        })) ?? [],
      priorities: decision?.priorities ?? [],
      metadata: {
        objectId: decisionModel.objectId,
        notes: 'EvaluationContext from DecisionModel inputs.',
      },
    },
    rules:
      decision?.decisionRules.map((rule) => ({
        id: rule.id,
        condition: rule.condition,
        outcome: rule.outcome,
        priority: rule.priority,
        weight: rule.weight,
      })) ?? [],
  };
}







function toIngestAnalyticsInput(
  snapshot: AnalyticsSnapshot,
): IngestAnalyticsInput {
  return {
    snapshotId: snapshot.id,
    sessionId: snapshot.session.runtimeSessionId,
    storyId: snapshot.session.storyId,
    title: snapshot.metadata.title,
    completed: snapshot.summary.completed,
    events: snapshot.events.map((event) => ({
      type: event.type,
      timestamp: event.timestamp,
      source: event.source,
      note: event.payload.note,
      moveId: event.payload.moveId,
      durationMs: event.payload.durationMs,
      analyticsSessionId: event.metadata.analyticsSessionId,
    })),
    metrics: snapshot.metrics.map((metric) => ({
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
    })),
  };
}

function recordAnalyticsFromRuntime(
  engine: {
    initialize: (input: {
      readonly runtimeSessionId: string;
      readonly storyId: string;
      readonly runtimeId: string;
      readonly behaviorId?: string | null;
      readonly title?: string;
    }) => { readonly id: string };
    record: (input: RecordAnalyticsEventInput) => unknown;
    dispose: (id: string) => void;
  },
  session: RuntimeSession,
  behaviorEvaluationId: string | null,
): string {
  // dispose previous analytics session for same runtime session if re-recording
  const analyticsSessionId = `analytics-session-${session.id}`;
  engine.dispose(analyticsSessionId);

  const analyticsSession = engine.initialize({
    runtimeSessionId: session.id,
    storyId: session.storyId,
    runtimeId: session.runtimeId,
    behaviorId: behaviorEvaluationId,
    title: `${session.metadata.title} Analytics`,
  });

  const record = (
    type: RecordAnalyticsEventInput['type'],
    source: string,
    moveId: string | null = null,
    note?: string,
    durationMs: number | null = null,
  ): void => {
    engine.record({
      analyticsSessionId: analyticsSession.id,
      type,
      source,
      moveId,
      note,
      durationMs,
    });
  };

  record('SessionStarted', 'runtime-session', null, 'Session started');
  for (const entry of session.history) {
    if (
      entry.action === 'entered' ||
      entry.action === 'navigated-next' ||
      entry.action === 'navigated-previous'
    ) {
      record(
        'MoveEntered',
        'runtime-session',
        entry.moveId,
        entry.metadata.note,
        1000,
      );
    }
    if (entry.action === 'completed-move') {
      record(
        'MoveExited',
        'runtime-session',
        entry.moveId,
        entry.metadata.note,
        1000,
      );
    }
    if (entry.action === 'completed') {
      record(
        'SessionCompleted',
        'runtime-session',
        entry.moveId,
        entry.metadata.note,
      );
    }
  }
  if (behaviorEvaluationId !== null) {
    record(
      'BehaviorEvaluated',
      'behavior',
      session.currentMoveId,
      `Behavior evaluation ${behaviorEvaluationId}`,
    );
    record(
      'BehaviorActionProposed',
      'behavior',
      session.currentMoveId,
      'Behavior action proposed',
    );
  }
  return analyticsSession.id;
}

function toEvaluateBehaviorInput(
  session: RuntimeSession,
  signals: readonly BehaviorSignal[] = [],
): EvaluateBehaviorInput {
  return {
    sessionId: session.id,
    currentMove: session.currentMoveId,
    history: session.history.map((entry) => ({
      moveId: entry.moveId,
      action: entry.action,
      timestamp: entry.timestamp,
    })),
    signals,
    title: `${session.metadata.title} Behavior`,
  };
}

function toCreateSessionInput(
  runtimeId: string,
  story: DecisionStory,
): CreateSessionInput {
  return {
    runtimeId,
    storyId: story.id,
    title: `${story.metadata.title} Session`,
    moveIds: story.moves.map((move) => move.id),
  };
}

function toComposeStoryInput(
  evaluation: EvaluationResult,
): ComposeStoryInput {
  return {
    decisionModelId: evaluation.decisionModelId,
    evaluationId: evaluation.id,
    title: `${evaluation.metadata.title} Story`,
    ruleResults: evaluation.ruleResults.map((rule) => ({
      ruleId: rule.ruleId,
      status: rule.status,
      score: rule.score,
      matchedSignals: rule.matchedSignals,
      reason: rule.reason,
      condition: rule.metadata.condition,
      outcome: rule.metadata.outcome,
    })),
    evaluationSummary: {
      passed: evaluation.summary.passed,
      failed: evaluation.summary.failed,
      skipped: evaluation.summary.skipped,
      averageScore: evaluation.summary.averageScore,
    },
  };
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
    const ruleEvaluationEngine = createRuleEvaluationEngine();
    const ruleEvaluationApi = createRuleEvaluationApi(ruleEvaluationEngine);
    const decisionStoryComposer = createDecisionStoryComposer();
    const decisionStoryApi = createDecisionStoryApi(decisionStoryComposer);
    const runtimeSessionEngine = createRuntimeSessionEngine();
    const runtimeSessionApi = createRuntimeSessionApi(runtimeSessionEngine);
    const behaviorEngine = createBehaviorEngine();
    const behaviorApi = createBehaviorApi(behaviorEngine);
    const decisionAnalyticsEngine = createDecisionAnalyticsEngine();
    const decisionAnalyticsApi = createDecisionAnalyticsApi(
      decisionAnalyticsEngine,
    );
    const learningPipeline = createLearningPipeline();
    const learningPipelineApi = createLearningPipelineApi(learningPipeline);
    const learningPackageManager = createLearningPackageManager();
    const learningPackageManagerApi = createLearningPackageManagerApi(
      learningPackageManager,
    );
    const patternExtractionEngine = createPatternExtractionEngine();
    const patternExtractionApi = createPatternExtractionApi(
      patternExtractionEngine,
    );
    const patternIntelligenceEngine = createPatternIntelligenceEngine();
    const patternIntelligenceApi = createPatternIntelligenceApi(
      patternIntelligenceEngine,
    );
    const heuristicEngine = createHeuristicEngine();
    const heuristicEngineApi = createHeuristicEngineApi(heuristicEngine);
    const knowledgeSynthesisEngine = createKnowledgeSynthesisEngine();
    const knowledgeSynthesisApi = createKnowledgeSynthesisApi(
      knowledgeSynthesisEngine,
    );
    const aiDecisionGateway = createAIDecisionGateway();
    const aiDecisionGatewayApi = createAIDecisionGatewayApi(aiDecisionGateway);
    const personalizationEngine = createPersonalizationEngine();
    const personalizationEngineApi = createPersonalizationEngineApi(
      personalizationEngine,
    );
    const personalizationRuntimeEngine = createPersonalizationRuntimeEngine();
    const personalizationRuntimeApi = createPersonalizationRuntimeApi(
      personalizationRuntimeEngine,
    );
    const decisionOrchestrator = createDecisionOrchestrator();
    const decisionOrchestratorApi = createDecisionOrchestratorApi(
      decisionOrchestrator,
    );
    const experienceRuntimeOrchestrator = createExperienceRuntimeOrchestrator();
    const experienceRuntimeApi = createExperienceRuntimeApi(
      experienceRuntimeOrchestrator,
    );
    const experienceModuleCoordinator = createExperienceModuleCoordinator();
    const experienceModuleCoordinatorApi = createExperienceModuleCoordinatorApi(
      experienceModuleCoordinator,
    );
    const experienceStateManager = createExperienceStateManager();
    const experienceStateApi = createExperienceStateApi(
      experienceStateManager,
    );
    const runtimeObservabilityEngine = createRuntimeObservabilityEngine();
    const runtimeObservabilityApi = createRuntimeObservabilityApi(
      runtimeObservabilityEngine,
    );
    const runtimeHealthEngine = createRuntimeHealthEngine();
    const runtimeHealthApi = createRuntimeHealthApi(runtimeHealthEngine);
    const runtimeAuditEngine = createRuntimeAuditEngine();
    const runtimeAuditApi = createRuntimeAuditApi(runtimeAuditEngine);
    const runtimeGovernanceEngine = createRuntimeGovernanceEngine();
    const runtimeGovernanceApi = createRuntimeGovernanceApi(
      runtimeGovernanceEngine,
    );
    const runtimePolicyEngine = createRuntimePolicyEngine();
    const runtimePolicyApi = createRuntimePolicyApi(runtimePolicyEngine);
    const runtimeEnforcementEngine = createRuntimePolicyEnforcementEngine();
    const runtimeEnforcementApi = createRuntimeEnforcementApi(
      runtimeEnforcementEngine,
    );
    const runtimeResilienceEngine = createRuntimeResilienceEngine();
    const runtimeResilienceApi = createRuntimeResilienceApi(
      runtimeResilienceEngine,
    );
    const runtimeRecoveryOrchestrator = createRuntimeRecoveryOrchestrator();
    const runtimeRecoveryApi = createRuntimeRecoveryApi(
      runtimeRecoveryOrchestrator,
    );
    const runtimeRecoveryExecutor = createRuntimeRecoveryExecutor();
    const runtimeRecoveryExecutionApi = createRuntimeRecoveryExecutionApi(
      runtimeRecoveryExecutor,
    );
    const runtimeRecoveryCoordinator = createRuntimeRecoveryCoordinator();
    const runtimeRecoveryCoordinatorApi = createRuntimeRecoveryCoordinatorApi(
      runtimeRecoveryCoordinator,
    );
    const runtimeRecoveryReportingEngine =
      createRuntimeRecoveryReportingEngine();
    const runtimeRecoveryReportingApi = createRuntimeRecoveryReportingApi(
      runtimeRecoveryReportingEngine,
    );
    const runtimeOperationsDashboard = createRuntimeOperationsDashboard();
    const runtimeOperationsApi = createRuntimeOperationsApi(
      runtimeOperationsDashboard,
    );
    const runtimeIntegrationHub = createRuntimeIntegrationHub();
    const runtimeIntegrationApi = createRuntimeIntegrationApi(
      runtimeIntegrationHub,
    );
    const runtimeIntegrationRegistry = createRuntimeIntegrationRegistry();
    const runtimeRegistryApi = createRuntimeRegistryApi(
      runtimeIntegrationRegistry,
    );
    const runtimeManifestEngine = createRuntimeManifestEngine();
    const runtimeManifestApi = createRuntimeManifestApi(
      runtimeManifestEngine,
    );
    const runtimeApiGateway = createRuntimeApiGateway();
    const runtimeApiGatewayApi = createRuntimeApiGatewayApi(
      runtimeApiGateway,
    );
    const runtimeCompatibilityManager = createRuntimeCompatibilityManager();
    const runtimeCompatibilityApi = createRuntimeCompatibilityApi(
      runtimeCompatibilityManager,
    );
    const runtimeContractManager = createRuntimeContractManager();
    const runtimeContractApi = createRuntimeContractApi(
      runtimeContractManager,
    );
    const runtimeExtensionFramework = createRuntimeExtensionFramework();
    const runtimeExtensionApi = createRuntimeExtensionApi(
      runtimeExtensionFramework,
    );
    const objectPublicationPipeline = createObjectPublicationPipeline();
    const objectPublicationApi = createObjectPublicationApi(
      objectPublicationPipeline,
    );
    const publishedObjectRegistry = createPublishedObjectRegistry();
    const publishedObjectApi = createPublishedObjectApi(
      publishedObjectRegistry,
    );
    const platformPublicationCatalog = createPlatformPublicationCatalog();
    const platformPublicationApi = createPlatformPublicationApi(
      platformPublicationCatalog,
    );
    const clientPublicationAdapter = createClientPublicationAdapter();
    const clientPublicationApi = createClientPublicationApi(
      clientPublicationAdapter,
    );
    const publicationReadinessValidator = createPublicationReadinessValidator();
    const publicationReadinessApi = createPublicationReadinessApi(
      publicationReadinessValidator,
    );
    const artifactDependencyRegistry = createArtifactDependencyRegistry();
    const artifactDependencyApi = createArtifactDependencyApi(
      artifactDependencyRegistry,
    );
    const publicationPlanBuilder = createPublicationPlanBuilder();
    const publicationPlanApi = createPublicationPlanApi(publicationPlanBuilder);
    const publicationExecutionCoordinator =
      createPublicationExecutionCoordinator();
    const publicationExecutionApi = createPublicationExecutionApi(
      publicationExecutionCoordinator,
    );
    const artifactExportContract = createArtifactExportContract();
    const artifactExportApi = createArtifactExportApi(artifactExportContract);
    const exportSchemaRegistry = createExportSchemaRegistry();
    const exportSchemaApi = createExportSchemaApi(exportSchemaRegistry);
    const exportCompatibilityRegistry = createExportCompatibilityRegistry();
    const exportCompatibilityApi = createExportCompatibilityApi(exportCompatibilityRegistry);
    const exportCapabilityRegistry = createExportCapabilityRegistry();
    const exportCapabilityApi = createExportCapabilityApi(exportCapabilityRegistry);
    const exportPolicyRegistry = createExportPolicyRegistry();
    const exportPolicyApi = createExportPolicyApi(exportPolicyRegistry);
    const exportCertificationService = createExportCertificationService();
    const exportCertificationApi = createExportCertificationApi(
      exportCertificationService,
    );
    const assetManagerService = createAssetManagerService();
    const assetManagerApi = createAssetManagerApi(assetManagerService);
    const metadataService = createMetadataService({
      knownAssetIds: () =>
        new Set(assetManagerApi.listAssets().map((asset) => asset.id)),
    });
    const metadataApi = createMetadataApi(metadataService);
    const artifactVersionManager = createArtifactVersionManager();
    const artifactVersionApi = createArtifactVersionApi(artifactVersionManager);
    const runtimeSessionBootstrap = createRuntimeSessionBootstrap();
    const runtimeBootstrapApi = createRuntimeBootstrapApi(
      runtimeSessionBootstrap,
    );
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
      ruleEvaluationEngine,
      ruleEvaluationApi,
      decisionStoryComposer,
      decisionStoryApi,
      runtimeSessionEngine,
      runtimeSessionApi,
      behaviorEngine,
      behaviorApi,
      decisionAnalyticsEngine,
      decisionAnalyticsApi,
      learningPipeline,
      learningPipelineApi,
      learningPackageManager,
      learningPackageManagerApi,
      patternExtractionEngine,
      patternExtractionApi,
      patternIntelligenceEngine,
      patternIntelligenceApi,
      heuristicEngine,
      heuristicEngineApi,
      knowledgeSynthesisEngine,
      knowledgeSynthesisApi,
      aiDecisionGateway,
      aiDecisionGatewayApi,
      personalizationEngine,
      personalizationEngineApi,
      personalizationRuntimeEngine,
      personalizationRuntimeApi,
      decisionOrchestrator,
      decisionOrchestratorApi,
      experienceRuntimeOrchestrator,
      experienceRuntimeApi,
      experienceModuleCoordinator,
      experienceModuleCoordinatorApi,
      experienceStateManager,
      experienceStateApi,
      runtimeObservabilityEngine,
      runtimeObservabilityApi,
      runtimeHealthEngine,
      runtimeHealthApi,
      runtimeAuditEngine,
      runtimeAuditApi,
      runtimeGovernanceEngine,
      runtimeGovernanceApi,
      runtimePolicyEngine,
      runtimePolicyApi,
      runtimeEnforcementEngine,
      runtimeEnforcementApi,
      runtimeResilienceEngine,
      runtimeResilienceApi,
      runtimeRecoveryOrchestrator,
      runtimeRecoveryApi,
      runtimeRecoveryExecutor,
      runtimeRecoveryExecutionApi,
      runtimeRecoveryCoordinator,
      runtimeRecoveryCoordinatorApi,
      runtimeRecoveryReportingEngine,
      runtimeRecoveryReportingApi,
      runtimeOperationsDashboard,
      runtimeOperationsApi,
      runtimeIntegrationHub,
      runtimeIntegrationApi,
      runtimeIntegrationRegistry,
      runtimeRegistryApi,
      runtimeManifestEngine,
      runtimeManifestApi,
      runtimeApiGateway,
      runtimeApiGatewayApi,
      runtimeCompatibilityManager,
      runtimeCompatibilityApi,
      runtimeContractManager,
      runtimeContractApi,
      runtimeExtensionFramework,
      runtimeExtensionApi,
      objectPublicationPipeline,
      objectPublicationApi,
      publishedObjectRegistry,
      publishedObjectApi,
      platformPublicationCatalog,
      platformPublicationApi,
      clientPublicationAdapter,
      clientPublicationApi,
      publicationReadinessValidator,
      publicationReadinessApi,
      artifactDependencyRegistry,
      artifactDependencyApi,
      publicationPlanBuilder,
      publicationPlanApi,
      publicationExecutionCoordinator,
      publicationExecutionApi,
      artifactExportContract,
      artifactExportApi,
      exportSchemaRegistry,
      exportSchemaApi,
      exportCompatibilityRegistry,
      exportCompatibilityApi,
      exportCapabilityRegistry,
      exportCapabilityApi,
      exportPolicyRegistry,
      exportPolicyApi,
      exportCertificationService,
      exportCertificationApi,
      assetManagerService,
      assetManagerApi,
      metadataService,
      metadataApi,
      artifactVersionManager,
      artifactVersionApi,
      runtimeSessionBootstrap,
      runtimeBootstrapApi,
    };
  }, []);

  const [workspace, setWorkspace] = useState(() =>
    services.workspaceService.getWorkspace(),
  );
  const [workspacePackage, setWorkspacePackage] = useState<WorkspacePackage | null>(
    () => services.workspaceService.initialize(),
  );
  const [workspaceProjects, setWorkspaceProjects] = useState<readonly Project[]>(
    () => services.workspaceService.listProjects(),
  );
  const [workspaceEvents, setWorkspaceEvents] = useState<readonly WorkspaceEvent[]>(
    () => services.workspaceService.getEvents(),
  );
  const [workspaceIndexCount, setWorkspaceIndexCount] = useState(
    () => services.workspaceService.getIndex().length,
  );
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);
  const [assetManagerPackage, setAssetManagerPackage] =
    useState<AssetPackage | null>(null);
  const [managedAssets, setManagedAssets] = useState<readonly Asset[]>([]);
  const [assetManagerEvents, setAssetManagerEvents] = useState<
    readonly AssetManagerEvent[]
  >([]);
  const [assetManagerIndexCount, setAssetManagerIndexCount] = useState(0);
  const [assetManagerMessage, setAssetManagerMessage] = useState<string | null>(
    null,
  );
  const [objectMetadataPackage, setObjectMetadataPackage] =
    useState<MetadataPackage | null>(null);
  const [objectMetadataDocument, setObjectMetadataDocument] =
    useState<ObjectMetadataDocument | null>(null);
  const [objectMetadataEvents, setObjectMetadataEvents] = useState<
    readonly MetadataEvent[]
  >([]);
  const [objectMetadataIndexCount, setObjectMetadataIndexCount] = useState(0);
  const [objectMetadataMessage, setObjectMetadataMessage] = useState<
    string | null
  >(null);
  const [activeProjectModel, setActiveProjectModel] = useState(() =>
    services.workspaceService.getActiveProjectModel(),
  );
  const [pipeline, setPipeline] = useState(() =>
    services.workspaceService.getPipelineSnapshot(),
  );
  const [activeSection, setActiveSection] =
    useState<WorkspaceSectionId>('projects');
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
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [evaluationEvents, setEvaluationEvents] = useState<
    readonly EvaluationEvent[]
  >([]);
  const [evaluationValidationMessage, setEvaluationValidationMessage] =
    useState<string | null>(null);
  const [decisionStory, setDecisionStory] = useState<DecisionStory | null>(
    null,
  );
  const [storyEvents, setStoryEvents] = useState<readonly StoryEvent[]>([]);
  const [storyMessage, setStoryMessage] = useState<string | null>(null);
  const [runtimeSession, setRuntimeSession] = useState<RuntimeSession | null>(
    null,
  );
  const [sessionEvents, setSessionEvents] = useState<readonly SessionEvent[]>(
    [],
  );
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [behaviorEvaluation, setBehaviorEvaluation] =
    useState<BehaviorEvaluation | null>(null);
  const [behaviorSignals, setBehaviorSignals] = useState<
    readonly BehaviorSignal[]
  >([]);
  const [behaviorEvents, setBehaviorEvents] = useState<
    readonly BehaviorEvent[]
  >([]);
  const [behaviorMessage, setBehaviorMessage] = useState<string | null>(null);
  const [analyticsSnapshot, setAnalyticsSnapshot] =
    useState<AnalyticsSnapshot | null>(null);
  const [analyticsEvents, setAnalyticsEvents] = useState<
    readonly AnalyticsEngineEvent[]
  >([]);
  const [analyticsMessage, setAnalyticsMessage] = useState<string | null>(
    null,
  );
  const [learningRecord, setLearningRecord] = useState<LearningRecord | null>(
    null,
  );
  const [learningValidation, setLearningValidation] =
    useState<LearningValidationResult | null>(null);
  const [learningImportReport, setLearningImportReport] =
    useState<LearningImportReport | null>(null);
  const [learningExportPayload, setLearningExportPayload] = useState<
    string | null
  >(null);
  const [learningPipelineEvents, setLearningPipelineEvents] = useState<
    readonly LearningPipelineEvent[]
  >([]);
  const [learningPipelineId, setLearningPipelineId] = useState<string | null>(
    null,
  );
  const [learningPipelineMessage, setLearningPipelineMessage] = useState<
    string | null
  >(null);
  const [learningRecordsPackage, setLearningRecordsPackage] =
    useState<LearningRecordsPackage | null>(null);
  const [learningPackageManagerEvents, setLearningPackageManagerEvents] =
    useState<readonly LearningPackageManagerEvent[]>([]);
  const [learningPackageIndexCount, setLearningPackageIndexCount] =
    useState(0);
  const [learningPackageManagerMessage, setLearningPackageManagerMessage] =
    useState<string | null>(null);
  const [patternCollection, setPatternCollection] =
    useState<PatternCollection | null>(null);
  const [patternExtractionEvents, setPatternExtractionEvents] = useState<
    readonly PatternEngineEvent[]
  >([]);
  const [patternIndexCount, setPatternIndexCount] = useState(0);
  const [patternExtractionMessage, setPatternExtractionMessage] = useState<
    string | null
  >(null);
  const [patternCatalog, setPatternCatalog] = useState<PatternCatalog | null>(
    null,
  );
  const [patternIntelligenceEvents, setPatternIntelligenceEvents] = useState<
    readonly PatternIntelligenceEvent[]
  >([]);
  const [patternIntelligenceIndexCount, setPatternIntelligenceIndexCount] =
    useState(0);
  const [patternIntelligenceMessage, setPatternIntelligenceMessage] = useState<
    string | null
  >(null);
  const [heuristicCatalog, setHeuristicCatalog] =
    useState<HeuristicCatalog | null>(null);
  const [heuristicEngineEvents, setHeuristicEngineEvents] = useState<
    readonly HeuristicEngineEvent[]
  >([]);
  const [heuristicIndexCount, setHeuristicIndexCount] = useState(0);
  const [heuristicEngineMessage, setHeuristicEngineMessage] = useState<
    string | null
  >(null);
  const [synthesizedKnowledgeBase, setSynthesizedKnowledgeBase] =
    useState<SynthesizedKnowledgeBase | null>(null);
  const [knowledgeSynthesisEvents, setKnowledgeSynthesisEvents] = useState<
    readonly KnowledgeSynthesisEvent[]
  >([]);
  const [knowledgeSynthesisIndexCount, setKnowledgeSynthesisIndexCount] =
    useState(0);
  const [knowledgeSynthesisMessage, setKnowledgeSynthesisMessage] = useState<
    string | null
  >(null);
  const [gatewayAIContextPackage, setGatewayAIContextPackage] =
    useState<GatewayAIContextPackage | null>(null);
  const [aiDecisionGatewayEvents, setAIDecisionGatewayEvents] = useState<
    readonly AIDecisionGatewayEvent[]
  >([]);
  const [aiDecisionGatewayIndexCount, setAIDecisionGatewayIndexCount] =
    useState(0);
  const [aiDecisionGatewayMessage, setAIDecisionGatewayMessage] = useState<
    string | null
  >(null);
  const [personalizationPackage, setPersonalizationPackage] =
    useState<PersonalizationPackage | null>(null);
  const [personalizationEngineEvents, setPersonalizationEngineEvents] =
    useState<readonly PersonalizationEngineEvent[]>([]);
  const [personalizationIndexCount, setPersonalizationIndexCount] = useState(0);
  const [personalizationEngineMessage, setPersonalizationEngineMessage] =
    useState<string | null>(null);
  const [personalizedContextPackage, setPersonalizedContextPackage] =
    useState<PersonalizedContextPackage | null>(null);
  const [personalizationRuntimeEvents, setPersonalizationRuntimeEvents] =
    useState<readonly PersonalizationRuntimeEvent[]>([]);
  const [
    personalizationRuntimeIndexCount,
    setPersonalizationRuntimeIndexCount,
  ] = useState(0);
  const [personalizationRuntimeMessage, setPersonalizationRuntimeMessage] =
    useState<string | null>(null);
  const [decisionExecutionPackage, setDecisionExecutionPackage] =
    useState<DecisionExecutionPackage | null>(null);
  const [decisionOrchestratorEvents, setDecisionOrchestratorEvents] = useState<
    readonly DecisionOrchestratorEvent[]
  >([]);
  const [
    decisionOrchestratorIndexCount,
    setDecisionOrchestratorIndexCount,
  ] = useState(0);
  const [decisionOrchestratorMessage, setDecisionOrchestratorMessage] =
    useState<string | null>(null);
  const [runtimeExecutionPackage, setRuntimeExecutionPackage] =
    useState<RuntimeExecutionPackage | null>(null);
  const [experienceRuntimeEvents, setExperienceRuntimeEvents] = useState<
    readonly ExperienceRuntimeEvent[]
  >([]);
  const [experienceRuntimeIndexCount, setExperienceRuntimeIndexCount] =
    useState(0);
  const [experienceRuntimeMessage, setExperienceRuntimeMessage] = useState<
    string | null
  >(null);
  const [experienceModulePackage, setExperienceModulePackage] =
    useState<ExperienceModulePackage | null>(null);
  const [moduleCoordinatorEvents, setModuleCoordinatorEvents] = useState<
    readonly ModuleCoordinatorEvent[]
  >([]);
  const [moduleCoordinatorIndexCount, setModuleCoordinatorIndexCount] =
    useState(0);
  const [moduleCoordinatorMessage, setModuleCoordinatorMessage] = useState<
    string | null
  >(null);
  const [experienceStatePackage, setExperienceStatePackage] =
    useState<ExperienceStatePackage | null>(null);
  const [experienceStateEvents, setExperienceStateEvents] = useState<
    readonly ExperienceStateEvent[]
  >([]);
  const [experienceStateIndexCount, setExperienceStateIndexCount] =
    useState(0);
  const [experienceStateMessage, setExperienceStateMessage] = useState<
    string | null
  >(null);
  const [observabilityPackage, setObservabilityPackage] =
    useState<RuntimeObservabilityPackage | null>(null);
  const [observabilityEvents, setObservabilityEvents] = useState<
    readonly RuntimeObservabilityEvent[]
  >([]);
  const [observabilityIndexCount, setObservabilityIndexCount] = useState(0);
  const [observabilityMessage, setObservabilityMessage] = useState<
    string | null
  >(null);
  const [runtimeHealthPackage, setRuntimeHealthPackage] =
    useState<RuntimeHealthPackage | null>(null);
  const [runtimeHealthEvents, setRuntimeHealthEvents] = useState<
    readonly RuntimeHealthEvent[]
  >([]);
  const [runtimeHealthIndexCount, setRuntimeHealthIndexCount] = useState(0);
  const [runtimeHealthMessage, setRuntimeHealthMessage] = useState<
    string | null
  >(null);
  const [runtimeAuditPackage, setRuntimeAuditPackage] =
    useState<RuntimeAuditPackage | null>(null);
  const [runtimeAuditEvents, setRuntimeAuditEvents] = useState<
    readonly RuntimeAuditEvent[]
  >([]);
  const [runtimeAuditIndexCount, setRuntimeAuditIndexCount] = useState(0);
  const [runtimeAuditMessage, setRuntimeAuditMessage] = useState<
    string | null
  >(null);
  const [runtimeGovernancePackage, setRuntimeGovernancePackage] =
    useState<RuntimeGovernancePackage | null>(null);
  const [runtimeGovernanceEvents, setRuntimeGovernanceEvents] = useState<
    readonly RuntimeGovernanceEvent[]
  >([]);
  const [runtimeGovernanceIndexCount, setRuntimeGovernanceIndexCount] =
    useState(0);
  const [runtimeGovernanceMessage, setRuntimeGovernanceMessage] = useState<
    string | null
  >(null);
  const [runtimePolicyPackage, setRuntimePolicyPackage] =
    useState<RuntimePolicyPackage | null>(null);
  const [runtimePolicyEvents, setRuntimePolicyEvents] = useState<
    readonly RuntimePolicyEvent[]
  >([]);
  const [runtimePolicyIndexCount, setRuntimePolicyIndexCount] = useState(0);
  const [runtimePolicyMessage, setRuntimePolicyMessage] = useState<
    string | null
  >(null);
  const [runtimeEnforcementPackage, setRuntimeEnforcementPackage] =
    useState<RuntimeEnforcementPackage | null>(null);
  const [runtimeEnforcementEvents, setRuntimeEnforcementEvents] = useState<
    readonly RuntimeEnforcementEvent[]
  >([]);
  const [runtimeEnforcementIndexCount, setRuntimeEnforcementIndexCount] =
    useState(0);
  const [runtimeEnforcementMessage, setRuntimeEnforcementMessage] = useState<
    string | null
  >(null);
  const [runtimeResiliencePackage, setRuntimeResiliencePackage] =
    useState<RuntimeResiliencePackage | null>(null);
  const [runtimeResilienceEvents, setRuntimeResilienceEvents] = useState<
    readonly RuntimeResilienceEvent[]
  >([]);
  const [runtimeResilienceIndexCount, setRuntimeResilienceIndexCount] =
    useState(0);
  const [runtimeResilienceMessage, setRuntimeResilienceMessage] = useState<
    string | null
  >(null);
  const [runtimeRecoveryPackage, setRuntimeRecoveryPackage] =
    useState<RuntimeRecoveryPackage | null>(null);
  const [runtimeRecoveryEvents, setRuntimeRecoveryEvents] = useState<
    readonly RuntimeRecoveryEvent[]
  >([]);
  const [runtimeRecoveryIndexCount, setRuntimeRecoveryIndexCount] =
    useState(0);
  const [runtimeRecoveryMessage, setRuntimeRecoveryMessage] = useState<
    string | null
  >(null);
  const [runtimeRecoveryExecutionPackage, setRuntimeRecoveryExecutionPackage] =
    useState<RuntimeRecoveryExecutionPackage | null>(null);
  const [
    runtimeRecoveryExecutionEvents,
    setRuntimeRecoveryExecutionEvents,
  ] = useState<readonly RuntimeRecoveryExecutionEvent[]>([]);
  const [
    runtimeRecoveryExecutionIndexCount,
    setRuntimeRecoveryExecutionIndexCount,
  ] = useState(0);
  const [
    runtimeRecoveryExecutionMessage,
    setRuntimeRecoveryExecutionMessage,
  ] = useState<string | null>(null);
  const [
    runtimeRecoveryCoordinatorPackage,
    setRuntimeRecoveryCoordinatorPackage,
  ] = useState<RuntimeRecoverySummaryPackage | null>(null);
  const [
    runtimeRecoveryCoordinatorEvents,
    setRuntimeRecoveryCoordinatorEvents,
  ] = useState<readonly RuntimeRecoveryCoordinatorEvent[]>([]);
  const [
    runtimeRecoveryCoordinatorIndexCount,
    setRuntimeRecoveryCoordinatorIndexCount,
  ] = useState(0);
  const [
    runtimeRecoveryCoordinatorMessage,
    setRuntimeRecoveryCoordinatorMessage,
  ] = useState<string | null>(null);
  const [
    runtimeRecoveryReportingPackage,
    setRuntimeRecoveryReportingPackage,
  ] = useState<RuntimeRecoveryReportPackage | null>(null);
  const [
    runtimeRecoveryReportingEvents,
    setRuntimeRecoveryReportingEvents,
  ] = useState<readonly RuntimeRecoveryReportingEvent[]>([]);
  const [
    runtimeRecoveryReportingIndexCount,
    setRuntimeRecoveryReportingIndexCount,
  ] = useState(0);
  const [
    runtimeRecoveryReportingMessage,
    setRuntimeRecoveryReportingMessage,
  ] = useState<string | null>(null);
  const [runtimeOperationsPackage, setRuntimeOperationsPackage] =
    useState<RuntimeOperationsPackage | null>(null);
  const [runtimeOperationsEvents, setRuntimeOperationsEvents] = useState<
    readonly RuntimeOperationsEvent[]
  >([]);
  const [runtimeOperationsIndexCount, setRuntimeOperationsIndexCount] =
    useState(0);
  const [runtimeOperationsMessage, setRuntimeOperationsMessage] = useState<
    string | null
  >(null);
  const [runtimeIntegrationPackage, setRuntimeIntegrationPackage] =
    useState<RuntimeIntegrationPackage | null>(null);
  const [runtimeIntegrationEvents, setRuntimeIntegrationEvents] = useState<
    readonly RuntimeIntegrationEvent[]
  >([]);
  const [runtimeIntegrationIndexCount, setRuntimeIntegrationIndexCount] =
    useState(0);
  const [runtimeIntegrationMessage, setRuntimeIntegrationMessage] = useState<
    string | null
  >(null);
  const [runtimeRegistryPackage, setRuntimeRegistryPackage] =
    useState<RuntimeRegistryPackage | null>(null);
  const [runtimeRegistryEvents, setRuntimeRegistryEvents] = useState<
    readonly RuntimeRegistryEvent[]
  >([]);
  const [runtimeRegistryIndexCount, setRuntimeRegistryIndexCount] =
    useState(0);
  const [runtimeRegistryMessage, setRuntimeRegistryMessage] = useState<
    string | null
  >(null);
  const [runtimeManifestPackage, setRuntimeManifestPackage] =
    useState<RuntimeManifestPackage | null>(null);
  const [runtimeManifestEvents, setRuntimeManifestEvents] = useState<
    readonly RuntimeManifestEvent[]
  >([]);
  const [runtimeManifestIndexCount, setRuntimeManifestIndexCount] =
    useState(0);
  const [runtimeManifestMessage, setRuntimeManifestMessage] = useState<
    string | null
  >(null);
  const [runtimeApiPackage, setRuntimeApiPackage] =
    useState<RuntimeApiPackage | null>(null);
  const [runtimeApiEvents, setRuntimeApiEvents] = useState<
    readonly RuntimeApiEvent[]
  >([]);
  const [runtimeApiIndexCount, setRuntimeApiIndexCount] = useState(0);
  const [runtimeApiMessage, setRuntimeApiMessage] = useState<string | null>(
    null,
  );
  const [runtimeCompatibilityPackage, setRuntimeCompatibilityPackage] =
    useState<RuntimeCompatibilityPackage | null>(null);
  const [runtimeCompatibilityEvents, setRuntimeCompatibilityEvents] = useState<
    readonly RuntimeCompatibilityEvent[]
  >([]);
  const [
    runtimeCompatibilityIndexCount,
    setRuntimeCompatibilityIndexCount,
  ] = useState(0);
  const [runtimeCompatibilityMessage, setRuntimeCompatibilityMessage] =
    useState<string | null>(null);
  const [runtimeContractPackage, setRuntimeContractPackage] =
    useState<RuntimeContractPackage | null>(null);
  const [runtimeContractEvents, setRuntimeContractEvents] = useState<
    readonly RuntimeContractEvent[]
  >([]);
  const [runtimeContractIndexCount, setRuntimeContractIndexCount] =
    useState(0);
  const [runtimeContractMessage, setRuntimeContractMessage] = useState<
    string | null
  >(null);
  const [runtimeExtensionPackage, setRuntimeExtensionPackage] =
    useState<RuntimeExtensionPackage | null>(null);
  const [runtimeExtensionEvents, setRuntimeExtensionEvents] = useState<
    readonly RuntimeExtensionEvent[]
  >([]);
  const [runtimeExtensionIndexCount, setRuntimeExtensionIndexCount] =
    useState(0);
  const [runtimeExtensionMessage, setRuntimeExtensionMessage] = useState<
    string | null
  >(null);
  const [objectPublicationPackage, setObjectPublicationPackage] =
    useState<PublicationPackage | null>(null);
  const [objectPublicationEvents, setObjectPublicationEvents] = useState<
    readonly ObjectPublicationEvent[]
  >([]);
  const [objectPublicationIndexCount, setObjectPublicationIndexCount] =
    useState(0);
  const [objectPublicationMessage, setObjectPublicationMessage] = useState<
    string | null
  >(null);
  const [publishedObjectPackage, setPublishedObjectPackage] =
    useState<PublishedObjectPackage | null>(null);
  const [publishedObjectEvents, setPublishedObjectEvents] = useState<
    readonly PublishedObjectEvent[]
  >([]);
  const [publishedObjectIndexCount, setPublishedObjectIndexCount] =
    useState(0);
  const [publishedObjectMessage, setPublishedObjectMessage] = useState<
    string | null
  >(null);
  const [platformPublicationPackage, setPlatformPublicationPackage] =
    useState<PlatformPublicationPackage | null>(null);
  const [platformPublicationEvents, setPlatformPublicationEvents] = useState<
    readonly PlatformPublicationEvent[]
  >([]);
  const [platformPublicationIndexCount, setPlatformPublicationIndexCount] =
    useState(0);
  const [platformPublicationMessage, setPlatformPublicationMessage] =
    useState<string | null>(null);
  const [clientPublicationPackage, setClientPublicationPackage] =
    useState<ClientPublicationPackage | null>(null);
  const [clientPublicationEvents, setClientPublicationEvents] = useState<
    readonly ClientPublicationEvent[]
  >([]);
  const [clientPublicationIndexCount, setClientPublicationIndexCount] =
    useState(0);
  const [clientPublicationMessage, setClientPublicationMessage] = useState<
    string | null
  >(null);
  const [publicationReadinessPackage, setPublicationReadinessPackage] =
    useState<PublicationReadinessPackage | null>(null);
  const [publicationReadinessEvents, setPublicationReadinessEvents] = useState<
    readonly PublicationReadinessEvent[]
  >([]);
  const [publicationReadinessIndexCount, setPublicationReadinessIndexCount] =
    useState(0);
  const [publicationReadinessMessage, setPublicationReadinessMessage] =
    useState<string | null>(null);
  const [runtimeBootstrapPackage, setRuntimeBootstrapPackage] =
    useState<RuntimeBootstrapPackage | null>(null);
  const [runtimeBootstrapEvents, setRuntimeBootstrapEvents] = useState<
    readonly RuntimeBootstrapEvent[]
  >([]);
  const [runtimeBootstrapIndexCount, setRuntimeBootstrapIndexCount] =
    useState(0);
  const [runtimeBootstrapMessage, setRuntimeBootstrapMessage] =
    useState<string | null>(null);
  const [artifactVersionPackage, setArtifactVersionPackage] =
    useState<ArtifactVersionPackage | null>(null);
  const [artifactVersionEvents, setArtifactVersionEvents] = useState<
    readonly ArtifactVersionEvent[]
  >([]);
  const [artifactVersionIndexCount, setArtifactVersionIndexCount] = useState(0);
  const [artifactVersionMessage, setArtifactVersionMessage] = useState<
    string | null
  >(null);
  const [artifactDependencyPackage, setArtifactDependencyPackage] =
    useState<ArtifactDependencyPackage | null>(null);
  const [artifactDependencyEvents, setArtifactDependencyEvents] = useState<
    readonly ArtifactDependencyEvent[]
  >([]);
  const [artifactDependencyIndexCount, setArtifactDependencyIndexCount] =
    useState(0);
  const [artifactDependencyMessage, setArtifactDependencyMessage] = useState<
    string | null
  >(null);
  const [publicationPlanPackage, setPublicationPlanPackage] =
    useState<PublicationPlanPackage | null>(null);
  const [publicationPlanEvents, setPublicationPlanEvents] = useState<
    readonly PublicationPlanEvent[]
  >([]);
  const [publicationPlanIndexCount, setPublicationPlanIndexCount] = useState(0);
  const [publicationPlanMessage, setPublicationPlanMessage] = useState<
    string | null
  >(null);
  const [publicationExecutionPackage, setPublicationExecutionPackage] =
    useState<PublicationExecutionPackage | null>(null);
  const [publicationExecutionEvents, setPublicationExecutionEvents] = useState<
    readonly PublicationExecutionEvent[]
  >([]);
  const [publicationExecutionIndexCount, setPublicationExecutionIndexCount] =
    useState(0);
  const [publicationExecutionMessage, setPublicationExecutionMessage] =
    useState<string | null>(null);
  const [artifactExportPackage, setArtifactExportPackage] =
    useState<ArtifactExportPackage | null>(null);
  const [artifactExportEvents, setArtifactExportEvents] = useState<
    readonly ArtifactExportEvent[]
  >([]);
  const [artifactExportIndexCount, setArtifactExportIndexCount] = useState(0);
  const [artifactExportMessage, setArtifactExportMessage] =
    useState<string | null>(null);
  const [exportSchemaPackage, setExportSchemaPackage] =
    useState<ExportSchemaPackage | null>(null);
  const [exportSchemaEvents, setExportSchemaEvents] = useState<
    readonly ExportSchemaEvent[]
  >([]);
  const [exportSchemaIndexCount, setExportSchemaIndexCount] = useState(0);
  const [exportSchemaMessage, setExportSchemaMessage] =
    useState<string | null>(null);
  const [exportCompatibilityPackage, setExportCompatibilityPackage] =
    useState<ExportCompatibilityPackage | null>(null);
  const [exportCompatibilityEvents, setExportCompatibilityEvents] = useState<
    readonly ExportCompatibilityEvent[]
  >([]);
  const [exportCompatibilityIndexCount, setExportCompatibilityIndexCount] = useState(0);
  const [exportCompatibilityMessage, setExportCompatibilityMessage] =
    useState<string | null>(null);
  const [exportCapabilityPackage, setExportCapabilityPackage] =
    useState<ExportCapabilityPackage | null>(null);
  const [exportCapabilityEvents, setExportCapabilityEvents] = useState<
    readonly ExportCapabilityEvent[]
  >([]);
  const [exportCapabilityIndexCount, setExportCapabilityIndexCount] =
    useState(0);
  const [exportCapabilityMessage, setExportCapabilityMessage] =
    useState<string | null>(null);
  const [exportPolicyPackage, setExportPolicyPackage] =
    useState<ExportPolicyPackage | null>(null);
  const [exportPolicyEvents, setExportPolicyEvents] = useState<
    readonly ExportPolicyEvent[]
  >([]);
  const [exportPolicyIndexCount, setExportPolicyIndexCount] = useState(0);
  const [exportPolicyMessage, setExportPolicyMessage] =
    useState<string | null>(null);
  const [exportCertificationPackage, setExportCertificationPackage] =
    useState<ExportCertificationPackage | null>(null);
  const [exportCertificationEvents, setExportCertificationEvents] = useState<
    readonly ExportCertificationEvent[]
  >([]);
  const [exportCertificationIndexCount, setExportCertificationIndexCount] =
    useState(0);
  const [exportCertificationMessage, setExportCertificationMessage] =
    useState<string | null>(null);
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
      setEvaluationResult(null);
      setEvaluationEvents([]);
      setEvaluationValidationMessage(null);
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
      setEvaluationResult(null);
      setEvaluationEvents([]);
      setEvaluationValidationMessage(null);
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
    setEvaluationResult(null);
    setEvaluationEvents([]);
    setEvaluationValidationMessage(null);
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
    setWorkspacePackage(services.workspaceService.getPackage());
    setWorkspaceProjects(services.workspaceService.listProjects());
    setWorkspaceEvents(services.workspaceService.getEvents());
    setWorkspaceIndexCount(services.workspaceService.getIndex().length);
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
    evaluationResult,
    evaluationEvents,
    evaluationValidationMessage,
    decisionStory,
    storyEvents,
    storyMessage,
    runtimeSession,
    sessionEvents,
    sessionMessage,
    behaviorEvaluation,
    behaviorSignals,
    behaviorEvents,
    behaviorMessage,
    analyticsSnapshot,
    analyticsEvents,
    analyticsMessage,
    learningRecord,
    learningValidation,
    learningImportReport,
    learningExportPayload,
    learningPipelineEvents,
    learningPipelineMessage,
    learningRecordsPackage,
    learningPackageManagerEvents,
    learningPackageIndexCount,
    learningPackageManagerMessage,
    patternCollection,
    patternExtractionEvents,
    patternIndexCount,
    patternExtractionMessage,
    patternCatalog,
    patternIntelligenceEvents,
    patternIntelligenceIndexCount,
    patternIntelligenceMessage,
    heuristicCatalog,
    heuristicEngineEvents,
    heuristicIndexCount,
    heuristicEngineMessage,
    synthesizedKnowledgeBase,
    knowledgeSynthesisEvents,
    knowledgeSynthesisIndexCount,
    knowledgeSynthesisMessage,
    gatewayAIContextPackage,
    aiDecisionGatewayEvents,
    aiDecisionGatewayIndexCount,
    aiDecisionGatewayMessage,
    personalizationPackage,
    personalizationEngineEvents,
    personalizationIndexCount,
    personalizationEngineMessage,
    personalizedContextPackage,
    personalizationRuntimeEvents,
    personalizationRuntimeIndexCount,
    personalizationRuntimeMessage,
    decisionExecutionPackage,
    decisionOrchestratorEvents,
    decisionOrchestratorIndexCount,
    decisionOrchestratorMessage,
    runtimeExecutionPackage,
    experienceRuntimeEvents,
    experienceRuntimeIndexCount,
    experienceRuntimeMessage,
    experienceModulePackage,
    moduleCoordinatorEvents,
    moduleCoordinatorIndexCount,
    moduleCoordinatorMessage,
    experienceStatePackage,
    experienceStateEvents,
    experienceStateIndexCount,
    experienceStateMessage,
    observabilityPackage,
    observabilityEvents,
    observabilityIndexCount,
    observabilityMessage,
    runtimeHealthPackage,
    runtimeHealthEvents,
    runtimeHealthIndexCount,
    runtimeHealthMessage,
    runtimeAuditPackage,
    runtimeAuditEvents,
    runtimeAuditIndexCount,
    runtimeAuditMessage,
    runtimeGovernancePackage,
    runtimeGovernanceEvents,
    runtimeGovernanceIndexCount,
    runtimeGovernanceMessage,
    runtimePolicyPackage,
    runtimePolicyEvents,
    runtimePolicyIndexCount,
    runtimePolicyMessage,
    runtimeEnforcementPackage,
    runtimeEnforcementEvents,
    runtimeEnforcementIndexCount,
    runtimeEnforcementMessage,
    runtimeResiliencePackage,
    runtimeResilienceEvents,
    runtimeResilienceIndexCount,
    runtimeResilienceMessage,
    runtimeRecoveryPackage,
    runtimeRecoveryEvents,
    runtimeRecoveryIndexCount,
    runtimeRecoveryMessage,
    runtimeRecoveryExecutionPackage,
    runtimeRecoveryExecutionEvents,
    runtimeRecoveryExecutionIndexCount,
    runtimeRecoveryExecutionMessage,
    runtimeRecoveryCoordinatorPackage,
    runtimeRecoveryCoordinatorEvents,
    runtimeRecoveryCoordinatorIndexCount,
    runtimeRecoveryCoordinatorMessage,
    runtimeRecoveryReportingPackage,
    runtimeRecoveryReportingEvents,
    runtimeRecoveryReportingIndexCount,
    runtimeRecoveryReportingMessage,
    runtimeOperationsPackage,
    runtimeOperationsEvents,
    runtimeOperationsIndexCount,
    runtimeOperationsMessage,
    runtimeIntegrationPackage,
    runtimeIntegrationEvents,
    runtimeIntegrationIndexCount,
    runtimeIntegrationMessage,
    runtimeRegistryPackage,
    runtimeRegistryEvents,
    runtimeRegistryIndexCount,
    runtimeRegistryMessage,
    runtimeManifestPackage,
    runtimeManifestEvents,
    runtimeManifestIndexCount,
    runtimeManifestMessage,
    runtimeApiPackage,
    runtimeApiEvents,
    runtimeApiIndexCount,
    runtimeApiMessage,
    runtimeCompatibilityPackage,
    runtimeCompatibilityEvents,
    runtimeCompatibilityIndexCount,
    runtimeCompatibilityMessage,
    runtimeContractPackage,
    runtimeContractEvents,
    runtimeContractIndexCount,
    runtimeContractMessage,
    runtimeExtensionPackage,
    runtimeExtensionEvents,
    runtimeExtensionIndexCount,
    runtimeExtensionMessage,
    objectPublicationPackage,
    objectPublicationEvents,
    objectPublicationIndexCount,
    objectPublicationMessage,
    publishedObjectPackage,
    publishedObjectEvents,
    publishedObjectIndexCount,
    publishedObjectMessage,
    platformPublicationPackage,
    platformPublicationEvents,
    platformPublicationIndexCount,
    platformPublicationMessage,
    clientPublicationPackage,
    clientPublicationEvents,
    clientPublicationIndexCount,
    clientPublicationMessage,
    publicationReadinessPackage,
    publicationReadinessEvents,
    publicationReadinessIndexCount,
    publicationReadinessMessage,
    runtimeBootstrapPackage,
    runtimeBootstrapEvents,
    runtimeBootstrapIndexCount,
    runtimeBootstrapMessage,
    artifactVersionPackage,
    artifactVersionEvents,
    artifactVersionIndexCount,
    artifactVersionMessage,
    artifactDependencyPackage,
    artifactDependencyEvents,
    artifactDependencyIndexCount,
    artifactDependencyMessage,
    publicationPlanPackage,
    publicationPlanEvents,
    publicationPlanIndexCount,
    publicationPlanMessage,
    publicationExecutionPackage,
    publicationExecutionEvents,
    publicationExecutionIndexCount,
    publicationExecutionMessage,
    artifactExportPackage,
    artifactExportEvents,
    artifactExportIndexCount,
    artifactExportMessage,
    exportSchemaPackage,
    exportSchemaEvents,
    exportSchemaIndexCount,
    exportSchemaMessage,
    exportCompatibilityPackage,
    exportCompatibilityEvents,
    exportCompatibilityIndexCount,
    exportCompatibilityMessage,
    exportCapabilityPackage,
    exportCapabilityEvents,
    exportCapabilityIndexCount,
    exportCapabilityMessage,
    exportPolicyPackage,
    exportPolicyEvents,
    exportPolicyIndexCount,
    exportPolicyMessage,
    exportCertificationPackage,
    exportCertificationEvents,
    exportCertificationIndexCount,
    exportCertificationMessage,
    workspacePackage,
    workspaceProjects,
    workspaceEvents,
    workspaceIndexCount,
    workspaceMessage,
    assetManagerPackage,
    managedAssets,
    assetManagerEvents,
    assetManagerIndexCount,
    assetManagerMessage,
    objectMetadataPackage,
    objectMetadataDocument,
    objectMetadataEvents,
    objectMetadataIndexCount,
    objectMetadataMessage,
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
      services.workspaceService.openProject(projectId);
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
      setWorkspaceMessage('Project opened.');
      setActiveSection('overview');
      const managed =
        services.assetManagerApi.listPackages().find(
          (item) => item.metadata.projectId === projectId,
        ) ?? null;
      setAssetManagerPackage(managed);
      setManagedAssets(services.assetManagerApi.listProjectAssets(projectId));
      setAssetManagerEvents(services.assetManagerApi.listEvents());
      setAssetManagerIndexCount(services.assetManagerApi.listIndex().length);
      const metadataPkg =
        services.metadataApi.listPackages().find(
          (item) => item.metadata.projectId === projectId,
        ) ?? null;
      setObjectMetadataPackage(metadataPkg);
      setObjectMetadataDocument(metadataPkg?.objectMetadata ?? null);
      setObjectMetadataEvents(services.metadataApi.listEvents());
      setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
      syncFromServices(projectId);
    },
    createProject(): void {
      const count = services.workspaceService.listProjects().length + 1;
      const created = services.workspaceService.createProject({
        name: `Novy projekt ${count}`,
      });
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
      setWorkspaceMessage('Project created.');
      setActiveSection('overview');
      syncFromServices(created.id);
    },
    duplicateProject(projectId: string): void {
      const duplicated = services.workspaceService.duplicateProject(projectId);
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
      setWorkspaceMessage('Project duplicated.');
      setActiveSection('overview');
      syncFromServices(duplicated.id);
    },
    archiveProject(projectId: string): void {
      services.workspaceService.archiveProject(projectId);
      setPipeline(services.workspaceService.getPipelineSnapshot());
      setWorkspaceMessage('Project archived.');
      setActiveSection('projects');
      syncFromServices();
    },
    createManagedAsset(): void {
      const projectId =
        services.workspaceService.getWorkspace().activeProjectId ??
        'harmony-124';
      const samples = [
        {
          name: 'Facade.jpg',
          type: 'IMAGE' as const,
          location: {
            provider: 'LOCAL' as const,
            uri: `file:///assets/${projectId}/facade.jpg`,
            key: 'facade.jpg',
          },
          mimeType: 'image/jpeg',
          size: 180_000,
          previewHint: 'IMG',
        },
        {
          name: 'Walkthrough.mp4',
          type: 'VIDEO' as const,
          location: {
            provider: 'S3' as const,
            uri: `s3://conis-media/${projectId}/walkthrough.mp4`,
            bucket: 'conis-media',
            key: `${projectId}/walkthrough.mp4`,
            region: 'eu-central-1',
          },
          mimeType: 'video/mp4',
          size: 5_200_000,
          previewHint: 'VID',
        },
        {
          name: 'Brochure.pdf',
          type: 'DOCUMENT' as const,
          location: {
            provider: 'CLOUDINARY' as const,
            uri: `cloudinary://demo/${projectId}/brochure`,
            key: `${projectId}/brochure`,
            publicId: `${projectId}/brochure`,
          },
          mimeType: 'application/pdf',
          size: 420_000,
          previewHint: 'PDF',
        },
        {
          name: 'Floorplan.svg',
          type: 'FLOORPLAN' as const,
          location: {
            provider: 'LOCAL' as const,
            uri: `file:///assets/${projectId}/floorplan.svg`,
            key: 'floorplan.svg',
          },
          mimeType: 'image/svg+xml',
          size: 64_000,
          previewHint: 'PLAN',
        },
        {
          name: 'Exterior.glb',
          type: 'MODEL_3D' as const,
          location: {
            provider: 'OTHER' as const,
            uri: `asset://${projectId}/exterior.glb`,
            key: 'exterior.glb',
          },
          mimeType: 'model/gltf-binary',
          size: 2_400_000,
          previewHint: '3D',
        },
        {
          name: 'Tour URL',
          type: 'URL' as const,
          location: {
            provider: 'URL' as const,
            uri: `https://example.com/tours/${projectId}`,
          },
          mimeType: 'text/uri-list',
          size: 0,
          previewHint: 'URL',
        },
      ];
      const sample =
        samples[
          services.assetManagerApi.listProjectAssets(projectId).length %
            samples.length
        ]!;
      try {
        const asset = services.assetManagerApi.createAsset(
          assetManagerPackage?.id ?? null,
          {
            projectId,
            name: sample.name,
            type: sample.type,
            location: sample.location,
            mimeType: sample.mimeType,
            size: sample.size,
            previewHint: sample.previewHint,
          },
          { projectId, title: `Assets · ${projectId}` },
        );
        const pkg =
          services.assetManagerApi.listPackages().find(
            (item) => item.metadata.projectId === projectId,
          ) ??
          services.assetManagerApi.getPackage(assetManagerPackage?.id ?? '') ??
          null;
        setAssetManagerPackage(pkg);
        setManagedAssets(
          services.assetManagerApi.listProjectAssets(projectId),
        );
        setAssetManagerEvents(services.assetManagerApi.listEvents());
        setAssetManagerIndexCount(services.assetManagerApi.listIndex().length);
        setAssetManagerMessage(`Asset created: ${asset.name}.`);
      } catch (err) {
        setAssetManagerMessage(
          `Create failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    renameManagedAsset(assetId: string): void {
      if (assetManagerPackage === null) {
        setAssetManagerMessage('Create an asset first.');
        return;
      }
      const asset = services.assetManagerApi.findAsset(assetId);
      if (asset === null) {
        setAssetManagerMessage('Asset not found.');
        return;
      }
      const renamed = services.assetManagerApi.updateAsset(
        assetManagerPackage.id,
        assetId,
        {
          name: `${asset.name.replace(/\s+Copy.*$/, '')} Copy`,
          label: `${asset.metadata.label} Copy`,
        },
      );
      setAssetManagerPackage(
        services.assetManagerApi.getPackage(assetManagerPackage.id),
      );
      setManagedAssets(
        services.assetManagerApi.listProjectAssets(asset.projectId),
      );
      setAssetManagerEvents(services.assetManagerApi.listEvents());
      setAssetManagerIndexCount(services.assetManagerApi.listIndex().length);
      setAssetManagerMessage(`Renamed to ${renamed.name}.`);
    },
    archiveManagedAsset(assetId: string): void {
      if (assetManagerPackage === null) return;
      const asset = services.assetManagerApi.findAsset(assetId);
      if (asset === null) return;
      services.assetManagerApi.archiveAsset(assetManagerPackage.id, assetId);
      setAssetManagerPackage(
        services.assetManagerApi.getPackage(assetManagerPackage.id),
      );
      setManagedAssets(
        services.assetManagerApi.listProjectAssets(asset.projectId),
      );
      setAssetManagerEvents(services.assetManagerApi.listEvents());
      setAssetManagerIndexCount(services.assetManagerApi.listIndex().length);
      setAssetManagerMessage(`Archived ${asset.name}.`);
    },
    restoreManagedAsset(assetId: string): void {
      if (assetManagerPackage === null) return;
      const asset = services.assetManagerApi.findAsset(assetId);
      if (asset === null) return;
      services.assetManagerApi.restoreAsset(assetManagerPackage.id, assetId);
      setAssetManagerPackage(
        services.assetManagerApi.getPackage(assetManagerPackage.id),
      );
      setManagedAssets(
        services.assetManagerApi.listProjectAssets(asset.projectId),
      );
      setAssetManagerEvents(services.assetManagerApi.listEvents());
      setAssetManagerIndexCount(services.assetManagerApi.listIndex().length);
      setAssetManagerMessage(`Restored ${asset.name}.`);
    },
    createObjectMetadata(): void {
      const projectId =
        services.workspaceService.getWorkspace().activeProjectId ??
        'harmony-124';
      const projectName =
        services.workspaceService.getActiveProject()?.name ?? projectId;
      try {
        const document = services.metadataApi.createMetadata(
          objectMetadataPackage?.id ?? null,
          {
            projectId,
            title: projectName,
            slug: projectId,
            summary: `Overview of ${projectName}`,
            description: `Metadata for ${projectName}`,
            category: 'house',
            language: 'cs',
            tags: ['builder'],
            seo: {
              title: `${projectName} | Builder`,
              description: `Discover ${projectName}`,
              keywords: [projectName, 'modular'],
              canonicalUrl: `https://example.com/${projectId}`,
              socialImageAssetId: null,
            },
            attributes: [
              {
                key: 'usable_area',
                value: '124',
                type: 'number',
                group: 'specs',
                order: 1,
              },
            ],
          },
          { projectId, title: `Metadata · ${projectId}` },
        );
        const pkg =
          services.metadataApi.listPackages().find(
            (item) => item.metadata.projectId === projectId,
          ) ?? null;
        setObjectMetadataPackage(pkg);
        setObjectMetadataDocument(document);
        setObjectMetadataEvents(services.metadataApi.listEvents());
        setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
        setObjectMetadataMessage(`Metadata created: ${document.slug}.`);
      } catch (err) {
        setObjectMetadataMessage(
          `Create failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    updateObjectMetadataGeneral(patch): void {
      if (objectMetadataPackage === null) {
        setObjectMetadataMessage('Create metadata first.');
        return;
      }
      try {
        const document = services.metadataApi.updateMetadata(
          objectMetadataPackage.id,
          patch,
        );
        setObjectMetadataPackage(
          services.metadataApi.getPackage(objectMetadataPackage.id),
        );
        setObjectMetadataDocument(document);
        setObjectMetadataEvents(services.metadataApi.listEvents());
        setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
        setObjectMetadataMessage('General metadata saved.');
      } catch (err) {
        setObjectMetadataMessage(
          `Update failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    updateObjectMetadataSeo(patch): void {
      if (objectMetadataPackage === null) {
        setObjectMetadataMessage('Create metadata first.');
        return;
      }
      try {
        const document = services.metadataApi.updateMetadata(
          objectMetadataPackage.id,
          {
            seo: {
              title: patch.title,
              description: patch.description,
              keywords: patch.keywords
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item.length > 0),
              canonicalUrl: patch.canonicalUrl,
              socialImageAssetId: patch.socialImageAssetId,
            },
          },
        );
        setObjectMetadataPackage(
          services.metadataApi.getPackage(objectMetadataPackage.id),
        );
        setObjectMetadataDocument(document);
        setObjectMetadataEvents(services.metadataApi.listEvents());
        setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
        setObjectMetadataMessage('SEO metadata saved.');
      } catch (err) {
        setObjectMetadataMessage(
          `SEO update failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    attachObjectMetadataAsset(assetId: string): void {
      if (objectMetadataPackage === null) {
        setObjectMetadataMessage('Create metadata first.');
        return;
      }
      try {
        const document = services.metadataApi.attachAssetReference(
          objectMetadataPackage.id,
          assetId,
        );
        setObjectMetadataPackage(
          services.metadataApi.getPackage(objectMetadataPackage.id),
        );
        setObjectMetadataDocument(document);
        setObjectMetadataEvents(services.metadataApi.listEvents());
        setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
        setObjectMetadataMessage(`Asset attached: ${assetId}.`);
      } catch (err) {
        setObjectMetadataMessage(
          `Attach failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    detachObjectMetadataAsset(assetId: string): void {
      if (objectMetadataPackage === null) return;
      try {
        const document = services.metadataApi.detachAssetReference(
          objectMetadataPackage.id,
          assetId,
        );
        setObjectMetadataPackage(
          services.metadataApi.getPackage(objectMetadataPackage.id),
        );
        setObjectMetadataDocument(document);
        setObjectMetadataEvents(services.metadataApi.listEvents());
        setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
        setObjectMetadataMessage(`Asset detached: ${assetId}.`);
      } catch (err) {
        setObjectMetadataMessage(
          `Detach failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    openObjectMetadataAsset(assetId: string): void {
      const asset = services.assetManagerApi.findAsset(assetId);
      setActiveSection('assets');
      setObjectMetadataMessage(
        asset === null
          ? `Asset reference ${assetId} — open Assets to inspect.`
          : `Opened asset ${asset.name} in Assets.`,
      );
      if (asset !== null) {
        setAssetManagerMessage(`Selected from Metadata: ${asset.name}.`);
      }
    },
    addObjectMetadataAttribute(attribute): void {
      if (objectMetadataPackage === null) return;
      try {
        const document = services.metadataApi.addAttribute(
          objectMetadataPackage.id,
          attribute,
        );
        setObjectMetadataPackage(
          services.metadataApi.getPackage(objectMetadataPackage.id),
        );
        setObjectMetadataDocument(document);
        setObjectMetadataEvents(services.metadataApi.listEvents());
        setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
        setObjectMetadataMessage(`Attribute added: ${attribute.key}.`);
      } catch (err) {
        setObjectMetadataMessage(
          `Attribute failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    editObjectMetadataAttribute(attribute): void {
      if (objectMetadataPackage === null) return;
      const current =
        services.metadataApi.getPackage(objectMetadataPackage.id)
          ?.objectMetadata ?? null;
      if (current === null) return;
      try {
        const document = services.metadataApi.updateMetadata(
          objectMetadataPackage.id,
          {
            attributes: current.attributes.map((item) =>
              item.id === attribute.id ? attribute : item,
            ),
          },
        );
        setObjectMetadataPackage(
          services.metadataApi.getPackage(objectMetadataPackage.id),
        );
        setObjectMetadataDocument(document);
        setObjectMetadataEvents(services.metadataApi.listEvents());
        setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
        setObjectMetadataMessage(`Attribute updated: ${attribute.key}.`);
      } catch (err) {
        setObjectMetadataMessage(
          `Edit failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    removeObjectMetadataAttribute(key): void {
      if (objectMetadataPackage === null) return;
      const document = services.metadataApi.removeAttribute(
        objectMetadataPackage.id,
        key,
      );
      setObjectMetadataPackage(
        services.metadataApi.getPackage(objectMetadataPackage.id),
      );
      setObjectMetadataDocument(document);
      setObjectMetadataEvents(services.metadataApi.listEvents());
      setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
      setObjectMetadataMessage(`Attribute removed: ${key}.`);
    },
    reorderObjectMetadataAttribute(key, direction): void {
      if (objectMetadataPackage === null) return;
      const current =
        services.metadataApi.getPackage(objectMetadataPackage.id)
          ?.objectMetadata ?? null;
      if (current === null) return;
      const sorted = [...current.attributes].sort(
        (left, right) => left.order - right.order,
      );
      const index = sorted.findIndex((item) => item.key === key);
      if (index < 0) return;
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= sorted.length) return;
      const next = sorted.map((item, itemIndex) => {
        if (itemIndex === index) {
          return { ...item, order: sorted[swapWith]!.order };
        }
        if (itemIndex === swapWith) {
          return { ...item, order: sorted[index]!.order };
        }
        return item;
      });
      const document = services.metadataApi.updateMetadata(
        objectMetadataPackage.id,
        { attributes: next },
      );
      setObjectMetadataPackage(
        services.metadataApi.getPackage(objectMetadataPackage.id),
      );
      setObjectMetadataDocument(document);
      setObjectMetadataEvents(services.metadataApi.listEvents());
      setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
      setObjectMetadataMessage(`Attribute reordered: ${key}.`);
    },
    validateObjectMetadata(): void {
      if (objectMetadataPackage === null) {
        setObjectMetadataMessage('Create metadata first.');
        return;
      }
      const validation = services.metadataApi.validateMetadata(
        objectMetadataPackage.id,
      );
      setObjectMetadataPackage(
        services.metadataApi.getPackage(objectMetadataPackage.id),
      );
      setObjectMetadataDocument(
        services.metadataApi.getPackage(objectMetadataPackage.id)
          ?.objectMetadata ?? null,
      );
      setObjectMetadataEvents(services.metadataApi.listEvents());
      setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
      setObjectMetadataMessage(
        validation.valid
          ? 'Metadata validation OK.'
          : 'Metadata validation failed.',
      );
    },
    publishObjectMetadataDraft(): void {
      if (objectMetadataPackage === null) {
        setObjectMetadataMessage('Create metadata first.');
        return;
      }
      try {
        services.metadataApi.validateMetadata(objectMetadataPackage.id);
        const document = services.metadataApi.publishMetadataDraft(
          objectMetadataPackage.id,
        );
        setObjectMetadataPackage(
          services.metadataApi.getPackage(objectMetadataPackage.id),
        );
        setObjectMetadataDocument(document);
        setObjectMetadataEvents(services.metadataApi.listEvents());
        setObjectMetadataIndexCount(services.metadataApi.listIndex().length);
        setObjectMetadataMessage(`Metadata draft published: ${document.slug}.`);
      } catch (err) {
        setObjectMetadataMessage(
          `Publish failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
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

    evaluateRules(): void {
      if (decisionModel === null) {
        setEvaluationValidationMessage(
          'Nejdřív vytvořte Decision Model (Engine → Build Model).',
        );
        return;
      }
      const input = toRuleEvaluationInput(
        decisionModel,
        knowledgePackage,
        decisionKnowledge,
      );
      const validation = services.ruleEvaluationApi.validateEvaluation(input);
      if (!validation.valid) {
        setEvaluationValidationMessage(validation.issues.join(' '));
        return;
      }
      const evaluated = services.ruleEvaluationApi.evaluateRules(input);
      setEvaluationResult(evaluated);
      setEvaluationEvents(
        services.ruleEvaluationEngine.getHistory(evaluated.id),
      );
      setEvaluationValidationMessage(null);
    },
    validateEvaluation(): void {
      if (decisionModel === null) {
        setEvaluationValidationMessage(
          'Nejdřív vytvořte Decision Model (Engine → Build Model).',
        );
        return;
      }
      const validation = services.ruleEvaluationApi.validateEvaluation(
        toRuleEvaluationInput(
          decisionModel,
          knowledgePackage,
          decisionKnowledge,
        ),
      );
      setEvaluationValidationMessage(
        validation.valid
          ? 'Validation OK — rules are evaluable.'
          : validation.issues.join(' '),
      );
    },
    disposeEvaluation(): void {
      if (evaluationResult === null) {
        return;
      }
      services.ruleEvaluationEngine.dispose(evaluationResult.id);
      setEvaluationResult(null);
      setEvaluationEvents([]);
      setEvaluationValidationMessage(null);
    },
    composeStory(): void {
      if (evaluationResult === null) {
        setStoryMessage(
          'Nejdřív vyhodnoťte pravidla (Evaluation → Evaluate Rules).',
        );
        return;
      }
      const composed = services.decisionStoryApi.composeStory(
        toComposeStoryInput(evaluationResult),
      );
      setDecisionStory(composed);
      setStoryEvents(services.decisionStoryComposer.getHistory(composed.id));
      setStoryMessage(null);
    },
    validateStory(): void {
      if (decisionStory === null) {
        setStoryMessage('Nejdřív složte Decision Story (Compose Story).');
        return;
      }
      const validated = services.decisionStoryComposer.validateStory(
        decisionStory.id,
      );
      setDecisionStory(validated);
      setStoryEvents(services.decisionStoryComposer.getHistory(validated.id));
      setStoryMessage(
        validated.validation?.valid
          ? 'Validation OK — Decision Story is structurally sound.'
          : (validated.validation?.issues.map((issue) => issue.message).join(' ') ??
            'Validation failed.'),
      );
    },
    disposeStory(): void {
      if (decisionStory === null) {
        return;
      }
      services.decisionStoryComposer.dispose(decisionStory.id);
      setDecisionStory(null);
      setStoryEvents([]);
      setStoryMessage(null);
    },

    createRuntimeSession(): void {
      if (decisionStory === null) {
        setSessionMessage(
          'Nejdřív složte Decision Story (Story → Compose Story).',
        );
        return;
      }
      const runtimeId =
        runtimeModel?.id ?? `runtime-${decisionStory.decisionModelId}`;
      try {
        const created = services.runtimeSessionApi.createSession(
          toCreateSessionInput(runtimeId, decisionStory),
        );
        setRuntimeSession(created);
        setSessionEvents(
          services.runtimeSessionEngine.getHistory(created.id),
        );
        setSessionMessage(null);
      } catch (error) {
        setSessionMessage(
          error instanceof Error ? error.message : 'Create Session failed.',
        );
      }
    },
    startRuntimeSession(): void {
      if (runtimeSession === null) {
        setSessionMessage('Nejdřív vytvořte Runtime Session (Create Session).');
        return;
      }
      try {
        const started = services.runtimeSessionApi.startSession(
          runtimeSession.id,
        );
        setRuntimeSession(started);
        setSessionEvents(
          services.runtimeSessionEngine.getHistory(started.id),
        );
        setSessionMessage(null);
      } catch (error) {
        setSessionMessage(
          error instanceof Error ? error.message : 'Start Session failed.',
        );
      }
    },
    nextSessionMove(): void {
      if (runtimeSession === null) {
        setSessionMessage('Nejdřív spusťte Session (Start).');
        return;
      }
      try {
        const next = services.runtimeSessionApi.nextMove(runtimeSession.id);
        setRuntimeSession(next);
        setSessionEvents(services.runtimeSessionEngine.getHistory(next.id));
        setSessionMessage(null);
      } catch (error) {
        setSessionMessage(
          error instanceof Error ? error.message : 'Next Move failed.',
        );
      }
    },
    previousSessionMove(): void {
      if (runtimeSession === null) {
        setSessionMessage('Nejdřív spusťte Session (Start).');
        return;
      }
      try {
        const previous = services.runtimeSessionApi.previousMove(
          runtimeSession.id,
        );
        setRuntimeSession(previous);
        setSessionEvents(
          services.runtimeSessionEngine.getHistory(previous.id),
        );
        setSessionMessage(null);
      } catch (error) {
        setSessionMessage(
          error instanceof Error ? error.message : 'Previous Move failed.',
        );
      }
    },
    completeRuntimeSession(): void {
      if (runtimeSession === null) {
        setSessionMessage('Nejdřív spusťte Session (Start).');
        return;
      }
      try {
        const completed = services.runtimeSessionApi.completeSession(
          runtimeSession.id,
        );
        setRuntimeSession(completed);
        setSessionEvents(
          services.runtimeSessionEngine.getHistory(completed.id),
        );
        setSessionMessage(null);
      } catch (error) {
        setSessionMessage(
          error instanceof Error ? error.message : 'Complete Session failed.',
        );
      }
    },
    disposeRuntimeSession(): void {
      if (runtimeSession === null) {
        return;
      }
      const disposed = services.runtimeSessionEngine.dispose(runtimeSession.id);
      setRuntimeSession(disposed);
      setSessionEvents(services.runtimeSessionEngine.getHistory(disposed.id));
      setSessionMessage(null);
    },

    evaluateBehavior(): void {
      if (runtimeSession === null) {
        setBehaviorMessage(
          'Nejdřív vytvořte Runtime Session (Session → Create Session).',
        );
        return;
      }
      services.behaviorEngine.initialize(runtimeSession.id);
      const evaluated = services.behaviorApi.evaluateBehavior(
        toEvaluateBehaviorInput(runtimeSession, behaviorSignals),
      );
      setBehaviorEvaluation(evaluated);
      setBehaviorSignals(
        services.behaviorApi.listBehaviorSignals(runtimeSession.id),
      );
      setBehaviorEvents(
        services.behaviorEngine.getHistory(runtimeSession.id),
      );
      setBehaviorMessage(null);
    },
    receiveDemoBehaviorSignals(): void {
      if (runtimeSession === null) {
        setBehaviorMessage(
          'Nejdřív vytvořte Runtime Session (Session → Create Session).',
        );
        return;
      }
      const stamp = new Date().toISOString();
      const sessionId = runtimeSession.id;
      const moveId = runtimeSession.currentMoveId;
      const demos: BehaviorSignal[] = [
        {
          id: `signal-move-entered-${Date.now()}`,
          type: 'MoveEntered',
          source: 'runtime-session',
          timestamp: stamp,
          payload: {
            moveId,
            note: 'Demo MoveEntered from Runtime Session.',
          },
          metadata: { sessionId },
        },
        {
          id: `signal-timeout-${Date.now() + 1}`,
          type: 'Timeout',
          source: 'builder-diagnostic',
          timestamp: stamp,
          payload: {
            moveId,
            note: 'Demo Timeout — visitor idle.',
          },
          metadata: { sessionId },
        },
        {
          id: `signal-pause-${Date.now() + 2}`,
          type: 'PauseDetected',
          source: 'builder-diagnostic',
          timestamp: stamp,
          payload: {
            moveId,
            note: 'Demo PauseDetected.',
          },
          metadata: { sessionId },
        },
      ];
      for (const item of demos) {
        services.behaviorEngine.receiveSignal(item);
      }
      setBehaviorSignals(services.behaviorApi.listBehaviorSignals(sessionId));
      setBehaviorEvents(services.behaviorEngine.getHistory(sessionId));
      setBehaviorMessage('Demo signals accepted — Behavior Session unchanged.');
    },
    disposeBehavior(): void {
      if (runtimeSession === null && behaviorEvaluation === null) {
        return;
      }
      const sessionId =
        behaviorEvaluation?.sessionId ?? runtimeSession?.id ?? null;
      if (sessionId !== null) {
        services.behaviorEngine.dispose(sessionId);
      }
      setBehaviorEvaluation(null);
      setBehaviorSignals([]);
      setBehaviorEvents([]);
      setBehaviorMessage(null);
    },

    recordAnalytics(): void {
      if (runtimeSession === null) {
        setAnalyticsMessage(
          'Nejdřív vytvořte Runtime Session (Session → Create Session).',
        );
        return;
      }
      const analyticsSessionId = recordAnalyticsFromRuntime(
        services.decisionAnalyticsEngine,
        runtimeSession,
        behaviorEvaluation?.id ?? null,
      );
      services.decisionAnalyticsEngine.aggregate(analyticsSessionId);
      const snapshot =
        services.decisionAnalyticsApi.createAnalyticsSnapshot(
          analyticsSessionId,
        );
      setAnalyticsSnapshot(snapshot);
      setAnalyticsEvents(
        services.decisionAnalyticsEngine.getHistory(analyticsSessionId),
      );
      setAnalyticsMessage(null);
    },
    aggregateAnalytics(): void {
      if (analyticsSnapshot === null) {
        setAnalyticsMessage('Nejdřív Record Analytics.');
        return;
      }
      const sessionId = analyticsSnapshot.session.id;
      services.decisionAnalyticsEngine.aggregate(sessionId);
      const snapshot =
        services.decisionAnalyticsApi.createAnalyticsSnapshot(sessionId);
      setAnalyticsSnapshot(snapshot);
      setAnalyticsEvents(
        services.decisionAnalyticsEngine.getHistory(sessionId),
      );
      setAnalyticsMessage(null);
    },
    exportAnalytics(): void {
      if (analyticsSnapshot === null) {
        setAnalyticsMessage('Nejdřív Record Analytics.');
        return;
      }
      const exported = services.decisionAnalyticsApi.exportAnalytics(
        analyticsSnapshot.session.id,
      );
      setAnalyticsSnapshot(exported);
      setAnalyticsEvents(
        services.decisionAnalyticsEngine.getHistory(exported.session.id),
      );
      setAnalyticsMessage('JSON export ready.');
    },
    disposeAnalytics(): void {
      if (analyticsSnapshot === null) {
        return;
      }
      services.decisionAnalyticsEngine.dispose(analyticsSnapshot.session.id);
      setAnalyticsSnapshot(null);
      setAnalyticsEvents([]);
      setAnalyticsMessage(null);
    },

    importLearning(): void {
      if (analyticsSnapshot === null) {
        setLearningPipelineMessage(
          'Nejdřív Record Analytics (Analytics → Record Analytics).',
        );
        return;
      }
      const validation = services.learningPipelineApi.importAnalytics(
        toIngestAnalyticsInput(analyticsSnapshot),
      );
      const pipelineId = `learning-pipeline-${analyticsSnapshot.id}`;
      setLearningPipelineId(pipelineId);
      setLearningValidation(validation);
      setLearningImportReport(
        services.learningPipeline.getImportReport(pipelineId),
      );
      setLearningRecord(null);
      setLearningExportPayload(null);
      setLearningPipelineEvents(
        services.learningPipeline.getHistory(pipelineId),
      );
      setLearningPipelineMessage(null);
    },
    validateLearningPipeline(): void {
      if (learningPipelineId === null) {
        setLearningPipelineMessage('Nejdřív Import Analytics.');
        return;
      }
      const validation =
        services.learningPipelineApi.validateLearning(learningPipelineId);
      setLearningValidation(validation);
      setLearningPipelineEvents(
        services.learningPipeline.getHistory(learningPipelineId),
      );
      setLearningPipelineMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    anonymizeLearning(): void {
      if (learningPipelineId === null) {
        setLearningPipelineMessage('Nejdřív Import Analytics.');
        return;
      }
      const validation =
        services.learningPipeline.anonymize(learningPipelineId);
      setLearningValidation(validation);
      setLearningPipelineEvents(
        services.learningPipeline.getHistory(learningPipelineId),
      );
      setLearningPipelineMessage('Anonymized identifiers.');
    },
    transformLearning(): void {
      if (learningPipelineId === null) {
        setLearningPipelineMessage('Nejdřív Import Analytics.');
        return;
      }
      try {
        const record =
          services.learningPipelineApi.transformLearning(learningPipelineId);
        setLearningRecord(record);
        setLearningValidation(
          services.learningPipeline.getValidation(learningPipelineId),
        );
        setLearningImportReport(
          services.learningPipeline.getImportReport(learningPipelineId),
        );
        setLearningExportPayload(
          services.learningPipelineApi.exportLearningRecord(learningPipelineId),
        );
        setLearningPipelineEvents(
          services.learningPipeline.getHistory(learningPipelineId),
        );
        setLearningPipelineMessage(null);
      } catch (error) {
        setLearningPipelineMessage(
          error instanceof Error ? error.message : 'Transform failed.',
        );
      }
    },
    disposeLearningPipeline(): void {
      if (learningPipelineId === null) {
        return;
      }
      services.learningPipeline.dispose(learningPipelineId);
      setLearningPipelineId(null);
      setLearningRecord(null);
      setLearningValidation(null);
      setLearningImportReport(null);
      setLearningExportPayload(null);
      setLearningPipelineEvents([]);
      setLearningPipelineMessage(null);
    },

    createLearningRecordsPackage(): void {
      const created = services.learningPackageManagerApi.createLearningPackage({
        name: 'Builder Learning Package',
        title: 'Builder Learning Package',
        description:
          'Versioned Learning Record references from Learning Pipeline.',
      });
      setLearningRecordsPackage(created);
      setLearningPackageManagerEvents(
        services.learningPackageManager.getHistory(created.id),
      );
      setLearningPackageIndexCount(
        services.learningPackageManager.getIndex().list(created.id).length,
      );
      setLearningPackageManagerMessage(null);
    },
    addLearningRecordRef(): void {
      if (learningRecordsPackage === null) {
        setLearningPackageManagerMessage('Nejdřív Create Package.');
        return;
      }
      const recordId =
        learningRecord?.id ??
        `learning-record-demo-${learningRecordsPackage.records.length + 1}`;
      const next = services.learningPackageManager.addRecord({
        packageId: learningRecordsPackage.id,
        recordId,
        source: learningRecord !== null ? 'learning-pipeline' : 'builder-demo',
        note:
          learningRecord !== null
            ? 'Reference from Learning Pipeline Transform.'
            : 'Demo Learning Record reference.',
      });
      setLearningRecordsPackage(next);
      setLearningPackageManagerEvents(
        services.learningPackageManager.getHistory(next.id),
      );
      setLearningPackageIndexCount(
        services.learningPackageManager.getIndex().list(next.id).length,
      );
      setLearningPackageManagerMessage(null);
    },
    removeLastLearningRecordRef(): void {
      if (
        learningRecordsPackage === null ||
        learningRecordsPackage.records.length === 0
      ) {
        return;
      }
      const last =
        learningRecordsPackage.records[
          learningRecordsPackage.records.length - 1
        ]!;
      const next = services.learningPackageManager.removeRecord(
        learningRecordsPackage.id,
        last.recordId,
      );
      setLearningRecordsPackage(next);
      setLearningPackageManagerEvents(
        services.learningPackageManager.getHistory(next.id),
      );
      setLearningPackageIndexCount(
        services.learningPackageManager.getIndex().list(next.id).length,
      );
      setLearningPackageManagerMessage(null);
    },
    validateLearningRecordsPackage(): void {
      if (learningRecordsPackage === null) {
        setLearningPackageManagerMessage('Nejdřív Create Package.');
        return;
      }
      const validated =
        services.learningPackageManagerApi.validateLearningPackage(
          learningRecordsPackage.id,
        );
      setLearningRecordsPackage(validated);
      setLearningPackageManagerEvents(
        services.learningPackageManager.getHistory(validated.id),
      );
      setLearningPackageManagerMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    publishLearningRecordsPackage(): void {
      if (learningRecordsPackage === null) {
        setLearningPackageManagerMessage('Nejdřív Create Package.');
        return;
      }
      const published =
        services.learningPackageManagerApi.publishLearningPackage(
          learningRecordsPackage.id,
        );
      setLearningRecordsPackage(published);
      setLearningPackageManagerEvents(
        services.learningPackageManager.getHistory(published.id),
      );
      setLearningPackageManagerMessage(
        published.metadata.status === 'Published'
          ? `Published @ ${published.version}`
          : 'Publish blocked by validation.',
      );
    },
    disposeLearningRecordsPackage(): void {
      if (learningRecordsPackage === null) {
        return;
      }
      const disposed = services.learningPackageManager.dispose(
        learningRecordsPackage.id,
      );
      setLearningRecordsPackage(disposed);
      setLearningPackageManagerEvents(
        services.learningPackageManager.getHistory(disposed.id),
      );
      setLearningPackageIndexCount(
        services.learningPackageManager.getIndex().list(disposed.id).length,
      );
      setLearningPackageManagerMessage(null);
    },
    extractPatterns(): void {
      const records =
        learningRecordsPackage !== null &&
        learningRecordsPackage.records.length > 0
          ? learningRecordsPackage.records.map((ref) => ({
              recordId: ref.recordId,
              source: ref.source,
              note: ref.metadata.note,
            }))
          : [
              {
                recordId: 'learning-record-1',
                source: 'learning-pipeline',
                note: 'Demo pipeline ref',
              },
              {
                recordId: 'learning-record-2',
                source: 'learning-pipeline',
                note: 'Demo pipeline ref',
              },
              {
                recordId: 'learning-record-3',
                source: 'builder-demo',
                note: 'Demo',
              },
            ];

      const packageId =
        learningRecordsPackage?.id ?? 'learning-records-package-demo';
      const packageName =
        learningRecordsPackage?.name ?? 'Demo Learning Package';

      const extracted = services.patternExtractionApi.extractPatterns({
        packageId,
        packageName,
        title: `${packageName} Patterns`,
        records,
      });
      setPatternCollection(extracted);
      setPatternExtractionEvents(
        services.patternExtractionEngine.getHistory(extracted.id),
      );
      setPatternIndexCount(
        services.patternExtractionEngine.getIndex().list(extracted.id).length,
      );
      setPatternExtractionMessage(
        `Extracted ${extracted.patterns.length} pattern(s). Learning Package unchanged.`,
      );
    },
    validatePatterns(): void {
      if (patternCollection === null) {
        setPatternExtractionMessage('Nejdřív Extract Patterns.');
        return;
      }
      const validated = services.patternExtractionApi.validatePatterns(
        patternCollection.id,
      );
      setPatternCollection(validated);
      setPatternExtractionEvents(
        services.patternExtractionEngine.getHistory(validated.id),
      );
      setPatternExtractionMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    publishPatterns(): void {
      if (patternCollection === null) {
        setPatternExtractionMessage('Nejdřív Extract Patterns.');
        return;
      }
      const published = services.patternExtractionEngine.publish(
        patternCollection.id,
      );
      setPatternCollection(published);
      setPatternExtractionEvents(
        services.patternExtractionEngine.getHistory(published.id),
      );
      setPatternIndexCount(
        services.patternExtractionEngine.getIndex().list(published.id).length,
      );
      setPatternExtractionMessage(
        published.patterns.every((item) => item.metadata.status === 'Published')
          ? `Published @ ${published.version}`
          : 'Publish blocked by validation.',
      );
    },
    disposePatterns(): void {
      if (patternCollection === null) {
        return;
      }
      const disposed = services.patternExtractionEngine.dispose(
        patternCollection.id,
      );
      setPatternCollection(disposed);
      setPatternExtractionEvents(
        services.patternExtractionEngine.getHistory(disposed.id),
      );
      setPatternIndexCount(
        services.patternExtractionEngine.getIndex().list(disposed.id).length,
      );
      setPatternExtractionMessage(null);
    },
    extractIntelligencePatterns(): void {
      const records =
        learningRecordsPackage !== null &&
        learningRecordsPackage.records.length > 0
          ? learningRecordsPackage.records.map((ref) => ({
              recordId: ref.recordId,
              source: ref.source,
              note: ref.metadata.note,
              timestamp: ref.timestamp,
            }))
          : [
              {
                recordId: 'learning-record-1',
                source: 'learning-pipeline',
                note: 'Demo pipeline ref',
                timestamp: new Date().toISOString(),
              },
              {
                recordId: 'learning-record-2',
                source: 'learning-pipeline',
                note: 'Demo pipeline ref',
                timestamp: new Date().toISOString(),
              },
              {
                recordId: 'learning-record-3',
                source: 'builder-demo',
                note: 'Demo',
                timestamp: new Date().toISOString(),
              },
            ];

      const packageId =
        learningRecordsPackage?.id ?? 'learning-records-package-demo';
      const packageName =
        learningRecordsPackage?.name ?? 'Demo Learning Package';

      const extracted = services.patternIntelligenceApi.extractPatterns({
        packageId,
        packageName,
        snapshotId: analyticsSnapshot?.id ?? `snapshot-${packageId}`,
        title: `${packageName} Catalog`,
        records,
      });
      setPatternCatalog(extracted);
      setPatternIntelligenceEvents(
        services.patternIntelligenceEngine.getHistory(extracted.id),
      );
      setPatternIntelligenceIndexCount(
        services.patternIntelligenceEngine.getIndex().list(extracted.id)
          .length,
      );
      setPatternIntelligenceMessage(
        `Detected ${extracted.patterns.length} pattern(s). Learning Records unchanged.`,
      );
    },
    mergeIntelligencePatterns(): void {
      if (patternCatalog === null) {
        setPatternIntelligenceMessage('Nejdřív Extract Patterns.');
        return;
      }
      const merged = services.patternIntelligenceEngine.merge(
        patternCatalog.id,
      );
      setPatternCatalog(merged);
      setPatternIntelligenceEvents(
        services.patternIntelligenceEngine.getHistory(merged.id),
      );
      setPatternIntelligenceIndexCount(
        services.patternIntelligenceEngine.getIndex().list(merged.id).length,
      );
      setPatternIntelligenceMessage('Merge complete.');
    },
    validateIntelligencePatterns(): void {
      if (patternCatalog === null) {
        setPatternIntelligenceMessage('Nejdřív Extract Patterns.');
        return;
      }
      const validated = services.patternIntelligenceApi.validatePatterns(
        patternCatalog.id,
      );
      setPatternCatalog(validated);
      setPatternIntelligenceEvents(
        services.patternIntelligenceEngine.getHistory(validated.id),
      );
      setPatternIntelligenceMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    publishIntelligencePatterns(): void {
      if (patternCatalog === null) {
        setPatternIntelligenceMessage('Nejdřív Extract Patterns.');
        return;
      }
      const published = services.patternIntelligenceApi.publishPatterns(
        patternCatalog.id,
      );
      setPatternCatalog(published);
      setPatternIntelligenceEvents(
        services.patternIntelligenceEngine.getHistory(published.id),
      );
      setPatternIntelligenceIndexCount(
        services.patternIntelligenceEngine.getIndex().list(published.id)
          .length,
      );
      setPatternIntelligenceMessage(
        published.metadata.status === 'Published'
          ? `Published catalog @ ${published.version}`
          : 'Publish blocked by validation.',
      );
    },
    disposeIntelligencePatterns(): void {
      if (patternCatalog === null) {
        return;
      }
      const disposed = services.patternIntelligenceEngine.dispose(
        patternCatalog.id,
      );
      setPatternCatalog(disposed);
      setPatternIntelligenceEvents(
        services.patternIntelligenceEngine.getHistory(disposed.id),
      );
      setPatternIntelligenceIndexCount(
        services.patternIntelligenceEngine.getIndex().list(disposed.id)
          .length,
      );
      setPatternIntelligenceMessage(null);
    },
    deriveHeuristics(): void {
      const patterns =
        patternCollection !== null && patternCollection.patterns.length > 0
          ? patternCollection.patterns.map((pattern) => ({
              id: pattern.id,
              name: pattern.name,
              description: pattern.description,
              confidence: pattern.confidence,
              sourceRecords: pattern.sourceRecords,
            }))
          : [
              {
                id: 'extracted-pattern-1',
                name: 'Repeated source: learning-pipeline',
                description: '2 Learning Records share source.',
                confidence: 0.4,
                sourceRecords: ['learning-record-1', 'learning-record-2'],
              },
              {
                id: 'extracted-pattern-2',
                name: 'Multi-record package',
                description: 'Package contains 3 record references.',
                confidence: 0.5,
                sourceRecords: [
                  'learning-record-1',
                  'learning-record-2',
                  'learning-record-3',
                ],
              },
            ];

      const collectionId =
        patternCollection?.id ?? 'pattern-collection-demo';
      const collectionTitle =
        patternCollection?.metadata.title ?? 'Demo Pattern Collection';

      const derived = services.heuristicEngineApi.deriveHeuristics({
        collectionId,
        collectionTitle,
        title: `${collectionTitle} Heuristics`,
        patterns,
      });
      setHeuristicCatalog(derived);
      setHeuristicEngineEvents(
        services.heuristicEngine.getHistory(derived.id),
      );
      setHeuristicIndexCount(
        services.heuristicEngine.getIndex().list(derived.id).length,
      );
      setHeuristicEngineMessage(
        `Derived ${derived.heuristics.length} heuristic(s). Pattern Collection unchanged.`,
      );
    },
    validateHeuristics(): void {
      if (heuristicCatalog === null) {
        setHeuristicEngineMessage('Nejdřív Derive Heuristics.');
        return;
      }
      const validated = services.heuristicEngineApi.validateHeuristics(
        heuristicCatalog.id,
      );
      setHeuristicCatalog(validated);
      setHeuristicEngineEvents(
        services.heuristicEngine.getHistory(validated.id),
      );
      setHeuristicEngineMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    publishHeuristics(): void {
      if (heuristicCatalog === null) {
        setHeuristicEngineMessage('Nejdřív Derive Heuristics.');
        return;
      }
      const published = services.heuristicEngineApi.publishHeuristics(
        heuristicCatalog.id,
      );
      setHeuristicCatalog(published);
      setHeuristicEngineEvents(
        services.heuristicEngine.getHistory(published.id),
      );
      setHeuristicIndexCount(
        services.heuristicEngine.getIndex().list(published.id).length,
      );
      setHeuristicEngineMessage(
        published.metadata.status === 'Published'
          ? `Published catalog @ ${published.version}`
          : 'Publish blocked by validation.',
      );
    },
    disposeHeuristics(): void {
      if (heuristicCatalog === null) {
        return;
      }
      const disposed = services.heuristicEngine.dispose(heuristicCatalog.id);
      setHeuristicCatalog(disposed);
      setHeuristicEngineEvents(
        services.heuristicEngine.getHistory(disposed.id),
      );
      setHeuristicIndexCount(
        services.heuristicEngine.getIndex().list(disposed.id).length,
      );
      setHeuristicEngineMessage(null);
    },
    synthesizeKnowledge(): void {
      const heuristics =
        heuristicCatalog !== null && heuristicCatalog.heuristics.length > 0
          ? heuristicCatalog.heuristics.map((heuristic) => ({
              id: heuristic.id,
              name: heuristic.name,
              description: heuristic.description,
              confidence: heuristic.confidence,
              priority: heuristic.priority,
              sourcePatterns: heuristic.sourcePatterns,
            }))
          : [
              {
                id: 'derived-heuristic-1',
                name: 'Heuristic: Repeated source',
                description: 'From pattern.',
                confidence: 0.4,
                priority: 1,
                sourcePatterns: ['extracted-pattern-1'],
              },
              {
                id: 'derived-heuristic-2',
                name: 'Heuristic: Multi-record package',
                description: 'From pattern.',
                confidence: 0.5,
                priority: 2,
                sourcePatterns: ['extracted-pattern-2'],
              },
            ];

      const catalogId = heuristicCatalog?.id ?? 'heuristic-catalog-demo';
      const catalogTitle =
        heuristicCatalog?.metadata.title ?? 'Demo Heuristic Catalog';

      const synthesized = services.knowledgeSynthesisApi.synthesizeKnowledge({
        catalogId,
        catalogTitle,
        title: `${catalogTitle} Knowledge`,
        heuristics,
      });
      setSynthesizedKnowledgeBase(synthesized);
      setKnowledgeSynthesisEvents(
        services.knowledgeSynthesisEngine.getHistory(synthesized.id),
      );
      setKnowledgeSynthesisIndexCount(
        services.knowledgeSynthesisEngine.getIndex().list(synthesized.id)
          .length,
      );
      setKnowledgeSynthesisMessage(
        `Synthesized ${synthesized.entries.length} entr(y/ies). Heuristic Catalog unchanged.`,
      );
    },
    mergeKnowledge(): void {
      if (synthesizedKnowledgeBase === null) {
        setKnowledgeSynthesisMessage('Nejdřív Synthesize.');
        return;
      }
      const merged = services.knowledgeSynthesisEngine.merge(
        synthesizedKnowledgeBase.id,
      );
      setSynthesizedKnowledgeBase(merged);
      setKnowledgeSynthesisEvents(
        services.knowledgeSynthesisEngine.getHistory(merged.id),
      );
      setKnowledgeSynthesisIndexCount(
        services.knowledgeSynthesisEngine.getIndex().list(merged.id).length,
      );
      setKnowledgeSynthesisMessage('Merge complete.');
    },
    validateSynthesizedKnowledge(): void {
      if (synthesizedKnowledgeBase === null) {
        setKnowledgeSynthesisMessage('Nejdřív Synthesize.');
        return;
      }
      const validated = services.knowledgeSynthesisApi.validateKnowledge(
        synthesizedKnowledgeBase.id,
      );
      setSynthesizedKnowledgeBase(validated);
      setKnowledgeSynthesisEvents(
        services.knowledgeSynthesisEngine.getHistory(validated.id),
      );
      setKnowledgeSynthesisMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    publishSynthesizedKnowledge(): void {
      if (synthesizedKnowledgeBase === null) {
        setKnowledgeSynthesisMessage('Nejdřív Synthesize.');
        return;
      }
      const published = services.knowledgeSynthesisApi.publishKnowledge(
        synthesizedKnowledgeBase.id,
      );
      setSynthesizedKnowledgeBase(published);
      setKnowledgeSynthesisEvents(
        services.knowledgeSynthesisEngine.getHistory(published.id),
      );
      setKnowledgeSynthesisIndexCount(
        services.knowledgeSynthesisEngine.getIndex().list(published.id)
          .length,
      );
      setKnowledgeSynthesisMessage(
        published.metadata.status === 'Published'
          ? `Published base @ ${published.version}`
          : 'Publish blocked by validation.',
      );
    },
    disposeSynthesizedKnowledge(): void {
      if (synthesizedKnowledgeBase === null) {
        return;
      }
      const disposed = services.knowledgeSynthesisEngine.dispose(
        synthesizedKnowledgeBase.id,
      );
      setSynthesizedKnowledgeBase(disposed);
      setKnowledgeSynthesisEvents(
        services.knowledgeSynthesisEngine.getHistory(disposed.id),
      );
      setKnowledgeSynthesisIndexCount(
        services.knowledgeSynthesisEngine.getIndex().list(disposed.id)
          .length,
      );
      setKnowledgeSynthesisMessage(null);
    },
    buildGatewayAIContext(): void {
      const entries =
        synthesizedKnowledgeBase !== null &&
        synthesizedKnowledgeBase.entries.length > 0
          ? synthesizedKnowledgeBase.entries.map((entry) => ({
              id: entry.id,
              title: entry.title,
              description: entry.description,
              confidence: entry.confidence,
              sourceHeuristics: entry.sourceHeuristics,
            }))
          : [
              {
                id: 'knowledge-entry-1',
                title: 'Knowledge: Repeated source',
                description: 'Demo synthesized knowledge.',
                confidence: 0.4,
                sourceHeuristics: ['derived-heuristic-1'],
              },
              {
                id: 'knowledge-entry-2',
                title: 'Knowledge: Multi-record package',
                description: 'Demo synthesized knowledge.',
                confidence: 0.5,
                sourceHeuristics: ['derived-heuristic-2'],
              },
              {
                id: 'knowledge-entry-3',
                title: 'Catalog knowledge summary',
                description: 'Demo catalog summary.',
                confidence: 0.45,
                sourceHeuristics: [
                  'derived-heuristic-1',
                  'derived-heuristic-2',
                ],
              },
            ];

      const knowledgeBaseId =
        synthesizedKnowledgeBase?.id ?? 'knowledge-base-demo';
      const knowledgeBaseTitle =
        synthesizedKnowledgeBase?.metadata.title ?? 'Demo Knowledge Base';

      const built = services.aiDecisionGatewayApi.buildAIContext({
        knowledgeBaseId,
        knowledgeBaseTitle,
        title: `${knowledgeBaseTitle} AI Context`,
        maxEntries: 8,
        minConfidence: 0.25,
        entries,
      });
      setGatewayAIContextPackage(built);
      setAIDecisionGatewayEvents(
        services.aiDecisionGateway.getHistory(built.id),
      );
      setAIDecisionGatewayIndexCount(
        services.aiDecisionGateway.getIndex().list(built.id).length,
      );
      setAIDecisionGatewayMessage(
        `Built context with ${built.context.knowledgeEntries.length} entr(y/ies). Knowledge Base unchanged.`,
      );
    },
    filterGatewayAIContext(): void {
      if (gatewayAIContextPackage === null) {
        setAIDecisionGatewayMessage('Nejdřív Build Context.');
        return;
      }
      const filtered = services.aiDecisionGateway.filter(
        gatewayAIContextPackage.id,
        { maxEntries: 2, minConfidence: 0.35 },
      );
      setGatewayAIContextPackage(filtered);
      setAIDecisionGatewayEvents(
        services.aiDecisionGateway.getHistory(filtered.id),
      );
      setAIDecisionGatewayIndexCount(
        services.aiDecisionGateway.getIndex().list(filtered.id).length,
      );
      setAIDecisionGatewayMessage(
        `Filtered to ${filtered.context.knowledgeEntries.length} entr(y/ies).`,
      );
    },
    validateGatewayAIContext(): void {
      if (gatewayAIContextPackage === null) {
        setAIDecisionGatewayMessage('Nejdřív Build Context.');
        return;
      }
      const validated = services.aiDecisionGatewayApi.validateAIContext(
        gatewayAIContextPackage.id,
      );
      setGatewayAIContextPackage(validated);
      setAIDecisionGatewayEvents(
        services.aiDecisionGateway.getHistory(validated.id),
      );
      setAIDecisionGatewayMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    publishGatewayAIContext(): void {
      if (gatewayAIContextPackage === null) {
        setAIDecisionGatewayMessage('Nejdřív Build Context.');
        return;
      }
      const published = services.aiDecisionGatewayApi.publishAIContext(
        gatewayAIContextPackage.id,
      );
      setGatewayAIContextPackage(published);
      setAIDecisionGatewayEvents(
        services.aiDecisionGateway.getHistory(published.id),
      );
      setAIDecisionGatewayIndexCount(
        services.aiDecisionGateway.getIndex().list(published.id).length,
      );
      setAIDecisionGatewayMessage(
        published.metadata.status === 'Published'
          ? `Published package @ ${published.version}`
          : 'Publish blocked by validation.',
      );
    },
    disposeGatewayAIContext(): void {
      if (gatewayAIContextPackage === null) {
        return;
      }
      const disposed = services.aiDecisionGateway.dispose(
        gatewayAIContextPackage.id,
      );
      setGatewayAIContextPackage(disposed);
      setAIDecisionGatewayEvents(
        services.aiDecisionGateway.getHistory(disposed.id),
      );
      setAIDecisionGatewayIndexCount(
        services.aiDecisionGateway.getIndex().list(disposed.id).length,
      );
      setAIDecisionGatewayMessage(null);
    },
    personalizeContext(): void {
      const knowledgeEntries =
        gatewayAIContextPackage !== null
          ? gatewayAIContextPackage.context.knowledgeEntries.map(
              (entryId, index) => ({
                id: entryId,
                confidence: Math.max(
                  0.3,
                  gatewayAIContextPackage.context.confidence -
                    index * 0.05,
                ),
              }),
            )
          : [
              { id: 'knowledge-entry-1', confidence: 0.4 },
              { id: 'knowledge-entry-2', confidence: 0.5 },
              { id: 'knowledge-entry-3', confidence: 0.45 },
            ];

      const sessionId =
        runtimeSession?.id ?? 'runtime-session-demo';
      const aiContextPackageId =
        gatewayAIContextPackage?.id ?? 'ai-context-package-demo';
      const aiContextTitle =
        gatewayAIContextPackage?.metadata.title ?? 'Demo AI Context';

      const currentMoveIndex =
        runtimeSession === null || runtimeSession.currentMoveId === null
          ? 0
          : Math.max(
              0,
              runtimeSession.moveIds.indexOf(runtimeSession.currentMoveId),
            );

      const personalized = services.personalizationEngineApi.personalize({
        aiContextPackageId,
        aiContextTitle,
        sessionId,
        title: `${aiContextTitle} Personalization`,
        priorityProfile: ['price', 'layout', 'location'],
        knowledgeEntries,
        sessionState: runtimeSession?.status ?? 'Running',
        currentMoveIndex,
      });
      setPersonalizationPackage(personalized);
      setPersonalizationEngineEvents(
        services.personalizationEngine.getHistory(personalized.id),
      );
      setPersonalizationIndexCount(
        services.personalizationEngine.getIndex().list(personalized.id)
          .length,
      );
      setPersonalizationEngineMessage(
        `Personalized for session ${sessionId}. AI Context and Runtime unchanged.`,
      );
    },
    rankPersonalization(): void {
      if (personalizationPackage === null) {
        setPersonalizationEngineMessage('Nejdřív Personalize.');
        return;
      }
      const ranked = services.personalizationEngine.rank(
        personalizationPackage.id,
      );
      setPersonalizationPackage(ranked);
      setPersonalizationEngineEvents(
        services.personalizationEngine.getHistory(ranked.id),
      );
      setPersonalizationIndexCount(
        services.personalizationEngine.getIndex().list(ranked.id).length,
      );
      setPersonalizationEngineMessage('Ranking refreshed.');
    },
    validatePersonalization(): void {
      if (personalizationPackage === null) {
        setPersonalizationEngineMessage('Nejdřív Personalize.');
        return;
      }
      const validated =
        services.personalizationEngineApi.validatePersonalization(
          personalizationPackage.id,
        );
      setPersonalizationPackage(validated);
      setPersonalizationEngineEvents(
        services.personalizationEngine.getHistory(validated.id),
      );
      setPersonalizationEngineMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    publishPersonalization(): void {
      if (personalizationPackage === null) {
        setPersonalizationEngineMessage('Nejdřív Personalize.');
        return;
      }
      const published =
        services.personalizationEngineApi.publishPersonalization(
          personalizationPackage.id,
        );
      setPersonalizationPackage(published);
      setPersonalizationEngineEvents(
        services.personalizationEngine.getHistory(published.id),
      );
      setPersonalizationIndexCount(
        services.personalizationEngine.getIndex().list(published.id).length,
      );
      setPersonalizationEngineMessage(
        published.metadata.status === 'Published'
          ? `Published package @ ${published.version}`
          : 'Publish blocked by validation.',
      );
    },
    disposePersonalization(): void {
      if (personalizationPackage === null) {
        return;
      }
      const disposed = services.personalizationEngine.dispose(
        personalizationPackage.id,
      );
      setPersonalizationPackage(disposed);
      setPersonalizationEngineEvents(
        services.personalizationEngine.getHistory(disposed.id),
      );
      setPersonalizationIndexCount(
        services.personalizationEngine.getIndex().list(disposed.id).length,
      );
      setPersonalizationEngineMessage(null);
    },
    projectDecisionContext(): void {
      const knowledgeEntries =
        gatewayAIContextPackage !== null
          ? gatewayAIContextPackage.context.knowledgeEntries.map(
              (entryId, index) => ({
                id: entryId,
                confidence: Math.max(
                  0.3,
                  gatewayAIContextPackage.context.confidence - index * 0.05,
                ),
              }),
            )
          : [
              { id: 'knowledge-entry-1', confidence: 0.4 },
              { id: 'knowledge-entry-2', confidence: 0.5 },
              { id: 'knowledge-entry-3', confidence: 0.45 },
            ];

      const sessionId = runtimeSession?.id ?? 'runtime-session-demo';
      const aiContextPackageId =
        gatewayAIContextPackage?.id ?? 'ai-context-package-demo';
      const aiContextTitle =
        gatewayAIContextPackage?.metadata.title ?? 'Demo AI Context';

      const signalTypes =
        (behaviorEvaluation?.context.signals ?? behaviorSignals).map(
          (signal) => signal.type,
        );

      const projected = services.personalizationRuntimeApi.projectDecisionContext(
        {
          aiContextPackageId,
          aiContextTitle,
          sessionId,
          title: `${aiContextTitle} Decision Context`,
          decisionProfile: 'price-first',
          priorityProfile: ['price', 'layout', 'location'],
          behaviorProfile:
            signalTypes.length > 0
              ? signalTypes
              : ['attentive', 'exploring'],
          knowledgeEntries,
          sessionState: runtimeSession?.status ?? 'Running',
          behaviorSignals: signalTypes,
        },
      );
      setPersonalizedContextPackage(projected);
      setPersonalizationRuntimeEvents(
        services.personalizationRuntimeEngine.getHistory(projected.id),
      );
      setPersonalizationRuntimeIndexCount(
        services.personalizationRuntimeEngine.getIndex().list(projected.id)
          .length,
      );
      setPersonalizationRuntimeMessage(
        `Projected decision context for ${sessionId}. Sources unchanged.`,
      );
    },
    rankDecisionContext(): void {
      if (personalizedContextPackage === null) {
        setPersonalizationRuntimeMessage('Nejdřív Project Context.');
        return;
      }
      const ranked = services.personalizationRuntimeEngine.rank(
        personalizedContextPackage.id,
      );
      setPersonalizedContextPackage(ranked);
      setPersonalizationRuntimeEvents(
        services.personalizationRuntimeEngine.getHistory(ranked.id),
      );
      setPersonalizationRuntimeIndexCount(
        services.personalizationRuntimeEngine.getIndex().list(ranked.id)
          .length,
      );
      setPersonalizationRuntimeMessage('Ranking refreshed.');
    },
    validateDecisionContext(): void {
      if (personalizedContextPackage === null) {
        setPersonalizationRuntimeMessage('Nejdřív Project Context.');
        return;
      }
      const validated =
        services.personalizationRuntimeApi.validateDecisionContext(
          personalizedContextPackage.id,
        );
      setPersonalizedContextPackage(validated);
      setPersonalizationRuntimeEvents(
        services.personalizationRuntimeEngine.getHistory(validated.id),
      );
      setPersonalizationRuntimeMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    publishDecisionContext(): void {
      if (personalizedContextPackage === null) {
        setPersonalizationRuntimeMessage('Nejdřív Project Context.');
        return;
      }
      const published =
        services.personalizationRuntimeApi.publishDecisionContext(
          personalizedContextPackage.id,
        );
      setPersonalizedContextPackage(published);
      setPersonalizationRuntimeEvents(
        services.personalizationRuntimeEngine.getHistory(published.id),
      );
      setPersonalizationRuntimeIndexCount(
        services.personalizationRuntimeEngine.getIndex().list(published.id)
          .length,
      );
      setPersonalizationRuntimeMessage(
        published.metadata.status === 'Published'
          ? `Published package @ ${published.version}`
          : 'Publish blocked by validation.',
      );
    },
    disposeDecisionContext(): void {
      if (personalizedContextPackage === null) {
        return;
      }
      const disposed = services.personalizationRuntimeEngine.dispose(
        personalizedContextPackage.id,
      );
      setPersonalizedContextPackage(disposed);
      setPersonalizationRuntimeEvents(
        services.personalizationRuntimeEngine.getHistory(disposed.id),
      );
      setPersonalizationRuntimeIndexCount(
        services.personalizationRuntimeEngine.getIndex().list(disposed.id)
          .length,
      );
      setPersonalizationRuntimeMessage(null);
    },
    startDecisionExecution(): void {
      const moveIds =
        decisionStory !== null && decisionStory.moves.length > 0
          ? decisionStory.moves.map((move) => move.id)
          : ['move-1', 'move-2', 'move-3'];
      const sessionId = runtimeSession?.id ?? 'runtime-session-demo';
      const storyId = decisionStory?.id ?? 'decision-story-demo';
      const started = services.decisionOrchestratorApi.startExecution({
        sessionId,
        storyId,
        moveIds,
        title: `Decision Execution ${sessionId}`,
        personalizationPackageId:
          personalizationPackage?.id ??
          personalizedContextPackage?.id ??
          null,
        behaviorEvaluationId: behaviorEvaluation?.id ?? null,
        experienceId: experience?.experienceId ?? null,
      });
      setDecisionExecutionPackage(started);
      setDecisionOrchestratorEvents(
        services.decisionOrchestrator.getHistory(started.id),
      );
      setDecisionOrchestratorIndexCount(
        services.decisionOrchestrator.getIndex().list(started.id).length,
      );
      setDecisionOrchestratorMessage(
        `Started execution for ${sessionId}. Sources unchanged.`,
      );
    },
    advanceDecisionExecution(): void {
      if (decisionExecutionPackage === null) {
        setDecisionOrchestratorMessage('Nejdřív Start Execution.');
        return;
      }
      try {
        const advanced = services.decisionOrchestratorApi.advanceExecution(
          decisionExecutionPackage.id,
        );
        setDecisionExecutionPackage(advanced);
        setDecisionOrchestratorEvents(
          services.decisionOrchestrator.getHistory(advanced.id),
        );
        setDecisionOrchestratorIndexCount(
          services.decisionOrchestrator.getIndex().list(advanced.id).length,
        );
        setDecisionOrchestratorMessage(
          advanced.execution.state === 'Completed'
            ? 'Execution completed via advance.'
            : `Advanced to ${advanced.execution.currentMove}.`,
        );
      } catch (error) {
        setDecisionOrchestratorMessage(
          error instanceof Error ? error.message : 'Advance failed.',
        );
      }
    },
    transitionDecisionExecution(): void {
      if (decisionExecutionPackage === null) {
        setDecisionOrchestratorMessage('Nejdřív Start Execution.');
        return;
      }
      try {
        const transitioned = services.decisionOrchestrator.transition(
          decisionExecutionPackage.id,
        );
        setDecisionExecutionPackage(transitioned);
        setDecisionOrchestratorEvents(
          services.decisionOrchestrator.getHistory(transitioned.id),
        );
        setDecisionOrchestratorIndexCount(
          services.decisionOrchestrator.getIndex().list(transitioned.id)
            .length,
        );
        setDecisionOrchestratorMessage(
          transitioned.execution.state === 'Completed'
            ? 'Execution completed via transition.'
            : `Transitioned to ${transitioned.execution.currentMove}.`,
        );
      } catch (error) {
        setDecisionOrchestratorMessage(
          error instanceof Error ? error.message : 'Transition failed.',
        );
      }
    },
    completeDecisionExecution(): void {
      if (decisionExecutionPackage === null) {
        setDecisionOrchestratorMessage('Nejdřív Start Execution.');
        return;
      }
      try {
        const completed = services.decisionOrchestratorApi.completeExecution(
          decisionExecutionPackage.id,
        );
        setDecisionExecutionPackage(completed);
        setDecisionOrchestratorEvents(
          services.decisionOrchestrator.getHistory(completed.id),
        );
        setDecisionOrchestratorIndexCount(
          services.decisionOrchestrator.getIndex().list(completed.id).length,
        );
        setDecisionOrchestratorMessage(
          `Completed execution ${completed.execution.id}.`,
        );
      } catch (error) {
        setDecisionOrchestratorMessage(
          error instanceof Error ? error.message : 'Complete failed.',
        );
      }
    },
    validateDecisionExecution(): void {
      if (decisionExecutionPackage === null) {
        setDecisionOrchestratorMessage('Nejdřív Start Execution.');
        return;
      }
      const validated = services.decisionOrchestratorApi.validateExecution(
        decisionExecutionPackage.id,
      );
      setDecisionExecutionPackage(validated);
      setDecisionOrchestratorEvents(
        services.decisionOrchestrator.getHistory(validated.id),
      );
      setDecisionOrchestratorMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    disposeDecisionExecution(): void {
      if (decisionExecutionPackage === null) {
        return;
      }
      const disposed = services.decisionOrchestrator.dispose(
        decisionExecutionPackage.id,
      );
      setDecisionExecutionPackage(disposed);
      setDecisionOrchestratorEvents(
        services.decisionOrchestrator.getHistory(disposed.id),
      );
      setDecisionOrchestratorIndexCount(
        services.decisionOrchestrator.getIndex().list(disposed.id).length,
      );
      setDecisionOrchestratorMessage(null);
    },
    startExperienceRuntime(): void {
      const moveIds =
        decisionStory !== null && decisionStory.moves.length > 0
          ? decisionStory.moves.map((move) => move.id)
          : ['move-1', 'move-2', 'move-3'];
      const sessionId = runtimeSession?.id ?? 'runtime-session-demo';
      const storyId = decisionStory?.id ?? 'decision-story-demo';
      const started = services.experienceRuntimeApi.startRuntime({
        sessionId,
        storyId,
        moveIds,
        title: `Runtime Execution ${sessionId}`,
        personalizedContextPackageId: personalizedContextPackage?.id ?? null,
        behaviorEvaluationId: behaviorEvaluation?.id ?? null,
        moduleIds: experience?.modules.map((moduleId) => moduleId) ?? [
          'module-priority',
          'module-faq',
        ],
      });
      setRuntimeExecutionPackage(started);
      setExperienceRuntimeEvents(
        services.experienceRuntimeOrchestrator.getHistory(started.id),
      );
      setExperienceRuntimeIndexCount(
        services.experienceRuntimeOrchestrator.getIndex().list(started.id)
          .length,
      );
      setExperienceRuntimeMessage(
        `Started runtime for ${sessionId}. Sources unchanged.`,
      );
    },
    nextExperienceRuntimeMove(): void {
      if (runtimeExecutionPackage === null) {
        setExperienceRuntimeMessage('Nejdřív Start Runtime.');
        return;
      }
      try {
        const next = services.experienceRuntimeApi.nextMove(
          runtimeExecutionPackage.id,
        );
        setRuntimeExecutionPackage(next);
        setExperienceRuntimeEvents(
          services.experienceRuntimeOrchestrator.getHistory(next.id),
        );
        setExperienceRuntimeIndexCount(
          services.experienceRuntimeOrchestrator.getIndex().list(next.id)
            .length,
        );
        setExperienceRuntimeMessage(
          next.execution.status === 'Completed'
            ? 'Runtime completed via next.'
            : `Next → ${next.execution.currentMove}.`,
        );
      } catch (error) {
        setExperienceRuntimeMessage(
          error instanceof Error ? error.message : 'Next failed.',
        );
      }
    },
    previousExperienceRuntimeMove(): void {
      if (runtimeExecutionPackage === null) {
        setExperienceRuntimeMessage('Nejdřív Start Runtime.');
        return;
      }
      try {
        const previous = services.experienceRuntimeApi.previousMove(
          runtimeExecutionPackage.id,
        );
        setRuntimeExecutionPackage(previous);
        setExperienceRuntimeEvents(
          services.experienceRuntimeOrchestrator.getHistory(previous.id),
        );
        setExperienceRuntimeMessage(
          `Previous → ${previous.execution.currentMove}.`,
        );
      } catch (error) {
        setExperienceRuntimeMessage(
          error instanceof Error ? error.message : 'Previous failed.',
        );
      }
    },
    jumpExperienceRuntimeMove(): void {
      if (runtimeExecutionPackage === null) {
        setExperienceRuntimeMessage('Nejdřív Start Runtime.');
        return;
      }
      const moveIds =
        decisionStory !== null && decisionStory.moves.length > 0
          ? decisionStory.moves.map((move) => move.id)
          : ['move-1', 'move-2', 'move-3'];
      const target =
        moveIds.find(
          (moveId) => moveId !== runtimeExecutionPackage.execution.currentMove,
        ) ?? moveIds[0];
      if (target === undefined) {
        setExperienceRuntimeMessage('Žádný jump target.');
        return;
      }
      try {
        const jumped = services.experienceRuntimeApi.jumpToMove(
          runtimeExecutionPackage.id,
          target,
        );
        setRuntimeExecutionPackage(jumped);
        setExperienceRuntimeEvents(
          services.experienceRuntimeOrchestrator.getHistory(jumped.id),
        );
        setExperienceRuntimeMessage(`Jump → ${jumped.execution.currentMove}.`);
      } catch (error) {
        setExperienceRuntimeMessage(
          error instanceof Error ? error.message : 'Jump failed.',
        );
      }
    },
    completeExperienceRuntime(): void {
      if (runtimeExecutionPackage === null) {
        setExperienceRuntimeMessage('Nejdřív Start Runtime.');
        return;
      }
      try {
        const completed = services.experienceRuntimeApi.completeRuntime(
          runtimeExecutionPackage.id,
        );
        setRuntimeExecutionPackage(completed);
        setExperienceRuntimeEvents(
          services.experienceRuntimeOrchestrator.getHistory(completed.id),
        );
        setExperienceRuntimeIndexCount(
          services.experienceRuntimeOrchestrator.getIndex().list(completed.id)
            .length,
        );
        setExperienceRuntimeMessage(
          `Completed runtime ${completed.execution.id}.`,
        );
      } catch (error) {
        setExperienceRuntimeMessage(
          error instanceof Error ? error.message : 'Complete failed.',
        );
      }
    },
    validateExperienceRuntime(): void {
      if (runtimeExecutionPackage === null) {
        setExperienceRuntimeMessage('Nejdřív Start Runtime.');
        return;
      }
      const validated = services.experienceRuntimeApi.validateRuntime(
        runtimeExecutionPackage.id,
      );
      setRuntimeExecutionPackage(validated);
      setExperienceRuntimeEvents(
        services.experienceRuntimeOrchestrator.getHistory(validated.id),
      );
      setExperienceRuntimeMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    disposeExperienceRuntime(): void {
      if (runtimeExecutionPackage === null) {
        return;
      }
      const disposed = services.experienceRuntimeOrchestrator.dispose(
        runtimeExecutionPackage.id,
      );
      setRuntimeExecutionPackage(disposed);
      setExperienceRuntimeEvents(
        services.experienceRuntimeOrchestrator.getHistory(disposed.id),
      );
      setExperienceRuntimeIndexCount(
        services.experienceRuntimeOrchestrator.getIndex().list(disposed.id)
          .length,
      );
      setExperienceRuntimeMessage(null);
    },
    initializeExperienceModules(): void {
      const sessionId = runtimeSession?.id ?? 'runtime-session-demo';
      const moduleIds =
        experience !== null && experience.modules.length > 0
          ? experience.modules.map((moduleId) => moduleId)
          : [...BASIC_MODULE_SEQUENCE];
      const initialized = services.experienceModuleCoordinator.initialize({
        sessionId,
        moduleIds,
        title: `Experience Modules ${sessionId}`,
      });
      setExperienceModulePackage(initialized);
      setModuleCoordinatorEvents(
        services.experienceModuleCoordinator.getHistory(initialized.id),
      );
      setModuleCoordinatorIndexCount(
        services.experienceModuleCoordinator.getIndex().list(initialized.id)
          .length,
      );
      setModuleCoordinatorMessage(
        `Initialized ${moduleIds.length} modules. Sources unchanged.`,
      );
    },
    activateExperienceModule(): void {
      if (experienceModulePackage === null) {
        setModuleCoordinatorMessage('Nejdřív Initialize.');
        return;
      }
      const target =
        experienceModulePackage.modules.find(
          (item) => item.status === 'Pending',
        )?.moduleId ??
        experienceModulePackage.modules[0]?.moduleId ??
        null;
      if (target === null) {
        setModuleCoordinatorMessage('Žádný modul k aktivaci.');
        return;
      }
      try {
        const activated =
          services.experienceModuleCoordinatorApi.activateModule(
            experienceModulePackage.id,
            target,
          );
        setExperienceModulePackage(activated);
        setModuleCoordinatorEvents(
          services.experienceModuleCoordinator.getHistory(activated.id),
        );
        setModuleCoordinatorIndexCount(
          services.experienceModuleCoordinator.getIndex().list(activated.id)
            .length,
        );
        setModuleCoordinatorMessage(`Activated ${target}.`);
      } catch (error) {
        setModuleCoordinatorMessage(
          error instanceof Error ? error.message : 'Activate failed.',
        );
      }
    },
    transitionExperienceModule(): void {
      if (experienceModulePackage === null) {
        setModuleCoordinatorMessage('Nejdřív Initialize.');
        return;
      }
      try {
        const transitioned =
          services.experienceModuleCoordinatorApi.transitionModule(
            experienceModulePackage.id,
          );
        setExperienceModulePackage(transitioned);
        setModuleCoordinatorEvents(
          services.experienceModuleCoordinator.getHistory(transitioned.id),
        );
        setModuleCoordinatorIndexCount(
          services.experienceModuleCoordinator.getIndex().list(transitioned.id)
            .length,
        );
        setModuleCoordinatorMessage(
          transitioned.metadata.activeModuleId === null
            ? 'Module sequence completed.'
            : `Transition → ${transitioned.metadata.activeModuleId}.`,
        );
      } catch (error) {
        setModuleCoordinatorMessage(
          error instanceof Error ? error.message : 'Transition failed.',
        );
      }
    },
    completeExperienceModules(): void {
      if (experienceModulePackage === null) {
        setModuleCoordinatorMessage('Nejdřív Initialize.');
        return;
      }
      try {
        const completed =
          services.experienceModuleCoordinatorApi.completeModule(
            experienceModulePackage.id,
          );
        setExperienceModulePackage(completed);
        setModuleCoordinatorEvents(
          services.experienceModuleCoordinator.getHistory(completed.id),
        );
        setModuleCoordinatorIndexCount(
          services.experienceModuleCoordinator.getIndex().list(completed.id)
            .length,
        );
        setModuleCoordinatorMessage(`Completed package ${completed.id}.`);
      } catch (error) {
        setModuleCoordinatorMessage(
          error instanceof Error ? error.message : 'Complete failed.',
        );
      }
    },
    validateExperienceModules(): void {
      if (experienceModulePackage === null) {
        setModuleCoordinatorMessage('Nejdřív Initialize.');
        return;
      }
      const validated =
        services.experienceModuleCoordinatorApi.validateModules(
          experienceModulePackage.id,
        );
      setExperienceModulePackage(validated);
      setModuleCoordinatorEvents(
        services.experienceModuleCoordinator.getHistory(validated.id),
      );
      setModuleCoordinatorMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    disposeExperienceModules(): void {
      if (experienceModulePackage === null) {
        return;
      }
      const disposed = services.experienceModuleCoordinator.dispose(
        experienceModulePackage.id,
      );
      setExperienceModulePackage(disposed);
      setModuleCoordinatorEvents(
        services.experienceModuleCoordinator.getHistory(disposed.id),
      );
      setModuleCoordinatorIndexCount(
        services.experienceModuleCoordinator.getIndex().list(disposed.id)
          .length,
      );
      setModuleCoordinatorMessage(null);
    },
    createExperienceState(): void {
      const sessionId = runtimeSession?.id ?? 'runtime-session-demo';
      const activeModule =
        experienceModulePackage?.metadata.activeModuleId ?? 'hero';
      const activeMove =
        runtimeExecutionPackage?.execution.currentMove ??
        decisionExecutionPackage?.execution.currentMove ??
        'move-1';
      const activeModuleExecution =
        experienceModulePackage?.modules.find(
          (item) => item.moduleId === activeModule,
        ) ?? null;
      const created = services.experienceStateApi.createState({
        sessionId,
        runtimeExecutionId: runtimeExecutionPackage?.execution.id ?? null,
        moduleExecutionId: activeModuleExecution?.id ?? null,
        activeModule,
        activeMove,
        title: `Experience State ${sessionId}`,
      });
      setExperienceStatePackage(created);
      setExperienceStateEvents(
        services.experienceStateManager.getHistory(created.id),
      );
      setExperienceStateIndexCount(
        services.experienceStateManager.getIndex().list(created.id).length,
      );
      setExperienceStateMessage(
        `Created state for ${sessionId}. Sources unchanged.`,
      );
    },
    updateExperienceState(): void {
      if (experienceStatePackage === null) {
        setExperienceStateMessage('Nejdřív Create State.');
        return;
      }
      try {
        const nextModule =
          experienceStatePackage.state.metadata.activeModule === 'hero'
            ? 'priority'
            : experienceStatePackage.state.metadata.activeModule === 'priority'
              ? 'faq'
              : 'lead-capture';
        const nextMove =
          experienceStatePackage.state.metadata.activeMove === 'move-1'
            ? 'move-2'
            : 'move-3';
        const updated = services.experienceStateApi.updateState(
          experienceStatePackage.id,
          {
            activeModule: nextModule,
            activeMove: nextMove,
            runtimeExecutionId:
              runtimeExecutionPackage?.execution.id ??
              experienceStatePackage.state.runtimeExecutionId,
            moduleExecutionId: `module-execution-${nextModule}`,
            notes: 'Updated from diagnostic Overview.',
          },
        );
        setExperienceStatePackage(updated);
        setExperienceStateEvents(
          services.experienceStateManager.getHistory(updated.id),
        );
        setExperienceStateMessage(
          `Updated → ${updated.state.currentState}.`,
        );
      } catch (error) {
        setExperienceStateMessage(
          error instanceof Error ? error.message : 'Update failed.',
        );
      }
    },
    checkpointExperienceState(): void {
      if (experienceStatePackage === null) {
        setExperienceStateMessage('Nejdřív Create State.');
        return;
      }
      try {
        const checked = services.experienceStateApi.createCheckpoint(
          experienceStatePackage.id,
          'overview-checkpoint',
        );
        setExperienceStatePackage(checked);
        setExperienceStateEvents(
          services.experienceStateManager.getHistory(checked.id),
        );
        setExperienceStateIndexCount(
          services.experienceStateManager.getIndex().list(checked.id).length,
        );
        setExperienceStateMessage(
          `Checkpoint ${checked.state.checkpointId}.`,
        );
      } catch (error) {
        setExperienceStateMessage(
          error instanceof Error ? error.message : 'Checkpoint failed.',
        );
      }
    },
    restoreExperienceState(): void {
      if (experienceStatePackage === null) {
        setExperienceStateMessage('Nejdřív Create State.');
        return;
      }
      const checkpointId =
        experienceStatePackage.state.checkpointId ??
        experienceStatePackage.checkpoints[
          experienceStatePackage.checkpoints.length - 1
        ]?.id ??
        null;
      if (checkpointId === null) {
        setExperienceStateMessage('Nejdřív Checkpoint.');
        return;
      }
      try {
        const restored = services.experienceStateApi.restoreState(
          experienceStatePackage.id,
          checkpointId,
        );
        setExperienceStatePackage(restored);
        setExperienceStateEvents(
          services.experienceStateManager.getHistory(restored.id),
        );
        setExperienceStateMessage(
          `Restored from ${checkpointId} (${restored.state.metadata.restoreStatus}).`,
        );
      } catch (error) {
        setExperienceStateMessage(
          error instanceof Error ? error.message : 'Restore failed.',
        );
      }
    },
    completeExperienceState(): void {
      if (experienceStatePackage === null) {
        setExperienceStateMessage('Nejdřív Create State.');
        return;
      }
      try {
        const completed = services.experienceStateManager.complete(
          experienceStatePackage.id,
        );
        setExperienceStatePackage(completed);
        setExperienceStateEvents(
          services.experienceStateManager.getHistory(completed.id),
        );
        setExperienceStateMessage(`Completed state ${completed.state.id}.`);
      } catch (error) {
        setExperienceStateMessage(
          error instanceof Error ? error.message : 'Complete failed.',
        );
      }
    },
    validateExperienceState(): void {
      if (experienceStatePackage === null) {
        setExperienceStateMessage('Nejdřív Create State.');
        return;
      }
      const validated = services.experienceStateApi.validateState(
        experienceStatePackage.id,
      );
      setExperienceStatePackage(validated);
      setExperienceStateEvents(
        services.experienceStateManager.getHistory(validated.id),
      );
      setExperienceStateMessage(
        validated.validation?.valid
          ? 'Validation OK.'
          : 'Validation failed.',
      );
    },
    disposeExperienceState(): void {
      if (experienceStatePackage === null) {
        return;
      }
      const disposed = services.experienceStateManager.dispose(
        experienceStatePackage.id,
      );
      setExperienceStatePackage(disposed);
      setExperienceStateEvents(
        services.experienceStateManager.getHistory(disposed.id),
      );
      setExperienceStateIndexCount(
        services.experienceStateManager.getIndex().list(disposed.id).length,
      );
      setExperienceStateMessage(null);
    },
    collectRuntimeObservability(): void {
      const sessionId =
        experienceStatePackage?.state.sessionId ??
        runtimeExecutionPackage?.execution.sessionId ??
        experienceModulePackage?.metadata.sessionId ??
        decisionExecutionPackage?.execution.sessionId ??
        'runtime-session-demo';
      const sources = buildRuntimeEventSources({
        sessionId,
        experienceRuntimeEvents,
        moduleCoordinatorEvents,
        experienceStateEvents,
        decisionOrchestratorEvents,
        runtimeExecutionId:
          runtimeExecutionPackage?.execution.id ??
          experienceStatePackage?.state.runtimeExecutionId ??
          null,
      });
      const collected = services.runtimeObservabilityApi.collectRuntime({
        sessionId,
        title: 'Builder Runtime Observability',
        sources,
      });
      setObservabilityPackage(collected);
      setObservabilityEvents(services.runtimeObservabilityEngine.getEvents());
      setObservabilityIndexCount(
        services.runtimeObservabilityEngine.getIndex().length,
      );
      setObservabilityMessage(
        `Collected ${collected.timeline.events.length} observations (${collected.metrics.health}).`,
      );
    },
    publishRuntimeObservability(): void {
      if (observabilityPackage === null) {
        setObservabilityMessage('Nejdřív Collect Runtime.');
        return;
      }
      try {
        const published = services.runtimeObservabilityApi.publishObservability(
          observabilityPackage.id,
        );
        setObservabilityPackage(published);
        setObservabilityEvents(services.runtimeObservabilityEngine.getEvents());
        setObservabilityMessage(`Published ${published.id}.`);
      } catch (error) {
        setObservabilityMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeObservability(): void {
      if (observabilityPackage === null) {
        setObservabilityMessage('Nejdřív Collect Runtime.');
        return;
      }
      const validation =
        services.runtimeObservabilityApi.validateObservability(
          observabilityPackage.id,
        );
      const previewed =
        services.runtimeObservabilityApi.previewObservability(
          observabilityPackage.id,
        );
      if (previewed !== null) {
        setObservabilityPackage(previewed);
      }
      setObservabilityEvents(services.runtimeObservabilityEngine.getEvents());
      setObservabilityMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeObservability(): void {
      if (observabilityPackage === null) {
        return;
      }
      const disposed = services.runtimeObservabilityEngine.dispose(
        observabilityPackage.id,
      );
      setObservabilityPackage(disposed);
      setObservabilityEvents(services.runtimeObservabilityEngine.getEvents());
      setObservabilityIndexCount(
        services.runtimeObservabilityEngine.getIndex().length,
      );
      setObservabilityMessage(null);
    },
    inspectRuntimeHealth(): void {
      const sessionId =
        observabilityPackage?.metadata.sessionId ??
        experienceStatePackage?.state.sessionId ??
        runtimeExecutionPackage?.execution.sessionId ??
        'runtime-session-demo';
      const obs = observabilityPackage;
      const inspected = services.runtimeHealthApi.inspectRuntime({
        sessionId,
        runtimeExecutionId:
          runtimeExecutionPackage?.execution.id ??
          experienceStatePackage?.state.runtimeExecutionId ??
          null,
        title: 'Builder Runtime Health',
        observabilityPackageId: obs?.id ?? null,
        observationCount: obs?.metrics.observationCount ?? 4,
        executionCount: obs?.metrics.executionCount ?? 2,
        moduleEventCount: obs?.metrics.moduleEventCount ?? 2,
        stateEventCount: obs?.metrics.stateEventCount ?? 1,
        observabilityHealth: obs?.metrics.health ?? 'Healthy',
        observabilityHealthScore: obs?.metrics.healthScore ?? 0.8,
        hasTimeline: (obs?.timeline.events.length ?? 4) > 0,
        stateConsistent:
          experienceStatePackage?.validation?.valid !== false,
        transitionConsistent: true,
        validationPassed:
          obs?.validation?.valid ??
          experienceStatePackage?.validation?.valid ??
          true,
      });
      setRuntimeHealthPackage(inspected);
      setRuntimeHealthEvents(services.runtimeHealthEngine.getEvents());
      setRuntimeHealthIndexCount(
        services.runtimeHealthEngine.getIndex().length,
      );
      setRuntimeHealthMessage(
        `Health ${inspected.report.overallHealth} (score ${inspected.report.score}).`,
      );
    },
    publishRuntimeHealth(): void {
      if (runtimeHealthPackage === null) {
        setRuntimeHealthMessage('Nejdřív Inspect Runtime.');
        return;
      }
      try {
        const published = services.runtimeHealthApi.publishHealth(
          runtimeHealthPackage.id,
        );
        setRuntimeHealthPackage(published);
        setRuntimeHealthEvents(services.runtimeHealthEngine.getEvents());
        setRuntimeHealthMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeHealthMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeHealth(): void {
      if (runtimeHealthPackage === null) {
        setRuntimeHealthMessage('Nejdřív Inspect Runtime.');
        return;
      }
      const validation = services.runtimeHealthApi.validateHealth(
        runtimeHealthPackage.id,
      );
      const previewed = services.runtimeHealthApi.previewHealth(
        runtimeHealthPackage.id,
      );
      if (previewed !== null) {
        setRuntimeHealthPackage(previewed);
      }
      setRuntimeHealthEvents(services.runtimeHealthEngine.getEvents());
      setRuntimeHealthMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeHealth(): void {
      if (runtimeHealthPackage === null) {
        return;
      }
      const disposed = services.runtimeHealthEngine.dispose(
        runtimeHealthPackage.id,
      );
      setRuntimeHealthPackage(disposed);
      setRuntimeHealthEvents(services.runtimeHealthEngine.getEvents());
      setRuntimeHealthIndexCount(
        services.runtimeHealthEngine.getIndex().length,
      );
      setRuntimeHealthMessage(null);
    },
    recordRuntimeAudit(): void {
      const sessionId =
        observabilityPackage?.metadata.sessionId ??
        runtimeHealthPackage?.metadata.sessionId ??
        experienceStatePackage?.state.sessionId ??
        runtimeExecutionPackage?.execution.sessionId ??
        'runtime-session-demo';
      const sources = buildAuditEventSources({
        sessionId,
        decisionOrchestratorEvents,
        experienceRuntimeEvents,
        moduleCoordinatorEvents,
        experienceStateEvents,
        observabilityEvents,
        runtimeHealthEvents,
        runtimeExecutionId:
          runtimeExecutionPackage?.execution.id ??
          experienceStatePackage?.state.runtimeExecutionId ??
          null,
        moduleExecutionId:
          experienceStatePackage?.state.moduleExecutionId ?? null,
        observabilityPackageId: observabilityPackage?.id ?? null,
        healthPackageId: runtimeHealthPackage?.id ?? null,
      });
      const recorded = services.runtimeAuditApi.recordAudit({
        sessionId,
        title: 'Builder Runtime Audit',
        sources,
      });
      setRuntimeAuditPackage(recorded);
      setRuntimeAuditEvents(services.runtimeAuditEngine.getEvents());
      setRuntimeAuditIndexCount(services.runtimeAuditEngine.getIndex().length);
      setRuntimeAuditMessage(
        `Recorded ${recorded.trail.records.length} audit records.`,
      );
    },
    publishRuntimeAudit(): void {
      if (runtimeAuditPackage === null) {
        setRuntimeAuditMessage('Nejdřív Record Audit.');
        return;
      }
      try {
        const published = services.runtimeAuditApi.publishAudit(
          runtimeAuditPackage.id,
        );
        setRuntimeAuditPackage(published);
        setRuntimeAuditEvents(services.runtimeAuditEngine.getEvents());
        setRuntimeAuditIndexCount(
          services.runtimeAuditEngine.getIndex().length,
        );
        setRuntimeAuditMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeAuditMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeAudit(): void {
      if (runtimeAuditPackage === null) {
        setRuntimeAuditMessage('Nejdřív Record Audit.');
        return;
      }
      const validation = services.runtimeAuditApi.validateAudit(
        runtimeAuditPackage.id,
      );
      const previewed = services.runtimeAuditApi.previewAudit(
        runtimeAuditPackage.id,
      );
      if (previewed !== null) {
        setRuntimeAuditPackage(previewed);
      }
      setRuntimeAuditEvents(services.runtimeAuditEngine.getEvents());
      setRuntimeAuditMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeAudit(): void {
      if (runtimeAuditPackage === null) {
        return;
      }
      const disposed = services.runtimeAuditEngine.dispose(
        runtimeAuditPackage.id,
      );
      setRuntimeAuditPackage(disposed);
      setRuntimeAuditEvents(services.runtimeAuditEngine.getEvents());
      setRuntimeAuditIndexCount(services.runtimeAuditEngine.getIndex().length);
      setRuntimeAuditMessage(null);
    },
    evaluateRuntimeGovernance(): void {
      const sessionId =
        runtimeAuditPackage?.metadata.sessionId ??
        runtimeHealthPackage?.metadata.sessionId ??
        observabilityPackage?.metadata.sessionId ??
        experienceStatePackage?.state.sessionId ??
        runtimeExecutionPackage?.execution.sessionId ??
        'runtime-session-demo';
      const evaluated = services.runtimeGovernanceApi.evaluateGovernance({
        sessionId,
        runtimeExecutionId:
          runtimeExecutionPackage?.execution.id ??
          experienceStatePackage?.state.runtimeExecutionId ??
          runtimeHealthPackage?.report.runtimeExecutionId ??
          'runtime-execution-demo',
        title: 'Builder Runtime Governance',
        hasObservability: true,
        observabilityHealthy:
          observabilityPackage?.metrics.health !== 'Degraded',
        healthScore: runtimeHealthPackage?.report.score ?? 0.8,
        healthOverall: runtimeHealthPackage?.report.overallHealth ?? 'Healthy',
        hasAuditTrail: true,
        auditImmutable: runtimeAuditPackage?.metadata.immutable ?? true,
        auditValidated: runtimeAuditPackage?.validation?.valid ?? true,
        healthValidated: runtimeHealthPackage?.validation?.valid ?? true,
        observabilityValidated:
          observabilityPackage?.validation?.valid ?? true,
      });
      setRuntimeGovernancePackage(evaluated);
      setRuntimeGovernanceEvents(services.runtimeGovernanceEngine.getEvents());
      setRuntimeGovernanceIndexCount(
        services.runtimeGovernanceEngine.getIndex().length,
      );
      setRuntimeGovernanceMessage(
        `Governance ${evaluated.evaluation.overallStatus} (score ${evaluated.evaluation.score}).`,
      );
    },
    publishRuntimeGovernance(): void {
      if (runtimeGovernancePackage === null) {
        setRuntimeGovernanceMessage('Nejdřív Evaluate Governance.');
        return;
      }
      try {
        const published = services.runtimeGovernanceApi.publishGovernance(
          runtimeGovernancePackage.id,
        );
        setRuntimeGovernancePackage(published);
        setRuntimeGovernanceEvents(
          services.runtimeGovernanceEngine.getEvents(),
        );
        setRuntimeGovernanceMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeGovernanceMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeGovernance(): void {
      if (runtimeGovernancePackage === null) {
        setRuntimeGovernanceMessage('Nejdřív Evaluate Governance.');
        return;
      }
      const validation = services.runtimeGovernanceApi.validateGovernance(
        runtimeGovernancePackage.id,
      );
      const previewed = services.runtimeGovernanceApi.previewGovernance(
        runtimeGovernancePackage.id,
      );
      if (previewed !== null) {
        setRuntimeGovernancePackage(previewed);
      }
      setRuntimeGovernanceEvents(services.runtimeGovernanceEngine.getEvents());
      setRuntimeGovernanceMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeGovernance(): void {
      if (runtimeGovernancePackage === null) {
        return;
      }
      const disposed = services.runtimeGovernanceEngine.dispose(
        runtimeGovernancePackage.id,
      );
      setRuntimeGovernancePackage(disposed);
      setRuntimeGovernanceEvents(services.runtimeGovernanceEngine.getEvents());
      setRuntimeGovernanceIndexCount(
        services.runtimeGovernanceEngine.getIndex().length,
      );
      setRuntimeGovernanceMessage(null);
    },
    initializeRuntimePolicies(): void {
      const initialized = services.runtimePolicyApi.initialize(
        'Builder Runtime Policies',
      );
      setRuntimePolicyPackage(initialized);
      setRuntimePolicyEvents(services.runtimePolicyEngine.getEvents());
      setRuntimePolicyIndexCount(
        services.runtimePolicyEngine.getIndex().length,
      );
      setRuntimePolicyMessage(
        `Initialized registry with ${initialized.registry.policies.length} policies.`,
      );
    },
    registerRuntimePolicy(): void {
      try {
        const registered = services.runtimePolicyApi.registerPolicy({
          name: 'Platform Integrity',
          category: 'Platform',
          description: 'Platform policy integrity must remain consistent.',
          code: `platform-integrity-${Date.now().toString(36)}`,
          severity: 'warning',
        });
        setRuntimePolicyPackage(registered);
        setRuntimePolicyEvents(services.runtimePolicyEngine.getEvents());
        setRuntimePolicyIndexCount(
          services.runtimePolicyEngine.getIndex().length,
        );
        setRuntimePolicyMessage(
          `Registered policy (total ${registered.registry.policies.length}).`,
        );
      } catch (error) {
        setRuntimePolicyMessage(
          error instanceof Error ? error.message : 'Register failed.',
        );
      }
    },
    publishRuntimePolicies(): void {
      if (runtimePolicyPackage === null) {
        setRuntimePolicyMessage('Nejdřív Initialize Registry.');
        return;
      }
      try {
        const published = services.runtimePolicyApi.publishPolicies();
        setRuntimePolicyPackage(published);
        setRuntimePolicyEvents(services.runtimePolicyEngine.getEvents());
        setRuntimePolicyMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimePolicyMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimePolicies(): void {
      if (runtimePolicyPackage === null) {
        setRuntimePolicyMessage('Nejdřív Initialize Registry.');
        return;
      }
      const validation = services.runtimePolicyApi.validatePolicies();
      const previewed = services.runtimePolicyApi.preview();
      if (previewed !== null) {
        setRuntimePolicyPackage(previewed);
      }
      setRuntimePolicyEvents(services.runtimePolicyEngine.getEvents());
      setRuntimePolicyMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimePolicies(): void {
      if (runtimePolicyPackage === null) {
        return;
      }
      const disposed = services.runtimePolicyApi.dispose();
      setRuntimePolicyPackage(disposed);
      setRuntimePolicyEvents(services.runtimePolicyEngine.getEvents());
      setRuntimePolicyIndexCount(
        services.runtimePolicyEngine.getIndex().length,
      );
      setRuntimePolicyMessage(null);
    },
    evaluateRuntimeEnforcement(): void {
      const sessionId =
        runtimeGovernancePackage?.evaluation.sessionId ??
        runtimeHealthPackage?.report.sessionId ??
        observabilityPackage?.metadata.sessionId ??
        experienceStatePackage?.state.sessionId ??
        runtimeExecutionPackage?.execution.sessionId ??
        'runtime-session-demo';
      const gov = runtimeGovernancePackage?.evaluation ?? null;
      const evaluated = services.runtimeEnforcementApi.evaluateEnforcement({
        sessionId,
        runtimeExecutionId:
          gov?.runtimeExecutionId ??
          runtimeExecutionPackage?.execution.id ??
          experienceStatePackage?.state.runtimeExecutionId ??
          'runtime-execution-demo',
        title: 'Builder Runtime Enforcement',
        governanceStatus: gov?.overallStatus ?? 'Compliant',
        governanceScore: gov?.score ?? 1,
        failedPolicyCodes:
          gov?.failedRules.map((rule) => rule.metadata.code) ?? [],
        failedSeverities:
          gov?.failedRules.map((rule) => rule.severity) ?? [],
      });
      setRuntimeEnforcementPackage(evaluated);
      setRuntimeEnforcementEvents(
        services.runtimeEnforcementEngine.getEvents(),
      );
      setRuntimeEnforcementIndexCount(
        services.runtimeEnforcementEngine.getIndex().length,
      );
      setRuntimeEnforcementMessage(
        `Decision ${evaluated.decision.status} → ${evaluated.decision.recommendedAction}.`,
      );
    },
    publishRuntimeEnforcement(): void {
      if (runtimeEnforcementPackage === null) {
        setRuntimeEnforcementMessage('Nejdřív Evaluate Enforcement.');
        return;
      }
      try {
        const published = services.runtimeEnforcementApi.publishEnforcement(
          runtimeEnforcementPackage.id,
        );
        setRuntimeEnforcementPackage(published);
        setRuntimeEnforcementEvents(
          services.runtimeEnforcementEngine.getEvents(),
        );
        setRuntimeEnforcementMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeEnforcementMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeEnforcement(): void {
      if (runtimeEnforcementPackage === null) {
        setRuntimeEnforcementMessage('Nejdřív Evaluate Enforcement.');
        return;
      }
      const validation = services.runtimeEnforcementApi.validateEnforcement(
        runtimeEnforcementPackage.id,
      );
      const previewed = services.runtimeEnforcementApi.previewEnforcement(
        runtimeEnforcementPackage.id,
      );
      if (previewed !== null) {
        setRuntimeEnforcementPackage(previewed);
      }
      setRuntimeEnforcementEvents(
        services.runtimeEnforcementEngine.getEvents(),
      );
      setRuntimeEnforcementMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeEnforcement(): void {
      if (runtimeEnforcementPackage === null) {
        return;
      }
      const disposed = services.runtimeEnforcementEngine.dispose(
        runtimeEnforcementPackage.id,
      );
      setRuntimeEnforcementPackage(disposed);
      setRuntimeEnforcementEvents(
        services.runtimeEnforcementEngine.getEvents(),
      );
      setRuntimeEnforcementIndexCount(
        services.runtimeEnforcementEngine.getIndex().length,
      );
      setRuntimeEnforcementMessage(null);
    },
    evaluateRuntimeResilience(): void {
      const sessionId =
        runtimeEnforcementPackage?.decision.sessionId ??
        runtimeHealthPackage?.report.sessionId ??
        runtimeGovernancePackage?.evaluation.sessionId ??
        observabilityPackage?.metadata.sessionId ??
        experienceStatePackage?.state.sessionId ??
        runtimeExecutionPackage?.execution.sessionId ??
        'runtime-session-demo';
      const health = runtimeHealthPackage?.report ?? null;
      const enforcement = runtimeEnforcementPackage?.decision ?? null;
      const evaluated = services.runtimeResilienceApi.evaluateRecovery({
        sessionId,
        runtimeExecutionId:
          enforcement?.runtimeExecutionId ??
          health?.runtimeExecutionId ??
          runtimeExecutionPackage?.execution.id ??
          experienceStatePackage?.state.runtimeExecutionId ??
          'runtime-execution-demo',
        title: 'Builder Runtime Resilience',
        healthStatus: health?.overallHealth ?? 'Healthy',
        healthScore: health?.score ?? 1,
        enforcementStatus: enforcement?.status ?? 'ALLOW',
        disruptionCodes: [],
        moduleFailures: [],
        hasCheckpoint: true,
      });
      setRuntimeResiliencePackage(evaluated);
      setRuntimeResilienceEvents(services.runtimeResilienceEngine.getEvents());
      setRuntimeResilienceIndexCount(
        services.runtimeResilienceEngine.getIndex().length,
      );
      setRuntimeResilienceMessage(
        `Plan ${evaluated.recoveryPlan.recoveryStrategy} → ${evaluated.recoveryPlan.estimatedRecoveryLevel}.`,
      );
    },
    publishRuntimeResilience(): void {
      if (runtimeResiliencePackage === null) {
        setRuntimeResilienceMessage('Nejdřív Evaluate Recovery.');
        return;
      }
      try {
        const published = services.runtimeResilienceApi.publishRecovery(
          runtimeResiliencePackage.id,
        );
        setRuntimeResiliencePackage(published);
        setRuntimeResilienceEvents(
          services.runtimeResilienceEngine.getEvents(),
        );
        setRuntimeResilienceMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeResilienceMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeResilience(): void {
      if (runtimeResiliencePackage === null) {
        setRuntimeResilienceMessage('Nejdřív Evaluate Recovery.');
        return;
      }
      const validation = services.runtimeResilienceApi.validateRecovery(
        runtimeResiliencePackage.id,
      );
      const previewed = services.runtimeResilienceApi.previewRecovery(
        runtimeResiliencePackage.id,
      );
      if (previewed !== null) {
        setRuntimeResiliencePackage(previewed);
      }
      setRuntimeResilienceEvents(services.runtimeResilienceEngine.getEvents());
      setRuntimeResilienceMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeResilience(): void {
      if (runtimeResiliencePackage === null) {
        return;
      }
      const disposed = services.runtimeResilienceEngine.dispose(
        runtimeResiliencePackage.id,
      );
      setRuntimeResiliencePackage(disposed);
      setRuntimeResilienceEvents(services.runtimeResilienceEngine.getEvents());
      setRuntimeResilienceIndexCount(
        services.runtimeResilienceEngine.getIndex().length,
      );
      setRuntimeResilienceMessage(null);
    },
    buildRuntimeRecovery(): void {
      const plan = runtimeResiliencePackage?.recoveryPlan ?? null;
      const sessionId =
        plan?.sessionId ??
        runtimeEnforcementPackage?.decision.sessionId ??
        runtimeHealthPackage?.report.sessionId ??
        'runtime-session-demo';
      const built = services.runtimeRecoveryApi.buildRecoverySequence({
        sessionId,
        runtimeExecutionId:
          plan?.runtimeExecutionId ??
          runtimeEnforcementPackage?.decision.runtimeExecutionId ??
          runtimeExecutionPackage?.execution.id ??
          'runtime-execution-demo',
        title: 'Builder Runtime Recovery',
        planId: plan?.id ?? 'recovery-plan-demo',
        recoveryStrategy: plan?.recoveryStrategy ?? 'CONTINUE',
        severity: plan?.severity ?? 'info',
        recommendedSteps:
          plan?.recommendedSteps.map((step) => ({
            id: step.id,
            step: step.step,
            description: step.description,
            priority: step.priority,
          })) ?? [],
      });
      setRuntimeRecoveryPackage(built);
      setRuntimeRecoveryEvents(
        services.runtimeRecoveryOrchestrator.getEvents(),
      );
      setRuntimeRecoveryIndexCount(
        services.runtimeRecoveryOrchestrator.getIndex().length,
      );
      setRuntimeRecoveryMessage(
        `Sequence ${built.sequence.id} · ${built.sequence.steps.length} steps · ${built.sequence.estimatedDuration}s.`,
      );
    },
    publishRuntimeRecovery(): void {
      if (runtimeRecoveryPackage === null) {
        setRuntimeRecoveryMessage('Nejdřív Build Sequence.');
        return;
      }
      try {
        const published = services.runtimeRecoveryApi.publishRecoverySequence(
          runtimeRecoveryPackage.id,
        );
        setRuntimeRecoveryPackage(published);
        setRuntimeRecoveryEvents(
          services.runtimeRecoveryOrchestrator.getEvents(),
        );
        setRuntimeRecoveryMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeRecoveryMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeRecovery(): void {
      if (runtimeRecoveryPackage === null) {
        setRuntimeRecoveryMessage('Nejdřív Build Sequence.');
        return;
      }
      const validation = services.runtimeRecoveryApi.validateRecoverySequence(
        runtimeRecoveryPackage.id,
      );
      const previewed = services.runtimeRecoveryApi.previewRecoverySequence(
        runtimeRecoveryPackage.id,
      );
      if (previewed !== null) {
        setRuntimeRecoveryPackage(previewed);
      }
      setRuntimeRecoveryEvents(
        services.runtimeRecoveryOrchestrator.getEvents(),
      );
      setRuntimeRecoveryMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeRecovery(): void {
      if (runtimeRecoveryPackage === null) {
        return;
      }
      const disposed = services.runtimeRecoveryOrchestrator.dispose(
        runtimeRecoveryPackage.id,
      );
      setRuntimeRecoveryPackage(disposed);
      setRuntimeRecoveryEvents(
        services.runtimeRecoveryOrchestrator.getEvents(),
      );
      setRuntimeRecoveryIndexCount(
        services.runtimeRecoveryOrchestrator.getIndex().length,
      );
      setRuntimeRecoveryMessage(null);
    },
    executeRuntimeRecoveryExecution(): void {
      const sequence =
        runtimeRecoveryPackage?.sequence ??
        ({
          id: 'recovery-sequence-demo',
          runtimeExecutionId:
            runtimeResiliencePackage?.recoveryPlan.runtimeExecutionId ??
            runtimeExecutionPackage?.execution.id ??
            'runtime-execution-demo',
          steps: [
            {
              id: 'recovery-step-demo-1',
              order: 1,
              action: 'ConfirmHealth' as const,
              description: 'Confirm Runtime remains healthy.',
              dependsOn: [],
              metadata: {
                notes: 'Demo step',
                sourceActionId: null,
                estimatedSeconds: 30,
              },
            },
            {
              id: 'recovery-step-demo-2',
              order: 2,
              action: 'ContinueSession' as const,
              description:
                'Continue current Decision Session without interruption.',
              dependsOn: ['recovery-step-demo-1'],
              metadata: {
                notes: 'Demo step',
                sourceActionId: null,
                estimatedSeconds: 15,
              },
            },
          ],
          estimatedDuration: 45,
          riskLevel: 'low' as const,
          createdAt: new Date().toISOString(),
          metadata: {
            title: 'Demo Recovery Sequence',
            notes: 'Fallback sequence for Recovery Executor demo.',
            sessionId:
              runtimeResiliencePackage?.recoveryPlan.sessionId ??
              'runtime-session-demo',
            planId:
              runtimeResiliencePackage?.recoveryPlan.id ??
              'recovery-plan-demo',
            recoveryStrategy: 'CONTINUE',
          },
        } as const);
      const executed = services.runtimeRecoveryExecutionApi.executeRecovery({
        sessionId: sequence.metadata.sessionId,
        title: 'Builder Runtime Recovery Execution',
        sequence,
        failOnStepId: null,
      });
      setRuntimeRecoveryExecutionPackage(executed);
      setRuntimeRecoveryExecutionEvents(
        services.runtimeRecoveryExecutor.getEvents(),
      );
      setRuntimeRecoveryExecutionIndexCount(
        services.runtimeRecoveryExecutor.getIndex().length,
      );
      setRuntimeRecoveryExecutionMessage(
        `Execution ${executed.execution.status} · ${executed.result?.completedSteps.length ?? 0}/${executed.execution.metadata.totalSteps} steps.`,
      );
    },
    pauseRuntimeRecoveryExecution(): void {
      if (runtimeRecoveryExecutionPackage === null) {
        setRuntimeRecoveryExecutionMessage('Nejdřív Execute Recovery.');
        return;
      }
      try {
        const paused = services.runtimeRecoveryExecutionApi.pauseRecovery(
          runtimeRecoveryExecutionPackage.id,
        );
        setRuntimeRecoveryExecutionPackage(paused);
        setRuntimeRecoveryExecutionEvents(
          services.runtimeRecoveryExecutor.getEvents(),
        );
        setRuntimeRecoveryExecutionMessage(
          `Paused at ${paused.execution.currentStep ?? 'start'}.`,
        );
      } catch (error) {
        setRuntimeRecoveryExecutionMessage(
          error instanceof Error ? error.message : 'Pause failed.',
        );
      }
    },
    resumeRuntimeRecoveryExecution(): void {
      if (runtimeRecoveryExecutionPackage === null) {
        setRuntimeRecoveryExecutionMessage('Nejdřív Execute Recovery.');
        return;
      }
      try {
        const resumed = services.runtimeRecoveryExecutionApi.resumeRecovery(
          runtimeRecoveryExecutionPackage.id,
        );
        setRuntimeRecoveryExecutionPackage(resumed);
        setRuntimeRecoveryExecutionEvents(
          services.runtimeRecoveryExecutor.getEvents(),
        );
        setRuntimeRecoveryExecutionMessage(
          `Resumed → ${resumed.execution.status}.`,
        );
      } catch (error) {
        setRuntimeRecoveryExecutionMessage(
          error instanceof Error ? error.message : 'Resume failed.',
        );
      }
    },
    validateRuntimeRecoveryExecution(): void {
      if (runtimeRecoveryExecutionPackage === null) {
        setRuntimeRecoveryExecutionMessage('Nejdřív Execute Recovery.');
        return;
      }
      const validation =
        services.runtimeRecoveryExecutionApi.validateRecoveryExecution(
          runtimeRecoveryExecutionPackage.id,
        );
      const previewed =
        services.runtimeRecoveryExecutionApi.previewRecoveryExecution(
          runtimeRecoveryExecutionPackage.id,
        );
      if (previewed !== null) {
        setRuntimeRecoveryExecutionPackage(previewed);
      }
      setRuntimeRecoveryExecutionEvents(
        services.runtimeRecoveryExecutor.getEvents(),
      );
      setRuntimeRecoveryExecutionMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    publishRuntimeRecoveryExecution(): void {
      if (runtimeRecoveryExecutionPackage === null) {
        setRuntimeRecoveryExecutionMessage('Nejdřív Execute Recovery.');
        return;
      }
      try {
        const published =
          services.runtimeRecoveryExecutionApi.publishRecoveryExecution(
            runtimeRecoveryExecutionPackage.id,
          );
        setRuntimeRecoveryExecutionPackage(published);
        setRuntimeRecoveryExecutionEvents(
          services.runtimeRecoveryExecutor.getEvents(),
        );
        setRuntimeRecoveryExecutionMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeRecoveryExecutionMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    disposeRuntimeRecoveryExecution(): void {
      if (runtimeRecoveryExecutionPackage === null) {
        return;
      }
      const disposed = services.runtimeRecoveryExecutor.dispose(
        runtimeRecoveryExecutionPackage.id,
      );
      setRuntimeRecoveryExecutionPackage(disposed);
      setRuntimeRecoveryExecutionEvents(
        services.runtimeRecoveryExecutor.getEvents(),
      );
      setRuntimeRecoveryExecutionIndexCount(
        services.runtimeRecoveryExecutor.getIndex().length,
      );
      setRuntimeRecoveryExecutionMessage(null);
    },
    startRuntimeRecoveryCoordinator(): void {
      const execution = runtimeRecoveryExecutionPackage?.execution ?? null;
      const started =
        services.runtimeRecoveryCoordinatorApi.startRecoverySession({
          sessionId:
            execution?.metadata.sessionId ??
            runtimeRecoveryPackage?.metadata.sessionId ??
            runtimeResiliencePackage?.recoveryPlan.sessionId ??
            'runtime-session-demo',
          runtimeExecutionId:
            execution?.runtimeExecutionId ??
            runtimeRecoveryPackage?.sequence.runtimeExecutionId ??
            'runtime-execution-demo',
          title: 'Builder Runtime Recovery Coordinator',
          executions: [
            {
              executionId: execution?.id ?? 'recovery-execution-demo',
              status: execution?.status ?? 'COMPLETED',
              sequenceId:
                execution?.sequenceId ??
                runtimeRecoveryPackage?.sequence.id ??
                'recovery-sequence-demo',
            },
          ],
        });
      let next = started;
      if (started.summary === null) {
        next =
          services.runtimeRecoveryCoordinatorApi.completeRecoverySession(
            started.id,
          );
      }
      setRuntimeRecoveryCoordinatorPackage(next);
      setRuntimeRecoveryCoordinatorEvents(
        services.runtimeRecoveryCoordinator.getEvents(),
      );
      setRuntimeRecoveryCoordinatorIndexCount(
        services.runtimeRecoveryCoordinator.getIndex().length,
      );
      setRuntimeRecoveryCoordinatorMessage(
        `Session ${next.session.status} · ${next.session.metadata.progressPercent}% · summary ${next.summary?.id ?? 'pending'}.`,
      );
    },
    completeRuntimeRecoveryCoordinator(): void {
      if (runtimeRecoveryCoordinatorPackage === null) {
        setRuntimeRecoveryCoordinatorMessage('Nejdřív Start Session.');
        return;
      }
      const completed =
        services.runtimeRecoveryCoordinatorApi.completeRecoverySession(
          runtimeRecoveryCoordinatorPackage.id,
        );
      setRuntimeRecoveryCoordinatorPackage(completed);
      setRuntimeRecoveryCoordinatorEvents(
        services.runtimeRecoveryCoordinator.getEvents(),
      );
      setRuntimeRecoveryCoordinatorMessage(
        `Completed → ${completed.session.status}.`,
      );
    },
    publishRuntimeRecoveryCoordinator(): void {
      if (runtimeRecoveryCoordinatorPackage === null) {
        setRuntimeRecoveryCoordinatorMessage('Nejdřív Start Session.');
        return;
      }
      try {
        const published =
          services.runtimeRecoveryCoordinatorApi.publishRecoverySummary(
            runtimeRecoveryCoordinatorPackage.id,
          );
        setRuntimeRecoveryCoordinatorPackage(published);
        setRuntimeRecoveryCoordinatorEvents(
          services.runtimeRecoveryCoordinator.getEvents(),
        );
        setRuntimeRecoveryCoordinatorMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeRecoveryCoordinatorMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeRecoveryCoordinator(): void {
      if (runtimeRecoveryCoordinatorPackage === null) {
        setRuntimeRecoveryCoordinatorMessage('Nejdřív Start Session.');
        return;
      }
      const validation =
        services.runtimeRecoveryCoordinatorApi.validateRecoverySession(
          runtimeRecoveryCoordinatorPackage.id,
        );
      const previewed =
        services.runtimeRecoveryCoordinatorApi.previewRecoverySummary(
          runtimeRecoveryCoordinatorPackage.id,
        );
      if (previewed !== null) {
        setRuntimeRecoveryCoordinatorPackage(previewed);
      }
      setRuntimeRecoveryCoordinatorEvents(
        services.runtimeRecoveryCoordinator.getEvents(),
      );
      setRuntimeRecoveryCoordinatorMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeRecoveryCoordinator(): void {
      if (runtimeRecoveryCoordinatorPackage === null) {
        return;
      }
      const disposed = services.runtimeRecoveryCoordinator.dispose(
        runtimeRecoveryCoordinatorPackage.id,
      );
      setRuntimeRecoveryCoordinatorPackage(disposed);
      setRuntimeRecoveryCoordinatorEvents(
        services.runtimeRecoveryCoordinator.getEvents(),
      );
      setRuntimeRecoveryCoordinatorIndexCount(
        services.runtimeRecoveryCoordinator.getIndex().length,
      );
      setRuntimeRecoveryCoordinatorMessage(null);
    },
    generateRuntimeRecoveryReporting(): void {
      const coordinator = runtimeRecoveryCoordinatorPackage;
      const execution = runtimeRecoveryExecutionPackage;
      const generated =
        services.runtimeRecoveryReportingApi.generateRecoveryReport({
          sessionId:
            coordinator?.session.metadata.sessionId ??
            execution?.execution.metadata.sessionId ??
            'runtime-session-demo',
          runtimeExecutionId:
            coordinator?.session.runtimeExecutionId ??
            execution?.execution.runtimeExecutionId ??
            'runtime-execution-demo',
          title: 'Builder Runtime Recovery Report',
          recoverySessionId: coordinator?.session.id ?? 'recovery-session-demo',
          recoverySummaryId: coordinator?.summary?.id ?? null,
          finalStatus:
            coordinator?.summary?.finalStatus ??
            coordinator?.session.status ??
            execution?.execution.status ??
            'COMPLETED',
          duration:
            coordinator?.summary?.duration ??
            execution?.result?.duration ??
            45,
          summaryText:
            coordinator?.summary !== null && coordinator?.summary !== undefined
              ? `Recovery ${coordinator.summary.finalStatus} · ${coordinator.summary.completedExecutions} completed · ${coordinator.summary.failedExecutions} failed.`
              : null,
          executions:
            coordinator?.session.executions.map((item) => ({
              executionId: item.executionId,
              status: item.status,
              duration: execution?.result?.duration ?? 45,
              description: `Coordinated execution ${item.executionId}`,
              sequenceId: item.sequenceId,
            })) ??
            (execution !== null
              ? [
                  {
                    executionId: execution.execution.id,
                    status: execution.execution.status,
                    duration: execution.result?.duration ?? 45,
                    description: 'Primary recovery execution',
                    sequenceId: execution.execution.sequenceId,
                  },
                ]
              : [
                  {
                    executionId: 'recovery-execution-demo',
                    status: 'COMPLETED',
                    duration: 45,
                    description: 'Demo recovery execution',
                    sequenceId: 'recovery-sequence-demo',
                  },
                ]),
        });
      setRuntimeRecoveryReportingPackage(generated);
      setRuntimeRecoveryReportingEvents(
        services.runtimeRecoveryReportingEngine.getEvents(),
      );
      setRuntimeRecoveryReportingIndexCount(
        services.runtimeRecoveryReportingEngine.getIndex().length,
      );
      setRuntimeRecoveryReportingMessage(
        `Report ${generated.report.finalStatus} · ${generated.report.executions.length} item(s) · ${generated.report.duration}s.`,
      );
    },
    publishRuntimeRecoveryReporting(): void {
      if (runtimeRecoveryReportingPackage === null) {
        setRuntimeRecoveryReportingMessage('Nejdřív Generate Report.');
        return;
      }
      try {
        const published =
          services.runtimeRecoveryReportingApi.publishRecoveryReport(
            runtimeRecoveryReportingPackage.id,
          );
        setRuntimeRecoveryReportingPackage(published);
        setRuntimeRecoveryReportingEvents(
          services.runtimeRecoveryReportingEngine.getEvents(),
        );
        setRuntimeRecoveryReportingMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeRecoveryReportingMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeRecoveryReporting(): void {
      if (runtimeRecoveryReportingPackage === null) {
        setRuntimeRecoveryReportingMessage('Nejdřív Generate Report.');
        return;
      }
      const validation =
        services.runtimeRecoveryReportingApi.validateRecoveryReport(
          runtimeRecoveryReportingPackage.id,
        );
      const previewed =
        services.runtimeRecoveryReportingApi.previewRecoveryReport(
          runtimeRecoveryReportingPackage.id,
        );
      if (previewed !== null) {
        setRuntimeRecoveryReportingPackage(previewed);
      }
      setRuntimeRecoveryReportingEvents(
        services.runtimeRecoveryReportingEngine.getEvents(),
      );
      setRuntimeRecoveryReportingMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeRecoveryReporting(): void {
      if (runtimeRecoveryReportingPackage === null) {
        return;
      }
      const disposed = services.runtimeRecoveryReportingEngine.dispose(
        runtimeRecoveryReportingPackage.id,
      );
      setRuntimeRecoveryReportingPackage(disposed);
      setRuntimeRecoveryReportingEvents(
        services.runtimeRecoveryReportingEngine.getEvents(),
      );
      setRuntimeRecoveryReportingIndexCount(
        services.runtimeRecoveryReportingEngine.getIndex().length,
      );
      setRuntimeRecoveryReportingMessage(null);
    },
    collectRuntimeOperations(): void {
      const collected = services.runtimeOperationsApi.collectOperations({
        sessionId:
          runtimeRecoveryCoordinatorPackage?.session.metadata.sessionId ??
          runtimeRecoveryReportingPackage?.report.sessionId ??
          runtimeEnforcementPackage?.decision.sessionId ??
          runtimeHealthPackage?.report.sessionId ??
          'runtime-session-demo',
        runtimeExecutionId:
          runtimeRecoveryCoordinatorPackage?.session.runtimeExecutionId ??
          runtimeRecoveryReportingPackage?.report.runtimeExecutionId ??
          runtimeEnforcementPackage?.decision.runtimeExecutionId ??
          runtimeExecutionPackage?.execution.id ??
          'runtime-execution-demo',
        title: 'Builder Runtime Operations',
        policyStatus:
          runtimePolicyPackage?.metadata.status ?? 'Unknown',
        governanceStatus:
          runtimeGovernancePackage?.evaluation.overallStatus ?? 'Unknown',
        healthStatus:
          runtimeHealthPackage?.report.overallHealth ?? 'Unknown',
        auditStatus: runtimeAuditPackage?.metadata.status ?? 'Unknown',
        enforcementStatus:
          runtimeEnforcementPackage?.decision.status ?? 'Unknown',
        recoveryStatus:
          runtimeRecoveryReportingPackage?.report.finalStatus ??
          runtimeRecoveryCoordinatorPackage?.session.status ??
          runtimeRecoveryExecutionPackage?.execution.status ??
          'Unknown',
        observabilityStatus:
          observabilityPackage?.metadata.status ?? 'Unknown',
        lastReportId: runtimeRecoveryReportingPackage?.report.id ?? null,
        lastReportStatus:
          runtimeRecoveryReportingPackage?.report.finalStatus ?? null,
      });
      setRuntimeOperationsPackage(collected);
      setRuntimeOperationsEvents(
        services.runtimeOperationsDashboard.getEvents(),
      );
      setRuntimeOperationsIndexCount(
        services.runtimeOperationsDashboard.getIndex().length,
      );
      setRuntimeOperationsMessage(
        `Snapshot ${collected.snapshot.id} · recovery ${collected.snapshot.recoveryStatus}.`,
      );
    },
    publishRuntimeOperations(): void {
      if (runtimeOperationsPackage === null) {
        setRuntimeOperationsMessage('Nejdřív Collect Operations.');
        return;
      }
      try {
        const published = services.runtimeOperationsApi.publishOperations(
          runtimeOperationsPackage.id,
        );
        setRuntimeOperationsPackage(published);
        setRuntimeOperationsEvents(
          services.runtimeOperationsDashboard.getEvents(),
        );
        setRuntimeOperationsMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeOperationsMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeOperations(): void {
      if (runtimeOperationsPackage === null) {
        setRuntimeOperationsMessage('Nejdřív Collect Operations.');
        return;
      }
      const validation = services.runtimeOperationsApi.validateOperations(
        runtimeOperationsPackage.id,
      );
      const previewed = services.runtimeOperationsApi.previewOperations(
        runtimeOperationsPackage.id,
      );
      if (previewed !== null) {
        setRuntimeOperationsPackage(previewed);
      }
      setRuntimeOperationsEvents(
        services.runtimeOperationsDashboard.getEvents(),
      );
      setRuntimeOperationsMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeOperations(): void {
      if (runtimeOperationsPackage === null) {
        return;
      }
      const disposed = services.runtimeOperationsDashboard.dispose(
        runtimeOperationsPackage.id,
      );
      setRuntimeOperationsPackage(disposed);
      setRuntimeOperationsEvents(
        services.runtimeOperationsDashboard.getEvents(),
      );
      setRuntimeOperationsIndexCount(
        services.runtimeOperationsDashboard.getIndex().length,
      );
      setRuntimeOperationsMessage(null);
    },
    registerRuntimeIntegration(): void {
      const sessionId =
        runtimeOperationsPackage?.metadata.sessionId ??
        runtimeRecoveryReportingPackage?.report.sessionId ??
        runtimeEnforcementPackage?.decision.sessionId ??
        runtimeHealthPackage?.report.sessionId ??
        'runtime-session-demo';
      const packages = [
        {
          packageId: runtimePolicyPackage?.id ?? 'runtime-policy-package-demo',
          packageType: 'Policy' as const,
          version: runtimePolicyPackage?.version ?? '1.0.0',
          source: 'Runtime Policy Engine',
          publishedAt: runtimePolicyPackage?.updatedAt ?? null,
          title: runtimePolicyPackage?.metadata.title ?? 'Policy Package',
          status: runtimePolicyPackage?.metadata.status ?? 'Published',
        },
        {
          packageId:
            runtimeGovernancePackage?.id ?? 'runtime-governance-package-demo',
          packageType: 'Governance' as const,
          version: runtimeGovernancePackage?.version ?? '1.0.0',
          source: 'Runtime Governance Engine',
          publishedAt: runtimeGovernancePackage?.updatedAt ?? null,
          title:
            runtimeGovernancePackage?.metadata.title ?? 'Governance Package',
          status: runtimeGovernancePackage?.metadata.status ?? 'Published',
        },
        {
          packageId: observabilityPackage?.id ?? 'runtime-observability-demo',
          packageType: 'Observability' as const,
          version: observabilityPackage?.version ?? '1.0.0',
          source: 'Runtime Observability',
          publishedAt: observabilityPackage?.updatedAt ?? null,
          title: observabilityPackage?.metadata.title ?? 'Observability Package',
          status: observabilityPackage?.metadata.status ?? 'Published',
        },
        {
          packageId: runtimeHealthPackage?.id ?? 'runtime-health-package-demo',
          packageType: 'Health' as const,
          version: runtimeHealthPackage?.version ?? '1.0.0',
          source: 'Runtime Health Engine',
          publishedAt: runtimeHealthPackage?.updatedAt ?? null,
          title: runtimeHealthPackage?.metadata.title ?? 'Health Package',
          status: runtimeHealthPackage?.metadata.status ?? 'Published',
        },
        {
          packageId: runtimeAuditPackage?.id ?? 'runtime-audit-package-demo',
          packageType: 'Audit' as const,
          version: runtimeAuditPackage?.version ?? '1.0.0',
          source: 'Runtime Audit Engine',
          publishedAt: runtimeAuditPackage?.updatedAt ?? null,
          title: runtimeAuditPackage?.metadata.title ?? 'Audit Package',
          status: runtimeAuditPackage?.metadata.status ?? 'Published',
        },
        {
          packageId:
            runtimeEnforcementPackage?.id ?? 'runtime-enforcement-package-demo',
          packageType: 'Enforcement' as const,
          version: runtimeEnforcementPackage?.version ?? '1.0.0',
          source: 'Runtime Policy Enforcement',
          publishedAt: runtimeEnforcementPackage?.updatedAt ?? null,
          title:
            runtimeEnforcementPackage?.metadata.title ?? 'Enforcement Package',
          status: runtimeEnforcementPackage?.metadata.status ?? 'Published',
        },
        {
          packageId:
            runtimeResiliencePackage?.id ?? 'runtime-resilience-package-demo',
          packageType: 'Resilience' as const,
          version: runtimeResiliencePackage?.version ?? '1.0.0',
          source: 'Runtime Resilience Engine',
          publishedAt: runtimeResiliencePackage?.updatedAt ?? null,
          title:
            runtimeResiliencePackage?.metadata.title ?? 'Resilience Package',
          status: runtimeResiliencePackage?.metadata.status ?? 'Published',
        },
        {
          packageId:
            runtimeRecoveryReportingPackage?.id ??
            runtimeRecoveryPackage?.id ??
            'runtime-recovery-package-demo',
          packageType: 'Recovery' as const,
          version:
            runtimeRecoveryReportingPackage?.version ??
            runtimeRecoveryPackage?.version ??
            '1.0.0',
          source: 'Runtime Recovery Reporting',
          publishedAt:
            runtimeRecoveryReportingPackage?.updatedAt ??
            runtimeRecoveryPackage?.updatedAt ??
            null,
          title:
            runtimeRecoveryReportingPackage?.metadata.title ??
            runtimeRecoveryPackage?.metadata.title ??
            'Recovery Package',
          status:
            runtimeRecoveryReportingPackage?.metadata.status ??
            runtimeRecoveryPackage?.metadata.status ??
            'Published',
        },
        {
          packageId:
            runtimeOperationsPackage?.id ?? 'runtime-operations-package-demo',
          packageType: 'Operations' as const,
          version: runtimeOperationsPackage?.version ?? '1.0.0',
          source: 'Runtime Operations Dashboard',
          publishedAt: runtimeOperationsPackage?.updatedAt ?? null,
          title:
            runtimeOperationsPackage?.metadata.title ?? 'Operations Package',
          status: runtimeOperationsPackage?.metadata.status ?? 'Published',
        },
      ];
      const registered = services.runtimeIntegrationApi.initialize({
        sessionId,
        title: 'Builder Runtime Integration',
        packages,
      });
      setRuntimeIntegrationPackage(registered);
      setRuntimeIntegrationEvents(
        services.runtimeIntegrationHub.getEvents(),
      );
      setRuntimeIntegrationIndexCount(
        services.runtimeIntegrationHub.getIndex().length,
      );
      setRuntimeIntegrationMessage(
        `Catalog ${registered.catalog.id} · ${registered.catalog.records.length} package(s).`,
      );
    },
    publishRuntimeIntegration(): void {
      if (runtimeIntegrationPackage === null) {
        setRuntimeIntegrationMessage('Nejdřív Register Packages.');
        return;
      }
      try {
        const published = services.runtimeIntegrationApi.publishRuntimeCatalog(
          runtimeIntegrationPackage.id,
        );
        setRuntimeIntegrationPackage(published);
        setRuntimeIntegrationEvents(
          services.runtimeIntegrationHub.getEvents(),
        );
        setRuntimeIntegrationMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeIntegrationMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeIntegration(): void {
      if (runtimeIntegrationPackage === null) {
        setRuntimeIntegrationMessage('Nejdřív Register Packages.');
        return;
      }
      const validation = services.runtimeIntegrationApi.validateRuntimeCatalog(
        runtimeIntegrationPackage.id,
      );
      const previewed = services.runtimeIntegrationApi.preview(
        runtimeIntegrationPackage.id,
      );
      if (previewed !== null) {
        setRuntimeIntegrationPackage(previewed);
      }
      setRuntimeIntegrationEvents(
        services.runtimeIntegrationHub.getEvents(),
      );
      setRuntimeIntegrationMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeIntegration(): void {
      if (runtimeIntegrationPackage === null) {
        return;
      }
      const disposed = services.runtimeIntegrationHub.dispose(
        runtimeIntegrationPackage.id,
      );
      setRuntimeIntegrationPackage(disposed);
      setRuntimeIntegrationEvents(
        services.runtimeIntegrationHub.getEvents(),
      );
      setRuntimeIntegrationIndexCount(
        services.runtimeIntegrationHub.getIndex().length,
      );
      setRuntimeIntegrationMessage(null);
    },
    registerRuntimeRegistry(): void {
      const sessionId =
        runtimeIntegrationPackage?.metadata.sessionId ??
        runtimeOperationsPackage?.metadata.sessionId ??
        'runtime-session-demo';
      const fromHub =
        runtimeIntegrationPackage?.catalog.records.map((record) => ({
          packageId: record.packageId,
          packageType: record.packageType,
          version: record.version,
          source: record.source,
          publishedAt: record.publishedAt,
          registeredAt: null,
          title: record.metadata.title,
          status: record.metadata.status,
          notes: record.metadata.notes,
        })) ?? [];
      const packages =
        fromHub.length > 0
          ? fromHub
          : [
              {
                packageId: 'runtime-policy-package-demo',
                packageType: 'Policy' as const,
                version: '1.0.0',
                source: 'Runtime Integration Hub',
                publishedAt: null,
                title: 'Policy Package',
                status: 'Published',
              },
              {
                packageId: 'runtime-governance-package-demo',
                packageType: 'Governance' as const,
                version: '1.0.0',
                source: 'Runtime Integration Hub',
                publishedAt: null,
                title: 'Governance Package',
                status: 'Published',
              },
              {
                packageId: 'runtime-operations-package-demo',
                packageType: 'Operations' as const,
                version: '1.0.0',
                source: 'Runtime Integration Hub',
                publishedAt: null,
                title: 'Operations Package',
                status: 'Published',
              },
            ];
      const registered = services.runtimeRegistryApi.initialize({
        sessionId,
        title: 'Builder Runtime Registry',
        packages,
      });
      setRuntimeRegistryPackage(registered);
      setRuntimeRegistryEvents(
        services.runtimeIntegrationRegistry.getEvents(),
      );
      setRuntimeRegistryIndexCount(
        services.runtimeIntegrationRegistry.getIndex().length,
      );
      setRuntimeRegistryMessage(
        `Registry ${registered.catalog.id} · ${registered.catalog.entries.length} package(s).`,
      );
    },
    publishRuntimeRegistry(): void {
      if (runtimeRegistryPackage === null) {
        setRuntimeRegistryMessage('Nejdřív Register Packages.');
        return;
      }
      try {
        const published = services.runtimeRegistryApi.publishRuntimeRegistry(
          runtimeRegistryPackage.id,
        );
        setRuntimeRegistryPackage(published);
        setRuntimeRegistryEvents(
          services.runtimeIntegrationRegistry.getEvents(),
        );
        setRuntimeRegistryMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeRegistryMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeRegistry(): void {
      if (runtimeRegistryPackage === null) {
        setRuntimeRegistryMessage('Nejdřív Register Packages.');
        return;
      }
      const validation = services.runtimeRegistryApi.validateRuntimeRegistry(
        runtimeRegistryPackage.id,
      );
      const previewed = services.runtimeRegistryApi.preview(
        runtimeRegistryPackage.id,
      );
      if (previewed !== null) {
        setRuntimeRegistryPackage(previewed);
      }
      setRuntimeRegistryEvents(
        services.runtimeIntegrationRegistry.getEvents(),
      );
      setRuntimeRegistryMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeRegistry(): void {
      if (runtimeRegistryPackage === null) {
        return;
      }
      const disposed = services.runtimeIntegrationRegistry.dispose(
        runtimeRegistryPackage.id,
      );
      setRuntimeRegistryPackage(disposed);
      setRuntimeRegistryEvents(
        services.runtimeIntegrationRegistry.getEvents(),
      );
      setRuntimeRegistryIndexCount(
        services.runtimeIntegrationRegistry.getIndex().length,
      );
      setRuntimeRegistryMessage(null);
    },
    generateRuntimeManifest(): void {
      const sessionId =
        runtimeRegistryPackage?.metadata.sessionId ??
        runtimeIntegrationPackage?.metadata.sessionId ??
        runtimeOperationsPackage?.metadata.sessionId ??
        'runtime-session-demo';
      const fromRegistry =
        runtimeRegistryPackage?.catalog.entries.map((entry) => ({
          id: `capability-${entry.packageType.toLowerCase()}`,
          name: entry.packageType,
          version: entry.version,
          packageId: entry.packageId,
          packageType: entry.packageType,
          source: entry.source,
          title: entry.metadata.title,
          notes: entry.metadata.notes,
        })) ?? [];
      const capabilities =
        fromRegistry.length > 0
          ? fromRegistry
          : [
              {
                id: 'capability-policy',
                name: 'Policy',
                version: '1.0.0',
                packageId: 'runtime-policy-package-demo',
                packageType: 'Policy',
                source: 'Runtime Integration Registry',
                title: 'Policy',
              },
              {
                id: 'capability-governance',
                name: 'Governance',
                version: '1.0.0',
                packageId: 'runtime-governance-package-demo',
                packageType: 'Governance',
                source: 'Runtime Integration Registry',
                title: 'Governance',
              },
              {
                id: 'capability-operations',
                name: 'Operations',
                version: '1.0.0',
                packageId: 'runtime-operations-package-demo',
                packageType: 'Operations',
                source: 'Runtime Integration Registry',
                title: 'Operations',
              },
            ];
      const generated = services.runtimeManifestApi.generateRuntimeManifest({
        sessionId,
        title: 'Builder Runtime Manifest',
        registryVersion: runtimeRegistryPackage?.version ?? '1.0.0',
        capabilities,
      });
      setRuntimeManifestPackage(generated);
      setRuntimeManifestEvents(services.runtimeManifestEngine.getEvents());
      setRuntimeManifestIndexCount(
        services.runtimeManifestEngine.getIndex().length,
      );
      setRuntimeManifestMessage(
        `Manifest ${generated.manifest.id} · ${generated.manifest.capabilities.length} capability(ies).`,
      );
    },
    publishRuntimeManifest(): void {
      if (runtimeManifestPackage === null) {
        setRuntimeManifestMessage('Nejdřív Generate Manifest.');
        return;
      }
      try {
        const published = services.runtimeManifestApi.publishRuntimeManifest(
          runtimeManifestPackage.id,
        );
        setRuntimeManifestPackage(published);
        setRuntimeManifestEvents(services.runtimeManifestEngine.getEvents());
        setRuntimeManifestMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeManifestMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeManifest(): void {
      if (runtimeManifestPackage === null) {
        setRuntimeManifestMessage('Nejdřív Generate Manifest.');
        return;
      }
      const validation = services.runtimeManifestApi.validateRuntimeManifest(
        runtimeManifestPackage.id,
      );
      const previewed = services.runtimeManifestApi.previewRuntimeManifest(
        runtimeManifestPackage.id,
      );
      if (previewed !== null) {
        setRuntimeManifestPackage(previewed);
      }
      setRuntimeManifestEvents(services.runtimeManifestEngine.getEvents());
      setRuntimeManifestMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeManifest(): void {
      if (runtimeManifestPackage === null) {
        return;
      }
      const disposed = services.runtimeManifestEngine.dispose(
        runtimeManifestPackage.id,
      );
      setRuntimeManifestPackage(disposed);
      setRuntimeManifestEvents(services.runtimeManifestEngine.getEvents());
      setRuntimeManifestIndexCount(
        services.runtimeManifestEngine.getIndex().length,
      );
      setRuntimeManifestMessage(null);
    },
    registerRuntimeApi(): void {
      const sessionId =
        runtimeManifestPackage?.metadata.sessionId ??
        runtimeRegistryPackage?.metadata.sessionId ??
        runtimeIntegrationPackage?.metadata.sessionId ??
        'runtime-session-demo';
      const fromManifest =
        runtimeManifestPackage?.manifest.capabilities.map((capability) => ({
          capability: capability.id,
          operation: 'preview',
          version: capability.version,
          handler: `runtime.${capability.metadata.packageType.toLowerCase()}.preview`,
          title: `${capability.name} Preview`,
          packageId: capability.package,
          status: 'Available',
          notes: capability.metadata.notes,
        })) ?? [];
      const routes =
        fromManifest.length > 0
          ? fromManifest
          : [
              {
                capability: 'capability-policy',
                operation: 'preview',
                version: '1.0.0',
                handler: 'runtime.policy.preview',
                title: 'Policy Preview',
                packageId: 'runtime-policy-package-demo',
                status: 'Available',
              },
              {
                capability: 'capability-governance',
                operation: 'preview',
                version: '1.0.0',
                handler: 'runtime.governance.preview',
                title: 'Governance Preview',
                packageId: 'runtime-governance-package-demo',
                status: 'Available',
              },
              {
                capability: 'capability-operations',
                operation: 'preview',
                version: '1.0.0',
                handler: 'runtime.operations.preview',
                title: 'Operations Preview',
                packageId: 'runtime-operations-package-demo',
                status: 'Available',
              },
            ];
      const registered = services.runtimeApiGatewayApi.initialize({
        sessionId,
        title: 'Builder Runtime API',
        manifestId: runtimeManifestPackage?.manifest.id ?? null,
        routes,
      });
      setRuntimeApiPackage(registered);
      setRuntimeApiEvents(services.runtimeApiGateway.getEvents());
      setRuntimeApiIndexCount(services.runtimeApiGateway.getIndex().length);
      setRuntimeApiMessage(
        `API ${registered.registry.id} · ${registered.registry.routes.length} route(s).`,
      );
    },
    publishRuntimeApi(): void {
      if (runtimeApiPackage === null) {
        setRuntimeApiMessage('Nejdřív Register Routes.');
        return;
      }
      try {
        const published = services.runtimeApiGatewayApi.publishRuntimeApi(
          runtimeApiPackage.id,
        );
        setRuntimeApiPackage(published);
        setRuntimeApiEvents(services.runtimeApiGateway.getEvents());
        setRuntimeApiMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeApiMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeApi(): void {
      if (runtimeApiPackage === null) {
        setRuntimeApiMessage('Nejdřív Register Routes.');
        return;
      }
      const validation = services.runtimeApiGatewayApi.validateRuntimeApi(
        runtimeApiPackage.id,
      );
      const previewed = services.runtimeApiGatewayApi.preview(
        runtimeApiPackage.id,
      );
      if (previewed !== null) {
        setRuntimeApiPackage(previewed);
      }
      setRuntimeApiEvents(services.runtimeApiGateway.getEvents());
      setRuntimeApiMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeApi(): void {
      if (runtimeApiPackage === null) {
        return;
      }
      const disposed = services.runtimeApiGateway.dispose(runtimeApiPackage.id);
      setRuntimeApiPackage(disposed);
      setRuntimeApiEvents(services.runtimeApiGateway.getEvents());
      setRuntimeApiIndexCount(services.runtimeApiGateway.getIndex().length);
      setRuntimeApiMessage(null);
    },
    registerRuntimeCompatibility(): void {
      const sessionId =
        runtimeApiPackage?.metadata.sessionId ??
        runtimeManifestPackage?.metadata.sessionId ??
        runtimeRegistryPackage?.metadata.sessionId ??
        'runtime-session-demo';
      const runtimeVersion = runtimeManifestPackage?.version ?? '1.0.0';
      const manifestVersion =
        runtimeManifestPackage?.manifest.version ?? '1.0.0';
      const apiVersion = runtimeApiPackage?.version ?? '1.0.0';
      const registered = services.runtimeCompatibilityApi.initialize({
        sessionId,
        title: 'Builder Runtime Compatibility',
        runtimeVersion,
        manifestVersion,
        apiVersion,
        supportedConsumers: [
          'Manager Studio',
          'Sales Studio',
          'Client Studio',
          'API',
        ],
        rules: [
          {
            sourceVersion: runtimeVersion,
            targetVersion: runtimeVersion,
            status: 'Compatible',
            reason: 'Same runtime version.',
            dimension: 'runtime',
            title: 'Runtime self',
          },
          {
            sourceVersion: manifestVersion,
            targetVersion: manifestVersion,
            status: 'Compatible',
            reason: 'Same manifest version.',
            dimension: 'manifest',
            title: 'Manifest self',
          },
          {
            sourceVersion: apiVersion,
            targetVersion: apiVersion,
            status: 'Compatible',
            reason: 'Same API version.',
            dimension: 'api',
            title: 'API self',
          },
          {
            sourceVersion: '1.0.0',
            targetVersion: '1.1.0',
            status: 'Compatible',
            reason: 'Minor bump within major 1.',
            dimension: 'runtime',
            title: 'Runtime minor',
          },
          {
            sourceVersion: '1.0.0',
            targetVersion: '2.0.0',
            status: 'Incompatible',
            reason: 'Major bump requires consumer upgrade.',
            dimension: 'api',
            title: 'API major',
          },
        ],
      });
      setRuntimeCompatibilityPackage(registered);
      setRuntimeCompatibilityEvents(
        services.runtimeCompatibilityManager.getEvents(),
      );
      setRuntimeCompatibilityIndexCount(
        services.runtimeCompatibilityManager.getIndex().length,
      );
      setRuntimeCompatibilityMessage(
        `Matrix ${registered.matrix.id} · ${registered.matrix.rules.length} rule(s) · ${registered.matrix.metadata.overallStatus}.`,
      );
    },
    evaluateRuntimeCompatibility(): void {
      if (runtimeCompatibilityPackage === null) {
        setRuntimeCompatibilityMessage('Nejdřív Register Matrix.');
        return;
      }
      const evaluation =
        services.runtimeCompatibilityApi.evaluateCompatibility(
          runtimeCompatibilityPackage.id,
          {
            sourceVersion:
              runtimeCompatibilityPackage.matrix.runtimeVersion,
            targetVersion: '1.1.0',
            dimension: 'runtime',
          },
        );
      setRuntimeCompatibilityEvents(
        services.runtimeCompatibilityManager.getEvents(),
      );
      setRuntimeCompatibilityMessage(
        `Evaluated ${evaluation.sourceVersion} → ${evaluation.targetVersion}: ${evaluation.status}.`,
      );
    },
    publishRuntimeCompatibility(): void {
      if (runtimeCompatibilityPackage === null) {
        setRuntimeCompatibilityMessage('Nejdřív Register Matrix.');
        return;
      }
      try {
        const published =
          services.runtimeCompatibilityApi.publishCompatibility(
            runtimeCompatibilityPackage.id,
          );
        setRuntimeCompatibilityPackage(published);
        setRuntimeCompatibilityEvents(
          services.runtimeCompatibilityManager.getEvents(),
        );
        setRuntimeCompatibilityMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeCompatibilityMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeCompatibility(): void {
      if (runtimeCompatibilityPackage === null) {
        setRuntimeCompatibilityMessage('Nejdřív Register Matrix.');
        return;
      }
      const validation =
        services.runtimeCompatibilityApi.validateCompatibility(
          runtimeCompatibilityPackage.id,
        );
      const previewed = services.runtimeCompatibilityApi.preview(
        runtimeCompatibilityPackage.id,
      );
      if (previewed !== null) {
        setRuntimeCompatibilityPackage(previewed);
      }
      setRuntimeCompatibilityEvents(
        services.runtimeCompatibilityManager.getEvents(),
      );
      setRuntimeCompatibilityMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeCompatibility(): void {
      if (runtimeCompatibilityPackage === null) {
        return;
      }
      const disposed = services.runtimeCompatibilityManager.dispose(
        runtimeCompatibilityPackage.id,
      );
      setRuntimeCompatibilityPackage(disposed);
      setRuntimeCompatibilityEvents(
        services.runtimeCompatibilityManager.getEvents(),
      );
      setRuntimeCompatibilityIndexCount(
        services.runtimeCompatibilityManager.getIndex().length,
      );
      setRuntimeCompatibilityMessage(null);
    },
    registerRuntimeContracts(): void {
      const sessionId =
        runtimeCompatibilityPackage?.metadata.sessionId ??
        runtimeApiPackage?.metadata.sessionId ??
        runtimeManifestPackage?.metadata.sessionId ??
        'runtime-session-demo';
      const fromManifest =
        runtimeManifestPackage?.manifest.capabilities.map((capability) => ({
          name: `${capability.name} Contract`,
          version: capability.version,
          capability: capability.id,
          operations: [
            {
              operation: 'preview',
              request: `${capability.name}PreviewRequest`,
              response: `${capability.name}PreviewResponse`,
              errors: ['NotFound', 'Unavailable'],
            },
          ],
          dependencies: [...capability.dependencies],
          title: `${capability.name} Contract`,
          compatibility: 'Compatible',
          status: 'Draft' as const,
        })) ?? [];
      const contracts =
        fromManifest.length > 0
          ? fromManifest
          : [
              {
                name: 'Policy Contract',
                version: '1.0.0',
                capability: 'capability-policy',
                operations: [
                  {
                    operation: 'preview',
                    request: 'PolicyPreviewRequest',
                    response: 'PolicyPreviewResponse',
                    errors: ['NotFound'],
                  },
                ],
                dependencies: [],
                title: 'Policy Contract',
                compatibility: 'Compatible',
                status: 'Draft' as const,
              },
              {
                name: 'Governance Contract',
                version: '1.0.0',
                capability: 'capability-governance',
                operations: [
                  {
                    operation: 'preview',
                    request: 'GovernancePreviewRequest',
                    response: 'GovernancePreviewResponse',
                    errors: ['Unavailable'],
                  },
                ],
                dependencies: ['capability-policy'],
                title: 'Governance Contract',
                compatibility: 'Compatible',
                status: 'Draft' as const,
              },
              {
                name: 'Operations Contract',
                version: '1.0.0',
                capability: 'capability-operations',
                operations: [
                  {
                    operation: 'preview',
                    request: 'OperationsPreviewRequest',
                    response: 'OperationsPreviewResponse',
                    errors: ['Unavailable'],
                  },
                ],
                dependencies: ['capability-policy', 'capability-governance'],
                title: 'Operations Contract',
                compatibility: 'Compatible',
                status: 'Draft' as const,
              },
            ];
      const registered = services.runtimeContractApi.initialize({
        sessionId,
        title: 'Builder Runtime Contracts',
        contracts,
      });
      setRuntimeContractPackage(registered);
      setRuntimeContractEvents(services.runtimeContractManager.getEvents());
      setRuntimeContractIndexCount(
        services.runtimeContractManager.getIndex().length,
      );
      setRuntimeContractMessage(
        `Contracts package ${registered.id} · ${registered.contracts.length} contract(s).`,
      );
    },
    publishRuntimeContracts(): void {
      if (runtimeContractPackage === null) {
        setRuntimeContractMessage('Nejdřív Register Contracts.');
        return;
      }
      try {
        const published = services.runtimeContractApi.publishRuntimeContract(
          runtimeContractPackage.id,
        );
        setRuntimeContractPackage(published);
        setRuntimeContractEvents(services.runtimeContractManager.getEvents());
        setRuntimeContractMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeContractMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeContracts(): void {
      if (runtimeContractPackage === null) {
        setRuntimeContractMessage('Nejdřív Register Contracts.');
        return;
      }
      const validation = services.runtimeContractApi.validateRuntimeContract(
        runtimeContractPackage.id,
      );
      const previewed = services.runtimeContractApi.preview(
        runtimeContractPackage.id,
      );
      if (previewed !== null) {
        setRuntimeContractPackage(previewed);
      }
      setRuntimeContractEvents(services.runtimeContractManager.getEvents());
      setRuntimeContractMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeContracts(): void {
      if (runtimeContractPackage === null) {
        return;
      }
      const disposed = services.runtimeContractManager.dispose(
        runtimeContractPackage.id,
      );
      setRuntimeContractPackage(disposed);
      setRuntimeContractEvents(services.runtimeContractManager.getEvents());
      setRuntimeContractIndexCount(
        services.runtimeContractManager.getIndex().length,
      );
      setRuntimeContractMessage(null);
    },
    registerRuntimeExtensions(): void {
      const sessionId =
        runtimeContractPackage?.metadata.sessionId ??
        runtimeCompatibilityPackage?.metadata.sessionId ??
        runtimeApiPackage?.metadata.sessionId ??
        'runtime-session-demo';
      const fromContracts =
        runtimeContractPackage?.contracts.map((contract) => ({
          name: `${contract.name} Extension`,
          version: contract.version,
          capability: contract.capability,
          dependencies: [...contract.dependencies],
          title: `${contract.name} Extension`,
          contractId: contract.id,
          source: 'Runtime Contract Manager',
          status: 'Registered' as const,
        })) ?? [];
      const extensions =
        fromContracts.length > 0
          ? fromContracts
          : [
              {
                name: 'Policy Extension',
                version: '1.0.0',
                capability: 'capability-policy',
                dependencies: [],
                title: 'Policy Extension',
                contractId: 'runtime-contract-policy-demo',
                source: 'Runtime Contract Manager',
                status: 'Registered' as const,
              },
              {
                name: 'Governance Extension',
                version: '1.0.0',
                capability: 'capability-governance',
                dependencies: ['capability-policy'],
                title: 'Governance Extension',
                contractId: 'runtime-contract-governance-demo',
                source: 'Runtime Contract Manager',
                status: 'Registered' as const,
              },
              {
                name: 'Operations Extension',
                version: '1.0.0',
                capability: 'capability-operations',
                dependencies: ['capability-policy', 'capability-governance'],
                title: 'Operations Extension',
                contractId: 'runtime-contract-operations-demo',
                source: 'Runtime Contract Manager',
                status: 'Registered' as const,
              },
            ];
      const registered = services.runtimeExtensionApi.initialize({
        sessionId,
        title: 'Builder Runtime Extensions',
        extensions,
      });
      setRuntimeExtensionPackage(registered);
      setRuntimeExtensionEvents(
        services.runtimeExtensionFramework.getEvents(),
      );
      setRuntimeExtensionIndexCount(
        services.runtimeExtensionFramework.getIndex().length,
      );
      setRuntimeExtensionMessage(
        `Registry ${registered.registry.id} · ${registered.registry.extensions.length} extension(s).`,
      );
    },
    enableRuntimeExtensions(): void {
      if (runtimeExtensionPackage === null) {
        setRuntimeExtensionMessage('Nejdřív Register Extensions.');
        return;
      }
      const target =
        runtimeExtensionPackage.registry.extensions.find(
          (item) =>
            item.status === 'Registered' || item.status === 'Disabled',
        ) ?? runtimeExtensionPackage.registry.extensions[0];
      if (target === undefined) {
        setRuntimeExtensionMessage('Žádné extension k enable.');
        return;
      }
      const enabled = services.runtimeExtensionApi.enableRuntimeExtension(
        runtimeExtensionPackage.id,
        target.id,
      );
      setRuntimeExtensionPackage(enabled);
      setRuntimeExtensionEvents(
        services.runtimeExtensionFramework.getEvents(),
      );
      setRuntimeExtensionMessage(`Enabled ${target.name}.`);
    },
    disableRuntimeExtensions(): void {
      if (runtimeExtensionPackage === null) {
        setRuntimeExtensionMessage('Nejdřív Register Extensions.');
        return;
      }
      const target =
        runtimeExtensionPackage.registry.extensions.find(
          (item) =>
            item.status === 'Enabled' || item.status === 'Published',
        ) ?? runtimeExtensionPackage.registry.extensions[0];
      if (target === undefined) {
        setRuntimeExtensionMessage('Žádné extension k disable.');
        return;
      }
      const disabled = services.runtimeExtensionApi.disableRuntimeExtension(
        runtimeExtensionPackage.id,
        target.id,
      );
      setRuntimeExtensionPackage(disabled);
      setRuntimeExtensionEvents(
        services.runtimeExtensionFramework.getEvents(),
      );
      setRuntimeExtensionMessage(`Disabled ${target.name}.`);
    },
    publishRuntimeExtensions(): void {
      if (runtimeExtensionPackage === null) {
        setRuntimeExtensionMessage('Nejdřív Register Extensions.');
        return;
      }
      try {
        const published =
          services.runtimeExtensionApi.publishRuntimeExtension(
            runtimeExtensionPackage.id,
          );
        setRuntimeExtensionPackage(published);
        setRuntimeExtensionEvents(
          services.runtimeExtensionFramework.getEvents(),
        );
        setRuntimeExtensionMessage(`Published ${published.id}.`);
      } catch (error) {
        setRuntimeExtensionMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateRuntimeExtensions(): void {
      if (runtimeExtensionPackage === null) {
        setRuntimeExtensionMessage('Nejdřív Register Extensions.');
        return;
      }
      const validation =
        services.runtimeExtensionApi.validateRuntimeExtension(
          runtimeExtensionPackage.id,
        );
      const previewed = services.runtimeExtensionApi.preview(
        runtimeExtensionPackage.id,
      );
      if (previewed !== null) {
        setRuntimeExtensionPackage(previewed);
      }
      setRuntimeExtensionEvents(
        services.runtimeExtensionFramework.getEvents(),
      );
      setRuntimeExtensionMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeRuntimeExtensions(): void {
      if (runtimeExtensionPackage === null) {
        return;
      }
      const disposed = services.runtimeExtensionFramework.dispose(
        runtimeExtensionPackage.id,
      );
      setRuntimeExtensionPackage(disposed);
      setRuntimeExtensionEvents(
        services.runtimeExtensionFramework.getEvents(),
      );
      setRuntimeExtensionIndexCount(
        services.runtimeExtensionFramework.getIndex().length,
      );
      setRuntimeExtensionMessage(null);
    },
    buildObjectPublication(): void {
      const sessionId =
        runtimeExtensionPackage?.metadata.sessionId ??
        runtimeContractPackage?.metadata.sessionId ??
        runtimeCompatibilityPackage?.metadata.sessionId ??
        'publication-session-demo';
      const sourceObject = objectPackage;
      const runtimeVersion =
        runtimeManifestPackage?.version ??
        runtimeCompatibilityPackage?.version ??
        '1.0.0';
      const contractVersion =
        runtimeContractPackage?.version ?? '1.0.0';
      const compatibilityVersion =
        runtimeCompatibilityPackage?.version ?? '1.0.0';
      const buildInput =
        sourceObject !== null
          ? {
              objectId: sourceObject.objectId,
              objectVersion: sourceObject.version,
              title: sourceObject.metadata.name,
              runtimeVersion,
              contractVersion,
              compatibilityVersion,
              sourceProjectId: sourceObject.projectId,
              assets: [
                {
                  id: 'asset-hero',
                  kind: 'media',
                  label: 'Hero media',
                  ref: `object://${sourceObject.objectId}/hero`,
                },
                {
                  id: 'asset-layout',
                  kind: 'layout',
                  label: 'Floorplan',
                  ref: `object://${sourceObject.objectId}/layout`,
                },
                {
                  id: 'asset-knowledge',
                  kind: 'knowledge',
                  label: 'Knowledge refs',
                  ref: `object://${sourceObject.objectId}/knowledge`,
                },
              ],
            }
          : {
              objectId: 'object-demo-house',
              objectVersion: '1.0.0',
              title: 'Demo House',
              runtimeVersion,
              contractVersion,
              compatibilityVersion,
              sourceProjectId: 'project-demo',
            };
      const built = services.objectPublicationApi.buildObjectPublication(
        null,
        buildInput,
        {
          sessionId,
          title: 'Builder Object Publication',
          build: buildInput,
        },
      );
      setObjectPublicationPackage(built);
      setObjectPublicationEvents(
        services.objectPublicationPipeline.getEvents(),
      );
      setObjectPublicationIndexCount(
        services.objectPublicationPipeline.getIndex().length,
      );
      setObjectPublicationMessage(
        `Built ${built.objectPackage.id} · ${built.objectPackage.objectId} v${built.objectPackage.version}.`,
      );
    },
    validateObjectPublication(): void {
      if (objectPublicationPackage === null) {
        setObjectPublicationMessage('Nejdřív Build Publication.');
        return;
      }
      const validation = services.objectPublicationApi.validatePublication(
        objectPublicationPackage.id,
      );
      const previewed = services.objectPublicationApi.preview(
        objectPublicationPackage.id,
      );
      if (previewed !== null) {
        setObjectPublicationPackage(previewed);
      }
      setObjectPublicationEvents(
        services.objectPublicationPipeline.getEvents(),
      );
      setObjectPublicationMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    publishObjectPublication(): void {
      if (objectPublicationPackage === null) {
        setObjectPublicationMessage('Nejdřív Build Publication.');
        return;
      }
      try {
        const published = services.objectPublicationApi.publishObject(
          objectPublicationPackage.id,
        );
        setObjectPublicationPackage(published);
        setObjectPublicationEvents(
          services.objectPublicationPipeline.getEvents(),
        );
        setObjectPublicationIndexCount(
          services.objectPublicationPipeline.getIndex().length,
        );
        setObjectPublicationMessage(
          `Published ${published.objectPackage.id}.`,
        );
      } catch (error) {
        const previewed = services.objectPublicationApi.preview(
          objectPublicationPackage.id,
        );
        if (previewed !== null) {
          setObjectPublicationPackage(previewed);
        }
        setObjectPublicationEvents(
          services.objectPublicationPipeline.getEvents(),
        );
        setObjectPublicationMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    disposeObjectPublication(): void {
      if (objectPublicationPackage === null) {
        return;
      }
      const disposed = services.objectPublicationPipeline.dispose(
        objectPublicationPackage.id,
      );
      setObjectPublicationPackage(disposed);
      setObjectPublicationEvents(
        services.objectPublicationPipeline.getEvents(),
      );
      setObjectPublicationIndexCount(
        services.objectPublicationPipeline.getIndex().length,
      );
      setObjectPublicationMessage(null);
    },
    registerPublishedObjects(): void {
      const sessionId =
        objectPublicationPackage?.metadata.sessionId ??
        runtimeExtensionPackage?.metadata.sessionId ??
        'published-object-session-demo';
      const fromPublication =
        objectPublicationPackage !== null &&
        objectPublicationPackage.metadata.status === 'Published'
          ? [
              {
                objectId: objectPublicationPackage.objectPackage.objectId,
                version: objectPublicationPackage.objectPackage.version,
                publicationVersion: objectPublicationPackage.version,
                title: objectPublicationPackage.objectPackage.metadata.title,
                manifest: {
                  id: objectPublicationPackage.objectPackage.manifest.id,
                  objectVersion:
                    objectPublicationPackage.objectPackage.manifest
                      .objectVersion,
                  runtimeVersion:
                    objectPublicationPackage.objectPackage.manifest
                      .runtimeVersion,
                  contractVersion:
                    objectPublicationPackage.objectPackage.manifest
                      .contractVersion,
                  compatibilityVersion:
                    objectPublicationPackage.objectPackage.manifest
                      .compatibilityVersion,
                  generatedAt:
                    objectPublicationPackage.objectPackage.manifest
                      .generatedAt,
                },
                sourcePublicationPackageId: objectPublicationPackage.id,
                sourceObjectPackageId:
                  objectPublicationPackage.objectPackage.id,
                checksum: objectPublicationPackage.objectPackage.checksum,
              },
            ]
          : [];
      const objects =
        fromPublication.length > 0
          ? fromPublication
          : [
              {
                objectId: 'object-demo-house',
                version: '1.0.0',
                publicationVersion: '1.0.0',
                title: 'Demo House',
                manifest: {
                  id: 'publication-manifest-demo',
                  objectVersion: '1.0.0',
                  runtimeVersion: '1.0.0',
                  contractVersion: '1.0.0',
                  compatibilityVersion: '1.0.0',
                  generatedAt: new Date().toISOString(),
                },
                sourcePublicationPackageId: 'publication-package-demo',
                sourceObjectPackageId: 'publication-object-package-demo',
                checksum: 'chk-demo',
              },
              {
                objectId: 'object-demo-apartment',
                version: '1.0.0',
                publicationVersion: '1.0.0',
                title: 'Demo Apartment',
                manifest: {
                  id: 'publication-manifest-demo-2',
                  objectVersion: '1.0.0',
                  runtimeVersion: '1.0.0',
                  contractVersion: '1.0.0',
                  compatibilityVersion: '1.0.0',
                  generatedAt: new Date().toISOString(),
                },
                sourcePublicationPackageId: 'publication-package-demo-2',
                sourceObjectPackageId: 'publication-object-package-demo-2',
                checksum: 'chk-demo-2',
              },
            ];
      const registered = services.publishedObjectApi.initialize({
        sessionId,
        title: 'Builder Published Objects',
        objects,
      });
      setPublishedObjectPackage(registered);
      setPublishedObjectEvents(services.publishedObjectRegistry.getEvents());
      setPublishedObjectIndexCount(
        services.publishedObjectRegistry.getIndex().length,
      );
      setPublishedObjectMessage(
        `Catalog ${registered.catalog.id} · ${registered.catalog.objects.length} object(s).`,
      );
    },
    archivePublishedObjects(): void {
      if (publishedObjectPackage === null) {
        setPublishedObjectMessage('Nejdřív Register Published Objects.');
        return;
      }
      const target =
        publishedObjectPackage.catalog.objects.find(
          (item) => item.status !== 'Archived',
        ) ?? publishedObjectPackage.catalog.objects[0];
      if (target === undefined) {
        setPublishedObjectMessage('Žádný objekt k archive.');
        return;
      }
      const archived = services.publishedObjectApi.archivePublishedObject(
        publishedObjectPackage.id,
        target.id,
      );
      setPublishedObjectPackage(archived);
      setPublishedObjectEvents(services.publishedObjectRegistry.getEvents());
      setPublishedObjectMessage(`Archived ${target.metadata.title}.`);
    },
    validatePublishedObjects(): void {
      if (publishedObjectPackage === null) {
        setPublishedObjectMessage('Nejdřív Register Published Objects.');
        return;
      }
      const validation = services.publishedObjectApi.validatePublishedObject(
        publishedObjectPackage.id,
      );
      const previewed = services.publishedObjectApi.preview(
        publishedObjectPackage.id,
      );
      if (previewed !== null) {
        setPublishedObjectPackage(previewed);
      }
      setPublishedObjectEvents(services.publishedObjectRegistry.getEvents());
      setPublishedObjectMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposePublishedObjects(): void {
      if (publishedObjectPackage === null) {
        return;
      }
      const disposed = services.publishedObjectRegistry.dispose(
        publishedObjectPackage.id,
      );
      setPublishedObjectPackage(disposed);
      setPublishedObjectEvents(services.publishedObjectRegistry.getEvents());
      setPublishedObjectIndexCount(
        services.publishedObjectRegistry.getIndex().length,
      );
      setPublishedObjectMessage(null);
    },
    registerPlatformPublications(): void {
      const sessionId =
        publishedObjectPackage?.metadata.sessionId ??
        objectPublicationPackage?.metadata.sessionId ??
        'platform-publication-session-demo';
      const fromRegistry =
        publishedObjectPackage?.catalog.objects
          .filter((object) => object.status !== 'Archived')
          .map((object) => ({
            objectId: object.objectId,
            publicationVersion: object.publicationVersion,
            title: object.metadata.title,
            category:
              object.objectId.includes('apartment') ||
              object.objectId.includes('house')
                ? ('residential' as const)
                : ('general' as const),
            visibility: 'public' as const,
            sourcePublishedObjectId: object.id,
            objectVersion: object.version,
            runtimeVersion: object.manifest.runtimeVersion,
            status: 'Registered' as const,
          })) ?? [];
      const entries =
        fromRegistry.length > 0
          ? fromRegistry
          : [
              {
                objectId: 'object-demo-house',
                publicationVersion: '1.0.0',
                title: 'Demo House',
                category: 'residential' as const,
                visibility: 'public' as const,
                sourcePublishedObjectId: 'published-object-demo-1',
                objectVersion: '1.0.0',
                runtimeVersion: '1.0.0',
              },
              {
                objectId: 'object-demo-commercial',
                publicationVersion: '1.0.0',
                title: 'Demo Commercial',
                category: 'commercial' as const,
                visibility: 'partner' as const,
                sourcePublishedObjectId: 'published-object-demo-2',
                objectVersion: '1.0.0',
                runtimeVersion: '1.0.0',
              },
            ];
      const registered = services.platformPublicationApi.initialize({
        sessionId,
        title: 'Builder Platform Publication Catalog',
        entries,
      });
      setPlatformPublicationPackage(registered);
      setPlatformPublicationEvents(
        services.platformPublicationCatalog.getEvents(),
      );
      setPlatformPublicationIndexCount(
        services.platformPublicationCatalog.getIndex().length,
      );
      setPlatformPublicationMessage(
        `Snapshot ${registered.snapshot.id} · ${registered.snapshot.entries.length} entr${registered.snapshot.entries.length === 1 ? 'y' : 'ies'}.`,
      );
    },
    refreshPlatformPublications(): void {
      if (platformPublicationPackage === null) {
        setPlatformPublicationMessage('Nejdřív Register Catalog.');
        return;
      }
      try {
        const refreshed =
          services.platformPublicationApi.refreshPlatformPublication(
            platformPublicationPackage.id,
          );
        setPlatformPublicationPackage(refreshed);
        setPlatformPublicationEvents(
          services.platformPublicationCatalog.getEvents(),
        );
        setPlatformPublicationIndexCount(
          services.platformPublicationCatalog.getIndex().length,
        );
        setPlatformPublicationMessage(
          `Refreshed ${refreshed.snapshot.id}.`,
        );
      } catch (error) {
        setPlatformPublicationMessage(
          error instanceof Error ? error.message : 'Refresh failed.',
        );
      }
    },
    validatePlatformPublications(): void {
      if (platformPublicationPackage === null) {
        setPlatformPublicationMessage('Nejdřív Register Catalog.');
        return;
      }
      const validation =
        services.platformPublicationApi.validatePlatformPublication(
          platformPublicationPackage.id,
        );
      const previewed = services.platformPublicationApi.preview(
        platformPublicationPackage.id,
      );
      if (previewed !== null) {
        setPlatformPublicationPackage(previewed);
      }
      setPlatformPublicationEvents(
        services.platformPublicationCatalog.getEvents(),
      );
      setPlatformPublicationMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposePlatformPublications(): void {
      if (platformPublicationPackage === null) {
        return;
      }
      const disposed = services.platformPublicationCatalog.dispose(
        platformPublicationPackage.id,
      );
      setPlatformPublicationPackage(disposed);
      setPlatformPublicationEvents(
        services.platformPublicationCatalog.getEvents(),
      );
      setPlatformPublicationIndexCount(
        services.platformPublicationCatalog.getIndex().length,
      );
      setPlatformPublicationMessage(null);
    },
    loadClientPublication(): void {
      const sessionId =
        platformPublicationPackage?.metadata.sessionId ??
        publishedObjectPackage?.metadata.sessionId ??
        'client-publication-session-demo';
      const source = platformPublicationPackage?.snapshot.entries[0] ?? null;
      const input =
        source !== null
          ? {
              publicationId: source.id,
              objectId: source.objectId,
              version: source.metadata.objectVersion,
              title: source.metadata.title,
              sourceCatalogPackageId: platformPublicationPackage?.id ?? null,
              sourcePlatformEntryId: source.id,
              assets: [
                {
                  id: 'client-asset-hero',
                  kind: 'hero',
                  ref: `client://${source.objectId}/hero`,
                  label: 'Hero asset',
                },
                {
                  id: 'client-asset-gallery',
                  kind: 'gallery',
                  ref: `client://${source.objectId}/gallery`,
                  label: 'Gallery asset',
                },
              ],
            }
          : {
              publicationId: 'platform-publication-demo',
              objectId: 'object-demo-house',
              version: '1.0.0',
              title: 'Demo House',
              assets: [
                {
                  id: 'client-demo-asset-hero',
                  kind: 'hero',
                  ref: 'client://object-demo-house/hero',
                  label: 'Hero asset',
                },
                {
                  id: 'client-demo-asset-gallery',
                  kind: 'gallery',
                  ref: 'client://object-demo-house/gallery',
                  label: 'Gallery asset',
                },
              ],
            };
      const loaded = services.clientPublicationApi.loadClientPublication(
        null,
        input,
        {
          sessionId,
          title: 'Builder Client Publication',
          publication: input,
        },
      );
      setClientPublicationPackage(loaded);
      setClientPublicationEvents(services.clientPublicationAdapter.getEvents());
      setClientPublicationIndexCount(
        services.clientPublicationAdapter.getIndex().length,
      );
      setClientPublicationMessage(
        `Loaded ${loaded.publicationModel.publicationId} for ${loaded.publicationModel.objectId}.`,
      );
    },
    transformClientPublication(): void {
      if (clientPublicationPackage === null) {
        setClientPublicationMessage('Nejdřív Load Publication.');
        return;
      }
      const transformed = services.clientPublicationApi.transformClientPublication(
        clientPublicationPackage.id,
      );
      setClientPublicationPackage(transformed);
      setClientPublicationEvents(services.clientPublicationAdapter.getEvents());
      setClientPublicationIndexCount(
        services.clientPublicationAdapter.getIndex().length,
      );
      setClientPublicationMessage(
        `Transformed ${transformed.publicationModel.publicationId}.`,
      );
    },
    publishClientPublication(): void {
      if (clientPublicationPackage === null) {
        setClientPublicationMessage('Nejdřív Load Publication.');
        return;
      }
      try {
        const published = services.clientPublicationApi.publishClientPublication(
          clientPublicationPackage.id,
        );
        setClientPublicationPackage(published);
        setClientPublicationEvents(services.clientPublicationAdapter.getEvents());
        setClientPublicationIndexCount(
          services.clientPublicationAdapter.getIndex().length,
        );
        setClientPublicationMessage(
          `Published ${published.publicationModel.publicationId}.`,
        );
      } catch (error) {
        setClientPublicationMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    validateClientPublication(): void {
      if (clientPublicationPackage === null) {
        setClientPublicationMessage('Nejdřív Load Publication.');
        return;
      }
      const validation = services.clientPublicationApi.validateClientPublication(
        clientPublicationPackage.id,
      );
      const previewed = services.clientPublicationApi.preview(
        clientPublicationPackage.id,
      );
      if (previewed !== null) {
        setClientPublicationPackage(previewed);
      }
      setClientPublicationEvents(services.clientPublicationAdapter.getEvents());
      setClientPublicationMessage(
        validation.valid ? 'Validation OK.' : 'Validation failed.',
      );
    },
    disposeClientPublication(): void {
      if (clientPublicationPackage === null) {
        return;
      }
      const disposed = services.clientPublicationAdapter.dispose(
        clientPublicationPackage.id,
      );
      setClientPublicationPackage(disposed);
      setClientPublicationEvents(services.clientPublicationAdapter.getEvents());
      setClientPublicationIndexCount(
        services.clientPublicationAdapter.getIndex().length,
      );
      setClientPublicationMessage(null);
    },
    validatePublicationReadiness(): void {
      const sessionId =
        clientPublicationPackage?.metadata.sessionId ??
        platformPublicationPackage?.metadata.sessionId ??
        'publication-readiness-session-demo';
      const source = clientPublicationPackage?.publicationModel ?? null;
      const input =
        source !== null
          ? {
              publicationId: source.publicationId,
              objectId: source.objectId,
              version: source.version,
              title: source.metadata.title,
              checks: [
                {
                  id: 'readiness-check-metadata',
                  name: 'Metadata completeness',
                  result: 'pass' as const,
                  severity: 'info' as const,
                  message: 'Required publication metadata are present.',
                },
                {
                  id: 'readiness-check-assets',
                  name: 'Asset availability',
                  result:
                    source.assets.length > 0 ? ('pass' as const) : ('warning' as const),
                  severity:
                    source.assets.length > 0 ? ('info' as const) : ('warning' as const),
                  message:
                    source.assets.length > 0
                      ? 'Assets are available for Client Studio.'
                      : 'Client publication has no assets.',
                },
                {
                  id: 'readiness-check-status',
                  name: 'Publication status',
                  result:
                    source.metadata.status === 'Published'
                      ? ('pass' as const)
                      : ('warning' as const),
                  severity:
                    source.metadata.status === 'Published'
                      ? ('info' as const)
                      : ('warning' as const),
                  message:
                    source.metadata.status === 'Published'
                      ? 'Client publication is published.'
                      : 'Client publication is not yet published.',
                },
              ],
            }
          : {
              publicationId: 'platform-publication-demo',
              objectId: 'object-demo-house',
              version: '1.0.0',
              title: 'Demo House',
            };
      const validated = services.publicationReadinessApi.validatePublicationReadiness(
        null,
        input,
        {
          sessionId,
          title: 'Builder Publication Readiness',
          publication: input,
        },
      );
      setPublicationReadinessPackage(validated);
      setPublicationReadinessEvents(
        services.publicationReadinessValidator.getEvents(),
      );
      setPublicationReadinessIndexCount(
        services.publicationReadinessValidator.getIndex().length,
      );
      setPublicationReadinessMessage(
        `Decision ${validated.report.status} for ${validated.report.publicationId}.`,
      );
    },
    evaluatePublicationReadiness(): void {
      if (publicationReadinessPackage === null) {
        setPublicationReadinessMessage('Nejdřív Validate Readiness.');
        return;
      }
      const evaluated = services.publicationReadinessApi.evaluatePublicationReadiness(
        publicationReadinessPackage.id,
      );
      setPublicationReadinessPackage(evaluated);
      setPublicationReadinessEvents(
        services.publicationReadinessValidator.getEvents(),
      );
      setPublicationReadinessIndexCount(
        services.publicationReadinessValidator.getIndex().length,
      );
      setPublicationReadinessMessage(
        `Evaluated ${evaluated.report.publicationId} → ${evaluated.report.status}.`,
      );
    },
    publishPublicationReadiness(): void {
      if (publicationReadinessPackage === null) {
        setPublicationReadinessMessage('Nejdřív Validate Readiness.');
        return;
      }
      try {
        const published = services.publicationReadinessApi.publishPublicationReadiness(
          publicationReadinessPackage.id,
        );
        setPublicationReadinessPackage(published);
        setPublicationReadinessEvents(
          services.publicationReadinessValidator.getEvents(),
        );
        setPublicationReadinessIndexCount(
          services.publicationReadinessValidator.getIndex().length,
        );
        setPublicationReadinessMessage(
          `Published readiness for ${published.report.publicationId}.`,
        );
      } catch (error) {
        setPublicationReadinessMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    disposePublicationReadiness(): void {
      if (publicationReadinessPackage === null) {
        return;
      }
      const disposed = services.publicationReadinessValidator.dispose(
        publicationReadinessPackage.id,
      );
      setPublicationReadinessPackage(disposed);
      setPublicationReadinessEvents(
        services.publicationReadinessValidator.getEvents(),
      );
      setPublicationReadinessIndexCount(
        services.publicationReadinessValidator.getIndex().length,
      );
      setPublicationReadinessMessage(null);
    },
    buildRuntimeBootstrap(): void {
      const sessionId =
        publicationReadinessPackage?.metadata.sessionId ??
        clientPublicationPackage?.metadata.sessionId ??
        'runtime-bootstrap-session-demo';
      const source = publicationReadinessPackage?.report ?? null;
      const input =
        source !== null
          ? {
              publicationId: source.publicationId,
              objectId: source.metadata.objectId,
              runtimeVersion: '2026.07',
              bootstrapVersion: '1.0.0',
              title: source.metadata.title,
              readinessStatus: source.status,
            }
          : {
              publicationId: 'platform-publication-demo',
              objectId: 'object-demo-house',
              runtimeVersion: '2026.07',
              bootstrapVersion: '1.0.0',
              title: 'Demo Runtime Bootstrap',
              readinessStatus: 'UNKNOWN' as const,
            };
      const built = services.runtimeBootstrapApi.buildRuntimeBootstrap(
        null,
        input,
        {
          sessionId,
          title: 'Builder Runtime Bootstrap',
          bootstrap: input,
        },
      );
      setRuntimeBootstrapPackage(built);
      setRuntimeBootstrapEvents(services.runtimeSessionBootstrap.getEvents());
      setRuntimeBootstrapIndexCount(
        services.runtimeSessionBootstrap.getIndex().length,
      );
      setRuntimeBootstrapMessage(
        `Built bootstrap for ${built.runtimeSession.publicationId}.`,
      );
    },
    validateRuntimeBootstrap(): void {
      if (runtimeBootstrapPackage === null) {
        setRuntimeBootstrapMessage('Nejdřív Build Bootstrap.');
        return;
      }
      const validation = services.runtimeBootstrapApi.validateRuntimeBootstrap(
        runtimeBootstrapPackage.id,
      );
      setRuntimeBootstrapPackage(
        services.runtimeBootstrapApi.getPackage(runtimeBootstrapPackage.id),
      );
      setRuntimeBootstrapEvents(services.runtimeSessionBootstrap.getEvents());
      setRuntimeBootstrapIndexCount(
        services.runtimeSessionBootstrap.getIndex().length,
      );
      setRuntimeBootstrapMessage(
        validation.valid ? 'Bootstrap validation OK.' : 'Bootstrap validation failed.',
      );
    },
    publishRuntimeBootstrap(): void {
      if (runtimeBootstrapPackage === null) {
        setRuntimeBootstrapMessage('Nejdřív Build Bootstrap.');
        return;
      }
      try {
        const published = services.runtimeBootstrapApi.publishRuntimeBootstrap(
          runtimeBootstrapPackage.id,
        );
        setRuntimeBootstrapPackage(published);
        setRuntimeBootstrapEvents(services.runtimeSessionBootstrap.getEvents());
        setRuntimeBootstrapIndexCount(
          services.runtimeSessionBootstrap.getIndex().length,
        );
        setRuntimeBootstrapMessage(
          `Published bootstrap for ${published.runtimeSession.publicationId}.`,
        );
      } catch (error) {
        setRuntimeBootstrapMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    disposeRuntimeBootstrap(): void {
      if (runtimeBootstrapPackage === null) {
        return;
      }
      const disposed = services.runtimeSessionBootstrap.dispose(
        runtimeBootstrapPackage.id,
      );
      setRuntimeBootstrapPackage(disposed);
      setRuntimeBootstrapEvents(services.runtimeSessionBootstrap.getEvents());
      setRuntimeBootstrapIndexCount(
        services.runtimeSessionBootstrap.getIndex().length,
      );
      setRuntimeBootstrapMessage(null);
    },
    registerArtifactVersion(): void {
      const sessionId =
        runtimeBootstrapPackage?.metadata.sessionId ??
        publicationReadinessPackage?.metadata.sessionId ??
        'artifact-version-session-demo';
      const bootstrap = runtimeBootstrapPackage?.runtimeSession ?? null;
      const input = bootstrap
        ? {
            artifactId: bootstrap.publicationId,
            version: bootstrap.bootstrapVersion,
            artifactType: 'RuntimeBootstrap' as const,
            title: bootstrap.metadata.title,
            notes: 'Registered Runtime bootstrap version.',
            active: runtimeBootstrapPackage?.metadata.status === 'Published',
          }
        : {
            artifactId: 'platform-publication-demo',
            version: '1.0.0',
            artifactType: 'RuntimeBootstrap' as const,
            title: 'Demo Runtime Bootstrap',
            active: true,
          };
      const registered = services.artifactVersionApi.registerArtifactVersion(
        artifactVersionPackage?.id ?? null,
        input,
        {
          sessionId,
          title: 'Builder Artifact Versions',
          version: input,
        },
      );
      setArtifactVersionPackage(registered);
      setArtifactVersionEvents(services.artifactVersionManager.getEvents());
      setArtifactVersionIndexCount(services.artifactVersionManager.getIndex().length);
      setArtifactVersionMessage(
        `Registered ${input.artifactId}@${input.version}.`,
      );
    },
    activateArtifactVersion(): void {
      if (
        artifactVersionPackage === null ||
        artifactVersionPackage.artifactVersions.length === 0
      ) {
        setArtifactVersionMessage('Nejdřív Register Version.');
        return;
      }
      const target =
        artifactVersionPackage.artifactVersions.at(-1) ??
        artifactVersionPackage.artifactVersions[0];
      const activated = services.artifactVersionApi.activateArtifactVersion(
        artifactVersionPackage.id,
        target.id,
      );
      setArtifactVersionPackage(activated);
      setArtifactVersionEvents(services.artifactVersionManager.getEvents());
      setArtifactVersionIndexCount(services.artifactVersionManager.getIndex().length);
      setArtifactVersionMessage(
        `Activated ${target.artifactId}@${target.version}.`,
      );
    },
    deprecateArtifactVersion(): void {
      if (
        artifactVersionPackage === null ||
        artifactVersionPackage.artifactVersions.length === 0
      ) {
        setArtifactVersionMessage('Nejdřív Register Version.');
        return;
      }
      const target =
        artifactVersionPackage.artifactVersions.find((item) => item.metadata.active) ??
        artifactVersionPackage.artifactVersions.at(-1) ??
        artifactVersionPackage.artifactVersions[0];
      const deprecated = services.artifactVersionApi.deprecateArtifactVersion(
        artifactVersionPackage.id,
        target.id,
      );
      setArtifactVersionPackage(deprecated);
      setArtifactVersionEvents(services.artifactVersionManager.getEvents());
      setArtifactVersionIndexCount(services.artifactVersionManager.getIndex().length);
      setArtifactVersionMessage(
        `Deprecated ${target.artifactId}@${target.version}.`,
      );
    },
    validateArtifactVersion(): void {
      if (artifactVersionPackage === null) {
        setArtifactVersionMessage('Nejdřív Register Version.');
        return;
      }
      const validation = services.artifactVersionApi.validateArtifactVersion(
        artifactVersionPackage.id,
      );
      setArtifactVersionPackage(
        services.artifactVersionApi.getPackage(artifactVersionPackage.id),
      );
      setArtifactVersionEvents(services.artifactVersionManager.getEvents());
      setArtifactVersionIndexCount(services.artifactVersionManager.getIndex().length);
      setArtifactVersionMessage(
        validation.valid
          ? 'Artifact version validation OK.'
          : 'Artifact version validation failed.',
      );
    },
    disposeArtifactVersion(): void {
      if (artifactVersionPackage === null) {
        return;
      }
      const disposed = services.artifactVersionManager.dispose(
        artifactVersionPackage.id,
      );
      setArtifactVersionPackage(disposed);
      setArtifactVersionEvents(services.artifactVersionManager.getEvents());
      setArtifactVersionIndexCount(services.artifactVersionManager.getIndex().length);
      setArtifactVersionMessage(null);
    },
    registerArtifactDependency(): void {
      const sessionId =
        artifactDependencyPackage?.metadata.sessionId ??
        artifactVersionPackage?.metadata.sessionId ??
        'artifact-dependency-session-demo';
      const source =
        runtimeBootstrapPackage?.runtimeSession.publicationId ??
        'runtime-bootstrap-demo';
      const target =
        clientPublicationPackage?.publicationModel.publicationId ??
        'client-publication-demo';
      const input = {
        sourceArtifactId: source,
        targetArtifactId: target,
        dependencyType: 'REQUIRES' as const,
        title: `${source} requires ${target}`,
        notes: 'Registered runtime bootstrap dependency.',
      };
      const registered = services.artifactDependencyApi.registerArtifactDependency(
        artifactDependencyPackage?.id ?? null,
        input,
        {
          sessionId,
          title: 'Builder Artifact Dependencies',
          dependency: input,
        },
      );
      setArtifactDependencyPackage(registered);
      setArtifactDependencyEvents(services.artifactDependencyRegistry.getEvents());
      setArtifactDependencyIndexCount(
        services.artifactDependencyRegistry.getIndex().length,
      );
      setArtifactDependencyMessage(`Registered ${source} -> ${target}.`);
    },
    removeArtifactDependency(): void {
      if (
        artifactDependencyPackage === null ||
        artifactDependencyPackage.dependencies.length === 0
      ) {
        setArtifactDependencyMessage('Nejdřív Register Dependency.');
        return;
      }
      const target =
        artifactDependencyPackage.dependencies.find(
          (dependency) => dependency.status === 'Active',
        ) ?? artifactDependencyPackage.dependencies[0];
      const removed = services.artifactDependencyApi.removeArtifactDependency(
        artifactDependencyPackage.id,
        target.id,
      );
      setArtifactDependencyPackage(removed);
      setArtifactDependencyEvents(services.artifactDependencyRegistry.getEvents());
      setArtifactDependencyIndexCount(
        services.artifactDependencyRegistry.getIndex().length,
      );
      setArtifactDependencyMessage(
        `Removed ${target.sourceArtifactId} -> ${target.targetArtifactId}.`,
      );
    },
    validateArtifactDependencies(): void {
      if (artifactDependencyPackage === null) {
        setArtifactDependencyMessage('Nejdřív Register Dependency.');
        return;
      }
      const validation = services.artifactDependencyApi.validateArtifactDependencies(
        artifactDependencyPackage.id,
      );
      setArtifactDependencyPackage(
        services.artifactDependencyApi.getPackage(artifactDependencyPackage.id),
      );
      setArtifactDependencyEvents(services.artifactDependencyRegistry.getEvents());
      setArtifactDependencyIndexCount(
        services.artifactDependencyRegistry.getIndex().length,
      );
      setArtifactDependencyMessage(
        validation.valid
          ? 'Artifact dependency validation OK.'
          : 'Artifact dependency validation failed.',
      );
    },
    disposeArtifactDependency(): void {
      if (artifactDependencyPackage === null) {
        return;
      }
      const disposed = services.artifactDependencyRegistry.dispose(
        artifactDependencyPackage.id,
      );
      setArtifactDependencyPackage(disposed);
      setArtifactDependencyEvents(services.artifactDependencyRegistry.getEvents());
      setArtifactDependencyIndexCount(
        services.artifactDependencyRegistry.getIndex().length,
      );
      setArtifactDependencyMessage(null);
    },
    buildPublicationPlan(): void {
      const sessionId =
        publicationPlanPackage?.metadata.sessionId ??
        artifactDependencyPackage?.metadata.sessionId ??
        'publication-plan-session-demo';
      const rootArtifactId =
        runtimeBootstrapPackage?.runtimeSession.publicationId ??
        'runtime-bootstrap-demo';
      const dependencies =
        artifactDependencyPackage?.dependencies.map((dependency) => ({
          sourceArtifactId: dependency.sourceArtifactId,
          targetArtifactId: dependency.targetArtifactId,
          dependencyType: dependency.dependencyType,
          status: dependency.status,
        })) ?? [
          {
            sourceArtifactId: 'runtime-bootstrap-demo',
            targetArtifactId: 'client-publication-demo',
            dependencyType: 'REQUIRES' as const,
            status: 'Active' as const,
          },
          {
            sourceArtifactId: 'client-publication-demo',
            targetArtifactId: 'published-object-demo',
            dependencyType: 'DERIVED_FROM' as const,
            status: 'Active' as const,
          },
          {
            sourceArtifactId: 'published-object-demo',
            targetArtifactId: 'publication-object-demo',
            dependencyType: 'DERIVED_FROM' as const,
            status: 'Active' as const,
          },
        ];
      const input = {
        rootArtifactId,
        dependencies,
        title: `Publication Plan ${rootArtifactId}`,
      };
      const built = services.publicationPlanApi.buildPublicationPlan(
        publicationPlanPackage?.id ?? null,
        input,
        {
          sessionId,
          title: 'Builder Publication Plan',
          plan: input,
        },
      );
      setPublicationPlanPackage(built);
      setPublicationPlanEvents(services.publicationPlanBuilder.getEvents());
      setPublicationPlanIndexCount(
        services.publicationPlanBuilder.getIndex().length,
      );
      setPublicationPlanMessage(
        `Built plan for ${built.plan.rootArtifactId}.`,
      );
    },
    validatePublicationPlan(): void {
      if (publicationPlanPackage === null) {
        setPublicationPlanMessage('Nejdřív Build Plan.');
        return;
      }
      const validation = services.publicationPlanApi.validatePublicationPlan(
        publicationPlanPackage.id,
      );
      setPublicationPlanPackage(
        services.publicationPlanApi.getPackage(publicationPlanPackage.id),
      );
      setPublicationPlanEvents(services.publicationPlanBuilder.getEvents());
      setPublicationPlanIndexCount(
        services.publicationPlanBuilder.getIndex().length,
      );
      setPublicationPlanMessage(
        validation.valid ? 'Publication plan validation OK.' : 'Publication plan validation failed.',
      );
    },
    publishPublicationPlan(): void {
      if (publicationPlanPackage === null) {
        setPublicationPlanMessage('Nejdřív Build Plan.');
        return;
      }
      try {
        const published = services.publicationPlanApi.publishPublicationPlan(
          publicationPlanPackage.id,
        );
        setPublicationPlanPackage(published);
        setPublicationPlanEvents(services.publicationPlanBuilder.getEvents());
        setPublicationPlanIndexCount(
          services.publicationPlanBuilder.getIndex().length,
        );
        setPublicationPlanMessage(
          `Published plan for ${published.plan.rootArtifactId}.`,
        );
      } catch (error) {
        setPublicationPlanMessage(
          error instanceof Error ? error.message : 'Publish failed.',
        );
      }
    },
    disposePublicationPlan(): void {
      if (publicationPlanPackage === null) {
        return;
      }
      const disposed = services.publicationPlanBuilder.dispose(
        publicationPlanPackage.id,
      );
      setPublicationPlanPackage(disposed);
      setPublicationPlanEvents(services.publicationPlanBuilder.getEvents());
      setPublicationPlanIndexCount(
        services.publicationPlanBuilder.getIndex().length,
      );
      setPublicationPlanMessage(null);
    },
    startPublicationExecution(): void {
      const sessionId =
        publicationExecutionPackage?.metadata.sessionId ??
        publicationPlanPackage?.metadata.sessionId ??
        'publication-execution-session-demo';
      const plan = publicationPlanPackage?.plan ?? null;
      const input = {
        planId: plan?.id ?? 'publication-plan-demo',
        rootArtifactId: plan?.rootArtifactId ?? 'runtime-bootstrap-demo',
        totalSteps: plan?.steps.length ?? 3,
        title: `Execution ${plan?.rootArtifactId ?? 'runtime-bootstrap-demo'}`,
      };
      const started = services.publicationExecutionApi.startPublicationExecution(
        publicationExecutionPackage?.id ?? null,
        input,
        {
          sessionId,
          title: 'Builder Publication Execution',
          execution: input,
        },
      );
      setPublicationExecutionPackage(started);
      setPublicationExecutionEvents(
        services.publicationExecutionCoordinator.getEvents(),
      );
      setPublicationExecutionIndexCount(
        services.publicationExecutionCoordinator.getIndex().length,
      );
      setPublicationExecutionMessage(
        `Started execution for plan ${started.session.planId}.`,
      );
    },
    executePublicationStep(): void {
      if (publicationExecutionPackage === null) {
        setPublicationExecutionMessage('Nejdřív Start Execution.');
        return;
      }
      try {
        const next = services.publicationExecutionApi.executePublicationStep(
          publicationExecutionPackage.id,
        );
        setPublicationExecutionPackage(next);
        setPublicationExecutionEvents(
          services.publicationExecutionCoordinator.getEvents(),
        );
        setPublicationExecutionIndexCount(
          services.publicationExecutionCoordinator.getIndex().length,
        );
        setPublicationExecutionMessage(
          `Completed step ${next.session.currentStep}/${next.session.metadata.totalSteps}.`,
        );
      } catch (error) {
        setPublicationExecutionMessage(
          error instanceof Error ? error.message : 'Step execution failed.',
        );
      }
    },
    completePublicationExecution(): void {
      if (publicationExecutionPackage === null) {
        setPublicationExecutionMessage('Nejdřív Start Execution.');
        return;
      }
      const completed = services.publicationExecutionApi.completePublicationExecution(
        publicationExecutionPackage.id,
      );
      setPublicationExecutionPackage(completed);
      setPublicationExecutionEvents(
        services.publicationExecutionCoordinator.getEvents(),
      );
      setPublicationExecutionIndexCount(
        services.publicationExecutionCoordinator.getIndex().length,
      );
      setPublicationExecutionMessage(
        `Execution completed for plan ${completed.session.planId}.`,
      );
    },
    validatePublicationExecution(): void {
      if (publicationExecutionPackage === null) {
        setPublicationExecutionMessage('Nejdřív Start Execution.');
        return;
      }
      const validation = services.publicationExecutionApi.validatePublicationExecution(
        publicationExecutionPackage.id,
      );
      setPublicationExecutionPackage(
        services.publicationExecutionApi.getPackage(publicationExecutionPackage.id),
      );
      setPublicationExecutionEvents(
        services.publicationExecutionCoordinator.getEvents(),
      );
      setPublicationExecutionIndexCount(
        services.publicationExecutionCoordinator.getIndex().length,
      );
      setPublicationExecutionMessage(
        validation.valid
          ? 'Publication execution validation OK.'
          : 'Publication execution validation failed.',
      );
    },
    disposePublicationExecution(): void {
      if (publicationExecutionPackage === null) {
        return;
      }
      const disposed = services.publicationExecutionCoordinator.dispose(
        publicationExecutionPackage.id,
      );
      setPublicationExecutionPackage(disposed);
      setPublicationExecutionEvents(
        services.publicationExecutionCoordinator.getEvents(),
      );
      setPublicationExecutionIndexCount(
        services.publicationExecutionCoordinator.getIndex().length,
      );
      setPublicationExecutionMessage(null);
    },
    buildArtifactExport(): void {
      try {
        const input = {
          artifactId:
            publicationExecutionPackage?.session.planId ??
            runtimeBootstrapPackage?.runtimeSession?.publicationId ??
            'artifact-demo-001',
          artifactType: 'RuntimeBootstrap',
          exportVersion: '1.0.0',
          schemaVersion: '1',
          title: 'Builder Artifact Export',
        };
        const pkg = services.artifactExportApi.buildArtifactExport(
          artifactExportPackage?.id ?? null,
          input,
        );
        setArtifactExportPackage(pkg);
        setArtifactExportEvents(services.artifactExportContract.getEvents());
        setArtifactExportIndexCount(
          services.artifactExportContract.getIndex().length,
        );
        setArtifactExportMessage('Artifact export built.');
      } catch (err) {
        setArtifactExportMessage(
          `Build failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    validateArtifactExport(): void {
      if (artifactExportPackage === null) {
        setArtifactExportMessage('Build export first.');
        return;
      }
      const validation = services.artifactExportApi.validateArtifactExport(
        artifactExportPackage.id,
      );
      setArtifactExportPackage(
        services.artifactExportContract.getPackage(artifactExportPackage.id),
      );
      setArtifactExportEvents(services.artifactExportContract.getEvents());
      setArtifactExportIndexCount(
        services.artifactExportContract.getIndex().length,
      );
      setArtifactExportMessage(
        validation.valid
          ? 'Artifact export validation OK.'
          : 'Artifact export validation failed.',
      );
    },
    exportArtifact(): void {
      if (artifactExportPackage === null) {
        setArtifactExportMessage('Build export first.');
        return;
      }
      try {
        const exported = services.artifactExportApi.exportArtifact(
          artifactExportPackage.id,
        );
        setArtifactExportPackage(exported);
        setArtifactExportEvents(services.artifactExportContract.getEvents());
        setArtifactExportIndexCount(
          services.artifactExportContract.getIndex().length,
        );
        setArtifactExportMessage('Artifact exported.');
      } catch (err) {
        setArtifactExportMessage(
          `Export failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    disposeArtifactExport(): void {
      if (artifactExportPackage === null) {
        return;
      }
      const disposed = services.artifactExportApi.disposeArtifactExport(
        artifactExportPackage.id,
      );
      setArtifactExportPackage(disposed);
      setArtifactExportEvents(services.artifactExportContract.getEvents());
      setArtifactExportIndexCount(
        services.artifactExportContract.getIndex().length,
      );
      setArtifactExportMessage(null);
    },
    registerExportSchema(): void {
      try {
        const input = {
          name: 'ArtifactExport',
          schemaVersion: artifactExportPackage?.exportModel.schemaVersion ?? '1',
          title: 'Artifact Export Schema',
        };
        const pkg = services.exportSchemaApi.registerExportSchema(
          exportSchemaPackage?.id ?? null,
          input,
        );
        setExportSchemaPackage(pkg);
        setExportSchemaEvents(services.exportSchemaRegistry.getEvents());
        setExportSchemaIndexCount(services.exportSchemaRegistry.getIndex().length);
        setExportSchemaMessage('Export schema registered.');
      } catch (err) {
        setExportSchemaMessage(
          `Register failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    validateExportSchema(): void {
      if (exportSchemaPackage === null) {
        setExportSchemaMessage('Register a schema first.');
        return;
      }
      const validation = services.exportSchemaApi.validateExportSchema(exportSchemaPackage.id);
      setExportSchemaPackage(services.exportSchemaRegistry.getPackage(exportSchemaPackage.id));
      setExportSchemaEvents(services.exportSchemaRegistry.getEvents());
      setExportSchemaIndexCount(services.exportSchemaRegistry.getIndex().length);
      setExportSchemaMessage(
        validation.valid ? 'Export schema validation OK.' : 'Export schema validation failed.',
      );
    },
    disposeExportSchema(): void {
      if (exportSchemaPackage === null) return;
      const disposed = services.exportSchemaApi.dispose(exportSchemaPackage.id);
      setExportSchemaPackage(disposed);
      setExportSchemaEvents(services.exportSchemaRegistry.getEvents());
      setExportSchemaIndexCount(services.exportSchemaRegistry.getIndex().length);
      setExportSchemaMessage(null);
    },
    registerExportCompatibility(): void {
      try {
        const input = {
          sourceSchemaVersion: exportSchemaPackage?.schemas[0]?.schemaVersion ?? '1.0.0',
          targetSchemaVersion: '2.0.0',
          compatibilityLevel: 'BACKWARD' as const,
          title: 'Schema Compatibility',
        };
        const pkg = services.exportCompatibilityApi.registerExportCompatibility(
          exportCompatibilityPackage?.id ?? null,
          input,
        );
        setExportCompatibilityPackage(pkg);
        setExportCompatibilityEvents(services.exportCompatibilityRegistry.getEvents());
        setExportCompatibilityIndexCount(services.exportCompatibilityRegistry.getIndex().length);
        setExportCompatibilityMessage('Export compatibility registered.');
      } catch (err) {
        setExportCompatibilityMessage(
          `Register failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    validateExportCompatibility(): void {
      if (exportCompatibilityPackage === null) {
        setExportCompatibilityMessage('Register a compatibility first.');
        return;
      }
      const validation = services.exportCompatibilityApi.validateExportCompatibility(exportCompatibilityPackage.id);
      setExportCompatibilityPackage(services.exportCompatibilityRegistry.getPackage(exportCompatibilityPackage.id));
      setExportCompatibilityEvents(services.exportCompatibilityRegistry.getEvents());
      setExportCompatibilityIndexCount(services.exportCompatibilityRegistry.getIndex().length);
      setExportCompatibilityMessage(
        validation.valid ? 'Export compatibility validation OK.' : 'Export compatibility validation failed.',
      );
    },
    disposeExportCompatibility(): void {
      if (exportCompatibilityPackage === null) return;
      const disposed = services.exportCompatibilityApi.dispose(exportCompatibilityPackage.id);
      setExportCompatibilityPackage(disposed);
      setExportCompatibilityEvents(services.exportCompatibilityRegistry.getEvents());
      setExportCompatibilityIndexCount(services.exportCompatibilityRegistry.getIndex().length);
      setExportCompatibilityMessage(null);
    },
    registerExportCapability(): void {
      try {
        const fallbackSchemaVersion =
          exportSchemaPackage?.schemas[0]?.schemaVersion ??
          artifactExportPackage?.exportModel.schemaVersion ??
          '1';
        const input = {
          name: 'supportsValidation',
          description: 'Consumer can validate exported artifacts against the declared schema.',
          supportedSchemaVersions: [fallbackSchemaVersion],
          title: 'supportsValidation capability',
        };
        const pkg = services.exportCapabilityApi.registerExportCapability(
          exportCapabilityPackage?.id ?? null,
          input,
        );
        setExportCapabilityPackage(pkg);
        setExportCapabilityEvents(
          services.exportCapabilityRegistry.getEvents(),
        );
        setExportCapabilityIndexCount(
          services.exportCapabilityRegistry.getIndex().length,
        );
        setExportCapabilityMessage('Export capability registered.');
      } catch (err) {
        setExportCapabilityMessage(
          `Register failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    validateExportCapability(): void {
      if (exportCapabilityPackage === null) {
        setExportCapabilityMessage('Register a capability first.');
        return;
      }
      const validation = services.exportCapabilityApi.validateExportCapability(
        exportCapabilityPackage.id,
      );
      setExportCapabilityPackage(
        services.exportCapabilityRegistry.getPackage(exportCapabilityPackage.id),
      );
      setExportCapabilityEvents(services.exportCapabilityRegistry.getEvents());
      setExportCapabilityIndexCount(
        services.exportCapabilityRegistry.getIndex().length,
      );
      setExportCapabilityMessage(
        validation.valid ? 'Export capability validation OK.' : 'Export capability validation failed.',
      );
    },
    disposeExportCapability(): void {
      if (exportCapabilityPackage === null) return;
      const disposed = services.exportCapabilityApi.disposeExportCapability(
        exportCapabilityPackage.id,
      );
      setExportCapabilityPackage(disposed);
      setExportCapabilityEvents(services.exportCapabilityRegistry.getEvents());
      setExportCapabilityIndexCount(
        services.exportCapabilityRegistry.getIndex().length,
      );
      setExportCapabilityMessage(null);
    },
    registerExportPolicy(): void {
      try {
        const input = {
          name: 'policy-ready-export',
          conditions: [
            'artifactPublished',
            'schemaValid',
            'capabilitySupported',
            'notDeprecated',
            'validationPassed',
          ],
          title: 'Ready export policy',
        };
        const pkg = services.exportPolicyApi.registerExportPolicy(
          exportPolicyPackage?.id ?? null,
          input,
        );
        setExportPolicyPackage(pkg);
        setExportPolicyEvents(services.exportPolicyRegistry.getEvents());
        setExportPolicyIndexCount(
          services.exportPolicyRegistry.getIndex().length,
        );
        setExportPolicyMessage('Export policy registered.');
      } catch (err) {
        setExportPolicyMessage(
          `Register failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    validateExportPolicy(): void {
      if (exportPolicyPackage === null) {
        setExportPolicyMessage('Register a policy first.');
        return;
      }
      const validation = services.exportPolicyApi.validateExportPolicy(
        exportPolicyPackage.id,
      );
      setExportPolicyPackage(
        services.exportPolicyRegistry.getPackage(exportPolicyPackage.id),
      );
      setExportPolicyEvents(services.exportPolicyRegistry.getEvents());
      setExportPolicyIndexCount(
        services.exportPolicyRegistry.getIndex().length,
      );
      setExportPolicyMessage(
        validation.valid ? 'Export policy validation OK.' : 'Export policy validation failed.',
      );
    },
    disposeExportPolicy(): void {
      if (exportPolicyPackage === null) return;
      const disposed = services.exportPolicyApi.disposeExportPolicy(
        exportPolicyPackage.id,
      );
      setExportPolicyPackage(disposed);
      setExportPolicyEvents(services.exportPolicyRegistry.getEvents());
      setExportPolicyIndexCount(
        services.exportPolicyRegistry.getIndex().length,
      );
      setExportPolicyMessage(null);
    },
    certifyExport(): void {
      try {
        const input = {
          artifactId:
            artifactExportPackage?.exportModel.artifactId ??
            'artifact-demo-001',
          schemaVersion:
            artifactExportPackage?.exportModel.schemaVersion ?? '1',
          certificationVersion: '1.0.0',
          title: 'Export readiness certificate',
        };
        const pkg = services.exportCertificationApi.certifyExport(
          exportCertificationPackage?.id ?? null,
          input,
        );
        setExportCertificationPackage(pkg);
        setExportCertificationEvents(
          services.exportCertificationService.getEvents(),
        );
        setExportCertificationIndexCount(
          services.exportCertificationService.getIndex().length,
        );
        setExportCertificationMessage('Export certified.');
      } catch (err) {
        setExportCertificationMessage(
          `Certification failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    validateExportCertification(): void {
      if (exportCertificationPackage === null) {
        setExportCertificationMessage('Certify an export first.');
        return;
      }
      const validation = services.exportCertificationApi.validateExportCertification(
        exportCertificationPackage.id,
      );
      setExportCertificationPackage(
        services.exportCertificationService.getPackage(
          exportCertificationPackage.id,
        ),
      );
      setExportCertificationEvents(
        services.exportCertificationService.getEvents(),
      );
      setExportCertificationIndexCount(
        services.exportCertificationService.getIndex().length,
      );
      setExportCertificationMessage(
        validation.valid
          ? 'Export certification validation OK.'
          : 'Export certification validation failed.',
      );
    },
    revokeExportCertification(): void {
      if (exportCertificationPackage === null) return;
      const revoked = services.exportCertificationApi.revokeExportCertification(
        exportCertificationPackage.id,
      );
      setExportCertificationPackage(revoked);
      setExportCertificationEvents(
        services.exportCertificationService.getEvents(),
      );
      setExportCertificationIndexCount(
        services.exportCertificationService.getIndex().length,
      );
      setExportCertificationMessage('Export certification revoked.');
    },
    disposeExportCertification(): void {
      if (exportCertificationPackage === null) return;
      const disposed = services.exportCertificationApi.disposeExportCertification(
        exportCertificationPackage.id,
      );
      setExportCertificationPackage(disposed);
      setExportCertificationEvents(
        services.exportCertificationService.getEvents(),
      );
      setExportCertificationIndexCount(
        services.exportCertificationService.getIndex().length,
      );
      setExportCertificationMessage(null);
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

function buildRuntimeEventSources(input: {
  readonly sessionId: string;
  readonly experienceRuntimeEvents: readonly ExperienceRuntimeEvent[];
  readonly moduleCoordinatorEvents: readonly ModuleCoordinatorEvent[];
  readonly experienceStateEvents: readonly ExperienceStateEvent[];
  readonly decisionOrchestratorEvents: readonly DecisionOrchestratorEvent[];
  readonly runtimeExecutionId: string | null;
}): RuntimeEventSource[] {
  const sources: RuntimeEventSource[] = [
    ...input.experienceRuntimeEvents.map((event) => ({
      sessionId: input.sessionId,
      executionId: event.executionId ?? input.runtimeExecutionId,
      moduleId: null,
      event: event.type,
      timestamp: event.at,
      source: 'experience-runtime',
    })),
    ...input.moduleCoordinatorEvents.map((event) => ({
      sessionId: input.sessionId,
      executionId: input.runtimeExecutionId,
      moduleId: event.moduleId,
      event: event.type,
      timestamp: event.at,
      source: 'experience-modules',
    })),
    ...input.experienceStateEvents.map((event) => ({
      sessionId: input.sessionId,
      executionId: input.runtimeExecutionId,
      moduleId: null,
      event: event.type,
      timestamp: event.at,
      source: 'experience-state',
    })),
    ...input.decisionOrchestratorEvents.map((event) => ({
      sessionId: input.sessionId,
      executionId: event.executionId,
      moduleId: null,
      event: event.type,
      timestamp: event.at,
      source: 'decision-orchestrator',
    })),
  ];

  if (sources.length > 0) {
    return sources;
  }

  const stamp = new Date().toISOString();
  return [
    {
      sessionId: input.sessionId,
      executionId: 'runtime-execution-demo',
      moduleId: null,
      event: 'RuntimeStarted',
      timestamp: stamp,
      source: 'experience-runtime',
    },
    {
      sessionId: input.sessionId,
      executionId: 'runtime-execution-demo',
      moduleId: 'hero',
      event: 'ModuleActivated',
      timestamp: stamp,
      source: 'experience-modules',
    },
    {
      sessionId: input.sessionId,
      executionId: 'runtime-execution-demo',
      moduleId: 'hero',
      event: 'ExperienceStateCreated',
      timestamp: stamp,
      source: 'experience-state',
    },
    {
      sessionId: input.sessionId,
      executionId: 'decision-execution-demo',
      moduleId: null,
      event: 'DecisionExecutionStarted',
      timestamp: stamp,
      source: 'decision-orchestrator',
    },
  ];
}

function buildAuditEventSources(input: {
  readonly sessionId: string;
  readonly decisionOrchestratorEvents: readonly DecisionOrchestratorEvent[];
  readonly experienceRuntimeEvents: readonly ExperienceRuntimeEvent[];
  readonly moduleCoordinatorEvents: readonly ModuleCoordinatorEvent[];
  readonly experienceStateEvents: readonly ExperienceStateEvent[];
  readonly observabilityEvents: readonly RuntimeObservabilityEvent[];
  readonly runtimeHealthEvents: readonly RuntimeHealthEvent[];
  readonly runtimeExecutionId: string | null;
  readonly moduleExecutionId: string | null;
  readonly observabilityPackageId: string | null;
  readonly healthPackageId: string | null;
}): AuditEventSource[] {
  const sources: AuditEventSource[] = [
    ...input.decisionOrchestratorEvents.map((event) => ({
      sessionId: input.sessionId,
      runtimeExecutionId: event.executionId ?? input.runtimeExecutionId,
      moduleExecutionId: null,
      action: event.type,
      entity: 'DecisionExecution' as const,
      timestamp: event.at,
      source: 'decision-orchestrator',
      packageId: event.packageId,
    })),
    ...input.experienceRuntimeEvents.map((event) => ({
      sessionId: input.sessionId,
      runtimeExecutionId: event.executionId ?? input.runtimeExecutionId,
      moduleExecutionId: null,
      action: event.type,
      entity: 'RuntimeExecution' as const,
      timestamp: event.at,
      source: 'experience-runtime',
      packageId: event.packageId,
    })),
    ...input.moduleCoordinatorEvents.map((event) => ({
      sessionId: input.sessionId,
      runtimeExecutionId: input.runtimeExecutionId,
      moduleExecutionId: input.moduleExecutionId,
      action: event.type,
      entity: 'ModuleExecution' as const,
      timestamp: event.at,
      source: 'experience-modules',
      packageId: event.packageId,
    })),
    ...input.experienceStateEvents.map((event) => ({
      sessionId: input.sessionId,
      runtimeExecutionId: input.runtimeExecutionId,
      moduleExecutionId: input.moduleExecutionId,
      action: event.type,
      entity: 'StateTransition' as const,
      timestamp: event.at,
      source: 'experience-state',
      packageId: event.packageId,
    })),
    ...input.observabilityEvents
      .filter((event) => event.type === 'ObservabilityPublished')
      .map((event) => ({
        sessionId: input.sessionId,
        runtimeExecutionId: input.runtimeExecutionId,
        moduleExecutionId: null,
        action: event.type,
        entity: 'PublishedPackage' as const,
        timestamp: event.at,
        source: 'runtime-observability',
        packageId: event.packageId,
      })),
    ...input.runtimeHealthEvents
      .filter(
        (event) =>
          event.type === 'RuntimeHealthPublished' ||
          event.type === 'RuntimeHealthValidated',
      )
      .map((event) => ({
        sessionId: input.sessionId,
        runtimeExecutionId: input.runtimeExecutionId,
        moduleExecutionId: null,
        action: event.type,
        entity:
          event.type === 'RuntimeHealthPublished'
            ? ('PublishedPackage' as const)
            : ('ValidationEvent' as const),
        timestamp: event.at,
        source: 'runtime-health',
        packageId: event.packageId,
      })),
  ];

  if (sources.length > 0) {
    return sources;
  }

  const stamp = new Date().toISOString();
  return [
    {
      sessionId: input.sessionId,
      runtimeExecutionId: 'runtime-execution-demo',
      moduleExecutionId: null,
      action: 'DecisionExecutionStarted',
      entity: 'DecisionExecution',
      timestamp: stamp,
      source: 'decision-orchestrator',
      packageId: null,
    },
    {
      sessionId: input.sessionId,
      runtimeExecutionId: 'runtime-execution-demo',
      moduleExecutionId: null,
      action: 'RuntimeStarted',
      entity: 'RuntimeExecution',
      timestamp: stamp,
      source: 'experience-runtime',
      packageId: null,
    },
    {
      sessionId: input.sessionId,
      runtimeExecutionId: 'runtime-execution-demo',
      moduleExecutionId: 'module-execution-demo',
      action: 'ModuleActivated',
      entity: 'ModuleExecution',
      timestamp: stamp,
      source: 'experience-modules',
      packageId: null,
    },
    {
      sessionId: input.sessionId,
      runtimeExecutionId: 'runtime-execution-demo',
      moduleExecutionId: 'module-execution-demo',
      action: 'ExperienceStateCreated',
      entity: 'StateTransition',
      timestamp: stamp,
      source: 'experience-state',
      packageId: null,
    },
    {
      sessionId: input.sessionId,
      runtimeExecutionId: 'runtime-execution-demo',
      moduleExecutionId: null,
      action: 'ObservabilityPublished',
      entity: 'PublishedPackage',
      timestamp: stamp,
      source: 'runtime-observability',
      packageId: input.observabilityPackageId,
    },
    {
      sessionId: input.sessionId,
      runtimeExecutionId: 'runtime-execution-demo',
      moduleExecutionId: null,
      action: 'RuntimeHealthValidated',
      entity: 'ValidationEvent',
      timestamp: stamp,
      source: 'runtime-health',
      packageId: input.healthPackageId,
    },
  ];
}
