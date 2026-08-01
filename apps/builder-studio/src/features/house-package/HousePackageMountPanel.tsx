import type {
  HousePackageEditSession,
  HousePackageEditSnapshot,
} from './housePackageEditSession';
import type { HousePackageValidationReport } from './housePackageValidationReport';
import type { HousePackageReleaseSummary } from './productionPublishGate';
import type { HousePackageNavId } from './HousePackageSidebar';

type HousePackageMountPanelProps = {
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly publishError: string | null;
  readonly loadError: string | null;
  readonly saving: boolean;
  readonly validating: boolean;
  readonly publishing: boolean;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onSave: () => void;
  readonly onValidate: () => void;
  readonly onNavigate: (nav: HousePackageNavId) => void;
  readonly onPublish: () => void;
  readonly onOpenPreview: () => void;
};

type ReadinessTone = 'ok' | 'warn' | 'missing';

/**
 * EPIC-BX-01 — readiness + last publish (product language).
 */
export function HousePackageMountPanel({
  snapshot,
  session,
  validationReport,
  releaseSummary,
  publishError,
  loadError,
  saving,
  validating,
  publishing,
  onChange,
  onSave,
  onValidate,
  onNavigate,
  onPublish,
  onOpenPreview,
}: HousePackageMountPanelProps) {
  const canPublish = validationReport?.canPublish === true;
  const readiness = buildReadiness(validationReport, snapshot, canPublish);

  return (
    <aside className="h-full overflow-y-auto border-l border-builder-line bg-white p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Připravenost
      </p>
      <h2 className="mt-1 text-lg font-semibold text-builder-ink">Projekt</h2>

      {loadError !== null && (
        <p className="mt-4 rounded-lg bg-builder-draftBg px-3 py-2 text-sm text-builder-draft">
          {loadError}
        </p>
      )}

      <ul className="mt-5 space-y-2">
        {readiness.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onNavigate(item.nav)}
              className="flex w-full items-center gap-2.5 rounded-[10px] border border-[#E8EEF5] bg-builder-canvas px-3 py-2.5 text-left text-sm hover:border-builder-navy/30"
            >
              <span aria-hidden className={toneClass(item.tone)}>
                {item.tone === 'ok' ? '✔' : item.tone === 'warn' ? '⚠' : '○'}
              </span>
              <span className="font-medium text-builder-ink">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-[12px] border border-[#E8EEF5] bg-builder-canvas px-3 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Poslední publikace
        </p>
        {releaseSummary !== null ? (
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-builder-muted">Verze</dt>
              <dd className="font-medium text-builder-ink">
                {releaseSummary.housePackageVersion} · Embed{' '}
                {releaseSummary.embedVersion}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-builder-muted">Datum</dt>
              <dd className="font-medium text-builder-ink">
                {formatReleaseDate(releaseSummary.releaseTimestamp)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-builder-muted">
            Zatím nepublikováno v této session.
          </p>
        )}
        {releaseSummary !== null && (
          <button
            type="button"
            onClick={onOpenPreview}
            disabled={publishing}
            className="mt-3 w-full rounded-[10px] border border-builder-navy bg-white px-3 py-2 text-sm font-medium text-builder-navy disabled:opacity-40"
          >
            Otevřít náhled
          </button>
        )}
      </div>

      {publishError !== null && (
        <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-builder-draftBg px-3 py-2 text-[11px] text-builder-draft">
          {publishError}
        </pre>
      )}

      {snapshot !== null && session !== null && (
        <div className="mt-6 space-y-2">
          <button
            type="button"
            disabled={validating || publishing}
            onClick={onValidate}
            className="w-full rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            {validating ? 'Kontroluji…' : 'Zkontrolovat připravenost'}
          </button>
          <button
            type="button"
            disabled={!canPublish || validating || publishing}
            onClick={onPublish}
            className="w-full rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {publishing ? 'Publikuji…' : 'Publikovat'}
          </button>
          <button
            type="button"
            disabled={
              saving ||
              publishing ||
              snapshot.dirtyState === 'clean' ||
              !snapshot.validation.ok
            }
            onClick={onSave}
            className="w-full rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            {saving ? 'Ukládám…' : 'Uložit změny'}
          </button>
          <button
            type="button"
            disabled={!snapshot.canUndo || saving || publishing}
            onClick={() => onChange(session.undo())}
            className="w-full rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            Zpět
          </button>
          <button
            type="button"
            disabled={
              snapshot.dirtyState === 'clean' || saving || publishing
            }
            onClick={() => onChange(session.discard())}
            className="w-full rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            Zahodit změny
          </button>

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
                    <span className="block mt-1">{issue.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}

function buildReadiness(
  report: HousePackageValidationReport | null,
  snapshot: HousePackageEditSnapshot | null,
  canPublish: boolean,
): readonly {
  id: string;
  label: string;
  tone: ReadinessTone;
  nav: HousePackageNavId;
}[] {
  const hasIssue = (nav: HousePackageNavId, categories: readonly string[]) =>
    report?.issues.some(
      (issue) =>
        issue.editor === nav ||
        categories.includes(issue.category),
    ) === true;

  const mediaTone: ReadinessTone =
    snapshot === null
      ? 'missing'
      : hasIssue('media', ['media', 'gallery', 'missing-assets']) ||
          hasIssue('gallery', ['gallery'])
        ? 'warn'
        : 'ok';
  const dispositionTone: ReadinessTone =
    snapshot === null
      ? 'missing'
      : hasIssue('rooms', ['rooms', 'orphan-refs', 'duplicates']) ||
          hasIssue('plans', ['plans'])
        ? 'warn'
        : 'ok';
  const knowledgeTone: ReadinessTone =
    snapshot === null
      ? 'missing'
      : hasIssue('videos', ['videos']) || hasIssue('manifest', ['manifest'])
        ? 'warn'
        : 'ok';
  const runtimeTone: ReadinessTone =
    snapshot === null
      ? 'missing'
      : !snapshot.validation.ok
        ? 'warn'
        : 'ok';
  const publishTone: ReadinessTone =
    report === null
      ? 'missing'
      : canPublish
        ? report.status === 'WARNING'
          ? 'warn'
          : 'ok'
        : 'warn';

  return [
    { id: 'media', label: 'Média', tone: mediaTone, nav: 'media' },
    {
      id: 'disposition',
      label: 'Dispozice',
      tone: dispositionTone,
      nav: 'rooms',
    },
    {
      id: 'knowledge',
      label: 'Knowledge',
      tone: knowledgeTone,
      nav: 'videos',
    },
    { id: 'runtime', label: 'Runtime', tone: runtimeTone, nav: 'overview' },
    {
      id: 'publish',
      label: 'Publikace',
      tone: publishTone,
      nav: 'overview',
    },
  ];
}

function toneClass(tone: ReadinessTone): string {
  if (tone === 'ok') return 'text-builder-success';
  if (tone === 'warn') return 'text-builder-draft';
  return 'text-builder-muted';
}

function formatReleaseDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
