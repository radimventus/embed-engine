import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  closeWorkspaceProject,
  createInitialWorkspaceRegistry,
  decideProjectSwitch,
  mergePersistedWorkspaceSlice,
  openWorkspaceProject,
  toPersistedWorkspaceSlice,
} from './workspaceRegistry';

describe('workspaceRegistry (CAP-BLD-08)', () => {
  it('seeds Family / Harmony / Villa as HP roots only', () => {
    const state = createInitialWorkspaceRegistry();
    assert.equal(state.projects.length, 3);
    assert.equal(state.activeProjectId, 'villa-168');
    assert.ok(
      state.projects.every(
        (project) =>
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
});
