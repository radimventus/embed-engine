import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAssetService } from './asset-service';
import { createProjectRegistry } from './project-registry-service';
import { createWorkspaceApi } from './workspace-api';
import { createWorkspaceService } from './workspace-service';

describe('createWorkspaceService', () => {
  it('opens with the first project as active', () => {
    const registry = createProjectRegistry();
    const workspace = createWorkspaceService({ registry });
    const active = workspace.getActiveProject();
    assert.ok(active !== null);
    assert.equal(active.projectId, 'harmony-124');
    assert.equal(workspace.getWorkspace().assets.placeholder, true);
    assert.equal(workspace.getWorkspace().runtime.placeholder, true);
    assert.equal(workspace.getWorkspace().publish.placeholder, true);
  });

  it('switches active project and preserves content model', () => {
    const registry = createProjectRegistry();
    const assets = createAssetService();
    const workspace = createWorkspaceService({ registry, assets });
    const opened = workspace.setActiveProject('family-98');
    assert.equal(opened.projectId, 'family-98');
    assert.equal(workspace.getWorkspace().activeProjectId, 'family-98');
    assert.equal(
      workspace.getActiveProjectModel()?.assets.media[0]?.files.length,
      2,
    );
  });

  it('creates and activates a new project with empty assets', () => {
    const registry = createProjectRegistry();
    const workspace = createWorkspaceService({ registry });
    const created = workspace.createAndActivateProject('Nordic 80');
    assert.equal(created.name, 'Nordic 80');
    assert.equal(workspace.getActiveProject()?.projectId, created.projectId);
    assert.ok(workspace.getPipelineSnapshot() !== null);
    assert.equal(
      workspace.getActiveProjectModel()?.assets.media.every(
        (item) => item.state === 'Empty',
      ),
      true,
    );
  });

  it('initializes a workspace package for projects screen', () => {
    const registry = createProjectRegistry();
    const workspace = createWorkspaceService({ registry });
    const pkg = workspace.initialize();
    assert.equal(pkg.id, 'builder-project-workspace');
    assert.ok(pkg.projects.length >= 1);
    assert.equal(workspace.getIndex().length, pkg.projects.length);
  });

  it('duplicates a project with a new id and preserved content', () => {
    const registry = createProjectRegistry();
    const assets = createAssetService();
    const workspace = createWorkspaceService({ registry, assets });
    const source = workspace.getActiveProject();
    assert.ok(source !== null);
    const duplicate = workspace.duplicateProject(source.projectId);
    assert.notEqual(duplicate.id, source.projectId);
    assert.equal(
      assets.getActiveProject(duplicate.id)?.assets.media.length,
      assets.getActiveProject(source.projectId)?.assets.media.length,
    );
    assert.ok(
      workspace
        .getEvents()
        .some((event) => event.type === 'ProjectDuplicated'),
    );
  });

  it('archives a project without deleting it and emits status change', () => {
    const registry = createProjectRegistry();
    const workspace = createWorkspaceService({ registry });
    const created = workspace.createProject({ name: 'Archive Candidate' });
    const archived = workspace.archiveProject(created.id);
    assert.equal(archived.status, 'ARCHIVED');
    assert.ok(
      workspace.listProjects().some((project) => project.id === created.id),
    );
    assert.ok(
      workspace
        .getEvents()
        .some((event) => event.type === 'ProjectStatusChanged'),
    );
  });

  it('finds a project by id and records lastOpenedAt on open', () => {
    const registry = createProjectRegistry();
    const workspace = createWorkspaceService({ registry });
    const opened = workspace.openProject('family-98');
    assert.ok(opened.lastOpenedAt !== null);
    assert.equal(workspace.findProject('family-98')?.id, 'family-98');
    assert.equal(workspace.findProject('missing'), null);
  });

  it('filters and sorts projects through listProjects API', () => {
    const registry = createProjectRegistry();
    const service = createWorkspaceService({ registry });
    const api = createWorkspaceApi(service);
    service.initialize();
    const byName = api.listProjects({ query: 'family', sortBy: 'name' });
    assert.equal(byName.length, 1);
    assert.equal(byName[0]?.name, 'Family 98');
    const byStatus = api.listProjects({ sortBy: 'status' });
    assert.ok(byStatus.length >= 2);
  });

  it('validates workspace integrity', () => {
    const registry = createProjectRegistry();
    const workspace = createWorkspaceService({ registry });
    workspace.initialize();
    const validation = workspace.validate();
    assert.equal(validation.valid, true);
  });

  it('mutates assets through workspace without losing section independence', () => {
    const registry = createProjectRegistry();
    const workspace = createWorkspaceService({ registry });
    workspace.addAsset('xlsx', { name: 'prices.xlsx', sizeBytes: 40_000 });
    assert.equal(
      workspace.getActiveProjectModel()?.assets.knowledge[2]?.files.length,
      1,
    );
    workspace.removeAsset(
      'xlsx',
      workspace.getActiveProjectModel()!.assets.knowledge[2]!.files[0]!.assetId,
    );
    assert.equal(
      workspace.getActiveProjectModel()?.assets.knowledge[2]?.state,
      'Empty',
    );
  });
});
