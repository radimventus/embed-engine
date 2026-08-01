/**
 * EPIC-BX-23 — Launch Center projection types.
 * Aggregation only — reuses existing readiness verdicts; no second readiness model.
 */

import type { GaGoDecision } from '@embed-engine/platform-access';

export type LaunchChecklistState = 'PASS' | 'TODO' | 'BLOCKED';

export type LaunchChecklistItemId =
  | 'platform'
  | 'builder'
  | 'manager'
  | 'sales'
  | 'runtime'
  | 'publish'
  | 'intelligence'
  | 'customer-success'
  | 'operations'
  | 'commercial';

export type LaunchChecklistItem = {
  readonly id: LaunchChecklistItemId;
  readonly label: string;
  readonly state: LaunchChecklistState;
  readonly detail: string;
};

export type LaunchTimelineStageId =
  | 'pilot-1'
  | 'pilot-2'
  | 'pilot-3'
  | 'vr'
  | 'ga-decision'
  | 'public-launch';

export type LaunchTimelineStatus =
  | 'done'
  | 'active'
  | 'upcoming'
  | 'blocked';

export type LaunchTimelineStage = {
  readonly id: LaunchTimelineStageId;
  readonly label: string;
  readonly status: LaunchTimelineStatus;
  readonly detail: string;
};

export type LaunchDashboard = {
  readonly pilotProgress: string;
  readonly gaReadiness: string;
  readonly commercialReadiness: string;
  readonly technicalReadiness: string;
  readonly operationalReadiness: string;
};

export type LaunchExecutiveReport = {
  readonly currentStage: string;
  readonly remainingRisks: readonly string[];
  readonly blockingItems: readonly string[];
  readonly recommendedNextAction: string;
};

export type PilotGateVerdict = 'YES' | 'NO';

export type PilotGate = {
  readonly label: 'Pilot Ready';
  readonly verdict: PilotGateVerdict;
  readonly detail: string;
};

export type GaGate = {
  readonly label: 'GA Gate';
  readonly verdict: GaGoDecision;
  readonly blockers: readonly string[];
  readonly conditions: readonly string[];
};

export type LaunchCenterReport = {
  readonly dashboard: LaunchDashboard;
  readonly checklist: readonly LaunchChecklistItem[];
  readonly timeline: readonly LaunchTimelineStage[];
  readonly executive: LaunchExecutiveReport;
  readonly pilotGate: PilotGate;
  readonly gaGate: GaGate;
};
