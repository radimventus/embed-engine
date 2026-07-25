/**
 * Fullscreen Experience overlay surface (Delivery infrastructure only).
 * Mount target for Client Studio. Close control is Delivery chrome (not CS UI).
 */
import { type HostScrollSnapshot } from "./hostScrollLock";
export declare const OVERLAY_ROOT_ATTR = "data-embed-overlay";
export declare const OVERLAY_MOUNT_ATTR = "data-embed-overlay-mount";
export declare const OVERLAY_CLOSE_ATTR = "data-embed-close";
export type OverlaySurface = {
    readonly root: HTMLElement;
    readonly mountTarget: HTMLElement;
    readonly scrollSnapshot: HostScrollSnapshot;
    readonly dispose: () => void;
};
/**
 * Append a viewport-sized overlay above the host page and lock host scroll.
 * Renders Close as Delivery chrome so Client Studio header matches Local.
 */
export declare function createOverlaySurface(options: {
    readonly onClose: () => void;
}): OverlaySurface;
//# sourceMappingURL=overlaySurface.d.ts.map