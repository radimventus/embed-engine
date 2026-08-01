import type {
  LearningImportReport,
  LearningPipelineEvent,
  LearningRecord,
  LearningValidationResult,
} from '../../model';

type LearningPipelineOverviewProps = {
  readonly record: LearningRecord | null;
  readonly validation: LearningValidationResult | null;
  readonly report: LearningImportReport | null;
  readonly exportPayload: string | null;
  readonly events: readonly LearningPipelineEvent[];
  readonly snapshotLabel: string | null;
  readonly onImport: () => void;
  readonly onValidate: () => void;
  readonly onAnonymize: () => void;
  readonly onTransform: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Learning Pipeline Overview (EPIC-BLD-22).
 * Diagnostic transform view — no AI, heuristics, or Learning Package merge.
 */
export function LearningPipelineOverview({
  record,
  validation,
  report,
  exportPayload,
  events,
  snapshotLabel,
  onImport,
  onValidate,
  onAnonymize,
  onTransform,
  onDispose,
  message,
}: LearningPipelineOverviewProps) {
  return (
    <div className="space-y-8" data-testid="learning-pipeline-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Learning Pipeline
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {record?.metadata.title ?? 'Learning Pipeline'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {record !== null
              ? `${record.id} · from ${record.sourceSnapshotId}`
              : 'Vyžaduje Analytics Snapshot — Pipeline pouze transformuje.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Pipeline nemění Analytics, Runtime ani Story. Nevytváří heuristiky a
            nepoužívá AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onImport}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Import Analytics
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={validation === null && record === null && report === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onAnonymize}
            disabled={validation === null && report === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Anonymize
          </button>
          <button
            type="button"
            onClick={onTransform}
            disabled={validation === null && report === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Transform
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={report === null && record === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Dispose
          </button>
        </div>
      </div>

      {message !== null ? (
        <p className="rounded-[10px] border border-[#DDE5EF] px-4 py-3 text-sm text-builder-muted">
          {message}
        </p>
      ) : null}

      <section aria-labelledby="pipeline-snapshot-heading">
        <h3
          id="pipeline-snapshot-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Snapshot
        </h3>
        <p className="mt-3 text-sm text-builder-muted">
          {snapshotLabel ?? 'Žádný Analytics Snapshot — nejdřív Analytics → Record.'}
        </p>
      </section>

      <section aria-labelledby="pipeline-validation-heading">
        <h3
          id="pipeline-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {validation === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {validation.valid ? 'Valid' : 'Invalid'}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              errors {validation.errors.length} · warnings{' '}
              {validation.warnings.length}
            </p>
            {[...validation.errors, ...validation.warnings].length > 0 ? (
              <ul className="mt-2 space-y-1">
                {[...validation.errors, ...validation.warnings].map((issue) => (
                  <li key={issue.code} className="text-sm text-builder-muted">
                    [{issue.severity}] {issue.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="pipeline-transformation-heading">
        <h3
          id="pipeline-transformation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Transformation
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          ingest → validate → anonymize → transform → LearningRecord
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {(['Imported', 'Validated', 'Anonymized', 'Record'] as const).map(
            (step) => {
              const active =
                (step === 'Imported' && report !== null) ||
                (step === 'Validated' && validation !== null) ||
                (step === 'Anonymized' &&
                  events.some((item) => item.type === 'LearningAnonymized')) ||
                (step === 'Record' && record !== null);
              return (
                <div
                  key={step}
                  className={`rounded-[12px] border px-4 py-3 ${
                    active
                      ? 'border-builder-blue bg-builder-creamDark text-builder-blue'
                      : 'border-[#DDE5EF] bg-white text-builder-ink'
                  }`}
                >
                  <p className="text-sm font-semibold">{step}</p>
                </div>
              );
            },
          )}
        </div>
      </section>

      <section aria-labelledby="pipeline-record-heading">
        <h3
          id="pipeline-record-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Record
        </h3>
        {record === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            LearningRecord ještě nevznikl — Transform.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <ul className="grid gap-2 sm:grid-cols-2">
              <InfoTile label="Record ID" value={record.id} />
              <InfoTile label="Session (anon)" value={record.sessionId} />
              <InfoTile
                label="Events"
                value={`${record.events.length}`}
              />
              <InfoTile
                label="Metrics"
                value={`${record.metrics.length}`}
              />
            </ul>
            <ul className="space-y-2">
              {record.metrics.map((metric) => (
                <li
                  key={metric.name}
                  className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-builder-ink">
                    {metric.name}
                  </span>
                  <span className="ml-2 text-builder-muted">
                    {metric.value} {metric.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="pipeline-report-heading">
        <h3
          id="pipeline-report-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Import Report
        </h3>
        {report === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím žádný import report.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile label="Processed" value={`${report.processed}`} />
            <InfoTile label="Accepted" value={`${report.accepted}`} />
            <InfoTile label="Rejected" value={`${report.rejected}`} />
            <InfoTile label="Warnings" value={`${report.warnings}`} />
          </div>
        )}
      </section>

      <section aria-labelledby="pipeline-export-heading">
        <h3
          id="pipeline-export-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Export
        </h3>
        {exportPayload === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Export vznikne po Transform.
          </p>
        ) : (
          <pre className="mt-3 max-h-64 overflow-auto rounded-[12px] border border-[#DDE5EF] bg-[#F8FAFC] px-4 py-3 text-[12px] text-builder-ink">
            {exportPayload}
          </pre>
        )}
      </section>

      <section aria-labelledby="pipeline-events-heading">
        <h3
          id="pipeline-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Pipeline Events
        </h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné události.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 12).map((event) => (
              <li
                key={event.eventId}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <div>
                  <span className="font-medium text-builder-ink">
                    {event.type}
                  </span>
                  <span className="mt-0.5 block text-builder-muted">
                    {event.message}
                  </span>
                </div>
                <time className="shrink-0 text-[11px] text-builder-muted">
                  {new Date(event.at).toLocaleTimeString('cs-CZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function InfoTile({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-[12px] uppercase tracking-wide text-builder-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-builder-ink">{value}</p>
    </div>
  );
}
