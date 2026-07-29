import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createExportCompatibilityApi } from './export-compatibility-api';

describe('ExportCompatibilityRegistry', () => {
  it('initializes and registers a compatibility entry', () => {
    const api = createExportCompatibilityApi();
    const pkg = api.registerExportCompatibility(null, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '2.0.0',
      compatibilityLevel: 'BACKWARD',
    });
    assert.ok(pkg.id);
    assert.strictEqual(pkg.compatibilities.length, 1);
    assert.strictEqual(pkg.compatibilities[0].compatibilityLevel, 'BACKWARD');
  });

  it('supports multiple compatibility levels', () => {
    const api = createExportCompatibilityApi();
    const pkg1 = api.registerExportCompatibility(null, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '2.0.0',
      compatibilityLevel: 'FULL',
    });
    const pkg2 = api.registerExportCompatibility(pkg1.id, {
      sourceSchemaVersion: '2.0.0',
      targetSchemaVersion: '3.0.0',
      compatibilityLevel: 'FORWARD',
    });
    const pkg3 = api.registerExportCompatibility(pkg2.id, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '3.0.0',
      compatibilityLevel: 'INCOMPATIBLE',
    });
    assert.strictEqual(pkg3.compatibilities.length, 3);
    const levels = pkg3.compatibilities.map((c) => c.compatibilityLevel);
    assert.ok(levels.includes('FULL'));
    assert.ok(levels.includes('FORWARD'));
    assert.ok(levels.includes('INCOMPATIBLE'));
  });

  it('validates registered compatibilities', () => {
    const api = createExportCompatibilityApi();
    const pkg = api.registerExportCompatibility(null, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '2.0.0',
      compatibilityLevel: 'FULL',
    });
    const validation = api.validateExportCompatibility(pkg.id);
    assert.strictEqual(validation.valid, true);
  });

  it('finds compatibility by source version', () => {
    const api = createExportCompatibilityApi();
    const pkg = api.registerExportCompatibility(null, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '2.0.0',
      compatibilityLevel: 'BACKWARD',
    });
    api.registerExportCompatibility(pkg.id, {
      sourceSchemaVersion: '2.0.0',
      targetSchemaVersion: '3.0.0',
      compatibilityLevel: 'FULL',
    });
    const found = api.findExportCompatibility('1.0.0');
    assert.strictEqual(found.length, 1);
    assert.strictEqual(found[0].targetSchemaVersion, '2.0.0');
  });

  it('deprecates a compatibility entry', () => {
    const api = createExportCompatibilityApi();
    const pkg = api.registerExportCompatibility(null, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '2.0.0',
      compatibilityLevel: 'FULL',
    });
    const updated = api.deprecateExportCompatibility(pkg.id, pkg.compatibilities[0].id);
    assert.strictEqual(updated.compatibilities[0].status, 'Deprecated');
  });

  it('removes a compatibility entry', () => {
    const api = createExportCompatibilityApi();
    const pkg = api.registerExportCompatibility(null, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '2.0.0',
      compatibilityLevel: 'FULL',
    });
    const updated = api.removeExportCompatibility(pkg.id, pkg.compatibilities[0].id);
    assert.strictEqual(updated.compatibilities[0].status, 'Removed');
  });

  it('records events', () => {
    const api = createExportCompatibilityApi();
    const pkg = api.registerExportCompatibility(null, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '2.0.0',
      compatibilityLevel: 'FULL',
    });
    api.validateExportCompatibility(pkg.id);
    api.deprecateExportCompatibility(pkg.id, pkg.compatibilities[0].id);
    const events = api.listEvents();
    assert.ok(events.some((e) => e.type === 'ExportCompatibilityRegistered'));
    assert.ok(events.some((e) => e.type === 'ExportCompatibilityValidated'));
    assert.ok(events.some((e) => e.type === 'ExportCompatibilityDeprecated'));
  });

  it('disposes a package', () => {
    const api = createExportCompatibilityApi();
    const pkg = api.registerExportCompatibility(null, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '2.0.0',
      compatibilityLevel: 'FULL',
    });
    const disposed = api.dispose(pkg.id);
    assert.strictEqual(disposed.metadata.status, 'Disposed');
  });

  it('maintains index entries', () => {
    const api = createExportCompatibilityApi();
    api.registerExportCompatibility(null, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '2.0.0',
      compatibilityLevel: 'BACKWARD',
    });
    const idx = api.listIndex();
    assert.ok(idx.length >= 1);
    assert.ok(idx.some((e) => e.sourceSchemaVersion === '1.0.0'));
  });

  it('rejects empty source version', () => {
    const api = createExportCompatibilityApi();
    assert.throws(() => {
      api.registerExportCompatibility(null, {
        sourceSchemaVersion: '',
        targetSchemaVersion: '2.0.0',
        compatibilityLevel: 'FULL',
      });
    }, /does not support/);
  });

  it('warns about same source and target version in validation', () => {
    const api = createExportCompatibilityApi();
    const pkg = api.initialize({ sessionId: 'test' });
    const next = api.registerExportCompatibility(pkg.id, {
      sourceSchemaVersion: '1.0.0',
      targetSchemaVersion: '1.0.0',
      compatibilityLevel: 'FULL',
    });
    const validation = api.validateExportCompatibility(next.id);
    assert.ok(validation.issues.some((i) => i.message.includes('identical')));
  });
});
