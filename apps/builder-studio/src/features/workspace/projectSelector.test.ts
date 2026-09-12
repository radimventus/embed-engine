import assert from 'node:assert/strict';
import test from 'node:test';
import {getWorkspaceSidebarFolders} from './WorkspaceSidebar';
import {composeWorkspaceRegistry} from './workspaceRegistry';

test('selector puts newest projects first without mutating registry and supports archive restoration', () => {
  const folders = [
    {id: 'old', name: 'Old', companyId: 'c'},
    {id: 'archived', name: 'Archived', companyId: 'c', status: 'archived' as const},
    {id: 'new', name: 'New', companyId: 'c', createdAt: '2026-09-12T10:00:00Z'},
  ];
  const registry = {...composeWorkspaceRegistry({}), folders, activeFolderId: 'old'};
  assert.deepEqual(getWorkspaceSidebarFolders(registry).map(x => x.id), ['new', 'old']);
  assert.deepEqual(getWorkspaceSidebarFolders(registry, true).map(x => x.id), ['new', 'archived', 'old']);
  assert.deepEqual(getWorkspaceSidebarFolders({...registry, activeFolderId: 'archived'}).map(x => x.id), ['new', 'archived', 'old']);
  assert.deepEqual(folders.map(x => x.id), ['old', 'archived', 'new']);
});
