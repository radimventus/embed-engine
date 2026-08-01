import { useEffect, useMemo, useRef, useState } from 'react';

import { capabilityIdFromBuilderNav } from '@embed-engine/capabilities';

import { AppShell } from '../../components/layout/AppShell';
import { getBuilderCapabilityHost } from '../../studio/builderStudioComposition';
import { ExperienceComposerView } from '../experience-composer';
import { KnowledgeComposerView } from '../knowledge-composer';
import { MediaStudioView } from '../media-studio';
import { BuilderIntelligenceView } from '../builder-intelligence';
import { CollaborationCenterView } from '../collaboration-workspace';
import { PreviewCenterView } from '../preview-center';
import { ReleaseCenterView } from '../release-center';
import {
  CapabilityInspector,
  PlatformShell,
  type PlatformBreadcrumbItem,
  type PlatformWorkspaceState,
} from '../platform';
import { ProjectActionPanel } from '../project-dashboard';
import {
  HousePackageEditView,
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

const SECTION_LABEL: Record<HousePackageNavId, string> = {
  overview: 'Dashboard',
  experience: 'Experience',
  knowledge: 'Knowledge',
  'media-studio': 'Media',
  'preview-center': 'Preview',
  'release-center': 'Release',
  collaboration: 'Collaboration',
  intelligence: 'Intelligence',
  rooms: 'Rooms',
  gallery: 'Gallery',
  videos: 'Videos',
  plans: 'Plans',
  media: 'Media (HP)',
  manifest: 'Manifest',
};

/**
 * EPIC-BX-01..13 — Builder Studio: capability composition over Platform Shell.
 */
export function BuilderStudioApp() {
  const workspace = useWorkspaceController();
  const capabilityHost = useMemo(() => getBuilderCapabilityHost(), []);
  const diskRoot = workspace.activeProject?.packageRoot ?? null;
  const [activeNav, setActiveNav] = useState<HousePackageNavId>('overview');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const validatedRootRef = useRef<string | null>(null);

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

  const experienceMode = activeNav === 'experience';
  const knowledgeMode = activeNav === 'knowledge';
  const mediaStudioMode = activeNav === 'media-studio';
  const previewCenterMode = activeNav === 'preview-center';
  const releaseCenterMode = activeNav === 'release-center';
  const collaborationMode = activeNav === 'collaboration';
  const intelligenceMode = activeNav === 'intelligence';

  // Always land on Dashboard when the active project changes.
  useEffect(() => {
    setActiveNav('overview');
    setHistoryOpen(false);
    validatedRootRef.current = null;
  }, [diskRoot]);

  // Seed readiness from existing validate capability (no new CAP).
  useEffect(() => {
    if (
      diskRoot === null ||
      mountStatus.status !== 'ready' ||
      snapshot === null ||
      validatedRootRef.current === diskRoot
    ) {
      return;
    }
    validatedRootRef.current = diskRoot;
    void validate();
  }, [diskRoot, mountStatus.status, snapshot, validate]);

  const handleNavigate = (nav: HousePackageNavId) => {
    setHistoryOpen(false);
    setActiveNav(nav);
  };

  const handleHistory = () => {
    setActiveNav('overview');
    setHistoryOpen(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById('project-publication-history')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const platformWorkspace: PlatformWorkspaceState = {
    companyLabel: companyName,
    projectLabel: workspace.activeProject?.name ?? '—',
    projects: workspace.registry.projects.map((project) => ({
      id: project.id,
      label: project.name,
      companyLabel:
        findWorkspaceCompany(workspace.registry, project.companyId)?.name ??
        'Firma',
    })),
    onSelectProject: (projectId) => {
      void workspace.requestOpenProject(projectId, { dirty });
    },
  };

  const breadcrumb: PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS' },
    { id: 'studio', label: 'Builder' },
    { id: 'company', label: companyName },
    {
      id: 'project',
      label: workspace.activeProject?.name ?? 'Projekt',
    },
    { id: 'section', label: SECTION_LABEL[activeNav] },
  ];

  const activeCapabilityId = capabilityIdFromBuilderNav(activeNav);
  const productCapabilityMode =
    experienceMode ||
    knowledgeMode ||
    mediaStudioMode ||
    previewCenterMode ||
    releaseCenterMode ||
    collaborationMode ||
    intelligenceMode;
  const inspectorModel = capabilityHost.inspectorModel(activeCapabilityId);

  return (
    <>
      <PlatformShell
        activeStudioId="builder"
        userLabel="Radim"
        workspace={platformWorkspace}
        breadcrumb={breadcrumb}
        capabilityHost={capabilityHost}
        activeCapabilityId={activeCapabilityId}
      >
      <AppShell
        denseMain={productCapabilityMode}
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
            onSelectNav={handleNavigate}
            projectName={workspace.activeProject?.name ?? null}
          />
        }
        publishPanel={
          productCapabilityMode ? (
            <CapabilityInspector model={inspectorModel} />
          ) : (
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ProjectActionPanel
                  loadError={loadError}
                  publishError={publishError}
                  validationReport={validationReport}
                  releaseSummary={releaseSummary}
                  validating={validating}
                  publishing={publishing}
                  previewAvailable={
                    releaseSummary !== null && releaseVerification !== null
                  }
                  onPreview={openPreview}
                  onPublish={() => {
                    void publish();
                  }}
                  onValidate={() => {
                    void validate();
                  }}
                  onHistory={handleHistory}
                />
              </div>
              <div className="max-h-[42%] shrink-0 overflow-y-auto border-t border-builder-line">
                <CapabilityInspector model={inspectorModel} compact />
              </div>
            </div>
          )
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
          workspace.activeProject !== null &&
          experienceMode && (
            <ExperienceComposerView
              projectId={workspace.activeProject.id}
              projectName={workspace.activeProject.name}
              snapshot={snapshot}
              validationReport={validationReport}
              onNavigateContent={handleNavigate}
              onHeroImagePathChange={(imagePath) => {
                if (session !== null) {
                  apply(session.setHeroRelativePath(imagePath));
                }
              }}
            />
          )}
        {mountStatus.status === 'ready' &&
          workspace.activeProject !== null &&
          knowledgeMode && (
            <KnowledgeComposerView
              projectId={workspace.activeProject.id}
              projectName={workspace.activeProject.name}
              snapshot={snapshot}
              session={session}
              onSnapshotChange={apply}
              onNavigate={handleNavigate}
            />
          )}
        {mountStatus.status === 'ready' &&
          workspace.activeProject !== null &&
          mediaStudioMode && (
            <MediaStudioView
              projectId={workspace.activeProject.id}
              projectName={workspace.activeProject.name}
              snapshot={snapshot}
              session={session}
              onChange={apply}
            />
          )}
        {mountStatus.status === 'ready' &&
          workspace.activeProject !== null &&
          previewCenterMode && (
            <PreviewCenterView
              projectId={workspace.activeProject.id}
              projectName={workspace.activeProject.name}
              snapshot={snapshot}
              validationReport={validationReport}
              onNavigate={handleNavigate}
            />
          )}
        {mountStatus.status === 'ready' &&
          workspace.activeProject !== null &&
          releaseCenterMode && (
            <ReleaseCenterView
              projectId={workspace.activeProject.id}
              projectName={workspace.activeProject.name}
              snapshot={snapshot}
              validationReport={validationReport}
              releaseSummary={releaseSummary}
              publishing={publishing}
              publishError={publishError}
              onPublish={publish}
              onNavigate={handleNavigate}
            />
          )}
        {mountStatus.status === 'ready' &&
          workspace.activeProject !== null &&
          collaborationMode && (
            <CollaborationCenterView
              projectId={workspace.activeProject.id}
              projectName={workspace.activeProject.name}
              onNavigate={handleNavigate}
            />
          )}
        {mountStatus.status === 'ready' &&
          workspace.activeProject !== null &&
          intelligenceMode && (
            <BuilderIntelligenceView
              projectId={workspace.activeProject.id}
              projectName={workspace.activeProject.name}
              snapshot={snapshot}
              validationReport={validationReport}
              onNavigate={handleNavigate}
            />
          )}
        {mountStatus.status === 'ready' &&
          snapshot !== null &&
          session !== null &&
          workspace.activeProject !== null &&
          !experienceMode &&
          !knowledgeMode &&
          !mediaStudioMode &&
          !previewCenterMode &&
          !releaseCenterMode &&
          !collaborationMode &&
          !intelligenceMode && (
            <HousePackageEditView
              snapshot={snapshot}
              session={session}
              activeNav={activeNav}
              saving={saving}
              companyName={companyName}
              project={workspace.activeProject}
              validationReport={validationReport}
              releaseSummary={releaseSummary}
              historyOpen={historyOpen}
              onChange={apply}
              onSave={() => {
                void save();
              }}
              onEditProject={() => setEditOpen(true)}
              onNavigate={handleNavigate}
              onPublish={() => {
                void publish();
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
      </PlatformShell>

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
