/**
 * PR-012 — workspace storage load + legacy v1 migration.
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';

import {
  WORKSPACE_STORAGE_KEY,
  WORKSPACE_STORAGE_KEY_LEGACY,
} from './workspaceRegistry';
import {
  loadWorkspaceRegistryFromStorage,
  saveWorkspaceRegistryToStorage,
} from './workspaceStorage';

const memory = new Map<string, string>();

describe('workspaceStorage migration (PR-012)', () => {
  beforeEach(() => {
    memory.clear();
    (globalThis as { localStorage?: Storage }).localStorage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
      clear: () => {
        memory.clear();
      },
      key: () => null,
      length: 0,
    };
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  it('migrates legacy v1 payload into v2 without manual wipe', () => {
    memory.set(
      WORKSPACE_STORAGE_KEY_LEGACY,
      JSON.stringify({
        activeProjectId: 'harmony-124',
        recentProjectIds: ['harmony-124', 'family-98'],
        lastOpenedProjectId: 'harmony-124',
        extraProjects: [
          {
            id: 'custom-house',
            name: 'Custom',
            packageRoot: 'apps/client-studio/public/house-package',
          },
        ],
      }),
    );

    const state = loadWorkspaceRegistryFromStorage();
    assert.equal(state.activeProjectId, 'harmony-124');
    assert.ok(state.folders.length >= 1);
    assert.ok(state.projects.some((project) => project.id === 'custom-house'));
    assert.ok(
      state.projects.every(
        (project) =>
          typeof project.folderId === 'string' && project.folderId.length > 0,
      ),
    );
    assert.ok(memory.has(WORKSPACE_STORAGE_KEY));
  });

  it('heals incomplete v2 payloads on load', () => {
    memory.set(
      WORKSPACE_STORAGE_KEY,
      JSON.stringify({
        activeProjectId: 'villa-168',
        recentProjectIds: ['villa-168'],
        lastOpenedProjectId: 'villa-168',
        extraProjects: [],
      }),
    );

    const state = loadWorkspaceRegistryFromStorage();
    assert.equal(state.activeProjectId, 'villa-168');
    assert.equal(state.folders[0]?.name, 'AC Modular Pilot');
    assert.ok(state.folders.length >= 3);
    saveWorkspaceRegistryToStorage(state);
    const raw = memory.get(WORKSPACE_STORAGE_KEY);
    assert.ok(raw !== undefined);
    const parsed = JSON.parse(raw) as { activeFolderId?: string | null };
    assert.equal(typeof parsed.activeFolderId, 'string');
  });
});
