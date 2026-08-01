/**
 * EPIC-BX-18 — GA Readiness report DTOs (orchestration / visualization only).
 * Reuses GM verdict vocabulary — no new customer or release domain model.
 */

import type { GmChecklistState, GmVerdict } from '../gm/gmTypes';

export type GaVerdict = GmVerdict;
export type GaChecklistState = GmChecklistState;

export type GaMatrixAreaId =
  | 'platform'
  | 'builder'
  | 'manager'
  | 'sales'
  | 'runtime'
  | 'publish'
  | 'intelligence'
  | 'capability'
  | 'authentication'
  | 'customer-success';

export type GaMatrixRow = {
  readonly id: GaMatrixAreaId;
  readonly label: string;
  readonly verdict: GaVerdict;
  readonly detail: string;
};

export type GaHealthId =
  | 'session'
  | 'runtime'
  | 'publish'
  | 'capability'
  | 'intelligence'
  | 'platform';

export type GaHealthItem = {
  readonly id: GaHealthId;
  readonly label: string;
  readonly verdict: GaVerdict;
  readonly detail: string;
};

export type GaReleaseCertification = {
  readonly certificationStatus: GaVerdict;
  readonly validationSummary: string;
  readonly runtimeSummary: string;
  readonly publishSummary: string;
  readonly fingerprint: string;
  readonly approval: string;
};

export type GaGoDecision = 'GO' | 'GO WITH CONDITIONS' | 'NO GO';

export type GaGoNoGoBoard = {
  readonly decision: GaGoDecision;
  readonly blockers: readonly string[];
  readonly conditions: readonly string[];
};

export type GaProductionChecklistItem = {
  readonly id: string;
  readonly label: string;
  readonly state: GaChecklistState;
  readonly detail: string;
};

export type GaDashboard = {
  readonly overallReadinessPercent: number;
  readonly overallLabel: string;
  readonly pilotStatus: string;
  readonly productionStatus: string;
  readonly blockingIssues: readonly string[];
  readonly nextAction: string;
};

export type GaExecutiveReport = {
  readonly currentReadiness: string;
  readonly remainingBlockers: readonly string[];
  readonly recommendation: string;
  readonly estimatedStatus: string;
};

export type GaReadinessReport = {
  readonly dashboard: GaDashboard;
  readonly matrix: readonly GaMatrixRow[];
  readonly operationalHealth: readonly GaHealthItem[];
  readonly certification: GaReleaseCertification;
  readonly goNoGo: GaGoNoGoBoard;
  readonly checklist: readonly GaProductionChecklistItem[];
  readonly executive: GaExecutiveReport;
};
