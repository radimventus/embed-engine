/**
 * PT-13 — Offer host wiring for Business Automation.
 * App shell only — leaf UI must not import Automation Runtime.
 */

import {
  createAutomationRuntime,
  createOfferAutomationIntegrations,
  type AutomationRuntime,
  type OfferAutomationIntegrationSurface,
} from '@embed-engine/business-automation';

let sharedRuntime: AutomationRuntime | null = null;

export function getOfferAutomationRuntime(): AutomationRuntime {
  if (sharedRuntime === null) {
    sharedRuntime = createAutomationRuntime();
  }
  return sharedRuntime;
}

export function createOfferHostAutomationIntegrations(): OfferAutomationIntegrationSurface {
  return createOfferAutomationIntegrations(getOfferAutomationRuntime());
}
