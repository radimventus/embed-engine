import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { getWorkspaceSidebarHouses } from './WorkspaceSidebar';
import { mergePersistedWorkspaceSlice } from './workspaceRegistry';

describe('WorkspaceSidebar DOMY projection', () => {
  it('CAP-VR42b — uses the shared scope selector without changing DOMY cards', () => {
    const source = readFileSync(
      fileURLToPath(new URL('./WorkspaceSidebar.tsx', import.meta.url)),
      'utf8',
    );

    assert.match(source, /PlatformScopeSelect/);
    assert.doesNotMatch(source, /<select\b/);
    assert.match(source, /onOpenFolder\(nextId\)/);
    assert.match(source, /onCreateObject/);
    assert.match(source, /houses\.map/);
  });

  it('CAP-VR36F — renders persisted Builder-authored drafts after reload', () => {
    const dse = mergePersistedWorkspaceSlice({
      activeFolderId: 'project-domy-s-energii',
      activeProjectId: 'modern-4kk',
      houseFolderIds: {
        'modern-4kk': 'project-domy-s-energii',
        'patrovy-5kk': 'project-domy-s-energii',
        'test-4': 'project-ac-modular',
        'test-13': 'project-ac-modular',
      },
      houseLabels: {
        'patrovy-5kk': 'PATROVÝ 5KK',
        'test-4': 'test 4',
        'test-13': 'test 13',
      },
      houseMetadata: {
        'patrovy-5kk': 'builder-authored-house',
        'test-4': 'builder-authored-house',
        'test-13': 'builder-authored-house',
      },
    });

    assert.deepEqual(
      getWorkspaceSidebarHouses(dse).map((house) => house.id),
      ['modern-4kk', 'patrovy-5kk'],
    );

    const ac = mergePersistedWorkspaceSlice({
      ...dse,
      activeFolderId: 'project-ac-modular',
      activeProjectId: 'family-98',
    });
    assert.deepEqual(
      getWorkspaceSidebarHouses(ac).map((house) => house.id),
      ['family-98', 'harmony-124', 'villa-168', 'test-4', 'test-13'],
    );
  });
});
