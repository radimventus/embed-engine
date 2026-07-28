import type {
  ActiveProjectModel,
  AssetCategoryId,
  BuilderProjectManifest,
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
};

export function WorkspaceCanvas({
  projectModel,
  objectPackage,
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
          <span>Object Package + lifecycle: session only (bez persistence)</span>
          <span>{manifest.updatedAt}</span>
        </div>
      </div>
    </div>
  );
}
