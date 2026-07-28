import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createProjectRegistry } from './project-registry-service';
import { MOCK_PROJECTS } from './mock-data';

describe('createProjectRegistry', () => {
  it('lists seeded projects', () => {
    const registry = createProjectRegistry();
    assert.equal(registry.listProjects().length, MOCK_PROJECTS.length);
  });

  it('opens an existing project', () => {
    const registry = createProjectRegistry();
    const project = registry.openProject('harmony-124');
    assert.equal(project.name, 'Harmony 124');
  });

  it('creates a draft project with unique id', () => {
    const registry = createProjectRegistry();
    const created = registry.createProject({ name: 'Harmony 124' });
    assert.equal(created.status, 'Draft');
    assert.equal(created.projectId, 'harmony-124-2');
    assert.ok(registry.getProject(created.projectId) !== null);
  });

  it('exposes archive and delete interfaces', () => {
    const registry = createProjectRegistry([]);
    const created = registry.createProject({ name: 'Temp House' });
    const archived = registry.archiveProject(created.projectId);
    assert.equal(archived.status, 'Archived');
    registry.deleteProject(created.projectId);
    assert.equal(registry.getProject(created.projectId), null);
  });
});
