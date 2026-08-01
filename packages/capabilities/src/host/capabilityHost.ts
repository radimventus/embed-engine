/**
 * EPIC-BX-13 — Capability Host loads a studio manifest and manages lifecycle.
 */

import { createCapabilityApi } from '../api/capabilityApi';
import type {
  CapabilityApi,
  CapabilityHealth,
  CapabilityId,
  CapabilityInspectorModel,
  CapabilityManifest,
  StudioId,
} from '../domain/types';
import { requireCapability } from '../registry/capabilityRegistry';

export type CapabilityHost = {
  readonly studioId: StudioId;
  readonly manifest: CapabilityManifest;
  readonly declaredIds: readonly CapabilityId[];
  get: (id: CapabilityId) => CapabilityApi | undefined;
  activate: (id: CapabilityId) => CapabilityHealth;
  deactivate: (id: CapabilityId) => CapabilityHealth;
  activateAll: () => readonly CapabilityHealth[];
  deactivateAll: () => readonly CapabilityHealth[];
  health: (id: CapabilityId) => CapabilityHealth | undefined;
  healthReport: () => readonly CapabilityHealth[];
  metadata: (id: CapabilityId) => ReturnType<CapabilityApi['metadata']> | undefined;
  inspectorModel: (
    activeCapabilityId?: CapabilityId | null,
  ) => CapabilityInspectorModel;
  isDeclared: (id: CapabilityId) => boolean;
};

function topologicalOrder(
  ids: readonly CapabilityId[],
): CapabilityId[] {
  const declared = new Set(ids);
  const visited = new Set<CapabilityId>();
  const order: CapabilityId[] = [];

  const visit = (id: CapabilityId) => {
    if (visited.has(id) || !declared.has(id)) return;
    visited.add(id);
    const def = requireCapability(id);
    for (const dep of def.dependencies) {
      visit(dep);
    }
    order.push(id);
  };

  for (const id of ids) {
    visit(id);
  }
  return order;
}

/**
 * Platform Shell loads capabilities through this host.
 */
export function createCapabilityHost(
  manifest: CapabilityManifest,
): CapabilityHost {
  const declaredIds = manifest.uses.map((entry) => entry.id);
  const instances = new Map<CapabilityId, CapabilityApi>();

  for (const id of declaredIds) {
    const definition = requireCapability(id);
    if (!definition.studioSupport.includes(manifest.studioId)) {
      throw new Error(
        `Capability "${id}" does not support studio "${manifest.studioId}"`,
      );
    }
    instances.set(id, createCapabilityApi(definition));
  }

  const get = (id: CapabilityId) => instances.get(id);

  const activate = (id: CapabilityId): CapabilityHealth => {
    const api = instances.get(id);
    if (api === undefined) {
      throw new Error(`Capability "${id}" is not declared in ${manifest.studioId} manifest`);
    }
    const definition = requireCapability(id);
    for (const dep of definition.dependencies) {
      if (instances.has(dep)) {
        instances.get(dep)?.activate();
      }
    }
    return api.activate();
  };

  const deactivate = (id: CapabilityId): CapabilityHealth => {
    const api = instances.get(id);
    if (api === undefined) {
      throw new Error(`Capability "${id}" is not declared in ${manifest.studioId} manifest`);
    }
    return api.deactivate();
  };

  return {
    studioId: manifest.studioId,
    manifest,
    declaredIds,
    get,
    activate,
    deactivate,
    activateAll: () =>
      topologicalOrder(declaredIds).map((id) => activate(id)),
    deactivateAll: () =>
      [...topologicalOrder(declaredIds)].reverse().map((id) => deactivate(id)),
    health: (id) => get(id)?.health(),
    healthReport: () =>
      declaredIds.map((id) => {
        const report = get(id)?.health();
        if (report === undefined) {
          throw new Error(`Missing health for ${id}`);
        }
        return report;
      }),
    metadata: (id) => get(id)?.metadata(),
    isDeclared: (id) => instances.has(id),
    inspectorModel: (activeCapabilityId = null) => ({
      studioId: manifest.studioId,
      activeCapabilityId,
      capabilities: declaredIds.map((id) => {
        const api = instances.get(id);
        if (api === undefined) {
          throw new Error(`Missing capability instance ${id}`);
        }
        return {
          metadata: api.metadata(),
          health: api.health(),
          declared: true,
        };
      }),
    }),
  };
}
