import { useMemo, useState } from 'react';

import type { ExperienceModuleId } from '../experience-composer/experienceComposition';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import type { DecisionQaTone } from './decisionQa';
import { PREVIEW_DEVICES, type PreviewDeviceId } from './previewDevices';
import { buildPreviewCenterModel } from './previewCenterModel';
import { PREVIEW_PERSONAS, type PreviewPersonaId } from './previewPersonas';
import { PreviewLiveRuntime } from './PreviewLiveRuntime';

type PreviewCenterViewProps = {
  readonly projectId: string;
  readonly projectName: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly onNavigate: (nav: HousePackageNavId) => void;
};

/**
 * EPIC-BX-06 — Preview Center: Persona → Device → Priority → Live Runtime → Path → QA.
 */
export function PreviewCenterView({
  projectId,
  projectName,
  snapshot,
  validationReport,
  onNavigate,
}: PreviewCenterViewProps) {
  const [personaId, setPersonaId] = useState<PreviewPersonaId>('family');
  const [deviceId, setDeviceId] = useState<PreviewDeviceId>('desktop');
  const [compareMode, setCompareMode] = useState(false);
  const [comparePersonaId, setComparePersonaId] =
    useState<PreviewPersonaId>('investor');
  const [compareDeviceId, setCompareDeviceId] =
    useState<PreviewDeviceId>('mobile');
  const [activeCompareSide, setActiveCompareSide] = useState<
    'primary' | 'compare'
  >('primary');
  const [activePathStep, setActivePathStep] =
    useState<ExperienceModuleId>('hero');

  const model = useMemo(
    () =>
      buildPreviewCenterModel({
        projectId,
        snapshot,
        validationReport,
        personaId,
        deviceId,
        comparePersonaId,
        compareDeviceId,
        compareActive: compareMode,
        activeCompareSide,
      }),
    [
      projectId,
      snapshot,
      validationReport,
      personaId,
      deviceId,
      comparePersonaId,
      compareDeviceId,
      compareMode,
      activeCompareSide,
    ],
  );

  const livePersona =
    compareMode && activeCompareSide === 'compare'
      ? model.comparePersona
      : model.persona;
  const liveDevice =
    compareMode && activeCompareSide === 'compare'
      ? model.compareDevice
      : model.device;

  return (
    <div className="space-y-5" data-testid="preview-center">
      <header className="rounded-[16px] border border-[#E3E3E3] bg-white p-6 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Preview
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-builder-ink">
          Preview Center
        </h1>
        <p className="mt-1 text-sm text-builder-muted">
          {projectName} — simulace Decision Experience před publikací (Shared
          Runtime).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCompareMode(false)}
            className={`rounded-[10px] border px-3 py-2 text-sm font-medium ${
              !compareMode
                ? 'border-builder-navy bg-builder-navy text-white'
                : 'border-[#DDE5EF] bg-white text-builder-ink'
            }`}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => setCompareMode(true)}
            className={`rounded-[10px] border px-3 py-2 text-sm font-medium ${
              compareMode
                ? 'border-builder-navy bg-builder-navy text-white'
                : 'border-[#DDE5EF] bg-white text-builder-ink'
            }`}
          >
            Compare Mode
          </button>
        </div>
      </header>

      <div
        className={`grid gap-4 ${
          compareMode
            ? 'desktop:grid-cols-2'
            : 'desktop:grid-cols-[280px_minmax(0,1fr)_300px]'
        }`}
      >
        {!compareMode && (
          <aside className="space-y-4">
            <PersonaPanel
              title="Persona"
              selected={personaId}
              onSelect={(id) => {
                setPersonaId(id);
                setActivePathStep('priority');
              }}
            />
            <DevicePanel
              title="Device"
              selected={deviceId}
              onSelect={setDeviceId}
            />
            <PriorityHint personaLabel={model.persona.label} priorities={model.persona.priorityIds} />
          </aside>
        )}

        {compareMode ? (
          <>
            <CompareColumn
              title="A"
              active={activeCompareSide === 'primary'}
              onActivate={() => setActiveCompareSide('primary')}
              personaId={personaId}
              deviceId={deviceId}
              onPersona={(id) => {
                setPersonaId(id);
                setActiveCompareSide('primary');
                setActivePathStep('priority');
              }}
              onDevice={(id) => {
                setDeviceId(id);
                setActiveCompareSide('primary');
              }}
              showRuntime={activeCompareSide === 'primary'}
              persona={model.persona}
              device={model.device}
              remountKey={model.remountKey}
            />
            <CompareColumn
              title="B"
              active={activeCompareSide === 'compare'}
              onActivate={() => setActiveCompareSide('compare')}
              personaId={comparePersonaId}
              deviceId={compareDeviceId}
              onPersona={(id) => {
                setComparePersonaId(id);
                setActiveCompareSide('compare');
                setActivePathStep('priority');
              }}
              onDevice={(id) => {
                setCompareDeviceId(id);
                setActiveCompareSide('compare');
              }}
              showRuntime={activeCompareSide === 'compare'}
              persona={model.comparePersona}
              device={model.compareDevice}
              remountKey={model.remountKey}
            />
          </>
        ) : (
          <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-4 shadow-sm">
            <PreviewLiveRuntime
              remountKey={model.remountKey}
              persona={livePersona}
              device={liveDevice}
            />
          </section>
        )}

        {!compareMode && (
          <aside className="space-y-4">
            <DecisionPathPanel
              path={model.path}
              activeStep={activePathStep}
              onSelect={setActivePathStep}
            />
            <DecisionQaPanel qa={model.qa} onNavigate={onNavigate} />
          </aside>
        )}
      </div>

      {compareMode && (
        <div className="grid gap-4 desktop:grid-cols-2">
          <DecisionPathPanel
            path={model.path}
            activeStep={activePathStep}
            onSelect={setActivePathStep}
          />
          <DecisionQaPanel qa={model.qa} onNavigate={onNavigate} />
        </div>
      )}

      <ValidationSummary
        qa={model.qa}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function CompareColumn({
  title,
  active,
  onActivate,
  personaId,
  deviceId,
  onPersona,
  onDevice,
  showRuntime,
  persona,
  device,
  remountKey,
}: {
  readonly title: string;
  readonly active: boolean;
  readonly onActivate: () => void;
  readonly personaId: PreviewPersonaId;
  readonly deviceId: PreviewDeviceId;
  readonly onPersona: (id: PreviewPersonaId) => void;
  readonly onDevice: (id: PreviewDeviceId) => void;
  readonly showRuntime: boolean;
  readonly persona: ReturnType<typeof buildPreviewCenterModel>['persona'];
  readonly device: ReturnType<typeof buildPreviewCenterModel>['device'];
  readonly remountKey: string;
}) {
  return (
    <section
      className={`space-y-3 rounded-[16px] border p-4 shadow-sm ${
        active
          ? 'border-builder-navy bg-white ring-2 ring-builder-navy/10'
          : 'border-[#E3E3E3] bg-builder-canvas'
      }`}
    >
      <button
        type="button"
        onClick={onActivate}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-builder-ink">
          Compare {title}
        </span>
        <span className="text-[11px] text-builder-muted">
          {active ? 'Aktivní Runtime' : 'Kliknutím aktivovat'}
        </span>
      </button>
      <PersonaPanel title="Persona" selected={personaId} onSelect={onPersona} />
      <DevicePanel title="Device" selected={deviceId} onSelect={onDevice} />
      {showRuntime ? (
        <PreviewLiveRuntime
          remountKey={remountKey}
          persona={persona}
          device={device}
          compact
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-[12px] border border-dashed border-[#DDE5EF] bg-white text-sm text-builder-muted">
          Jediný Shared Runtime běží ve sloupci {active ? title : 'aktivním'}
        </div>
      )}
    </section>
  );
}

function PersonaPanel({
  title,
  selected,
  onSelect,
}: {
  readonly title: string;
  readonly selected: PreviewPersonaId;
  readonly onSelect: (id: PreviewPersonaId) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        {title}
      </p>
      <ul className="mt-3 space-y-1.5">
        {PREVIEW_PERSONAS.map((persona) => {
          const active = persona.id === selected;
          return (
            <li key={persona.id}>
              <button
                type="button"
                onClick={() => onSelect(persona.id)}
                className={`w-full rounded-[10px] border px-3 py-2.5 text-left ${
                  active
                    ? 'border-builder-navy bg-builder-navy text-white'
                    : 'border-[#E3E3E3] bg-builder-canvas text-builder-ink'
                }`}
              >
                <span className="block text-sm font-semibold">
                  {persona.label}
                </span>
                <span
                  className={`mt-0.5 block text-[11px] ${
                    active ? 'text-white/80' : 'text-builder-muted'
                  }`}
                >
                  {persona.description}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DevicePanel({
  title,
  selected,
  onSelect,
}: {
  readonly title: string;
  readonly selected: PreviewDeviceId;
  readonly onSelect: (id: PreviewDeviceId) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        {title}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {PREVIEW_DEVICES.map((device) => {
          const active = device.id === selected;
          return (
            <button
              key={device.id}
              type="button"
              onClick={() => onSelect(device.id)}
              className={`rounded-[10px] border px-2 py-2 text-center text-sm font-medium ${
                active
                  ? 'border-builder-navy bg-builder-navy text-white'
                  : 'border-[#E3E3E3] bg-builder-canvas text-builder-ink'
              }`}
            >
              {device.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PriorityHint({
  personaLabel,
  priorities,
}: {
  readonly personaLabel: string;
  readonly priorities: readonly string[];
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Priority
      </p>
      <p className="mt-2 text-sm text-builder-ink">
        {personaLabel} → Runtime ChangePriority
      </p>
      <p className="mt-1 text-[12px] text-builder-muted">
        {priorities.join(' · ')}
      </p>
    </section>
  );
}

function DecisionPathPanel({
  path,
  activeStep,
  onSelect,
}: {
  readonly path: ReturnType<typeof buildPreviewCenterModel>['path'];
  readonly activeStep: ExperienceModuleId;
  readonly onSelect: (id: ExperienceModuleId) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Decision Path
      </p>
      <ol className="mt-3 space-y-0">
        {path.map((step, index) => {
          const active = step.id === activeStep;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                className={`flex w-full items-start gap-2 rounded-[10px] px-2 py-2 text-left ${
                  active ? 'bg-builder-panel' : ''
                } ${step.enabled ? '' : 'opacity-50'}`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    active
                      ? 'bg-builder-navy text-white'
                      : 'bg-[#E3E3E3] text-builder-muted'
                  }`}
                >
                  {index + 1}
                </span>
                <span>
                  <span
                    className={`block text-sm font-medium ${
                      active ? 'text-builder-navy' : 'text-builder-ink'
                    }`}
                  >
                    {step.label}
                  </span>
                  {!step.enabled && (
                    <span className="text-[11px] text-builder-muted">
                      vypnuto v Composeru
                    </span>
                  )}
                </span>
              </button>
              {index < path.length - 1 && (
                <div className="ml-4 h-3 w-px bg-[#DDE5EF]" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DecisionQaPanel({
  qa,
  onNavigate,
}: {
  readonly qa: ReturnType<typeof buildPreviewCenterModel>['qa'];
  readonly onNavigate: (nav: HousePackageNavId) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Decision QA
      </p>
      <ul className="mt-3 space-y-1.5">
        {qa.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onNavigate(item.nav)}
              className="flex w-full items-start gap-2 rounded-[10px] border border-[#E3E3E3] bg-builder-canvas px-3 py-2 text-left hover:border-builder-navy/40"
            >
              <span className="text-sm font-semibold">{qaMark(item.tone)}</span>
              <span>
                <span className="block text-sm font-medium text-builder-ink">
                  {item.label}
                </span>
                <span className="text-[11px] text-builder-muted">
                  {item.detail}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ValidationSummary({
  qa,
  onNavigate,
}: {
  readonly qa: ReturnType<typeof buildPreviewCenterModel>['qa'];
  readonly onNavigate: (nav: HousePackageNavId) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Souhrn validace
      </p>
      <div className="mt-4 grid gap-3 tablet:grid-cols-3">
        <SummaryCard
          label="Validace"
          value={qa.validationStatus}
          tone={
            qa.validationStatus === 'PASS'
              ? 'pass'
              : qa.validationStatus === 'WARNING'
                ? 'warn'
                : 'fail'
          }
        />
        <SummaryCard
          label="Decision QA"
          value={`${qa.passCount} pass · ${qa.warnCount} warn · ${qa.failCount} fail`}
          tone={qa.failCount > 0 ? 'fail' : qa.warnCount > 0 ? 'warn' : 'pass'}
        />
        <SummaryCard
          label="Připraveno k publikaci"
          value={qa.readyForPublish ? 'Ano' : qa.summaryLabel}
          tone={qa.readyForPublish ? 'pass' : 'warn'}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white"
          onClick={() => onNavigate('experience')}
        >
          Otevřít Experience
        </button>
        <button
          type="button"
          className="rounded-[10px] border border-[#DDE5EF] bg-white px-4 py-2 text-sm font-medium text-builder-ink"
          onClick={() => onNavigate('media-studio')}
        >
          Otevřít Média
        </button>
        <button
          type="button"
          className="rounded-[10px] border border-[#DDE5EF] bg-white px-4 py-2 text-sm font-medium text-builder-ink"
          onClick={() => onNavigate('overview')}
        >
          Dashboard
        </button>
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone: DecisionQaTone;
}) {
  return (
    <div
      className={`rounded-[12px] border px-4 py-3 ${
        tone === 'pass'
          ? 'border-builder-success/30 bg-builder-success/5'
          : tone === 'warn'
            ? 'border-amber-300/60 bg-amber-50'
            : 'border-builder-draft/30 bg-builder-draftBg'
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-builder-ink">{value}</p>
    </div>
  );
}

function qaMark(tone: DecisionQaTone): string {
  if (tone === 'pass') return '✔';
  if (tone === 'warn') return '⚠';
  return '✘';
}
