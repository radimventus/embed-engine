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
