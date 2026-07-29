/**
 * Normalize partner-supplied assetBase once at Embed bootstrap.
 *
 * Known legacy origins (stale CMS snippets) map to the canonical distribution
 * origin so CSV / media fetches never hit a GitHub Pages 301 → CORS failure.
 *
 * Unknown origins are left unchanged — Runtime must not guess.
 */
export declare const CANONICAL_ASSET_ORIGIN = "https://conis.cz";
/**
 * Pure normalization of an optional partner assetBase.
 *
 * - undefined / empty → canonical origin
 * - known legacy → mapped canonical origin
 * - already canonical or unknown → unchanged (trimmed)
 */
export declare function normalizeAssetBase(assetBase?: string): string;
/** True when the raw value is a known legacy origin (before normalization). */
export declare function isLegacyAssetBase(assetBase?: string): boolean;
export declare function logLegacyAssetBaseNormalization(from: string, to: string): void;
//# sourceMappingURL=normalizeAssetBase.d.ts.map