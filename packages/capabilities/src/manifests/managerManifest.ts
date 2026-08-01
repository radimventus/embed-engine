import type { CapabilityManifest } from '../domain/types';

/**
 * Manager Studio capability manifest (EPIC-BX-13).
 */
export const MANAGER_CAPABILITY_MANIFEST: CapabilityManifest = {
  studioId: 'manager',
  version: '1.0.0',
  uses: [
    { id: 'operations' },
    { id: 'customer-success' },
    { id: 'intelligence' },
    { id: 'collaboration' },
  ],
};
