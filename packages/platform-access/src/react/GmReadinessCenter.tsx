import { useMemo } from 'react';

import { buildGmReadinessReport } from '../gm/buildGmReadinessReport';
import type {
  GmChecklistState,
  GmVerdict,
} from '../gm/gmTypes';
import { usePlatformSession } from './SessionProvider';

function verdictClass(verdict: GmVerdict | GmChecklistState): string {
  if (verdict === 'PASS') return 'platform-gm__badge--pass';
  if (verdict === 'WARNING' || verdict === 'TODO') return 'platform-gm__badge--warn';
  return 'platform-gm__badge--fail';
}

/**
 * EPIC-BX-16 — GM Readiness & Operations Center (aggregation UI).
 */
export function GmReadinessCenter() {
  const { session } = usePlatformSession();
  const report = useMemo(() => buildGmReadinessReport(session), [session]);

  return (
    <section
      className="platform-gm"
      data-testid="gm-readiness-center"
      aria-label="GM Readiness"
    >
      <p className="platform-access__demos-title">GM Readiness</p>
      <p className="platform-access__lead">
        Operační centrum připravenosti platformy — agregace existujících
        signálů, bez nových backend služeb.
      </p>

      <div className="platform-gm__executive">
        <p className="platform-gm__executive-label">GM Readiness</p>
        <p className="platform-gm__executive-score">
          {report.executive.scorePercent} %
        </p>
        <p className="platform-gm__executive-stage">
          {report.executive.stage}
        </p>
        <p className="platform-access__lead">
          {report.executive.passCount} PASS · {report.executive.warningCount}{' '}
          WARNING · {report.executive.failCount} FAIL
        </p>
      </div>

      <div className="platform-gm__grid">
        <div className="platform-gm__panel">
          <p className="platform-access__demos-title">Readiness Domains</p>
          <ul className="platform-gm__list">
            {report.domains.map((domain) => (
              <li key={domain.id} className="platform-gm__row">
                <span className="platform-gm__row-label">{domain.label}</span>
                <span
                  className={`platform-gm__badge ${verdictClass(domain.verdict)}`}
                >
                  {domain.verdict}
                </span>
                <span className="platform-gm__row-detail">{domain.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="platform-gm__panel">
          <p className="platform-access__demos-title">Operational Health</p>
          <ul className="platform-gm__list">
            {report.health.items.map((item) => (
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
          <p className="platform-access__demos-title">Pilot Status</p>
          <p className="platform-access__lead">
            aktivní {report.pilots.counts.aktivni} · onboarding{' '}
            {report.pilots.counts.onboarding} · čeká na data{' '}
            {report.pilots.counts['ceka-na-data']} · produkce{' '}
            {report.pilots.counts.produkce}
          </p>
          <ul className="platform-gm__list">
            {report.pilots.firms.map((firm) => (
              <li key={firm.tenantId} className="platform-gm__row">
                <span className="platform-gm__row-label">
                  {firm.companyName}
                </span>
                <span className="platform-gm__badge platform-gm__badge--info">
                  {firm.lifecycleLabel}
                </span>
                <span className="platform-gm__row-detail">{firm.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="platform-gm__panel">
          <p className="platform-access__demos-title">GM Checklist</p>
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

        <div className="platform-gm__panel platform-gm__panel--wide">
          <p className="platform-access__demos-title">Engineering Debt</p>
          <ul className="platform-gm__list">
            {report.debt.map((item) => (
              <li key={item.id} className="platform-gm__debt">
                <span className="platform-gm__debt-area">{item.area}</span>
                <span className="platform-gm__row-label">{item.title}</span>
                <span className="platform-gm__row-detail">{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
