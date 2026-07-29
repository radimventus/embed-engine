import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RegisterRuntimeExtensionInput } from '../../model';
import {
  createBasicRuntimeExtensionStrategy,
  createRuntimeExtensionValidator,
} from './basic-runtime-extension-strategy';
import { createRuntimeExtensionApi } from './runtime-extension-api';
import { createRuntimeExtensionFramework } from './runtime-extension-framework';
import { createRuntimeExtensionIndex } from './runtime-extension-index';

function sampleExtension(
  overrides: Partial<RegisterRuntimeExtensionInput> = {},
): RegisterRuntimeExtensionInput {
  return {
    name: 'Policy Extension',
    version: '1.0.0',
    capability: 'capability-policy',
    dependencies: [],
    contractId: 'runtime-contract-1',
    source: 'Runtime Contract Manager',
    ...overrides,
  };
}

describe('BasicRuntimeExtensionStrategy', () => {
  it('registers and toggles extension status', () => {
    const strategy = createBasicRuntimeExtensionStrategy();
    const extension = strategy.register(
      sampleExtension(),
      (prefix) => `${prefix}-1`,
    );
    assert.equal(extension.status, 'Registered');
    assert.equal(strategy.enable(extension).status, 'Enabled');
    assert.equal(strategy.disable(extension).status, 'Disabled');
  });
});

describe('RuntimeExtensionValidator', () => {
  it('flags missing capability', () => {
    const validator = createRuntimeExtensionValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      registry: {
        id: 'r1',
        extensions: [
          {
            id: 'e1',
            name: 'Broken',
            version: '1.0.0',
            capability: '',
            dependencies: [],
            status: 'Registered',
            metadata: {
              title: 'Broken',
              notes: 'n',
              contractId: null,
              source: 'test',
            },
          },
        ],
        generatedAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: 's1',
        },
      },
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
      result.issues.some(
        (item) => item.code === 'extension-missing-capability',
      ),
    );
  });
});

describe('createRuntimeExtensionFramework', () => {
  it('registers, enables, disables, validates and publishes', () => {
    const framework = createRuntimeExtensionFramework({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = framework.initialize({
      sessionId: 'runtime-session-1',
      title: 'Demo Extensions',
      extensions: [sampleExtension()],
    });
    assert.equal(pkg.registry.extensions.length, 1);
    assert.ok(
      framework
        .getEvents()
        .some((event) => event.type === 'RuntimeExtensionRegistered'),
    );

    const extensionId = pkg.registry.extensions[0]!.id;
    const enabled = framework.enable(pkg.id, extensionId);
    assert.equal(enabled.registry.extensions[0]?.status, 'Enabled');
    assert.ok(
      framework
        .getEvents()
        .some((event) => event.type === 'RuntimeExtensionEnabled'),
    );

    const disabled = framework.disable(pkg.id, extensionId);
    assert.equal(disabled.registry.extensions[0]?.status, 'Disabled');

    const reenabled = framework.enable(pkg.id, extensionId);
    const validation = framework.validate(reenabled.id);
    assert.equal(validation.valid, true);

    const published = framework.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      framework
        .getEvents()
        .some((event) => event.type === 'RuntimeExtensionPublished'),
    );
  });
});

describe('RuntimeExtensionIndex', () => {
  it('indexes extensions', () => {
    const index = createRuntimeExtensionIndex();
    const framework = createRuntimeExtensionFramework();
    const pkg = framework.initialize({
      sessionId: 's1',
      extensions: [sampleExtension()],
    });
    const entries = index.index(pkg.id, pkg);
    assert.equal(entries.length, 1);
    assert.equal(index.find('capability-policy').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeExtensionApi', () => {
  it('exposes register / enable / disable / list / validate', () => {
    const api = createRuntimeExtensionApi();
    const created = api.registerRuntimeExtension(null, sampleExtension(), {
      sessionId: 'runtime-session-1',
      title: 'API Extensions',
    });
    assert.equal(api.listRuntimeExtensions(created.id).length, 1);
    const extensionId = created.registry.extensions[0]!.id;
    const enabled = api.enableRuntimeExtension(created.id, extensionId);
    assert.equal(enabled.registry.extensions[0]?.status, 'Enabled');
    const validated = api.validateRuntimeExtension(created.id);
    assert.equal(validated.valid, true);
    const disabled = api.disableRuntimeExtension(created.id, extensionId);
    assert.equal(disabled.registry.extensions[0]?.status, 'Disabled');
  });
});
