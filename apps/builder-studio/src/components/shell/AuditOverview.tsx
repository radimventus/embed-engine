import type {
  RuntimeAuditEvent,
  RuntimeAuditPackage,
} from '../../model';

type AuditOverviewProps = {
  readonly auditPackage: RuntimeAuditPackage | null;
  readonly events: readonly RuntimeAuditEvent[];
  readonly indexCount: number;
  readonly publishedCount: number;
  readonly onRecord: () => void;
  readonly onPublish: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Audit Overview (EPIC-BLD-38).
 * Audit projection only — never mutates Runtime / State / Knowledge.
 */
export function AuditOverview({
  auditPackage,
  events,
  indexCount,
  publishedCount,
  onRecord,
  onPublish,
  onValidate,
  onDispose,
  message,
}: AuditOverviewProps) {
  const canAct =
    auditPackage !== null && auditPackage.metadata.status !== 'Disposed';
  const canPublish =
    canAct && auditPackage.metadata.status !== 'Published';
  const integrityOk =
    auditPackage?.validation?.valid === true &&
    auditPackage.metadata.immutable === true;

  return (
    <div className="space-y-8" data-testid="audit-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Audit
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {auditPackage?.metadata.title ?? 'Runtime Audit Engine'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {auditPackage !== null
              ? `${auditPackage.id} · v${auditPackage.version} · ${auditPackage.metadata.status}`
              : 'Neměnitelná auditní stopa Runtime Session.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Audit nikdy nemění Runtime, State, Knowledge ani Decision Engine.
            Nepoužívá AI — pouze zapisuje immutable záznamy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRecord}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Record Audit
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={!canAct}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={!canPublish}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Publish
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={!canAct}
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

      <section aria-labelledby="audit-trail-heading">
        <h3
          id="audit-trail-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Active Audit Trail
        </h3>
        {auditPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Record Audit (čte události Runtime / Modules / State /
            Observability / Health).
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {auditPackage.trail.id}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              session: {auditPackage.trail.sessionId} · trail:{' '}
              {auditPackage.trail.metadata.status} · records:{' '}
              {auditPackage.trail.records.length} · index: {indexCount}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="audit-records-heading">
        <h3
          id="audit-records-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Audit Records
        </h3>
        {auditPackage === null || auditPackage.trail.records.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné záznamy.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {auditPackage.trail.records.slice(0, 12).map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <div>
                  <span className="font-medium text-builder-ink">
                    {item.action}
                  </span>
                  <span className="mt-0.5 block text-builder-muted">
                    {item.entity} · {item.metadata.source}
                    {item.moduleExecutionId !== null
                      ? ` · ${item.moduleExecutionId}`
                      : ''}
                  </span>
                </div>
                <time className="shrink-0 text-[11px] text-builder-muted">
                  {new Date(item.timestamp).toLocaleTimeString('cs-CZ', {
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

      <section aria-labelledby="audit-packages-heading">
        <h3
          id="audit-packages-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Published Audit Packages
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <InfoTile label="Published audits" value={String(publishedCount)} />
          <InfoTile
            label="Package status"
            value={auditPackage?.metadata.status ?? '—'}
          />
          <InfoTile
            label="Immutable"
            value={auditPackage?.metadata.immutable === true ? 'Yes' : '—'}
          />
          <InfoTile
            label="Completed"
            value={
              auditPackage?.trail.completedAt !== null &&
              auditPackage?.trail.completedAt !== undefined
                ? new Date(auditPackage.trail.completedAt).toLocaleTimeString(
                    'cs-CZ',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    },
                  )
                : '—'
            }
          />
        </ul>
      </section>

      <section aria-labelledby="audit-integrity-heading">
        <h3
          id="audit-integrity-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Integrity Status
        </h3>
        {auditPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">—</p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {integrityOk
                ? 'Intact'
                : auditPackage.validation == null
                  ? 'Pending validation'
                  : 'Issues detected'}
            </p>
            <p className="mt-1 text-[13px] text-builder-muted">
              immutable={String(auditPackage.metadata.immutable)} · trail=
              {auditPackage.trail.metadata.status}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="audit-validation-heading">
        <h3
          id="audit-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {auditPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {auditPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {auditPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {auditPackage.validation.issues.map((issue) => (
                  <li
                    key={`${issue.code}-${issue.message}`}
                    className="text-sm text-builder-muted"
                  >
                    [{issue.severity}] {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="audit-events-heading">
        <h3
          id="audit-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Audit Events
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
