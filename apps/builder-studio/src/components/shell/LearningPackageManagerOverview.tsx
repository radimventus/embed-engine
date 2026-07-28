import type {
  LearningPackageManagerEvent,
  LearningRecordsPackage,
} from '../../model';

type LearningPackageManagerOverviewProps = {
  readonly learningRecordsPackage: LearningRecordsPackage | null;
  readonly events: readonly LearningPackageManagerEvent[];
  readonly indexCount: number;
  readonly onCreate: () => void;
  readonly onAddRecord: () => void;
  readonly onRemoveLastRecord: () => void;
  readonly onValidate: () => void;
  readonly onPublish: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

/**
 * Learning Package Overview (EPIC-BLD-23).
 * Diagnostic management of Learning Record references — no patterns/AI.
 */
export function LearningPackageManagerOverview({
  learningRecordsPackage,
  events,
  indexCount,
  onCreate,
  onAddRecord,
  onRemoveLastRecord,
  onValidate,
  onPublish,
  onDispose,
  message,
}: LearningPackageManagerOverviewProps) {
  const canMutate =
    learningRecordsPackage !== null &&
    learningRecordsPackage.metadata.status !== 'Disposed';

  return (
    <div className="space-y-8" data-testid="learning-package-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Learning Package
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {learningRecordsPackage?.metadata.title ?? 'Learning Package'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {learningRecordsPackage !== null
              ? `${learningRecordsPackage.id} · v${learningRecordsPackage.version} · ${learningRecordsPackage.metadata.status}`
              : 'Správa Learning Record referencí — odděleno od BLD-15 Learning Package.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Package uchovává reference, ne kopie. Nevytváří Patterny, heuristiky
            ani AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Create Package
          </button>
          <button
            type="button"
            onClick={onAddRecord}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Add Record Ref
          </button>
          <button
            type="button"
            onClick={onRemoveLastRecord}
            disabled={
              !canMutate ||
              (learningRecordsPackage?.records.length ?? 0) === 0
            }
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Remove Last Ref
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={!canMutate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Publish
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={!canMutate}
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

      <section aria-labelledby="lpm-package-heading">
        <h3
          id="lpm-package-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Package
        </h3>
        {learningRecordsPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Create Package. Volitelně nejdřív Pipeline → Transform.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoTile label="Name" value={learningRecordsPackage.name} />
            <InfoTile label="Version" value={learningRecordsPackage.version} />
            <InfoTile
              label="Status"
              value={learningRecordsPackage.metadata.status}
            />
            <InfoTile
              label="Records"
              value={`${learningRecordsPackage.records.length}`}
            />
          </ul>
        )}
      </section>

      <section aria-labelledby="lpm-records-heading">
        <h3
          id="lpm-records-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Records
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          LearningRecordReference — reference only.
        </p>
        {learningRecordsPackage === null ||
        learningRecordsPackage.records.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádné reference — Add Record Ref.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {learningRecordsPackage.records.map((ref) => (
              <li
                key={ref.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {ref.recordId}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {ref.source} · {ref.metadata.note}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="lpm-versions-heading">
        <h3
          id="lpm-versions-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Versions
        </h3>
        {learningRecordsPackage === null ? (
          <p className="mt-3 text-sm text-builder-muted">Žádná historie verzí.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...learningRecordsPackage.versions].reverse().map((version) => (
              <li
                key={`${version.version}-${version.createdAt}`}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    v{version.version}
                  </p>
                  <span className="text-[12px] text-builder-muted">
                    {version.author}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {version.changes.join('; ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="lpm-index-heading">
        <h3
          id="lpm-index-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Index
        </h3>
        <p className="mt-3 text-sm text-builder-muted">
          Indexed entries: {indexCount}
        </p>
      </section>

      <section aria-labelledby="lpm-validation-heading">
        <h3
          id="lpm-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validation
        </h3>
        {learningRecordsPackage?.validation == null ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nevalidováno.
          </p>
        ) : (
          <div className="mt-3 rounded-[12px] border border-[#DDE5EF] px-4 py-3">
            <p className="text-sm font-semibold text-builder-ink">
              {learningRecordsPackage.validation.valid ? 'Valid' : 'Invalid'}
            </p>
            {learningRecordsPackage.validation.issues.length === 0 ? (
              <p className="mt-2 text-sm text-builder-muted">Bez problémů.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {learningRecordsPackage.validation.issues.map((issue) => (
                  <li key={issue.code} className="text-sm text-builder-muted">
                    [{issue.severity}] {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="lpm-events-heading">
        <h3
          id="lpm-events-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Package Events
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
