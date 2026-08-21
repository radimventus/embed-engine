import { useEffect, useMemo, useRef, useState } from 'react';

import { capabilityIdFromBuilderNav } from '@embed-engine/capabilities';
import { getCanonicalHouseRuntimeContext } from '@embed-engine/object-house';
import {
  getCanonicalHouse,
  PLATFORM_ROLE_LABELS,
  primaryRole,
  recordLastPublish,
  recordPlatformActivity,
  submitPlatformFeedback,
  usePlatformSession,
  isWorkspaceShellEmbed,
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
import {
  createBuilderPackageRuntimeEvidence,
  logBuilderPackageRuntimeEvidence,
} from './builderPackageRuntimeEvidence';
import {
  resolveBuilderHousePackageRoot,
  shouldShowCanonicalHouseEmptyState,
} from './resolveBuilderHousePackageRoot';

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
  const activeFolder = getActiveWorkspaceFolder(workspace.registry);
  const activeHouseId = workspace.activeProject?.id ?? null;
  const activeProjectHasNoHouses =
    activeFolder !== null && workspace.activeProject === null;
  const canonicalHouseContext = useMemo(
    () =>
      activeHouseId === null
        ? null
        : getCanonicalHouseRuntimeContext(activeHouseId),
    [activeHouseId],
  );
  const diskRoot = resolveBuilderHousePackageRoot(
    workspace.activeProject,
    canonicalHouseContext,
  );
  const activeHouseDataMode =
    activeHouseId === null
      ? null
      : (getCanonicalHouse(activeHouseId)?.house?.dataMode ?? null);
  const mountValidationMode =
    diskRoot !== null && activeHouseDataMode === 'LIVE_EMPTY'
      ? 'AUTHORING_DRAFT'
      : 'PUBLISH_READY';
  const activeHouseHasNoPackage =
    canonicalHouseContext === null &&
    workspace.activeProject !== null &&
    diskRoot === null;
  const projectBootstrap = useMemo(
    () => bootstrapActiveProject('builder'),
    [bootstrapActiveProject, accessSession?.projectId],
  );
  const [activeNav, setActiveNav] = useState<HousePackageNavId>('media-studio');
  const [createOpen, setCreateOpen] = useState(false);
  const [objectCreateOpen, setObjectCreateOpen] = useState(false);
  const [defaultHousesMessage, setDefaultHousesMessage] = useState<string | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  /** PT-BS-01 — external ?projectId= / session bind runs once; never fights DOMY switches. */
  const externalHouseBindDoneRef = useRef(false);

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
  } = useHousePackageEditController(
    diskRoot,
    activeHouseId,
    mountValidationMode,
  );

  useEffect(() => {
    logBuilderPackageRuntimeEvidence(
      createBuilderPackageRuntimeEvidence({
        activeProjectId: activeFolder?.id ?? null,
        activeHouseId,
        houseName: workspace.activeProject?.name ?? null,
        houseStatus: workspace.activeProject?.status ?? null,
        houseDataMode: activeHouseDataMode,
        registryPackageRoot: workspace.activeProject?.packageRoot ?? null,
        resolvedBuilderHousePackageRoot: diskRoot,
        mountState: mountStatus,
      }),
    );
  }, [
    activeFolder?.id,
    activeHouseDataMode,
    activeHouseId,
    diskRoot,
    mountStatus,
    workspace.activeProject?.name,
    workspace.activeProject?.packageRoot,
    workspace.activeProject?.status,
  ]);

  const loadError =
    diskRoot === null
      ? activeProjectHasNoHouses
        ? null
        : activeHouseHasNoPackage
        ? 'Aktivní dům zatím nemá House Package.'
        : 'Vyberte projekt ve Workspace.'
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
        )?.name ?? 'Partner')
      : 'Partner');

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

  // Partner Environment context → open its active House before a Project fallback.
  useEffect(() => {
    if (externalHouseBindDoneRef.current) return;
    if (workspace.switching) return;

    const urlProjectId =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('projectId')?.trim() ||
          null
        : null;
    const targetHouseId =
      accessSession?.workspaceContext?.activeHouseId ??
      accessSession?.activeHouseId ??
      null;
    const targetId = targetHouseId ?? accessSession?.projectId ?? urlProjectId ?? null;

    if (targetId == null) {
      externalHouseBindDoneRef.current = true;
      return;
    }

    if (workspace.activeProject?.id === targetId) {
      externalHouseBindDoneRef.current = true;
      return;
    }

    const open = workspace.registry.projects.some(
      (project) => project.id === targetId,
    )
      ? workspace.requestOpenProject(targetId, { dirty: false })
      : workspace.registry.folders.some((folder) => folder.id === targetId)
        ? workspace.requestOpenFolder(targetId, { dirty: false })
        : workspace.requestOpenProject(targetId, { dirty: false });
    void open.finally(() => {
      externalHouseBindDoneRef.current = true;
    });
    void projectBootstrap;
  }, [
    accessSession?.projectId,
    accessSession?.activeHouseId,
    accessSession?.workspaceContext?.activeHouseId,
    workspace.activeProject?.id,
    workspace.switching,
    workspace.requestOpenProject,
    projectBootstrap,
  ]);

  // PR-006 / PR-012 / PT-BS-01 — přepínání domů jen ve Workspace (House Navigator).
  const openHouseStable = (houseId: string) => {
    externalHouseBindDoneRef.current = true;
    void workspace.requestOpenProject(houseId, { dirty });
  };

  const openFolderStable = (folderId: string) => {
    externalHouseBindDoneRef.current = true;
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
        contentOnly={isWorkspaceShellEmbed()}
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
            onRecoverDefaultHouses={() => {
              const result = workspace.recoverDefaultHouses();
              setDefaultHousesMessage(result?.message ?? null);
            }}
            recoveryMessage={defaultHousesMessage}
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
        {!workspace.switching &&
          canonicalHouseContext !== null &&
          shouldShowCanonicalHouseEmptyState(
            canonicalHouseContext,
            diskRoot,
          ) && (
          <PlatformEmptyState
            icon="⌂"
            title={`${canonicalHouseContext.specification.identity.name} je aktivní`}
            description="Kanonický referenční dům je dostupný bez HP-002 balíčku. HP-002 authoring, média, náhled a publikace pro tento dům zatím nejsou k dispozici."
          />
        )}
        {!workspace.switching &&
          activeHouseHasNoPackage && (
          <PlatformEmptyState
            icon="⌂"
            title={`${workspace.activeProject?.name ?? 'Dům'} je aktivní`}
            description="Dům je založený v aktivním projektu, ale zatím nemá House Package ani provozní obsah."
          />
        )}
        {!workspace.switching && activeProjectHasNoHouses && (
          <PlatformEmptyState
            icon="+"
            title={`${activeFolder?.name ?? 'Projekt'} je aktivní`}
            description="Projekt zatím nemá žádný dům. Přidejte první dům přes + v sekci DOMY."
          />
        )}
        {!workspace.switching &&
          canonicalHouseContext === null &&
          workspace.activeProject === null &&
          !activeProjectHasNoHouses && (
          <PlatformEmptyState
            icon="+"
            title="Vyberte projekt"
            description="Otevřete projekt ve Workspace vlevo, nebo založte nový přes +."
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
              onSave={(sourceSnapshot) => {
                void save(sourceSnapshot);
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
        onSubmit={async (input) => {
          const result = await workspace.createProject(input, { dirty });
          if (result.folder === null) {
            return result.error;
          }
          setCreateOpen(false);
          setActiveNav('media-studio');
          return null;
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
        canonicalProjectId={
          getActiveWorkspaceFolder(workspace.registry)?.id ??
          workspace.activeProject?.folderId ??
          null
        }
        canonicalProjectName={
          getActiveWorkspaceFolder(workspace.registry)?.name ?? null
        }
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
