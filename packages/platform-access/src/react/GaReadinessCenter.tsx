import { useMemo } from 'react';

import { buildGaReadinessReport } from '../ga/buildGaReadinessReport';
import type { GaChecklistState, GaVerdict } from '../ga/gaTypes';
import { usePlatformSession } from './SessionProvider';

function verdictClass(verdict: GaVerdict | GaChecklistState): string {
  if (verdict === 'PASS') return 'platform-gm__badge--pass';
  if (verdict === 'WARNING' || verdict === 'TODO') {
    return 'platform-gm__badge--warn';
  }
  return 'platform-gm__badge--fail';
}

/**
 * EPIC-BX-18 — GA Readiness Center (final readiness layer over GM signals).
 */
export function GaReadinessCenter() {
  const { session } = usePlatformSession();
  const report = useMemo(() => buildGaReadinessReport(session), [session]);
  const goClass =
    report.goNoGo.decision === 'GO'
      ? 'platform-gm__badge--pass'
      : report.goNoGo.decision === 'GO WITH CONDITIONS'
        ? 'platform-gm__badge--warn'
        : 'platform-gm__badge--fail';

  return (
    <section
      className="platform-gm platform-ga"
      data-testid="ga-readiness-center"
      aria-label="GA Readiness"
    >
      <p className="platform-access__demos-title">GA Readiness</p>
      <p className="platform-access__lead">
        Je CONIS připraven na veřejné spuštění? Agregace existujících GM /
        Capability / Pilot signálů — bez nového zdroje pravdy.
      </p>

      <div className="platform-gm__executive">
        <p className="platform-gm__executive-label">Overall Readiness</p>
        <p className="platform-gm__executive-score">
          {report.dashboard.overallReadinessPercent} %
        </p>
        <p className="platform-gm__executive-stage">
          {report.dashboard.overallLabel}
        </p>
        <ul className="platform-access__list platform-access__lead">
          <li>Pilot Status · {report.dashboard.pilotStatus}</li>
          <li>Production Status · {report.dashboard.productionStatus}</li>
          <li>Next Action · {report.dashboard.nextAction}</li>
        </ul>
        {report.dashboard.blockingIssues.length > 0 && (
          <ul className="platform-gm__list">
            {report.dashboard.blockingIssues.map((issue) => (
              <li key={issue} className="platform-gm__row-detail">
                Blocking · {issue}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="platform-gm__grid">
        <div className="platform-gm__panel">
          <p className="platform-access__demos-title">Go / No-Go Board</p>
          <p className={`platform-gm__executive-stage ${goClass}`} style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 8 }}>
            {report.goNoGo.decision}
          </p>
          {report.goNoGo.blockers.length > 0 && (
            <ul className="platform-gm__list">
              {report.goNoGo.blockers.map((item) => (
                <li key={item} className="platform-gm__row">
                  <span className="platform-gm__row-detail">{item}</span>
                </li>
              ))}
            </ul>
          )}
          {report.goNoGo.blockers.length === 0 &&
            report.goNoGo.conditions.length > 0 && (
              <ul className="platform-gm__list">
                {report.goNoGo.conditions.map((item) => (
                  <li key={item} className="platform-gm__row">
                    <span className="platform-gm__badge platform-gm__badge--warn">
                      Condition
                    </span>
                    <span className="platform-gm__row-detail">{item}</span>
                  </li>
                ))}
              </ul>
            )}
        </div>

        <div className="platform-gm__panel">
          <p className="platform-access__demos-title">Executive Report</p>
          <p className="platform-gm__row-label">
            {report.executive.currentReadiness}
          </p>
          <p className="platform-gm__row-detail" style={{ marginTop: 8 }}>
            {report.executive.recommendation}
          </p>
          <p className="platform-gm__row-detail" style={{ marginTop: 8 }}>
            {report.executive.estimatedStatus}
          </p>
          {report.executive.remainingBlockers.length > 0 && (
            <ul className="platform-gm__list">
              {report.executive.remainingBlockers.slice(0, 5).map((item) => (
                <li key={item} className="platform-gm__row-detail">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="platform-gm__panel">
          <p className="platform-access__demos-title">Readiness Matrix</p>
          <ul className="platform-gm__list">
            {report.matrix.map((row) => (
              <li key={row.id} className="platform-gm__row">
                <span className="platform-gm__row-label">{row.label}</span>
                <span
                  className={`platform-gm__badge ${verdictClass(row.verdict)}`}
                >
                  {row.verdict}
                </span>
                <span className="platform-gm__row-detail">{row.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="platform-gm__panel">
          <p className="platform-access__demos-title">Operational Health</p>
          <ul className="platform-gm__list">
            {report.operationalHealth.map((item) => (
              <li key={item.id} className="platform-gm__row">
                <span className="platform-gm__row-label">{item.label}</span>
                <span
                  className={`platform-gm__badge ${verdictClass(item.verdict)}`}
                >
                  {item.verdict}
                </span>
                <span className="platform-gm__row-detail">{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="platform-gm__panel">
          <p className="platform-access__demos-title">Release Certification</p>
          <ul className="platform-gm__list">
            <li className="platform-gm__row">
              <span className="platform-gm__row-label">Certification Status</span>
              <span
                className={`platform-gm__badge ${verdictClass(report.certification.certificationStatus)}`}
              >
                {report.certification.certificationStatus}
              </span>
            </li>
            <li className="platform-gm__row-detail">
              Validation · {report.certification.validationSummary}
            </li>
            <li className="platform-gm__row-detail">
              Runtime · {report.certification.runtimeSummary}
            </li>
            <li className="platform-gm__row-detail">
              Publish · {report.certification.publishSummary}
            </li>
            <li className="platform-gm__row-detail">
              Fingerprint · {report.certification.fingerprint}
            </li>
            <li className="platform-gm__row-detail">
              Approval · {report.certification.approval}
            </li>
          </ul>
        </div>

        <div className="platform-gm__panel">
          <p className="platform-access__demos-title">Production Checklist</p>
          <ul className="platform-gm__list">
            {report.checklist.map((item) => (
              <li key={item.id} className="platform-gm__row">
                <span className="platform-gm__row-label">{item.label}</span>
                <span
                  className={`platform-gm__badge ${verdictClass(item.state)}`}
                >
                  {item.state}
                </span>
                <span className="platform-gm__row-detail">{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
