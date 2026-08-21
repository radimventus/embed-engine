import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  CaseProcessingNotFoundError,
  FileCaseProcessingRepository,
  isReferenceOperationalCaseId,
} from './caseProcessingRepository';

describe('FileCaseProcessingRepository', () => {
  it('accepts a REFERENCE case idempotently and isolates House/Project/Company', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'case-processing-'));
    const repository = new FileCaseProcessingRepository(
      join(dir, 'case-processing.json'),
    );
    const bungalov = {
      caseId: 'ref:company-a:project-a:house-b:energy-land',
      companyId: 'company-a',
      projectId: 'project-a',
      houseId: 'house-b',
    };

    const accepted = await repository.accept(bungalov);
    assert.equal(accepted.processingStatus, 'accepted');
    const again = await repository.accept(bungalov);
    assert.equal(again.processingStatus, 'accepted');

    const listed = await repository.list({
      companyId: 'company-a',
      projectId: 'project-a',
      houseId: 'house-b',
    });
    assert.equal(listed.length, 1);

    assert.deepEqual(
      await repository.list({
        companyId: 'company-a',
        projectId: 'project-a',
        houseId: 'house-other',
      }),
      [],
    );
    assert.deepEqual(
      await repository.list({
        companyId: 'company-b',
        projectId: 'project-a',
      }),
      [],
    );

    await assert.rejects(
      repository.accept({
        ...bungalov,
        caseId: 'lead-real',
      }),
      CaseProcessingNotFoundError,
    );
    await assert.rejects(
      repository.accept({
        ...bungalov,
        houseId: 'house-other',
      }),
      CaseProcessingNotFoundError,
    );

    const persisted = JSON.parse(
      await readFile(join(dir, 'case-processing.json'), 'utf8'),
    ) as { readonly cases: readonly unknown[] };
    assert.equal(persisted.cases.length, 1);
  });

  it('recognizes only scoped REFERENCE operational identities', () => {
    assert.equal(
      isReferenceOperationalCaseId(
        'ref:co:pr:ho:energy-land',
        'co',
        'pr',
        'ho',
      ),
      true,
    );
    assert.equal(
      isReferenceOperationalCaseId(
        'ref:co:pr:ho:energy-land',
        'co',
        'pr',
        'other',
      ),
      false,
    );
    assert.equal(
      isReferenceOperationalCaseId('lead-1', 'co', 'pr', 'ho'),
      false,
    );
  });
});
