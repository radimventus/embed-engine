/**
 * EPIC-BX-18 — GA Readiness Center (orchestration over GM + existing signals).
 * Does not invent release/customer domain models or backends.
 */

import { composeStudioById } from '@embed-engine/capabilities';

import type { PlatformSession } from '../domain/types';
import { buildGmReadinessReport } from '../gm/buildGmReadinessReport';
import type {
  GmChecklistState,
  GmReadinessReport,
} from '../gm/gmTypes';
import {
  buildPilotReadyReport,
  readLastPublish,
} from '../pilot/pilotDiagnostics';
import type {
  GaDashboard,
  GaExecutiveReport,
  GaGoNoGoBoard,
  GaHealthItem,
  GaMatrixAreaId,
  GaMatrixRow,
  GaProductionChecklistItem,
  GaReadinessReport,
  GaReleaseCertification,
  GaVerdict,
} from './gaTypes';

const MATRIX_ORDER: readonly {
  readonly id: GaMatrixAreaId;
  readonly label: string;
  readonly gmDomainId?: string;
}[] = [
  { id: 'platform', label: 'Platform', gmDomainId: 'platform' },
  { id: 'builder', label: 'Builder', gmDomainId: 'builder' },
  { id: 'manager', label: 'Manager', gmDomainId: 'manager' },
  { id: 'sales', label: 'Sales', gmDomainId: 'sales' },
  { id: 'runtime', label: 'Runtime', gmDomainId: 'runtime' },
  { id: 'publish', label: 'Publish', gmDomainId: 'publish' },
  { id: 'intelligence', label: 'Intelligence', gmDomainId: 'intelligence' },
  { id: 'capability', label: 'Capability', gmDomainId: 'capability' },
  {
    id: 'authentication',
    label: 'Authentication',
    gmDomainId: 'authentication',
  },
  { id: 'customer-success', label: 'Customer Success' },
];

function scoreVerdict(verdict: GaVerdict): number {
  if (verdict === 'PASS') return 100;
  if (verdict === 'WARNING') return 50;
  return 0;
}

function customerSuccessVerdict(): {
  readonly verdict: GaVerdict;
  readonly detail: string;
} {
  try {
    const manager = composeStudioById('manager');
    const sales = composeStudioById('sales');
    const builder = composeStudioById('builder');
    const declared =
      manager.isDeclared('customer-success') &&
      sales.isDeclared('customer-success') &&
      builder.isDeclared('customer-success');
    if (!declared) {
      return {
        verdict: 'FAIL',
        detail: 'Customer Success capability not composed',
      };
    }
    return {
      verdict: 'PASS',
      detail:
        'Customer Success capability composed in Manager / Sales / Builder',
    };
  } catch {
    return {
      verdict: 'FAIL',
      detail: 'Capability composition unavailable',
    };
  }
}

function buildMatrix(gm: GmReadinessReport): readonly GaMatrixRow[] {
  const byGm = new Map(gm.domains.map((domain) => [domain.id, domain]));
  const cs = customerSuccessVerdict();

  return MATRIX_ORDER.map((area) => {
    if (area.id === 'customer-success') {
      return {
        id: area.id,
        label: area.label,
        verdict: cs.verdict,
        detail: cs.detail,
      };
    }
    const domain = byGm.get(area.gmDomainId as never);
    return {
      id: area.id,
      label: area.label,
      verdict: domain?.verdict ?? 'FAIL',
      detail: domain?.detail ?? 'Missing signal',
    };
  });
}

function buildOperationalHealth(
  gm: GmReadinessReport,
  matrix: readonly GaMatrixRow[],
): readonly GaHealthItem[] {
  const platform = matrix.find((row) => row.id === 'platform');
  const fromGm = gm.health.items.map((item) => ({
    id: item.id as GaHealthItem['id'],
    label: item.label,
    verdict: item.verdict,
    detail: item.detail,
  }));
  return [
    ...fromGm,
    {
      id: 'platform',
      label: 'Platform Health',
      verdict: platform?.verdict ?? 'FAIL',
      detail: platform?.detail ?? 'Platform domain missing',
    },
  ];
}

function buildCertification(
  session: PlatformSession | null,
  matrix: readonly GaMatrixRow[],
): GaReleaseCertification {
  const lastPublish = readLastPublish();
  const pilot = buildPilotReadyReport(session);
  const runtime = matrix.find((row) => row.id === 'runtime');
  const publish = matrix.find((row) => row.id === 'publish');

  let certificationStatus: GaVerdict = 'PASS';
  if (publish?.verdict === 'FAIL' || runtime?.verdict === 'FAIL') {
    certificationStatus = 'FAIL';
  } else if (
    publish?.verdict === 'WARNING' ||
    runtime?.verdict === 'WARNING' ||
    !pilot.ready
  ) {
    certificationStatus = 'WARNING';
  }

  const fingerprint =
    lastPublish !== null
      ? `publish:${lastPublish.label}:${lastPublish.at}`
      : pilot.ready
        ? `pilot-ready:${session?.projectId ?? 'none'}`
        : 'unpublished';

  const approval =
    certificationStatus === 'PASS'
      ? 'Approved for GA consideration'
      : certificationStatus === 'WARNING'
        ? 'Conditional — resolve warnings before GA'
        : 'Not approved — blocking gaps remain';

  return {
    certificationStatus,
    validationSummary: pilot.ready
      ? 'Pilot Ready checks PASS'
      : `Pilot gaps: ${pilot.missingLabels.join(', ') || 'incomplete'}`,
    runtimeSummary: runtime?.detail ?? 'Runtime unknown',
    publishSummary:
      lastPublish !== null
        ? `${lastPublish.label} · ${lastPublish.at}`
        : (publish?.detail ?? 'No publish marker'),
    fingerprint,
    approval,
  };
}

function buildGoNoGo(
  matrix: readonly GaMatrixRow[],
  checklist: readonly GaProductionChecklistItem[],
  certification: GaReleaseCertification,
): GaGoNoGoBoard {
  const blockers = [
    ...matrix
      .filter((row) => row.verdict === 'FAIL')
      .map((row) => `${row.label}: ${row.detail}`),
    ...checklist
      .filter((item) => item.state === 'BLOCKED')
      .map((item) => `${item.label}: ${item.detail}`),
  ];
  if (certification.certificationStatus === 'FAIL') {
    blockers.push(`Release certification: ${certification.approval}`);
  }

  const conditions = [
    ...matrix
      .filter((row) => row.verdict === 'WARNING')
      .map((row) => `${row.label}: ${row.detail}`),
    ...checklist
      .filter((item) => item.state === 'TODO')
      .map((item) => `${item.label}: ${item.detail}`),
  ];
  if (certification.certificationStatus === 'WARNING') {
    conditions.push(certification.approval);
  }

  let decision: GaGoNoGoBoard['decision'] = 'GO';
  if (blockers.length > 0) decision = 'NO GO';
  else if (conditions.length > 0) decision = 'GO WITH CONDITIONS';

  return { decision, blockers, conditions };
}

function checklistStateFromVerdict(verdict: GaVerdict): GmChecklistState {
  if (verdict === 'PASS') return 'PASS';
  if (verdict === 'WARNING') return 'TODO';
  return 'BLOCKED';
}

function buildProductionChecklist(
  session: PlatformSession | null,
  gm: GmReadinessReport,
  matrix: readonly GaMatrixRow[],
): readonly GaProductionChecklistItem[] {
  const byMatrix = new Map(matrix.map((row) => [row.id, row]));
  const sessionItem = gm.health.items.find((item) => item.id === 'session');

  const ids: readonly {
    readonly id: string;
    readonly label: string;
    readonly matrixId?: GaMatrixAreaId;
    readonly fromGm?: string;
  }[] = [
    { id: 'authentication', label: 'Authentication', matrixId: 'authentication' },
    { id: 'session', label: 'Session' },
    { id: 'platform-shell', label: 'Platform Shell', fromGm: 'platform-shell' },
    { id: 'builder', label: 'Builder', matrixId: 'builder' },
    { id: 'manager', label: 'Manager', matrixId: 'manager' },
    { id: 'sales', label: 'Sales', matrixId: 'sales' },
    { id: 'runtime', label: 'Runtime', matrixId: 'runtime' },
    { id: 'publish', label: 'Publish', matrixId: 'publish' },
    { id: 'intelligence', label: 'Intelligence', matrixId: 'intelligence' },
    { id: 'capability', label: 'Capability', matrixId: 'capability' },
    {
      id: 'customer-success',
      label: 'Customer Success',
      matrixId: 'customer-success',
    },
  ];

  return ids.map((item) => {
    if (item.id === 'session') {
      const ok = sessionItem?.verdict === 'PASS';
      return {
        id: item.id,
        label: item.label,
        state: ok ? 'PASS' : session === null ? 'BLOCKED' : 'TODO',
        detail: sessionItem?.detail ?? 'Missing Session',
      };
    }
    if (item.fromGm !== undefined) {
      const gmItem = gm.checklist.find((check) => check.id === item.fromGm);
      return {
        id: item.id,
        label: item.label,
        state: gmItem?.state ?? 'TODO',
        detail: gmItem?.detail ?? 'Missing',
      };
    }
    const row =
      item.matrixId !== undefined ? byMatrix.get(item.matrixId) : undefined;
    return {
      id: item.id,
      label: item.label,
      state: checklistStateFromVerdict(row?.verdict ?? 'FAIL'),
      detail: row?.detail ?? 'Missing',
    };
  });
}

function buildDashboard(input: {
  readonly matrix: readonly GaMatrixRow[];
  readonly goNoGo: GaGoNoGoBoard;
  readonly gm: GmReadinessReport;
  readonly checklist: readonly GaProductionChecklistItem[];
}): GaDashboard {
  const { matrix, goNoGo, gm, checklist } = input;
  const total = matrix.reduce(
    (sum, row) => sum + scoreVerdict(row.verdict),
    0,
  );
  const overallReadinessPercent =
    matrix.length === 0 ? 0 : Math.round(total / matrix.length);

  const todo = checklist.find((item) => item.state !== 'PASS');
  const nextAction =
    goNoGo.blockers[0] ??
    goNoGo.conditions[0] ??
    (todo !== undefined
      ? `Dokončete: ${todo.label}`
      : 'Udržujte produkční provoz a sledujte Customer Success');

  return {
    overallReadinessPercent,
    overallLabel:
      goNoGo.decision === 'GO'
        ? 'Připraveno na veřejné spuštění'
        : goNoGo.decision === 'GO WITH CONDITIONS'
          ? 'Připraveno s podmínkami'
          : 'Není připraveno na GA',
    pilotStatus: `${gm.executive.stage} · ${gm.pilots.firms.length} pilot firm(s)`,
    productionStatus: goNoGo.decision,
    blockingIssues: goNoGo.blockers,
    nextAction,
  };
}

function buildExecutive(input: {
  readonly dashboard: GaDashboard;
  readonly goNoGo: GaGoNoGoBoard;
  readonly certification: GaReleaseCertification;
}): GaExecutiveReport {
  const { dashboard, goNoGo, certification } = input;
  return {
    currentReadiness: `${dashboard.overallReadinessPercent}% · ${dashboard.overallLabel}`,
    remainingBlockers:
      goNoGo.blockers.length > 0 ? goNoGo.blockers : goNoGo.conditions,
    recommendation:
      goNoGo.decision === 'GO'
        ? 'Schválit přechod na veřejný provoz (GA).'
        : goNoGo.decision === 'GO WITH CONDITIONS'
          ? 'Pokračovat v pilotu; uzavřít podmínky před GA.'
          : 'Nezahajovat GA — nejdříve odstranit blokující body.',
    estimatedStatus: `${goNoGo.decision} · ${certification.approval}`,
  };
}

/**
 * Single GA readiness projection — reuses one GM report as source of truth.
 */
export function buildGaReadinessReport(
  session: PlatformSession | null,
): GaReadinessReport {
  const gm = buildGmReadinessReport(session);
  const matrix = buildMatrix(gm);
  const operationalHealth = buildOperationalHealth(gm, matrix);
  const checklist = buildProductionChecklist(session, gm, matrix);
  const certification = buildCertification(session, matrix);
  const goNoGo = buildGoNoGo(matrix, checklist, certification);
  const dashboard = buildDashboard({
    matrix,
    goNoGo,
    gm,
    checklist,
  });
  const executive = buildExecutive({ dashboard, goNoGo, certification });

  return {
    dashboard,
    matrix,
    operationalHealth,
    certification,
    goNoGo,
    checklist,
    executive,
  };
}
