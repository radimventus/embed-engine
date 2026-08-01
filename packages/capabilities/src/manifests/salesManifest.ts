import type { CapabilityManifest } from '../domain/types';

/**
 * Sales Studio capability manifest (EPIC-BX-13).
 */
export const SALES_CAPABILITY_MANIFEST: CapabilityManifest = {
  studioId: 'sales',
  version: '0.1.0',
  uses: [
    { id: 'pipeline' },
    { id: 'customer-success' },
    { id: 'intelligence' },
    { id: 'experience' },
  ],
};
