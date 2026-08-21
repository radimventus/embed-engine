import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_FIRST_DRAFT_HOUSE_ID,
  DSE_WORKSPACE_ID,
} from '../registry/defaults';
import {
  resetCompanyRegistryExtras,
  upsertBuilderCanonicalProject,
  upsertBuilderCompany,
  upsertBuilderProject,
  upsertBuilderWorkspace,
} from '../registry/companyRegistry';
import {
  BUNGALOV_4KK_REFERENCE_SOURCE,
  BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  derivePartnerDraftHouseId,
  deriveReferenceInstanceHouseId,
} from '../reference/referenceSourceRegistry';
import { selectHouseOperationalCases } from '../operations/selectHouseOperationalCases';
import {
  buildDefaultPartnerVpdHouse,
  buildDefaultReferenceBungalovHouse,
  DEFAULT_PARTNER_DRAFT_HOUSE_SLUG,
  DEFAULT_VPD_PACKAGE_ROOT,
  housesForCanonicalProject,
  isDefaultPartnerVpdHouse,
  isDefaultReferenceBungalovHouse,
  provisionDefaultProjectHouses,
} from './defaultProjectHouses';

const partnerA = {
  companyId: 'company-nordic-homes',
  projectId: 'project-nordic-homes',
  workspaceId: 'workspace-nordic-homes',
} as const;

const partnerB = {
  companyId: 'company-alpine-build',
  projectId: 'project-alpine-build',
  workspaceId: 'workspace-alpine-build',
} as const;

function seedPartnerProject(scope: {
  readonly companyId: string;
  readonly projectId: string;
  readonly workspaceId: string;
  readonly companyName: string;
}): void {
  upsertBuilderCompany({
    id: scope.companyId,
    name: scope.companyName,
    tenantId: `tenant-${scope.companyId}`,
  });
  upsertBuilderWorkspace({
    id: scope.workspaceId,
    companyId: scope.companyId,
    name: `${scope.companyName} Workspace`,
  });
  upsertBuilderCanonicalProject({
    id: scope.projectId,
    companyId: scope.companyId,
    workspaceId: scope.workspaceId,
    name: scope.companyName,
    slug: scope.projectId.replace(/^project-/, ''),
    description: 'TASK-66 test project',
  });
}

describe('defaultProjectHouses recovery', () => {
  it('creates BUNGALOV + VPD when neither default exists', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });

    const result = provisionDefaultProjectHouses(partnerA);

    assert.equal(result.createdCount, 2);
    assert.deepEqual(result.created, ['bungalov-4kk', 'vas-prvni-dum']);
    const houses = housesForCanonicalProject(partnerA.companyId, partnerA.projectId);
    assert.equal(houses.length, 2);
    assert.equal(
      houses.some((house) => isDefaultReferenceBungalovHouse(house)),
      true,
    );
    assert.equal(
      houses.some((house) =>
        isDefaultPartnerVpdHouse(house, partnerA.companyId, partnerA.projectId),
      ),
      true,
    );
  });

  it('creates only VPD when BUNGALOV already exists', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    upsertBuilderProject(buildDefaultReferenceBungalovHouse(partnerA));

    const result = provisionDefaultProjectHouses(partnerA);

    assert.equal(result.createdCount, 1);
    assert.deepEqual(result.created, ['vas-prvni-dum']);
    assert.equal(housesForCanonicalProject(partnerA.companyId, partnerA.projectId).length, 2);
  });

  it('creates only BUNGALOV when VPD already exists', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    upsertBuilderProject(buildDefaultPartnerVpdHouse(partnerA));

    const result = provisionDefaultProjectHouses(partnerA);

    assert.equal(result.createdCount, 1);
    assert.deepEqual(result.created, ['bungalov-4kk']);
  });

  it('creates nothing when both defaults already exist', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    provisionDefaultProjectHouses(partnerA);
    const repeated = provisionDefaultProjectHouses(partnerA);

    assert.equal(repeated.createdCount, 0);
    assert.equal(repeated.message, 'Výchozí domy jsou již doplněny.');
    assert.equal(housesForCanonicalProject(partnerA.companyId, partnerA.projectId).length, 2);
  });

  it('recognizes renamed BUNGALOV by provenance, not display name', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    const bungalov = buildDefaultReferenceBungalovHouse(partnerA);
    upsertBuilderProject({ ...bungalov, name: 'CUSTOM BUNGALOV LABEL' });

    const result = provisionDefaultProjectHouses(partnerA);

    assert.equal(result.createdCount, 1);
    assert.deepEqual(result.created, ['vas-prvni-dum']);
  });

  it('recognizes renamed VPD by deterministic id, not display name', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    const vpd = buildDefaultPartnerVpdHouse(partnerA);
    upsertBuilderProject({ ...vpd, name: 'Starter House Renamed' });

    const result = provisionDefaultProjectHouses(partnerA);

    assert.equal(result.createdCount, 1);
    assert.deepEqual(result.created, ['bungalov-4kk']);
  });

  it('allows the same defaults independently in two Projects', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    seedPartnerProject({ ...partnerB, companyName: 'Alpine Build' });

    provisionDefaultProjectHouses(partnerA);
    provisionDefaultProjectHouses(partnerB);

    const housesA = housesForCanonicalProject(partnerA.companyId, partnerA.projectId);
    const housesB = housesForCanonicalProject(partnerB.companyId, partnerB.projectId);
    assert.equal(housesA.length, 2);
    assert.equal(housesB.length, 2);
    assert.notEqual(housesA[0]?.id, housesB[0]?.id);
    assert.notEqual(housesA[1]?.id, housesB[1]?.id);
  });

  it('derives unique Project-scoped identities and does not reuse DSE ids', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    provisionDefaultProjectHouses(partnerA);

    const bungalovId = deriveReferenceInstanceHouseId({
      sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
      companyId: partnerA.companyId,
      projectId: partnerA.projectId,
    });
    const vpdId = derivePartnerDraftHouseId({
      companyId: partnerA.companyId,
      projectId: partnerA.projectId,
      houseSlug: DEFAULT_PARTNER_DRAFT_HOUSE_SLUG,
    });

    assert.notEqual(bungalovId, DSE_BUNGALOV_4KK_HOUSE_ID);
    assert.notEqual(vpdId, DSE_FIRST_DRAFT_HOUSE_ID);
    assert.match(bungalovId, /^reference-v1-/);
    assert.match(vpdId, /^draft-/);
  });

  it('binds BUNGALOV to canonical reference package and REFERENCE_DEMO', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    provisionDefaultProjectHouses(partnerA);

    const bungalov = housesForCanonicalProject(partnerA.companyId, partnerA.projectId).find(
      isDefaultReferenceBungalovHouse,
    );
    assert.ok(bungalov !== undefined);
    assert.equal(bungalov.dataMode, 'REFERENCE_DEMO');
    assert.equal(bungalov.packageRoot, BUNGALOV_4KK_REFERENCE_SOURCE.packageRoot);
    assert.equal(bungalov.referenceProvenance?.sourceId, BUNGALOV_4KK_REFERENCE_SOURCE_ID);
  });

  it('binds VPD to patrovy-5kk starter package and LIVE_EMPTY', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    provisionDefaultProjectHouses(partnerA);

    const vpd = housesForCanonicalProject(partnerA.companyId, partnerA.projectId).find(
      (house) => isDefaultPartnerVpdHouse(house, partnerA.companyId, partnerA.projectId),
    );
    assert.ok(vpd !== undefined);
    assert.equal(vpd.dataMode, 'LIVE_EMPTY');
    assert.equal(vpd.packageRoot, DEFAULT_VPD_PACKAGE_ROOT);
    assert.equal(vpd.status, 'draft');
  });

  it('supplies three generic reference cases for a new Project-scoped BUNGALOV', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    provisionDefaultProjectHouses(partnerA);

    const bungalov = housesForCanonicalProject(partnerA.companyId, partnerA.projectId).find(
      isDefaultReferenceBungalovHouse,
    );
    assert.ok(bungalov !== undefined);

    const cases = selectHouseOperationalCases({
      companyId: partnerA.companyId,
      projectId: partnerA.projectId,
      houseId: bungalov.id,
      houseName: bungalov.name,
      dataMode: 'REFERENCE_DEMO',
      durableLeads: [],
    });

    assert.equal(cases.length, 3);
    assert.ok(cases.every((item) => item.origin === 'REFERENCE'));
    assert.ok(cases.every((item) => item.houseId === bungalov.id));
  });

  it('returns zero operational cases for VPD LIVE_EMPTY', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    provisionDefaultProjectHouses(partnerA);

    const vpd = housesForCanonicalProject(partnerA.companyId, partnerA.projectId).find(
      (house) => isDefaultPartnerVpdHouse(house, partnerA.companyId, partnerA.projectId),
    );
    assert.ok(vpd !== undefined);

    const cases = selectHouseOperationalCases({
      companyId: partnerA.companyId,
      projectId: partnerA.projectId,
      houseId: vpd.id,
      houseName: vpd.name,
      dataMode: 'LIVE_EMPTY',
      durableLeads: [],
    });

    assert.equal(cases.length, 0);
  });

  it('does not mutate DSE seed defaults when provisioning another Project', () => {
    resetCompanyRegistryExtras();
    seedPartnerProject({ ...partnerA, companyName: 'Nordic Homes' });
    provisionDefaultProjectHouses(partnerA);

    const dseHouses = housesForCanonicalProject(DSE_COMPANY_ID, DSE_CANONICAL_PROJECT_ID);
    assert.ok(dseHouses.some((house) => house.id === DSE_BUNGALOV_4KK_HOUSE_ID));
    assert.ok(dseHouses.some((house) => house.id === DSE_FIRST_DRAFT_HOUSE_ID));
    assert.equal(
      dseHouses.find((house) => house.id === DSE_BUNGALOV_4KK_HOUSE_ID)?.workspaceId,
      DSE_WORKSPACE_ID,
    );
  });
});
