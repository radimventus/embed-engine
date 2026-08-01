/**
 * EPIC-BX-13 — Capability API factory (activate / deactivate / health / metadata).
 */

import type {
  CapabilityApi,
  CapabilityDefinition,
  CapabilityHealth,
  CapabilityMetadata,
} from '../domain/types';

function nowIso(): string {
  return new Date().toISOString();
}

export function createCapabilityApi(
  definition: CapabilityDefinition,
): CapabilityApi {
  let active = false;

  const metadata = (): CapabilityMetadata => ({
    id: definition.id,
    name: definition.name,
    version: definition.version,
    owner: definition.owner,
    maturity: definition.maturity,
    entitlement: definition.entitlement,
    description: definition.description,
    studioSupport: definition.studioSupport,
    dependencies: definition.dependencies,
  });

  const health = (): CapabilityHealth => ({
    id: definition.id,
    status: active ? 'healthy' : 'inactive',
    active,
    message: active
      ? `${definition.name} is active`
      : `${definition.name} is inactive`,
    checkedAt: nowIso(),
  });

  return {
    id: definition.id,
    metadata,
    health,
    activate: () => {
      active = true;
      return health();
    },
    deactivate: () => {
      active = false;
      return health();
    },
  };
}
