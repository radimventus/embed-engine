/**
 * CAP-BLD-08 + EPIC-BX-01 — Workspace / Project registry metadata tests.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  closeWorkspaceProject,
  createInitialWorkspaceRegistry,
  createWorkspaceObjectFromInput,
  createWorkspaceProjectFromInput,
  decideProjectSwitch,
  housesForFolder,
  mergePersistedWorkspaceSlice,
  openWorkspaceFolder,
  openWorkspaceProject,
  toPersistedWorkspaceSlice,
  updateWorkspaceProject,
} from './workspaceRegistry';

describe('workspaceRegistry (CAP-BLD-08 / EPIC-BX-01)', () => {
  it('seeds AC Modular with Family / Harmony / Villa projects', () => {
    const state = createInitialWorkspaceRegistry();
    assert.equal(state.companies.length, 1);
    assert.equal(state.companies[0]?.name, 'AC Modular');
    assert.ok(state.projects.length >= 7);
    assert.equal(state.activeProjectId, 'villa-168');
    assert.ok(
      state.projects.every(
        (project) =>
          project.companyId === 'ac-modular' &&
          typeof project.packageRoot === 'string' &&
          project.packageRoot.includes('house-package'),
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
    assert.equal(state.projects.length, 7);
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

  it('creates a new project folder with first house (metadata only)', () => {
    const base = createInitialWorkspaceRegistry();
    const { state, project, folder } = createWorkspaceProjectFromInput(base, {
      name: 'Harmony 140',
      companyId: 'ac-modular',
      objectType: 'harmony',
      description: 'Nový typ',
    });
    assert.equal(folder.name, 'Harmony 140');
    assert.equal(project.name, 'Harmony');
    assert.equal(project.folderId, folder.id);
    assert.equal(project.companyId, 'ac-modular');
    assert.equal(project.status, 'draft');
    assert.ok(state.folders.some((item) => item.id === folder.id));
    assert.ok(state.projects.some((item) => item.id === project.id));
    assert.equal(state.activeFolderId, folder.id);
    assert.equal(
      project.packageRoot,
      'apps/client-studio/public/house-packages/harmony-124',
    );
  });

  it('creates a new company inline when creating a project', () => {
    const base = createInitialWorkspaceRegistry();
    const { state, project, folder } = createWorkspaceProjectFromInput(base, {
      name: 'Pilot A',
      companyId: '__new__',
      companyName: 'Nova Homes',
      objectType: 'villa',
      description: '',
    });
    assert.equal(folder.name, 'Pilot A');
    assert.equal(project.companyId, 'company-nova-homes');
    assert.ok(
      state.companies.some(
        (company) =>
          company.id === 'company-nova-homes' && company.name === 'Nova Homes',
      ),
    );
  });

  it('creates a new object (house) inside the active project folder (PR-023)', () => {
    const base = createInitialWorkspaceRegistry();
    const opened = openWorkspaceFolder(base, base.folders[0]!.id);
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

  it('seeds default houses under review project folders', () => {
    const state = createInitialWorkspaceRegistry();
    assert.equal(state.folders.length, 3);
    assert.equal(state.folders[0]?.name, 'AC Modular Pilot');
    assert.equal(state.folders[1]?.name, 'Opava Pilot');
    assert.equal(state.folders[2]?.name, 'Brno Pilot');
    for (const folder of state.folders) {
      const houses = state.projects.filter(
        (project) => project.folderId === folder.id,
      );
      assert.ok(
        houses.length >= 2,
        `${folder.name} must have ≥2 houses, got ${houses.length}`,
      );
    }
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
