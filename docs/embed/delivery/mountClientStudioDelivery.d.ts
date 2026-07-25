/**
 * Production delivery — mount Client Studio; Runtime from Builder via Provider.
 *
 * PT-EMBED-RUNTIME-INTEGRATION-01: Embed does not create HousePackage / Runtime.
 */
import type { EmbedSession } from "../bootstrap";
import type { EmbedProductionMountOptions } from "./types";
export type ClientStudioDeliverySession = EmbedSession & {
    readonly kind: "client-studio";
    readonly objectId: string;
};
/**
 * Mount ClientStudioApp. Provider creates Decision Session Runtime from Builder Package
 * (`ensureBuilderPackageBootstrapped` → `projectBuilderImportToHousePackage`) — same as
 * standalone Client Studio.
 */
export declare function bootstrapClientStudioDelivery(host: HTMLElement, options: Pick<EmbedProductionMountOptions, "objectId" | "assetBase">): Promise<ClientStudioDeliverySession>;
//# sourceMappingURL=mountClientStudioDelivery.d.ts.map