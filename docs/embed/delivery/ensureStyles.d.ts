/**
 * Client Studio styles for Embed Delivery (fonts, shell, CSS isolation).
 * Main Tailwind CSS is registered by the Vite bundle via registerClientStudioCss.
 */
export { EMBED_BOUNDARY_ATTR } from "./cssIsolation";
export declare function registerClientStudioCss(css: string): void;
/**
 * Mark a surface root as an Embed Experience boundary (CSS Isolation Policy).
 */
export declare function markEmbedBoundary(element: HTMLElement): void;
/**
 * Inject fonts + full Client Studio CSS + shell + CSS isolation policy.
 * Idempotent; safe to call on every production mount.
 * Isolation stylesheet is always re-appended last so it beats late host CSS.
 */
export declare function ensureClientStudioStyles(): void;
export declare function getClientStudioStylesInjected(): boolean;
//# sourceMappingURL=ensureStyles.d.ts.map