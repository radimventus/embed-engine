import type {
  ArtifactDependencyEvent,
  ArtifactDependencyPackage,
} from '../../model';

type ArtifactDependenciesOverviewProps = {
  readonly dependencyPackage: ArtifactDependencyPackage | null;
  readonly events: readonly ArtifactDependencyEvent[];
  readonly indexCount: number;
  readonly onRegister: () => void;
  readonly onRemove: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly message: string | null;
};

export function ArtifactDependenciesOverview({
  dependencyPackage,
  events,
  indexCount,
  onRegister,
  onRemove,
  onValidate,
  onDispose,
  message,
}: ArtifactDependenciesOverviewProps) {
  return (
    <div className="space-y-8" data-testid="artifact-dependencies-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Artifact Dependencies
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {dependencyPackage?.metadata.title ?? 'Artifact Dependency Registry'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {dependencyPackage !== null
              ? `${dependencyPackage.id} · v${dependencyPackage.version} · ${dependencyPackage.metadata.status}`
              : 'Registry vztahů mezi platformními artefakty.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Registry pouze eviduje a validuje vazby, nic automaticky neřeší.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
          >
            Register Dependency
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={dependencyPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={dependencyPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={dependencyPackage === null}
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

      <section aria-labelledby="artifact-dependencies-summary">
        <h3
          id="artifact-dependencies-summary"
          className="text-base font-semibold text-builder-ink"
        >
          Source · Target · Dependency Type · Status
        </h3>
        {dependencyPackage === null || dependencyPackage.dependencies.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Zatím nejsou registrovány žádné závislosti.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {dependencyPackage.dependencies.map((dependency) => (
              <li
                key={dependency.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-builder-ink">
                  {dependency.sourceArtifactId} {'->'} {dependency.targetArtifactId}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {dependency.dependencyType} · {dependency.status}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {dependency.metadata.notes}
                </p>
              </li>
            ))}
          </ul>
        )}
        {dependencyPackage !== null ? (
          <p className="mt-3 text-[13px] text-builder-muted">
            dependencies: {dependencyPackage.dependencies.length} · index:{' '}
            {indexCount}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="artifact-dependencies-events">
        <h3
          id="artifact-dependencies-events"
          className="text-base font-semibold text-builder-ink"
        >
          Artifact Dependency Events
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
