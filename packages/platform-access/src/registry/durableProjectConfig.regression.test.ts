import assert from 'node:assert/strict';

import {
  applyDurableProjectConfig,
  applyDurableProjectConfigs,
  durableProjectBillingNumber,
  durableProjectCommercialProgramId,
  durableProjectCommercialProgramSelectedAt,
  durableProjectPrivacyUrl,
  resetDurableProjectConfigs,
} from './durableProjectConfig';

resetDurableProjectConfigs();

applyDurableProjectConfigs([
  {
    projectId: 'project-a',
    privacyUrl: 'https://example.test/privacy-a',
    billingNumber: '26010',
    commercialProgramId: null,
    commercialProgramSelectedAt: null,
  },
  {
    projectId: 'project-b',
    privacyUrl: 'https://example.test/privacy-b',
    billingNumber: '26011',
    commercialProgramId: 'pilot',
    commercialProgramSelectedAt:
      '2026-09-01T10:00:00.000Z',
  },
]);

applyDurableProjectConfig({
  projectId: 'project-a',
  privacyUrl: 'https://example.test/privacy-a',
  billingNumber: '26010',
  commercialProgramId: 'pilot',
  commercialProgramSelectedAt:
    '2026-09-02T10:00:00.000Z',
});

assert.equal(
  durableProjectBillingNumber('project-a'),
  '26010',
);

assert.equal(
  durableProjectPrivacyUrl('project-a'),
  'https://example.test/privacy-a',
);

assert.equal(
  durableProjectCommercialProgramId('project-a'),
  'pilot',
);

assert.equal(
  durableProjectCommercialProgramSelectedAt('project-a'),
  '2026-09-02T10:00:00.000Z',
);

assert.equal(
  durableProjectBillingNumber('project-b'),
  '26011',
);

assert.equal(
  durableProjectPrivacyUrl('project-b'),
  'https://example.test/privacy-b',
);

assert.equal(
  durableProjectCommercialProgramId('project-b'),
  'pilot',
);

console.log(
  'SINGLE_PROJECT_DURABLE_HYDRATION=PASS',
);

resetDurableProjectConfigs();
