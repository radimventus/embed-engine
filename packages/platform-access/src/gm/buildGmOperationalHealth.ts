/**
 * EPIC-BX-16 — Operational health aggregation (no new backends).
 */

import type { PlatformSession } from '../domain/types';
import {
  buildPilotDiagnostics,
  readLastPublish,
} from '../pilot/pilotDiagnostics';
import type { GmHealthItem, GmOperationalHealth, GmVerdict } from './gmTypes';

function fromPilotStatus(
  status: 'ready' | 'degraded' | 'missing' | 'unknown',
): GmVerdict {
  if (status === 'ready') return 'PASS';
  if (status === 'degraded' || status === 'unknown') return 'WARNING';
  return 'FAIL';
}

export function buildGmOperationalHealth(
  session: PlatformSession | null,
): GmOperationalHealth {
  const diagnostics = buildPilotDiagnostics(session);
  const lastPublish = readLastPublish();

  const items: GmHealthItem[] = [
    {
      id: 'runtime',
      label: 'Runtime Health',
      verdict: fromPilotStatus(diagnostics.runtimeStatus),
      detail:
        diagnostics.runtimeStatus === 'ready'
          ? 'Project bootstrap available'
          : 'Missing project / runtime context',
    },
    {
      id: 'publish',
      label: 'Publish Health',
      verdict:
        lastPublish !== null
          ? 'PASS'
          : diagnostics.projectName !== null
            ? 'WARNING'
            : 'FAIL',
      detail:
        lastPublish !== null
          ? `${lastPublish.label} · ${lastPublish.at}`
          : 'No publish recorded in this browser session',
    },
    {
      id: 'session',
      label: 'Session Health',
      verdict: diagnostics.sessionActive ? 'PASS' : 'FAIL',
      detail: diagnostics.sessionActive
        ? `Active · last login ${diagnostics.lastLoginAt ?? '—'}`
        : 'Missing Login',
    },
    {
      id: 'capability',
      label: 'Capability Health',
      verdict: fromPilotStatus(diagnostics.capabilityStatus),
      detail:
        diagnostics.capabilityStatus === 'ready'
          ? 'Capability Host active capabilities present'
          : diagnostics.capabilityStatus === 'degraded'
            ? 'Capability Host composed but inactive'
            : 'Capability Host missing',
    },
    {
      id: 'intelligence',
      label: 'Intelligence Health',
      verdict: fromPilotStatus(diagnostics.intelligenceStatus),
      detail:
        diagnostics.intelligenceStatus === 'ready'
          ? 'Intelligence adapter ready'
          : 'Intelligence adapter not ready',
    },
  ];

  return { items };
}
