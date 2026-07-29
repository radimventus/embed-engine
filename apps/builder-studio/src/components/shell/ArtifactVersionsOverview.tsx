import type {
  ArtifactVersionEvent,
  ArtifactVersionPackage,
} from '../../model';

type ArtifactVersionsOverviewProps = {
  readonly versionPackage: ArtifactVersionPackage | null;
  readonly events: readonly ArtifactVersionEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onActivate: () => void;
  readonly onDeprecate: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function ArtifactVersionsOverview({
  versionPackage,
  events,
  indexCount,
  onRegister,
  onActivate,
  onDeprecate,
  onValidate,
  onDispose,
  message,
}: ArtifactVersionsOverviewProps) {
  const canAct =
    versionPackage !== null && versionPackage.metadata.status !== 'Disposed';
  const activeVersion =
    versionPackage?.artifactVersions.find((item) => item.metadata.active) ?? null;

  return (
    <div className="space-y-8" data-testid="artifact-versions-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Artifact Versions
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {versionPackage?.metadata.title ?? 'Artifact Version Manager'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {versionPackage !== null
              ? `${versionPackage.id} · v${versionPackage.version} · ${versionPackage.metadata.status}`
              : 'Centrální registr verzí artefaktů platformy.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Manager eviduje stav verzí, ale nemění obsah artefaktů.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Version
          </button>
          <button
            type="button"
            onClick={onActivate}
            disabled={!canAct}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Activate
          </button>
          <button
            type="button"
            onClick={onDeprecate}
            disabled={!canAct}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Deprecate
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

      <section aria-labelledby="artifact-versions-summary">
        <h3
          id="artifact-versions-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Artifact · Current Version · Status · Created · Active
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-5">
          <InfoTile
            label="Artifact"
            value={activeVersion?.artifactId ?? versionPackage?.artifactVersions.at(-1)?.artifactId ?? '—'}
          />
          <InfoTile
            label="Current Version"
            value={activeVersion?.version ?? versionPackage?.artifactVersions.at(-1)?.version ?? '—'}
          />
          <InfoTile
            label="Status"
            value={activeVersion?.status ?? versionPackage?.artifactVersions.at(-1)?.status ?? '—'}
          />
          <InfoTile
            label="Created"
            value={activeVersion?.createdAt.slice(0, 10) ?? '—'}
          />
          <InfoTile label="Active" value={activeVersion !== null ? 'Yes' : 'No'} />
        </ul>
        {versionPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            versions: {versionPackage.artifactVersions.length} · index: {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="artifact-versions-list">
        <h3
          id="artifact-versions-list"
          className="text-base font-semibold text-builder-ink"
        >
          Registered Versions
        </h3>
        {versionPackage === null || versionPackage.artifactVersions.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nejsou registrovány žádné verze.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {versionPackage.artifactVersions.map((version) => (
              <li
                key={version.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {version.artifactId} · {version.version}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {version.status} · {version.metadata.artifactType}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {version.metadata.notes}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="artifact-versions-events">
        <h3
          id="artifact-versions-events"
          className="text-base font-semibold text-builder-ink"
        >
          Artifact Version Events
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
