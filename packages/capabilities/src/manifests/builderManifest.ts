import type { CapabilityManifest } from '../domain/types';

/**
 * Builder Studio capability manifest (EPIC-BX-13).
 * Studio is a configuration of capabilities — not an application of features.
 */
export const BUILDER_CAPABILITY_MANIFEST: CapabilityManifest = {
  studioId: 'builder',
  version: '1.0.0',
  uses: [
    { id: 'dashboard' },
    { id: 'media' },
    { id: 'experience' },
    { id: 'knowledge' },
    { id: 'ai' },
    { id: 'release' },
    { id: 'preview' },
    { id: 'collaboration' },
    { id: 'intelligence' },
    { id: 'customer-success' },
  ],
};
