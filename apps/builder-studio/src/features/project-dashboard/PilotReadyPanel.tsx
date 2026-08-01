import { useMemo } from 'react';

import {
  buildPilotReadyReport,
  usePlatformSession,
} from '@embed-engine/platform-access';

/**
 * EPIC-BX-15 — Builder production readiness: Pilot Ready YES | Missing …
 */
export function PilotReadyPanel() {
  const { session } = usePlatformSession();
  const report = useMemo(() => buildPilotReadyReport(session), [session]);

  return (
    <section
      className="mt-5 rounded-[12px] border border-[#E3E3E3] bg-builder-canvas px-3 py-3"
      data-testid="pilot-ready-panel"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Production Readiness
      </p>
      <h3 className="mt-1 text-sm font-semibold text-builder-ink">
        Pilot Ready
      </h3>
      {report.ready ? (
        <p className="mt-2 text-sm font-bold text-builder-success">YES</p>
      ) : (
        <ul className="mt-2 list-none space-y-1 p-0 text-[12px] text-builder-draft">
          {report.missingLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      )}
      <ul className="mt-3 list-none space-y-1 border-t border-[#E3E3E3] pt-3 p-0 text-[11px] text-builder-muted">
        {report.checks.map((check) => (
          <li key={check.id} className="flex justify-between gap-2">
            <span>{check.label}</span>
            <span className={check.ok ? 'text-builder-success' : 'text-builder-draft'}>
              {check.ok ? 'OK' : '—'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
