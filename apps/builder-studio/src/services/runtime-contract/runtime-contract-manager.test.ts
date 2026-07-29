import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RegisterRuntimeContractInput } from '../../model';
import {
  createBasicRuntimeContractStrategy,
  createRuntimeContractValidator,
} from './basic-runtime-contract-strategy';
import { createRuntimeContractApi } from './runtime-contract-api';
import { createRuntimeContractManager } from './runtime-contract-manager';
import { createRuntimeContractIndex } from './runtime-contract-index';

function sampleContract(
  overrides: Partial<RegisterRuntimeContractInput> = {},
): RegisterRuntimeContractInput {
  return {
    name: 'Policy Contract',
    version: '1.0.0',
    capability: 'capability-policy',
    operations: [
      {
        operation: 'preview',
        request: 'PolicyPreviewRequest',
        response: 'PolicyPreviewResponse',
        errors: ['NotFound'],
      },
    ],
    dependencies: [],
    compatibility: 'Compatible',
    ...overrides,
  };
}

describe('BasicRuntimeContractStrategy', () => {
  it('registers contract without Runtime mutation', () => {
    const strategy = createBasicRuntimeContractStrategy();
    const contract = strategy.register(sampleContract(), (prefix) => `${prefix}-1`);
    assert.equal(contract.capability, 'capability-policy');
    assert.equal(contract.operations.length, 1);
    assert.equal(contract.operations[0]?.operation, 'preview');
  });
});

describe('RuntimeContractValidator', () => {
  it('flags empty operations', () => {
    const validator = createRuntimeContractValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      contracts: [
        {
          id: 'c1',
          name: 'Empty',
          version: '1.0.0',
          capability: 'capability-policy',
          operations: [],
          dependencies: [],
          metadata: {
            title: 'Empty',
            notes: 'n',
            status: 'Draft',
            compatibility: 'Compatible',
          },
        },
      ],
      createdAt: '2026-08-19T00:00:00.000Z',
      updatedAt: '2026-08-19T00:00:00.000Z',
      metadata: {
        title: 't',
        sessionId: 's1',
        notes: 'n',
        status: 'Draft',
      },
      validation: null,
    });
    assert.equal(result.valid, false);
    assert.ok(
      result.issues.some((item) => item.code === 'contract-empty-operations'),
    );
  });
});

describe('createRuntimeContractManager', () => {
  it('registers, validates, publishes and deprecates', () => {
    const manager = createRuntimeContractManager({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = manager.initialize({
      sessionId: 'runtime-session-1',
      title: 'Demo Contracts',
      contracts: [sampleContract()],
    });
    assert.equal(pkg.contracts.length, 1);
    assert.ok(
      manager
        .getEvents()
        .some((event) => event.type === 'RuntimeContractRegistered'),
    );

    const validation = manager.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = manager.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(published.contracts[0]?.metadata.status, 'Published');

    const deprecated = manager.deprecate(pkg.id, published.contracts[0]!.id);
    assert.equal(deprecated.contracts[0]?.metadata.status, 'Deprecated');
    assert.ok(
      manager
        .getEvents()
        .some((event) => event.type === 'RuntimeContractDeprecated'),
    );
  });
});

describe('RuntimeContractIndex', () => {
  it('indexes contracts', () => {
    const index = createRuntimeContractIndex();
    const manager = createRuntimeContractManager();
    const pkg = manager.initialize({
      sessionId: 's1',
      contracts: [sampleContract()],
    });
    const entries = index.index(pkg.id, pkg);
    assert.equal(entries.length, 1);
    assert.equal(index.find('capability-policy').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeContractApi', () => {
  it('exposes register / publish / list / find / validate', () => {
    const api = createRuntimeContractApi();
    const created = api.registerRuntimeContract(null, sampleContract(), {
      sessionId: 'runtime-session-1',
      title: 'API Contracts',
    });
    assert.equal(api.listRuntimeContracts(created.id).length, 1);
    const validated = api.validateRuntimeContract(created.id);
    assert.equal(validated.valid, true);
    assert.equal(
      api.findRuntimeContract(created.id, 'capability-policy').length,
      1,
    );
    const published = api.publishRuntimeContract(created.id);
    assert.equal(published.metadata.status, 'Published');
  });
});
