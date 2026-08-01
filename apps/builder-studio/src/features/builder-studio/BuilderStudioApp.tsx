import { useEffect, useMemo, useState } from 'react';

import { capabilityIdFromBuilderNav } from '@embed-engine/capabilities';
import {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  recordLastPublish,
  recordPlatformActivity,
  submitPlatformFeedback,
  usePlatformSession,
} from '@embed-engine/platform-access';

import { AppShell } from '../../components/layout/AppShell';
import { getBuilderCapabilityHost } from '../../studio/builderStudioComposition';
import { ExperienceComposerView } from '../experience-composer';
import { BuilderIntelligenceView } from '../builder-intelligence';
import { CollaborationCenterView } from '../collaboration-workspace';
import { PreviewCenterView } from '../preview-center';
import { ReleaseCenterView } from '../release-center';
import {
  CapabilityInspector,
  PlatformEmptyState,
  PlatformLoading,
  PlatformShell,
  type PlatformBreadcrumbItem,
} from '../platform';
import { ProjectActionPanel } from '../project-dashboard';
import {
  HousePackageEditView,
  useHousePackageEditController,
  type HousePackageNavId,
} from '../house-package';
import {
  findWorkspaceCompany,
  getActiveWorkspaceFolder,
  ObjectCreateDialog,
  ProjectCreateDialog,
  ProjectEditDialog,
  useWorkspaceController,
  WorkspaceSidebar,
} from '../workspace';
import { BuilderAnchorRail } from '../workspace/BuilderAnchorRail';
import { BuilderClickModelCanvas } from '../workspace/BuilderClickModelCanvas';

const SECTION_LABEL: Record<HousePackageNavId, string> = {
  overview: 'Přehled',
  experience: 'Experience',
  knowledge: 'Znalosti',
  'media-studio': 'Hero',
  'preview-center': 'Náhled',
  'release-center': 'Publikace',
  collaboration: 'Spolupráce',
  intelligence: 'Intelligence',
  rooms: 'Dispozice',
  gallery: 'Galerie',
  videos: 'Videa',
  plans: 'Půdorys',
  media: 'SVG',
  manifest: 'Dokumenty',
};

function isClickModelNav(nav: HousePackageNavId): boolean {
  return (
    nav === 'media-studio' ||
    nav === 'rooms' ||
    nav === 'knowledge' ||
    nav === 'gallery' ||
    nav === 'videos' ||
    nav === 'media' ||
    nav === 'plans' ||
    nav === 'manifest'
  );
}

/**
 * EPIC-BX-01..13 — Builder Studio: capability composition over Platform Shell.
 */
export function BuilderStudioApp() {
  const {
    session: accessSession,
    bootstrap,
    logout,
    clearStudio,
    selectStudio,
    bootstrapActiveProject,
  } = usePlatformSession();
  const workspace = useWorkspaceController();
  const capabilityHost = useMemo(() => getBuilderCapabilityHost(), []);
  const diskRoot = workspace.activeProject?.packageRoot ?? null;
  const projectBootstrap = useMemo(
    () => bootstrapActiveProject('builder'),
    [bootstrapActiveProject, accessSession?.projectId],
  );
  const [activeNav, setActiveNav] = useState<HousePackageNavId>('media-studio');
  const [createOpen, setCreateOpen] = useState(false);
  const [objectCreateOpen, setObjectCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const {
    mountStatus,
    snapshot,
    session,
    saving,
    validating,
    publishing,
    validationReport,
    releaseSummary,
    releaseVerification,
    publishError,
    apply,
    save,
    validate,
    publish,
    openPreview,
  } = useHousePackageEditController(diskRoot);

  const loadError =
    diskRoot === null
      ? 'Vyberte projekt ve Workspace.'
      : mountStatus.status === 'error'
        ? mountStatus.message
        : null;

  const dirty = snapshot !== null && snapshot.dirtyState !== 'clean';
  const companyName =
    bootstrap?.company.name ??
    (workspace.activeProject !== null
      ? (findWorkspaceCompany(
          workspace.registry,
          workspace.activeProject.companyId,
        )?.name ?? 'Firma')
      : 'Firma');

  const experienceMode = activeNav === 'experience';
  const previewCenterMode = activeNav === 'preview-center';
  const releaseCenterMode = activeNav === 'release-center';
  const collaborationMode = activeNav === 'collaboration';
  const intelligenceMode = activeNav === 'intelligence';
  const overviewMode = activeNav === 'overview';
  const clickModelMode = isClickModelNav(activeNav);

  // Default: Média (click-model Anchor Rail); honor deep-link hash.
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (
      hash === 'knowledge' ||
      hash === 'rooms' ||
      hash === 'media-studio' ||
      hash === 'release-center' ||
      hash === 'preview-center' ||
      hash === 'experience' ||
      hash === 'collaboration' ||
      hash === 'intelligence' ||
      hash === 'overview'
    ) {
      setActiveNav(hash as HousePackageNavId);
    } else {
      setActiveNav('media-studio');
    }
    setHistoryOpen(false);
  }, [diskRoot]);

  // Platform Access → Builder HP mount (only when Workspace has no active project).
  useEffect(() => {
    if (accessSession?.projectId == null) return;
    if (workspace.switching) return;
    if (workspace.activeProject?.id === accessSession.projectId) return;
    if (workspace.activeProject !== null) return;
    void workspace.requestOpenProject(accessSession.projectId, { dirty: false });
    void projectBootstrap;
  }, [accessSession?.projectId, workspace.activeProject?.id, workspace.switching]);

  // PR-006 / PR-012 — přepínání jen ve Workspace (ne v Platform Access / horní liště).
  const openHouseStable = (houseId: string) => {
    void workspace.requestOpenProject(houseId, { dirty });
  };

  const openFolderStable = (folderId: string) => {
    void workspace.requestOpenFolder(folderId, { dirty });
  };

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

  const activeFolderName =
    workspace.registry.folders.find(
      (folder) => folder.id === workspace.registry.activeFolderId,
    )?.name ?? 'Projekt';

  const platformWorkspace = null;
  const breadcrumb: PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS', onSelect: clearStudio },
    { id: 'studio', label: 'Builder' },
    { id: 'company', label: companyName },
    { id: 'project', label: activeFolderName },
    {
      id: 'house',
      label: workspace.activeProject?.name ?? 'Dům',
    },
    { id: 'section', label: SECTION_LABEL[activeNav] },
  ];

  const activeCapabilityId = capabilityIdFromBuilderNav(
    clickModelMode ? 'media-studio' : activeNav,
  );
  const productCapabilityMode =
    experienceMode ||
    previewCenterMode ||
    releaseCenterMode ||
    collaborationMode ||
    intelligenceMode;
  const inspectorModel = capabilityHost.inspectorModel(activeCapabilityId);

  const userLabel = accessSession?.user.displayName ?? 'Host';
  const roleLabel =
    accessSession !== null
      ? PLATFORM_ROLE_LABELS[primaryRole(accessSession.user.roles)]
      : undefined;

  return (
    <>
      <PlatformShell
        activeStudioId="builder"
        userLabel={userLabel}
        roleLabel={roleLabel}
        workspace={platformWorkspace}
        breadcrumb={breadcrumb}
        capabilityHost={capabilityHost}
        activeCapabilityId={activeCapabilityId}
        onLogout={logout}
        onOpenLanding={clearStudio}
        onSelectStudio={selectStudio}
        onSubmitFeedback={(message) => {
          submitPlatformFeedback({
            message,
            email: accessSession?.user.email ?? null,
            studioId: 'builder',
            companyId: accessSession?.companyId ?? null,
          });
          recordPlatformActivity({
          label: 'Zpětná vazba',
          detail: message.slice(0, 80),
        });
      }}
    >
      <AppShell
        denseMain={productCapabilityMode}
        anchorRail={
          mountStatus.status === 'ready' ? (
            <BuilderAnchorRail
              snapshot={snapshot}
              activeNav={activeNav}
              onSelectNav={handleNavigate}
            />
          ) : null
        }
        workspacePanel={
          <WorkspaceSidebar
            registry={workspace.registry}
            activeProject={workspace.activeProject}
            switching={workspace.switching}
            switchError={workspace.switchError}
            dirtyPrompt={workspace.dirtyPrompt}
            onOpenFolder={openFolderStable}
            onOpenHouse={openHouseStable}
            onCreateProject={() => setCreateOpen(true)}
            onCreateObject={() => setObjectCreateOpen(true)}
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
                    void publish().then((summary) => {
                      if (summary === null) return;
                      recordLastPublish(
                        `v${summary.housePackageVersion}`,
                      );
                      recordPlatformActivity({
                        label: 'Publikace',
                        detail: `v${summary.housePackageVersion}`,
                      });
                    });
                  }}
                  onValidate={() => {
                    void validate();
                  }}
                  onHistory={handleHistory}
                  onOpenManager={() => selectStudio('manager')}
                />
              </div>
              <div className="max-h-[42%] shrink-0 overflow-y-auto border-t border-builder-line">
                <CapabilityInspector model={inspectorModel} compact />
              </div>
            </div>
          )
        }
      >
        {workspace.switching && (
          <PlatformLoading label="Přepínám projekt…" />
        )}
        {!workspace.switching && diskRoot === null && (
          <PlatformEmptyState
            icon="⊕"
            title="Vyberte projekt"
            description="Otevřete projekt ve Workspace vlevo, nebo založte nový přes ⊕."
          />
        )}
        {!workspace.switching &&
          diskRoot !== null &&
          mountStatus.status === 'loading' && (
          <PlatformLoading label={`Načítám projekt… ${companyName}`} />
        )}
        {!workspace.switching &&
          diskRoot !== null &&
          mountStatus.status === 'error' && (
          <PlatformEmptyState
            icon="!"
            title="Projekt se nepodařilo otevřít"
            description={mountStatus.message}
          />
        )}
        {!workspace.switching &&
          mountStatus.status === 'ready' &&
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
        {!workspace.switching &&
          mountStatus.status === 'ready' &&
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
        {!workspace.switching &&
          mountStatus.status === 'ready' &&
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
        {!workspace.switching &&
          mountStatus.status === 'ready' &&
          workspace.activeProject !== null &&
          collaborationMode && (
            <CollaborationCenterView
              projectId={workspace.activeProject.id}
              projectName={workspace.activeProject.name}
              onNavigate={handleNavigate}
            />
          )}
        {!workspace.switching &&
          mountStatus.status === 'ready' &&
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
        {!workspace.switching &&
          mountStatus.status === 'ready' &&
          snapshot !== null &&
          session !== null &&
          workspace.activeProject !== null &&
          overviewMode && (
            <HousePackageEditView
              snapshot={snapshot}
              session={session}
              activeNav="overview"
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
        {!workspace.switching &&
          mountStatus.status === 'ready' &&
          snapshot !== null &&
          session !== null &&
          workspace.activeProject !== null &&
          clickModelMode && (
            <BuilderClickModelCanvas
              key={workspace.activeProject.id}
              projectId={workspace.activeProject.id}
              projectName={workspace.activeProject.name}
              companyName={companyName}
              project={workspace.activeProject}
              snapshot={snapshot}
              session={session}
              saving={saving}
              validationReport={validationReport}
              releaseSummary={releaseSummary}
              onChange={apply}
              onSave={() => {
                void save();
              }}
              onEditProject={() => setEditOpen(true)}
              onNavigate={handleNavigate}
              onPublish={() => {
                void publish();
              }}
              onPreview={openPreview}
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
              setActiveNav('media-studio');
            }
          })();
        }}
      />

      <ObjectCreateDialog
        open={objectCreateOpen}
        busy={workspace.switching}
        projectLabel={
          getActiveWorkspaceFolder(workspace.registry)?.name ?? null
        }
        onClose={() => setObjectCreateOpen(false)}
        onSubmit={(input) => {
          void (async () => {
            const created = await workspace.createObject(input, { dirty });
            if (created !== null) {
              setObjectCreateOpen(false);
              setActiveNav('media-studio');
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
