import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RegisterRuntimeRouteInput } from '../../model';
import {
  createBasicRuntimeApiStrategy,
  createRuntimeApiValidator,
} from './basic-runtime-api-strategy';
import { createRuntimeApiGatewayApi } from './runtime-api-gateway-api';
import { createRuntimeApiGateway } from './runtime-api-gateway';
import { createRuntimeApiIndex } from './runtime-api-index';

function sampleRoute(
  overrides: Partial<RegisterRuntimeRouteInput> = {},
): RegisterRuntimeRouteInput {
  return {
    capability: 'capability-policy',
    operation: 'preview',
    version: '1.0.0',
    handler: 'runtime.policy.preview',
    title: 'Policy Preview',
    packageId: 'runtime-policy-package-1',
    ...overrides,
  };
}

describe('BasicRuntimeApiStrategy', () => {
  it('resolves and invokes without business logic', () => {
    const strategy = createBasicRuntimeApiStrategy();
    const gateway = createRuntimeApiGateway();
    const pkg = gateway.initialize({
      sessionId: 's1',
      routes: [sampleRoute()],
    });
    const route = strategy.resolve(pkg.registry, {
      capability: 'capability-policy',
      operation: 'preview',
    });
    assert.equal(route?.handler, 'runtime.policy.preview');
    const result = strategy.invoke(
      route!,
      { capability: 'capability-policy', operation: 'preview' },
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(result.status, 'Routed');
  });
});

describe('RuntimeApiValidator', () => {
  it('flags missing registry session', () => {
    const validator = createRuntimeApiValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      registry: {
        id: 'r1',
        routes: [],
        generatedAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: '',
          manifestId: null,
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
      result.issues.some((item) => item.code === 'registry-missing-session'),
    );
  });
});

describe('createRuntimeApiGateway', () => {
  it('registers, resolves, invokes, validates and publishes', () => {
    const gateway = createRuntimeApiGateway({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = gateway.initialize({
      sessionId: 'runtime-session-1',
      title: 'Demo API',
      routes: [sampleRoute()],
    });
    assert.equal(pkg.registry.routes.length, 1);
    assert.ok(
      gateway
        .getEvents()
        .some((event) => event.type === 'RuntimeRouteRegistered'),
    );

    const resolved = gateway.resolve(pkg.id, {
      capability: 'capability-policy',
      operation: 'preview',
    });
    assert.equal(resolved?.id, pkg.registry.routes[0]?.id);
    assert.ok(
      gateway
        .getEvents()
        .some((event) => event.type === 'RuntimeRouteResolved'),
    );

    const invoked = gateway.invoke(pkg.id, {
      capability: 'capability-policy',
      operation: 'preview',
    });
    assert.equal(invoked.status, 'Routed');

    const validation = gateway.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = gateway.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      gateway
        .getEvents()
        .some((event) => event.type === 'RuntimeApiPublished'),
    );
  });
});

describe('RuntimeApiIndex', () => {
  it('indexes routes', () => {
    const index = createRuntimeApiIndex();
    const gateway = createRuntimeApiGateway();
    const pkg = gateway.initialize({
      sessionId: 's1',
      routes: [sampleRoute()],
    });
    const entries = index.index(pkg.id, pkg);
    assert.equal(entries.length, 1);
    assert.equal(index.find('capability-policy').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeApiGatewayApi', () => {
  it('exposes register / resolve / invoke / list / validate', () => {
    const api = createRuntimeApiGatewayApi();
    const created = api.registerRuntimeRoute(null, sampleRoute(), {
      sessionId: 'runtime-session-1',
      title: 'API Gateway',
    });
    assert.equal(api.listRuntimeRoutes(created.id).length, 1);
    const validated = api.validateRuntimeApi(created.id);
    assert.equal(validated.valid, true);
    assert.equal(
      api.resolveRuntimeRoute(created.id, {
        capability: 'capability-policy',
        operation: 'preview',
      })?.handler,
      'runtime.policy.preview',
    );
    assert.equal(
      api.invokeRuntimeOperation(created.id, {
        capability: 'capability-policy',
        operation: 'preview',
      }).status,
      'Routed',
    );
  });
});
