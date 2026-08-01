import type { CapabilityId } from '../domain/types';

/**
 * Map Builder product nav ids → Capability ids (orchestration bridge).
 * HP legacy nav ids are not capabilities.
 */
export function capabilityIdFromBuilderNav(
  navId: string,
): CapabilityId | null {
  switch (navId) {
    case 'overview':
      return 'dashboard';
    case 'media-studio':
      return 'media';
    case 'knowledge':
      return 'knowledge';
    case 'experience':
      return 'experience';
    case 'preview-center':
      return 'preview';
    case 'release-center':
      return 'release';
    case 'collaboration':
      return 'collaboration';
    case 'intelligence':
      return 'intelligence';
    default:
      return null;
  }
}
