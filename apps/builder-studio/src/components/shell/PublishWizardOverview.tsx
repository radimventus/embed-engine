import { useMemo, useState } from 'react';
import type {
  DashboardValidationReport,
  PublicationSession,
  PublishSummary,
  PublishWizardEvent,
  PublishedArtifact,
} from '../../model';

type PublishWizardOverviewProps = {
  readonly session: PublicationSession | null;
  readonly summary: PublishSummary | null;
  readonly artifact: PublishedArtifact | null;
  readonly validationReport: DashboardValidationReport | null;
  readonly events: readonly PublishWizardEvent[];
  readonly historyCount: number;
  readonly message: string | null;
  readonly canPublish: boolean;
  readonly onStart: () => void;
  readonly onLoadValidation: () => void;
  readonly onPrepare: () => void;
  readonly onPublish: () => void;
  readonly onCopyEmbed: () => void;
  readonly onOpenPreview: () => void;
};

const STEPS = [
  { id: 'validation', label: '1 · Validation' },
  { id: 'summary', label: '2 · Summary' },
  { id: 'publish', label: '3 · Publish' },
  { id: 'success', label: '4 · Success' },
] as const;

export function PublishWizardOverview({
  session,
  summary,
  artifact,
  validationReport,
  events,
  historyCount,
  message,
  canPublish,
  onStart,
  onLoadValidation,
  onPrepare,
  onPublish,
  onCopyEmbed,
  onOpenPreview,
}: PublishWizardOverviewProps) {
  const [copied, setCopied] = useState(false);
  const step = session?.metadata.step ?? 'validation';

  const blocked = useMemo(
    () =>
      (validationReport?.checks ?? []).filter(
        (check) => check.status === 'BLOCKED',
      ),
    [validationReport],
  );
  const warnings = useMemo(
    () =>
      (validationReport?.checks ?? []).filter(
        (check) => check.status === 'WARNING',
      ),
    [validationReport],
  );

  return (
    <div className="space-y-8" data-testid="publish-wizard-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Publish Wizard
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {session?.metadata.title ?? 'Publish'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            Orchestrace publikace — Validation Dashboard + Export Certification +
            Manifest. Bez vlastní validační logiky.
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
        >
          Start Publish
        </button>
      </div>

      {message !== null ? (
        <p className="rounded-[10px] border border-[#DDE5EF] px-4 py-3 text-sm text-builder-muted">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {STEPS.map((item) => (
          <span
            key={item.id}
            className={`rounded-full border px-3 py-1 text-[12px] font-medium ${
              step === item.id
                ? 'border-builder-navy bg-[#F3F7FC] text-builder-navy'
                : 'border-[#DDE5EF] text-builder-muted'
            }`}
          >
            {item.label}
          </span>
        ))}
      </div>

      <p className="text-[13px] text-builder-muted">
        session: {session?.status ?? '—'} · history: {historyCount}
      </p>

      {step === 'validation' || session === null ? (
        <section className="space-y-4" aria-labelledby="pw-validation">
          <h3
            id="pw-validation"
            className="text-base font-semibold text-builder-ink"
          >
            Step 1 — Validation
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoTile
              label="Ready Score"
              value={
                validationReport !== null
                  ? `${validationReport.readinessScore} %`
                  : '—'
              }
            />
            <InfoTile
              label="Overall Status"
              value={validationReport?.overallStatus ?? '—'}
            />
            <InfoTile
              label="Report"
              value={validationReport?.id ?? 'Evaluate Validation first'}
            />
          </div>
          <CheckList title="Blocking Issues" items={blocked.map((c) => c.title)} />
          <CheckList title="Warnings" items={warnings.map((c) => c.title)} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={session === null}
              onClick={onLoadValidation}
              className="rounded-[10px] border border-builder-navy px-3 py-2 text-sm font-medium text-builder-navy disabled:opacity-40"
            >
              Load Validation
            </button>
          </div>
          {!canPublish ? (
            <p className="text-sm text-builder-muted">
              Publish disabled — Validation Dashboard musí být READY a Export
              Certification musí existovat.
            </p>
          ) : null}
        </section>
      ) : null}

      {session !== null && (step === 'summary' || step === 'publish') ? (
        <section className="space-y-4" aria-labelledby="pw-summary">
          <h3
            id="pw-summary"
            className="text-base font-semibold text-builder-ink"
          >
            Step 2 — Summary
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <InfoTile label="Project" value={summary?.projectTitle ?? session.projectId} />
            <InfoTile
              label="Assets"
              value={String(summary?.assetCount ?? '—')}
            />
            <InfoTile
              label="Metadata"
              value={summary?.metadataSlug ?? '—'}
            />
            <InfoTile label="Manifest" value={summary?.manifestId ?? '—'} />
            <InfoTile
              label="Certification"
              value={summary?.certificationId ?? '—'}
            />
            <InfoTile label="Version" value={summary?.version ?? '—'} />
          </div>
          {step === 'summary' ? (
            <button
              type="button"
              onClick={onPrepare}
              disabled={!canPublish}
              className="rounded-[10px] border border-builder-navy px-3 py-2 text-sm font-medium text-builder-navy disabled:opacity-40"
            >
              Prepare Publication
            </button>
          ) : null}
        </section>
      ) : null}

      {session !== null && step === 'publish' ? (
        <section className="space-y-4" aria-labelledby="pw-publish">
          <h3
            id="pw-publish"
            className="text-base font-semibold text-builder-ink"
          >
            Step 3 — Publish
          </h3>
          <button
            type="button"
            onClick={onPublish}
            disabled={!canPublish || session.status !== 'READY'}
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Publish
          </button>
        </section>
      ) : null}

      {step === 'success' && artifact !== null ? (
        <section className="space-y-4" aria-labelledby="pw-success">
          <h3
            id="pw-success"
            className="text-base font-semibold text-builder-ink"
          >
            Step 4 — Success
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <InfoTile label="Publication ID" value={artifact.id} />
            <InfoTile label="Version" value={artifact.version} />
            <InfoTile label="Embed ID" value={artifact.embedId} />
            <InfoTile label="Manifest ID" value={artifact.manifestId} />
            <InfoTile
              label="Certification ID"
              value={artifact.certificationId}
            />
          </div>
          <label className="block text-[13px] text-builder-muted">
            Embed Code
            <textarea
              readOnly
              value={artifact.metadata.embedCode}
              className="mt-1 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 font-mono text-sm text-builder-ink"
              rows={3}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onCopyEmbed();
                setCopied(true);
              }}
              className="rounded-[10px] border border-builder-navy px-3 py-2 text-sm font-medium text-builder-navy"
            >
              {copied ? 'Copied' : 'Copy Embed'}
            </button>
            <button
              type="button"
              onClick={onOpenPreview}
              className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm font-medium"
            >
              Open Preview
            </button>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="pw-events">
        <h3 id="pw-events" className="text-base font-semibold text-builder-ink">
          Publish Events
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

function InfoTile({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#DDE5EF] px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-builder-muted">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-builder-ink">
        {value}
      </p>
    </div>
  );
}

function CheckList({
  title,
  items,
}: {
  readonly title: string;
  readonly items: readonly string[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-builder-ink">
        {title} · {items.length}
      </h4>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-builder-muted">Žádné položky.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-[8px] border border-[#DDE5EF] px-3 py-2 text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
