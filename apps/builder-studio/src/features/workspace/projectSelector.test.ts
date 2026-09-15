import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
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


test('TASK 114 follow-up — Builder folder switch waits for canonical durable context', async () => {
  const source = await readFile(new URL('./useWorkspaceController.ts', import.meta.url), 'utf8');
  assert.match(source, /switchAuthoritativeProjectContext\(folderId, 'builder'\)/);
  assert.match(source, /switchProject: authorize/);
  assert.match(source, /runBuilderProjectAuthorityOrder/);
});


test('TASK 114 VR — Builder waits for Host Project confirmation before first-House activation', async () => {
  const source = await readFile(new URL('./useWorkspaceController.ts', import.meta.url), 'utf8');
  const start = source.indexOf('const requestOpenFolder');
  const project = source.indexOf('switchProject: authorize', start);
  const host = source.indexOf('confirmAuthoritativeWorkspaceProjectChange(folderId)', project);
  const house = source.indexOf('requestOpenProject(opened.houseId', host);
  assert.ok(project >= 0 && host > project && house > host);
  assert.doesNotMatch(source.slice(start, host), /publishBuilderHouseScope\(folderId, null\)/);
});
