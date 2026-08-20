import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  applyDurableProjectConfigs,
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  getCanonicalHouse,
  getCanonicalProject,
  resetCompanyRegistryExtras,
} from '@embed-engine/platform-access';

import { FileProjectConfigRepository } from './projectConfigRepository';
import { resolveLeadScope } from './leadScope';

describe('Shared Project privacy authority', () => {
  it('durable Project config, projection, and lead scope share one URL', async () => {
    resetCompanyRegistryExtras();
    const directory = await mkdtemp(join(tmpdir(), 'conis-project-privacy-authority-'));
    try {
      const repository = new FileProjectConfigRepository(
        join(directory, 'project-config.json'),
      );
      const saved = await repository.upsert({
        projectId: DSE_CANONICAL_PROJECT_ID,
        privacyUrl: 'https://dse.example/zasady',
      });
      applyDurableProjectConfigs(await repository.list());

      const projected = getCanonicalProject(DSE_CANONICAL_PROJECT_ID);
      const house = getCanonicalHouse(DSE_BUNGALOV_4KK_HOUSE_ID);
      const scope = resolveLeadScope({
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
        houseId: DSE_BUNGALOV_4KK_HOUSE_ID,
      });

      assert.equal(saved.privacyUrl, 'https://dse.example/zasady');
      assert.equal(projected?.project.privacyUrl, saved.privacyUrl);
      assert.equal(house?.project.privacyUrl, saved.privacyUrl);
      assert.equal(scope.privacyUrl, saved.privacyUrl);
      assert.equal('privacyUrl' in (projected?.partner ?? {}), false);
    } finally {
      await rm(directory, { recursive: true, force: true });
      resetCompanyRegistryExtras();
    }
  });
});
