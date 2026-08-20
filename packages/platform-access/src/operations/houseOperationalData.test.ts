import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_COMPANY_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_FIRST_DRAFT_HOUSE_ID,
} from '../registry/defaults';
import { aggregateHouseOperations } from './aggregateHouseOperations';
import { REFERENCE_CASE_TEMPLATE_IDS } from './referenceOperationalTemplates';
import {
  selectHouseOperationalCases,
  selectScopedOperationalCases,
} from './selectHouseOperationalCases';
import type { OperationalLeadRecord } from './operationalTypes';

function lead(
  overrides: Partial<OperationalLeadRecord> = {},
): OperationalLeadRecord {
  return {
    leadId: 'lead-1',
    companyId: 'company-a',
    projectId: 'project-a',
    houseId: 'house-h',
    createdAt: '2026-08-20T10:00:00.000Z',
    source: 'EMBED',
    intent: 'audit',
    status: 'accepted',
    contact: {
      name: 'Petr Lead',
      email: 'petr.lead@example.cz',
      phone: null,
    },
    ...overrides,
  };
}

const bungalowA = {
  companyId: 'company-a',
  projectId: 'project-a',
  houseId: 'reference-v1-company-a-project-a-bungalov-4kk',
  houseName: 'BUNGALOV 4KK',
  dataMode: 'REFERENCE_DEMO' as const,
};

const vpdA = {
  companyId: 'company-a',
  projectId: 'project-a',
  houseId: 'draft-company-a-project-a-vas-prvni-dum-5kk',
  houseName: 'VÁŠ PRVNÍ DŮM',
  dataMode: 'LIVE_EMPTY' as const,
};

const bungalowB = {
  companyId: 'company-a',
  projectId: 'project-b',
  houseId: 'reference-v1-company-a-project-b-bungalov-4kk',
  houseName: 'BUNGALOV 4KK',
  dataMode: 'REFERENCE_DEMO' as const,
};

describe('House operational data path', () => {
  it('returns zero records for a LIVE_EMPTY House with no durable leads', () => {
    const cases = selectHouseOperationalCases({
      ...vpdA,
      durableLeads: [],
    });
    assert.deepEqual(cases, []);
    assert.equal(aggregateHouseOperations(cases).caseCount, 0);
  });

  it('accumulates durable leads for the same House without seeding', () => {
    const first = lead({ leadId: 'lead-1', houseId: vpdA.houseId });
    const second = lead({
      leadId: 'lead-2',
      houseId: vpdA.houseId,
      createdAt: '2026-08-20T11:00:00.000Z',
    });

    assert.equal(
      selectHouseOperationalCases({ ...vpdA, durableLeads: [first] }).length,
      1,
    );
    const accumulated = selectHouseOperationalCases({
      ...vpdA,
      durableLeads: [first, second],
    });
    assert.equal(accumulated.length, 2);
    assert.deepEqual(
      accumulated.map((item) => item.caseId),
      ['lead-1', 'lead-2'],
    );
    assert.equal(accumulated.every((item) => item.origin === 'LEAD'), true);
    assert.equal(accumulated.every((item) => item.houseId === vpdA.houseId), true);
    assert.equal(aggregateHouseOperations(accumulated).caseCount, 2);
    assert.equal(aggregateHouseOperations(accumulated).convertedCount, 2);
  });

  it('seeds exactly three REFERENCE_DEMO cases onto the active House identity', () => {
    const cases = selectHouseOperationalCases({
      ...bungalowA,
      durableLeads: [],
    });
    assert.equal(cases.length, 3);
    assert.deepEqual(
      cases.map((item) => item.caseId.split(':').at(-1)),
      [...REFERENCE_CASE_TEMPLATE_IDS],
    );
    assert.equal(cases.every((item) => item.origin === 'REFERENCE'), true);
    assert.equal(cases.every((item) => item.houseId === bungalowA.houseId), true);
    assert.equal(cases.every((item) => item.companyId === bungalowA.companyId), true);
    assert.equal(cases.every((item) => item.projectId === bungalowA.projectId), true);
    assert.equal(
      cases.every((item) => item.profilZajemce.tags.length > 0),
      true,
    );
    assert.equal(
      new Set(cases.map((item) => item.contact.email)).size,
      3,
    );
  });

  it('does not use the DSE BUNGALOV id as a global reference key', () => {
    const partnerA = selectHouseOperationalCases({
      ...bungalowA,
      durableLeads: [],
    });
    const partnerB = selectHouseOperationalCases({
      companyId: 'company-beta',
      projectId: 'project-beta',
      houseId: 'reference-v1-company-beta-project-beta-bungalov-4kk',
      houseName: 'BUNGALOV 4KK',
      dataMode: 'REFERENCE_DEMO',
      durableLeads: [],
    });

    assert.notEqual(bungalowA.houseId, DSE_BUNGALOV_4KK_HOUSE_ID);
    assert.equal(
      partnerA.some((item) => item.houseId === DSE_BUNGALOV_4KK_HOUSE_ID),
      false,
    );
    assert.notDeepEqual(
      partnerA.map((item) => item.caseId),
      partnerB.map((item) => item.caseId),
    );
    assert.equal(
      partnerA[0]?.caseId.includes(DSE_BUNGALOV_4KK_HOUSE_ID),
      false,
    );
  });

  it('keeps DSE VPD unseeded while DSE BUNGALOV is seeded', () => {
    const bungalov = selectHouseOperationalCases({
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      houseName: 'BUNGALOV 4KK',
      dataMode: 'REFERENCE_DEMO',
      durableLeads: [],
    });
    const vpd = selectHouseOperationalCases({
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      houseId: DSE_FIRST_DRAFT_HOUSE_ID,
      houseName: 'VÁŠ PRVNÍ DŮM',
      dataMode: 'LIVE_EMPTY',
      durableLeads: [],
    });
    assert.equal(bungalov.length, 3);
    assert.deepEqual(vpd, []);
  });

  it('never falls back to another House or Project', () => {
    const foreignLead = lead({
      leadId: 'lead-foreign',
      houseId: bungalowA.houseId,
    });
    const vpd = selectHouseOperationalCases({
      ...vpdA,
      durableLeads: [foreignLead],
    });
    assert.deepEqual(vpd, []);

    const otherProject = selectHouseOperationalCases({
      ...bungalowB,
      durableLeads: [foreignLead],
    });
    assert.equal(
      otherProject.some((item) => item.origin === 'LEAD'),
      false,
    );
    assert.equal(otherProject.length, 3);
    assert.equal(
      otherProject.every((item) => item.projectId === bungalowB.projectId),
      true,
    );
  });

  it('isolates Company B from Company A records', () => {
    const companyALead = lead({
      companyId: 'company-a',
      projectId: 'project-x',
      houseId: 'house-x',
    });
    const companyB = selectHouseOperationalCases({
      companyId: 'company-b',
      projectId: 'project-x',
      houseId: 'house-x',
      houseName: 'VÁŠ PRVNÍ DŮM',
      dataMode: 'LIVE_EMPTY',
      durableLeads: [companyALead],
    });
    assert.deepEqual(companyB, []);
  });

  it('aggregates current Project Houses when workspace House is unset', () => {
    const projectWide = selectScopedOperationalCases({
      companyId: 'company-a',
      projectId: 'project-a',
      activeHouseId: null,
      houses: [
        {
          houseId: bungalowA.houseId,
          houseName: bungalowA.houseName,
          dataMode: bungalowA.dataMode,
        },
        {
          houseId: vpdA.houseId,
          houseName: vpdA.houseName,
          dataMode: vpdA.dataMode,
        },
      ],
      durableLeads: [],
    });
    assert.equal(projectWide.length, 3);
    assert.equal(
      projectWide.every((item) => item.houseId === bungalowA.houseId),
      true,
    );
  });

  it('clears previous House cases immediately on House switch', () => {
    const houses = [
      {
        houseId: bungalowA.houseId,
        houseName: bungalowA.houseName,
        dataMode: bungalowA.dataMode,
      },
      {
        houseId: vpdA.houseId,
        houseName: vpdA.houseName,
        dataMode: vpdA.dataMode,
      },
    ];
    const bungalov = selectScopedOperationalCases({
      companyId: 'company-a',
      projectId: 'project-a',
      activeHouseId: bungalowA.houseId,
      houses,
      durableLeads: [],
    });
    const vpd = selectScopedOperationalCases({
      companyId: 'company-a',
      projectId: 'project-a',
      activeHouseId: vpdA.houseId,
      houses,
      durableLeads: [],
    });
    assert.equal(bungalov.length, 3);
    assert.deepEqual(vpd, []);
  });

  it('drops stale House cases when the Project changes', () => {
    const stale = selectScopedOperationalCases({
      companyId: 'company-a',
      projectId: 'project-b',
      activeHouseId: bungalowA.houseId,
      houses: [
        {
          houseId: bungalowB.houseId,
          houseName: bungalowB.houseName,
          dataMode: bungalowB.dataMode,
        },
      ],
      durableLeads: [],
    });
    assert.deepEqual(stale, []);
  });

  it('derives Manager totals from the same three reference cases', () => {
    const cases = selectHouseOperationalCases({
      ...bungalowA,
      durableLeads: [],
    });
    const aggregate = aggregateHouseOperations(cases);
    assert.equal(aggregate.caseCount, 3);
    assert.equal(aggregate.convertedCount, 3);
    assert.equal(aggregate.highIntentCount, 2);
    assert.ok(aggregate.priorityCounts.length > 0);
    assert.ok(
      aggregate.priorityCounts.every((item) => item.count <= aggregate.caseCount),
    );
    assert.ok(
      aggregate.journeyModuleCounts.every(
        (item) => item.completedCount <= aggregate.caseCount,
      ),
    );
  });

  it('maps an accepted Lead onto the operational case for that House only', () => {
    const accepted = lead({
      leadId: 'lead-vpd-1',
      houseId: vpdA.houseId,
    });
    const vpd = selectHouseOperationalCases({
      ...vpdA,
      durableLeads: [accepted],
    });
    const bungalov = selectHouseOperationalCases({
      ...bungalowA,
      durableLeads: [accepted],
    });
    assert.equal(vpd.length, 1);
    assert.equal(vpd[0]?.leadId, 'lead-vpd-1');
    assert.equal(vpd[0]?.caseId, 'lead-vpd-1');
    assert.equal(vpd[0]?.profilZajemce.tags.includes('Žádost o audit'), true);
    assert.equal(
      bungalov.some((item) => item.leadId === 'lead-vpd-1'),
      false,
    );
    assert.equal(bungalov.length, 3);
  });
});
