/**
 * PE-03 — Pilot Workspace domain (partner studios only).
 * Office / Builder are never part of the partner workspace surface.
 */

export type PartnerPilotStudioId = 'client' | 'manager' | 'sales';

export type PilotStudioInitState = {
  readonly ready: true;
  readonly initializedAt: string;
};

export type PilotWorkspace = {
  readonly id: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  /** CONIS sample / Reference House label. */
  readonly sampleProjectLabel: string;
  readonly packageRoot: string;
  readonly studios: Readonly<Record<PartnerPilotStudioId, PilotStudioInitState>>;
  readonly createdAt: string;
};

export const PARTNER_PILOT_STUDIO_IDS: readonly PartnerPilotStudioId[] =
  Object.freeze(['client', 'manager', 'sales']);

export const CONIS_SAMPLE_PROJECT_LABEL = 'Reference House' as const;
