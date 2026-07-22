/**
 * Embed.mount — public entry.
 *
 * Production: Delivery Layer → Object Package → Runtime → ClientStudioApp.
 * Legacy: explicit `fixture: "garden"` or `experience` → Priority HTML renderer.
 */
import { type EmbedMountOptions } from "./delivery/types";
/**
 * Mount Embed into a host element.
 * Replaces any previously active Embed session.
 */
export declare function mount(options: EmbedMountOptions): void;
export type { EmbedMountOptions };
//# sourceMappingURL=mount.d.ts.map