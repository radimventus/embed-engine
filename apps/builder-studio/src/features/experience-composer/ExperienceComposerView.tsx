import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import { ExperienceLivePreview } from './ExperienceLivePreview';
import { ExperienceModuleCards } from './ExperienceModuleCards';
import { ExperienceModuleEditor } from './ExperienceModuleEditor';
import { ExperienceOutline } from './ExperienceOutline';
import type { ExperienceModuleReady } from './experienceModuleReady';
import { useExperienceComposerController } from './useExperienceComposerController';

type ExperienceComposerViewProps = {
  readonly projectId: string;
  readonly projectName: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly onNavigateContent: (nav: HousePackageNavId) => void;
  readonly onHeroImagePathChange?: (imagePath: string) => void;
};

/**
 * EPIC-BX-03 / PR-022D — Experience Composer (Outline · Canvas · Náhled on demand).
 */
export function ExperienceComposerView({
  projectId,
  projectName,
  snapshot,
  validationReport,
  onNavigateContent,
  onHeroImagePathChange,
}: ExperienceComposerViewProps) {
  const heroPath = snapshot?.working.heroRelativePath;
  const composer = useExperienceComposerController(projectId, heroPath);
  const remountKey = `${projectId}:${composer.composition.revision}:${snapshot?.mountedAt ?? 'none'}:${snapshot?.working.heroRelativePath ?? ''}`;
  const roomCount = snapshot?.validation.builderImport?.rooms.rooms.length ?? 0;

  const handleReadyClick = (
    _moduleId: string,
    ready: ExperienceModuleReady,
  ) => {
    if (ready.fixNav !== null) {
      onNavigateContent(ready.fixNav);
    }
  };

  return (
    <div
      className="flex h-full min-h-[70vh] flex-col"
      data-testid="experience-composer"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-[16px] border border-[#E3E3E3] bg-builder-canvas desktop:grid-cols-[200px_minmax(0,1fr)_360px]">
        <ExperienceOutline
          composition={composer.composition}
          selectedModuleId={composer.selectedModuleId}
          snapshot={snapshot}
          validationReport={validationReport}
          onSelect={(moduleId) => {
            composer.selectModule(moduleId);
            document
              .getElementById(`experience-module-${moduleId}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }}
        />
        <div className="min-h-0 overflow-y-auto p-5">
          <ExperienceModuleCards
            composition={composer.composition}
            selectedModuleId={composer.selectedModuleId}
            snapshot={snapshot}
            validationReport={validationReport}
            projectId={projectId}
            onSelect={composer.selectModule}
            onEdit={composer.openEditor}
            onToggle={composer.toggleEnabled}
            onReorder={composer.reorder}
            onApplyOrder={(moduleIds) => {
              composer.applyOrder(moduleIds);
            }}
            onApplyCta={(heroCta, leadCta) => {
              composer.saveConfig('hero', {
                ...composer.composition.configs.hero,
                cta: heroCta,
              });
              composer.saveConfig('lead-capture', {
                ...composer.composition.configs['lead-capture'],
                cta: leadCta,
              });
            }}
            onReadyClick={handleReadyClick}
            onAddModule={composer.addModule}
          />
        </div>
        <div className="hidden min-h-0 desktop:block">
          <ExperienceLivePreview remountKey={remountKey} />
        </div>
      </div>

      {composer.editingModuleId !== null && (
        <ExperienceModuleEditor
          moduleId={composer.editingModuleId}
          composition={composer.composition}
          projectId={projectId}
          projectName={projectName}
          roomCount={roomCount}
          onClose={composer.closeEditor}
          onSave={(moduleId, config) => {
            composer.saveConfig(moduleId, config);
            if (
              moduleId === 'hero' &&
              onHeroImagePathChange !== undefined &&
              'imagePath' in config
            ) {
              onHeroImagePathChange(config.imagePath);
            }
          }}
        />
      )}
    </div>
  );
}
