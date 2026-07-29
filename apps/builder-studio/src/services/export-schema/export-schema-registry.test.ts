import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createExportSchemaApi } from './export-schema-api';

describe('ExportSchemaRegistry', () => {
  it('initializes and registers a schema', () => {
    const api = createExportSchemaApi();
    const pkg = api.registerExportSchema(null, {
      name: 'ArtifactExport',
      schemaVersion: '1.0.0',
      title: 'Artifact Export Schema',
    });
    assert.ok(pkg.id);
    assert.strictEqual(pkg.schemas.length, 1);
    assert.strictEqual(pkg.schemas[0].name, 'ArtifactExport');
    assert.strictEqual(pkg.schemas[0].schemaVersion, '1.0.0');
    assert.strictEqual(pkg.schemas[0].status, 'Active');
  });

  it('registers multiple versions of the same schema', () => {
    const api = createExportSchemaApi();
    const pkg1 = api.registerExportSchema(null, {
      name: 'ArtifactExport',
      schemaVersion: '1.0.0',
    });
    const pkg2 = api.registerExportSchema(pkg1.id, {
      name: 'ArtifactExport',
      schemaVersion: '2.0.0',
    });
    assert.strictEqual(pkg2.schemas.length, 2);
    const versions = pkg2.schemas.map((s) => s.schemaVersion);
    assert.ok(versions.includes('1.0.0'));
    assert.ok(versions.includes('2.0.0'));
  });

  it('validates registered schemas', () => {
    const api = createExportSchemaApi();
    const pkg = api.registerExportSchema(null, {
      name: 'TestSchema',
      schemaVersion: '1.0.0',
    });
    const validation = api.validateExportSchema(pkg.id);
    assert.strictEqual(validation.valid, true);
  });

  it('finds schemas by name', () => {
    const api = createExportSchemaApi();
    api.registerExportSchema(null, { name: 'Alpha', schemaVersion: '1.0.0' });
    api.registerExportSchema(null, { name: 'Beta', schemaVersion: '1.0.0' });
    const found = api.findExportSchema('Alpha');
    assert.strictEqual(found.length, 1);
    assert.strictEqual(found[0].name, 'Alpha');
  });

  it('deprecates a schema', () => {
    const api = createExportSchemaApi();
    const pkg = api.registerExportSchema(null, {
      name: 'OldSchema',
      schemaVersion: '1.0.0',
    });
    const updated = api.deprecateExportSchema(pkg.id, pkg.schemas[0].id);
    assert.strictEqual(updated.schemas[0].status, 'Deprecated');
  });

  it('removes a schema', () => {
    const api = createExportSchemaApi();
    const pkg = api.registerExportSchema(null, {
      name: 'Gone',
      schemaVersion: '1.0.0',
    });
    const updated = api.removeExportSchema(pkg.id, pkg.schemas[0].id);
    assert.strictEqual(updated.schemas[0].status, 'Removed');
  });

  it('records events', () => {
    const api = createExportSchemaApi();
    const pkg = api.registerExportSchema(null, {
      name: 'Evented',
      schemaVersion: '1.0.0',
    });
    api.validateExportSchema(pkg.id);
    api.deprecateExportSchema(pkg.id, pkg.schemas[0].id);
    const events = api.listEvents();
    assert.ok(events.some((e) => e.type === 'ExportSchemaRegistered'));
    assert.ok(events.some((e) => e.type === 'ExportSchemaValidated'));
    assert.ok(events.some((e) => e.type === 'ExportSchemaDeprecated'));
  });

  it('disposes a package', () => {
    const api = createExportSchemaApi();
    const pkg = api.registerExportSchema(null, {
      name: 'Disposable',
      schemaVersion: '1.0.0',
    });
    const disposed = api.dispose(pkg.id);
    assert.strictEqual(disposed.metadata.status, 'Disposed');
  });

  it('maintains index entries', () => {
    const api = createExportSchemaApi();
    api.registerExportSchema(null, { name: 'Indexed', schemaVersion: '1.0.0' });
    const idx = api.listIndex();
    assert.ok(idx.length >= 1);
    assert.ok(idx.some((e) => e.name === 'Indexed'));
  });

  it('rejects empty name', () => {
    const api = createExportSchemaApi();
    assert.throws(() => {
      api.registerExportSchema(null, { name: '', schemaVersion: '1.0.0' });
    }, /does not support/);
  });
});
