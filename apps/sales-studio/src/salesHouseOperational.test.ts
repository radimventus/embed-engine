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
  selectHouseOperationalCases,
  selectScopedOperationalCases,
} from '@embed-engine/platform-access';

import { toSalesClients } from './sales/salesClients.ts';

const here = dirname(fileURLToPath(import.meta.url));

describe('Sales House operational desk', () => {
  it('projects three BUNGALOV reference cases and an empty VPD desk', () => {
    const bungalov = toSalesClients(
      selectHouseOperationalCases({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        houseName: 'BUNGALOV 4KK',
        dataMode: 'REFERENCE_DEMO',
        durableLeads: [],
      }),
    );
    const vpd = toSalesClients(
      selectHouseOperationalCases({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        houseId: DSE_FIRST_DRAFT_HOUSE_ID,
        houseName: 'VÁŠ PRVNÍ DŮM',
        dataMode: 'LIVE_EMPTY',
        durableLeads: [],
      }),
    );

    assert.equal(bungalov.length, 3);
    assert.equal(
      bungalov.every((client) => client.houses[0]?.id === DSE_BUNGALOV_4KK_HOUSE_ID),
      true,
    );
    assert.deepEqual(vpd, []);
  });

  it('drops BUNGALOV cases immediately when the workspace House is VPD', () => {
    const houses = [
      {
        houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        houseName: 'BUNGALOV 4KK',
        dataMode: 'REFERENCE_DEMO' as const,
      },
      {
        houseId: DSE_FIRST_DRAFT_HOUSE_ID,
        houseName: 'VÁŠ PRVNÍ DŮM',
        dataMode: 'LIVE_EMPTY' as const,
      },
    ];
    const afterSwitch = toSalesClients(
      selectScopedOperationalCases({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        activeHouseId: DSE_FIRST_DRAFT_HOUSE_ID,
        houses,
        durableLeads: [],
      }),
    );
    assert.deepEqual(afterSwitch, []);
  });

  it('does not keep cases after a Project switch to a House-less scope', () => {
    const afterProject = toSalesClients(
      selectScopedOperationalCases({
        companyId: DSE_COMPANY_ID,
        projectId: 'project-other',
        activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        houses: [],
        durableLeads: [],
      }),
    );
    assert.deepEqual(afterProject, []);
  });

  it('does not keep a Studio-local fixture fallback', () => {
    const app = readFileSync(join(here, 'SalesStudioApp.tsx'), 'utf8');
    const clients = readFileSync(join(here, 'sales/salesClients.ts'), 'utf8');
    assert.match(app, /useHouseOperationalCases/);
    assert.match(app, /sales-operational-empty/);
    assert.doesNotMatch(clients, /SALES_CLIENTS/);
    assert.doesNotMatch(app, /SALES_CLIENTS/);
    assert.doesNotMatch(app, /harmony-124/);
  });

  it('renders real selected priorities and does not fabricate 70 for a Lead case', () => {
    const clients = toSalesClients(
      selectHouseOperationalCases({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        houseId: DSE_FIRST_DRAFT_HOUSE_ID,
        houseName: 'VÁŠ PRVNÍ DŮM',
        dataMode: 'LIVE_EMPTY',
        durableLeads: [
          {
            leadId: 'lead-real',
            companyId: DSE_COMPANY_ID,
            projectId: DSE_CANONICAL_PROJECT_ID,
            houseId: DSE_FIRST_DRAFT_HOUSE_ID,
            createdAt: '2026-08-20T10:00:00.000Z',
            source: 'EMBED',
            intent: 'audit',
            status: 'accepted',
            contact: {
              name: 'Petr Lead',
              email: 'petr.lead@example.cz',
              phone: null,
            },
            decisionSessionId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
          },
        ],
        durableSessions: [
          {
            decisionSessionId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
            companyId: DSE_COMPANY_ID,
            projectId: DSE_CANONICAL_PROJECT_ID,
            houseId: DSE_FIRST_DRAFT_HOUSE_ID,
            priorityIds: ['layout', 'energy', 'plot'],
            priorityIntensities: { layout: 0.9, energy: 0.4, plot: 0.2 },
            activeRoomId: 'room-living',
            events: [
              { type: 'RoomSelected', roomId: 'room-living', at: 2 },
              {
                type: 'PriorityChanged',
                priorityIds: ['layout', 'energy', 'plot'],
                intensities: [
                  { priorityId: 'layout', importance: 0.9 },
                  { priorityId: 'energy', importance: 0.4 },
                  { priorityId: 'plot', importance: 0.2 },
                ],
                at: 3,
              },
            ],
          },
        ],
      }),
    );
    assert.equal(clients.length, 1);
    assert.deepEqual(clients[0]?.houses[0]?.tags, [
      'Dispozice',
      'Energie',
      'Pozemek',
    ]);
    assert.equal(clients[0]?.houses[0]?.score, null);
    assert.equal(clients[0]?.houses[0]?.tags.includes('Žádost o audit'), false);
    assert.equal(clients[0]?.houses[0]?.priorities.length, 3);
    assert.equal(clients[0]?.houses[0]?.openedQuestions.length, 0);
    const journey = clients[0]?.houses[0]?.journey ?? [];
    assert.equal(
      journey.filter((step) => step.module === 'Prohlídka domu').length,
      1,
    );
    assert.equal(
      journey.some((step) => step.detail === 'room-living'),
      false,
    );
    assert.equal(journey.filter((step) => step.module === 'Priority').length, 1);
    assert.equal(
      (journey.find((step) => step.module === 'Priority')?.lines ?? []).join(' '),
      'Dispozice · 90 % Energie · 40 % Pozemek · 20 %',
    );
  });
});
