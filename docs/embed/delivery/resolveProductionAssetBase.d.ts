/**
 * Production assetBase normalization for partner hosts (ED-INFRA-001).
 *
 * Legacy github.io origins 301 → conis.cz; browser fetch() of CSV across that
 * redirect fails CORS. Rewrite at Delivery mount so stale CMS snippets recover
 * once the published IIFE loads — without touching Runtime / Client Studio.
 */
/** Canonical public distribution origin (custom domain). */
export declare const CANONICAL_ASSET_BASE = "https://conis.cz";
/**
 * Normalize partner `assetBase` for production distribution.
 * - Strips trailing slashes
 * - Rewrites known legacy GitHub Pages project URLs → `https://conis.cz`
 * - Leaves `undefined` / empty unchanged (same-origin relative `/house-package`)
 */
export declare function resolveProductionAssetBase(assetBase: string | undefined): string | undefined;
//# sourceMappingURL=resolveProductionAssetBase.d.ts.map