import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createLearningIndex } from './learning-index';
import { createLearningPackageManagerApi } from './learning-package-manager-api';
import { createLearningPackageManager } from './learning-package-manager';
import { createLearningPackageValidator } from './learning-package-validator';

describe('LearningIndex', () => {
  it('indexes and finds record references', () => {
    const index = createLearningIndex();
    index.index('pkg-1', [
      {
        id: 'ref-1',
        recordId: 'learning-record-1',
        source: 'learning-pipeline',
        timestamp: '2026-08-18T23:50:00.000Z',
        metadata: { note: 'n' },
      },
    ]);
    assert.equal(index.find('learning-record-1').length, 1);
    assert.equal(index.list('pkg-1').length, 1);
  });
});

describe('LearningPackageValidator', () => {
  it('rejects empty package name', () => {
    const validator = createLearningPackageValidator({
      now: () => new Date('2026-08-18T23:50:00.000Z'),
    });
    const result = validator.validate({
      id: 'pkg',
      name: '',
      version: '0.1.0',
      createdAt: '2026-08-18T23:50:00.000Z',
      updatedAt: '2026-08-18T23:50:00.000Z',
      records: [],
      versions: [
        {
          version: '0.1.0',
          createdAt: '2026-08-18T23:50:00.000Z',
          author: 'builder',
          changes: ['created'],
          metadata: { notes: 'n' },
        },
      ],
      metadata: {
        title: 't',
        description: 'd',
        status: 'Draft',
      },
      validation: null,
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-name'));
  });
});

describe('createLearningPackageManager', () => {
  it('creates package, adds/removes records, publishes and validates', () => {
    const manager = createLearningPackageManager({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const created = manager.createPackage({
      name: 'Demo Package',
      title: 'Demo Learning Package',
    });
    assert.equal(created.metadata.status, 'Draft');
    assert.ok(
      manager
        .getEvents(created.id)
        .some((event) => event.type === 'LearningPackageCreated'),
    );

    const withRecord = manager.addRecord({
      packageId: created.id,
      recordId: 'learning-record-1',
      source: 'learning-pipeline',
    });
    assert.equal(withRecord.records.length, 1);
    assert.ok(
      manager
        .getEvents(created.id)
        .some((event) => event.type === 'LearningRecordAdded'),
    );

    const removed = manager.removeRecord(created.id, 'learning-record-1');
    assert.equal(removed.records.length, 0);
    assert.ok(
      manager
        .getEvents(created.id)
        .some((event) => event.type === 'LearningRecordRemoved'),
    );

    manager.addRecord({
      packageId: created.id,
      recordId: 'learning-record-2',
    });
    const published = manager.publishPackage(created.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      manager
        .getEvents(created.id)
        .some((event) => event.type === 'LearningPackagePublished'),
    );
    assert.ok(manager.getIndex().list(created.id).length >= 1);
  });

  it('exposes API create/load/publish/list/validate', () => {
    const manager = createLearningPackageManager();
    const api = createLearningPackageManagerApi(manager);
    const pkg = api.createLearningPackage({ name: 'API Package' });
    assert.ok(api.loadLearningPackage(pkg.id));
    api.createLearningPackage; // touch
    manager.addRecord({
      packageId: pkg.id,
      recordId: 'learning-record-api',
    });
    assert.equal(api.listLearningRecords(pkg.id).length, 1);
    const validated = api.validateLearningPackage(pkg.id);
    assert.equal(validated.validation?.valid, true);
    const published = api.publishLearningPackage(pkg.id);
    assert.equal(published.metadata.status, 'Published');
  });
});
