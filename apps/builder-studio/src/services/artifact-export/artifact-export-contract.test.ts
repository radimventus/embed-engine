import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createArtifactExportApi } from './artifact-export-api';

describe('ArtifactExportContract', () => {
  it('initializes and builds a deterministic export model', () => {
    const api = createArtifactExportApi();
    const pkg = api.buildArtifactExport(null, {
      artifactId: 'art-001',
      artifactType: 'RuntimeBootstrap',
      exportVersion: '1.0.0',
      schemaVersion: '1',
      title: 'Bootstrap Export',
    });
    assert.ok(pkg.id);
    assert.strictEqual(pkg.exportModel.artifactId, 'art-001');
    assert.strictEqual(pkg.exportModel.artifactType, 'RuntimeBootstrap');
    assert.strictEqual(pkg.exportModel.exportVersion, '1.0.0');
    assert.strictEqual(pkg.exportModel.schemaVersion, '1');
    assert.strictEqual(pkg.metadata.status, 'Active');
  });

  it('validates a built export model', () => {
    const api = createArtifactExportApi();
    const pkg = api.buildArtifactExport(null, {
      artifactId: 'art-002',
      artifactType: 'ClientPublication',
      exportVersion: '2.0.0',
      schemaVersion: '1',
    });
    const validation = api.validateArtifactExport(pkg.id);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.issues.length, 0);
  });

  it('exports and marks status as Exported', () => {
    const api = createArtifactExportApi();
    const pkg = api.buildArtifactExport(null, {
      artifactId: 'art-003',
      artifactType: 'PublishedObject',
      exportVersion: '1.0.0',
      schemaVersion: '1',
    });
    const exported = api.exportArtifact(pkg.id);
    assert.strictEqual(exported.metadata.status, 'Exported');
    assert.strictEqual(exported.exportModel.metadata.status, 'Exported');
  });

  it('produces deterministic export model IDs for same input', () => {
    const api = createArtifactExportApi();
    const pkg1 = api.buildArtifactExport(null, {
      artifactId: 'art-det',
      artifactType: 'RuntimeBootstrap',
      exportVersion: '1.0.0',
      schemaVersion: '1',
    });
    const api2 = createArtifactExportApi();
    const pkg2 = api2.buildArtifactExport(null, {
      artifactId: 'art-det',
      artifactType: 'RuntimeBootstrap',
      exportVersion: '1.0.0',
      schemaVersion: '1',
    });
    assert.strictEqual(pkg1.exportModel.id, pkg2.exportModel.id);
  });

  it('records events for build, validate, export', () => {
    const api = createArtifactExportApi();
    const pkg = api.buildArtifactExport(null, {
      artifactId: 'art-ev',
      artifactType: 'Test',
      exportVersion: '1.0.0',
      schemaVersion: '1',
    });
    api.validateArtifactExport(pkg.id);
    api.exportArtifact(pkg.id);
    const events = api.listEvents();
    assert.ok(events.some((e) => e.type === 'ArtifactExportBuilt'));
    assert.ok(events.some((e) => e.type === 'ArtifactExportValidated'));
    assert.ok(events.some((e) => e.type === 'ArtifactExportPublished'));
  });

  it('lists and finds artifact exports', () => {
    const api = createArtifactExportApi();
    api.buildArtifactExport(null, {
      artifactId: 'art-find',
      artifactType: 'Test',
      exportVersion: '1.0.0',
      schemaVersion: '1',
    });
    const list = api.listArtifactExports();
    assert.strictEqual(list.length, 1);
    const found = api.findArtifactExport('art-find');
    assert.ok(found);
    assert.strictEqual(found.artifactId, 'art-find');
  });

  it('disposes artifact export package', () => {
    const api = createArtifactExportApi();
    const pkg = api.buildArtifactExport(null, {
      artifactId: 'art-disp',
      artifactType: 'Test',
      exportVersion: '1.0.0',
      schemaVersion: '1',
    });
    const disposed = api.disposeArtifactExport(pkg.id);
    assert.strictEqual(disposed.metadata.status, 'Disposed');
  });

  it('rejects export of invalid model', () => {
    const api = createArtifactExportApi();
    const pkg = api.initialize({
      sessionId: 'test-session',
      title: 'Invalid Export',
    });
    // The initial package has schemaVersion '1' but artifactId 'artifact-pending'
    // which should still validate because schema is supported.
    // Let's force an unsupported schema by rebuilding with bad data.
    assert.throws(() => {
      api.buildArtifactExport(pkg.id, {
        artifactId: '',
        artifactType: '',
        exportVersion: '',
        schemaVersion: '',
      });
    }, /does not support/);
  });

  it('maintains index entries', () => {
    const api = createArtifactExportApi();
    api.buildArtifactExport(null, {
      artifactId: 'art-idx',
      artifactType: 'Test',
      exportVersion: '1.0.0',
      schemaVersion: '1',
    });
    const index = api.listIndex();
    assert.ok(index.length >= 1);
    assert.ok(index.some((e) => e.artifactId === 'art-idx'));
  });
});
