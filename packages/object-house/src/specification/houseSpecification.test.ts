/**
 * CAP-REF-02 — House Specification foundation tests.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  createReferenceHouseSpecificationShell,
  ensureReferenceHouseSpecification,
  getHouseSpecification,
  listHouseSpecificationIds,
  resetHouseSpecificationsForTests,
  updateHouseSpecificationCategories,
  upsertHouseSpecification,
} from './houseSpecificationStore';
import {
  REFERENCE_COMPANY_ID,
  REFERENCE_HOUSE_ID,
  REFERENCE_HOUSE_NAME,
  REFERENCE_PROJECT_ID,
  type HouseSpecification,
} from './houseSpecificationTypes';

describe('CAP-REF-02 House Specification', () => {
  beforeEach(() => {
    resetHouseSpecificationsForTests();
  });

  it('belongs to House and is readable by houseId', () => {
    const shell = ensureReferenceHouseSpecification();
    assert.equal(shell.identity.houseId, REFERENCE_HOUSE_ID);
    assert.equal(shell.identity.name, REFERENCE_HOUSE_NAME);
    assert.equal(shell.identity.canonicalProjectId, REFERENCE_PROJECT_ID);
    assert.equal(shell.identity.companyId, REFERENCE_COMPANY_ID);
    assert.equal(shell.identity.role, 'reference');
    assert.equal(getHouseSpecification(REFERENCE_HOUSE_ID)?.identity.houseId, REFERENCE_HOUSE_ID);
    assert.equal('projectSpecification' in shell, false);
    assert.equal('companySpecification' in shell, false);
  });

  it('holds specification independently of Project; optional categories may be empty', () => {
    const shell = createReferenceHouseSpecificationShell();
    assert.equal(shell.dimensions, undefined);
    assert.equal(shell.energy, undefined);
    assert.equal(shell.price, undefined);
    assert.equal(shell.limitations, undefined);
    upsertHouseSpecification(shell);
    assert.deepEqual(listHouseSpecificationIds(), [REFERENCE_HOUSE_ID]);
  });

  it('updates categories without changing Partner / Project / House identity', () => {
    ensureReferenceHouseSpecification();
    const updated = updateHouseSpecificationCategories(REFERENCE_HOUSE_ID, {
      dimensions: { usableAreaM2: 98 },
      limitations: { limitations: ['schema-test-only'] },
    });
    assert.ok(updated);
    assert.equal(updated.identity.houseId, REFERENCE_HOUSE_ID);
    assert.equal(updated.identity.name, REFERENCE_HOUSE_NAME);
    assert.equal(updated.identity.canonicalProjectId, REFERENCE_PROJECT_ID);
    assert.equal(updated.identity.companyId, REFERENCE_COMPANY_ID);
    assert.equal(updated.dimensions?.usableAreaM2, 98);
    assert.deepEqual(updated.limitations?.limitations, ['schema-test-only']);

    const again = getHouseSpecification(REFERENCE_HOUSE_ID);
    assert.equal(again?.identity.canonicalProjectId, REFERENCE_PROJECT_ID);
    assert.equal(again?.identity.companyId, REFERENCE_COMPANY_ID);
  });

  it('rejects a second Reference House role', () => {
    const forged: HouseSpecification = {
      identity: {
        houseId: 'not-the-reference',
        name: 'Other',
        slug: 'other',
        objectType: 'villa',
        canonicalProjectId: REFERENCE_PROJECT_ID,
        companyId: REFERENCE_COMPANY_ID,
        status: 'draft',
        role: 'reference',
      },
    };
    assert.throws(() => upsertHouseSpecification(forged), /modern-4kk/);
  });

  it('preserves DSE hierarchy ids on Reference shell', () => {
    const shell = ensureReferenceHouseSpecification();
    assert.equal(shell.identity.companyId, 'company-domy-s-energii');
    assert.equal(shell.identity.canonicalProjectId, 'project-domy-s-energii');
    assert.equal(shell.identity.houseId, 'modern-4kk');
    assert.notEqual(shell.identity.houseId, shell.identity.canonicalProjectId);
    assert.notEqual(shell.identity.name, 'Domy s energií');
  });
});
