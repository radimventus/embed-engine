/**
 * CAP-PLAT-02 / CAP-PLAT-04 — Canonical Projection Layer foundation tests.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  resetCompanyRegistryExtras,
  DEFAULT_PROJECT_ID,
  upsertBuilderCompany,
  upsertBuilderCanonicalProject,
  getDefaultCompanyRegistry,
} from '../registry/companyRegistry';
import { resetSharedProjectManifestsForTests } from '../project/projectRepository';
import {
  getCanonicalCompany,
  getCanonicalHouse,
  getCanonicalHouseEntity,
  getCanonicalProject,
  isCanonicalProjectId,
  isCanonicalSeedProject,
  listCanonicalCompanies,
  listCanonicalHouseEntities,
  listCanonicalHouses,
  listCanonicalProjects,
  resolveCanonicalRuntimeBinding,
  toCanonicalEntityHierarchy,
} from './canonicalProjectProjection';

describe('CAP-PLAT-02 Canonical Projection Layer', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('projects partner / project / house / branding / publication / experience slices', () => {
    const villa = getCanonicalProject(DEFAULT_PROJECT_ID);
    assert.ok(villa);
    assert.ok(villa.house);
    assert.equal(villa.partner.companyId, 'ac-modular');
    assert.equal(villa.partner.workspaceName, 'AC Modular Main');
    assert.equal(villa.project.projectId, 'project-ac-modular');
    assert.equal(villa.project.name, 'AC Modular');
    assert.equal('objectType' in villa.project, false);
    assert.equal(villa.house.houseId, 'villa-168');
    assert.equal(villa.house.name, 'VILLA 168');
    assert.equal(villa.house.slug, 'villa-168');
    assert.equal(villa.house.objectType, 'villa');
    assert.equal(villa.house.packagePublicRoot, '/house-package');
    assert.ok(villa.house.packageRoot.length > 0);
    assert.equal(villa.publication.isHousePublished, true);
    assert.equal(villa.publication.isPublished, true);
    assert.equal(villa.publication.isSeed, true);
    assert.equal(villa.experience.authorStudio, 'builder');
    assert.ok(typeof villa.branding.logoLabel === 'string');
  });

  it('lists authoring projects and published houses from the same Registry SSOT', () => {
    const projects = listCanonicalProjects();
    const houses = listCanonicalHouses();
    assert.ok(projects.some((item) => item.project.projectId === 'project-ac-modular'));
    assert.ok(
      projects.some(
        (item) => item.project.projectId === 'project-domy-s-energii',
      ),
    );
    assert.ok(houses.length >= 4);
    assert.ok(houses.every((item) => item.publication.isPublished));
    assert.ok(
      houses.every(
        (item) =>
          item.house !== null &&
          item.house.houseId.length > 0 &&
          item.house.houseId !== item.project.projectId &&
          typeof item.house.objectType === 'string',
      ),
    );
  });

  it('marks seed projects via PT-PLAT-01', () => {
    assert.equal(isCanonicalSeedProject('villa-168'), true);
    assert.equal(isCanonicalSeedProject('not-a-seed'), false);
  });

  it('CAP-VR33F — accepts strict canonical Project ids, never House ids', () => {
    assert.equal(isCanonicalProjectId('project-domy-s-energii'), true);
    assert.equal(isCanonicalProjectId('project-ac-modular'), true);
    assert.equal(isCanonicalProjectId('modern-4kk'), false);
    assert.equal(isCanonicalProjectId('villa-168'), false);
    assert.equal(isCanonicalProjectId('family-98'), false);
    assert.equal(isCanonicalProjectId('harmony-124'), false);
  });

  it('resolves runtime binding with explicit > url > workspace > session > embed', () => {
    const bound = resolveCanonicalRuntimeBinding({
      explicitProjectId: 'harmony-124',
      urlProjectId: 'villa-168',
      sessionProjectId: 'family-98',
    });
    assert.equal(bound.bindSource, 'explicit');
    assert.equal(bound.runtimeHouseId, 'harmony-124');
    assert.equal(bound.runtimeProjectId, 'project-ac-modular');
    assert.equal(bound.packagePublicRoot, '/house-packages/harmony-124');
    assert.ok(bound.project);

    const fromLegacy = resolveCanonicalRuntimeBinding({
      embedObjectId: 'house-modern-01',
    });
    assert.equal(fromLegacy.bindSource, 'embed');
    assert.equal(fromLegacy.runtimeHouseId, DEFAULT_PROJECT_ID);
    assert.equal(fromLegacy.runtimeProjectId, 'project-ac-modular');

    const unbound = resolveCanonicalRuntimeBinding({});
    assert.equal(unbound.bindSource, 'none');
    assert.equal(unbound.project, null);
    assert.equal(unbound.runtimeHouseId, null);
  });
});

describe('CAP-PLAT-04a Canonical Entity Hierarchy', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('exposes Company → Project → House as independent entities', () => {
    const villa = getCanonicalProject('villa-168');
    assert.ok(villa);
    assert.ok(villa.house);
    const hierarchy = toCanonicalEntityHierarchy(villa);
    assert.ok(hierarchy.house);

    assert.equal(hierarchy.company.companyId, 'ac-modular');
    assert.equal(hierarchy.company.name, 'AC Modular');
    assert.equal(hierarchy.project.projectId, 'project-ac-modular');
    assert.equal(hierarchy.project.companyId, hierarchy.company.companyId);
    assert.equal(hierarchy.project.name, 'AC Modular');
    assert.equal(hierarchy.house.houseId, 'villa-168');
    assert.equal(hierarchy.house.name, 'VILLA 168');
    assert.notEqual(hierarchy.project.projectId, hierarchy.house.houseId);
    assert.notEqual(hierarchy.project.name, hierarchy.house.name);

    const houses = listCanonicalHouseEntities();
    assert.ok(houses.some((house) => house.houseId === 'villa-168'));
    assert.ok(houses.every((house) => typeof house.objectType === 'string'));
  });
});

describe('CAP-PLAT-04b Runtime Binding → Canonical House', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('binds House from Canonical House slice; Project stays separate', () => {
    const house = getCanonicalHouseEntity('villa-168');
    assert.ok(house);
    assert.equal(house.houseId, 'villa-168');
    assert.equal(house.name, 'VILLA 168');
    assert.equal(house.objectType, 'villa');

    const bound = resolveCanonicalRuntimeBinding({
      sessionProjectId: 'villa-168',
    });
    assert.equal(bound.bindSource, 'session');
    assert.ok(bound.project);
    assert.ok(bound.project.house);
    assert.equal(bound.runtimeHouseId, house.houseId);
    assert.equal(bound.runtimeProjectId, 'project-ac-modular');
    assert.equal(bound.packagePublicRoot, house.packagePublicRoot);
    assert.equal(bound.project.house.houseId, house.houseId);
    assert.equal(bound.project.project.projectId, 'project-ac-modular');
    assert.notEqual(bound.project.project.name, bound.project.house.name);
  });
});

describe('CAP-REF-07a DSE Canonical Reference binding', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('resolves the seeded Company → Project → House hierarchy after a clean reset', () => {
    const company = getCanonicalCompany('company-domy-s-energii');
    const project = getCanonicalProject('project-domy-s-energii');
    const house = getCanonicalHouse(
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
    );
    const byHouse = resolveCanonicalRuntimeBinding({
      sessionProjectId:
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
    });
    const byProject = resolveCanonicalRuntimeBinding({
      sessionProjectId: 'project-domy-s-energii',
    });

    assert.equal(company?.name, 'Domy s energií');
    assert.equal(project?.project.name, 'Domy s energií');
    assert.equal(project?.partner.companyId, 'company-domy-s-energii');
    assert.equal(house?.house.name, 'BUNGALOV 4KK');
    assert.equal(
      house?.house.houseId,
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
    );
    assert.equal(house?.house.dataMode, 'REFERENCE_DEMO');
    assert.equal(house?.project.projectId, 'project-domy-s-energii');
    assert.equal(
      byHouse.runtimeHouseId,
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
    );
    assert.equal(byHouse.runtimeProjectId, 'project-domy-s-energii');
    assert.equal(
      byProject.runtimeHouseId,
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
    );
    assert.equal(byProject.runtimeProjectId, 'project-domy-s-energii');
    assert.notEqual(byProject.runtimeHouseId, 'modern-4kk');
  });
});

describe('CAP-VR35a House Runtime Data Mode', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('keeps the reference House demo-mode explicit and normal Houses live-empty', () => {
    const reference = getCanonicalHouse(
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
    );
    const liveEmpty = getCanonicalHouse('family-98');

    assert.equal(reference?.house?.dataMode, 'REFERENCE_DEMO');
    assert.equal(liveEmpty?.house?.dataMode, 'LIVE_EMPTY');
    assert.notEqual(reference?.house?.houseId, liveEmpty?.house?.houseId);
    assert.notEqual(reference?.project.projectId, liveEmpty?.project.projectId);
  });
});

describe('CAP-PLAT-04c Registry Canonical Projects', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('stores Company → Project → House links without duplicating Project onto House', async () => {
    const { getDefaultCompanyRegistry, resolveCanonicalProjectForHouseRow } =
      await import('../registry/companyRegistry.ts');
    const { DEFAULT_CANONICAL_PROJECT_ID } = await import('../registry/defaults.ts');

    const registry = getDefaultCompanyRegistry();
    const delivery = registry.canonicalProjects.find(
      (project) => project.id === DEFAULT_CANONICAL_PROJECT_ID,
    );
    assert.ok(delivery);
    assert.equal(delivery.name, 'AC Modular');
    assert.equal('packageRoot' in delivery, false);

    const villaRow = registry.projects.find((row) => row.id === 'villa-168');
    assert.ok(villaRow);
    assert.equal(villaRow.canonicalProjectId, DEFAULT_CANONICAL_PROJECT_ID);
    const linked = resolveCanonicalProjectForHouseRow(villaRow);
    assert.ok(linked);
    assert.notEqual(linked.name, villaRow.name);
  });
});

describe('CAP-PLAT-04d CPL model slices', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('listCanonicalProjects returns true Projects; listCanonicalHouses returns Houses', () => {
    const projects = listCanonicalProjects();
    const houses = listCanonicalHouses('project-ac-modular');
    assert.ok(projects.length >= 2);
    assert.ok(
      projects.some(
        (item) => item.project.projectId === 'project-ac-modular',
      ),
    );
    assert.ok(houses.length >= 3);
    assert.ok(houses.every((item) => item.project.projectId === 'project-ac-modular'));
  });

  it('getCanonicalHouse returns full projection; entity helper returns House slice', () => {
    const full = getCanonicalHouse('villa-168');
    assert.ok(full);
    assert.ok(full.house);
    assert.equal(full.house.houseId, 'villa-168');
    assert.equal(full.project.projectId, 'project-ac-modular');
    assert.equal(full.house.objectType, 'villa');

    const entity = getCanonicalHouseEntity('villa-168');
    assert.ok(entity);
    assert.equal(entity.houseId, 'villa-168');
    assert.equal(entity.objectType, 'villa');
  });

  it('getCanonicalProject resolves Canonical Project id', () => {
    const byProject = getCanonicalProject('project-ac-modular');
    assert.ok(byProject);
    assert.ok(byProject.house);
    assert.equal(byProject.project.projectId, 'project-ac-modular');
    assert.ok(byProject.house.houseId.length > 0);
  });
});

describe('CAP-PLAT-04e Runtime binding dual-read aliases', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('binds House when legacy projectId is a Canonical Project id', () => {
    const bound = resolveCanonicalRuntimeBinding({
      explicitProjectId: 'project-ac-modular',
    });
    assert.equal(bound.bindSource, 'explicit');
    assert.ok(bound.runtimeHouseId);
    assert.notEqual(bound.runtimeHouseId, 'project-ac-modular');
    assert.equal(bound.runtimeProjectId, 'project-ac-modular');
    assert.ok(bound.project);
    assert.ok(bound.project.house);
    assert.equal(bound.project.house.houseId, bound.runtimeHouseId);
    assert.equal(bound.project.project.projectId, 'project-ac-modular');
    assert.equal('objectType' in bound.project.project, false);
    assert.ok(typeof bound.project.house.objectType === 'string');
  });

  it('still binds House when legacy projectId is a House id', () => {
    const bound = resolveCanonicalRuntimeBinding({
      urlProjectId: 'villa-168',
    });
    assert.equal(bound.bindSource, 'url');
    assert.equal(bound.runtimeHouseId, 'villa-168');
    assert.equal(bound.runtimeProjectId, 'project-ac-modular');
  });
});

describe('CAP-PLAT-04k DIAG gate + collapse alias retirement', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('DIAG replay villa-168: Company / Project / House names are independent', () => {
    const villa = getCanonicalHouse('villa-168');
    assert.ok(villa);
    assert.ok(villa.house);
    const hierarchy = toCanonicalEntityHierarchy(villa);
    assert.ok(hierarchy.house);

    assert.equal(hierarchy.company.name, 'AC Modular');
    assert.equal(hierarchy.project.name, 'AC Modular');
    assert.equal(hierarchy.house.name, 'VILLA 168');
    assert.notEqual(hierarchy.project.name, hierarchy.house.name);
    assert.notEqual(hierarchy.project.projectId, hierarchy.house.houseId);
    assert.equal(hierarchy.project.projectId, 'project-ac-modular');
    assert.equal(hierarchy.house.houseId, 'villa-168');

    assert.equal(villa.branding.heroLabel, 'Villa 168 Hero');
    assert.ok(villa.branding.heroLabel.includes('Villa'));

    const bound = resolveCanonicalRuntimeBinding({
      explicitProjectId: 'villa-168',
    });
    assert.equal(bound.runtimeHouseId, 'villa-168');
    assert.equal(bound.runtimeProjectId, 'project-ac-modular');
    assert.ok(bound.project);
    assert.ok(bound.project.house);
    assert.equal(bound.project.project.name, 'AC Modular');
    assert.equal(bound.project.house.name, 'VILLA 168');
    assert.equal('objectType' in bound.project.project, false);
  });

  it('retires listCanonicalPublishedProjects collapse alias from public CPL surface', async () => {
    const { readFileSync } = await import('node:fs');
    const { dirname, join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const here = dirname(fileURLToPath(import.meta.url));
    const barrel = readFileSync(join(here, 'index.ts'), 'utf8');
    const packageIndex = readFileSync(join(here, '../index.ts'), 'utf8');
    assert.doesNotMatch(barrel, /listCanonicalPublishedProjects/);
    assert.doesNotMatch(packageIndex, /listCanonicalPublishedProjects/);

    const projects = listCanonicalProjects();
    assert.ok(
      projects.every(
        (item) =>
          item.house !== null &&
          item.house.houseId !== item.project.projectId,
      ),
    );
  });
});

describe('CAP-PLAT-04R2a Canonical Company + Project authoring foundation', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('A: Company with zero Projects/Houses is immediately readable via CPL', () => {
    upsertBuilderCompany({
      id: 'company-empty-r2a',
      name: 'Empty Co R2a',
      tenantId: 'tenant-ac-modular',
    });

    const listed = listCanonicalCompanies();
    assert.ok(listed.some((company) => company.companyId === 'company-empty-r2a'));
    const found = getCanonicalCompany('company-empty-r2a');
    assert.ok(found);
    assert.equal(found.name, 'Empty Co R2a');
    assert.equal(found.tenantId, 'tenant-ac-modular');

    const projectsForCompany = listCanonicalProjects('company-empty-r2a');
    assert.equal(projectsForCompany.length, 0);
    const houses = listCanonicalHouses();
    assert.equal(
      houses.filter((item) => item.partner.companyId === 'company-empty-r2a').length,
      0,
    );
  });

  it('B+C+D: Project with zero Houses is listed/looked up; name never from House; no House created', () => {
    const housesBefore = listCanonicalHouses().length;
    const registryHousesBefore = getDefaultCompanyRegistry().projects.length;

    upsertBuilderCompany({
      id: 'company-r2a',
      name: 'Company R2a',
      tenantId: 'tenant-ac-modular',
    });
    upsertBuilderCanonicalProject({
      id: 'project-r2a-empty',
      companyId: 'company-r2a',
      workspaceId: 'ac-modular-main',
      name: 'Projekt Alone',
      slug: 'projekt-alone',
      description: 'Canonical Project without Houses',
    });

    const listed = listCanonicalProjects('company-r2a');
    assert.equal(listed.length, 1);
    assert.equal(listed[0]?.project.projectId, 'project-r2a-empty');
    assert.equal(listed[0]?.project.name, 'Projekt Alone');
    assert.equal(listed[0]?.house, null);

    const lookedUp = getCanonicalProject('project-r2a-empty');
    assert.ok(lookedUp);
    assert.equal(lookedUp.project.projectId, 'project-r2a-empty');
    assert.equal(lookedUp.project.name, 'Projekt Alone');
    assert.equal(lookedUp.project.slug, 'projekt-alone');
    assert.equal(lookedUp.project.description, 'Canonical Project without Houses');
    assert.equal(lookedUp.house, null);
    assert.equal(lookedUp.partner.companyId, 'company-r2a');

    assert.notEqual(lookedUp.project.name, 'VILLA 168');
    assert.equal(listCanonicalHouses().length, housesBefore);
    assert.equal(
      getDefaultCompanyRegistry().projects.length,
      registryHousesBefore,
    );
    assert.equal(
      getDefaultCompanyRegistry().projects.some(
        (row) => row.id === 'project-r2a-empty',
      ),
      false,
    );
  });

  it('E: AC Modular → AC Modular → Villa 168 remains PASS', () => {
    const villa = getCanonicalHouse('villa-168');
    assert.ok(villa);
    assert.ok(villa.house);
    const hierarchy = toCanonicalEntityHierarchy(villa);
    assert.ok(hierarchy.house);

    assert.equal(hierarchy.company.name, 'AC Modular');
    assert.equal(hierarchy.project.name, 'AC Modular');
    assert.equal(hierarchy.house.name, 'VILLA 168');
    assert.equal(hierarchy.project.projectId, 'project-ac-modular');
    assert.equal(hierarchy.house.houseId, 'villa-168');
    assert.notEqual(hierarchy.project.projectId, hierarchy.house.houseId);
    assert.notEqual(hierarchy.project.name, hierarchy.house.name);
  });
});
