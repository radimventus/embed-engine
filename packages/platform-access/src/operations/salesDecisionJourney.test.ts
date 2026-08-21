import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_FIRST_DRAFT_HOUSE_ID,
} from '../registry/defaults';
import { parseRoomsCsv } from './lookupRoomSalesLabel';
import {
  selectHouseOperationalCases,
  selectScopedOperationalCases,
} from './selectHouseOperationalCases';
import type {
  OperationalDecisionEvent,
  OperationalDecisionSnapshot,
  OperationalLeadRecord,
} from './operationalTypes';

const here = dirname(fileURLToPath(import.meta.url));
const bungalovRoomNames = parseRoomsCsv(
  readFileSync(
    join(
      here,
      '../../../../docs/house-packages/bungalov-4kk/rooms.csv',
    ),
    'utf8',
  ),
);

function lead(
  overrides: Partial<OperationalLeadRecord> = {},
): OperationalLeadRecord {
  return {
    leadId: 'lead-vr',
    companyId: DSE_COMPANY_ID,
    projectId: DSE_CANONICAL_PROJECT_ID,
    houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
    createdAt: '2026-08-20T18:00:00.000Z',
    source: 'EMBED',
    intent: 'audit',
    status: 'accepted',
    processingStatus: 'new',
    contact: {
      name: 'VR Zájemce',
      email: 'vr@example.cz',
      phone: '+420777000001',
    },
    decisionSessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    ...overrides,
  };
}

function snapshot(
  events: readonly OperationalDecisionEvent[],
  overrides: Partial<OperationalDecisionSnapshot> = {},
): OperationalDecisionSnapshot {
  return {
    decisionSessionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    companyId: DSE_COMPANY_ID,
    projectId: DSE_CANONICAL_PROJECT_ID,
    houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
    priorityIds: ['quality', 'layout', 'maintenance'],
    priorityIntensities: {
      quality: 0.8,
      layout: 0.5,
      maintenance: 0.27,
    },
    activeRoomId: 'children-room',
    events,
    ...overrides,
  };
}

const USER_ROOMS = [
  'exterior',
  'kitchen',
  'living-room',
  'office',
  'vestibule',
  'toilet',
  'bathroom',
  'wardrobe',
  'bedroom',
  'children-room',
] as const;

const USER_FAQ = [
  {
    questionId: 'faq-layout-idea',
    prompt: 'Co je hlavní myšlenkou dispozice 4KK?',
  },
  {
    questionId: 'faq-no-walls',
    prompt: 'Proč uvnitř nejsou nosné stěny?',
  },
  {
    questionId: 'faq-open-living',
    prompt: 'Je hlavní obytný prostor otevřený?',
  },
  {
    questionId: 'faq-attic',
    prompt: 'Kde je technické podkroví přístupné?',
  },
  {
    questionId: 'faq-office',
    prompt: 'Dá se pracovna využít jinak?',
  },
  {
    questionId: 'faq-garden',
    prompt: 'Mají pokoje přímý výstup ven?',
  },
] as const;

function userVrEvents(): readonly OperationalDecisionEvent[] {
  const events: OperationalDecisionEvent[] = [];
  let at = 1;
  for (const roomId of USER_ROOMS) {
    events.push({ type: 'RoomSelected', roomId, at: at++ });
  }
  events.push({ type: 'RoomSelected', roomId: 'kitchen', at: at++ });
  events.push({
    type: 'PriorityChanged',
    priorityIds: ['layout'],
    intensities: [{ priorityId: 'layout', importance: 0.5 }],
    at: at++,
  });
  events.push({
    type: 'PriorityChanged',
    priorityIds: ['quality', 'layout', 'maintenance'],
    intensities: [
      { priorityId: 'quality', importance: 0.8 },
      { priorityId: 'layout', importance: 0.5 },
      { priorityId: 'maintenance', importance: 0.27 },
    ],
    at: at++,
  });
  events.push({
    type: 'QuestionAnswered',
    questionId: 'priority.quality',
    answerId: 'detail',
    at: at++,
  });
  events.push({
    type: 'QuestionAnswered',
    questionId: 'priority.layout',
    answerId: 'flexibility',
    at: at++,
  });
  events.push({
    type: 'QuestionAnswered',
    questionId: 'priority.maintenance',
    answerId: 'predictable',
    at: at++,
  });
  for (const item of USER_FAQ) {
    events.push({
      type: 'QuestionOpened',
      questionId: item.questionId,
      prompt: item.prompt,
      at: at++,
    });
  }
  events.push({
    type: 'QuestionOpened',
    questionId: USER_FAQ[0].questionId,
    prompt: USER_FAQ[0].prompt,
    at: at++,
  });
  events.push({
    type: 'QuestionAnswered',
    questionId: 'audit.land',
    answerId: 'seeking',
    at: at++,
  });
  return events;
}

function projectUserCase(
  events: readonly OperationalDecisionEvent[] = userVrEvents(),
  roomNames: Readonly<Record<string, string>> = bungalovRoomNames,
) {
  const cases = selectHouseOperationalCases({
    companyId: DSE_COMPANY_ID,
    projectId: DSE_CANONICAL_PROJECT_ID,
    houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
    houseName: 'BUNGALOV 4KK',
    dataMode: 'LIVE_EMPTY',
    durableLeads: [lead()],
    durableSessions: [snapshot(events)],
    roomNames,
  });
  return cases[0]?.profilZajemce;
}

describe('Sales Decision Journey presentation', () => {
  it('groups multiple room events into one TOUR step with canonical labels', () => {
    const profil = projectUserCase();
    const tour = profil?.journey.filter((step) => step.module === 'Prohlídka domu');
    assert.equal(tour?.length, 1);
    assert.equal(tour?.[0]?.title, 'Prošel 10 částí domu:');
    assert.equal(
      tour?.[0]?.detail,
      'Exteriér, Kuchyně, Obývací pokoj, Pracovna, Zádveří a chodba, Toaleta, Koupelna, Šatna, Ložnice, Dětský pokoj',
    );
    assert.equal(tour?.[0]?.detail.includes('living-room'), false);
    assert.equal(tour?.[0]?.detail.includes('kitchen'), false);
    assert.match(tour?.[0]?.detail ?? '', /Obývací pokoj/);
  });

  it('humanizes room ids when House Package names are unavailable', () => {
    const profil = projectUserCase(userVrEvents(), {});
    const tour = profil?.journey.find((step) => step.module === 'Prohlídka domu');
    assert.equal(tour?.detail.includes('living-room'), false);
    assert.match(tour?.detail ?? '', /Living Room/);
  });

  it('does not create repetitive UI for duplicate room visits', () => {
    const profil = projectUserCase();
    const tour = profil?.journey.find((step) => step.module === 'Prohlídka domu');
    assert.equal(tour?.detail.split(', ').length, 10);
    assert.equal(
      profil?.journey.filter((step) => step.title === 'Navštívená místnost').length,
      0,
    );
  });

  it('projects Priority mutations into one final-intensity summary', () => {
    const profil = projectUserCase();
    const priority = profil?.journey.filter((step) => step.module === 'Priority');
    assert.equal(priority?.length, 1);
    assert.deepEqual(priority?.[0]?.lines, [
      'Kvalita · 80 %',
      'Dispozice · 50 %',
      'Údržba · 27 %',
    ]);
    assert.equal(priority?.[0]?.title.includes('Výběr'), false);
    assert.equal(priority?.[0]?.title.includes('Úprava'), false);
  });

  it('shows FAQ count and concrete opened questions in opening order without duplicates', () => {
    const profil = projectUserCase();
    const faq = profil?.journey.filter((step) => step.module === 'FAQ');
    assert.equal(faq?.length, 1);
    assert.equal(faq?.[0]?.title, 'Otevřené otázky · 6');
    assert.deepEqual(faq?.[0]?.lines, USER_FAQ.map((item) => item.prompt));
    assert.equal(profil?.openedQuestions.length, 6);
    assert.equal(
      profil?.openedQuestions.some((item) => item.questionId === 'unopened-faq'),
      false,
    );
  });

  it('renders searching and has-plot land intent once each', () => {
    const seeking = projectUserCase();
    assert.equal(
      seeking?.journey.filter((step) => step.module === 'Pozemek').length,
      1,
    );
    assert.equal(
      seeking?.journey.find((step) => step.module === 'Pozemek')?.title,
      'Hledá pozemek.',
    );
    assert.equal(seeking?.land, 'Hledám pozemek');

    const ownedEvents = userVrEvents().map((event) =>
      event.type === 'QuestionAnswered' && event.questionId === 'audit.land'
        ? { ...event, answerId: 'owned' }
        : event,
    );
    const owned = projectUserCase(ownedEvents);
    assert.equal(
      owned?.journey.filter((step) => step.module === 'Pozemek').length,
      1,
    );
    assert.equal(
      owned?.journey.find((step) => step.module === 'Pozemek')?.title,
      'Má pozemek a chce ověřit jeho vhodnost pro tento dům.',
    );
    assert.equal(owned?.land, 'Mám pozemek');
  });

  it('renders conversion as one final step', () => {
    const profil = projectUserCase();
    const conversion = profil?.journey.filter((step) => step.module === 'Konverze');
    assert.equal(conversion?.length, 1);
    assert.equal(conversion?.[0]?.title, 'Odeslal žádost o audit.');
    assert.equal(conversion?.[0]?.active, true);
    assert.equal(
      profil?.journey.some((step) => step.module === 'Zachycení kontaktu'),
      false,
    );
  });

  it('omits unavailable sections for a sparse legacy Lead', () => {
    const cases = selectHouseOperationalCases({
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      houseId: DSE_FIRST_DRAFT_HOUSE_ID,
      houseName: 'VÁŠ PRVNÍ DŮM',
      dataMode: 'LIVE_EMPTY',
      durableLeads: [
        lead({
          leadId: 'lead-legacy',
          houseId: DSE_FIRST_DRAFT_HOUSE_ID,
          decisionSessionId: null,
        }),
      ],
    });
    const profil = cases[0]?.profilZajemce;
    assert.equal(profil?.score, null);
    assert.equal(profil?.readinessScore, null);
    assert.deepEqual(profil?.priorities, []);
    assert.deepEqual(profil?.openedQuestions, []);
    assert.equal(profil?.land, 'Nezadáno');
    assert.deepEqual(
      profil?.journey.map((step) => step.module),
      ['Konverze'],
    );
    assert.equal(
      profil?.journey.some((step) => step.module === 'Prohlídka domu'),
      false,
    );
    assert.equal(
      profil?.journey.some((step) => step.module === 'FAQ'),
      false,
    );
  });

  it('keeps REAL legacy score null, scores Index připravenosti, and leaves REFERENCE readiness unavailable', () => {
    const real = projectUserCase();
    assert.equal(real?.score, null);
    assert.equal(real?.readinessScore, 52);

    const reference = selectHouseOperationalCases({
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      houseName: 'BUNGALOV 4KK',
      dataMode: 'REFERENCE_DEMO',
      durableLeads: [],
    });
    assert.equal(reference.length, 3);
    assert.equal(
      reference.every((item) => typeof item.profilZajemce.score === 'number'),
      true,
    );
    assert.equal(
      reference.every((item) => item.profilZajemce.readinessScore === null),
      true,
    );
    assert.equal(
      reference.every((item) => item.profilZajemce.journey.length > 0),
      true,
    );
    assert.equal(
      reference.some((item) =>
        item.profilZajemce.journey.some(
          (step) => step.title === 'Navštívená místnost',
        ),
      ),
      false,
    );
  });

  it('does not leak House cases across House or Project scope', () => {
    const houses = [
      {
        houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        houseName: 'BUNGALOV 4KK',
        dataMode: 'LIVE_EMPTY' as const,
        roomNames: bungalovRoomNames,
      },
      {
        houseId: DSE_FIRST_DRAFT_HOUSE_ID,
        houseName: 'VÁŠ PRVNÍ DŮM',
        dataMode: 'LIVE_EMPTY' as const,
      },
    ];
    const bungalov = selectScopedOperationalCases({
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      houses,
      durableLeads: [lead()],
      durableSessions: [snapshot(userVrEvents())],
    });
    const vpd = selectScopedOperationalCases({
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      activeHouseId: DSE_FIRST_DRAFT_HOUSE_ID,
      houses,
      durableLeads: [lead()],
      durableSessions: [snapshot(userVrEvents())],
    });
    const otherProject = selectScopedOperationalCases({
      companyId: DSE_COMPANY_ID,
      projectId: 'project-other',
      activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      houses,
      durableLeads: [lead()],
      durableSessions: [snapshot(userVrEvents())],
    });
    assert.equal(bungalov.length, 1);
    assert.equal(bungalov[0]?.profilZajemce.journey.length, 5);
    assert.deepEqual(vpd, []);
    assert.deepEqual(otherProject, []);
  });
});
