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
    readonly getDeliveryState: () => EmbedDeliveryState | null;
};
export type EmbedDeliveryState = {
    readonly requestedHouseId: string | null;
    readonly resolvedHouseId: string;
    readonly projectId: string;
    readonly packageRoot: string;
    readonly permittedHouses: readonly {
        readonly houseId: string;
        readonly name: string;
    }[];
    readonly normalizedPresentationAssets: unknown;
    readonly activeHouseId: string;
    readonly activeRoomId: string | null;
};
export declare function mountClientStudio(_options: MountClientStudioOptions): ClientStudioMountHandle;
//# sourceMappingURL=clientStudioMount.stub.d.ts.map