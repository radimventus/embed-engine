import { PlatformStatusBadge } from '@embed-engine/platform-shell';

import { KnowledgeComposerView } from '../knowledge-composer';
import { MediaStudioView } from '../media-studio';
import type { MediaAreaId } from '../media-studio/mediaCatalog';
import {
  HousePackageEditView,
  type HousePackageEditSession,
  type HousePackageEditSnapshot,
  type HousePackageNavId,
} from '../house-package';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import type { HousePackageReleaseSummary } from '../house-package/productionPublishGate';
import type { WorkspaceProject } from '../workspace/workspaceRegistry';

type BuilderClickModelCanvasProps = {
  readonly projectId: string;
  readonly projectName: string;
  readonly companyName: string;
  readonly project: WorkspaceProject;
  readonly snapshot: HousePackageEditSnapshot;
  readonly session: HousePackageEditSession;
  readonly saving: boolean;
  readonly validationReport: HousePackageValidationReport | null;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onSave: () => void;
  readonly onEditProject: () => void;
  readonly onNavigate: (nav: HousePackageNavId) => void;
  readonly onPublish: () => void;
  readonly onPreview: () => void;
};

type MediaAnchor = {
  readonly domId: string;
  readonly title: string;
  readonly description: string;
  readonly area: MediaAreaId;
};

const MEDIA_ANCHORS: readonly MediaAnchor[] = [
  {
    domId: 'b-hero',
    title: 'Hero',
    description: 'Hlavní vizuál Experience.',
    area: 'hero',
  },
  {
    domId: 'b-gallery',
    title: 'Galerie',
    description: 'Fotografie objektu a místností.',
    area: 'gallery',
  },
  {
    domId: 'b-videos',
    title: 'Videa',
    description: 'Video vrstva prohlídky.',
    area: 'videos',
  },
  {
    domId: 'b-floor-plans',
    title: 'Půdorys',
    description: 'Podlaží a vazby na místnosti.',
    area: 'floor-plans',
  },
  {
    domId: 'b-svg',
    title: 'SVG',
    description: 'SVG půdorysy a decision canvas.',
    area: 'svg',
  },
  {
    domId: 'b-documents',
    title: 'Dokumenty',
    description: 'PDF a technické dokumenty Runtime.',
    area: 'documents',
  },
];

/**
 * PR-007 / PR-008 / PR-022D — Souvislá plocha; všechny media sekce rozbalené (scroll).
 */
export function BuilderClickModelCanvas({
  projectId,
  projectName,
  companyName,
  project,
  snapshot,
  session,
  saving,
  validationReport,
  releaseSummary,
  onChange,
  onSave,
  onEditProject,
  onNavigate,
  onPublish,
  onPreview,
}: BuilderClickModelCanvasProps) {
  return (
    <div
      className="space-y-14"
      data-studio-shell="builder-click-model-canvas"
    >
      <header className="platform-title-bar">
        <div>
          <h1 className="platform-type-h1">{projectName}</h1>
          <p className="platform-type-helper" style={{ marginTop: 4 }}>
            Obsah domu · Hero · Dispozice · Znalosti
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPreview}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-builder-blueHover"
            style={{ backgroundColor: '#18428F', borderColor: '#18428F' }}
          >
            Náhled
          </button>
          <PlatformStatusBadge
            tone={
              project.status === 'published'
                ? 'published'
                : project.status === 'ready'
                  ? 'ready'
                  : 'draft'
            }
          >
            {project.status === 'published'
              ? 'Publikováno'
              : project.status === 'ready'
                ? 'Připraveno'
                : 'Koncept'}
          </PlatformStatusBadge>
        </div>
      </header>

      {MEDIA_ANCHORS.map((item) => (
        <section
          key={item.domId}
          id={item.domId}
          className="scroll-mt-6 space-y-4"
        >
          <header>
            <h3 className="text-[22px] font-bold text-builder-navy">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-builder-muted">
              {item.description}
            </p>
          </header>
          <MediaStudioView
            projectId={projectId}
            projectName={projectName}
            snapshot={snapshot}
            session={session}
            onChange={onChange}
            lockedArea={item.area}
            embedded
          />
        </section>
      ))}

      <section id="b-layout" className="scroll-mt-6 space-y-4">
        <header>
          <h3 className="text-[22px] font-bold text-builder-navy">Dispozice</h3>
          <p className="mt-1 text-sm text-builder-muted">
            Data potřebná pro House Navigator.
          </p>
        </header>
        <HousePackageEditView
          snapshot={snapshot}
          session={session}
          activeNav="rooms"
          saving={saving}
          companyName={companyName}
          project={project}
          validationReport={validationReport}
          releaseSummary={releaseSummary}
          onChange={onChange}
          onSave={onSave}
          onEditProject={onEditProject}
          onNavigate={onNavigate}
          onPublish={onPublish}
        />
      </section>

      <section id="b-knowledge" className="scroll-mt-6 space-y-4">
        <header>
          <h3 className="text-[22px] font-bold text-builder-navy">Znalosti</h3>
          <p className="mt-1 text-sm text-builder-muted">Dokumenty pro AI.</p>
        </header>
        <KnowledgeComposerView
          projectId={projectId}
          projectName={projectName}
          snapshot={snapshot}
          session={session}
          onSnapshotChange={onChange}
          onNavigate={onNavigate}
        />
      </section>
    </div>
  );
}
