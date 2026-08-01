/**
 * EPIC-BX-13 — Sales Studio is a capability composition.
 */

import {
  SALES_STUDIO_COMPOSITION,
  composeStudio,
  type CapabilityHost,
} from '@embed-engine/capabilities';

let cachedHost: CapabilityHost | null = null;

export function getSalesCapabilityHost(): CapabilityHost {
  if (cachedHost === null) {
    cachedHost = composeStudio(SALES_STUDIO_COMPOSITION);
  }
  return cachedHost;
}

export { SALES_STUDIO_COMPOSITION };
