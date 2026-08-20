import type { HouseDataMode } from '../domain/types';
import {
  projectLeadProfilZajemce,
  resolveCorrelatedSnapshot,
} from './projectLeadProfil';
import {
  REFERENCE_CASE_TEMPLATES,
  type ReferenceCaseTemplate,
} from './referenceOperationalTemplates';
import type {
  HouseOperationalCase,
  OperationalDecisionSnapshot,
  OperationalHouseScope,
  OperationalLeadRecord,
} from './operationalTypes';

function scopedCaseId(
  templateId: string,
  companyId: string,
  projectId: string,
  houseId: string,
): string {
  return `ref:${companyId}:${projectId}:${houseId}:${templateId}`;
}

function instantiateTemplate(
  template: ReferenceCaseTemplate,
  scope: {
    readonly companyId: string;
    readonly projectId: string;
    readonly houseId: string;
    readonly houseName: string;
  },
): HouseOperationalCase {
  return {
    caseId: scopedCaseId(
      template.templateId,
      scope.companyId,
      scope.projectId,
      scope.houseId,
    ),
    companyId: scope.companyId,
    projectId: scope.projectId,
    houseId: scope.houseId,
    houseName: scope.houseName,
    origin: 'REFERENCE',
    leadId: null,
    createdAt: template.createdAt,
    contact: template.contact,
    conversion: {
      source: 'EMBED',
      intent: 'audit',
      status: 'accepted',
    },
    profilZajemce: {
      land: template.land,
      location: template.location,
      tags: template.tags,
      priorities: template.tags.map((label) => ({
        id: label,
        label,
        importance: null,
        answer: null,
      })),
      openedQuestions: [],
      insight: template.insight(scope.houseName),
      score: template.score,
      journey: template.journey,
    },
  };
}

function leadToCase(
  lead: OperationalLeadRecord,
  houseName: string,
  snapshot: OperationalDecisionSnapshot | null,
): HouseOperationalCase {
  return {
    caseId: lead.leadId,
    companyId: lead.companyId,
    projectId: lead.projectId,
    houseId: lead.houseId,
    houseName,
    origin: 'LEAD',
    leadId: lead.leadId,
    createdAt: lead.createdAt,
    contact: lead.contact,
    conversion: {
      source: lead.source,
      intent: lead.intent,
      status: lead.status,
    },
    profilZajemce: projectLeadProfilZajemce({ lead, snapshot }),
  };
}

function leadsForHouse(
  leads: readonly OperationalLeadRecord[],
  companyId: string,
  projectId: string,
  houseId: string,
): readonly OperationalLeadRecord[] {
  return leads.filter(
    (lead) =>
      lead.companyId === companyId &&
      lead.projectId === projectId &&
      lead.houseId === houseId,
  );
}

/**
 * House-scoped operational read path.
 * REFERENCE_DEMO instantiates templates onto THIS House identity.
 * Other modes return only durable records for the exact scope.
 * Never falls back to another House.
 */
export function selectHouseOperationalCases(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly houseName: string;
  readonly dataMode: HouseDataMode;
  readonly durableLeads: readonly OperationalLeadRecord[];
  readonly durableSessions?: readonly OperationalDecisionSnapshot[];
}): readonly HouseOperationalCase[] {
  const companyId = input.companyId.trim();
  const projectId = input.projectId.trim();
  const houseId = input.houseId.trim();
  if (
    companyId.length === 0 ||
    projectId.length === 0 ||
    houseId.length === 0
  ) {
    return [];
  }

  const referenceCases =
    input.dataMode === 'REFERENCE_DEMO'
      ? REFERENCE_CASE_TEMPLATES.map((template) =>
          instantiateTemplate(template, {
            companyId,
            projectId,
            houseId,
            houseName: input.houseName,
          }),
        )
      : [];

  const sessions = input.durableSessions ?? [];
  const leadCases = leadsForHouse(
    input.durableLeads,
    companyId,
    projectId,
    houseId,
  ).map((lead) =>
    leadToCase(lead, input.houseName, resolveCorrelatedSnapshot(lead, sessions)),
  );

  return [...referenceCases, ...leadCases];
}

/**
 * Workspace-scoped read: one House, or every House in the current Project
 * when `activeHouseId` is null ("Celý projekt").
 * `houses` must already be the Project's Houses.
 * An active House id that is not in that list → [].
 */
export function selectScopedOperationalCases(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly activeHouseId: string | null;
  readonly houses: readonly OperationalHouseScope[];
  readonly durableLeads: readonly OperationalLeadRecord[];
  readonly durableSessions?: readonly OperationalDecisionSnapshot[];
}): readonly HouseOperationalCase[] {
  const companyId = input.companyId.trim();
  const projectId = input.projectId.trim();
  if (companyId.length === 0 || projectId.length === 0) {
    return [];
  }

  const activeHouseId = input.activeHouseId?.trim() || null;
  const selectedHouses =
    activeHouseId === null
      ? input.houses
      : input.houses.filter((house) => house.houseId === activeHouseId);

  if (activeHouseId !== null && selectedHouses.length === 0) {
    return [];
  }

  return selectedHouses.flatMap((house) =>
    selectHouseOperationalCases({
      companyId,
      projectId,
      houseId: house.houseId,
      houseName: house.houseName,
      dataMode: house.dataMode,
      durableLeads: input.durableLeads,
      durableSessions: input.durableSessions,
    }),
  );
}
