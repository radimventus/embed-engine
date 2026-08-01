/**
 * CAP-BLD-08 + EPIC-BX-01 — Workspace / Project registry metadata tests.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  closeWorkspaceProject,
  createInitialWorkspaceRegistry,
  createWorkspaceProjectFromInput,
  decideProjectSwitch,
  mergePersistedWorkspaceSlice,
  openWorkspaceProject,
  toPersistedWorkspaceSlice,
  updateWorkspaceProject,
} from './workspaceRegistry';

describe('workspaceRegistry (CAP-BLD-08 / EPIC-BX-01)', () => {
  it('seeds AC Modular with Family / Harmony / Villa projects', () => {
    const state = createInitialWorkspaceRegistry();
    assert.equal(state.companies.length, 1);
    assert.equal(state.companies[0]?.name, 'AC Modular');
    assert.equal(state.projects.length, 3);
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
    assert.equal(state.projects.length, 3);
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

  it('creates a new project under a company (metadata only)', () => {
    const base = createInitialWorkspaceRegistry();
    const { state, project } = createWorkspaceProjectFromInput(base, {
      name: 'Harmony 140',
      companyId: 'ac-modular',
      objectType: 'harmony',
      description: 'Nový typ',
    });
    assert.equal(project.name, 'Harmony 140');
    assert.equal(project.companyId, 'ac-modular');
    assert.equal(project.status, 'draft');
    assert.ok(state.projects.some((item) => item.id === project.id));
    assert.equal(
      project.packageRoot,
      'apps/client-studio/public/house-packages/harmony-124',
    );
  });

  it('creates a new company inline when creating a project', () => {
    const base = createInitialWorkspaceRegistry();
    const { state, project } = createWorkspaceProjectFromInput(base, {
      name: 'Pilot A',
      companyId: '__new__',
      companyName: 'Nova Homes',
      objectType: 'villa',
      description: '',
    });
    assert.equal(project.companyId, 'company-nova-homes');
    assert.ok(
      state.companies.some(
        (company) =>
          company.id === 'company-nova-homes' && company.name === 'Nova Homes',
      ),
    );
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
