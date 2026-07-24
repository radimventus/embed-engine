/**
 * Public Embed SDK object — mount, unmount, version, build fingerprint.
 */
import { mount } from "./mount";
import { unmount } from "./unmount";
export declare const Embed: {
    readonly mount: typeof mount;
    readonly unmount: typeof unmount;
    readonly version: "0.1.0";
    /** PT-DEPLOY-EMBED-01 — automatic Runtime build fingerprint. */
    readonly build: import("./buildFingerprint").EmbedRuntimeBuildInfo;
};
export type EmbedApi = typeof Embed;
//# sourceMappingURL=Embed.d.ts.map