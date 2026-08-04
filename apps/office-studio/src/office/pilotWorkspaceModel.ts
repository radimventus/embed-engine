/**
 * CAP-OP-01 / CAP-OP-02 — Pilot Workspace domain (UI shell + Working Terminal).
 * In-memory demo cases only — no persistence / runtime logic.
 */

export type PilotWorkspaceCaseId = string;

export type PilotWorkspaceCaseStatus =
  | 'offer'
  | 'checkout'
  | 'waiting_payment'
  | 'paid'
  | 'pilot_ready';

export type PilotCaseContact = {
  readonly name: string;
  readonly email: string;
  readonly role: string;
};

export type PilotPartnerEnvironmentState =
  | 'not_prepared'
  | 'preparing'
  | 'ready'
  | 'delivered';

export type PilotWorkspaceCase = {
  readonly id: PilotWorkspaceCaseId;
  readonly label: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly packageName: string;
  readonly licenseLabel: string;
  readonly status: PilotWorkspaceCaseStatus;
  readonly updatedAt: string;
  readonly contacts: readonly PilotCaseContact[];
  readonly partnerEnvironment: {
    readonly state: PilotPartnerEnvironmentState;
    readonly label: string;
  };
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

export const PILOT_PARTNER_ENVIRONMENT_LABELS: Readonly<
  Record<PilotPartnerEnvironmentState, string>
> = Object.freeze({
  not_prepared: 'Nepřipraveno',
  preparing: 'Připravuje se',
  ready: 'Připraveno',
  delivered: 'Doručeno',
});

/**
 * Canvelo workflow steps — discrete indicators, not progress bars.
 * Information model stays step-based; CONIS visual language applies in UI.
 */
export type PilotCanveloStepId =
  | 'offer'
  | 'order'
  | 'proforma'
  | 'payment'
  | 'pilot_ready';

export type PilotCanveloStepState = 'done' | 'current' | 'todo';

export type PilotCanveloStep = {
  readonly id: PilotCanveloStepId;
  readonly label: string;
};

export type PilotCanveloIndicator = PilotCanveloStep & {
  readonly state: PilotCanveloStepState;
};

export const PILOT_CANVELO_STEPS: readonly PilotCanveloStep[] = Object.freeze([
  { id: 'offer', label: 'Nabídka' },
  { id: 'order', label: 'Objednávka' },
  { id: 'proforma', label: 'Proforma' },
  { id: 'payment', label: 'Platba' },
  { id: 'pilot_ready', label: 'Pilot Ready' },
]);

const STATUS_TO_CANVELO_INDEX: Readonly<
  Record<PilotWorkspaceCaseStatus, number>
> = Object.freeze({
  offer: 0,
  checkout: 1,
  waiting_payment: 2,
  paid: 3,
  pilot_ready: 4,
});

export function buildCanveloIndicators(
  status: PilotWorkspaceCaseStatus,
): readonly PilotCanveloIndicator[] {
  const currentIndex = STATUS_TO_CANVELO_INDEX[status];
  return PILOT_CANVELO_STEPS.map((step, index) => ({
    ...step,
    state:
      index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo',
  }));
}

export type PilotInboxSectionId = 'new' | 'waiting_reply' | 'unassigned';

export type PilotInboxSection = {
  readonly id: PilotInboxSectionId;
  readonly label: string;
  readonly placeholders: readonly string[];
};

/** Inbox UI sections only — no assignment / mail runtime. */
export const PILOT_INBOX_SECTIONS: readonly PilotInboxSection[] = Object.freeze([
  {
    id: 'new',
    label: 'Nové',
    placeholders: [
      'Nová zpráva od partnera (UI placeholder)',
      'Potvrzení zájmu o balíček (UI placeholder)',
    ],
  },
  {
    id: 'waiting_reply',
    label: 'Čeká na odpověď',
    placeholders: [
      'Čekáme na schválení podmínek (UI placeholder)',
      'Doplnění kontaktních údajů (UI placeholder)',
    ],
  },
  {
    id: 'unassigned',
    label: 'Nepřiřazené',
    placeholders: ['Nepřiřazený podnět z Commercial Experience (UI placeholder)'],
  },
]);

export type PilotTimelinePlaceholder = {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly occurredAtLabel: string;
};

/** Timeline UI placeholders — Event Catalog wiring is PT-06+. */
export function buildTimelinePlaceholders(
  activeCase: PilotWorkspaceCase | null,
): readonly PilotTimelinePlaceholder[] {
  const name = activeCase?.partnerName ?? 'Obchodní případ';
  return [
    {
      id: 'tl-offer',
      label: 'offer.prepared',
      detail: `Event Catalog · nabídka připravena · ${name}`,
      occurredAtLabel: '—',
    },
    {
      id: 'tl-order',
      label: 'order.confirmed',
      detail: 'Event Catalog · objednávka potvrzena (placeholder)',
      occurredAtLabel: '—',
    },
    {
      id: 'tl-payment',
      label: 'payment.waiting',
      detail: 'Event Catalog · čeká na platbu (placeholder)',
      occurredAtLabel: '—',
    },
  ];
}

/** Seed commercial cases for shell UI (no persistence). */
export const PILOT_WORKSPACE_DEMO_CASES: readonly PilotWorkspaceCase[] =
  Object.freeze([
    {
      id: 'case-dse-starter',
      label: 'Domy s energií · Starter',
      partnerName: 'Domy s energií',
      companyName: 'Domy s energií s.r.o.',
      packageName: 'Starter',
      licenseLabel: 'až 3 domy · 90 dní',
      status: 'waiting_payment',
      updatedAt: '2026-08-04T09:00:00.000Z',
      contacts: [
        {
          name: 'Jana Energetická',
          email: 'jana@domysenergii.cz',
          role: 'Obchodní kontakt',
        },
      ],
      partnerEnvironment: {
        state: 'preparing',
        label: 'Partner Environment se připravuje',
      },
    },
    {
      id: 'case-nord-pilot',
      label: 'Nord Living · Pilot',
      partnerName: 'Nord Living',
      companyName: 'Nord Living a.s.',
      packageName: 'Pilot',
      licenseLabel: '1 dům · 90 dní',
      status: 'checkout',
      updatedAt: '2026-08-03T14:30:00.000Z',
      contacts: [
        {
          name: 'Erik Nord',
          email: 'erik@nordliving.cz',
          role: 'Jednatel',
        },
      ],
      partnerEnvironment: {
        state: 'not_prepared',
        label: 'Partner Environment zatím nepřipraveno',
      },
    },
    {
      id: 'case-atelier-studio',
      label: 'Ateliér Domů · Studio Partner',
      partnerName: 'Ateliér Domů',
      companyName: 'Ateliér Domů s.r.o.',
      packageName: 'Studio Partner',
      licenseLabel: 'Neomezeně (MVP) · 90 dní',
      status: 'offer',
      updatedAt: '2026-08-02T11:15:00.000Z',
      contacts: [
        {
          name: 'Marie Ateliér',
          email: 'marie@atelierdomu.cz',
          role: 'Partner lead',
        },
      ],
      partnerEnvironment: {
        state: 'not_prepared',
        label: 'Partner Environment zatím nepřipraveno',
      },
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

export function createPlaceholderCase(
  stamp = Date.now().toString(36),
): PilotWorkspaceCase {
  return {
    id: `case-new-${stamp}`,
    label: `Nový obchodní případ · ${stamp.toUpperCase()}`,
    partnerName: 'Nový partner',
    companyName: 'Nová společnost',
    packageName: '—',
    licenseLabel: '—',
    status: 'offer',
    updatedAt: new Date().toISOString(),
    contacts: [],
    partnerEnvironment: {
      state: 'not_prepared',
      label: 'Partner Environment zatím nepřipraveno',
    },
  };
}
