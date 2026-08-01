/**
 * EPIC-BX-21 — Plan ↔ entitlement rules (deterministic, no billing).
 */

import type {
  CapabilityEntitlement,
  CapabilityId,
} from '@embed-engine/capabilities';

import type { CommercialPlan } from '../domain/types';

/** Which entitlement classes a plan unlocks. */
export function entitlementsAllowedByPlan(
  plan: CommercialPlan,
): readonly CapabilityEntitlement[] {
  switch (plan) {
    case 'Trial':
      return ['included', 'optional', 'experimental'];
    case 'Starter':
      return ['included'];
    case 'Growth':
      return ['included', 'optional'];
    case 'Scale':
      return ['included', 'optional', 'experimental'];
  }
}

export function isCapabilityAvailableOnPlan(
  entitlement: CapabilityEntitlement,
  plan: CommercialPlan,
): boolean {
  return entitlementsAllowedByPlan(plan).includes(entitlement);
}

/** Caps optional commercial capabilities by plan for upgrade signals. */
export const GROWTH_SIGNAL_CAPABILITIES: readonly CapabilityId[] = [
  'customer-success',
  'operations-center',
  'product-learning',
  'operations',
  'ai',
] as const;
