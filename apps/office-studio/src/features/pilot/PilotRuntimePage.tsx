import { useMemo, useState } from 'react';

import {
  PlatformCard,
  PlatformEmptyState,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import {
  getLastPilotRuntimeSummary,
  runPilotRuntime,
  validatePilotRuntime,
} from '../../office/officePilotRuntime';
import type { PilotRuntimeSummary } from '../../office/officePilotRuntimeModel';

type PilotRuntimePageProps = {
  readonly onOpenPartner?: (partnerId: string) => void;
};

/**
 * OF-06 — Pilot Runtime (end-to-end Office MVP validation).
 */
export function PilotRuntimePage({ onOpenPartner }: PilotRuntimePageProps) {
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => {
    void revision;
    return getLastPilotRuntimeSummary();
  }, [revision]);

  function run() {
    setBusy(true);
    try {
      runPilotRuntime();
      setRevision((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  function revalidate(partnerId: string) {
    validatePilotRuntime(partnerId);
    setRevision((value) => value + 1);
  }

  return (
    <div className="office-pilot" data-testid="office-pilot-runtime">
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">Nastavení</p>
        <h1 className="office-dashboard__title">Pilot Runtime</h1>
        <p className="office-dashboard__lead">
          End-to-end průchod Office Studio MVP bez ručních zásahů — od Lead po
          Pilot Ready.
        </p>
      </header>

      <PlatformCard
        title="Spustit Pilot Runtime"
        description="Lead → Partner → Offer → Documents → Payment → Builder Handoff → Pilot Ready"
      >
        <div className="office-partner-actions">
          <button
            type="button"
            className="platform-btn platform-btn--primary"
            disabled={busy}
            onClick={run}
            data-testid="office-pilot-run"
          >
            {busy ? 'Běží…' : 'Spustit end-to-end'}
          </button>
          {summary !== null ? (
            <button
              type="button"
              className="platform-btn platform-btn--sm"
              onClick={() => revalidate(summary.partnerId)}
            >
              Revalidovat
            </button>
          ) : null}
        </div>
      </PlatformCard>

      {summary === null ? (
        <PlatformEmptyState
          title="Zatím žádný Pilot Runtime běh"
          description="Spusťte end-to-end scénář pro ověření kompletního průchodu."
        />
      ) : (
        <PilotRuntimeSummaryView
          summary={summary}
          onOpenPartner={onOpenPartner}
        />
      )}
    </div>
  );
}

function PilotRuntimeSummaryView({
  summary,
  onOpenPartner,
}: {
  readonly summary: PilotRuntimeSummary;
  readonly onOpenPartner?: (partnerId: string) => void;
}) {
  return (
    <div className="office-pilot__summary">
      <PlatformCard title="Runtime Summary">
        <div className="office-partner-detail__header">
          <div>
            <p className="office-dashboard__eyebrow">Partner</p>
            <h2 className="office-partner-detail__name">
              {summary.partnerName}
            </h2>
            <p className="office-partner-detail__next">{summary.partnerId}</p>
          </div>
          <div className="office-partner-detail__status">
            <PlatformStatusBadge
              tone={summary.pilotReady ? 'pass' : 'warning'}
            >
              {summary.pilotReady ? 'Pilot Ready' : 'Incomplete'}
            </PlatformStatusBadge>
            {onOpenPartner !== undefined ? (
              <button
                type="button"
                className="platform-btn platform-btn--sm"
                onClick={() => onOpenPartner(summary.partnerId)}
              >
                Otevřít partnera
              </button>
            ) : null}
          </div>
        </div>
      </PlatformCard>

      <PlatformCard title="Commercial Journey">
        <ol className="office-activity" aria-label="Pilot journey">
          {summary.steps.map((entry, index) => (
            <li key={entry.id} className="office-activity__item">
              <div className="office-activity__rail" aria-hidden>
                <span className="office-activity__dot" />
                {index < summary.steps.length - 1 ? (
                  <span className="office-activity__line" />
                ) : null}
              </div>
              <div className="office-activity__body">
                <p className="office-activity__label">
                  {entry.label}{' '}
                  <PlatformStatusBadge
                    tone={entry.passed ? 'pass' : 'fail'}
                  >
                    {entry.passed ? 'PASS' : 'FAIL'}
                  </PlatformStatusBadge>
                </p>
                <p className="office-activity__detail">{entry.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </PlatformCard>

      <div className="office-partner-detail__cards">
        <PlatformCard title="Runtime Validation">
          <ul className="office-list">
            {summary.runtimeChecks.map((entry) => (
              <li key={entry.id} className="office-list__item">
                <div>
                  <p className="office-list__title">{entry.label}</p>
                  <p className="office-list__meta">{entry.detail}</p>
                </div>
                <PlatformStatusBadge tone={entry.passed ? 'pass' : 'fail'}>
                  {entry.passed ? 'PASS' : 'FAIL'}
                </PlatformStatusBadge>
              </li>
            ))}
          </ul>
        </PlatformCard>

        <PlatformCard title="Timeline Validation">
          <ul className="office-list">
            {summary.timelineChecks.map((entry) => (
              <li key={entry.id} className="office-list__item">
                <div>
                  <p className="office-list__title">{entry.label}</p>
                  <p className="office-list__meta">{entry.detail}</p>
                </div>
                <PlatformStatusBadge tone={entry.passed ? 'pass' : 'fail'}>
                  {entry.passed ? 'PASS' : 'FAIL'}
                </PlatformStatusBadge>
              </li>
            ))}
          </ul>
          {summary.missingEventKinds.length > 0 ? (
            <p className="office-partners__empty">
              Chybí: {summary.missingEventKinds.join(', ')}
            </p>
          ) : (
            <p className="office-dashboard__hint">Timeline je kompletní.</p>
          )}
        </PlatformCard>
      </div>
    </div>
  );
}
