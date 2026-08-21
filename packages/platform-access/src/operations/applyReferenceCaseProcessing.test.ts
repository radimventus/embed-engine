import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyReferenceCaseProcessing } from './applyReferenceCaseProcessing';
import { selectHouseOperationalCases } from './selectHouseOperationalCases';
import {
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
} from '../registry/defaults';

describe('applyReferenceCaseProcessing', () => {
  it('keeps REFERENCE NEW until a durable accepted record exists', () => {
    const cases = selectHouseOperationalCases({
      companyId: DSE_COMPANY_ID,
      projectId: DSE_CANONICAL_PROJECT_ID,
      houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      houseName: 'BUNGALOV 4KK',
      dataMode: 'REFERENCE_DEMO',
      durableLeads: [],
    });
    assert.equal(cases.length, 3);
    assert.equal(
      cases.every((item) => item.processingStatus === 'new'),
      true,
    );
    const first = cases[0]!;
    const overlaid = applyReferenceCaseProcessing(cases, [
      {
        caseId: first.caseId,
        companyId: first.companyId,
        projectId: first.projectId,
        houseId: first.houseId,
        processingStatus: 'accepted',
      },
    ]);
    assert.equal(overlaid[0]?.processingStatus, 'accepted');
    assert.equal(overlaid[1]?.processingStatus, 'new');
  });
});
