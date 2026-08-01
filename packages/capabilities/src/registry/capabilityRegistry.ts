/**
 * EPIC-BX-13 — Capability Registry (single source of capability metadata).
 */

import type {
  CapabilityDefinition,
  CapabilityId,
  StudioId,
} from '../domain/types';
import { CAPABILITY_DEFINITIONS } from './definitions';

const byId = new Map<CapabilityId, CapabilityDefinition>(
  CAPABILITY_DEFINITIONS.map((item) => [item.id, item]),
);

export function listCapabilities(): readonly CapabilityDefinition[] {
  return CAPABILITY_DEFINITIONS;
}

export function getCapability(
  id: CapabilityId,
): CapabilityDefinition | undefined {
  return byId.get(id);
}

export function requireCapability(id: CapabilityId): CapabilityDefinition {
  const found = byId.get(id);
  if (found === undefined) {
    throw new Error(`Unknown capability: ${id}`);
  }
  return found;
}

export function listCapabilitiesForStudio(
  studioId: StudioId,
): readonly CapabilityDefinition[] {
  return CAPABILITY_DEFINITIONS.filter((item) =>
    item.studioSupport.includes(studioId),
  );
}

export function capabilityExistsOnce(id: CapabilityId): boolean {
  return (
    CAPABILITY_DEFINITIONS.filter((item) => item.id === id).length === 1
  );
}
