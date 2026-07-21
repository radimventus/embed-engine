/**
 * Public Embed SDK object — only mount, unmount, version.
 */
import { mount } from "./mount";
import { unmount } from "./unmount";
export declare const Embed: {
    readonly mount: typeof mount;
    readonly unmount: typeof unmount;
    readonly version: "0.1.0";
};
export type EmbedApi = typeof Embed;
//# sourceMappingURL=Embed.d.ts.map