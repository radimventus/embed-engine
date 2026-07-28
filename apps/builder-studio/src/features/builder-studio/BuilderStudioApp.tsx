import { AppShell } from '../../components/layout/AppShell';
import { BuilderHeader } from '../../components/shell/BuilderHeader';
import { BuilderSidebar } from '../../components/shell/BuilderSidebar';
import { PublishPanel } from '../../components/shell/PublishPanel';
import { WorkspaceCanvas } from '../../components/shell/WorkspaceCanvas';
import { useBuilderStudioSession } from './useBuilderStudioSession';

export function BuilderStudioApp() {
  const session = useBuilderStudioSession();

  return (
    <AppShell
      header={<BuilderHeader partnerName={session.workspace.partner.name} />}
      sidebar={
        <BuilderSidebar
          partner={session.workspace.partner}
          projects={session.workspace.projects}
          activeProjectId={session.workspace.activeProjectId}
          onOpenProject={session.openProject}
          onCreateProject={session.createProject}
        />
      }
      publishPanel={
        <PublishPanel
          pipeline={session.pipeline}
          latestBuild={session.latestBuild}
          buildHistory={session.buildHistory}
          latestPublish={session.latestPublish}
          publishHistory={session.publishHistory}
          preview={session.preview}
          previewHistory={session.previewHistory}
          validationReport={session.validationReport}
          validationHistory={session.validationHistory}
          validationEvents={session.validationEvents}
          onValidateProject={session.validateProject}
          onBuildProject={session.buildProject}
          onPublishPackage={session.publishPackage}
          onOpenPreview={session.openPreview}
          onRefreshPreview={session.refreshPreview}
          onClosePreview={session.closePreview}
        />
      }
    >
      <WorkspaceCanvas
        projectModel={session.activeProjectModel}
        objectPackage={session.objectPackage}
        experience={session.experience}
        experienceStructure={session.experienceStructure}
        composerEvents={session.composerEvents}
        selectedSceneId={session.selectedSceneId}
        knowledgePackage={session.knowledgePackage}
        knowledgeEvents={session.knowledgeEvents}
        decisionKnowledge={session.decisionKnowledge}
        decisionEvents={session.decisionEvents}
        priorityRegistry={session.priorityRegistry}
        moduleRegistry={session.moduleRegistry}
        objectEvents={session.objectEvents}
        validationReport={session.validationReport}
        manifest={session.projectManifest}
        versions={session.versions}
        readiness={session.readiness}
        timeline={session.timeline}
        activeSection={session.activeSection}
        onSelectSection={session.selectSection}
        onAddAsset={session.addAsset}
        onRemoveAsset={session.removeAsset}
        onUpdateMetadata={session.updateAssetMetadata}
        onUpdateObjectMetadata={session.updateObjectMetadata}
        onToggleModule={session.toggleObjectModule}
        onSaveObject={session.saveObject}
        onDuplicateObject={session.duplicateObject}
        onSelectScene={session.selectScene}
        onAddScene={session.addScene}
        onRenameScene={session.renameScene}
        onMoveScene={session.moveScene}
        onRemoveScene={session.removeScene}
        onToggleSceneModule={session.toggleSceneModule}
        onSaveKnowledge={session.saveKnowledge}
        onAddFact={session.addFact}
        onAddEntity={session.addEntity}
        onAddRelationship={session.addRelationship}
        onAddFaq={session.addFaq}
        onSaveDecision={session.saveDecisionKnowledge}
        onAddDecisionRule={session.addDecisionRule}
        onAddDecisionSignal={session.addDecisionSignal}
        onAddDecisionStrategy={session.addDecisionStrategy}
        onToggleDecisionPriority={session.toggleDecisionPriority}
      />
    </AppShell>
  );
}
