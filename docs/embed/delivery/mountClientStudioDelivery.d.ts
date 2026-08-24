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
 * PT-PDM-03 — validate the requested delivery identity while preserving
 * House semantics for the Client Studio mount boundary.
 *
 * Client Studio `objectId` is explicitly a House id. A canonical House may
 * resolve through Shared Project Runtime, but must not be collapsed to its
 * enclosing Project id before `mountClientStudio`.
 */
export declare function resolveClientHouseId(objectId: string | undefined): string;
/**
 * Mount ClientStudioApp. Provider creates Decision Session Runtime from Builder Package
 * (`ensureBuilderPackageBootstrapped` → `projectBuilderImportToHousePackage`) — same as
 * standalone Client Studio.
 */
export declare function bootstrapClientStudioDelivery(host: HTMLElement, options: Pick<EmbedProductionMountOptions, "objectId" | "assetBase">): ClientStudioDeliverySession;
//# sourceMappingURL=mountClientStudioDelivery.d.ts.map