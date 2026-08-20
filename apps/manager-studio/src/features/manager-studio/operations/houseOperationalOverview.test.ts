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
  aggregateHouseOperations,
  selectHouseOperationalCases,
  selectScopedOperationalCases,
} from '@embed-engine/platform-access';

const here = dirname(fileURLToPath(import.meta.url));
const managerRoot = join(here, '../../../..');

describe('Manager House operational aggregates', () => {
  it('derives BUNGALOV totals from three canonical cases', () => {
    const cases = selectHouseOperationalCases({
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      houseName: 'BUNGALOV 4KK',
      dataMode: 'REFERENCE_DEMO',
      durableLeads: [],
    });
    const aggregate = aggregateHouseOperations(cases);
    assert.equal(aggregate.caseCount, 3);
    assert.equal(aggregate.convertedCount, 3);
    assert.equal(aggregate.highIntentCount, 2);
  });

  it('shows VPD as zero-record pre-data', () => {
    const aggregate = aggregateHouseOperations(
      selectHouseOperationalCases({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        houseId: DSE_FIRST_DRAFT_HOUSE_ID,
        houseName: 'VÁŠ PRVNÍ DŮM',
        dataMode: 'LIVE_EMPTY',
        durableLeads: [],
      }),
    );
    assert.equal(aggregate.caseCount, 0);
  });

  it('recomputes aggregates after House and Project switch', () => {
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
    const bungalov = aggregateHouseOperations(
      selectScopedOperationalCases({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        houses,
        durableLeads: [],
      }),
    );
    const vpd = aggregateHouseOperations(
      selectScopedOperationalCases({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        activeHouseId: DSE_FIRST_DRAFT_HOUSE_ID,
        houses,
        durableLeads: [],
      }),
    );
    const otherProject = aggregateHouseOperations(
      selectScopedOperationalCases({
        companyId: DSE_COMPANY_ID,
        projectId: 'project-other',
        activeHouseId: DSE_BUNGALOV_4KK_HOUSE_ID,
        houses: [],
        durableLeads: [],
      }),
    );
    assert.equal(bungalov.caseCount, 3);
    assert.equal(vpd.caseCount, 0);
    assert.equal(otherProject.caseCount, 0);
  });

  it('does not keep a Manager-local fixture fallback', () => {
    const workCenter = readFileSync(
      join(managerRoot, 'src/features/manager-studio/ManagerWorkCenterHome.tsx'),
      'utf8',
    );
    assert.match(workCenter, /useHouseOperationalCases/);
    assert.match(workCenter, /aggregate\.caseCount === 0/);
    assert.doesNotMatch(workCenter, /Pokles ve kroku Finance/);
    assert.doesNotMatch(workCenter, /value="1000"/);
    assert.doesNotMatch(workCenter, /Ukázkové metriky/);
  });
});
