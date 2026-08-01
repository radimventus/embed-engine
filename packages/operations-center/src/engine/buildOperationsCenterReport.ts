/**
 * EPIC-BX-19 — Build Platform Operations Center report from existing signals.
 */

import { composeStudioById } from '@embed-engine/capabilities';
import { analyzeCustomerSuccess } from '@embed-engine/customer-success';
import {
  buildGaReadinessReport,
  getDefaultCompanyRegistry,
  listRecentActivity,
  readLastPublish,
  type PlatformSession,
} from '@embed-engine/platform-access';

import type {
  OpsAlert,
  OpsAreaId,
  OpsAreaOverview,
  OpsCenterReport,
  OpsExecutiveView,
  OpsHealth,
  OpsPlatformMetrics,
  OpsTimelineEvent,
  OpsTimelineKind,
} from '../domain/types';

const AREA_LABELS: Record<OpsAreaId, string> = {
  platform: 'Platform',
  builder: 'Builder',
  manager: 'Manager',
  sales: 'Sales',
  runtime: 'Runtime',
  publish: 'Publish',
  intelligence: 'Intelligence',
  capability: 'Capability',
  'customer-success': 'Customer Success',
};

function verdictToHealth(
  verdict: 'PASS' | 'WARNING' | 'FAIL',
): OpsHealth {
  if (verdict === 'PASS') return 'healthy';
  if (verdict === 'WARNING') return 'degraded';
  return 'critical';
}

function findActivity(
  labels: readonly string[],
  needles: readonly string[],
): string | null {
  for (const item of labels) {
    const lower = item.toLowerCase();
    if (needles.some((needle) => lower.includes(needle))) {
      return item;
    }
  }
  return null;
}

function buildOverview(
  session: PlatformSession | null,
): readonly OpsAreaOverview[] {
  const ga = buildGaReadinessReport(session);
  const activity = listRecentActivity(20);
  const activityLabels = activity.map(
    (item) => `${item.label} ${item.detail}`,
  );
  const lastPublish = readLastPublish();
  const cs = analyzeCustomerSuccess({ session });
  const byMatrix = new Map(ga.matrix.map((row) => [row.id, row]));

  const lastFor = (id: OpsAreaId): string => {
    switch (id) {
      case 'publish':
        return lastPublish !== null
          ? `${lastPublish.label} · ${lastPublish.at}`
          : findActivity(activityLabels, ['publish']) ?? '—';
      case 'builder':
      case 'manager':
      case 'sales':
        return (
          findActivity(activityLabels, [id, 'studio', 'feedback']) ??
          '—'
        );
      case 'runtime':
        return findActivity(activityLabels, ['runtime']) ?? '—';
      case 'intelligence':
        return findActivity(activityLabels, ['intelligence']) ?? '—';
      case 'capability':
        return findActivity(activityLabels, ['capability']) ?? '—';
      case 'customer-success':
        return cs !== null
          ? `${cs.health} · ${cs.adoptionScore}%`
          : '—';
      case 'platform':
        return (
          findActivity(activityLabels, ['login', 'feedback']) ??
          (session?.lastLoginAt ?? '—')
        );
    }
  };

  const ids: readonly OpsAreaId[] = [
    'platform',
    'builder',
    'manager',
    'sales',
    'runtime',
    'publish',
    'intelligence',
    'capability',
    'customer-success',
  ];

  return ids.map((id) => {
    if (id === 'customer-success') {
      const health: OpsHealth =
        cs === null
          ? 'unknown'
          : cs.health === 'Healthy'
            ? 'healthy'
            : cs.health === 'Attention'
              ? 'degraded'
              : 'critical';
      return {
        id,
        label: AREA_LABELS[id],
        health,
        status: cs?.healthDetail ?? 'Customer Success unavailable',
        lastActivity: lastFor(id),
      };
    }
    const row = byMatrix.get(id);
    return {
      id,
      label: AREA_LABELS[id],
      health: row !== undefined ? verdictToHealth(row.verdict) : 'unknown',
      status: row?.detail ?? 'Missing signal',
      lastActivity: lastFor(id),
    };
  });
}

function buildTimeline(
  session: PlatformSession | null,
): readonly OpsTimelineEvent[] {
  const activity = listRecentActivity(20);
  const lastPublish = readLastPublish();
  const cs = analyzeCustomerSuccess({ session });
  const events: OpsTimelineEvent[] = [];

  if (session?.lastLoginAt != null) {
    events.push({
      id: 'login-session',
      kind: 'login',
      label: 'Login',
      at: session.lastLoginAt,
      detail: session.user.email,
    });
  }

  if (lastPublish !== null) {
    events.push({
      id: 'publish-last',
      kind: 'publish',
      label: 'Publish',
      at: lastPublish.at,
      detail: lastPublish.label,
    });
    events.push({
      id: 'release-last',
      kind: 'release',
      label: 'Release',
      at: lastPublish.at,
      detail: lastPublish.label,
    });
  }

  for (const item of activity) {
    const blob = `${item.label} ${item.detail}`.toLowerCase();
    let kind: OpsTimelineKind | null = null;
    if (blob.includes('publish')) kind = 'publish';
    else if (blob.includes('login')) kind = 'login';
    else if (blob.includes('release')) kind = 'release';
    else if (blob.includes('runtime')) kind = 'runtime';
    else if (blob.includes('valid')) kind = 'validation';
    else if (
      blob.includes('lead') ||
      blob.includes('feedback') ||
      blob.includes('onboarding') ||
      blob.includes('success')
    ) {
      kind = 'customer-success';
    }
    if (kind === null) continue;
    events.push({
      id: item.id,
      kind,
      label: item.label,
      at: item.at,
      detail: item.detail,
    });
  }

  if (cs !== null) {
    events.push({
      id: 'cs-snapshot',
      kind: 'customer-success',
      label: 'Customer Success',
      at: session?.lastLoginAt ?? null,
      detail: `${cs.health} · adoption ${cs.adoptionScore}%`,
    });
  }

  return events
    .slice()
    .sort((a, b) => {
      const atA = a.at !== null ? Date.parse(a.at) : 0;
      const atB = b.at !== null ? Date.parse(b.at) : 0;
      return atB - atA;
    })
    .slice(0, 12);
}

function buildAlerts(
  session: PlatformSession | null,
  overview: readonly OpsAreaOverview[],
): readonly OpsAlert[] {
  const ga = buildGaReadinessReport(session);
  const cs = analyzeCustomerSuccess({ session });
  const alerts: OpsAlert[] = [];
  const byId = new Map(overview.map((item) => [item.id, item]));

  if (byId.get('publish')?.health === 'critical') {
    alerts.push({
      id: 'publish-blocked',
      severity: 'critical',
      title: 'Publish blocked',
      detail: byId.get('publish')?.status ?? 'Publish FAIL',
    });
  }

  if (
    byId.get('runtime')?.health === 'degraded' ||
    byId.get('runtime')?.health === 'critical'
  ) {
    alerts.push({
      id: 'runtime-degraded',
      severity:
        byId.get('runtime')?.health === 'critical' ? 'critical' : 'warning',
      title: 'Runtime degraded',
      detail: byId.get('runtime')?.status ?? 'Runtime not healthy',
    });
  }

  if (cs?.health === 'At Risk') {
    alerts.push({
      id: 'customer-at-risk',
      severity: 'critical',
      title: 'Customer at risk',
      detail: cs.healthDetail,
    });
  }

  const validationTodo = ga.checklist.find(
    (item) =>
      (item.id === 'runtime' || item.id === 'publish') &&
      item.state !== 'PASS',
  );
  if (validationTodo !== undefined) {
    alerts.push({
      id: 'missing-validation',
      severity: 'warning',
      title: 'Missing validation',
      detail: `${validationTodo.label}: ${validationTodo.detail}`,
    });
  }

  if (
    ga.certification.certificationStatus !== 'PASS' ||
    ga.goNoGo.decision === 'NO GO'
  ) {
    alerts.push({
      id: 'missing-release-approval',
      severity: ga.goNoGo.decision === 'NO GO' ? 'critical' : 'warning',
      title: 'Missing release approval',
      detail: ga.certification.approval,
    });
  }

  return alerts;
}

function buildMetrics(
  session: PlatformSession | null,
  overview: readonly OpsAreaOverview[],
): OpsPlatformMetrics {
  const registry = getDefaultCompanyRegistry();
  const lastPublish = readLastPublish();
  const cs = analyzeCustomerSuccess({ session });
  const runtime = overview.find((item) => item.id === 'runtime');
  const published = registry.projects.filter(
    (project) => project.status === 'published',
  ).length;

  return {
    activeCompanies: registry.companies.length,
    activeWorkspaces: registry.workspaces.length,
    activeProjects: registry.projects.length,
    releases: published + (lastPublish !== null ? 1 : 0),
    publishSuccess:
      lastPublish !== null
        ? `OK · ${lastPublish.label}`
        : published > 0
          ? 'Registry published · no session marker'
          : 'No publish',
    runtimeHealth: runtime?.health ?? 'unknown',
    adoptionPercent: cs?.adoptionScore ?? 0,
  };
}

function buildExecutive(
  overview: readonly OpsAreaOverview[],
  alerts: readonly OpsAlert[],
  metrics: OpsPlatformMetrics,
): OpsExecutiveView {
  const critical = overview.filter((item) => item.health === 'critical').length;
  const degraded = overview.filter((item) => item.health === 'degraded').length;
  const currentPlatformStatus =
    critical > 0
      ? `Critical · ${critical} area(s)`
      : degraded > 0
        ? `Degraded · ${degraded} area(s)`
        : `Healthy · ${metrics.activeCompanies} companies · adoption ${metrics.adoptionPercent}%`;

  const currentRisks =
    alerts.length > 0
      ? alerts.map((alert) => `${alert.title}: ${alert.detail}`)
      : ['Žádná aktivní operační rizika'];

  const recommendedActions =
    alerts.length > 0
      ? alerts.slice(0, 3).map((alert) => `Řešte: ${alert.title}`)
      : [
          'Udržujte publish cadence',
          'Sledujte Customer Success adoption',
          'Kontrolujte GA Go / No-Go před release',
        ];

  return {
    currentPlatformStatus,
    currentRisks,
    recommendedActions,
  };
}

/**
 * Ensure operations-center capability is composed where expected (read-only check).
 */
export function isOperationsCenterDeclared(): boolean {
  try {
    return composeStudioById('manager').isDeclared('operations-center');
  } catch {
    return false;
  }
}

export function buildOperationsCenterReport(
  session: PlatformSession | null,
): OpsCenterReport {
  const overview = buildOverview(session);
  const timeline = buildTimeline(session);
  const alerts = buildAlerts(session, overview);
  const metrics = buildMetrics(session, overview);
  const executive = buildExecutive(overview, alerts, metrics);
  return { overview, timeline, alerts, metrics, executive };
}
