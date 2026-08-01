import { useState } from 'react';

import { AppShell } from '../../components/layout/AppShell';
import { PlatformHeader } from '../platform';
import {
  HousePackageEditView,
  HousePackageMountPanel,
  HousePackageRuntimePreview,
  HousePackageSidebar,
  useHousePackageEditController,
  type HousePackageNavId,
} from '../house-package';
import {
  findWorkspaceCompany,
  ProjectCreateDialog,
  ProjectEditDialog,
  useWorkspaceController,
  WorkspaceSidebar,
} from '../workspace';

/**
 * EPIC-BX-01 — Builder Studio product UX over HP-002 Authoring Surface.
 */
export function BuilderStudioApp() {
  const workspace = useWorkspaceController();
  const diskRoot = workspace.activeProject?.packageRoot ?? null;
  const [activeNav, setActiveNav] = useState<HousePackageNavId>('overview');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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

  const loadError =
    diskRoot === null
      ? 'Vyberte projekt ve Workspace.'
      : mountStatus.status === 'error'
        ? mountStatus.message
        : null;

  const dirty = snapshot !== null && snapshot.dirtyState !== 'clean';
  const companyName =
    workspace.activeProject !== null
      ? (findWorkspaceCompany(
          workspace.registry,
          workspace.activeProject.companyId,
        )?.name ?? 'Firma')
      : 'Workspace';

  return (
    <>
      <AppShell
        header={<PlatformHeader />}
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
            onCreateProject={() => setCreateOpen(true)}
            onEditProject={() => setEditOpen(true)}
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
            projectName={workspace.activeProject?.name ?? null}
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
          <section className="rounded-[14px] border border-[#E8EEF5] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-builder-ink">
              Vyberte projekt
            </h2>
            <p className="mt-2 text-sm text-builder-muted">
              Otevřete projekt ve Workspace vlevo, nebo založte nový přes ＋ Nový
              projekt.
            </p>
          </section>
        )}
        {diskRoot !== null && mountStatus.status === 'loading' && (
          <section className="rounded-[14px] border border-[#E8EEF5] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-builder-ink">
              Načítám projekt…
            </h2>
            <p className="mt-2 text-sm text-builder-muted">{companyName}</p>
          </section>
        )}
        {diskRoot !== null && mountStatus.status === 'error' && (
          <section className="rounded-[14px] border border-builder-draft/30 bg-builder-draftBg p-8">
            <h2 className="text-xl font-semibold text-builder-draft">
              Projekt se nepodařilo otevřít
            </h2>
            <p className="mt-2 text-sm text-builder-draft">
              {mountStatus.message}
            </p>
          </section>
        )}
        {mountStatus.status === 'ready' &&
          snapshot !== null &&
          session !== null &&
          workspace.activeProject !== null && (
            <HousePackageEditView
              snapshot={snapshot}
              session={session}
              activeNav={activeNav}
              saving={saving}
              companyName={companyName}
              project={workspace.activeProject}
              onChange={apply}
              onSave={() => {
                void save();
              }}
              onEditProject={() => setEditOpen(true)}
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

      <ProjectCreateDialog
        open={createOpen}
        companies={workspace.registry.companies}
        busy={workspace.switching}
        onClose={() => setCreateOpen(false)}
        onSubmit={(input) => {
          void (async () => {
            const created = await workspace.createProject(input, { dirty });
            if (created !== null) {
              setCreateOpen(false);
              setActiveNav('overview');
            }
          })();
        }}
      />

      <ProjectEditDialog
        open={editOpen}
        project={workspace.activeProject}
        companies={workspace.registry.companies}
        onClose={() => setEditOpen(false)}
        onSubmit={(input) => {
          if (workspace.activeProject === null) {
            return;
          }
          workspace.updateProject(workspace.activeProject.id, input);
          setEditOpen(false);
        }}
      />
    </>
  );
}
