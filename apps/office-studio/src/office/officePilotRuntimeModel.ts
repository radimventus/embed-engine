/**
 * OF-06 — Pilot Runtime model (MVP end-to-end Office closure).
 */

export type PilotRuntimeStepId =
  | 'lead'
  | 'partner'
  | 'offer'
  | 'documents'
  | 'payment'
  | 'builder_handoff'
  | 'builder_ready'
  | 'pilot_ready';

export type PilotRuntimeStep = {
  readonly id: PilotRuntimeStepId;
  readonly label: string;
  readonly passed: boolean;
  readonly detail: string;
};

export type PilotRuntimeCheck = {
  readonly id: string;
  readonly label: string;
  readonly passed: boolean;
  readonly detail: string;
};

export type PilotRuntimeSummary = {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly pilotReady: boolean;
  readonly completedAt: string | null;
  readonly steps: readonly PilotRuntimeStep[];
  readonly runtimeChecks: readonly PilotRuntimeCheck[];
  readonly timelineChecks: readonly PilotRuntimeCheck[];
  readonly missingEventKinds: readonly string[];
};

export const PILOT_RUNTIME_STEP_ORDER: readonly PilotRuntimeStepId[] =
  Object.freeze([
    'lead',
    'partner',
    'offer',
    'documents',
    'payment',
    'builder_handoff',
    'builder_ready',
    'pilot_ready',
  ]);

export const PILOT_RUNTIME_STEP_LABELS: Record<PilotRuntimeStepId, string> = {
  lead: 'Lead',
  partner: 'Partner',
  offer: 'Offer',
  documents: 'Documents',
  payment: 'Payment',
  builder_handoff: 'Builder Handoff',
  builder_ready: 'Builder Workspace Ready',
  pilot_ready: 'Pilot Ready',
};

/** Required audit events for a complete Pilot Runtime timeline. */
export const PILOT_REQUIRED_EVENT_KINDS = Object.freeze([
  'partner.created',
  'offer.prepared',
  'package.selected',
  'offer.sent',
  'documents.prepared',
  'documents.sent',
  'clickwrap.confirmed',
  'proforma.issued',
  'order.confirmed',
  'payment.waiting',
  'payment.received',
  'builder.workspace.created',
  'builder.ready',
  'pilot.ready',
] as const);
