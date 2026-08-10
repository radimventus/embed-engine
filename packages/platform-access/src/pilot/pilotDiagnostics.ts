/**
 * EPIC-BX-15 — Pilot diagnostics + production readiness checks.
 */

import { composeStudioById, type StudioId } from '@embed-engine/capabilities';

import type { PlatformSession, PlatformStudioId } from '../domain/types';
import type {
  PilotActivityEntry,
  PilotDiagnostics,
  PilotReadyReport,
} from '../domain/pilotTypes';
import {
  findCompany,
  findProject,
  getDefaultCompanyRegistry,
} from '../registry/companyRegistry';
import { bootstrapProject } from '../bootstrap/projectBootstrap';

const ACTIVITY_KEY = 'conis.platform.activity.v1';
const PUBLISH_KEY = 'conis.platform.last-publish.v1';

function toCapabilityStudioId(
  studioId: PlatformStudioId,
): StudioId | null {
  if (studioId === 'office' || studioId === 'client') return null;
  return studioId;
}

type ActivityStore = {
  readonly entries: PilotActivityEntry[];
};

function loadActivity(): ActivityStore {
  if (typeof localStorage === 'undefined') {
    return { entries: [] };
  }
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (raw === null) return { entries: [] };
    const parsed = JSON.parse(raw) as ActivityStore;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries.slice(0, 20) : [],
    };
  } catch {
    return { entries: [] };
  }
}

export function recordPlatformActivity(input: {
  readonly label: string;
  readonly detail: string;
}): void {
  if (typeof localStorage === 'undefined') return;
  const store = loadActivity();
  const entry: PilotActivityEntry = {
    id: `act-${Date.now()}`,
    at: new Date().toISOString(),
    label: input.label,
    detail: input.detail,
  };
  localStorage.setItem(
    ACTIVITY_KEY,
    JSON.stringify({ entries: [entry, ...store.entries].slice(0, 20) }),
  );
}

export function listRecentActivity(
  limit = 5,
): readonly PilotActivityEntry[] {
  return loadActivity().entries.slice(0, limit);
}

export function recordLastPublish(label: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    PUBLISH_KEY,
    JSON.stringify({ at: new Date().toISOString(), label }),
  );
}

export function readLastPublish(): {
  readonly at: string;
  readonly label: string;
} | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PUBLISH_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as { at?: string; label?: string };
    if (typeof parsed.at !== 'string') return null;
    return { at: parsed.at, label: parsed.label ?? 'Publish' };
  } catch {
    return null;
  }
}

export function buildPilotDiagnostics(
  session: PlatformSession | null,
): PilotDiagnostics {
  const registry = getDefaultCompanyRegistry();
  const company =
    session !== null ? findCompany(registry, session.companyId) : undefined;
  const project =
    session?.projectId != null
      ? findProject(registry, session.projectId)
      : undefined;
  const lastPublish = readLastPublish();

  let capabilityStatus: PilotDiagnostics['capabilityStatus'] = 'missing';
  try {
    const active = session?.activeStudioId ?? 'builder';
    const capabilityStudioId = toCapabilityStudioId(active);
    if (capabilityStudioId === null) {
      capabilityStatus = 'ready';
    } else {
      const host = composeStudioById(capabilityStudioId);
      capabilityStatus =
        host.healthReport().filter((item) => item.active).length > 0
          ? 'ready'
          : 'degraded';
    }
  } catch {
    capabilityStatus = 'missing';
  }

  let intelligenceStatus: PilotDiagnostics['intelligenceStatus'] = 'missing';
  if (session?.projectId != null && session.activeStudioId != null) {
    const boot = bootstrapProject({
      session,
      projectId: session.projectId,
      studioId: session.activeStudioId,
    });
    intelligenceStatus =
      boot?.intelligenceReady === true ? 'ready' : 'missing';
  } else {
    intelligenceStatus = 'ready';
  }

  return {
    lastLoginAt: session?.lastLoginAt ?? null,
    lastPublishAt: lastPublish?.at ?? null,
    lastPublishLabel: lastPublish?.label ?? 'Žádný publish v této session',
    runtimeStatus: project !== undefined ? 'ready' : 'missing',
    capabilityStatus,
    intelligenceStatus,
    sessionActive: session !== null,
    tenantId: session?.tenantId ?? null,
    companyName: company?.name ?? null,
    projectName: project?.name ?? null,
  };
}

export function buildPilotReadyReport(
  session: PlatformSession | null,
): PilotReadyReport {
  const diagnostics = buildPilotDiagnostics(session);
  const registry = getDefaultCompanyRegistry();
  const project =
    session?.projectId != null
      ? findProject(registry, session.projectId)
      : undefined;

  const checks = [
    {
      id: 'login' as const,
      label: 'Login',
      ok: session !== null,
      detail: session !== null ? 'Session aktivní' : 'Missing Login',
    },
    {
      id: 'tenant' as const,
      label: 'Tenant',
      ok: session?.tenantId != null && session.tenantId.length > 0,
      detail:
        session?.tenantId != null ? session.tenantId : 'Missing Tenant',
    },
    {
      id: 'workspace' as const,
      label: 'Workspace',
      ok: session?.workspaceId != null,
      detail:
        session?.workspaceId != null
          ? session.workspaceId
          : 'Missing Workspace',
    },
    {
      id: 'project' as const,
      label: 'Project',
      ok: project !== undefined,
      detail: project !== undefined ? project.name : 'Missing Project',
    },
    {
      id: 'house-package' as const,
      label: 'House Package',
      ok: project !== undefined && project.packageRoot.length > 0,
      detail:
        project !== undefined
          ? project.packageRoot
          : 'Missing House Package',
    },
    {
      id: 'runtime' as const,
      label: 'Runtime',
      ok: diagnostics.runtimeStatus === 'ready',
      detail:
        diagnostics.runtimeStatus === 'ready'
          ? 'Runtime ready'
          : 'Missing Runtime',
    },
    {
      id: 'capabilities' as const,
      label: 'Capabilities',
      ok: diagnostics.capabilityStatus === 'ready',
      detail:
        diagnostics.capabilityStatus === 'ready'
          ? 'Capabilities ready'
          : 'Missing Capabilities',
    },
    {
      id: 'intelligence' as const,
      label: 'Intelligence',
      ok: diagnostics.intelligenceStatus === 'ready',
      detail:
        diagnostics.intelligenceStatus === 'ready'
          ? 'Intelligence ready'
          : 'Missing Intelligence',
    },
  ];

  const missingLabels = checks
    .filter((check) => !check.ok)
    .map((check) => check.detail);

  return {
    ready: missingLabels.length === 0,
    checks,
    missingLabels,
  };
}
