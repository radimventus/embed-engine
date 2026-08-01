/**
 * EPIC-BX-23 — Launch Center report: aggregates existing platform readiness sources.
 */

import { buildCommercialPlatformReport } from '@embed-engine/commercial-platform';
import { buildOperationsCenterReport } from '@embed-engine/operations-center';
import {
  buildGaReadinessReport,
  buildGmReadinessReport,
  buildPilotReadyReport,
  type GaChecklistState,
  type GaGoDecision,
  type GaMatrixRow,
  type GaVerdict,
  type PlatformSession,
} from '@embed-engine/platform-access';

import type {
  GaGate,
  LaunchCenterReport,
  LaunchChecklistItem,
  LaunchChecklistItemId,
  LaunchChecklistState,
  LaunchDashboard,
  LaunchExecutiveReport,
  LaunchTimelineStage,
  LaunchTimelineStatus,
  PilotGate,
} from '../domain/types';

function checklistFromVerdict(verdict: GaVerdict | undefined): LaunchChecklistState {
  if (verdict === 'PASS') return 'PASS';
  if (verdict === 'WARNING') return 'TODO';
  return 'BLOCKED';
}

function checklistFromGaState(
  state: GaChecklistState | undefined,
): LaunchChecklistState {
  if (state === 'PASS') return 'PASS';
  if (state === 'TODO') return 'TODO';
  return 'BLOCKED';
}

function findMatrix(
  matrix: readonly GaMatrixRow[],
  id: GaMatrixRow['id'],
): GaMatrixRow | undefined {
  return matrix.find((row) => row.id === id);
}

function technicalSummary(matrix: readonly GaMatrixRow[]): string {
  const ids = ['runtime', 'publish', 'intelligence'] as const;
  const rows = ids
    .map((id) => findMatrix(matrix, id))
    .filter((row): row is GaMatrixRow => row !== undefined);
  if (rows.length === 0) return 'Technical areas unavailable';
  if (rows.every((row) => row.verdict === 'PASS')) {
    return 'Runtime · Publish · Intelligence PASS';
  }
  const blocked = rows.filter((row) => row.verdict === 'FAIL');
  if (blocked.length > 0) {
    return `BLOCKED · ${blocked.map((row) => row.label).join(', ')}`;
  }
  return `In progress · ${rows
    .filter((row) => row.verdict !== 'PASS')
    .map((row) => row.label)
    .join(', ')}`;
}

function buildChecklist(
  session: PlatformSession | null,
): readonly LaunchChecklistItem[] {
  const ga = buildGaReadinessReport(session);
  const ops = buildOperationsCenterReport(session);
  const commercial = buildCommercialPlatformReport(session);
  const byGa = new Map(ga.checklist.map((item) => [item.id, item]));
  const byMatrix = new Map(ga.matrix.map((row) => [row.id, row]));

  const fromGa = (
    id: LaunchChecklistItemId,
    label: string,
    gaId: string,
    matrixId?: GaMatrixRow['id'],
  ): LaunchChecklistItem => {
    const gaItem = byGa.get(gaId);
    if (gaItem !== undefined) {
      return {
        id,
        label,
        state: checklistFromGaState(gaItem.state),
        detail: gaItem.detail,
      };
    }
    const matrix =
      matrixId !== undefined ? byMatrix.get(matrixId) : undefined;
    return {
      id,
      label,
      state: checklistFromVerdict(matrix?.verdict),
      detail: matrix?.detail ?? 'Missing from GA readiness',
    };
  };

  const opsHealth = ops.metrics.runtimeHealth;
  const opsState: LaunchChecklistState =
    opsHealth === 'healthy'
      ? 'PASS'
      : opsHealth === 'critical'
        ? 'BLOCKED'
        : 'TODO';

  const commercialState: LaunchChecklistState =
    commercial.executive.revenueReadiness.startsWith('Revenue Ready')
      ? 'PASS'
      : commercial.executive.revenueReadiness.includes('Not Ready')
        ? 'BLOCKED'
        : 'TODO';

  return [
    fromGa('platform', 'Platform', 'platform-shell', 'platform'),
    fromGa('builder', 'Builder', 'builder', 'builder'),
    fromGa('manager', 'Manager', 'manager', 'manager'),
    fromGa('sales', 'Sales', 'sales', 'sales'),
    fromGa('runtime', 'Runtime', 'runtime', 'runtime'),
    fromGa('publish', 'Publish', 'publish', 'publish'),
    fromGa('intelligence', 'Intelligence', 'intelligence', 'intelligence'),
    fromGa(
      'customer-success',
      'Customer Success',
      'customer-success',
      'customer-success',
    ),
    {
      id: 'operations',
      label: 'Operations',
      state: opsState,
      detail: ops.executive.currentPlatformStatus,
    },
    {
      id: 'commercial',
      label: 'Commercial',
      state: commercialState,
      detail: commercial.executive.revenueReadiness,
    },
  ];
}

function timelineStatusForPilot(
  index: number,
  firmCount: number,
  pilotReady: boolean,
  gaDecision: GaGoDecision,
): LaunchTimelineStatus {
  if (gaDecision === 'GO' && pilotReady) return 'done';
  if (index < firmCount) {
    if (index === firmCount - 1 && gaDecision !== 'GO') return 'active';
    return 'done';
  }
  if (index === firmCount && firmCount < 3) return 'active';
  return 'upcoming';
}

function buildTimeline(
  session: PlatformSession | null,
): readonly LaunchTimelineStage[] {
  const gm = buildGmReadinessReport(session);
  const pilot = buildPilotReadyReport(session);
  const ga = buildGaReadinessReport(session);
  const firms = gm.pilots.firms;
  const decision = ga.goNoGo.decision;

  const pilotStages: LaunchTimelineStage[] = (
    [
      { n: 1, id: 'pilot-1' },
      { n: 2, id: 'pilot-2' },
      { n: 3, id: 'pilot-3' },
    ] as const
  ).map(({ n, id }) => {
    const firm = firms[n - 1];
    return {
      id,
      label: `Pilot #${n}`,
      status: timelineStatusForPilot(
        n - 1,
        firms.length,
        pilot.ready,
        decision,
      ),
      detail: firm
        ? `${firm.companyName} · ${firm.lifecycleLabel}`
        : 'Čeká na pilotní firmu',
    };
  });

  let vrStatus: LaunchTimelineStatus = 'upcoming';
  let gaStatus: LaunchTimelineStatus = 'upcoming';
  let launchStatus: LaunchTimelineStatus = 'upcoming';

  if (decision === 'GO') {
    vrStatus = 'done';
    gaStatus = 'done';
    launchStatus = 'active';
  } else if (decision === 'GO WITH CONDITIONS') {
    vrStatus = firms.length >= 1 ? 'done' : 'active';
    gaStatus = 'active';
    launchStatus = 'blocked';
  } else {
    vrStatus = firms.length >= 1 || pilot.ready ? 'active' : 'upcoming';
    gaStatus = 'blocked';
    launchStatus = 'blocked';
  }

  return [
    ...pilotStages,
    {
      id: 'vr',
      label: 'VR',
      status: vrStatus,
      detail: 'Visual Review před GA rozhodnutím',
    },
    {
      id: 'ga-decision',
      label: 'GA Decision',
      status: gaStatus,
      detail: `GA Gate · ${decision}`,
    },
    {
      id: 'public-launch',
      label: 'Public Launch',
      status: launchStatus,
      detail:
        decision === 'GO'
          ? 'Připraveno k veřejnému spuštění'
          : 'Blokováno GA Gate',
    },
  ];
}

function buildDashboard(session: PlatformSession | null): LaunchDashboard {
  const ga = buildGaReadinessReport(session);
  const gm = buildGmReadinessReport(session);
  const commercial = buildCommercialPlatformReport(session);
  const ops = buildOperationsCenterReport(session);

  return {
    pilotProgress: `${gm.executive.stage} · ${ga.dashboard.pilotStatus} · ${gm.pilots.firms.length} pilot firm(s)`,
    gaReadiness: `${ga.dashboard.overallLabel} · ${ga.dashboard.overallReadinessPercent}%`,
    commercialReadiness: commercial.executive.revenueReadiness,
    technicalReadiness: technicalSummary(ga.matrix),
    operationalReadiness: ops.executive.currentPlatformStatus,
  };
}

function buildPilotGate(session: PlatformSession | null): PilotGate {
  const pilot = buildPilotReadyReport(session);
  return {
    label: 'Pilot Ready',
    verdict: pilot.ready ? 'YES' : 'NO',
    detail: pilot.ready
      ? 'Všechny Pilot Ready checks PASS'
      : `Chybí: ${pilot.missingLabels.join(', ') || 'checks'}`,
  };
}

function buildGaGate(session: PlatformSession | null): GaGate {
  const ga = buildGaReadinessReport(session);
  return {
    label: 'GA Gate',
    verdict: ga.goNoGo.decision,
    blockers: ga.goNoGo.blockers,
    conditions: ga.goNoGo.conditions,
  };
}

function deriveCurrentStage(
  pilotGate: PilotGate,
  gaGate: GaGate,
  gmStage: string,
): string {
  if (gaGate.verdict === 'GO') return 'Public Launch';
  if (gaGate.verdict === 'GO WITH CONDITIONS') return 'GA Decision';
  if (pilotGate.verdict === 'YES') return 'VR';
  if (gmStage === 'Ready for Pilot' || gmStage === 'Ready for GM') {
    return 'Pilot';
  }
  return 'Pre-Pilot';
}

function buildExecutive(
  session: PlatformSession | null,
  checklist: readonly LaunchChecklistItem[],
  pilotGate: PilotGate,
  gaGate: GaGate,
): LaunchExecutiveReport {
  const ga = buildGaReadinessReport(session);
  const gm = buildGmReadinessReport(session);
  const commercial = buildCommercialPlatformReport(session);
  const ops = buildOperationsCenterReport(session);

  const blockingItems = [
    ...gaGate.blockers,
    ...checklist
      .filter((item) => item.state === 'BLOCKED')
      .map((item) => `${item.label}: ${item.detail}`),
  ];

  const remainingRisks = [
    ...gaGate.conditions,
    ...commercial.executive.commercialRisks,
    ...ops.executive.currentRisks,
  ].filter((item, index, all) => all.indexOf(item) === index);

  return {
    currentStage: deriveCurrentStage(pilotGate, gaGate, gm.executive.stage),
    remainingRisks:
      remainingRisks.length > 0
        ? remainingRisks
        : ['Žádná otevřená commercial / operational rizika'],
    blockingItems:
      blockingItems.length > 0 ? blockingItems : ['Žádné blocking items'],
    recommendedNextAction:
      ga.dashboard.nextAction || ga.executive.recommendation,
  };
}

/**
 * Aggregates GA, Pilot, GM, Ops, and Commercial reports — no new readiness engine.
 */
export function buildLaunchCenterReport(
  session: PlatformSession | null,
): LaunchCenterReport {
  const checklist = buildChecklist(session);
  const timeline = buildTimeline(session);
  const dashboard = buildDashboard(session);
  const pilotGate = buildPilotGate(session);
  const gaGate = buildGaGate(session);
  const executive = buildExecutive(session, checklist, pilotGate, gaGate);

  return {
    dashboard,
    checklist,
    timeline,
    executive,
    pilotGate,
    gaGate,
  };
}
