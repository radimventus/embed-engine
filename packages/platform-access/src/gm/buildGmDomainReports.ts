/**
 * EPIC-BX-16 — Readiness domains from existing platform signals.
 */

import { composeStudioById } from '@embed-engine/capabilities';

import { getCloudPlatformConfig } from '../cloud/cloudConfig';
import type { PlatformSession } from '../domain/types';
import { canAccessStudio } from '../domain/roles';
import {
  buildPilotDiagnostics,
  buildPilotReadyReport,
  readLastPublish,
} from '../pilot/pilotDiagnostics';
import { getDefaultCompanyRegistry } from '../registry/companyRegistry';
import type { GmDomainId, GmDomainReport, GmVerdict } from './gmTypes';

const DOMAIN_LABELS: Record<GmDomainId, string> = {
  platform: 'Platform',
  authentication: 'Authentication',
  capability: 'Capability Platform',
  intelligence: 'Intelligence Core',
  runtime: 'Runtime',
  publish: 'Publish',
  builder: 'Builder',
  manager: 'Manager',
  sales: 'Sales',
  pilot: 'Pilot',
};

function studioDomain(
  studioId: 'builder' | 'manager' | 'sales',
  session: PlatformSession | null,
): GmDomainReport {
  const id = studioId as GmDomainId;
  try {
    const host = composeStudioById(studioId);
    const active = host.healthReport().filter((item) => item.active).length;
    const rolesOk =
      session === null || canAccessStudio(session.user.roles, studioId);
    let verdict: GmVerdict = 'PASS';
    let detail = `${host.declaredIds.length} capabilities · ${active} active`;
    if (active === 0) {
      verdict = 'WARNING';
      detail = 'Studio composed but no active capabilities';
    }
    if (!rolesOk) {
      verdict = 'WARNING';
      detail = 'Studio composed · current role soft-blocked';
    }
    return { id, label: DOMAIN_LABELS[id], verdict, detail };
  } catch {
    return {
      id,
      label: DOMAIN_LABELS[id],
      verdict: 'FAIL',
      detail: 'Studio composition missing',
    };
  }
}

export function buildGmDomainReports(
  session: PlatformSession | null,
): readonly GmDomainReport[] {
  const config = getCloudPlatformConfig();
  const diagnostics = buildPilotDiagnostics(session);
  const pilotReady = buildPilotReadyReport(session);
  const lastPublish = readLastPublish();
  const registry = getDefaultCompanyRegistry();
  const pilotTenants = registry.tenants.filter((tenant) => tenant.pilot);

  let capabilityVerdict: GmVerdict = 'PASS';
  let capabilityDetail = 'Capability Platform available';
  try {
    const hosts = (['builder', 'manager', 'sales'] as const).map((id) =>
      composeStudioById(id),
    );
    const activeTotal = hosts.reduce(
      (sum, host) =>
        sum + host.healthReport().filter((item) => item.active).length,
      0,
    );
    if (activeTotal === 0) {
      capabilityVerdict = 'WARNING';
      capabilityDetail = 'Hosts compose but report no active capabilities';
    } else {
      capabilityDetail = `${activeTotal} active capability bindings across studios`;
    }
  } catch {
    capabilityVerdict = 'FAIL';
    capabilityDetail = 'Capability composition failed';
  }

  const domains: GmDomainReport[] = [
    {
      id: 'platform',
      label: DOMAIN_LABELS.platform,
      verdict: 'PASS',
      detail: `${config.mode} · ${config.appHost} · ${config.origin}`,
    },
    {
      id: 'authentication',
      label: DOMAIN_LABELS.authentication,
      verdict: session !== null ? 'PASS' : 'FAIL',
      detail:
        session !== null
          ? `Session · ${session.user.email}`
          : 'Missing Login',
    },
    {
      id: 'capability',
      label: DOMAIN_LABELS.capability,
      verdict: capabilityVerdict,
      detail: capabilityDetail,
    },
    {
      id: 'intelligence',
      label: DOMAIN_LABELS.intelligence,
      verdict:
        diagnostics.intelligenceStatus === 'ready' ? 'PASS' : 'FAIL',
      detail:
        diagnostics.intelligenceStatus === 'ready'
          ? 'Intelligence Core adapter ready'
          : 'Missing Intelligence',
    },
    {
      id: 'runtime',
      label: DOMAIN_LABELS.runtime,
      verdict:
        diagnostics.runtimeStatus === 'ready'
          ? 'PASS'
          : diagnostics.runtimeStatus === 'unknown'
            ? 'WARNING'
            : 'FAIL',
      detail:
        diagnostics.runtimeStatus === 'ready'
          ? 'Runtime context via active project'
          : 'Missing Runtime',
    },
    {
      id: 'publish',
      label: DOMAIN_LABELS.publish,
      verdict:
        lastPublish !== null
          ? 'PASS'
          : registry.projects.some((project) => project.status === 'published')
            ? 'WARNING'
            : 'FAIL',
      detail:
        lastPublish !== null
          ? `Last publish · ${lastPublish.label}`
          : registry.projects.some((project) => project.status === 'published')
            ? 'Published project in registry · no session publish marker'
            : 'Missing Publish',
    },
    studioDomain('builder', session),
    studioDomain('manager', session),
    studioDomain('sales', session),
    {
      id: 'pilot',
      label: DOMAIN_LABELS.pilot,
      verdict: pilotReady.ready
        ? 'PASS'
        : session !== null
          ? 'WARNING'
          : 'FAIL',
      detail: pilotReady.ready
        ? `Pilot Ready · ${pilotTenants.length} pilot tenant(s)`
        : pilotReady.missingLabels[0] ?? 'Pilot not ready',
    },
  ];

  return domains;
}
