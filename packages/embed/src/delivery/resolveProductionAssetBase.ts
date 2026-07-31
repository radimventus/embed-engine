/**
 * Production assetBase normalization for partner hosts (ED-INFRA-001).
 *
 * Legacy github.io origins 301 → conis.cz; browser fetch() of CSV across that
 * redirect fails CORS. Rewrite at Delivery mount so stale CMS snippets recover
 * once the published IIFE loads — without touching Runtime / Client Studio.
 */

/** Canonical public distribution origin (custom domain). */
export const CANONICAL_ASSET_BASE = "https://conis.cz";

const LEGACY_GITHUB_IO_ORIGINS = Object.freeze([
  "https://radimventus.github.io/embed-engine",
  "http://radimventus.github.io/embed-engine",
]);

function isLegacyGithubIoAssetBase(normalized: string): boolean {
  return LEGACY_GITHUB_IO_ORIGINS.some(
    (origin) => normalized === origin || normalized.startsWith(`${origin}/`),
  );
}

/**
 * Normalize partner `assetBase` for production distribution.
 * - Strips trailing slashes
 * - Rewrites known legacy GitHub Pages project URLs → `https://conis.cz`
 * - Leaves `undefined` / empty unchanged (same-origin relative `/house-package`)
 */
export function resolveProductionAssetBase(
  assetBase: string | undefined,
): string | undefined {
  if (assetBase === undefined) {
    return undefined;
  }

  const normalized = assetBase.trim().replace(/\/+$/, "");
  if (normalized.length === 0) {
    return undefined;
  }

  if (isLegacyGithubIoAssetBase(normalized)) {
    if (typeof console !== "undefined" && typeof console.warn === "function") {
      console.warn(
        `Embed.mount: legacy assetBase "${assetBase}" uses GitHub Pages and breaks house-package CSV fetch (CORS on 301). Using ${CANONICAL_ASSET_BASE}.`,
      );
    }
    return CANONICAL_ASSET_BASE;
  }

  return normalized;
}
