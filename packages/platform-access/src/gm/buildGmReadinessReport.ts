/**
 * EPIC-BX-16 — Full GM Readiness report (orchestration only).
 */

import type { PlatformSession } from '../domain/types';
import { buildGmChecklist } from './buildGmChecklist';
import { buildGmDomainReports } from './buildGmDomainReports';
import { buildGmOperationalHealth } from './buildGmOperationalHealth';
import { buildGmPilotStatusSummary } from './buildGmPilotStatus';
import { GM_ENGINEERING_DEBT } from './gmEngineeringDebt';
import type {
  GmExecutiveStage,
  GmExecutiveSummary,
  GmReadinessReport,
  GmVerdict,
} from './gmTypes';

function scoreVerdict(verdict: GmVerdict): number {
  if (verdict === 'PASS') return 100;
  if (verdict === 'WARNING') return 50;
  return 0;
}

function buildExecutive(
  domains: GmReadinessReport['domains'],
): GmExecutiveSummary {
  const passCount = domains.filter((d) => d.verdict === 'PASS').length;
  const warningCount = domains.filter((d) => d.verdict === 'WARNING').length;
  const failCount = domains.filter((d) => d.verdict === 'FAIL').length;
  const domainCount = domains.length;
  const total = domains.reduce(
    (sum, domain) => sum + scoreVerdict(domain.verdict),
    0,
  );
  const scorePercent =
    domainCount === 0 ? 0 : Math.round(total / domainCount);

  let stage: GmExecutiveStage = 'Not Ready';
  if (failCount === 0 && scorePercent >= 95 && warningCount === 0) {
    stage = 'Ready for GM';
  } else if (failCount === 0 && scorePercent >= 80) {
    stage = 'Ready for Pilot';
  }

  return {
    scorePercent,
    stage,
    passCount,
    warningCount,
    failCount,
    domainCount,
  };
}

export function buildGmReadinessReport(
  session: PlatformSession | null,
): GmReadinessReport {
  const domains = buildGmDomainReports(session);
  return {
    executive: buildExecutive(domains),
    domains,
    health: buildGmOperationalHealth(session),
    pilots: buildGmPilotStatusSummary(),
    checklist: buildGmChecklist(session),
    debt: GM_ENGINEERING_DEBT,
  };
}
