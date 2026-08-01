/**
 * EPIC-BX-13 — Builder Studio is a capability composition, not a feature app.
 */

import {
  BUILDER_STUDIO_COMPOSITION,
  composeStudio,
  type CapabilityHost,
} from '@embed-engine/capabilities';

let cachedHost: CapabilityHost | null = null;

export function getBuilderCapabilityHost(): CapabilityHost {
  if (cachedHost === null) {
    cachedHost = composeStudio(BUILDER_STUDIO_COMPOSITION);
  }
  return cachedHost;
}

export { BUILDER_STUDIO_COMPOSITION };
