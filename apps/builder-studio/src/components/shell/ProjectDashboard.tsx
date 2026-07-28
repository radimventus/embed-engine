import type {
  BuilderProjectManifest,
  LifecycleStatus,
  ReadinessReport,
  TimelineEntry,
  VersionInfo,
} from '../../model';

type ProjectDashboardProps = {
  readonly projectName: string;
  readonly manifest: BuilderProjectManifest;
  readonly versions: VersionInfo;
  readonly readiness: ReadinessReport;
  readonly timeline: readonly TimelineEntry[];
  readonly metadataLine: string;
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
  }).format(date);
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function lifecycleBadge(status: LifecycleStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'Published':
      return {
        label: 'Published',
        className:
          'border-builder-successBorder bg-builder-successBg text-builder-success',
      };
    case 'Archived':
      return {
        label: 'Archived',
        className: 'border-builder-line bg-builder-hover text-builder-muted',
      };
    case 'Built':
    case 'ReadyForPublish':
      return {
        label: status,
        className: 'border-builder-panelBorder bg-builder-panel text-builder-navy',
      };
    case 'ReadyForBuild':
      return {
        label: status,
        className:
          'border-builder-draftBorder bg-builder-draftBg text-builder-draft',
      };
    default:
      return {
        label: 'Draft',
        className:
          'border-builder-draftBorder bg-builder-draftBg text-builder-draft',
      };
  }
}

/**
 * Project Dashboard in Workspace Header (EPIC-BLD-06).
 * Presentation only — data from application services.
 */
export function ProjectDashboard({
  projectName,
  manifest,
  versions,
  readiness,
  timeline,
  metadataLine,
}: ProjectDashboardProps) {
  const badge = lifecycleBadge(manifest.status);

  return (
    <div className="mb-8">
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <h2 className="text-[34px] font-semibold leading-tight">{projectName}</h2>
        <span
          className={`inline-block rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <p className="mb-4 text-sm text-builder-muted">{metadataLine}</p>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Build Version" value={versions.build ?? '—'} />
        <Metric label="Publish Version" value={versions.publish ?? '—'} />
        <Metric label="Runtime Version" value={versions.runtime ?? '—'} />
        <Metric
          label="Poslední změna"
          value={formatDateTime(manifest.updatedAt)}
        />
      </div>

      <div className="mb-4 rounded-[12px] border border-builder-line bg-white px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-builder-ink">
            Připravenost projektu
          </span>
          <span className="text-sm font-bold text-builder-navy">
            {readiness.overallPercent} %
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-builder-muted md:grid-cols-5">
          <span>Média {readiness.mediaPercent}%</span>
          <span>Dispozice {readiness.layoutPercent}%</span>
          <span>Znalosti {readiness.knowledgePercent}%</span>
          <span>Build {readiness.buildPercent}%</span>
          <span>Publish {readiness.publishPercent}%</span>
        </div>
        {readiness.recommendations.length > 0 ? (
          <p className="mt-2 text-xs text-builder-muted">
            {readiness.recommendations[0]}
          </p>
        ) : null}
      </div>

      {timeline.length > 0 ? (
        <div className="rounded-[12px] border border-builder-line bg-builder-section px-4 py-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[#7D8796]">
            Timeline (relace)
          </div>
          <ul className="space-y-1.5">
            {timeline.slice(0, 6).map((entry) => (
              <li
                key={entry.entryId}
                className="flex items-center gap-3 text-sm text-builder-ink"
              >
                <span className="w-12 shrink-0 text-xs text-builder-muted">
                  {formatTime(entry.at)}
                </span>
                <span>{entry.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[12px] border border-builder-line bg-white px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.6px] text-builder-muted">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-builder-ink">
        {value}
      </div>
    </div>
  );
}
