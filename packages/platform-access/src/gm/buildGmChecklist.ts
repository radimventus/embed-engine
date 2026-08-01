/**
 * EPIC-BX-16 — Unified GM checklist from existing readiness signals.
 */

import { composeStudioById } from '@embed-engine/capabilities';

import type { PlatformSession } from '../domain/types';
import { buildPilotReadyReport, readLastPublish } from '../pilot/pilotDiagnostics';
import { getDefaultCompanyRegistry } from '../registry/companyRegistry';
import type { GmChecklistItem, GmChecklistState } from './gmTypes';

function stateFromOk(
  ok: boolean,
  blocked = false,
): GmChecklistState {
  if (blocked) return 'BLOCKED';
  return ok ? 'PASS' : 'TODO';
}

function studioOk(studioId: 'builder' | 'manager' | 'sales'): boolean {
  try {
    const host = composeStudioById(studioId);
    return host.declaredIds.length > 0;
  } catch {
    return false;
  }
}

export function buildGmChecklist(
  session: PlatformSession | null,
): readonly GmChecklistItem[] {
  const pilot = buildPilotReadyReport(session);
  const byId = new Map(pilot.checks.map((check) => [check.id, check]));
  const lastPublish = readLastPublish();
  const registry = getDefaultCompanyRegistry();
  const hasPublishedProject = registry.projects.some(
    (project) => project.status === 'published',
  );
  const loginOk = byId.get('login')?.ok === true;
  const rolesOk = session !== null && session.user.roles.length > 0;

  return [
    {
      id: 'authentication',
      label: 'Authentication',
      state: stateFromOk(loginOk),
      detail: loginOk ? 'Session aktivní' : 'Missing Login',
    },
    {
      id: 'roles',
      label: 'Roles',
      state: stateFromOk(rolesOk),
      detail: rolesOk
        ? `Soft RBAC · ${session!.user.roles.join(', ')}`
        : 'Roles not assigned',
    },
    {
      id: 'platform-shell',
      label: 'Platform Shell',
      state: 'PASS',
      detail: 'Shared Platform Shell chrome available',
    },
    {
      id: 'builder',
      label: 'Builder',
      state: stateFromOk(studioOk('builder')),
      detail: studioOk('builder')
        ? 'Builder capability composition ready'
        : 'Builder composition missing',
    },
    {
      id: 'manager',
      label: 'Manager',
      state: stateFromOk(studioOk('manager')),
      detail: studioOk('manager')
        ? 'Manager capability composition ready'
        : 'Manager composition missing',
    },
    {
      id: 'sales',
      label: 'Sales',
      state: stateFromOk(studioOk('sales')),
      detail: studioOk('sales')
        ? 'Sales capability composition ready'
        : 'Sales composition missing',
    },
    {
      id: 'publish',
      label: 'Publish',
      state: stateFromOk(lastPublish !== null || hasPublishedProject),
      detail:
        lastPublish !== null
          ? lastPublish.label
          : hasPublishedProject
            ? 'Published project in registry'
            : 'Publish not recorded',
    },
    {
      id: 'runtime',
      label: 'Runtime',
      state: stateFromOk(byId.get('runtime')?.ok === true),
      detail: byId.get('runtime')?.detail ?? 'Missing Runtime',
    },
    {
      id: 'hp',
      label: 'HP',
      state: stateFromOk(byId.get('house-package')?.ok === true),
      detail: byId.get('house-package')?.detail ?? 'Missing House Package',
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      state: stateFromOk(byId.get('intelligence')?.ok === true),
      detail: byId.get('intelligence')?.detail ?? 'Missing Intelligence',
    },
  ];
}
