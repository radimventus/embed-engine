import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyDurableProjectConfigs,
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  getCanonicalProject,
  resetCompanyRegistryExtras,
} from '@embed-engine/platform-access';

import { resolveLeadScope } from './leadScope';

test('resolveLeadScope fails closed when canonical Project privacyUrl is missing', () => {
  resetCompanyRegistryExtras();
  const project = getCanonicalProject(DSE_CANONICAL_PROJECT_ID);

  assert.ok(project !== null);
  assert.equal(project.project.privacyUrl, undefined);

  assert.throws(
    () =>
      resolveLeadScope({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      }),
    /Invalid lead scope or missing partner privacy configuration/,
  );
});

test('resolveLeadScope rejects unknown Company', () => {
  assert.throws(
    () =>
      resolveLeadScope({
        companyId: 'company-does-not-exist',
        projectId: DSE_CANONICAL_PROJECT_ID,
        houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      }),
    /Invalid lead scope or missing partner privacy configuration/,
  );
});

test('resolveLeadScope rejects unknown Project', () => {
  assert.throws(
    () =>
      resolveLeadScope({
        companyId: DSE_COMPANY_ID,
        projectId: 'project-does-not-exist',
        houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      }),
    /Invalid lead scope or missing partner privacy configuration/,
  );
});

test('resolveLeadScope rejects unknown House', () => {
  assert.throws(
    () =>
      resolveLeadScope({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        houseId: 'house-does-not-exist',
      }),
    /Invalid lead scope or missing partner privacy configuration/,
  );
});

test('resolveLeadScope rejects a House from a different Project', () => {
  applyDurableProjectConfigs([
    {
      projectId: DSE_CANONICAL_PROJECT_ID,
      privacyUrl: 'https://dse.example/privacy',
    },
  ]);
  assert.throws(
    () =>
      resolveLeadScope({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        houseId: 'villa-168',
      }),
    /Invalid lead scope or missing partner privacy configuration/,
  );
  resetCompanyRegistryExtras();
});

test('resolveLeadScope returns the authoritative Project privacyUrl', () => {
  applyDurableProjectConfigs([
    {
      projectId: DSE_CANONICAL_PROJECT_ID,
      privacyUrl: 'https://dse.example/privacy',
    },
  ]);
  const scope = resolveLeadScope({
    companyId: DSE_COMPANY_ID,
    projectId: DSE_CANONICAL_PROJECT_ID,
    houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
  });
  assert.equal(scope.companyId, DSE_COMPANY_ID);
  assert.equal(scope.projectId, DSE_CANONICAL_PROJECT_ID);
  assert.equal(scope.houseId, DSE_BUNGALOV_4KK_HOUSE_ID);
  assert.equal(scope.privacyUrl, 'https://dse.example/privacy');
  resetCompanyRegistryExtras();
});
