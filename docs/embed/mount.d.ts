/**
 * Embed.mount — public entry.
 *
 * Production inline: Delivery Layer → Object Package → Runtime → ClientStudioApp.
 * Production launcher: bind Experience Launcher → Launch on click → overlay Delivery.
 * Legacy: explicit `fixture: "garden"` or `experience` → Priority HTML renderer.
 */
import { type EmbedMountOptions } from "./delivery/types";
/**
 * Mount Embed into a host element, or arm an Experience Launcher.
 * Replaces any previously active Embed session.
 */
export declare function mount(options: EmbedMountOptions): void;
export type { EmbedMountOptions };
//# sourceMappingURL=mount.d.ts.map