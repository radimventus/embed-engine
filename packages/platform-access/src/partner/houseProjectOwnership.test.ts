import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_FIRST_DRAFT_HOUSE_ID,
} from '../registry/defaults';
import {
  BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  derivePartnerDraftHouseId,
  deriveReferenceInstanceHouseId,
} from '../reference/referenceSourceRegistry';
import { houseIdentityBelongsToAuthorizedProject } from './houseProjectOwnership';

const BLOKKI = {
  companyId: 'company-blokki',
  projectId: 'project-blokki',
} as const;

describe('houseIdentityBelongsToAuthorizedProject', () => {
  it('accepts project-scoped Blokki BUNGALOV and VPD identities', () => {
    const bungalov = deriveReferenceInstanceHouseId({
      sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
      companyId: BLOKKI.companyId,
      projectId: BLOKKI.projectId,
    });
    const vpd = derivePartnerDraftHouseId({
      companyId: BLOKKI.companyId,
      projectId: BLOKKI.projectId,
      houseSlug: 'vas-prvni-dum-5kk',
    });

    assert.equal(houseIdentityBelongsToAuthorizedProject(bungalov, BLOKKI), true);
    assert.equal(houseIdentityBelongsToAuthorizedProject(vpd, BLOKKI), true);
    assert.notEqual(bungalov, DSE_BUNGALOV_4KK_HOUSE_ID);
    assert.notEqual(vpd, DSE_FIRST_DRAFT_HOUSE_ID);
  });

  it('accepts seed DSE and AC registry Houses for their own Project', () => {
    assert.equal(
      houseIdentityBelongsToAuthorizedProject(DSE_BUNGALOV_4KK_HOUSE_ID, {
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
      }),
      true,
    );
    assert.equal(
      houseIdentityBelongsToAuthorizedProject(DSE_FIRST_DRAFT_HOUSE_ID, {
        companyId: DSE_COMPANY_ID,
        projectId: DSE_CANONICAL_PROJECT_ID,
      }),
      true,
    );
    assert.equal(
      houseIdentityBelongsToAuthorizedProject('modern-4kk', {
        companyId: 'ac-modular',
        projectId: 'project-ac-modular',
      }),
      true,
    );
  });

  it('rejects cross-Partner and cross-Project identities', () => {
    assert.equal(
      houseIdentityBelongsToAuthorizedProject(DSE_BUNGALOV_4KK_HOUSE_ID, BLOKKI),
      false,
    );
    assert.equal(
      houseIdentityBelongsToAuthorizedProject('modern-4kk', BLOKKI),
      false,
    );
    assert.equal(
      houseIdentityBelongsToAuthorizedProject(
        deriveReferenceInstanceHouseId({
          sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
          companyId: BLOKKI.companyId,
          projectId: 'project-other',
        }),
        BLOKKI,
      ),
      false,
    );
  });

  it('rejects unknown identities and display-name-like values', () => {
    assert.equal(
      houseIdentityBelongsToAuthorizedProject('BUNGALOV 4KK', BLOKKI),
      false,
    );
    assert.equal(
      houseIdentityBelongsToAuthorizedProject('stale-house', BLOKKI),
      false,
    );
    assert.equal(
      houseIdentityBelongsToAuthorizedProject('', BLOKKI),
      false,
    );
  });
});
