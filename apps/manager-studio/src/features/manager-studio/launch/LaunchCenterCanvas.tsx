import { useMemo } from 'react';

import { buildLaunchCenterReport } from '@embed-engine/launch-center';
import { usePlatformSession } from '@embed-engine/platform-access';

import { OperationsSurface } from '../operations/OperationsSurface';
import { LAUNCH_SECTION_IDS } from './launchVocabulary';

/**
 * EPIC-BX-23 — Manager projection of Launch Center capability.
 * Aggregates existing readiness — no second readiness model.
 */
export function LaunchCenterCanvas() {
  const { session } = usePlatformSession();
  const report = useMemo(() => buildLaunchCenterReport(session), [session]);

  return (
    <div
      className="w-full max-w-5xl"
      data-studio-shell="launch-center-canvas"
      data-capability="launch-center"
    >
      <OperationsSurface
        id={LAUNCH_SECTION_IDS.executive}
        title="Executive Launch Report"
        description="Current Stage · Remaining Risks · Blocking Items · Recommended Next Action."
      >
        <p className="text-2xl font-semibold text-embed-foreground-primary">
          {report.executive.currentStage}
        </p>
        <p className="mt-2 text-sm text-embed-foreground-primary/70">
          Next · {report.executive.recommendedNextAction}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
          Remaining Risks
        </p>
        <ul className="mt-2 space-y-1">
          {report.executive.remainingRisks.map((item) => (
            <li
              key={item}
              className="text-sm text-embed-foreground-primary/75"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
          Blocking Items
        </p>
        <ul className="mt-2 space-y-1">
          {report.executive.blockingItems.map((item) => (
            <li
              key={item}
              className="text-sm text-embed-foreground-primary/75"
            >
              {item}
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={LAUNCH_SECTION_IDS.dashboard}
        title="Launch Dashboard"
        description="Pilot Progress · GA · Commercial · Technical · Operational Readiness."
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ['Pilot Progress', report.dashboard.pilotProgress],
              ['GA Readiness', report.dashboard.gaReadiness],
              ['Commercial Readiness', report.dashboard.commercialReadiness],
              ['Technical Readiness', report.dashboard.technicalReadiness],
              ['Operational Readiness', report.dashboard.operationalReadiness],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-embed-foreground-primary/50">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-embed-foreground-primary">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </OperationsSurface>

      <OperationsSurface
        id={LAUNCH_SECTION_IDS.checklist}
        title="Launch Checklist"
        description="Platform · Studios · Runtime · Publish · Intelligence · CS · Ops · Commercial."
      >
        <ul className="space-y-2">
          {report.checklist.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-embed-border-default pb-2 text-sm"
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-xs uppercase tracking-wide text-embed-brand-navy">
                {item.state}
              </span>
              <span className="w-full text-xs text-embed-foreground-primary/55">
                {item.detail}
              </span>
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={LAUNCH_SECTION_IDS.timeline}
        title="Launch Timeline"
        description="Pilot #1–#3 · VR · GA Decision · Public Launch — pouze projekce."
      >
        <ol className="space-y-3">
          {report.timeline.map((stage) => (
            <li
              key={stage.id}
              className="border-b border-embed-border-default pb-3"
            >
              <p className="text-sm font-medium text-embed-foreground-primary">
                {stage.label} · {stage.status}
              </p>
              <p className="mt-1 text-xs text-embed-foreground-primary/60">
                {stage.detail}
              </p>
            </li>
          ))}
        </ol>
      </OperationsSurface>

      <OperationsSurface
        id={LAUNCH_SECTION_IDS.gates}
        title="Pilot Gate · GA Gate"
        description="Výhradně z existujících Pilot Ready a GA Go/No-Go modelů."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-embed-border-default px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-embed-foreground-primary/50">
              {report.pilotGate.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-embed-foreground-primary">
              {report.pilotGate.verdict}
            </p>
            <p className="mt-2 text-xs text-embed-foreground-primary/60">
              {report.pilotGate.detail}
            </p>
          </div>
          <div className="rounded-sm border border-embed-border-default px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-embed-foreground-primary/50">
              {report.gaGate.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-embed-foreground-primary">
              {report.gaGate.verdict}
            </p>
            {report.gaGate.blockers.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-embed-foreground-primary/60">
                {report.gaGate.blockers.map((item) => (
                  <li key={item}>Blocker · {item}</li>
                ))}
              </ul>
            )}
            {report.gaGate.conditions.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-embed-foreground-primary/60">
                {report.gaGate.conditions.map((item) => (
                  <li key={item}>Condition · {item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </OperationsSurface>
    </div>
  );
}
