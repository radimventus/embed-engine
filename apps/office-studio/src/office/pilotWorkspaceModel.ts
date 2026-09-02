/**
 * CAP-OP-01 / CAP-OP-02 / CAP-PLAT-02b / CAP-PLAT-04g — Pilot Workspace commercial presentation.
 *
 * Domain identity (Company / Project / House) — Canonical Projection Layer only.
 * CAP-PLAT-04g — Case = Canonical Project; Houses nested inside the case.
 * Commercial ops overlays — workflow only (status / PE / contacts).
 * Office identity is Firma · Projekt — never Builder dům chrome.
 */

import {
  getCanonicalProject,
  listCanonicalHouses,
  listCanonicalProjects,
  type CanonicalProjectProjection,
  type SharedProjectDocumentRef,
} from '@embed-engine/platform-access';

import {
  licenseLabelFromOfferTemplate,
  packageNameFromOfferTemplate,
} from './commercialPilotProgramCatalog';

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

/** CAP-PLAT-04g — House nested under an Office case (Project). */
export type PilotWorkspaceHouse = {
  readonly houseId: string;
  readonly name: string;
  readonly objectType: string;
  readonly packagePublicRoot: string;
};

export type PilotWorkspaceCase = {
  /** CAP-PLAT-04g — Canonical Project id (case identity). */
  readonly id: PilotWorkspaceCaseId;
  /** Explicit ProjectId bind — equals `id` (Canonical Project). */
  readonly projectId: string;
  readonly companyId: string;
  readonly billingNumber: string | null;
  readonly commercialProgramId: string | null;
  readonly commercialProgramSelectedAt: string | null;
  /**
   * PT-PLATFORM-01 — Select / chrome: `Firma · Projekt`.
   * Never Builder dům identity.
   */
  readonly label: string;
  /** CAP-PLAT-04g — Office case title = `{project.name}`. */
  readonly projectTitle: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly packageName: string;
  readonly licenseLabel: string;
  readonly logoLabel: string;
  readonly heroLabel: string;
  readonly websiteUrl: string;
  readonly documents: readonly SharedProjectDocumentRef[];
  readonly offerTemplateId: string | null;
  /** CAP-PLAT-04g — Houses listed inside the case. */
  readonly houses: readonly PilotWorkspaceHouse[];
  readonly status: PilotWorkspaceCaseStatus;
  readonly updatedAt: string;
  readonly contacts: readonly PilotCaseContact[];
  readonly partnerEnvironment: {
    readonly state: PilotPartnerEnvironmentState;
    readonly label: string;
  };
};

/**
 * Legacy Office demo case ids → Shared Project / House ids (recovery / older tests).
 * DUP-05 — demo case identity retired; dual-read resolves to parent Project via CPL.
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

/**
 * Office ops overlay — status / PE / contacts only.
 * Never invents partner, company, logo, Hero, package, or documents.
 */
type CommercialOpsOverlay = {
  readonly status: PilotWorkspaceCaseStatus;
  readonly updatedAt: string;
  readonly contacts: readonly PilotCaseContact[];
  readonly partnerEnvironment: PilotWorkspaceCase['partnerEnvironment'];
};

const SEED_PROJECT_OPS: CommercialOpsOverlay = {
  status: 'waiting_payment',
  updatedAt: '2026-08-04T09:00:00.000Z',
  contacts: [],
  partnerEnvironment: {
    state: 'preparing',
    label: 'Partner Environment se připravuje',
  },
};

/**
 * Ops keyed by Canonical Project id.
 * House ids remain dual-read aliases onto the seed Project overlay.
 */
const COMMERCIAL_OPS_OVERLAYS: Readonly<
  Record<string, CommercialOpsOverlay>
> = Object.freeze({
  'project-ac-modular': SEED_PROJECT_OPS,
  'villa-168': SEED_PROJECT_OPS,
  'harmony-124': {
    status: 'checkout',
    updatedAt: '2026-08-03T14:30:00.000Z',
    contacts: [],
    partnerEnvironment: {
      state: 'not_prepared',
      label: 'Partner Environment zatím nepřipraveno',
    },
  },
  'family-98': {
    status: 'offer',
    updatedAt: '2026-08-02T11:15:00.000Z',
    contacts: [],
    partnerEnvironment: {
      state: 'not_prepared',
      label: 'Partner Environment zatím nepřipraveno',
    },
  },
});

const DEFAULT_OPS: CommercialOpsOverlay = {
  status: 'offer',
  updatedAt: new Date(0).toISOString(),
  contacts: [],
  partnerEnvironment: {
    state: 'not_prepared',
    label: 'Partner Environment zatím nepřipraveno',
  },
};

/** CAP-PLAT-04g — Office case title is Project.name (not Workspace / House). */
function officeProjectTitle(projection: CanonicalProjectProjection): string {
  const titled = projection.project.name.trim();
  return titled.length > 0 ? titled : projection.project.projectId;
}

/**
 * CAP-PLAT-04g / CAP-PLAT-04R4a — nested Houses from CPL House list only.
 * Project may have zero Houses; never requires projection.house.
 */
function housesForProject(
  projectId: string,
): readonly PilotWorkspaceHouse[] {
  return listCanonicalHouses(projectId).flatMap((projection) => {
    const house = projection.house;
    if (house === null) return [];
    return [
      {
        houseId: house.houseId,
        name: house.name,
        objectType: house.objectType,
        packagePublicRoot: house.packagePublicRoot,
      },
    ];
  });
}

/**
 * CAP-PLAT-04R4a — null-safe ops: Project-keyed overlay, else House-keyed when present.
 * Zero Houses → Project/default ops only (never invent a House).
 */
function opsForProjection(
  projection: CanonicalProjectProjection,
): CommercialOpsOverlay {
  const houseId = projection.house?.houseId;
  const houseOps =
    houseId !== undefined ? COMMERCIAL_OPS_OVERLAYS[houseId] : undefined;
  return (
    COMMERCIAL_OPS_OVERLAYS[projection.project.projectId] ??
    houseOps ?? {
      ...DEFAULT_OPS,
      updatedAt:
        projection.publication.publishedAt ?? new Date().toISOString(),
    }
  );
}

/**
 * CAP-PLAT-02b / CAP-PLAT-04g — Commercial Case adapter above CPL (workflow only).
 * Case identity = Canonical Project; Houses nested.
 */
export function toOfficeCommercialCase(
  projection: CanonicalProjectProjection,
): PilotWorkspaceCase {
  const projectId = projection.project.projectId;
  const ops = opsForProjection(projection);
  const packageName = packageNameFromOfferTemplate(
    projection.experience.offerTemplateId,
  );
  const licenseLabel = licenseLabelFromOfferTemplate(
    projection.experience.offerTemplateId,
  );
  const projectTitle = officeProjectTitle(projection);
  return {
    id: projectId,
    projectId,
    companyId: projection.partner.companyId,
    billingNumber:
      projection.project.billingNumber ?? null,
    commercialProgramId:
      projection.project.commercialProgramId ?? null,
    commercialProgramSelectedAt:
      projection.project.commercialProgramSelectedAt ?? null,
    label: `${projection.partner.companyName} · ${projectTitle}`,
    projectTitle,
    partnerName: projection.partner.companyName,
    companyName: projection.partner.companyName,
    packageName,
    licenseLabel,
    logoLabel: projection.branding.logoLabel,
    heroLabel: projection.branding.heroLabel,
    websiteUrl: projection.branding.websiteUrl,
    documents: projection.branding.documents,
    offerTemplateId: projection.experience.offerTemplateId,
    houses: housesForProject(projectId),
    status: ops.status,
    updatedAt: ops.updatedAt,
    contacts: ops.contacts,
    partnerEnvironment: ops.partnerEnvironment,
  };
}

/**
 * Office Select Project — commercial cases from true CPL Projects.
 * CAP-PLAT-04g — one case per Project; Houses nested on the case.
 */
export function listOfficeSelectProjects(): readonly PilotWorkspaceCase[] {
  return listCanonicalProjects().map(toOfficeCommercialCase);
}

/**
 * @deprecated CAP-PLAT-02b — use listOfficeSelectProjects() (live CPL).
 * Proxy avoids import-time freeze of domain rows.
 */
export const PILOT_WORKSPACE_DEMO_CASES: readonly PilotWorkspaceCase[] =
  new Proxy([] as PilotWorkspaceCase[], {
    get(_target, prop, receiver) {
      const live = listOfficeSelectProjects();
      if (prop === 'length') return live.length;
      if (prop === Symbol.iterator) {
        return live[Symbol.iterator].bind(live);
      }
      if (typeof prop === 'string' && /^\d+$/.test(prop)) {
        return live[Number(prop)];
      }
      const value = Reflect.get(live, prop, receiver);
      return typeof value === 'function' ? value.bind(live) : value;
    },
  });

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
  const projection = getCanonicalProject(projectId);
  if (projection === null || !projection.publication.isPublished) {
    return null;
  }
  return toOfficeCommercialCase(projection);
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
