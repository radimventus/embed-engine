import { useState } from 'react';

import { AppShell } from '../../components/layout/AppShell';
import {
  HousePackageEditView,
  HousePackageMountPanel,
  HousePackageRuntimePreview,
  HousePackageSidebar,
  useHousePackageEditController,
  type HousePackageNavId,
} from '../house-package';
import {
  useWorkspaceController,
  WorkspaceSidebar,
} from '../workspace';

/**
 * CAP-BLD-08 — multi-project Workspace over HP-002 Authoring Surface.
 */
export function BuilderStudioApp() {
  const workspace = useWorkspaceController();
  const diskRoot = workspace.activeProject?.packageRoot ?? null;

  const {
    mountStatus,
    snapshot,
    session,
    saving,
    validating,
    publishing,
    previewOpen,
    validationReport,
    releaseSummary,
    releaseVerification,
    publishError,
    apply,
    save,
    validate,
    publish,
    openPreview,
    closePreview,
  } = useHousePackageEditController(diskRoot);
  const [activeNav, setActiveNav] = useState<HousePackageNavId>('overview');

  const loadError =
    diskRoot === null
      ? 'Open a workspace project to mount a House Package.'
      : mountStatus.status === 'error'
        ? mountStatus.message
        : null;

  const dirty = snapshot !== null && snapshot.dirtyState !== 'clean';

  return (
    <AppShell
      header={
        <header className="flex h-builder-header shrink-0 items-center justify-between border-b border-builder-lineSoft bg-white px-[30px]">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              CONIS Builder
            </h1>
            <div className="text-sm text-builder-muted">
              {workspace.activeProject !== null
                ? `${workspace.activeProject.name} · House Package`
                : 'Workspace · select a project'}
            </div>
          </div>
          <div className="text-sm text-builder-muted">
            {workspace.switching && 'Switching project…'}
            {!workspace.switching &&
              mountStatus.status === 'loading' &&
              'Mounting HP-002…'}
            {!workspace.switching &&
              mountStatus.status === 'ready' &&
              publishing &&
              'Publishing…'}
            {!workspace.switching &&
              mountStatus.status === 'ready' &&
              !publishing &&
              previewOpen &&
              'Runtime Preview'}
            {!workspace.switching &&
              mountStatus.status === 'ready' &&
              !publishing &&
              !previewOpen &&
              releaseSummary !== null &&
              'Publish OK · Preview ready'}
            {!workspace.switching &&
              mountStatus.status === 'ready' &&
              !publishing &&
              !previewOpen &&
              releaseSummary === null &&
              publishError !== null &&
              'Publish failed · retry available'}
            {!workspace.switching &&
              mountStatus.status === 'ready' &&
              !publishing &&
              !previewOpen &&
              releaseSummary === null &&
              publishError === null &&
              validationReport !== null &&
              (!validationReport.canPublish
                ? 'Validation ERROR · Publish blocked'
                : validationReport.status === 'WARNING'
                  ? 'Validation WARNING · Publish ready'
                  : validationReport.status === 'ERROR'
                    ? 'Geometry refresh needed · Publish ready'
                    : 'Validation PASS · Publish ready')}
            {!workspace.switching &&
              diskRoot === null &&
              'No project open'}
            {!workspace.switching &&
              mountStatus.status === 'error' &&
              diskRoot !== null &&
              'Mount failed'}
          </div>
        </header>
      }
      workspacePanel={
        <WorkspaceSidebar
          registry={workspace.registry}
          activeProject={workspace.activeProject}
          switching={workspace.switching || saving}
          switchError={workspace.switchError}
          dirtyPrompt={workspace.dirtyPrompt}
          onOpenProject={(projectId) => {
            void workspace.requestOpenProject(projectId, { dirty });
          }}
          onCloseProject={() => {
            workspace.requestCloseProject({ dirty });
          }}
          onDirtySave={() => {
            void workspace.confirmDirtySave(async () => {
              await save();
            });
          }}
          onDirtyDiscard={() => {
            if (session !== null) {
              apply(session.discard());
            }
            void workspace.confirmDirtyDiscard();
          }}
          onDirtyCancel={workspace.cancelDirtySwitch}
        />
      }
      sidebar={
        <HousePackageSidebar
          snapshot={snapshot}
          activeNav={activeNav}
          onSelectNav={setActiveNav}
          packageRootLabel={diskRoot}
        />
      }
      publishPanel={
        <HousePackageMountPanel
          snapshot={snapshot}
          session={session}
          validationReport={validationReport}
          releaseSummary={releaseSummary}
          publishError={publishError}
          loadError={loadError}
          saving={saving}
          validating={validating}
          publishing={publishing}
          onChange={apply}
          onSave={() => {
            void save();
          }}
          onValidate={() => {
            void validate();
          }}
          onNavigate={setActiveNav}
          onPublish={() => {
            void publish();
          }}
          onOpenPreview={openPreview}
        />
      }
    >
      {diskRoot === null && (
        <p className="text-sm text-builder-muted">
          Open Family 98, Harmony 124, or Villa 168 from the Workspace panel.
        </p>
      )}
      {diskRoot !== null && mountStatus.status === 'loading' && (
        <p className="text-sm text-builder-muted">
          Mounting House Package from {diskRoot}…
        </p>
      )}
      {diskRoot !== null && mountStatus.status === 'error' && (
        <p className="rounded-lg bg-builder-draftBg px-4 py-3 text-sm text-builder-draft">
          {mountStatus.message}
        </p>
      )}
      {mountStatus.status === 'ready' &&
        snapshot !== null &&
        session !== null && (
          <HousePackageEditView
            snapshot={snapshot}
            session={session}
            activeNav={activeNav}
            saving={saving}
            onChange={apply}
            onSave={() => {
              void save();
            }}
          />
        )}
      {releaseSummary !== null &&
        releaseVerification !== null &&
        previewOpen && (
          <HousePackageRuntimePreview
            open={previewOpen}
            releaseSummary={releaseSummary}
            verification={releaseVerification}
            onClose={closePreview}
          />
        )}
    </AppShell>
  );
}
