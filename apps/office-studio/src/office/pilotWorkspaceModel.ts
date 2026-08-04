/**
 * CAP-OP-01 / PT-04 — Pilot Workspace domain (UI shell).
 * In-memory demo cases only — no persistence / runtime logic.
 */

export type PilotWorkspaceCaseId = string;

export type PilotWorkspaceCaseStatus =
  | 'offer'
  | 'checkout'
  | 'waiting_payment'
  | 'paid'
  | 'pilot_ready';

export type PilotWorkspaceCase = {
  readonly id: PilotWorkspaceCaseId;
  readonly label: string;
  readonly partnerName: string;
  readonly packageName: string;
  readonly status: PilotWorkspaceCaseStatus;
  readonly updatedAt: string;
};

/** Canonical Working Terminal views — order is fixed; Inbox is default. */
export type PilotTerminalViewId =
  | 'listing'
  | 'detail'
  | 'inbox'
  | 'timeline'
  | 'workflow';

export type PilotTerminalView = {
  readonly id: PilotTerminalViewId;
  readonly label: string;
};

export const PILOT_TERMINAL_VIEWS: readonly PilotTerminalView[] = Object.freeze([
  { id: 'listing', label: 'Výpis' },
  { id: 'detail', label: 'Detail' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'workflow', label: 'Workflow' },
]);

export const PILOT_TERMINAL_DEFAULT_VIEW: PilotTerminalViewId = 'inbox';

export const PILOT_WORKSPACE_CASE_STATUS_LABELS: Readonly<
  Record<PilotWorkspaceCaseStatus, string>
> = Object.freeze({
  offer: 'Nabídka',
  checkout: 'Objednávka',
  waiting_payment: 'Čeká na platbu',
  paid: 'Uhrazeno',
  pilot_ready: 'Pilot Ready',
});

/** Seed commercial cases for shell UI (PT-05 will replace with runtime). */
export const PILOT_WORKSPACE_DEMO_CASES: readonly PilotWorkspaceCase[] =
  Object.freeze([
    {
      id: 'case-dse-starter',
      label: 'Domy s energií · Starter',
      partnerName: 'Domy s energií',
      packageName: 'Starter',
      status: 'waiting_payment',
      updatedAt: '2026-08-04T09:00:00.000Z',
    },
    {
      id: 'case-nord-pilot',
      label: 'Nord Living · Pilot',
      partnerName: 'Nord Living',
      packageName: 'Pilot',
      status: 'checkout',
      updatedAt: '2026-08-03T14:30:00.000Z',
    },
    {
      id: 'case-atelier-studio',
      label: 'Ateliér Domů · Studio Partner',
      partnerName: 'Ateliér Domů',
      packageName: 'Studio Partner',
      status: 'offer',
      updatedAt: '2026-08-02T11:15:00.000Z',
    },
  ]);

export function getPilotWorkspaceCase(
  caseId: PilotWorkspaceCaseId | null,
): PilotWorkspaceCase | null {
  if (caseId === null) return null;
  return PILOT_WORKSPACE_DEMO_CASES.find((item) => item.id === caseId) ?? null;
}

export function isPilotTerminalViewId(
  value: string,
): value is PilotTerminalViewId {
  return PILOT_TERMINAL_VIEWS.some((view) => view.id === value);
}
