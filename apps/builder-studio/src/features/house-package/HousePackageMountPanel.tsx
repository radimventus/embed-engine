import type {
  HousePackageEditSession,
  HousePackageEditSnapshot,
} from './housePackageEditSession';
import type { HousePackageValidationReport } from './housePackageValidationReport';
import type { HousePackageNavId } from './HousePackageSidebar';

type HousePackageMountPanelProps = {
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly loadError: string | null;
  readonly saving: boolean;
  readonly validating: boolean;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onSave: () => void;
  readonly onValidate: () => void;
  readonly onNavigate: (nav: HousePackageNavId) => void;
  readonly onPublish: () => void;
};

/**
 * CAP-BLD-05 — validation report + publish gate (ERROR blocks Publish).
 */
export function HousePackageMountPanel({
  snapshot,
  session,
  validationReport,
  loadError,
  saving,
  validating,
  onChange,
  onSave,
  onValidate,
  onNavigate,
  onPublish,
}: HousePackageMountPanelProps) {
  const canPublish = validationReport?.canPublish === true;

  return (
    <aside className="h-full overflow-y-auto border-l border-builder-line bg-white p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Validation
      </p>
      <h2 className="mt-1 text-lg font-semibold text-builder-ink">
        House Package
      </h2>
      <p className="mt-2 text-[12px] text-builder-muted">
        object-house · disk SSOT · publish gate
      </p>

      {loadError !== null && (
        <p className="mt-4 rounded-lg bg-builder-draftBg px-3 py-2 text-sm text-builder-draft">
          {loadError}
        </p>
      )}

      {validationReport !== null && (
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-sm">
          <CountTile
            label="Errors"
            value={String(validationReport.errorCount)}
            tone={validationReport.errorCount > 0 ? 'error' : 'ok'}
          />
          <CountTile
            label="Warnings"
            value={String(validationReport.warningCount)}
            tone={validationReport.warningCount > 0 ? 'warn' : 'ok'}
          />
          <CountTile
            label="PASS"
            value={String(validationReport.passCount)}
            tone="ok"
          />
        </div>
      )}

      {validationReport !== null && (
        <p
          className={`mt-3 text-sm font-semibold ${
            validationReport.status === 'PASS'
              ? 'text-builder-success'
              : validationReport.status === 'WARNING'
                ? 'text-builder-navy'
                : 'text-builder-draft'
          }`}
        >
          Status: {validationReport.status}
          {canPublish ? ' · Publish ready' : ' · Publish blocked'}
        </p>
      )}

      {snapshot !== null && session !== null && (
        <div className="mt-6 space-y-3 text-sm">
          <StatusRow
            label="Working"
            value={
              snapshot.dirtyState === 'save-failed'
                ? 'Save failed'
                : !snapshot.validation.ok
                  ? 'Invalid'
                  : snapshot.dirtyState === 'modified'
                    ? 'Modified'
                    : 'Clean'
            }
            ok={snapshot.validation.ok && snapshot.dirtyState === 'clean'}
          />

          {snapshot.saveError !== null && (
            <p className="rounded-lg bg-builder-draftBg px-3 py-2 text-[12px] text-builder-draft">
              {snapshot.saveError}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              disabled={validating}
              onClick={onValidate}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              {validating ? 'Validating…' : 'Validate House Package'}
            </button>
            <button
              type="button"
              disabled={!canPublish || validating}
              onClick={onPublish}
              className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
              title={
                canPublish
                  ? 'Publish gate open (CAP-BLD-06 wires embed:publish)'
                  : 'Publish blocked while validation has ERROR'
              }
            >
              Publish
            </button>
            <button
              type="button"
              disabled={
                saving ||
                snapshot.dirtyState === 'clean' ||
                !snapshot.validation.ok
              }
              onClick={onSave}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save to House Package'}
            </button>
            <button
              type="button"
              disabled={!snapshot.canUndo || saving}
              onClick={() => onChange(session.undo())}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              Undo last change
            </button>
            <button
              type="button"
              disabled={snapshot.dirtyState === 'clean' || saving}
              onClick={() => onChange(session.discard())}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              Discard / Reset to mount
            </button>
          </div>

          {validationReport !== null && validationReport.issues.length > 0 && (
            <ul className="mt-4 space-y-2">
              {validationReport.issues.map((issue) => (
                <li key={issue.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(issue.editor)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-[12px] ${
                      issue.severity === 'ERROR'
                        ? 'border-builder-draft/40 bg-builder-draftBg text-builder-draft'
                        : 'border-[#DDE5EF] bg-builder-canvas text-builder-navy'
                    }`}
                  >
                    <span className="font-bold">{issue.severity}</span>
                    <span className="mx-1 font-mono">{issue.type}</span>
                    <span className="block mt-1">
                      {issue.file} · {issue.item}
                    </span>
                    <span className="block mt-0.5 opacity-90">
                      {issue.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {validationReport !== null &&
            validationReport.issues.length === 0 && (
              <p className="mt-4 text-[12px] text-builder-success">
                All category checks PASS ({validationReport.passCount}).
              </p>
            )}
        </div>
      )}
    </aside>
  );
}

function CountTile({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone: 'ok' | 'warn' | 'error';
}) {
  const toneClass =
    tone === 'ok'
      ? 'bg-builder-successBg text-builder-success'
      : tone === 'warn'
        ? 'bg-builder-panel text-builder-navy'
        : 'bg-builder-draftBg text-builder-draft';
  return (
    <div className={`rounded-lg px-2 py-2 ${toneClass}`}>
      <div className="text-[11px] opacity-80">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  readonly label: string;
  readonly value: string;
  readonly ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-builder-divider py-3">
      <span className="font-medium text-builder-ink">{label}</span>
      <span
        className={`rounded-xl px-2.5 py-1 text-sm font-bold ${
          ok
            ? 'bg-builder-successBg text-builder-success'
            : 'bg-builder-draftBg text-builder-draft'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
