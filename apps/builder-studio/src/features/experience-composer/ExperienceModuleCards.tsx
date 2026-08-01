import { useState, type DragEvent } from 'react';

import {
  AiAuthorSuggestButton,
  proposeDecisionFlow,
  proposeExperienceCta,
  proposeExperienceModuleOrder,
  type ExperienceCtaPayload,
  type ExperienceOrderPayload,
} from '../ai-author';
import {
  getModuleDefinition,
  summarizeModuleConfig,
  type ExperienceComposition,
  type ExperienceModuleId,
} from './experienceComposition';
import {
  evaluateModuleReadyState,
  readyGlyph,
  type ExperienceModuleReady,
} from './experienceModuleReady';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';

type ExperienceModuleCardsProps = {
  readonly composition: ExperienceComposition;
  readonly selectedModuleId: ExperienceModuleId | null;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly projectId: string;
  readonly onSelect: (moduleId: ExperienceModuleId) => void;
  readonly onEdit: (moduleId: ExperienceModuleId) => void;
  readonly onToggle: (moduleId: ExperienceModuleId) => void;
  readonly onReorder: (fromIndex: number, toIndex: number) => void;
  readonly onApplyOrder: (moduleIds: readonly ExperienceModuleId[]) => void;
  readonly onApplyCta: (heroCta: string, leadCta: string) => void;
  readonly onReadyClick: (moduleId: ExperienceModuleId, ready: ExperienceModuleReady) => void;
  readonly onAddModule: (moduleId: ExperienceModuleId) => void;
};

/**
 * EPIC-BX-03 — Composer canvas module cards with drag & drop order.
 */
export function ExperienceModuleCards({
  composition,
  selectedModuleId,
  snapshot,
  validationReport,
  projectId,
  onSelect,
  onEdit,
  onToggle,
  onReorder,
  onApplyOrder,
  onApplyCta,
  onReadyClick,
  onAddModule,
}: ExperienceModuleCardsProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => (event: DragEvent) => {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  };

  const handleDrop = (toIndex: number) => (event: DragEvent) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData('text/plain');
    const fromIndex = Number.parseInt(raw, 10);
    if (Number.isFinite(fromIndex)) {
      onReorder(fromIndex, toIndex);
    }
    setDragIndex(null);
  };

  const disabledCatalog = composition.modules
    .filter((module) => !module.enabled)
    .map((module) => module.id);
  const missingFromCanvas = (
    [
      'hero',
      'priority',
      'house-navigator',
      'faq',
      'ai-advisor',
      'lead-capture',
    ] as const
  ).filter((id) => !composition.modules.some((module) => module.id === id));

  return (
    <div className="space-y-4" data-testid="experience-module-cards">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Experience
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
          Composer
        </h2>
        <p className="mt-1 text-sm text-builder-muted">
          Upravujte moduly a jejich pořadí — ne interní implementaci.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AiAuthorSuggestButton
            projectId={projectId}
            domain="experience"
            label="Navrhni lepší pořadí modulů"
            buildProposal={() => proposeExperienceModuleOrder(composition)}
            onAccept={(payload) => {
              const data = payload as ExperienceOrderPayload;
              onApplyOrder(data.moduleIds as ExperienceModuleId[]);
            }}
          />
          <AiAuthorSuggestButton
            projectId={projectId}
            domain="experience"
            label="Navrhni CTA"
            buildProposal={() => proposeExperienceCta(composition)}
            onAccept={(payload) => {
              const data = payload as ExperienceCtaPayload;
              onApplyCta(data.heroCta, data.leadCta);
            }}
          />
          <AiAuthorSuggestButton
            projectId={projectId}
            domain="experience"
            label="Navrhni lepší Decision Flow"
            buildProposal={() => proposeDecisionFlow(composition)}
            onAccept={(payload) => {
              const data = payload as ExperienceOrderPayload;
              onApplyOrder(data.moduleIds as ExperienceModuleId[]);
            }}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {composition.modules.map((module, index) => {
          const definition = getModuleDefinition(module.id);
          const ready = evaluateModuleReadyState({
            moduleId: module.id,
            composition,
            snapshot,
            validationReport,
          });
          const selected = module.id === selectedModuleId;
          return (
            <li key={module.id}>
              <article
                id={`experience-module-${module.id}`}
                draggable
                onDragStart={handleDragStart(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop(index)}
                onDragEnd={() => setDragIndex(null)}
                onClick={() => onSelect(module.id)}
                className={`cursor-grab rounded-[14px] border bg-white p-4 shadow-sm active:cursor-grabbing ${
                  selected
                    ? 'border-builder-navy ring-2 ring-builder-navy/15'
                    : 'border-[#E3E3E3]'
                } ${dragIndex === index ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-builder-muted"
                        aria-hidden
                        title="Přesunout"
                      >
                        ⋮⋮
                      </span>
                      <h3 className="text-base font-semibold text-builder-ink">
                        {definition.label}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          module.enabled
                            ? 'bg-builder-successBg text-builder-success'
                            : 'bg-builder-soft text-builder-muted'
                        }`}
                      >
                        {module.enabled ? 'aktivní' : 'vypnutý'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-builder-muted">
                      {summarizeModuleConfig(composition, module.id)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onReadyClick(module.id, ready);
                      }}
                      className={`rounded-[10px] px-2.5 py-1.5 text-sm font-semibold ${
                        ready.state === 'ready'
                          ? 'bg-builder-successBg text-builder-success'
                          : ready.state === 'warning'
                            ? 'bg-builder-draftBg text-builder-draft'
                            : 'bg-builder-draftBg text-builder-draft'
                      }`}
                      title={ready.message}
                    >
                      {readyGlyph(ready.state)}{' '}
                      {ready.state === 'ready'
                        ? 'Ready'
                        : ready.state === 'warning'
                          ? 'Warning'
                          : 'Error'}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggle(module.id);
                      }}
                      className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-1.5 text-sm font-medium"
                    >
                      {module.enabled ? 'Vypnout' : 'Zapnout'}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(module.id);
                      }}
                      className="rounded-[10px] border border-builder-blue bg-builder-blue px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Upravit
                    </button>
                  </div>
                </div>
                {index < composition.modules.length - 1 && (
                  <p className="mt-3 text-center text-builder-muted" aria-hidden>
                    ↓
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ul>

      <AddModuleMenu
        candidates={[...missingFromCanvas, ...disabledCatalog]}
        onAdd={onAddModule}
      />
    </div>
  );
}

function AddModuleMenu({
  candidates,
  onAdd,
}: {
  readonly candidates: readonly ExperienceModuleId[];
  readonly onAdd: (moduleId: ExperienceModuleId) => void;
}) {
  const [open, setOpen] = useState(false);
  const unique = [...new Set(candidates)];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full rounded-[14px] border border-dashed border-builder-navy/40 bg-builder-panel px-4 py-3 text-sm font-semibold text-builder-navy"
      >
        ＋ Přidat modul
      </button>
      {open && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-[12px] border border-builder-line bg-white shadow-[0_12px_32px_rgba(35,51,76,0.12)]">
          {unique.length === 0 ? (
            <li className="px-4 py-3 text-sm text-builder-muted">
              Všechny moduly jsou v Experience.
            </li>
          ) : (
            unique.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-builder-ink hover:bg-builder-panel"
                  onClick={() => {
                    onAdd(id);
                    setOpen(false);
                  }}
                >
                  {getModuleDefinition(id).label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
