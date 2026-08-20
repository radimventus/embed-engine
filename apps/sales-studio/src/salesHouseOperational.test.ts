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
});
