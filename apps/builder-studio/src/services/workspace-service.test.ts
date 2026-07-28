import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAssetService } from './asset-service';
import { createProjectRegistry } from './project-registry-service';
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
