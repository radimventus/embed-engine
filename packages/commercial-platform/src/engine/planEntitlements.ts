/**
 * EPIC-BX-22 — Plan ↔ entitlement rules (deterministic, no billing).
 */

import type {
  CapabilityEntitlement,
  CapabilityId,
} from '@embed-engine/capabilities';

import type { CommercialPlan } from '../domain/types';

/** Which entitlement classes a plan unlocks. `hidden` is never unlocked. */
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
  if (entitlement === 'hidden') return false;
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

/** Builder product capabilities — high project count = high Builder usage. */
export const BUILDER_USAGE_CAPABILITIES: readonly CapabilityId[] = [
  'media',
  'knowledge',
  'experience',
  'preview',
  'release',
] as const;
