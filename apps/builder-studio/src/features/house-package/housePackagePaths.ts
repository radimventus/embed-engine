/**
 * Canonical HP-002 roots for Builder Authoring Surface (ADR-023 / CAP-BLD-02).
 * Content lives on disk under Client Studio public; Builder mounts the same tree.
 */

/** Repo-relative disk root (documentation / host wiring). */
export const HOUSE_PACKAGE_DISK_ROOT =
  'apps/client-studio/public/house-package' as const;

/** HTTP mount path served by Builder Vite (same as Client Studio). */
export const HOUSE_PACKAGE_URL_ROOT = '/house-package' as const;

export const HOUSE_PACKAGE_CSV = {
  rooms: `${HOUSE_PACKAGE_URL_ROOT}/rooms.csv`,
  gallery: `${HOUSE_PACKAGE_URL_ROOT}/gallery.csv`,
  videos: `${HOUSE_PACKAGE_URL_ROOT}/videos.csv`,
} as const;

export const HOUSE_PACKAGE_MANIFEST_URL = `${HOUSE_PACKAGE_URL_ROOT}/manifest.json`;

export const HOUSE_PACKAGE_HERO_CANDIDATES = [
  'media/hero/hero.png',
  'media/hero/hero.webp',
] as const;
