import { useMemo, useState } from 'react';
import type {
  DashboardValidationCheck,
  DashboardValidationReport,
  DashboardOverallStatus,
  ValidationDashboardEvent,
} from '../../model';

type ValidationOverviewProps = {
  readonly report: DashboardValidationReport | null;
  readonly events: readonly ValidationDashboardEvent[];
  readonly indexCount: number;
  readonly message: string | null;
  readonly onEvaluate: () => void;
  readonly onRefresh: () => void;
};

function groupChecks(
  checks: readonly DashboardValidationCheck[],
  status: DashboardOverallStatus,
): readonly DashboardValidationCheck[] {
  return checks.filter((check) => check.status === status);
}

export function ValidationOverview({
  report,
  events,
  indexCount,
  message,
  onEvaluate,
  onRefresh,
}: ValidationOverviewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (report === null || selectedId === null) return null;
    return report.checks.find((check) => check.id === selectedId) ?? null;
  }, [report, selectedId]);

  const readyChecks = report ? groupChecks(report.checks, 'READY') : [];
  const warningChecks = report ? groupChecks(report.checks, 'WARNING') : [];
  const blockedChecks = report ? groupChecks(report.checks, 'BLOCKED') : [];

  return (
    <div className="space-y-8" data-testid="validation-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Validation Dashboard
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {report?.metadata.title ?? 'Validation'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            Agregace existujících validátorů — bez vlastních pravidel, mutací a
            publikace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEvaluate}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Evaluate Project
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={report === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
      </div>

      {message !== null ? (
        <p className="rounded-[10px] border border-[#DDE5EF] px-4 py-3 text-sm text-builder-muted">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="rounded-[16px] border border-[#DDE5EF] bg-[#F7FAFD] p-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Project Readiness
          </p>
          <p className="mt-3 text-5xl font-semibold text-builder-ink">
            {report?.readinessScore ?? '—'}
            {report !== null ? (
              <span className="text-2xl text-builder-muted"> %</span>
            ) : null}
          </p>
          <p className="mt-3 text-[13px] text-builder-muted">
            status: {report?.overallStatus ?? '—'} · index: {indexCount}
          </p>
          <p className="mt-1 text-[13px] text-builder-muted">
            READY {report?.summary.readyCount ?? 0} · WARN{' '}
            {report?.summary.warningCount ?? 0} · ERR{' '}
            {report?.summary.blockedCount ?? 0}
          </p>
        </div>

        <div className="rounded-[16px] border border-[#DDE5EF] p-5">
          {selected === null ? (
            <p className="text-sm text-builder-muted">
              Vyberte kontrolu pro detail zdroje a doporučené akce.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
                Detail
              </p>
              <h3 className="text-lg font-semibold text-builder-ink">
                {selected.title}
              </h3>
              <p className="text-sm text-builder-muted">{selected.description}</p>
              <p className="text-sm">
                <span className="text-builder-muted">Zdroj: </span>
                <span className="font-medium text-builder-ink">
                  {selected.source}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-builder-muted">Status: </span>
                <span className="font-medium text-builder-ink">
                  {selected.status}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-builder-muted">Doporučená akce: </span>
                <span className="font-medium text-builder-ink">
                  {selected.recommendation}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <CheckGroup
        title="Ready"
        subtitle="splněné kontroly"
        checks={readyChecks}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <CheckGroup
        title="Warnings"
        subtitle="doporučení"
        checks={warningChecks}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <CheckGroup
        title="Blocking Issues"
        subtitle="blokující problémy"
        checks={blockedChecks}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <section aria-labelledby="validation-events">
        <h3
          id="validation-events"
          className="text-base font-semibold text-builder-ink"
        >
          Validation Events
        </h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné události.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 10).map((event) => (
              <li
                key={event.eventId}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">{event.type}</span>
                <span className="mt-0.5 block text-builder-muted">
                  {event.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CheckGroup({
  title,
  subtitle,
  checks,
  selectedId,
  onSelect,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly checks: readonly DashboardValidationCheck[];
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-builder-ink">{title}</h3>
        <p className="text-[13px] text-builder-muted">
          {subtitle} · {checks.length}
        </p>
      </div>
      {checks.length === 0 ? (
        <p className="text-sm text-builder-muted">Žádné položky.</p>
      ) : (
        <ul className="space-y-2">
          {checks.map((check) => {
            const active = check.id === selectedId;
            return (
              <li key={check.id}>
                <button
                  type="button"
                  onClick={() => onSelect(check.id)}
                  className={`w-full rounded-[10px] border px-3 py-2.5 text-left text-sm ${
                    active
                      ? 'border-builder-navy bg-[#F3F7FC]'
                      : 'border-[#DDE5EF] bg-white'
                  }`}
                >
                  <span className="font-medium text-builder-ink">
                    {check.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-builder-muted">
                    {check.source} · {check.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
