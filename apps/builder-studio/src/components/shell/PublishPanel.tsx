import type {
  BuildResult,
  PreviewEvent,
  PreviewSnapshot,
  ProjectPipelineSnapshot,
  PublishResult,
  ValidationEvent,
  ValidationReport,
} from '../../model';
import { isPublishAllowedByQualityGate } from '../../services';
import { ValidationDashboard } from './ValidationDashboard';

type PublishPanelProps = {
  readonly pipeline: ProjectPipelineSnapshot | null;
  readonly latestBuild: BuildResult | null;
  readonly buildHistory: readonly BuildResult[];
  readonly latestPublish: PublishResult | null;
  readonly publishHistory: readonly PublishResult[];
  readonly preview: PreviewSnapshot;
  readonly previewHistory: readonly PreviewEvent[];
  readonly validationReport: ValidationReport | null;
  readonly validationHistory: readonly ValidationReport[];
  readonly validationEvents: readonly ValidationEvent[];
  readonly onValidateProject: () => void;
  readonly onBuildProject: () => void;
  readonly onPublishPackage: () => void;
  readonly onOpenPreview: () => void;
  readonly onRefreshPreview: () => void;
  readonly onClosePreview: () => void;
};

function StatusRow({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone: 'success' | 'navy' | 'draft' | 'muted';
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-builder-successBg text-builder-success'
      : tone === 'navy'
        ? 'bg-builder-panel text-builder-navy'
        : tone === 'draft'
          ? 'bg-builder-draftBg text-builder-draft'
          : 'bg-builder-hover text-builder-muted';

  return (
    <div className="flex items-center justify-between border-b border-builder-divider py-4">
      <span className="text-sm font-medium text-builder-ink">{label}</span>
      <span
        className={`rounded-xl px-2.5 py-1 text-sm font-bold ${toneClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function percentTone(value: number): 'success' | 'navy' | 'draft' {
  if (value >= 100) {
    return 'success';
  }
  if (value >= 50) {
    return 'navy';
  }
  return 'draft';
}

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

/**
 * Readiness + Build + Publish Panel (EPIC-BLD-04).
 * Publish consumes ProjectPackage only via application services.
 */
export function PublishPanel({
  pipeline,
  latestBuild,
  buildHistory,
  latestPublish,
  publishHistory,
  preview,
  previewHistory,
  validationReport,
  validationHistory,
  validationEvents,
  onValidateProject,
  onBuildProject,
  onPublishPackage,
  onOpenPreview,
  onRefreshPreview,
  onClosePreview,
}: PublishPanelProps) {
  if (pipeline === null) {
    return (
      <aside className="h-full overflow-y-auto border-l border-builder-line bg-white p-7">
        <h3 className="mb-8 text-[22px] font-semibold">
          Připravenost projektu
        </h3>
        <p className="text-sm text-builder-muted">
          Vyberte projekt pro zobrazení stavů, Build a Publish.
        </p>
      </aside>
    );
  }

  const canPublish =
    latestBuild !== null &&
    latestBuild.success === true &&
    latestBuild.package.publishable === true &&
    validationReport !== null &&
    isPublishAllowedByQualityGate(validationReport.qualityGate);

  const canOpenPreview =
    latestPublish !== null &&
    latestPublish.success === true &&
    latestPublish.publishedPackage !== null;

  const previewTone =
    preview.state === 'Ready'
      ? 'success'
      : preview.state === 'Error'
        ? 'draft'
        : preview.state === 'Idle'
          ? 'muted'
          : 'navy';

  return (
    <aside className="h-full overflow-y-auto border-l border-builder-line bg-white p-7">
      <h3 className="mb-8 text-[22px] font-semibold">Připravenost projektu</h3>

      <StatusRow
        label="Validation Status"
        value={
          validationReport?.qualityGate ?? pipeline.validationStatus
        }
        tone={
          validationReport === null
            ? 'muted'
            : validationReport.qualityGate === 'Passed'
              ? 'success'
              : validationReport.qualityGate === 'Failed'
                ? 'draft'
                : 'navy'
        }
      />
      <StatusRow
        label="Build Status"
        value={pipeline.buildStatus}
        tone={
          pipeline.buildStatus === 'Ready'
            ? 'success'
            : pipeline.buildStatus === 'Failed'
              ? 'draft'
              : 'muted'
        }
      />
      <StatusRow
        label="Publish Status"
        value={pipeline.publishStatus}
        tone={
          pipeline.publishStatus === 'Ready'
            ? 'success'
            : pipeline.publishStatus === 'Blocked'
              ? 'draft'
              : 'muted'
        }
      />

      <div className="mt-6 border-t border-builder-divider pt-2">
        <StatusRow
          label="Média"
          value={`${pipeline.mediaReadyPercent} %`}
          tone={percentTone(pipeline.mediaReadyPercent)}
        />
        <StatusRow
          label="Dispozice"
          value={`${pipeline.layoutReadyPercent} %`}
          tone={percentTone(pipeline.layoutReadyPercent)}
        />
        <StatusRow
          label="Znalosti"
          value={`${pipeline.knowledgeReadyPercent} %`}
          tone={percentTone(pipeline.knowledgeReadyPercent)}
        />
      </div>

      <ValidationDashboard
        report={validationReport}
        history={validationHistory}
        events={validationEvents}
        onValidateProject={onValidateProject}
      />

      <section className="mt-8 border-t border-builder-divider pt-6">
        <h4 className="mb-4 text-base font-semibold">Build</h4>

        {latestBuild === null ? (
          <p className="mb-4 text-sm text-builder-muted">
            Zatím žádný Build v této relaci.
          </p>
        ) : (
          <div className="mb-4 space-y-0">
            <StatusRow
              label="Poslední Build"
              value={latestBuild.success ? 'Success' : 'With errors'}
              tone={latestBuild.success ? 'success' : 'draft'}
            />
            <StatusRow
              label="Warnings"
              value={String(latestBuild.statistics.warningCount)}
              tone={
                latestBuild.statistics.warningCount > 0 ? 'draft' : 'success'
              }
            />
            <StatusRow
              label="Errors"
              value={String(latestBuild.statistics.errorCount)}
              tone={
                latestBuild.statistics.errorCount > 0 ? 'draft' : 'success'
              }
            />
            <StatusRow
              label="Čas buildu"
              value={formatDateTime(latestBuild.builtAt)}
              tone="navy"
            />
            <StatusRow
              label="Verze manifestu"
              value={latestBuild.manifest.version}
              tone="navy"
            />
            <StatusRow
              label="Publishable"
              value={latestBuild.package.publishable ? 'Yes' : 'No'}
              tone={latestBuild.package.publishable ? 'success' : 'muted'}
            />
          </div>
        )}

        {latestBuild !== null && latestBuild.errors.length > 0 ? (
          <ul className="mb-4 space-y-1 rounded-[10px] bg-builder-draftBg p-3 text-xs text-builder-draft">
            {latestBuild.errors.map((issue) => (
              <li key={issue.code}>{issue.message}</li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={onBuildProject}
          className="w-full rounded-xl bg-builder-navy px-4 py-4 text-[15px] font-semibold text-white transition hover:bg-builder-navyDeep"
        >
          Spustit Build
        </button>

        {buildHistory.length > 0 ? (
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[#7D8796]">
              Build History (relace)
            </div>
            <ul className="space-y-2">
              {buildHistory.slice(0, 5).map((item) => (
                <li
                  key={item.buildId}
                  className="rounded-[10px] bg-builder-hover px-3 py-2 text-xs text-[#5E6C83]"
                >
                  <div className="font-semibold text-builder-ink">
                    v{item.manifest.version} ·{' '}
                    {item.success ? 'OK' : 'Errors'}
                  </div>
                  <div>
                    {item.statistics.errorCount} err ·{' '}
                    {item.statistics.warningCount} warn ·{' '}
                    {formatDateTime(item.builtAt)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-8 border-t border-builder-divider pt-6">
        <h4 className="mb-4 text-base font-semibold">Publish</h4>

        {latestPublish === null ? (
          <p className="mb-4 text-sm text-builder-muted">
            Zatím žádný Publish v této relaci. Publish přijímá pouze
            ProjectPackage.
          </p>
        ) : (
          <div className="mb-4 space-y-0">
            <StatusRow
              label="Poslední Publish"
              value={latestPublish.success ? 'Success' : 'Failed'}
              tone={latestPublish.success ? 'success' : 'draft'}
            />
            <StatusRow
              label="Package Version"
              value={latestPublish.publishManifest?.version ?? '—'}
              tone="navy"
            />
            <StatusRow
              label="Build Version"
              value={latestPublish.buildVersion ?? '—'}
              tone="navy"
            />
            <StatusRow
              label="Publish Time"
              value={formatDateTime(latestPublish.publishedAt)}
              tone="navy"
            />
            <StatusRow
              label="Publish Result"
              value={latestPublish.success ? 'PublishedPackage' : 'Blocked'}
              tone={latestPublish.success ? 'success' : 'draft'}
            />
            <StatusRow
              label="Validation"
              value={
                latestPublish.errors.length === 0
                  ? 'Ready'
                  : `${latestPublish.errors.length} errors`
              }
              tone={latestPublish.errors.length === 0 ? 'success' : 'draft'}
            />
            <StatusRow
              label="Warnings"
              value={String(latestPublish.warnings.length)}
              tone={
                latestPublish.warnings.length > 0 ? 'draft' : 'success'
              }
            />
          </div>
        )}

        {latestPublish !== null && latestPublish.errors.length > 0 ? (
          <ul className="mb-4 space-y-1 rounded-[10px] bg-builder-draftBg p-3 text-xs text-builder-draft">
            {latestPublish.errors.map((issue) => (
              <li key={issue.code}>{issue.message}</li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={onPublishPackage}
          disabled={!canPublish}
          className={`w-full rounded-xl px-4 py-4 text-[15px] font-semibold text-white transition ${
            canPublish
              ? 'bg-builder-navy hover:bg-builder-navyDeep'
              : 'cursor-not-allowed bg-builder-navy opacity-60'
          }`}
          title={
            canPublish
              ? 'Publish aktuálního ProjectPackage'
              : 'Vyžaduje úspěšný Build a Quality Gate (Passed / PassedWithWarnings)'
          }
        >
          Publikovat změny
        </button>

        {publishHistory.length > 0 ? (
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[#7D8796]">
              Publish History (relace)
            </div>
            <ul className="space-y-2">
              {publishHistory.slice(0, 5).map((item) => (
                <li
                  key={item.publishId}
                  className="rounded-[10px] bg-builder-hover px-3 py-2 text-xs text-[#5E6C83]"
                >
                  <div className="font-semibold text-builder-ink">
                    {item.publishManifest?.version
                      ? `v${item.publishManifest.version}`
                      : 'n/a'}{' '}
                    · {item.success ? 'OK' : 'Failed'}
                  </div>
                  <div>
                    {item.errors.length} err · {item.warnings.length} warn ·{' '}
                    {formatDateTime(item.publishedAt)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-8 border-t border-builder-divider pt-6">
        <h4 className="mb-4 text-base font-semibold">Runtime Preview</h4>

        <div className="mb-4 space-y-0">
          <StatusRow
            label="Preview Status"
            value={preview.state}
            tone={previewTone}
          />
          <StatusRow
            label="Runtime Version"
            value={preview.runtimeVersion}
            tone="navy"
          />
          <StatusRow
            label="Loaded Package"
            value={preview.loadedPackageId ?? '—'}
            tone={preview.loadedPackageId !== null ? 'success' : 'muted'}
          />
          <StatusRow
            label="Session"
            value={preview.session?.sessionId ?? '—'}
            tone={preview.session !== null ? 'navy' : 'muted'}
          />
        </div>

        {preview.lastError !== null ? (
          <p className="mb-4 rounded-[10px] bg-builder-draftBg p-3 text-xs text-builder-draft">
            {preview.lastError}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onOpenPreview}
            disabled={!canOpenPreview}
            className={`w-full rounded-xl px-4 py-4 text-[15px] font-semibold text-white transition ${
              canOpenPreview
                ? 'bg-builder-navy hover:bg-builder-navyDeep'
                : 'cursor-not-allowed bg-builder-navy opacity-60'
            }`}
            title={
              canOpenPreview
                ? 'Open Preview z PublishedPackage'
                : 'Nejdříve Build + Publish'
            }
          >
            Open Preview
          </button>
          <button
            type="button"
            onClick={onRefreshPreview}
            disabled={preview.session === null}
            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              preview.session !== null
                ? 'bg-builder-panel text-builder-navy hover:bg-builder-navy hover:text-white'
                : 'cursor-not-allowed bg-builder-soft text-builder-navy opacity-60'
            }`}
          >
            Refresh Preview
          </button>
          <button
            type="button"
            onClick={onClosePreview}
            disabled={preview.session === null}
            className={`w-full rounded-xl border border-builder-line px-4 py-3 text-sm font-semibold transition ${
              preview.session !== null
                ? 'bg-white text-builder-ink hover:bg-builder-hover'
                : 'cursor-not-allowed bg-white text-builder-muted opacity-60'
            }`}
          >
            Close Preview
          </button>
        </div>

        {previewHistory.length > 0 ? (
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[#7D8796]">
              Preview History (relace)
            </div>
            <ul className="space-y-2">
              {previewHistory.slice(0, 5).map((item) => (
                <li
                  key={item.eventId}
                  className="rounded-[10px] bg-builder-hover px-3 py-2 text-xs text-[#5E6C83]"
                >
                  <div className="font-semibold text-builder-ink">
                    {item.type}
                  </div>
                  <div>
                    {item.packageId} · {formatDateTime(item.at)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="mt-5 break-all rounded-[10px] bg-builder-hover p-3.5 text-[13px] text-[#5E6C83]">
        {latestPublish?.publishedPackage?.runtimeEntry ??
          pipeline.localPreviewUrl ??
          '—'}
      </div>

      <div className="mt-[26px]">
        <label className="mb-2.5 block text-sm font-semibold">Embed kód</label>
        <textarea
          readOnly
          value={pipeline.embedSnippet}
          className="h-[120px] w-full resize-none rounded-xl border border-[#DDE5EF] p-3.5 font-mono text-xs text-[#4A5568]"
        />
        <button
          type="button"
          disabled
          className="mt-3.5 w-full cursor-not-allowed rounded-[10px] bg-builder-soft px-4 py-3.5 font-semibold text-builder-navy opacity-60"
          title="Copy Embed / reálný deploy není součástí EPIC-BLD-04"
        >
          Kopírovat Embed
        </button>
      </div>
    </aside>
  );
}
