import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createExportCertificationApi } from './export-certification-api';

describe('ExportCertificationService', () => {
  it('certifies an export and exposes the certificate via list/find', () => {
    const api = createExportCertificationApi();
    const pkg = api.certifyExport(null, {
      artifactId: 'artifact-001',
      schemaVersion: '1.0.0',
      certificationVersion: '1.0.0',
    });

    assert.ok(pkg.id);
    assert.strictEqual(pkg.certificate.artifactId, 'artifact-001');
    assert.strictEqual(pkg.certificate.status, 'CERTIFIED');
    assert.strictEqual(api.listExportCertificates().length, 1);
    assert.strictEqual(
      api.findExportCertificate('artifact-001')?.artifactId,
      'artifact-001',
    );
  });

  it('validates a certificate', () => {
    const api = createExportCertificationApi();
    const pkg = api.certifyExport(null, {
      artifactId: 'artifact-validate',
      schemaVersion: '1.0.0',
      certificationVersion: '1.0.0',
    });
    const validation = api.validateExportCertification(pkg.id);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.issues.length, 0);
  });

  it('revokes a certificate', () => {
    const api = createExportCertificationApi();
    const pkg = api.certifyExport(null, {
      artifactId: 'artifact-revoke',
      schemaVersion: '1.0.0',
      certificationVersion: '1.0.0',
    });
    const revoked = api.revokeExportCertification(pkg.id);
    assert.strictEqual(revoked.certificate.status, 'REVOKED');
  });

  it('records certify and validate events', () => {
    const api = createExportCertificationApi();
    const pkg = api.certifyExport(null, {
      artifactId: 'artifact-events',
      schemaVersion: '1.0.0',
      certificationVersion: '1.0.0',
    });
    api.validateExportCertification(pkg.id);
    const events = api.listEvents();
    assert.ok(events.some((e) => e.type === 'ExportCertified'));
    assert.ok(events.some((e) => e.type === 'ExportCertificationValidated'));
  });

  it('maintains index entries', () => {
    const api = createExportCertificationApi();
    api.certifyExport(null, {
      artifactId: 'artifact-index',
      schemaVersion: '1.0.0',
      certificationVersion: '1.0.0',
    });
    const idx = api.listIndex();
    assert.ok(idx.length >= 1);
    assert.ok(idx.some((e) => e.artifactId === 'artifact-index'));
  });

  it('disposes a package', () => {
    const api = createExportCertificationApi();
    const pkg = api.certifyExport(null, {
      artifactId: 'artifact-dispose',
      schemaVersion: '1.0.0',
      certificationVersion: '1.0.0',
    });
    const disposed = api.disposeExportCertification(pkg.id);
    assert.strictEqual(disposed.metadata.status, 'Disposed');
  });

  it('rejects empty certify input in strategy supports()', () => {
    const api = createExportCertificationApi();
    assert.throws(() => {
      api.certifyExport(null, {
        artifactId: '',
        schemaVersion: '1.0.0',
        certificationVersion: '1.0.0',
      });
    }, /does not support/);
  });
});

