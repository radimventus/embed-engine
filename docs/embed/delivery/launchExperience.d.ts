/**
 * Launcher Mode bootstrap — Delivery Pipeline (LRI-01).
 *
 * Launcher → Delivery → Client Studio Mount → (Provider) Runtime Bootstrap → Reveal → Active
 *
 * PT-EMBED-RUNTIME-INTEGRATION-01: Embed does not create HousePackage / Runtime.
 * Client Studio Provider is the sole Runtime initializer (same as standalone CS).
 */
import type { EmbedSession } from "../bootstrap";
import type { LaunchRequest } from "./launchRequest";
import { type OverlaySurface } from "./overlaySurface";
export type LauncherDeliverySession = EmbedSession & {
    readonly kind: "client-studio-launcher";
    readonly objectId: string;
    readonly overlay: OverlaySurface;
};
export type LauncherArmedSession = EmbedSession & {
    readonly kind: "launcher-armed";
    readonly unbind: () => void;
};
/**
 * Execute Launch Request: overlay → Studio mount → Reveal → Active.
 * Runtime is created inside Client Studio Provider from Builder Package.
 * On bootstrap/runtime/mount failure: dispose partial surface and restore Host.
 * Reveal runs asynchronously after mount; Close aborts in-flight Reveal.
 */
export declare function launchExperience(request: LaunchRequest, options: {
    readonly onClose: () => void;
}): Promise<LauncherDeliverySession>;
//# sourceMappingURL=launchExperience.d.ts.map