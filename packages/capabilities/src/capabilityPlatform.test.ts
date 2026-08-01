import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BUILDER_CAPABILITY_MANIFEST,
  MANAGER_CAPABILITY_MANIFEST,
  SALES_CAPABILITY_MANIFEST,
  STUDIO_COMPOSITIONS,
  capabilityExistsOnce,
  capabilityIdFromBuilderNav,
  composeStudio,
  composeStudioById,
  createCapabilityApi,
  createCapabilityHost,
  getCapability,
  listCapabilities,
  requireCapability,
} from './index';

describe('capabilityPlatform (EPIC-BX-13)', () => {
  it('registers each capability exactly once', () => {
    const all = listCapabilities();
    assert.ok(all.length >= 8);
    for (const item of all) {
      assert.equal(capabilityExistsOnce(item.id), true);
      assert.equal(getCapability(item.id)?.id, item.id);
    }
  });

  it('exposes Capability API activate/deactivate/health/metadata', () => {
    const media = requireCapability('media');
    const api = createCapabilityApi(media);
    assert.equal(api.health().active, false);
    assert.equal(api.activate().active, true);
    assert.equal(api.health().status, 'healthy');
    assert.equal(api.metadata().name, 'Media');
    assert.equal(api.deactivate().active, false);
  });

  it('Builder manifest declares Media Experience Knowledge AI Release', () => {
    const ids = BUILDER_CAPABILITY_MANIFEST.uses.map((item) => item.id);
    for (const required of [
      'media',
      'experience',
      'knowledge',
      'ai',
      'release',
    ] as const) {
      assert.ok(ids.includes(required), `missing ${required}`);
    }
  });

  it('Capability Host loads studio manifests and activates capabilities', () => {
    const host = createCapabilityHost(BUILDER_CAPABILITY_MANIFEST);
    const report = host.activateAll();
    assert.equal(report.length, BUILDER_CAPABILITY_MANIFEST.uses.length);
    assert.ok(report.every((item) => item.active));
    assert.equal(host.health('media')?.active, true);
  });

  it('Studio compositions configure Builder Manager Sales from registry', () => {
    assert.equal(STUDIO_COMPOSITIONS.length, 3);
    const builder = composeStudioById('builder');
    const manager = composeStudioById('manager');
    const sales = composeStudioById('sales');
    assert.equal(builder.studioId, 'builder');
    assert.equal(manager.studioId, 'manager');
    assert.equal(sales.studioId, 'sales');
    assert.ok(builder.isDeclared('media'));
    assert.ok(manager.isDeclared('operations'));
    assert.ok(manager.isDeclared('customer-success'));
    assert.ok(manager.isDeclared('operations-center'));
    assert.ok(manager.isDeclared('product-learning'));
    assert.ok(manager.isDeclared('commercial-platform'));
    assert.ok(sales.isDeclared('pipeline'));
    assert.ok(sales.isDeclared('customer-success'));
  });

  it('Manager and Sales manifests use shared intelligence capability once', () => {
    assert.ok(
      MANAGER_CAPABILITY_MANIFEST.uses.some((item) => item.id === 'intelligence'),
    );
    assert.ok(
      SALES_CAPABILITY_MANIFEST.uses.some((item) => item.id === 'intelligence'),
    );
    assert.ok(
      MANAGER_CAPABILITY_MANIFEST.uses.some(
        (item) => item.id === 'customer-success',
      ),
    );
    assert.ok(
      MANAGER_CAPABILITY_MANIFEST.uses.some(
        (item) => item.id === 'operations-center',
      ),
    );
    assert.ok(
      MANAGER_CAPABILITY_MANIFEST.uses.some(
        (item) => item.id === 'product-learning',
      ),
    );
    assert.ok(
      MANAGER_CAPABILITY_MANIFEST.uses.some(
        (item) => item.id === 'commercial-platform',
      ),
    );
    assert.equal(listCapabilities().filter((c) => c.id === 'intelligence').length, 1);
    assert.equal(
      listCapabilities().filter((c) => c.id === 'customer-success').length,
      1,
    );
    assert.equal(
      listCapabilities().filter((c) => c.id === 'operations-center').length,
      1,
    );
    assert.equal(
      listCapabilities().filter((c) => c.id === 'product-learning').length,
      1,
    );
    assert.equal(
      listCapabilities().filter((c) => c.id === 'commercial-platform').length,
      1,
    );
  });

  it('exposes commercial entitlements on every capability (EPIC-BX-22)', () => {
    for (const item of listCapabilities()) {
      assert.ok(
        ['included', 'optional', 'experimental', 'hidden'].includes(
          item.entitlement,
        ),
      );
    }
    assert.equal(requireCapability('media').entitlement, 'included');
    assert.equal(requireCapability('pipeline').entitlement, 'hidden');
  });

  it('inspector model exposes capability metadata and health', () => {
    const host = composeStudio({
      studioId: 'builder',
      label: 'Builder Studio',
      manifest: BUILDER_CAPABILITY_MANIFEST,
    });
    const model = host.inspectorModel('media');
    assert.equal(model.studioId, 'builder');
    assert.equal(model.activeCapabilityId, 'media');
    assert.ok(model.capabilities.length > 0);
    assert.ok(model.capabilities.every((item) => item.declared));
  });

  it('maps Builder product nav to capability ids', () => {
    assert.equal(capabilityIdFromBuilderNav('media-studio'), 'media');
    assert.equal(capabilityIdFromBuilderNav('rooms'), null);
  });
});
