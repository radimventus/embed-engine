/**
 * EPIC-BX-13 — Manager Studio is a capability composition.
 */

import {
  MANAGER_STUDIO_COMPOSITION,
  composeStudio,
  type CapabilityHost,
} from '@embed-engine/capabilities';

let cachedHost: CapabilityHost | null = null;

export function getManagerCapabilityHost(): CapabilityHost {
  if (cachedHost === null) {
    cachedHost = composeStudio(MANAGER_STUDIO_COMPOSITION);
  }
  return cachedHost;
}

export { MANAGER_STUDIO_COMPOSITION };
