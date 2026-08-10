/**
 * CAP-PLAT-04A — DSE acceptance scenario.
 * Creates Company → Project → House via Builder authoring; verifies CPL + Studio consumers.
 * Does not seed defaults; does not mutate AC Modular permanently beyond test extras reset.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  getCanonicalCompany,
  getCanonicalHouse,
  getCanonicalProject,
  getDefaultCompanyRegistry,
  listCanonicalCompanies,
  listCanonicalHouses,
  listCanonicalProjects,
  resetCompanyRegistryExtras,
  resetSharedProjectManifestsForTests,
} from '@embed-engine/platform-access';

import {
  createInitialWorkspaceRegistry,
  createWorkspaceObjectFromInput,
  createWorkspaceProjectFromInput,
  housesForFolder,
  openWorkspaceFolder,
  registerWorkspaceCompany,
  updateWorkspaceProject,
} from './workspaceRegistry';

describe('CAP-PLAT-04A DSE acceptance scenario', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('Company → Project → House propagates without Project↔House collapse', async () => {
    const acHousesBefore = listCanonicalHouses()
      .map((item) => item.house?.houseId)
      .filter((id): id is string => typeof id === 'string')
      .sort();

    // --- Step 1: Company ---
    let state = createInitialWorkspaceRegistry();
    state = registerWorkspaceCompany(state, {
      id: 'company-domy-s-energii',
      name: 'Domy s energií',
    });
    const company = getCanonicalCompany('company-domy-s-energii');
    assert.equal(company?.name, 'Domy s energií');
    assert.ok(
      listCanonicalCompanies().some(
        (item) => item.companyId === 'company-domy-s-energii',
      ),
    );
    assert.equal(listCanonicalProjects('company-domy-s-energii').length, 0);
    assert.ok(
      state.companies.some(
        (item) =>
          item.id === 'company-domy-s-energii' &&
          item.name === 'Domy s energií',
      ),
    );

    // --- Step 2: Project ---
    const createdProject = createWorkspaceProjectFromInput(state, {
      name: 'Domy s energií',
      companyId: 'company-domy-s-energii',
      description: 'Acceptance Project',
    });
    state = createdProject.state;
    const folder = createdProject.folder;
    const project = getCanonicalProject(folder.id);
    assert.ok(project);
    assert.equal(project.project.name, 'Domy s energií');
    assert.equal(project.project.projectId, folder.id);
    assert.equal(project.house, null);
    assert.ok(
      state.folders.some(
        (item) => item.id === folder.id && item.name === 'Domy s energií',
      ),
    );

    // --- Step 3: House (DOMY) + publish for consumer CPL ---
    const opened = openWorkspaceFolder(state, folder.id);
    state = opened.state;
    const createdHouse = createWorkspaceObjectFromInput(state, {
      name: 'MODERN 4KK',
      internalId: 'modern-4kk',
    });
    assert.ok(createdHouse);
    state = updateWorkspaceProject(createdHouse.state, createdHouse.project.id, {
      status: 'published',
    });
    const houseId = createdHouse.project.id;
    assert.ok(housesForFolder(state, folder.id).some((h) => h.id === houseId));
    const cplHouse = getCanonicalHouse(houseId);
    assert.ok(cplHouse?.house);
    assert.equal(cplHouse.house.name, 'MODERN 4KK');
    assert.notEqual(cplHouse.project.projectId, houseId);
    assert.notEqual(cplHouse.project.name, 'MODERN 4KK');

    // --- Step 4a: Builder ---
    assert.equal(
      state.companies.find((c) => c.id === 'company-domy-s-energii')?.name,
      'Domy s energií',
    );
    assert.equal(
      state.folders.find((f) => f.id === folder.id)?.name,
      'Domy s energií',
    );
    assert.equal(
      state.projects.find((p) => p.id === houseId)?.name,
      'MODERN 4KK',
    );

    // --- Step 4b: Office ---
    const { listOfficeSelectProjects } = await import(
      '../../../../office-studio/src/office/pilotWorkspaceModel.ts'
    );
    let officeCases;
    try {
      officeCases = listOfficeSelectProjects();
    } catch (error) {
      assert.fail(
        `STOP Office Studio — listOfficeSelectProjects threw: ${String(error)}`,
      );
    }
    const officeCase = officeCases.find(
      (item) => item.projectId === folder.id,
    );
    assert.ok(
      officeCase,
      `STOP Office Studio — expected case projectId=${folder.id}; actual=${JSON.stringify(
        officeCases.map((c) => ({
          id: c.id,
          title: c.projectTitle,
          partner: c.partnerName,
        })),
      )}`,
    );
    assert.equal(officeCase.partnerName, 'Domy s energií');
    assert.equal(officeCase.projectTitle, 'Domy s energií');
    const nested = officeCase.houses.find(
      (h) => h.houseId === houseId || h.name === 'MODERN 4KK',
    );
    assert.ok(
      nested,
      `STOP Office Studio — expected nested House MODERN 4KK; actual houses=${JSON.stringify(
        officeCase.houses,
      )}; registry canonicalProjectId=${
        getDefaultCompanyRegistry().projects.find((r) => r.id === houseId)
          ?.canonicalProjectId ?? 'null'
      }`,
    );
    assert.notEqual(officeCase.projectId, nested.houseId);
    assert.notEqual(officeCase.projectTitle, nested.name);

    // --- Step 4c: Client ---
    const { resolveCanonicalRuntimeBindingFromSession } = await import(
      '../../../../client-studio/src/features/client-studio/runtime/clientCanonicalBind.ts'
    );
    const clientBound = resolveCanonicalRuntimeBindingFromSession(houseId);
    assert.equal(clientBound.runtimeHouseId, houseId);
    assert.equal(clientBound.project?.house?.name, 'MODERN 4KK');
    assert.equal(clientBound.project?.project.name, 'Domy s energií');
    assert.equal(clientBound.project?.partner.companyName, 'Domy s energií');
    assert.notEqual(clientBound.runtimeProjectId, clientBound.runtimeHouseId);

    // --- Step 4d: Manager ---
    const { resolveCanonicalRuntimeBindingFromSession: managerBind } =
      await import(
        '../../../../manager-studio/src/features/manager-studio/runtime/managerCanonicalBind.ts'
      );
    const managerBound = managerBind(houseId);
    assert.equal(managerBound.runtimeHouseId, houseId);
    assert.equal(managerBound.project?.house?.name, 'MODERN 4KK');
    assert.equal(managerBound.project?.project.name, 'Domy s energií');
    assert.equal(managerBound.project?.partner.companyName, 'Domy s energií');

    // --- Step 4e: Sales ---
    const { listSalesCanonicalProjects, listSalesCanonicalHouses } =
      await import('../../../../sales-studio/src/sales/salesClients.ts');
    const salesProject = listSalesCanonicalProjects().find(
      (item) => item.id === folder.id,
    );
    assert.ok(salesProject);
    assert.equal(salesProject.label, 'Domy s energií');
    assert.equal(salesProject.companyLabel, 'Domy s energií');
    const salesHouse = listSalesCanonicalHouses(folder.id).find(
      (item) => item.id === houseId || item.label === 'MODERN 4KK',
    );
    assert.ok(
      salesHouse,
      `STOP Sales Studio — expected House MODERN 4KK under ${folder.id}; actual=${JSON.stringify(
        listSalesCanonicalHouses(folder.id),
      )}`,
    );
    assert.notEqual(salesHouse.id, salesProject.id);

    // AC Modular intact
    assert.equal(getCanonicalCompany('ac-modular')?.name, 'AC Modular');
    assert.equal(
      getCanonicalProject('project-ac-modular')?.project.name,
      'AC Modular',
    );
    assert.equal(getCanonicalHouse('villa-168')?.house?.name, 'Villa 168');
    const acHousesAfter = listCanonicalHouses()
      .map((item) => item.house?.houseId)
      .filter((id): id is string => typeof id === 'string')
      .filter((id) => id === 'family-98' || id === 'harmony-124' || id === 'villa-168')
      .sort();
    assert.deepEqual(acHousesAfter, acHousesBefore.filter((id) =>
      id === 'family-98' || id === 'harmony-124' || id === 'villa-168',
    ));
    assert.equal(listCanonicalProjects('company-domy-s-energii').length, 1);
  });
});
