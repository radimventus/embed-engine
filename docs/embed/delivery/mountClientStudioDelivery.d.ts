/**
 * Production delivery — mount Client Studio; Runtime from Builder via Provider.
 *
 * PT-EMBED-RUNTIME-INTEGRATION-01: Embed does not create HousePackage / Runtime.
 */
import type { EmbedSession } from "../bootstrap";
import type { EmbedProductionMountOptions } from "./types";
import type { EmbedDeliveryState } from "@client-studio/embed-mount";
export type ClientStudioDeliverySession = EmbedSession & {
    readonly kind: "client-studio";
    readonly objectId: string;
    /** Live state emitted by the mounted Client Studio delivery boundary. */
    readonly getDeliveryState: () => EmbedDeliveryState | null;
};
/**
 * Mount ClientStudioApp. Provider creates Decision Session Runtime from Builder Package
 * (`ensureBuilderPackageBootstrapped` → `projectBuilderImportToHousePackage`) — same as
 * standalone Client Studio.
 */
export declare function bootstrapClientStudioDelivery(host: HTMLElement, options: Pick<EmbedProductionMountOptions, "objectId" | "assetBase">): ClientStudioDeliverySession;
//# sourceMappingURL=mountClientStudioDelivery.d.ts.map