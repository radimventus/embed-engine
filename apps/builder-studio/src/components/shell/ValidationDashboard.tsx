import type { ValidationEvent, ValidationReport } from '../../model';

type ValidationDashboardProps = {
  readonly report: ValidationReport | null;
  readonly history: readonly ValidationReport[];
  readonly events: readonly ValidationEvent[];
  readonly onValidateProject: () => void;
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function gateTone(
  gate: ValidationReport['qualityGate'],
): 'success' | 'draft' | 'navy' {
  if (gate === 'Passed') {
    return 'success';
  }
  if (gate === 'Failed') {
    return 'draft';
  }
  return 'navy';
}

/**
 * Validation Dashboard (EPIC-BLD-07).
 * Presentation only — results from ValidationService.
 */
export function ValidationDashboard({
  report,
  history,
  events,
  onValidateProject,
}: ValidationDashboardProps) {
  return (
    <section className="mt-8 border-t border-builder-divider pt-6">
      <h4 className="mb-4 text-base font-semibold">Validation & Quality Gate</h4>

      {report === null ? (
        <p className="mb-4 text-sm text-builder-muted">
          Zatím žádná validace v této relaci.
        </p>
      ) : (
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between rounded-[12px] border border-builder-line bg-white px-3 py-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.6px] text-builder-muted">
                Score
              </div>
              <div className="text-2xl font-bold text-builder-navy">
                {report.score}
              </div>
            </div>
            <span
              className={`rounded-xl px-2.5 py-1 text-sm font-bold ${
                gateTone(report.qualityGate) === 'success'
                  ? 'bg-builder-successBg text-builder-success'
                  : gateTone(report.qualityGate) === 'draft'
                    ? 'bg-builder-draftBg text-builder-draft'
                    : 'bg-builder-panel text-builder-navy'
              }`}
            >
              {report.qualityGate}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-[10px] bg-builder-draftBg px-3 py-2 text-builder-draft">
              Errors: {report.errors.length}
            </div>
            <div className="rounded-[10px] bg-builder-panel px-3 py-2 text-builder-navy">
              Warnings: {report.warnings.length}
            </div>
          </div>

          <div className="text-xs text-builder-muted">
            Poslední validace: {formatDateTime(report.timestamp)}
          </div>

          {report.errors.length > 0 ? (
            <ul className="space-y-1 rounded-[10px] bg-builder-draftBg p-3 text-xs text-builder-draft">
              {report.errors.slice(0, 4).map((item) => (
                <li key={item.ruleId}>
                  [{item.category}] {item.message}
                </li>
              ))}
            </ul>
          ) : null}

          {report.warnings.length > 0 ? (
            <ul className="space-y-1 rounded-[10px] bg-builder-panel/50 p-3 text-xs text-builder-navy">
              {report.warnings.slice(0, 3).map((item) => (
                <li key={item.ruleId}>
                  [{item.category}] {item.message}
                </li>
              ))}
            </ul>
          ) : null}

          {report.recommendations.length > 0 ? (
            <p className="text-xs text-builder-muted">
              Doporučení: {report.recommendations[0]}
            </p>
          ) : null}
        </div>
      )}

      <button
        type="button"
        onClick={onValidateProject}
        className="w-full rounded-xl bg-builder-panel px-4 py-4 text-[15px] font-semibold text-builder-navy transition hover:bg-builder-navy hover:text-white"
      >
        Spustit validaci
      </button>

      {history.length > 0 ? (
        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[#7D8796]">
            Validation History (relace)
          </div>
          <ul className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <li
                key={`${item.projectId}-${item.timestamp}`}
                className="rounded-[10px] bg-builder-hover px-3 py-2 text-xs text-[#5E6C83]"
              >
                <div className="font-semibold text-builder-ink">
                  {item.qualityGate} · score {item.score}
                </div>
                <div>
                  {item.errors.length} err · {item.warnings.length} warn ·{' '}
                  {formatDateTime(item.timestamp)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {events.length > 0 ? (
        <div className="mt-4 text-[11px] text-builder-muted">
          Last event: {events[0]?.type}
        </div>
      ) : null}
    </section>
  );
}
