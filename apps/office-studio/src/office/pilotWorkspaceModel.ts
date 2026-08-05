/**
 * CAP-OP-01 / CAP-OP-02 / PT-PDM-02 — Pilot Workspace domain.
 * Select Project lists published Shared Projects (Builder-authored).
 * Commercial fields are Office ops overlays keyed by projectId — not a second project registry.
 */

import {
  listPublishedProjects,
  type SharedProject,
} from '@embed-engine/platform-access';

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
  /** Equals Shared Project id (Platform Projekt). */
  readonly id: PilotWorkspaceCaseId;
  /** Explicit ProjectId bind — always equals `id` after PDM-02. */
  readonly projectId: string;
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

/**
 * Legacy Office demo case ids → Shared Project ids (recovery / older tests).
 * DUP-05 — demo case identity retired; aliases resolve to Projekt.
 */
export const LEGACY_CASE_TO_PROJECT_ID: Readonly<Record<string, string>> =
  Object.freeze({
    'case-dse-starter': 'villa-168',
    'case-nord-pilot': 'harmony-124',
    'case-atelier-studio': 'family-98',
  });

export function resolvePilotProjectId(
  caseOrProjectId: string | null,
): string | null {
  if (caseOrProjectId === null || caseOrProjectId.length === 0) return null;
  return LEGACY_CASE_TO_PROJECT_ID[caseOrProjectId] ?? caseOrProjectId;
}

type CommercialOverlay = {
  readonly label: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly packageName: string;
  readonly licenseLabel: string;
  readonly status: PilotWorkspaceCaseStatus;
  readonly updatedAt: string;
  readonly contacts: readonly PilotCaseContact[];
  readonly partnerEnvironment: PilotWorkspaceCase['partnerEnvironment'];
};

/** Office ops overlays — not project authoring. */
const COMMERCIAL_OVERLAYS: Readonly<Record<string, CommercialOverlay>> =
  Object.freeze({
    'villa-168': {
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
    'harmony-124': {
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
    'family-98': {
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
  });

function projectToCase(project: SharedProject): PilotWorkspaceCase {
  const overlay = COMMERCIAL_OVERLAYS[project.id];
  if (overlay !== undefined) {
    return {
      id: project.id,
      projectId: project.id,
      label: overlay.label,
      partnerName: overlay.partnerName,
      companyName: overlay.companyName,
      packageName: overlay.packageName,
      licenseLabel: overlay.licenseLabel,
      status: overlay.status,
      updatedAt: overlay.updatedAt,
      contacts: overlay.contacts,
      partnerEnvironment: overlay.partnerEnvironment,
    };
  }
  return {
    id: project.id,
    projectId: project.id,
    label: `${project.companyName} · ${project.name}`,
    partnerName: project.companyName,
    companyName: project.companyName,
    packageName: project.name,
    licenseLabel: '—',
    status: 'offer',
    updatedAt: project.publishedAt ?? new Date().toISOString(),
    contacts: [],
    partnerEnvironment: {
      state: 'not_prepared',
      label: 'Partner Environment zatím nepřipraveno',
    },
  };
}

/** Prefer stable pilot order: villa → harmony → family, then others. */
const SELECT_ORDER = ['villa-168', 'harmony-124', 'family-98'] as const;

/**
 * Office Select Project — published Shared Projects only (PDM-02).
 * Replaces the former standalone PILOT_WORKSPACE_DEMO_CASES registry.
 */
export function listOfficeSelectProjects(): readonly PilotWorkspaceCase[] {
  const published = listPublishedProjects();
  const byId = new Map(published.map((project) => [project.id, project]));
  const ordered: SharedProject[] = [];
  for (const id of SELECT_ORDER) {
    const hit = byId.get(id);
    if (hit !== undefined) {
      ordered.push(hit);
      byId.delete(id);
    }
  }
  for (const project of byId.values()) {
    ordered.push(project);
  }
  return ordered.map(projectToCase);
}

/** @deprecated Use listOfficeSelectProjects — kept as alias for existing imports. */
export const PILOT_WORKSPACE_DEMO_CASES: readonly PilotWorkspaceCase[] =
  listOfficeSelectProjects();

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

/** Active Workflow phase for a commercial case (Výpis filter key). */
export function workflowPhaseForCaseStatus(
  status: PilotWorkspaceCaseStatus,
): PilotCanveloStepId {
  return PILOT_CANVELO_STEPS[STATUS_TO_CANVELO_INDEX[status]]!.id;
}

/**
 * CAP-OP-10B — filter the working map by Workflow phase.
 * `null` = show all projects.
 */
export function filterCasesByWorkflowPhase(
  cases: readonly PilotWorkspaceCase[],
  phaseId: PilotCanveloStepId | null,
): readonly PilotWorkspaceCase[] {
  if (phaseId === null) return cases;
  return cases.filter(
    (item) => workflowPhaseForCaseStatus(item.status) === phaseId,
  );
}

export type PilotInboxSectionId =
  | 'new'
  | 'waiting_reply'
  | 'unassigned'
  | 'archive';

export type PilotInboxSection = {
  readonly id: PilotInboxSectionId;
  readonly label: string;
};

/**
 * @deprecated CAP-OP-03 — use PILOT_INBOX_CATEGORIES from pilotInboxModel.
 * Kept as label map for shell tests / PT-05 compatibility.
 */
export const PILOT_INBOX_SECTIONS: readonly PilotInboxSection[] = Object.freeze([
  { id: 'new', label: 'Nové' },
  { id: 'waiting_reply', label: 'Čeká na odpověď' },
  { id: 'unassigned', label: 'Nepřiřazené' },
  { id: 'archive', label: 'Archiv' },
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

export function getPilotWorkspaceCase(
  caseId: PilotWorkspaceCaseId | null,
): PilotWorkspaceCase | null {
  const projectId = resolvePilotProjectId(caseId);
  if (projectId === null) return null;
  return (
    listOfficeSelectProjects().find((item) => item.id === projectId) ?? null
  );
}

export function isPilotTerminalViewId(
  value: string,
): value is PilotTerminalViewId {
  return PILOT_TERMINAL_VIEWS.some((view) => view.id === value);
}

/**
 * PT-PDM-02 — Office must not author Projekty.
 * (+) refreshes Select Project from Shared Project Runtime (no new project identity).
 */
export function createPlaceholderCase(): PilotWorkspaceCase {
  const published = listOfficeSelectProjects();
  const first = published[0];
  if (first === undefined) {
    throw new Error(
      'No published Shared Project available — create and publish in Builder Studio.',
    );
  }
  return {
    ...first,
    updatedAt: new Date().toISOString(),
  };
}

