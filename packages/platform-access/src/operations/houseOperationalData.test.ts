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
import type { OperationalDecisionSnapshot, OperationalLeadRecord } from './operationalTypes';

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
    decisionSessionId: null,
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
    assert.deepEqual(vpd[0]?.profilZajemce.tags, []);
    assert.equal(vpd[0]?.profilZajemce.score, null);
    assert.equal(
      vpd[0]?.profilZajemce.journey.some(
        (step) => step.detail === 'Odeslána žádost o audit',
      ),
      true,
    );
    assert.equal(
      bungalov.some((item) => item.leadId === 'lead-vpd-1'),
      false,
    );
    assert.equal(bungalov.length, 3);
  });

  it('projects real selected priorities and truthful journey from a correlated session', () => {
    const accepted = lead({
      leadId: 'lead-real-1',
      houseId: vpdA.houseId,
      decisionSessionId: '11111111-1111-4111-8111-111111111111',
    });
    const snapshot: OperationalDecisionSnapshot = {
      decisionSessionId: '11111111-1111-4111-8111-111111111111',
      companyId: vpdA.companyId,
      projectId: vpdA.projectId,
      houseId: vpdA.houseId,
      priorityIds: ['layout', 'energy', 'plot'],
      priorityIntensities: {
        layout: 0.9,
        energy: 0.5,
        plot: 0.2,
      },
      activeRoomId: 'room-living',
      events: [
        { type: 'RoomSelected', roomId: 'room-living', at: 2 },
        {
          type: 'PriorityChanged',
          priorityIds: ['layout', 'energy', 'plot'],
          intensities: [
            { priorityId: 'layout', importance: 0.9 },
            { priorityId: 'energy', importance: 0.5 },
            { priorityId: 'plot', importance: 0.2 },
          ],
          at: 3,
        },
      ],
    };
    const cases = selectHouseOperationalCases({
      ...vpdA,
      durableLeads: [accepted],
      durableSessions: [snapshot],
    });
    assert.equal(cases.length, 1);
    assert.deepEqual(cases[0]?.profilZajemce.tags, [
      'Dispozice',
      'Energie',
      'Pozemek',
    ]);
    assert.equal(cases[0]?.profilZajemce.tags.includes('Žádost o audit'), false);
    assert.equal(cases[0]?.profilZajemce.score, null);
    assert.equal(
      cases[0]?.profilZajemce.priorities.find((item) => item.id === 'layout')
        ?.importance,
      0.9,
    );
    assert.equal(
      cases[0]?.profilZajemce.journey.some(
        (step) => step.module === 'Prohlídka domu' && step.detail === 'room-living',
      ),
      true,
    );
    assert.equal(
      cases[0]?.profilZajemce.journey.some(
        (step) => step.module === 'Priority' && step.title === 'Výběr priorit',
      ),
      true,
    );
    assert.equal(
      cases[0]?.profilZajemce.journey.some(
        (step) => step.detail === 'Odeslána žádost o audit',
      ),
      true,
    );
    assert.match(cases[0]?.profilZajemce.insight ?? '', /Dispozice/);
    assert.equal(cases[0]?.profilZajemce.location, null);
    assert.equal(
      aggregateHouseOperations(cases).priorityCounts.some(
        (item) => item.label === 'Dispozice',
      ),
      true,
    );
    assert.equal(aggregateHouseOperations(cases).highIntentCount, 0);
    assert.deepEqual(cases[0]?.profilZajemce.openedQuestions, []);
    assert.equal(
      cases[0]?.profilZajemce.priorities.every((item) => item.answer === null),
      true,
    );
    assert.equal(cases[0]?.profilZajemce.land, 'Nezadáno');
  });

  it('projects supplementary answers, unique FAQ opens, and audit land intent', () => {
    const accepted = lead({
      leadId: 'lead-signals',
      houseId: vpdA.houseId,
      decisionSessionId: '33333333-3333-4333-8333-333333333333',
    });
    const snapshot: OperationalDecisionSnapshot = {
      decisionSessionId: '33333333-3333-4333-8333-333333333333',
      companyId: vpdA.companyId,
      projectId: vpdA.projectId,
      houseId: vpdA.houseId,
      priorityIds: ['layout', 'plot', 'energy'],
      priorityIntensities: {
        layout: 0.9,
        plot: 0.6,
        energy: 0.3,
      },
      activeRoomId: 'kitchen',
      events: [
        { type: 'RoomSelected', roomId: 'kitchen', at: 1 },
        {
          type: 'PriorityChanged',
          priorityIds: ['layout', 'plot', 'energy'],
          intensities: [
            { priorityId: 'layout', importance: 0.9 },
            { priorityId: 'plot', importance: 0.6 },
            { priorityId: 'energy', importance: 0.3 },
          ],
          at: 2,
        },
        {
          type: 'QuestionAnswered',
          questionId: 'priority.energy',
          answerId: 'comfort',
          at: 3,
        },
        {
          type: 'QuestionOpened',
          questionId: 'energy-07',
          prompt: 'Jak poznám, že energie domu bude fungovat i v běžném dni?',
          at: 4,
        },
        {
          type: 'QuestionOpened',
          questionId: 'energy-07',
          prompt: 'Jak poznám, že energie domu bude fungovat i v běžném dni?',
          at: 5,
        },
        {
          type: 'QuestionOpened',
          questionId: 'layout-02',
          prompt: 'Jak velký dům budu ve skutečnosti potřebovat?',
          at: 6,
        },
        {
          type: 'QuestionAnswered',
          questionId: 'audit.land',
          answerId: 'owned',
          at: 7,
        },
      ],
    };
    const cases = selectHouseOperationalCases({
      ...vpdA,
      durableLeads: [accepted],
      durableSessions: [snapshot],
    });
    const profil = cases[0]?.profilZajemce;
    assert.equal(profil?.score, null);
    assert.equal(profil?.land, 'Mám pozemek');
    assert.equal(
      profil?.priorities.find((item) => item.id === 'energy')?.answer?.answerLabel,
      'Každodenní komfort',
    );
    assert.deepEqual(
      profil?.openedQuestions.map((item) => item.questionId),
      ['energy-07', 'layout-02'],
    );
    assert.equal(
      profil?.journey.some((step) => step.module === 'FAQ' && step.detail.includes('energie')),
      true,
    );
    assert.equal(
      profil?.journey.some(
        (step) =>
          step.module === 'Audit' && step.title === 'Mám pozemek',
      ),
      true,
    );
    assert.equal(
      profil?.openedQuestions.some((item) => item.questionId === 'unopened-faq'),
      false,
    );
  });

  it('projects searching-plot audit intent separately from has-plot', () => {
    const accepted = lead({
      leadId: 'lead-seeking',
      houseId: vpdA.houseId,
      decisionSessionId: '44444444-4444-4444-8444-444444444444',
    });
    const snapshot: OperationalDecisionSnapshot = {
      decisionSessionId: '44444444-4444-4444-8444-444444444444',
      companyId: vpdA.companyId,
      projectId: vpdA.projectId,
      houseId: vpdA.houseId,
      priorityIds: ['plot'],
      priorityIntensities: { plot: 0.7 },
      activeRoomId: null,
      events: [
        {
          type: 'PriorityChanged',
          priorityIds: ['plot'],
          intensities: [{ priorityId: 'plot', importance: 0.7 }],
          at: 1,
        },
        {
          type: 'QuestionAnswered',
          questionId: 'audit.land',
          answerId: 'seeking',
          at: 2,
        },
      ],
    };
    const cases = selectHouseOperationalCases({
      ...vpdA,
      durableLeads: [accepted],
      durableSessions: [snapshot],
    });
    const profil = cases[0]?.profilZajemce;
    assert.equal(profil?.land, 'Hledám pozemek');
    assert.equal(
      profil?.journey.some(
        (step) =>
          step.module === 'Audit' && step.title === 'Hledám pozemek',
      ),
      true,
    );
    assert.equal(
      profil?.journey.some((step) => step.detail === 'Hledá pozemek'),
      true,
    );
  });

  it('does not correlate a session from another House', () => {
    const accepted = lead({
      leadId: 'lead-mismatch',
      houseId: vpdA.houseId,
      decisionSessionId: '22222222-2222-4222-8222-222222222222',
    });
    const foreign: OperationalDecisionSnapshot = {
      decisionSessionId: '22222222-2222-4222-8222-222222222222',
      companyId: bungalowA.companyId,
      projectId: bungalowA.projectId,
      houseId: bungalowA.houseId,
      priorityIds: ['layout'],
      priorityIntensities: { layout: 1 },
      activeRoomId: null,
      events: [
        {
          type: 'PriorityChanged',
          priorityIds: ['layout'],
          intensities: [{ priorityId: 'layout', importance: 1 }],
          at: 1,
        },
      ],
    };
    const cases = selectHouseOperationalCases({
      ...vpdA,
      durableLeads: [accepted],
      durableSessions: [foreign],
    });
    assert.deepEqual(cases[0]?.profilZajemce.tags, []);
    assert.equal(cases[0]?.profilZajemce.score, null);
  });

  it('does not count an unscored real case as high-certainty alongside reference scores', () => {
    const accepted = lead({
      leadId: 'lead-unscored',
      houseId: bungalowA.houseId,
    });
    const cases = selectHouseOperationalCases({
      ...bungalowA,
      durableLeads: [accepted],
    });
    const aggregate = aggregateHouseOperations(cases);
    assert.equal(cases.length, 4);
    assert.equal(aggregate.convertedCount, 4);
    assert.equal(aggregate.highIntentCount, 2);
    assert.equal(
      cases.find((item) => item.origin === 'LEAD')?.profilZajemce.score,
      null,
    );
    assert.equal(
      cases
        .filter((item) => item.origin === 'REFERENCE')
        .every((item) => typeof item.profilZajemce.score === 'number'),
      true,
    );
  });
});
