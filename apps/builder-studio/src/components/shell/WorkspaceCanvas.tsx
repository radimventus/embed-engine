import type {
  ActiveProjectModel,
  AIContextPackage,
  AssetCategoryId,
  BuilderProjectManifest,
  ComposerEvent,
  ContextEvent,
  Experience,
  ExperienceStructureReport,
  DecisionEngineEvent,
  DecisionEvent,
  DecisionKnowledgePackage,
  DecisionModel,
  DecisionRuntimeEvent,
  DecisionStory,
  EvaluationEvent,
  AnalyticsEngineEvent,
  AnalyticsSnapshot,
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
  RuntimeObservabilityEvent,
  RuntimeObservabilityPackage,
  RuntimeHealthEvent,
  RuntimeHealthPackage,
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
  BehaviorEvaluation,
  BehaviorEvent,
  BehaviorSignal,
  RuntimeSession,
  SessionEvent,
  EvaluationResult,
  KnowledgeEvent,
  RuntimeModel,
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
  PriorityDefinition,
  PriorityId,
  ObjectEvent,
  ObjectModuleDefinition,
  ObjectModuleId,
  ObjectPackage,
  ReadinessReport,
  TimelineEntry,
  UpdateObjectMetadataInput,
  ValidationReport,
  VersionInfo,
  WorkspaceSectionId,
} from '../../model';
import { ExperienceComposer } from './ExperienceComposer';
import { AIContextPreview } from './AIContextPreview';
import { DecisionEngineOverview } from './DecisionEngineOverview';
import { DecisionRuntimeOverview } from './DecisionRuntimeOverview';
import { DecisionStoryOverview } from './DecisionStoryOverview';
import { RuntimeSessionOverview } from './RuntimeSessionOverview';
import { BehaviorOverview } from './BehaviorOverview';
import { AnalyticsOverview } from './AnalyticsOverview';
import { LearningPipelineOverview } from './LearningPipelineOverview';
import { LearningPackageManagerOverview } from './LearningPackageManagerOverview';
import { PatternExtractionOverview } from './PatternExtractionOverview';
import { PatternIntelligenceOverview } from './PatternIntelligenceOverview';
import { HeuristicEngineOverview } from './HeuristicEngineOverview';
import { KnowledgeSynthesisOverview } from './KnowledgeSynthesisOverview';
import { AIDecisionGatewayOverview } from './AIDecisionGatewayOverview';
import { PersonalizationEngineOverview } from './PersonalizationEngineOverview';
import { PersonalizationRuntimeOverview } from './PersonalizationRuntimeOverview';
import { DecisionOrchestratorOverview } from './DecisionOrchestratorOverview';
import { ExperienceRuntimeOverview } from './ExperienceRuntimeOverview';
import { ExperienceModulesOverview } from './ExperienceModulesOverview';
import { ExperienceStateOverview } from './ExperienceStateOverview';
import { ObservabilityOverview } from './ObservabilityOverview';
import { HealthOverview } from './HealthOverview';
import { AuditOverview } from './AuditOverview';
import { GovernanceOverview } from './GovernanceOverview';
import { PoliciesOverview } from './PoliciesOverview';
import { EnforcementOverview } from './EnforcementOverview';
import { ResilienceOverview } from './ResilienceOverview';
import { RecoveryOverview } from './RecoveryOverview';
import { RecoveryExecutionOverview } from './RecoveryExecutionOverview';
import { RecoveryCoordinatorOverview } from './RecoveryCoordinatorOverview';
import { RecoveryReportingOverview } from './RecoveryReportingOverview';
import { OperationsOverview } from './OperationsOverview';
import { RuntimeIntegrationOverview } from './RuntimeIntegrationOverview';
import { RuntimeRegistryOverview } from './RuntimeRegistryOverview';
import { RuntimeManifestOverview } from './RuntimeManifestOverview';
import { RuntimeApiOverview } from './RuntimeApiOverview';
import { RuntimeCompatibilityOverview } from './RuntimeCompatibilityOverview';
import { RuntimeContractsOverview } from './RuntimeContractsOverview';
import { RuntimeExtensionsOverview } from './RuntimeExtensionsOverview';
import { ObjectPublicationOverview } from './ObjectPublicationOverview';
import { PublishedObjectsOverview } from './PublishedObjectsOverview';
import { PlatformPublicationOverview } from './PlatformPublicationOverview';
import { ClientPublicationOverview } from './ClientPublicationOverview';
import { PublicationReadinessOverview } from './PublicationReadinessOverview';
import { RuntimeBootstrapOverview } from './RuntimeBootstrapOverview';
import { ArtifactVersionsOverview } from './ArtifactVersionsOverview';
import { ArtifactDependenciesOverview } from './ArtifactDependenciesOverview';
import { RuleEvaluationOverview } from './RuleEvaluationOverview';
import { DecisionOverview } from './DecisionOverview';
import { KnowledgeLayersOverview } from './KnowledgeLayersOverview';
import { LearningOverview } from './LearningOverview';
import { KnowledgeOverview } from './KnowledgeOverview';
import {
  KnowledgeSection,
  LayoutSection,
  MediaSection,
} from './WorkspaceSections';
import { ObjectOverview } from './ObjectOverview';
import { ProjectDashboard } from './ProjectDashboard';
import { SectionNavigation } from './SectionNavigation';

type WorkspaceCanvasProps = {
  readonly projectModel: ActiveProjectModel | null;
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
  readonly priorityRegistry: readonly PriorityDefinition[];
  readonly moduleRegistry: readonly ObjectModuleDefinition[];
  readonly objectEvents: readonly ObjectEvent[];
  readonly validationReport: ValidationReport | null;
  readonly manifest: BuilderProjectManifest | null;
  readonly versions: VersionInfo | null;
  readonly readiness: ReadinessReport | null;
  readonly timeline: readonly TimelineEntry[];
  readonly activeSection: WorkspaceSectionId;
  readonly onSelectSection: (sectionId: WorkspaceSectionId) => void;
  readonly onAddAsset: (categoryId: AssetCategoryId) => void;
  readonly onRemoveAsset: (
    categoryId: AssetCategoryId,
    assetId: string,
  ) => void;
  readonly onUpdateMetadata: (
    categoryId: AssetCategoryId,
    assetId: string,
    patch: { readonly label: string },
  ) => void;
  readonly onUpdateObjectMetadata: (patch: UpdateObjectMetadataInput) => void;
  readonly onToggleModule: (moduleId: ObjectModuleId) => void;
  readonly onSaveObject: () => void;
  readonly onDuplicateObject: () => void;
  readonly onSelectScene: (sceneId: string) => void;
  readonly onAddScene: () => void;
  readonly onRenameScene: (sceneId: string, title: string) => void;
  readonly onMoveScene: (sceneId: string, direction: 'up' | 'down') => void;
  readonly onRemoveScene: (sceneId: string) => void;
  readonly onToggleSceneModule: (
    sceneId: string,
    moduleId: ObjectModuleId,
  ) => void;
  readonly onSaveKnowledge: () => void;
  readonly onAddFact: () => void;
  readonly onAddEntity: () => void;
  readonly onAddRelationship: () => void;
  readonly onAddFaq: () => void;
  readonly onSaveDecision: () => void;
  readonly onAddDecisionRule: () => void;
  readonly onAddDecisionSignal: () => void;
  readonly onAddDecisionStrategy: () => void;
  readonly onToggleDecisionPriority: (priorityId: PriorityId) => void;
  readonly onBuildContext: () => void;
  readonly onRefreshContext: () => void;
  readonly onClearContext: () => void;
  readonly onEnsureKnowledgeLayers: () => void;
  readonly onAddDemoLayerReferences: () => void;
  readonly onRemoveLayerReference: (referenceId: string) => void;
  readonly onSaveLearning: () => void;
  readonly onAddLearningObservation: () => void;
  readonly onAddLearningPattern: () => void;
  readonly onAddLearningHeuristic: () => void;
  readonly onBuildDecisionModel: () => void;
  readonly onValidateDecisionModel: () => void;
  readonly onDisposeDecisionModel: () => void;
  readonly onCreateDecisionRuntime: () => void;
  readonly onValidateDecisionRuntime: () => void;
  readonly onDisposeDecisionRuntime: () => void;
  readonly onEvaluateRules: () => void;
  readonly onValidateEvaluation: () => void;
  readonly onDisposeEvaluation: () => void;
  readonly onComposeStory: () => void;
  readonly onValidateStory: () => void;
  readonly onDisposeStory: () => void;
  readonly onCreateRuntimeSession: () => void;
  readonly onStartRuntimeSession: () => void;
  readonly onNextSessionMove: () => void;
  readonly onPreviousSessionMove: () => void;
  readonly onCompleteRuntimeSession: () => void;
  readonly onDisposeRuntimeSession: () => void;
  readonly onEvaluateBehavior: () => void;
  readonly onReceiveDemoBehaviorSignals: () => void;
  readonly onDisposeBehavior: () => void;
  readonly onRecordAnalytics: () => void;
  readonly onAggregateAnalytics: () => void;
  readonly onExportAnalytics: () => void;
  readonly onDisposeAnalytics: () => void;
  readonly onImportLearning: () => void;
  readonly onValidateLearning: () => void;
  readonly onAnonymizeLearning: () => void;
  readonly onTransformLearning: () => void;
  readonly onDisposeLearningPipeline: () => void;
  readonly onCreateLearningRecordsPackage: () => void;
  readonly onAddLearningRecordRef: () => void;
  readonly onRemoveLastLearningRecordRef: () => void;
  readonly onValidateLearningRecordsPackage: () => void;
  readonly onPublishLearningRecordsPackage: () => void;
  readonly onDisposeLearningRecordsPackage: () => void;
  readonly onExtractPatterns: () => void;
  readonly onValidatePatterns: () => void;
  readonly onPublishPatterns: () => void;
  readonly onDisposePatterns: () => void;
  readonly onExtractIntelligencePatterns: () => void;
  readonly onMergeIntelligencePatterns: () => void;
  readonly onValidateIntelligencePatterns: () => void;
  readonly onPublishIntelligencePatterns: () => void;
  readonly onDisposeIntelligencePatterns: () => void;
  readonly onDeriveHeuristics: () => void;
  readonly onValidateHeuristics: () => void;
  readonly onPublishHeuristics: () => void;
  readonly onDisposeHeuristics: () => void;
  readonly onSynthesizeKnowledge: () => void;
  readonly onMergeKnowledge: () => void;
  readonly onValidateSynthesizedKnowledge: () => void;
  readonly onPublishSynthesizedKnowledge: () => void;
  readonly onDisposeSynthesizedKnowledge: () => void;
  readonly onBuildGatewayAIContext: () => void;
  readonly onFilterGatewayAIContext: () => void;
  readonly onValidateGatewayAIContext: () => void;
  readonly onPublishGatewayAIContext: () => void;
  readonly onDisposeGatewayAIContext: () => void;
  readonly onPersonalizeContext: () => void;
  readonly onRankPersonalization: () => void;
  readonly onValidatePersonalization: () => void;
  readonly onPublishPersonalization: () => void;
  readonly onDisposePersonalization: () => void;
  readonly onProjectDecisionContext: () => void;
  readonly onRankDecisionContext: () => void;
  readonly onValidateDecisionContext: () => void;
  readonly onPublishDecisionContext: () => void;
  readonly onDisposeDecisionContext: () => void;
  readonly onStartDecisionExecution: () => void;
  readonly onAdvanceDecisionExecution: () => void;
  readonly onTransitionDecisionExecution: () => void;
  readonly onCompleteDecisionExecution: () => void;
  readonly onValidateDecisionExecution: () => void;
  readonly onDisposeDecisionExecution: () => void;
  readonly onStartExperienceRuntime: () => void;
  readonly onNextExperienceRuntimeMove: () => void;
  readonly onPreviousExperienceRuntimeMove: () => void;
  readonly onJumpExperienceRuntimeMove: () => void;
  readonly onCompleteExperienceRuntime: () => void;
  readonly onValidateExperienceRuntime: () => void;
  readonly onDisposeExperienceRuntime: () => void;
  readonly onInitializeExperienceModules: () => void;
  readonly onActivateExperienceModule: () => void;
  readonly onTransitionExperienceModule: () => void;
  readonly onCompleteExperienceModules: () => void;
  readonly onValidateExperienceModules: () => void;
  readonly onDisposeExperienceModules: () => void;
  readonly onCreateExperienceState: () => void;
  readonly onUpdateExperienceState: () => void;
  readonly onCheckpointExperienceState: () => void;
  readonly onRestoreExperienceState: () => void;
  readonly onCompleteExperienceState: () => void;
  readonly onValidateExperienceState: () => void;
  readonly onDisposeExperienceState: () => void;
  readonly onCollectRuntimeObservability: () => void;
  readonly onPublishRuntimeObservability: () => void;
  readonly onValidateRuntimeObservability: () => void;
  readonly onDisposeRuntimeObservability: () => void;
  readonly onInspectRuntimeHealth: () => void;
  readonly onPublishRuntimeHealth: () => void;
  readonly onValidateRuntimeHealth: () => void;
  readonly onDisposeRuntimeHealth: () => void;
  readonly onRecordRuntimeAudit: () => void;
  readonly onPublishRuntimeAudit: () => void;
  readonly onValidateRuntimeAudit: () => void;
  readonly onDisposeRuntimeAudit: () => void;
  readonly onEvaluateRuntimeGovernance: () => void;
  readonly onPublishRuntimeGovernance: () => void;
  readonly onValidateRuntimeGovernance: () => void;
  readonly onDisposeRuntimeGovernance: () => void;
  readonly onInitializeRuntimePolicies: () => void;
  readonly onRegisterRuntimePolicy: () => void;
  readonly onPublishRuntimePolicies: () => void;
  readonly onValidateRuntimePolicies: () => void;
  readonly onDisposeRuntimePolicies: () => void;
  readonly onEvaluateRuntimeEnforcement: () => void;
  readonly onPublishRuntimeEnforcement: () => void;
  readonly onValidateRuntimeEnforcement: () => void;
  readonly onDisposeRuntimeEnforcement: () => void;
  readonly onEvaluateRuntimeResilience: () => void;
  readonly onPublishRuntimeResilience: () => void;
  readonly onValidateRuntimeResilience: () => void;
  readonly onDisposeRuntimeResilience: () => void;
  readonly onBuildRuntimeRecovery: () => void;
  readonly onPublishRuntimeRecovery: () => void;
  readonly onValidateRuntimeRecovery: () => void;
  readonly onDisposeRuntimeRecovery: () => void;
  readonly onExecuteRuntimeRecoveryExecution: () => void;
  readonly onPauseRuntimeRecoveryExecution: () => void;
  readonly onResumeRuntimeRecoveryExecution: () => void;
  readonly onValidateRuntimeRecoveryExecution: () => void;
  readonly onPublishRuntimeRecoveryExecution: () => void;
  readonly onDisposeRuntimeRecoveryExecution: () => void;
  readonly onStartRuntimeRecoveryCoordinator: () => void;
  readonly onCompleteRuntimeRecoveryCoordinator: () => void;
  readonly onPublishRuntimeRecoveryCoordinator: () => void;
  readonly onValidateRuntimeRecoveryCoordinator: () => void;
  readonly onDisposeRuntimeRecoveryCoordinator: () => void;
  readonly onGenerateRuntimeRecoveryReporting: () => void;
  readonly onPublishRuntimeRecoveryReporting: () => void;
  readonly onValidateRuntimeRecoveryReporting: () => void;
  readonly onDisposeRuntimeRecoveryReporting: () => void;
  readonly onCollectRuntimeOperations: () => void;
  readonly onPublishRuntimeOperations: () => void;
  readonly onValidateRuntimeOperations: () => void;
  readonly onDisposeRuntimeOperations: () => void;
  readonly onRegisterRuntimeIntegration: () => void;
  readonly onPublishRuntimeIntegration: () => void;
  readonly onValidateRuntimeIntegration: () => void;
  readonly onDisposeRuntimeIntegration: () => void;
  readonly onRegisterRuntimeRegistry: () => void;
  readonly onPublishRuntimeRegistry: () => void;
  readonly onValidateRuntimeRegistry: () => void;
  readonly onDisposeRuntimeRegistry: () => void;
  readonly onGenerateRuntimeManifest: () => void;
  readonly onPublishRuntimeManifest: () => void;
  readonly onValidateRuntimeManifest: () => void;
  readonly onDisposeRuntimeManifest: () => void;
  readonly onRegisterRuntimeApi: () => void;
  readonly onPublishRuntimeApi: () => void;
  readonly onValidateRuntimeApi: () => void;
  readonly onDisposeRuntimeApi: () => void;
  readonly onRegisterRuntimeCompatibility: () => void;
  readonly onEvaluateRuntimeCompatibility: () => void;
  readonly onPublishRuntimeCompatibility: () => void;
  readonly onValidateRuntimeCompatibility: () => void;
  readonly onDisposeRuntimeCompatibility: () => void;
  readonly onRegisterRuntimeContracts: () => void;
  readonly onPublishRuntimeContracts: () => void;
  readonly onValidateRuntimeContracts: () => void;
  readonly onDisposeRuntimeContracts: () => void;
  readonly onRegisterRuntimeExtensions: () => void;
  readonly onEnableRuntimeExtensions: () => void;
  readonly onDisableRuntimeExtensions: () => void;
  readonly onPublishRuntimeExtensions: () => void;
  readonly onValidateRuntimeExtensions: () => void;
  readonly onDisposeRuntimeExtensions: () => void;
  readonly onBuildObjectPublication: () => void;
  readonly onValidateObjectPublication: () => void;
  readonly onPublishObjectPublication: () => void;
  readonly onDisposeObjectPublication: () => void;
  readonly onRegisterPublishedObjects: () => void;
  readonly onArchivePublishedObjects: () => void;
  readonly onValidatePublishedObjects: () => void;
  readonly onDisposePublishedObjects: () => void;
  readonly onRegisterPlatformPublications: () => void;
  readonly onRefreshPlatformPublications: () => void;
  readonly onValidatePlatformPublications: () => void;
  readonly onDisposePlatformPublications: () => void;
  readonly onLoadClientPublication: () => void;
  readonly onTransformClientPublication: () => void;
  readonly onPublishClientPublication: () => void;
  readonly onValidateClientPublication: () => void;
  readonly onDisposeClientPublication: () => void;
  readonly onValidatePublicationReadiness: () => void;
  readonly onEvaluatePublicationReadiness: () => void;
  readonly onPublishPublicationReadiness: () => void;
  readonly onDisposePublicationReadiness: () => void;
  readonly onBuildRuntimeBootstrap: () => void;
  readonly onValidateRuntimeBootstrap: () => void;
  readonly onPublishRuntimeBootstrap: () => void;
  readonly onDisposeRuntimeBootstrap: () => void;
  readonly onRegisterArtifactVersion: () => void;
  readonly onActivateArtifactVersion: () => void;
  readonly onDeprecateArtifactVersion: () => void;
  readonly onValidateArtifactVersion: () => void;
  readonly onDisposeArtifactVersion: () => void;
  readonly onRegisterArtifactDependency: () => void;
  readonly onRemoveArtifactDependency: () => void;
  readonly onValidateArtifactDependencies: () => void;
  readonly onDisposeArtifactDependency: () => void;
};

export function WorkspaceCanvas({
  projectModel,
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
  knowledgeLayerRegistry,
  knowledgeLayerBundle,
  knowledgeLayerEvents,
  knowledgeReferences,
  resolvedLayers,
  learningPackage,
  learningEvents,
  learningOrigins,
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
  priorityRegistry,
  moduleRegistry,
  objectEvents,
  validationReport,
  manifest,
  versions,
  readiness,
  timeline,
  activeSection,
  onSelectSection,
  onAddAsset,
  onRemoveAsset,
  onUpdateMetadata,
  onUpdateObjectMetadata,
  onToggleModule,
  onSaveObject,
  onDuplicateObject,
  onSelectScene,
  onAddScene,
  onRenameScene,
  onMoveScene,
  onRemoveScene,
  onToggleSceneModule,
  onSaveKnowledge,
  onAddFact,
  onAddEntity,
  onAddRelationship,
  onAddFaq,
  onSaveDecision,
  onAddDecisionRule,
  onAddDecisionSignal,
  onAddDecisionStrategy,
  onToggleDecisionPriority,
  onBuildContext,
  onRefreshContext,
  onClearContext,
  onEnsureKnowledgeLayers,
  onAddDemoLayerReferences,
  onRemoveLayerReference,
  onSaveLearning,
  onAddLearningObservation,
  onAddLearningPattern,
  onAddLearningHeuristic,
  onBuildDecisionModel,
  onValidateDecisionModel,
  onDisposeDecisionModel,
  onCreateDecisionRuntime,
  onValidateDecisionRuntime,
  onDisposeDecisionRuntime,
  onEvaluateRules,
  onValidateEvaluation,
  onDisposeEvaluation,
  onComposeStory,
  onValidateStory,
  onDisposeStory,
  onCreateRuntimeSession,
  onStartRuntimeSession,
  onNextSessionMove,
  onPreviousSessionMove,
  onCompleteRuntimeSession,
  onDisposeRuntimeSession,
  onEvaluateBehavior,
  onReceiveDemoBehaviorSignals,
  onDisposeBehavior,
  onRecordAnalytics,
  onAggregateAnalytics,
  onExportAnalytics,
  onDisposeAnalytics,
  onImportLearning,
  onValidateLearning,
  onAnonymizeLearning,
  onTransformLearning,
  onDisposeLearningPipeline,
  onCreateLearningRecordsPackage,
  onAddLearningRecordRef,
  onRemoveLastLearningRecordRef,
  onValidateLearningRecordsPackage,
  onPublishLearningRecordsPackage,
  onDisposeLearningRecordsPackage,
  onExtractPatterns,
  onValidatePatterns,
  onPublishPatterns,
  onDisposePatterns,
  onExtractIntelligencePatterns,
  onMergeIntelligencePatterns,
  onValidateIntelligencePatterns,
  onPublishIntelligencePatterns,
  onDisposeIntelligencePatterns,
  onDeriveHeuristics,
  onValidateHeuristics,
  onPublishHeuristics,
  onDisposeHeuristics,
  onSynthesizeKnowledge,
  onMergeKnowledge,
  onValidateSynthesizedKnowledge,
  onPublishSynthesizedKnowledge,
  onDisposeSynthesizedKnowledge,
  onBuildGatewayAIContext,
  onFilterGatewayAIContext,
  onValidateGatewayAIContext,
  onPublishGatewayAIContext,
  onDisposeGatewayAIContext,
  onPersonalizeContext,
  onRankPersonalization,
  onValidatePersonalization,
  onPublishPersonalization,
  onDisposePersonalization,
  onProjectDecisionContext,
  onRankDecisionContext,
  onValidateDecisionContext,
  onPublishDecisionContext,
  onDisposeDecisionContext,
  onStartDecisionExecution,
  onAdvanceDecisionExecution,
  onTransitionDecisionExecution,
  onCompleteDecisionExecution,
  onValidateDecisionExecution,
  onDisposeDecisionExecution,
  onStartExperienceRuntime,
  onNextExperienceRuntimeMove,
  onPreviousExperienceRuntimeMove,
  onJumpExperienceRuntimeMove,
  onCompleteExperienceRuntime,
  onValidateExperienceRuntime,
  onDisposeExperienceRuntime,
  onInitializeExperienceModules,
  onActivateExperienceModule,
  onTransitionExperienceModule,
  onCompleteExperienceModules,
  onValidateExperienceModules,
  onDisposeExperienceModules,
  onCreateExperienceState,
  onUpdateExperienceState,
  onCheckpointExperienceState,
  onRestoreExperienceState,
  onCompleteExperienceState,
  onValidateExperienceState,
  onDisposeExperienceState,
  onCollectRuntimeObservability,
  onPublishRuntimeObservability,
  onValidateRuntimeObservability,
  onDisposeRuntimeObservability,
  onInspectRuntimeHealth,
  onPublishRuntimeHealth,
  onValidateRuntimeHealth,
  onDisposeRuntimeHealth,
  onRecordRuntimeAudit,
  onPublishRuntimeAudit,
  onValidateRuntimeAudit,
  onDisposeRuntimeAudit,
  onEvaluateRuntimeGovernance,
  onPublishRuntimeGovernance,
  onValidateRuntimeGovernance,
  onDisposeRuntimeGovernance,
  onInitializeRuntimePolicies,
  onRegisterRuntimePolicy,
  onPublishRuntimePolicies,
  onValidateRuntimePolicies,
  onDisposeRuntimePolicies,
  onEvaluateRuntimeEnforcement,
  onPublishRuntimeEnforcement,
  onValidateRuntimeEnforcement,
  onDisposeRuntimeEnforcement,
  onEvaluateRuntimeResilience,
  onPublishRuntimeResilience,
  onValidateRuntimeResilience,
  onDisposeRuntimeResilience,
  onBuildRuntimeRecovery,
  onPublishRuntimeRecovery,
  onValidateRuntimeRecovery,
  onDisposeRuntimeRecovery,
  onExecuteRuntimeRecoveryExecution,
  onPauseRuntimeRecoveryExecution,
  onResumeRuntimeRecoveryExecution,
  onValidateRuntimeRecoveryExecution,
  onPublishRuntimeRecoveryExecution,
  onDisposeRuntimeRecoveryExecution,
  onStartRuntimeRecoveryCoordinator,
  onCompleteRuntimeRecoveryCoordinator,
  onPublishRuntimeRecoveryCoordinator,
  onValidateRuntimeRecoveryCoordinator,
  onDisposeRuntimeRecoveryCoordinator,
  onGenerateRuntimeRecoveryReporting,
  onPublishRuntimeRecoveryReporting,
  onValidateRuntimeRecoveryReporting,
  onDisposeRuntimeRecoveryReporting,
  onCollectRuntimeOperations,
  onPublishRuntimeOperations,
  onValidateRuntimeOperations,
  onDisposeRuntimeOperations,
  onRegisterRuntimeIntegration,
  onPublishRuntimeIntegration,
  onValidateRuntimeIntegration,
  onDisposeRuntimeIntegration,
  onRegisterRuntimeRegistry,
  onPublishRuntimeRegistry,
  onValidateRuntimeRegistry,
  onDisposeRuntimeRegistry,
  onGenerateRuntimeManifest,
  onPublishRuntimeManifest,
  onValidateRuntimeManifest,
  onDisposeRuntimeManifest,
  onRegisterRuntimeApi,
  onPublishRuntimeApi,
  onValidateRuntimeApi,
  onDisposeRuntimeApi,
  onRegisterRuntimeCompatibility,
  onEvaluateRuntimeCompatibility,
  onPublishRuntimeCompatibility,
  onValidateRuntimeCompatibility,
  onDisposeRuntimeCompatibility,
  onRegisterRuntimeContracts,
  onPublishRuntimeContracts,
  onValidateRuntimeContracts,
  onDisposeRuntimeContracts,
  onRegisterRuntimeExtensions,
  onEnableRuntimeExtensions,
  onDisableRuntimeExtensions,
  onPublishRuntimeExtensions,
  onValidateRuntimeExtensions,
  onDisposeRuntimeExtensions,
  onBuildObjectPublication,
  onValidateObjectPublication,
  onPublishObjectPublication,
  onDisposeObjectPublication,
  onRegisterPublishedObjects,
  onArchivePublishedObjects,
  onValidatePublishedObjects,
  onDisposePublishedObjects,
  onRegisterPlatformPublications,
  onRefreshPlatformPublications,
  onValidatePlatformPublications,
  onDisposePlatformPublications,
  onLoadClientPublication,
  onTransformClientPublication,
  onPublishClientPublication,
  onValidateClientPublication,
  onDisposeClientPublication,
  onValidatePublicationReadiness,
  onEvaluatePublicationReadiness,
  onPublishPublicationReadiness,
  onDisposePublicationReadiness,
  onBuildRuntimeBootstrap,
  onValidateRuntimeBootstrap,
  onPublishRuntimeBootstrap,
  onDisposeRuntimeBootstrap,
  onRegisterArtifactVersion,
  onActivateArtifactVersion,
  onDeprecateArtifactVersion,
  onValidateArtifactVersion,
  onDisposeArtifactVersion,
  onRegisterArtifactDependency,
  onRemoveArtifactDependency,
  onValidateArtifactDependencies,
  onDisposeArtifactDependency,
}: WorkspaceCanvasProps) {
  if (projectModel === null || manifest === null || versions === null || readiness === null) {
    return (
      <div className="rounded-[20px] border border-builder-contentBorder bg-white p-[34px]">
        <h2 className="text-2xl font-semibold">Žádný aktivní projekt</h2>
        <p className="mt-2 text-builder-muted">
          Vytvořte nový projekt nebo vyberte existující v sidebaru.
        </p>
      </div>
    );
  }

  const sectionProps = {
    onAddAsset,
    onRemoveAsset,
    onUpdateMetadata,
  };

  const metadataLine = [
    objectPackage?.metadata.name ?? projectModel.metadata.title,
    projectModel.metadata.partnerName,
    objectPackage?.metadata.location ?? projectModel.metadata.locationLabel,
    objectPackage?.metadata.description ?? projectModel.metadata.notes,
  ]
    .filter((part) => part.trim().length > 0)
    .join(' · ');

  return (
    <div>
      <ProjectDashboard
        projectName={projectModel.record.name}
        manifest={manifest}
        versions={versions}
        readiness={readiness}
        timeline={timeline}
        metadataLine={metadataLine}
      />
      <SectionNavigation
        activeSection={activeSection}
        onSelectSection={onSelectSection}
      />
      <div className="min-h-[650px] rounded-[20px] border border-builder-contentBorder bg-white p-[34px]">
        {activeSection === 'overview' && objectPackage !== null ? (
          <ObjectOverview
            objectPackage={objectPackage}
            moduleRegistry={moduleRegistry}
            events={objectEvents}
            validationReport={validationReport}
            readiness={readiness}
            onUpdateMetadata={onUpdateObjectMetadata}
            onToggleModule={onToggleModule}
            onSaveObject={onSaveObject}
            onDuplicateObject={onDuplicateObject}
          />
        ) : null}
        {activeSection === 'overview' && objectPackage === null ? (
          <p className="text-builder-muted">Object Package není k dispozici.</p>
        ) : null}
        {activeSection === 'experience' &&
        experience !== null &&
        experienceStructure !== null &&
        objectPackage !== null ? (
          <ExperienceComposer
            experience={experience}
            structure={experienceStructure}
            moduleRegistry={moduleRegistry}
            availableModules={objectPackage.modules}
            events={composerEvents}
            selectedSceneId={selectedSceneId}
            onSelectScene={onSelectScene}
            onAddScene={onAddScene}
            onRenameScene={onRenameScene}
            onMoveScene={onMoveScene}
            onRemoveScene={onRemoveScene}
            onToggleSceneModule={onToggleSceneModule}
          />
        ) : null}
        {activeSection === 'experience' && experience === null ? (
          <p className="text-builder-muted">Experience není k dispozici.</p>
        ) : null}
        {activeSection === 'knowledge-package' && knowledgePackage !== null ? (
          <KnowledgeOverview
            knowledgePackage={knowledgePackage}
            events={knowledgeEvents}
            onSaveKnowledge={onSaveKnowledge}
            onAddFact={onAddFact}
            onAddEntity={onAddEntity}
            onAddRelationship={onAddRelationship}
            onAddFaq={onAddFaq}
          />
        ) : null}
        {activeSection === 'knowledge-package' && knowledgePackage === null ? (
          <p className="text-builder-muted">
            Knowledge Package není k dispozici.
          </p>
        ) : null}

        {activeSection === 'decision' && decisionKnowledge !== null ? (
          <DecisionOverview
            decisionKnowledge={decisionKnowledge}
            priorityRegistry={priorityRegistry}
            events={decisionEvents}
            onSave={onSaveDecision}
            onAddRule={onAddDecisionRule}
            onAddSignal={onAddDecisionSignal}
            onAddStrategy={onAddDecisionStrategy}
            onTogglePriority={onToggleDecisionPriority}
          />
        ) : null}
        {activeSection === 'decision' && decisionKnowledge === null ? (
          <p className="text-builder-muted">
            Decision Knowledge není k dispozici.
          </p>
        ) : null}

        {activeSection === 'ai-context' ? (
          <AIContextPreview
            aiContext={aiContext}
            events={contextEvents}
            onBuild={onBuildContext}
            onRefresh={onRefreshContext}
            onClear={onClearContext}
          />
        ) : null}

        {activeSection === 'knowledge-layers' ? (
          <KnowledgeLayersOverview
            registry={knowledgeLayerRegistry}
            bundle={knowledgeLayerBundle}
            references={knowledgeReferences}
            resolved={resolvedLayers}
            events={knowledgeLayerEvents}
            onEnsureLayers={onEnsureKnowledgeLayers}
            onAddDemoReferences={onAddDemoLayerReferences}
            onRemoveReference={onRemoveLayerReference}
          />
        ) : null}

        {activeSection === 'learning' && learningPackage !== null ? (
          <LearningOverview
            learningPackage={learningPackage}
            origins={learningOrigins}
            events={learningEvents}
            onSave={onSaveLearning}
            onAddObservation={onAddLearningObservation}
            onAddPattern={onAddLearningPattern}
            onAddHeuristic={onAddLearningHeuristic}
          />
        ) : null}
        {activeSection === 'learning' && learningPackage === null ? (
          <p className="text-builder-muted">
            Learning Package není k dispozici.
          </p>
        ) : null}

        {activeSection === 'decision-engine' ? (
          <DecisionEngineOverview
            decisionModel={decisionModel}
            events={decisionEngineEvents}
            onBuild={onBuildDecisionModel}
            onValidate={onValidateDecisionModel}
            onDispose={onDisposeDecisionModel}
          />
        ) : null}

        {activeSection === 'decision-runtime' ? (
          <DecisionRuntimeOverview
            runtimeModel={runtimeModel}
            events={decisionRuntimeEvents}
            onCreate={onCreateDecisionRuntime}
            onValidate={onValidateDecisionRuntime}
            onDispose={onDisposeDecisionRuntime}
          />
        ) : null}

        {activeSection === 'rule-evaluation' ? (
          <RuleEvaluationOverview
            evaluationResult={evaluationResult}
            events={evaluationEvents}
            onEvaluate={onEvaluateRules}
            onValidate={onValidateEvaluation}
            onDispose={onDisposeEvaluation}
            validationMessage={evaluationValidationMessage}
          />
        ) : null}

        {activeSection === 'decision-story' ? (
          <DecisionStoryOverview
            decisionStory={decisionStory}
            events={storyEvents}
            onCompose={onComposeStory}
            onValidate={onValidateStory}
            onDispose={onDisposeStory}
            message={storyMessage}
          />
        ) : null}

        {activeSection === 'runtime-session' ? (
          <RuntimeSessionOverview
            runtimeSession={runtimeSession}
            events={sessionEvents}
            onCreate={onCreateRuntimeSession}
            onStart={onStartRuntimeSession}
            onNext={onNextSessionMove}
            onPrevious={onPreviousSessionMove}
            onComplete={onCompleteRuntimeSession}
            onDispose={onDisposeRuntimeSession}
            message={sessionMessage}
          />
        ) : null}

        {activeSection === 'behavior' ? (
          <BehaviorOverview
            evaluation={behaviorEvaluation}
            signals={behaviorSignals}
            events={behaviorEvents}
            onEvaluate={onEvaluateBehavior}
            onReceiveDemoSignals={onReceiveDemoBehaviorSignals}
            onDispose={onDisposeBehavior}
            message={behaviorMessage}
          />
        ) : null}

        {activeSection === 'analytics' ? (
          <AnalyticsOverview
            snapshot={analyticsSnapshot}
            events={analyticsEvents}
            onRecord={onRecordAnalytics}
            onAggregate={onAggregateAnalytics}
            onExport={onExportAnalytics}
            onDispose={onDisposeAnalytics}
            message={analyticsMessage}
          />
        ) : null}


        {activeSection === 'learning-pipeline' ? (
          <LearningPipelineOverview
            record={learningRecord}
            validation={learningValidation}
            report={learningImportReport}
            exportPayload={learningExportPayload}
            events={learningPipelineEvents}
            snapshotLabel={
              analyticsSnapshot === null ? null : analyticsSnapshot.id
            }
            onImport={onImportLearning}
            onValidate={onValidateLearning}
            onAnonymize={onAnonymizeLearning}
            onTransform={onTransformLearning}
            onDispose={onDisposeLearningPipeline}
            message={learningPipelineMessage}
          />
        ) : null}

        {activeSection === 'learning-package-mgr' ? (
          <LearningPackageManagerOverview
            learningRecordsPackage={learningRecordsPackage}
            events={learningPackageManagerEvents}
            indexCount={learningPackageIndexCount}
            onCreate={onCreateLearningRecordsPackage}
            onAddRecord={onAddLearningRecordRef}
            onRemoveLastRecord={onRemoveLastLearningRecordRef}
            onValidate={onValidateLearningRecordsPackage}
            onPublish={onPublishLearningRecordsPackage}
            onDispose={onDisposeLearningRecordsPackage}
            message={learningPackageManagerMessage}
          />
        ) : null}

        {activeSection === 'pattern-extraction' ? (
          <PatternExtractionOverview
            patternCollection={patternCollection}
            events={patternExtractionEvents}
            indexCount={patternIndexCount}
            onExtract={onExtractPatterns}
            onValidate={onValidatePatterns}
            onPublish={onPublishPatterns}
            onDispose={onDisposePatterns}
            message={patternExtractionMessage}
          />
        ) : null}

        {activeSection === 'pattern-intelligence' ? (
          <PatternIntelligenceOverview
            patternCatalog={patternCatalog}
            events={patternIntelligenceEvents}
            indexCount={patternIntelligenceIndexCount}
            onExtract={onExtractIntelligencePatterns}
            onMerge={onMergeIntelligencePatterns}
            onValidate={onValidateIntelligencePatterns}
            onPublish={onPublishIntelligencePatterns}
            onDispose={onDisposeIntelligencePatterns}
            message={patternIntelligenceMessage}
          />
        ) : null}

        {activeSection === 'heuristic-engine' ? (
          <HeuristicEngineOverview
            heuristicCatalog={heuristicCatalog}
            events={heuristicEngineEvents}
            indexCount={heuristicIndexCount}
            onDerive={onDeriveHeuristics}
            onValidate={onValidateHeuristics}
            onPublish={onPublishHeuristics}
            onDispose={onDisposeHeuristics}
            message={heuristicEngineMessage}
          />
        ) : null}

        {activeSection === 'knowledge-synthesis' ? (
          <KnowledgeSynthesisOverview
            knowledgeBase={synthesizedKnowledgeBase}
            events={knowledgeSynthesisEvents}
            indexCount={knowledgeSynthesisIndexCount}
            onSynthesize={onSynthesizeKnowledge}
            onMerge={onMergeKnowledge}
            onValidate={onValidateSynthesizedKnowledge}
            onPublish={onPublishSynthesizedKnowledge}
            onDispose={onDisposeSynthesizedKnowledge}
            message={knowledgeSynthesisMessage}
          />
        ) : null}

        {activeSection === 'ai-decision-gateway' ? (
          <AIDecisionGatewayOverview
            aiContextPackage={gatewayAIContextPackage}
            events={aiDecisionGatewayEvents}
            indexCount={aiDecisionGatewayIndexCount}
            onBuild={onBuildGatewayAIContext}
            onFilter={onFilterGatewayAIContext}
            onValidate={onValidateGatewayAIContext}
            onPublish={onPublishGatewayAIContext}
            onDispose={onDisposeGatewayAIContext}
            message={aiDecisionGatewayMessage}
          />
        ) : null}

        {activeSection === 'personalization-engine' ? (
          <PersonalizationEngineOverview
            personalizationPackage={personalizationPackage}
            events={personalizationEngineEvents}
            indexCount={personalizationIndexCount}
            onPersonalize={onPersonalizeContext}
            onRank={onRankPersonalization}
            onValidate={onValidatePersonalization}
            onPublish={onPublishPersonalization}
            onDispose={onDisposePersonalization}
            message={personalizationEngineMessage}
          />
        ) : null}

        {activeSection === 'personalization-runtime' ? (
          <PersonalizationRuntimeOverview
            personalizedContextPackage={personalizedContextPackage}
            events={personalizationRuntimeEvents}
            indexCount={personalizationRuntimeIndexCount}
            onProject={onProjectDecisionContext}
            onRank={onRankDecisionContext}
            onValidate={onValidateDecisionContext}
            onPublish={onPublishDecisionContext}
            onDispose={onDisposeDecisionContext}
            message={personalizationRuntimeMessage}
          />
        ) : null}

        {activeSection === 'decision-orchestrator' ? (
          <DecisionOrchestratorOverview
            executionPackage={decisionExecutionPackage}
            events={decisionOrchestratorEvents}
            indexCount={decisionOrchestratorIndexCount}
            onStart={onStartDecisionExecution}
            onAdvance={onAdvanceDecisionExecution}
            onTransition={onTransitionDecisionExecution}
            onComplete={onCompleteDecisionExecution}
            onValidate={onValidateDecisionExecution}
            onDispose={onDisposeDecisionExecution}
            message={decisionOrchestratorMessage}
          />
        ) : null}

        {activeSection === 'experience-runtime' ? (
          <ExperienceRuntimeOverview
            executionPackage={runtimeExecutionPackage}
            events={experienceRuntimeEvents}
            indexCount={experienceRuntimeIndexCount}
            onStart={onStartExperienceRuntime}
            onNext={onNextExperienceRuntimeMove}
            onPrevious={onPreviousExperienceRuntimeMove}
            onJump={onJumpExperienceRuntimeMove}
            onComplete={onCompleteExperienceRuntime}
            onValidate={onValidateExperienceRuntime}
            onDispose={onDisposeExperienceRuntime}
            message={experienceRuntimeMessage}
          />
        ) : null}

        {activeSection === 'experience-modules' ? (
          <ExperienceModulesOverview
            modulePackage={experienceModulePackage}
            events={moduleCoordinatorEvents}
            indexCount={moduleCoordinatorIndexCount}
            onInitialize={onInitializeExperienceModules}
            onActivate={onActivateExperienceModule}
            onTransition={onTransitionExperienceModule}
            onComplete={onCompleteExperienceModules}
            onValidate={onValidateExperienceModules}
            onDispose={onDisposeExperienceModules}
            message={moduleCoordinatorMessage}
          />
        ) : null}

        {activeSection === 'experience-state' ? (
          <ExperienceStateOverview
            statePackage={experienceStatePackage}
            events={experienceStateEvents}
            indexCount={experienceStateIndexCount}
            onCreate={onCreateExperienceState}
            onUpdate={onUpdateExperienceState}
            onCheckpoint={onCheckpointExperienceState}
            onRestore={onRestoreExperienceState}
            onComplete={onCompleteExperienceState}
            onValidate={onValidateExperienceState}
            onDispose={onDisposeExperienceState}
            message={experienceStateMessage}
          />
        ) : null}

        {activeSection === 'observability' ? (
          <ObservabilityOverview
            observabilityPackage={observabilityPackage}
            events={observabilityEvents}
            indexCount={observabilityIndexCount}
            activeSessionCount={
              observabilityPackage?.metrics.sessionCount ?? 0
            }
            onCollect={onCollectRuntimeObservability}
            onPublish={onPublishRuntimeObservability}
            onValidate={onValidateRuntimeObservability}
            onDispose={onDisposeRuntimeObservability}
            message={observabilityMessage}
          />
        ) : null}

        {activeSection === 'runtime-health' ? (
          <HealthOverview
            healthPackage={runtimeHealthPackage}
            events={runtimeHealthEvents}
            indexCount={runtimeHealthIndexCount}
            onInspect={onInspectRuntimeHealth}
            onPublish={onPublishRuntimeHealth}
            onValidate={onValidateRuntimeHealth}
            onDispose={onDisposeRuntimeHealth}
            message={runtimeHealthMessage}
          />
        ) : null}

        {activeSection === 'runtime-audit' ? (
          <AuditOverview
            auditPackage={runtimeAuditPackage}
            events={runtimeAuditEvents}
            indexCount={runtimeAuditIndexCount}
            publishedCount={
              runtimeAuditPackage?.metadata.status === 'Published' ? 1 : 0
            }
            onRecord={onRecordRuntimeAudit}
            onPublish={onPublishRuntimeAudit}
            onValidate={onValidateRuntimeAudit}
            onDispose={onDisposeRuntimeAudit}
            message={runtimeAuditMessage}
          />
        ) : null}

        {activeSection === 'runtime-governance' ? (
          <GovernanceOverview
            governancePackage={runtimeGovernancePackage}
            events={runtimeGovernanceEvents}
            indexCount={runtimeGovernanceIndexCount}
            onEvaluate={onEvaluateRuntimeGovernance}
            onPublish={onPublishRuntimeGovernance}
            onValidate={onValidateRuntimeGovernance}
            onDispose={onDisposeRuntimeGovernance}
            message={runtimeGovernanceMessage}
          />
        ) : null}

        {activeSection === 'runtime-policies' ? (
          <PoliciesOverview
            policyPackage={runtimePolicyPackage}
            events={runtimePolicyEvents}
            indexCount={runtimePolicyIndexCount}
            onInitialize={onInitializeRuntimePolicies}
            onRegister={onRegisterRuntimePolicy}
            onPublish={onPublishRuntimePolicies}
            onValidate={onValidateRuntimePolicies}
            onDispose={onDisposeRuntimePolicies}
            message={runtimePolicyMessage}
          />
        ) : null}

        {activeSection === 'runtime-enforcement' ? (
          <EnforcementOverview
            enforcementPackage={runtimeEnforcementPackage}
            events={runtimeEnforcementEvents}
            indexCount={runtimeEnforcementIndexCount}
            onEvaluate={onEvaluateRuntimeEnforcement}
            onPublish={onPublishRuntimeEnforcement}
            onValidate={onValidateRuntimeEnforcement}
            onDispose={onDisposeRuntimeEnforcement}
            message={runtimeEnforcementMessage}
          />
        ) : null}

        {activeSection === 'runtime-resilience' ? (
          <ResilienceOverview
            resiliencePackage={runtimeResiliencePackage}
            events={runtimeResilienceEvents}
            indexCount={runtimeResilienceIndexCount}
            onEvaluate={onEvaluateRuntimeResilience}
            onPublish={onPublishRuntimeResilience}
            onValidate={onValidateRuntimeResilience}
            onDispose={onDisposeRuntimeResilience}
            message={runtimeResilienceMessage}
          />
        ) : null}

        {activeSection === 'runtime-recovery' ? (
          <RecoveryOverview
            recoveryPackage={runtimeRecoveryPackage}
            events={runtimeRecoveryEvents}
            indexCount={runtimeRecoveryIndexCount}
            onBuild={onBuildRuntimeRecovery}
            onPublish={onPublishRuntimeRecovery}
            onValidate={onValidateRuntimeRecovery}
            onDispose={onDisposeRuntimeRecovery}
            message={runtimeRecoveryMessage}
          />
        ) : null}

        {activeSection === 'runtime-recovery-execution' ? (
          <RecoveryExecutionOverview
            executionPackage={runtimeRecoveryExecutionPackage}
            events={runtimeRecoveryExecutionEvents}
            indexCount={runtimeRecoveryExecutionIndexCount}
            onExecute={onExecuteRuntimeRecoveryExecution}
            onPause={onPauseRuntimeRecoveryExecution}
            onResume={onResumeRuntimeRecoveryExecution}
            onValidate={onValidateRuntimeRecoveryExecution}
            onPublish={onPublishRuntimeRecoveryExecution}
            onDispose={onDisposeRuntimeRecoveryExecution}
            message={runtimeRecoveryExecutionMessage}
          />
        ) : null}

        {activeSection === 'runtime-recovery-coordinator' ? (
          <RecoveryCoordinatorOverview
            summaryPackage={runtimeRecoveryCoordinatorPackage}
            events={runtimeRecoveryCoordinatorEvents}
            indexCount={runtimeRecoveryCoordinatorIndexCount}
            onStart={onStartRuntimeRecoveryCoordinator}
            onComplete={onCompleteRuntimeRecoveryCoordinator}
            onPublish={onPublishRuntimeRecoveryCoordinator}
            onValidate={onValidateRuntimeRecoveryCoordinator}
            onDispose={onDisposeRuntimeRecoveryCoordinator}
            message={runtimeRecoveryCoordinatorMessage}
          />
        ) : null}

        {activeSection === 'runtime-recovery-reporting' ? (
          <RecoveryReportingOverview
            reportPackage={runtimeRecoveryReportingPackage}
            events={runtimeRecoveryReportingEvents}
            indexCount={runtimeRecoveryReportingIndexCount}
            onGenerate={onGenerateRuntimeRecoveryReporting}
            onPublish={onPublishRuntimeRecoveryReporting}
            onValidate={onValidateRuntimeRecoveryReporting}
            onDispose={onDisposeRuntimeRecoveryReporting}
            message={runtimeRecoveryReportingMessage}
          />
        ) : null}

        {activeSection === 'runtime-operations' ? (
          <OperationsOverview
            operationsPackage={runtimeOperationsPackage}
            events={runtimeOperationsEvents}
            indexCount={runtimeOperationsIndexCount}
            onCollect={onCollectRuntimeOperations}
            onPublish={onPublishRuntimeOperations}
            onValidate={onValidateRuntimeOperations}
            onDispose={onDisposeRuntimeOperations}
            message={runtimeOperationsMessage}
          />
        ) : null}

        {activeSection === 'runtime-integration' ? (
          <RuntimeIntegrationOverview
            integrationPackage={runtimeIntegrationPackage}
            events={runtimeIntegrationEvents}
            indexCount={runtimeIntegrationIndexCount}
            onRegister={onRegisterRuntimeIntegration}
            onPublish={onPublishRuntimeIntegration}
            onValidate={onValidateRuntimeIntegration}
            onDispose={onDisposeRuntimeIntegration}
            message={runtimeIntegrationMessage}
          />
        ) : null}

        {activeSection === 'runtime-registry' ? (
          <RuntimeRegistryOverview
            registryPackage={runtimeRegistryPackage}
            events={runtimeRegistryEvents}
            indexCount={runtimeRegistryIndexCount}
            onRegister={onRegisterRuntimeRegistry}
            onPublish={onPublishRuntimeRegistry}
            onValidate={onValidateRuntimeRegistry}
            onDispose={onDisposeRuntimeRegistry}
            message={runtimeRegistryMessage}
          />
        ) : null}

        {activeSection === 'runtime-manifest' ? (
          <RuntimeManifestOverview
            manifestPackage={runtimeManifestPackage}
            events={runtimeManifestEvents}
            indexCount={runtimeManifestIndexCount}
            onGenerate={onGenerateRuntimeManifest}
            onPublish={onPublishRuntimeManifest}
            onValidate={onValidateRuntimeManifest}
            onDispose={onDisposeRuntimeManifest}
            message={runtimeManifestMessage}
          />
        ) : null}

        {activeSection === 'runtime-api' ? (
          <RuntimeApiOverview
            apiPackage={runtimeApiPackage}
            events={runtimeApiEvents}
            indexCount={runtimeApiIndexCount}
            onRegister={onRegisterRuntimeApi}
            onPublish={onPublishRuntimeApi}
            onValidate={onValidateRuntimeApi}
            onDispose={onDisposeRuntimeApi}
            message={runtimeApiMessage}
          />
        ) : null}

        {activeSection === 'runtime-compatibility' ? (
          <RuntimeCompatibilityOverview
            compatibilityPackage={runtimeCompatibilityPackage}
            events={runtimeCompatibilityEvents}
            indexCount={runtimeCompatibilityIndexCount}
            onRegister={onRegisterRuntimeCompatibility}
            onEvaluate={onEvaluateRuntimeCompatibility}
            onPublish={onPublishRuntimeCompatibility}
            onValidate={onValidateRuntimeCompatibility}
            onDispose={onDisposeRuntimeCompatibility}
            message={runtimeCompatibilityMessage}
          />
        ) : null}

        {activeSection === 'runtime-contracts' ? (
          <RuntimeContractsOverview
            contractPackage={runtimeContractPackage}
            events={runtimeContractEvents}
            indexCount={runtimeContractIndexCount}
            onRegister={onRegisterRuntimeContracts}
            onPublish={onPublishRuntimeContracts}
            onValidate={onValidateRuntimeContracts}
            onDispose={onDisposeRuntimeContracts}
            message={runtimeContractMessage}
          />
        ) : null}

        {activeSection === 'runtime-extensions' ? (
          <RuntimeExtensionsOverview
            extensionPackage={runtimeExtensionPackage}
            events={runtimeExtensionEvents}
            indexCount={runtimeExtensionIndexCount}
            onRegister={onRegisterRuntimeExtensions}
            onEnable={onEnableRuntimeExtensions}
            onDisable={onDisableRuntimeExtensions}
            onPublish={onPublishRuntimeExtensions}
            onValidate={onValidateRuntimeExtensions}
            onDispose={onDisposeRuntimeExtensions}
            message={runtimeExtensionMessage}
          />
        ) : null}

        {activeSection === 'object-publication' ? (
          <ObjectPublicationOverview
            publicationPackage={objectPublicationPackage}
            events={objectPublicationEvents}
            indexCount={objectPublicationIndexCount}
            onBuild={onBuildObjectPublication}
            onValidate={onValidateObjectPublication}
            onPublish={onPublishObjectPublication}
            onDispose={onDisposeObjectPublication}
            message={objectPublicationMessage}
          />
        ) : null}

        {activeSection === 'published-objects' ? (
          <PublishedObjectsOverview
            registryPackage={publishedObjectPackage}
            events={publishedObjectEvents}
            indexCount={publishedObjectIndexCount}
            onRegister={onRegisterPublishedObjects}
            onArchive={onArchivePublishedObjects}
            onValidate={onValidatePublishedObjects}
            onDispose={onDisposePublishedObjects}
            message={publishedObjectMessage}
          />
        ) : null}

        {activeSection === 'platform-publication' ? (
          <PlatformPublicationOverview
            catalogPackage={platformPublicationPackage}
            events={platformPublicationEvents}
            indexCount={platformPublicationIndexCount}
            onRegister={onRegisterPlatformPublications}
            onRefresh={onRefreshPlatformPublications}
            onValidate={onValidatePlatformPublications}
            onDispose={onDisposePlatformPublications}
            message={platformPublicationMessage}
          />
        ) : null}
        {activeSection === 'client-publication' ? (
          <ClientPublicationOverview
            publicationPackage={clientPublicationPackage}
            events={clientPublicationEvents}
            indexCount={clientPublicationIndexCount}
            onLoad={onLoadClientPublication}
            onTransform={onTransformClientPublication}
            onPublish={onPublishClientPublication}
            onValidate={onValidateClientPublication}
            onDispose={onDisposeClientPublication}
            message={clientPublicationMessage}
          />
        ) : null}
        {activeSection === 'publication-readiness' ? (
          <PublicationReadinessOverview
            readinessPackage={publicationReadinessPackage}
            events={publicationReadinessEvents}
            indexCount={publicationReadinessIndexCount}
            onValidate={onValidatePublicationReadiness}
            onEvaluate={onEvaluatePublicationReadiness}
            onPublish={onPublishPublicationReadiness}
            onDispose={onDisposePublicationReadiness}
            message={publicationReadinessMessage}
          />
        ) : null}
        {activeSection === 'runtime-bootstrap' ? (
          <RuntimeBootstrapOverview
            bootstrapPackage={runtimeBootstrapPackage}
            events={runtimeBootstrapEvents}
            indexCount={runtimeBootstrapIndexCount}
            onBuild={onBuildRuntimeBootstrap}
            onValidate={onValidateRuntimeBootstrap}
            onPublish={onPublishRuntimeBootstrap}
            onDispose={onDisposeRuntimeBootstrap}
            message={runtimeBootstrapMessage}
          />
        ) : null}
        {activeSection === 'artifact-versions' ? (
          <ArtifactVersionsOverview
            versionPackage={artifactVersionPackage}
            events={artifactVersionEvents}
            indexCount={artifactVersionIndexCount}
            onRegister={onRegisterArtifactVersion}
            onActivate={onActivateArtifactVersion}
            onDeprecate={onDeprecateArtifactVersion}
            onValidate={onValidateArtifactVersion}
            onDispose={onDisposeArtifactVersion}
            message={artifactVersionMessage}
          />
        ) : null}
        {activeSection === 'artifact-dependencies' ? (
          <ArtifactDependenciesOverview
            dependencyPackage={artifactDependencyPackage}
            events={artifactDependencyEvents}
            indexCount={artifactDependencyIndexCount}
            onRegister={onRegisterArtifactDependency}
            onRemove={onRemoveArtifactDependency}
            onValidate={onValidateArtifactDependencies}
            onDispose={onDisposeArtifactDependency}
            message={artifactDependencyMessage}
          />
        ) : null}
        {activeSection === 'media' ? (
          <MediaSection
            collections={projectModel.assets.media}
            {...sectionProps}
          />
        ) : null}
        {activeSection === 'layout' ? (
          <LayoutSection
            collections={projectModel.assets.layout}
            {...sectionProps}
          />
        ) : null}
        {activeSection === 'knowledge' ? (
          <KnowledgeSection
            collections={projectModel.assets.knowledge}
            {...sectionProps}
          />
        ) : null}
        <div className="mt-5 flex items-center justify-between border-t border-builder-divider pt-5 text-[13px] text-[#7C879A]">
          <span>
            AI Context + Decision + Knowledge + Experience + Object: session only
            (bez persistence)
          </span>
          <span>{manifest.updatedAt}</span>
        </div>
      </div>
    </div>
  );
}
