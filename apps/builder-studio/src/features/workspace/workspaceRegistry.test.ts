/**
 * CAP-BLD-08 + EPIC-BX-01 / CAP-PLAT-02a / CAP-PLAT-04f — Workspace over CPL tests.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  clearPlatformSession,
  DSE_FIRST_DRAFT_HOUSE_ID,
  getCanonicalProject,
  getCanonicalHouse,
  isCanonicalProjectId,
  login,
  resetCompanyRegistryExtras,
  resetSharedProjectManifestsForTests,
  resolveWorkspaceHouseBinding,
  updateSession,
} from '@embed-engine/platform-access';

import {
  closeWorkspaceProject,
  composeWorkspaceRegistry,
  createInitialWorkspaceRegistry,
  createWorkspaceObjectFromInput,
  createWorkspaceProjectFromInput,
  decideProjectSwitch,
  housesForFolder,
  mergePersistedWorkspaceSlice,
  openWorkspaceFolder,
  openWorkspaceProject,
  registerWorkspaceCompany,
  toPersistedWorkspaceSlice,
  updateWorkspaceProject,
} from './workspaceRegistry';
import { requiresLegacyWorkspaceActivation } from './useWorkspaceController';

describe('workspaceRegistry (CAP-BLD-08 / EPIC-BX-01 / CAP-PLAT-02a / CAP-PLAT-04f)', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
    resetSharedProjectManifestsForTests();
  });

  it('seeds canonical Houses from their respective Projects', () => {
    const state = createInitialWorkspaceRegistry();
    assert.equal(state.companies.length, 2);
    assert.equal(state.projects.length, 5);
    assert.equal(state.activeProjectId, 'villa-168');
    assert.deepEqual(
      state.projects
        .filter((project) => project.companyId === 'ac-modular')
        .map((project) => project.id)
        .sort(),
      ['family-98', 'harmony-124', 'modern-4kk', 'villa-168'],
    );
  });

  it('CAP-PLAT-04f — Projekt folder ↔ Project; DOMY ↔ House', () => {
    const state = createInitialWorkspaceRegistry();
    const acFolder = state.folders.find(
      (folder) => folder.id === 'project-ac-modular',
    );
    assert.equal(state.folders.length, 2);
    assert.equal(acFolder?.name, 'AC Modular');
    assert.ok(
      state.projects
        .filter((house) => house.folderId === 'project-ac-modular')
        .every(
        (house) =>
          house.id !== 'project-ac-modular' &&
          house.folderId === 'project-ac-modular' &&
          typeof house.objectType === 'string',
        ),
    );
    const villa = state.projects.find((house) => house.id === 'villa-168');
    assert.ok(villa);
    assert.equal(villa.name, 'Villa 168');
    assert.notEqual(acFolder?.name, villa.name);
  });

  it('CAP-PLAT-02a — compose reads Company/Project/House via CPL', () => {
    const state = composeWorkspaceRegistry({});
    assert.ok(state.companies.some((company) => company.id === 'ac-modular'));
    assert.ok(state.projects.some((project) => project.id === 'villa-168'));
    const persisted = toPersistedWorkspaceSlice(state);
    assert.equal(persisted.version, 3);
    assert.equal('extraProjects' in persisted && persisted.extraProjects !== undefined, false);
    assert.ok(persisted.houseFolderIds);
    assert.ok(persisted.folders);
  });

  it('CAP-PLAT-02a.1 — workspace composition has no getDefaultCompanyRegistry dependency', async () => {
    const { readFileSync } = await import('node:fs');
    const { dirname, join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, 'workspaceRegistry.ts'), 'utf8');
    assert.doesNotMatch(source, /getDefaultCompanyRegistry/);
    assert.match(source, /listCanonicalProjects/);
    assert.match(source, /listCanonicalHouses/);

    const state = composeWorkspaceRegistry({});
    const villa = state.projects.find((project) => project.id === 'villa-168');
    assert.ok(villa);
    assert.equal(villa.companyId, 'ac-modular');
    assert.ok(villa.packageRoot.length > 0);
    assert.ok(
      state.companies.some(
        (company) =>
          company.id === villa.companyId && company.name === 'AC Modular',
      ),
    );
  });

  it('open updates recent and lastOpened without storing HP content', () => {
    let state = createInitialWorkspaceRegistry();
    state = openWorkspaceProject(state, 'family-98');
    assert.equal(state.activeProjectId, 'family-98');
    assert.equal(state.lastOpenedProjectId, 'family-98');
    assert.deepEqual(state.recentProjectIds.slice(0, 2), [
      'family-98',
      'villa-168',
    ]);
    const persisted = toPersistedWorkspaceSlice(state);
    assert.equal('roomsCsv' in persisted, false);
    assert.equal('galleryCsv' in persisted, false);
  });

  it('close clears active but keeps registry metadata', () => {
    let state = openWorkspaceProject(
      createInitialWorkspaceRegistry(),
      'harmony-124',
    );
    state = closeWorkspaceProject(state);
    assert.equal(state.activeProjectId, null);
    assert.equal(state.projects.length, 5);
    assert.equal(state.lastOpenedProjectId, 'harmony-124');
  });

  it('dirty switch requires confirmation', () => {
    assert.deepEqual(
      decideProjectSwitch({
        dirty: true,
        activeProjectId: 'villa-168',
        targetProjectId: 'family-98',
      }),
      { action: 'confirm-dirty' },
    );
    assert.deepEqual(
      decideProjectSwitch({
        dirty: false,
        activeProjectId: 'villa-168',
        targetProjectId: 'family-98',
      }),
      { action: 'switch' },
    );
  });

  it('merges persisted recent/lastOpened over defaults', () => {
    const state = mergePersistedWorkspaceSlice({
      activeProjectId: 'harmony-124',
      recentProjectIds: ['harmony-124', 'family-98'],
      lastOpenedProjectId: 'harmony-124',
      extraProjects: [],
    });
    assert.equal(state.activeProjectId, 'harmony-124');
    assert.deepEqual(state.recentProjectIds, ['harmony-124', 'family-98']);
  });

  it('CAP-PLAT-04R1 — creates a new Projekt folder without a House', () => {
    const base = createInitialWorkspaceRegistry();
    const beforeHouses = base.projects.length;
    const { state, folder } = createWorkspaceProjectFromInput(base, {
      name: 'Modulární domy',
      companyId: 'ac-modular',
      description: 'Skupina modulárních domů',
    });
    assert.equal(folder.name, 'Modulární domy');
    assert.equal(folder.companyId, 'ac-modular');
    assert.ok(state.folders.some((item) => item.id === folder.id));
    assert.equal(state.projects.length, beforeHouses);
    assert.equal(
      state.projects.some((item) => item.folderId === folder.id),
      false,
    );
    assert.equal(state.activeFolderId, folder.id);
    assert.equal(state.activeProjectId, null);
    assert.notEqual(folder.name, 'Harmony 140');
    assert.notEqual(folder.name, 'Villa 168');
  });

  it('CAP-VR44 — requires a canonical Partner and writes its canonical Project', () => {
    const base = createInitialWorkspaceRegistry();

    assert.throws(
      () =>
        createWorkspaceProjectFromInput(base, {
          name: 'Bez partnera',
          companyId: '',
          description: '',
        }),
      /Vyberte partnera/,
    );
    assert.throws(
      () =>
        createWorkspaceProjectFromInput(base, {
          name: 'Neznámý partner',
          companyId: 'unknown-company',
          description: '',
        }),
      /kanonickém registru/,
    );
    assert.throws(
      () =>
        createWorkspaceProjectFromInput(base, {
          name: 'Legacy inline partner',
          companyId: '__new__',
          description: '',
        }),
      /kanonickém registru/,
    );

    const { folder } = createWorkspaceProjectFromInput(base, {
      name: 'DSE portfolio',
      companyId: 'company-domy-s-energii',
      description: '',
    });
    assert.equal(folder.companyId, 'company-domy-s-energii');
    assert.equal(isCanonicalProjectId(folder.id), true);
    assert.equal(
      getCanonicalProject(folder.id)?.partner.companyId,
      'company-domy-s-energii',
    );
  });

  it('CAP-PLAT-04R2b — Company + Project canonical write chain (A–H)', async () => {
    const {
      getCanonicalCompany,
      getCanonicalProject,
      getDefaultCompanyRegistry,
      listCanonicalCompanies,
      listCanonicalHouses,
      listCanonicalProjects,
    } = await import('@embed-engine/platform-access');

    // A+B — Company alone, zero Projects/Houses
    const alone = registerWorkspaceCompany(createInitialWorkspaceRegistry(), {
      id: 'company-empty-r2b',
      name: 'Empty Co R2b',
    });
    assert.ok(
      alone.companies.some(
        (company) =>
          company.id === 'company-empty-r2b' && company.name === 'Empty Co R2b',
      ),
    );
    assert.equal(getCanonicalCompany('company-empty-r2b')?.name, 'Empty Co R2b');
    assert.ok(
      listCanonicalCompanies().some((c) => c.companyId === 'company-empty-r2b'),
    );
    assert.equal(listCanonicalProjects('company-empty-r2b').length, 0);
    assert.equal(
      listCanonicalHouses().filter(
        (item) => item.partner.companyId === 'company-empty-r2b',
      ).length,
      0,
    );

    // C+D+E+F — Project persists as PlatformCanonicalProject; folder id = projectId; no House
    const housesBefore = listCanonicalHouses().length;
    const registryHousesBefore = getDefaultCompanyRegistry().projects.length;
    const base = createInitialWorkspaceRegistry();
    const { state, folder } = createWorkspaceProjectFromInput(base, {
      name: 'Pilot Portfolio',
      companyId: 'ac-modular',
      description: 'Canonical Project without Houses',
    });
    assert.equal(folder.id, 'project-pilot-portfolio');
    assert.ok(state.folders.some((item) => item.id === folder.id));
    const projected = getCanonicalProject(folder.id);
    assert.ok(projected);
    assert.equal(projected.project.projectId, folder.id);
    assert.equal(projected.project.name, 'Pilot Portfolio');
    assert.equal(projected.house, null);
    assert.ok(
      listCanonicalProjects().some(
        (item) => item.project.projectId === folder.id,
      ),
    );
    assert.equal(listCanonicalHouses().length, housesBefore);
    assert.equal(
      getDefaultCompanyRegistry().projects.length,
      registryHousesBefore,
    );
    assert.equal(
      getDefaultCompanyRegistry().projects.some((row) => row.id === folder.id),
      false,
    );
    assert.notEqual(projected.project.name, 'Villa 168');
    assert.notEqual(projected.project.name, 'Harmony 140');

    // G+H — AC Modular → AC Modular → Villa 168; no Project↔House collapse
    const villa = state.projects.find((project) => project.id === 'villa-168');
    assert.ok(villa);
    assert.equal(
      state.companies.find((c) => c.id === 'ac-modular')?.name,
      'AC Modular',
    );
    assert.equal(
      state.folders.find((f) => f.id === 'project-ac-modular')?.name,
      'AC Modular',
    );
    assert.equal(villa.name, 'Villa 168');
    assert.notEqual(villa.id, 'project-ac-modular');
    assert.notEqual(
      state.folders.find((f) => f.id === 'project-ac-modular')?.name,
      villa.name,
    );
  });

  it('creates a new object (house) inside the active project folder (PR-023)', () => {
    const base = createInitialWorkspaceRegistry();
    const authoringProject = createWorkspaceProjectFromInput(base, {
      name: 'Authoring Test',
      companyId: 'ac-modular',
      description: '',
    });
    const opened = openWorkspaceFolder(
      authoringProject.state,
      authoringProject.folder.id,
    );
    const beforeCount = housesForFolder(opened.state, opened.state.activeFolderId!)
      .length;
    const created = createWorkspaceObjectFromInput(opened.state, {
      name: 'Objekt Alfa',
      internalId: 'objekt-alfa',
    });
    assert.ok(created);
    assert.equal(created.project.name, 'Objekt Alfa');
    assert.equal(created.project.id, 'objekt-alfa');
    assert.equal(created.project.folderId, opened.state.activeFolderId);
    assert.equal(created.state.activeProjectId, 'objekt-alfa');
    assert.equal(
      housesForFolder(created.state, created.project.folderId).length,
      beforeCount + 1,
    );
  });

  it('CAP-PLAT-04R2c — House write persists canonicalProjectId = Projekt folder id', async () => {
    const { getCanonicalHouse } = await import('@embed-engine/platform-access');

    const base = createInitialWorkspaceRegistry();
    const dse = openWorkspaceFolder(base, 'project-domy-s-energii');
    const created = createWorkspaceObjectFromInput(dse.state, {
      name: 'R2c DSE House',
      internalId: 'r2c-dse-house',
    });
    assert.ok(created);

    assert.equal(created.project.folderId, 'project-domy-s-energii');

    const canonical = getCanonicalHouse('r2c-dse-house');
    assert.ok(canonical?.house);
    assert.equal(canonical.project.projectId, 'project-domy-s-energii');
    assert.equal(canonical.house.houseId, 'r2c-dse-house');
    assert.notEqual(canonical.project.projectId, canonical.house.houseId);
  });

  it('auto-slugs object id and avoids collisions (PR-023)', () => {
    const base = createInitialWorkspaceRegistry();
    const opened = openWorkspaceFolder(base, base.folders[0]!.id);
    const first = createWorkspaceObjectFromInput(opened.state, {
      name: 'Duplikát',
      internalId: 'family-98',
    });
    assert.ok(first);
    assert.notEqual(first.project.id, 'family-98');
    assert.match(first.project.id, /^family-98-\d+$/);
  });

  it('CAP-VR36 — creates an empty canonical House under DSE without reference content', () => {
    const base = createInitialWorkspaceRegistry();
    const dse = openWorkspaceFolder(base, 'project-domy-s-energii');
    const created = createWorkspaceObjectFromInput(dse.state, {
      name: 'Dům pro klienta',
      internalId: 'dse-client-house',
    }, 'apps/client-studio/public/house-packages/dse-client-house');

    assert.ok(created);
    assert.equal(created.project.id, 'dse-client-house');
    assert.equal(created.project.folderId, 'project-domy-s-energii');
    assert.equal(
      created.project.packageRoot,
      'apps/client-studio/public/house-packages/dse-client-house',
    );
    assert.equal(created.project.objectType, 'house');

    const canonical = getCanonicalHouse(created.project.id);
    assert.equal(canonical?.project.projectId, 'project-domy-s-energii');
    assert.equal(
      canonical?.house?.packageRoot,
      'apps/client-studio/public/house-packages/dse-client-house',
    );
    assert.equal(canonical?.house?.dataMode, 'LIVE_EMPTY');
    const dseHouseIds = housesForFolder(
      created.state,
      'project-domy-s-energii',
    ).map((house) => house.id);
    assert.ok(dseHouseIds.includes('dse-client-house'));
    assert.ok(!dseHouseIds.includes('modern-4kk'));
    assert.equal(dseHouseIds.length, 2);
    assert.equal(
      housesForFolder(created.state, 'project-ac-modular').some(
        (house) => house.id === created.project.id,
      ),
      false,
    );
  });

  it('persists an authored House package root through Builder re-entry', () => {
    clearPlatformSession();
    const authenticated = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(authenticated.ok, true);
    if (!authenticated.ok) return;
    updateSession({ projectId: 'project-domy-s-energii' });

    const base = createInitialWorkspaceRegistry();
    const dse = openWorkspaceFolder(base, 'project-domy-s-energii');
    const created = createWorkspaceObjectFromInput(
      dse.state,
      { name: 'Draft house', internalId: 'draft-house' },
      'apps/client-studio/public/house-packages/draft-house',
    );
    assert.ok(created);
    const persisted = toPersistedWorkspaceSlice(created.state);

    resetCompanyRegistryExtras();
    const restored = mergePersistedWorkspaceSlice(persisted);
    const restoredHouse = restored.projects.find(
      (project) => project.id === 'draft-house',
    );
    const canonical = getCanonicalHouse('draft-house');
    const clientBinding = resolveWorkspaceHouseBinding({
      projectId: 'project-domy-s-energii',
      houseId: 'draft-house',
    });

    assert.equal(
      restoredHouse?.packageRoot,
      'apps/client-studio/public/house-packages/draft-house',
    );
    assert.equal(
      canonical?.house?.packageRoot,
      'apps/client-studio/public/house-packages/draft-house',
    );
    assert.equal(
      clientBinding?.authoringDraftPackage?.packagePublicRoot,
      '/house-packages/draft-house',
    );
    clearPlatformSession();
  });

  it('CAP-VR36b — cold selection preserves parent Project through create and restore', () => {
    const cold = mergePersistedWorkspaceSlice({
      activeProjectId: null,
      recentProjectIds: [],
      lastOpenedProjectId: null,
    });
    const selected = openWorkspaceFolder(cold, 'project-domy-s-energii');
    const created = createWorkspaceObjectFromInput(selected.state, {
      name: 'Cold session house',
      internalId: 'cold-session-house',
    });

    assert.ok(created);
    assert.equal(created.state.activeFolderId, 'project-domy-s-energii');
    assert.equal(created.state.activeProjectId, 'cold-session-house');
    assert.equal(created.project.folderId, 'project-domy-s-energii');
    assert.equal(
      getCanonicalHouse('cold-session-house')?.project.projectId,
      'project-domy-s-energii',
    );
    assert.equal(
      getCanonicalHouse('cold-session-house')?.house?.dataMode,
      'LIVE_EMPTY',
    );

    const restored = mergePersistedWorkspaceSlice(
      toPersistedWorkspaceSlice(created.state),
    );
    assert.equal(restored.activeFolderId, 'project-domy-s-energii');
    assert.equal(restored.activeProjectId, 'cold-session-house');
    assert.equal(
      housesForFolder(restored, 'project-ac-modular').some(
        (house) => house.id === 'cold-session-house',
      ),
      false,
    );
  });

  it('CAP-VR36C — House creation bypasses legacy Shared Project upsert', async () => {
    const { readFileSync } = await import('node:fs');
    const { dirname, join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const here = dirname(fileURLToPath(import.meta.url));
    const registrySource = readFileSync(
      join(here, 'workspaceRegistry.ts'),
      'utf8',
    );
    const controllerSource = readFileSync(
      join(here, 'useWorkspaceController.ts'),
      'utf8',
    );
    const registration = registrySource.slice(
      registrySource.indexOf('export function registerWorkspaceProject'),
      registrySource.indexOf('export function updateWorkspaceProject'),
    );

    assert.doesNotMatch(registration, /syncBuilderWorkspaceHouse/);
    assert.match(registration, /canonicalProjectId,/);
    assert.match(
      controllerSource,
      /initializeHousePackageForBuilder\([\s\S]*createWorkspaceObjectFromInput\([\s\S]*packageRoot[\s\S]*catch \(error\)/,
    );
  });

  it('CAP-VR36E — migrates historical PATROVÝ identity to canonical Váš první dům', () => {
    const initial = createInitialWorkspaceRegistry();
    const dse = openWorkspaceFolder(initial, 'project-domy-s-energii');
    const dseHouse = createWorkspaceObjectFromInput(dse.state, {
      name: 'PATROVÝ 5KK',
      internalId: 'patrovy-5kk',
    });
    assert.ok(dseHouse);

    const ac = openWorkspaceFolder(dseHouse.state, 'project-ac-modular');
    const acHouse = createWorkspaceObjectFromInput(ac.state, {
      name: 'test 4',
      internalId: 'test-4',
    });
    assert.ok(acHouse);

    const persistedBase = toPersistedWorkspaceSlice(acHouse.state);
    const persisted = {
      ...persistedBase,
      activeFolderId: 'project-ac-modular',
      activeProjectId: 'modern-4kk',
      houseMetadata: {
        ...persistedBase.houseMetadata,
        'patrovy-5kk': 'builder-authored-house',
        'test-4': 'builder-authored-house',
      },
    };

    const restored = mergePersistedWorkspaceSlice(persisted);

    const acHouseIds = housesForFolder(
      restored,
      'project-ac-modular',
    ).map((house) => house.id);

    const dseHouses = housesForFolder(
      restored,
      'project-domy-s-energii',
    );
    const dseHouseIds = dseHouses.map((house) => house.id);

    assert.equal(restored.activeFolderId, 'project-ac-modular');
    assert.equal(restored.activeProjectId, 'modern-4kk');

    assert.ok(acHouseIds.includes('test-4'));
    assert.ok(!acHouseIds.includes('patrovy-5kk'));
    assert.ok(acHouseIds.includes('modern-4kk'));

    assert.ok(!dseHouseIds.includes('patrovy-5kk'));
    assert.ok(dseHouseIds.includes(DSE_FIRST_DRAFT_HOUSE_ID));

    const vpd = dseHouses.find(
      (house) => house.id === DSE_FIRST_DRAFT_HOUSE_ID,
    );
    assert.ok(vpd);
    assert.equal(vpd.name, 'Váš první dům');
    assert.equal(vpd.folderId, 'project-domy-s-energii');

    assert.equal(
      restored.houseMetadata['patrovy-5kk'],
      undefined, );
    assert.equal(
      restored.houseMetadata[DSE_FIRST_DRAFT_HOUSE_ID],
      'builder-authored-house',
    );

    assert.equal(getCanonicalHouse('test-4')?.house?.dataMode, 'LIVE_EMPTY');
    assert.equal(
      getCanonicalHouse(DSE_FIRST_DRAFT_HOUSE_ID)?.project.projectId,
      'project-domy-s-energii',
    );
  });

  it('seeds Shared Project houses under the AC Modular folder', () => {
    const state = createInitialWorkspaceRegistry();
    const acFolder = state.folders.find(
      (folder) => folder.id === 'project-ac-modular',
    );
    assert.ok(acFolder);
    assert.equal(
      housesForFolder(state, acFolder.id).length,
      4,
    );
  });

  it('restores DSE Project selection and heals stale House-to-folder mappings', () => {
    const selected = composeWorkspaceRegistry({
      activeFolderId: 'project-domy-s-energii',
      activeProjectId: 'modern-4kk',
      lastOpenedProjectId: 'modern-4kk',
      houseFolderIds: { 'modern-4kk': 'project-ac-modular' },
    });
    const restored = mergePersistedWorkspaceSlice(
      toPersistedWorkspaceSlice(selected),
    );
    const dseHouseIds = housesForFolder(
      restored,
      'project-domy-s-energii',
    ).map((house) => house.id);
    const acHouseIds = housesForFolder(
      restored,
      'project-ac-modular',
    ).map((house) => house.id);

    assert.equal(restored.activeFolderId, 'project-domy-s-energii');
    assert.notEqual(restored.activeProjectId, 'modern-4kk');
    assert.ok(!dseHouseIds.includes('modern-4kk'));
    assert.equal(dseHouseIds.length, 1);
    assert.deepEqual(acHouseIds.sort(), [
      'family-98',
      'harmony-124',
      'modern-4kk',
      'villa-168',
    ]);
    assert.equal(restored.houseFolderIds['modern-4kk'], 'project-ac-modular');
  });

  it('activates MODERN 4KK without requesting a legacy HP-002 workspace root', () => {
    assert.equal(requiresLegacyWorkspaceActivation('modern-4kk'), false);
    assert.equal(requiresLegacyWorkspaceActivation('villa-168'), true);
  });

  it('prefers the shared session Project over a conflicting restored House', async () => {
    const { readFileSync } = await import('node:fs');
    const { dirname, join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(
      join(here, '../builder-studio/BuilderStudioApp.tsx'),
      'utf8',
    );

    assert.match(source, /accessSession\?\.projectId/);
    assert.match(source, /activeHouseHasNoPackage/);
    assert.match(source, /workspace\.activeProject === null/);
    assert.match(
      source,
      /const targetId = targetHouseId \?\? accessSession\?\.projectId \?\? urlProjectId \?\? null/,
    );
    assert.match(source, /requestOpenFolder\(targetId, \{ dirty: false \}\)/);
    assert.doesNotMatch(
      source,
      /Session alone must not override an already-open house/,
    );
  });

  it('propagates a selected Project folder before activating its House', async () => {
    const { readFileSync } = await import('node:fs');
    const { dirname, join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(
      join(here, 'useWorkspaceController.ts'),
      'utf8',
    );
    const folderSelection = source.slice(
      source.indexOf('const requestOpenFolder'),
      source.indexOf('const confirmDirtySave'),
    );

    assert.match(
      folderSelection,
      /publishBuilderHouseScope\(folderId, null\)[\s\S]*publishWorkspaceProjectChange\(folderId\)[\s\S]*requestOpenProject\(opened\.houseId/,
    );
  });

  it('PT-BS-01 — DOMY list is scoped to the active project folder only', () => {
    const base = createInitialWorkspaceRegistry();
    const created = createWorkspaceProjectFromInput(base, {
      name: 'Pilot Extra',
      companyId: 'ac-modular',
      description: '',
    });
    const opened = openWorkspaceFolder(created.state, created.folder.id);
    const withHouse = createWorkspaceObjectFromInput(opened.state, {
      name: 'Objekt Extra',
    });
    assert.ok(withHouse);
    const folderA = base.folders[0]!.id;
    const housesA = housesForFolder(withHouse.state, folderA).map((h) => h.id);
    const housesB = housesForFolder(withHouse.state, created.folder.id).map(
      (h) => h.id,
    );
    assert.deepEqual(housesA.sort(), [
      'family-98',
      'harmony-124',
      'modern-4kk',
      'villa-168',
    ]);
    assert.equal(housesB.length, 1);
    assert.equal(housesB[0], withHouse.project.id);
    assert.ok(!housesA.includes(withHouse.project.id));
  });

  it('preserves persisted authored rows without projecting them under AC Modular', () => {
    const state = mergePersistedWorkspaceSlice({
      activeProjectId: 'villa-168',
      recentProjectIds: ['villa-168'],
      lastOpenedProjectId: 'villa-168',
      extraProjects: [
        {
          id: 'authored-pilot',
          name: 'Nový pilot',
          packageRoot: 'apps/client-studio/public/house-package',
          status: 'published',
        },
        {
          id: 'opava-harmony',
          name: 'Opava',
          packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
        },
      ],
      extraFolders: [
        {
          id: 'project-test',
          name: 'test',
          companyId: 'ac-modular',
        },
      ],
    });
    assert.equal(
      state.projects.some((project) => project.id === 'authored-pilot'),
      false,
    );
    assert.ok(getCanonicalHouse('authored-pilot')?.house);
    assert.equal(
      state.projects.some((project) => project.id === 'opava-harmony'),
      false,
    );
    assert.equal(
      state.folders.some((folder) => folder.id === 'project-test'),
      false,
    );
    assert.ok(state.projects.some((project) => project.id === 'villa-168'));
  });

  it('does not project persisted AC Modular extras as current canonical DOMY', () => {
    const state = mergePersistedWorkspaceSlice({
      activeFolderId: 'project-ac-modular',
      activeProjectId: 'villa-168',
      extraProjects: Array.from({ length: 7 }, (_, index) => ({
        id: `legacy-ac-${index + 1}`,
        name: `Legacy AC ${index + 1}`,
        packageRoot: 'apps/client-studio/public/house-package',
        status: 'published' as const,
      })),
    });

    assert.deepEqual(
      housesForFolder(state, 'project-ac-modular')
        .map((house) => house.id)
        .sort(),
      ['family-98', 'harmony-124', 'modern-4kk', 'villa-168'],
    );
    const dseHouseIds = housesForFolder(
      state,
      'project-domy-s-energii',
    ).map((house) => house.id);
    assert.ok(!dseHouseIds.includes('modern-4kk'));
    assert.equal(dseHouseIds.length, 1);
    assert.ok(getCanonicalHouse('legacy-ac-1')?.house);
  });

  it('PT-PLATFORM-01 — create + merge round-trip keeps the new Projekt', () => {
    const base = createInitialWorkspaceRegistry();
    const created = createWorkspaceProjectFromInput(base, {
      name: 'Persist Pilot',
      companyId: 'ac-modular',
      description: '',
    });
    const slice = toPersistedWorkspaceSlice(created.state);
    const restored = mergePersistedWorkspaceSlice(slice);
    assert.ok(
      restored.folders.some((folder) => folder.id === created.folder.id),
    );
    assert.equal(created.folder.name, 'Persist Pilot');
  });

  it('updates project metadata without touching packageRoot', () => {
    let state = createInitialWorkspaceRegistry();
    const before = state.projects.find((project) => project.id === 'villa-168');
    assert.ok(before);
    state = updateWorkspaceProject(state, 'villa-168', {
      name: 'Villa 168 Premium',
      description: 'Upravený popis',
      status: 'ready',
      slug: 'villa-168-premium',
      metadata: 'tag:pilot',
    });
    const after = state.projects.find((project) => project.id === 'villa-168');
    assert.equal(after?.name, 'Villa 168 Premium');
    assert.equal(after?.packageRoot, before?.packageRoot);
    assert.equal(after?.metadata, 'tag:pilot');
  });
});
