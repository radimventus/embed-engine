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
        manifest={session.projectManifest}
        versions={session.versions}
        readiness={session.readiness}
        timeline={session.timeline}
        activeSection={session.activeSection}
        onSelectSection={session.selectSection}
        onAddAsset={session.addAsset}
        onRemoveAsset={session.removeAsset}
        onUpdateMetadata={session.updateAssetMetadata}
      />
    </AppShell>
  );
}
