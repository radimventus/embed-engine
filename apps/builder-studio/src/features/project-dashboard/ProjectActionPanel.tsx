import type { HousePackageReleaseSummary } from '../house-package/productionPublishGate';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import { formatCzechDateTime } from './projectDashboardModel';
import { PilotReadyPanel } from './PilotReadyPanel';
import { CustomerSuccessStatusPanel } from './CustomerSuccessStatusPanel';

type ProjectActionPanelProps = {
  readonly loadError: string | null;
  readonly publishError: string | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly validating: boolean;
  readonly publishing: boolean;
  readonly previewAvailable: boolean;
  readonly onPreview: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onHistory: () => void;
  /** VR-FIX-04 — same Studio Switcher path after Publish. */
  readonly onOpenManager?: () => void;
};

/**
 * EPIC-BX-02 / BX-15 — right rail: primary actions + Pilot Ready.
 */
export function ProjectActionPanel({
  loadError,
  publishError,
  validationReport,
  releaseSummary,
  validating,
  publishing,
  previewAvailable: _previewAvailable,
  onPreview,
  onPublish,
  onValidate,
  onHistory,
  onOpenManager,
}: ProjectActionPanelProps) {
  void _previewAvailable;
  const canPublish = validationReport?.canPublish === true;

  return (
    <aside className="h-full overflow-y-auto border-l border-builder-creamDark bg-builder-creamLight p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Připravenost
      </p>
      <h2 className="mt-1 text-lg font-semibold text-builder-ink">
        Připravenost projektu
      </h2>
      <p className="mt-2 text-[12px] text-builder-muted">
        Náhled · Kontrola · Publikace · Manager
      </p>

      {loadError !== null && (
        <p className="mt-4 rounded-lg bg-builder-draftBg px-3 py-2 text-sm text-builder-draft">
          {loadError}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <ActionButton
          label="Náhled"
          onClick={onPreview}
          disabled={publishing}
          primary
        />
        <ActionButton
          label={publishing ? 'Publikuji…' : 'Publikovat změny'}
          onClick={onPublish}
          disabled={!canPublish || validating || publishing}
          primary
        />
        <ActionButton
          label={validating ? 'Kontroluji…' : 'Zkontrolovat stav'}
          onClick={onValidate}
          disabled={validating || publishing}
          primary={false}
        />
        <ActionButton
          label="Historie"
          onClick={onHistory}
          disabled={false}
          primary={false}
        />
        {onOpenManager !== undefined && releaseSummary !== null && (
          <ActionButton
            label="Otevřít Manager"
            onClick={onOpenManager}
            disabled={publishing}
            primary={false}
          />
        )}
      </div>

      {validationReport !== null && (
        <p
          className={`mt-5 rounded-[10px] px-3 py-2 text-sm font-semibold ${
            validationReport.status === 'PASS'
              ? 'bg-builder-successBg text-builder-success'
              : validationReport.status === 'WARNING'
                ? 'bg-builder-panel text-builder-navy'
                : 'bg-builder-draftBg text-builder-draft'
          }`}
        >
          {validationReport.canPublish
            ? 'Připraveno k publikaci'
            : 'Publikace zatím není možná'}
        </p>
      )}

      {releaseSummary !== null && (
        <div className="mt-5 rounded-[12px] border border-[#E3E3E3] bg-builder-canvas px-3 py-3 text-[12px]">
          <p className="font-semibold text-builder-ink">Poslední publikace</p>
          <p className="mt-1 text-builder-muted">
            {formatCzechDateTime(releaseSummary.releaseTimestamp)}
          </p>
          <p className="mt-1 font-mono text-[11px] text-builder-ink">
            v{releaseSummary.housePackageVersion}
          </p>
        </div>
      )}

      <PilotReadyPanel />
      <CustomerSuccessStatusPanel />

      {publishError !== null && (
        <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-builder-draftBg px-3 py-2 text-[11px] text-builder-draft">
          {publishError}
        </pre>
      )}
    </aside>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  primary,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly primary: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-[10px] border px-3 py-2.5 text-sm font-semibold disabled:opacity-40 ${
        primary
          ? 'border-builder-blue bg-builder-blue text-white hover:bg-builder-blueHover'
          : 'border-builder-blue bg-white text-builder-blue hover:bg-builder-blue hover:text-white'
      }`}
      style={
        primary
          ? { backgroundColor: '#18428F', borderColor: '#18428F', color: '#FFFFFF' }
          : { backgroundColor: '#FFFFFF', borderColor: '#18428F', color: '#18428F' }
      }
    >
      {label}
    </button>
  );
}
