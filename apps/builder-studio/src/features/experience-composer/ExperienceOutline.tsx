import {
  getModuleDefinition,
  type ExperienceComposition,
  type ExperienceModuleId,
} from './experienceComposition';
import {
  evaluateModuleReadyState,
  readyGlyph,
} from './experienceModuleReady';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';

type ExperienceOutlineProps = {
  readonly composition: ExperienceComposition;
  readonly selectedModuleId: ExperienceModuleId | null;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly onSelect: (moduleId: ExperienceModuleId) => void;
};

/**
 * EPIC-BX-03 — Experience structure outline.
 */
export function ExperienceOutline({
  composition,
  selectedModuleId,
  snapshot,
  validationReport,
  onSelect,
}: ExperienceOutlineProps) {
  return (
    <aside className="h-full overflow-y-auto border-r border-builder-line bg-white p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Experience
      </p>
      <h2 className="mt-1 text-lg font-semibold text-builder-ink">Outline</h2>
      <p className="mt-2 text-[12px] text-builder-muted">
        Struktura Decision Experience
      </p>
      <ol className="mt-5 space-y-1">
        {composition.modules.map((module, index) => {
          const definition = getModuleDefinition(module.id);
          const ready = evaluateModuleReadyState({
            moduleId: module.id,
            composition,
            snapshot,
            validationReport,
          });
          const active = module.id === selectedModuleId;
          return (
            <li key={module.id}>
              <button
                type="button"
                onClick={() => onSelect(module.id)}
                className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-sm ${
                  active
                    ? 'bg-builder-navy text-white'
                    : 'text-builder-ink hover:bg-builder-hover'
                }`}
              >
                <span
                  className={`w-4 text-[11px] ${
                    active ? 'text-white/70' : 'text-builder-muted'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {definition.label}
                  {!module.enabled ? ' · off' : ''}
                </span>
                <span
                  aria-label={ready.message}
                  className={
                    active
                      ? 'text-white/90'
                      : ready.state === 'ready'
                        ? 'text-builder-success'
                        : ready.state === 'warning'
                          ? 'text-builder-draft'
                          : 'text-builder-draft'
                  }
                >
                  {readyGlyph(ready.state)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
