import type {
  ActiveProjectModel,
  AssetCategoryId,
  BuilderProjectManifest,
  ReadinessReport,
  TimelineEntry,
  VersionInfo,
  WorkspaceSectionId,
} from '../../model';
import {
  KnowledgeSection,
  LayoutSection,
  MediaSection,
} from './WorkspaceSections';
import { ProjectDashboard } from './ProjectDashboard';
import { SectionNavigation } from './SectionNavigation';

type WorkspaceCanvasProps = {
  readonly projectModel: ActiveProjectModel | null;
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
};

export function WorkspaceCanvas({
  projectModel,
  manifest,
  versions,
  readiness,
  timeline,
  activeSection,
  onSelectSection,
  onAddAsset,
  onRemoveAsset,
  onUpdateMetadata,
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
    projectModel.metadata.title,
    projectModel.metadata.partnerName,
    projectModel.metadata.locationLabel,
    projectModel.metadata.notes,
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
          <span>Lifecycle + readiness: session only (bez persistence)</span>
          <span>{manifest.updatedAt}</span>
        </div>
      </div>
    </div>
  );
}
