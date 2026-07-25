/**
 * Node / `tsc` stub for `@client-studio/embed-mount`.
 * Vite overrides this alias to `apps/client-studio/src/embed/mountClientStudio.tsx`.
 */
import type { DecisionSessionRuntime } from "@embed-engine/runtime";
export type MountClientStudioOptions = {
    readonly target: HTMLElement;
    readonly runtime?: DecisionSessionRuntime;
    readonly objectId?: string;
    readonly assetBase?: string;
};
export type ClientStudioMountHandle = {
    readonly dispose: () => void;
    readonly rootElement: HTMLElement;
};
export declare function mountClientStudio(_options: MountClientStudioOptions): ClientStudioMountHandle;
//# sourceMappingURL=clientStudioMount.stub.d.ts.map