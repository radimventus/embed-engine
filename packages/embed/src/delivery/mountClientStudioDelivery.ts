/**
 * Production delivery — mount Client Studio; Runtime from Builder via Provider.
 *
 * PT-EMBED-RUNTIME-INTEGRATION-01: Embed does not create HousePackage / Runtime.
 */

import { mountClientStudio } from "@client-studio/embed-mount";

import type { EmbedSession } from "../bootstrap";
import { ensureClientStudioStyles } from "./ensureStyles";
import { DEFAULT_OBJECT_ID } from "./resolveObjectPackage";
import type { EmbedProductionMountOptions } from "./types";

export type ClientStudioDeliverySession = EmbedSession & {
  readonly kind: "client-studio";
  readonly objectId: string;
};

function resolvePilotObjectId(objectId: string | undefined): string {
  const resolved =
    objectId === undefined || objectId.trim().length === 0
      ? DEFAULT_OBJECT_ID
      : objectId.trim();
  if (resolved !== DEFAULT_OBJECT_ID) {
    throw new Error(
      `Embed.mount: unknown objectId "${resolved}". Known: ${DEFAULT_OBJECT_ID}`,
    );
  }
  return resolved;
}

/**
 * Mount ClientStudioApp. Provider creates Decision Session Runtime from Builder Package
 * (`ensureBuilderPackageBootstrapped` → `projectBuilderImportToHousePackage`) — same as
 * standalone Client Studio.
 */
export async function bootstrapClientStudioDelivery(
  host: HTMLElement,
  options: Pick<EmbedProductionMountOptions, "objectId" | "assetBase">,
): Promise<ClientStudioDeliverySession> {
  ensureClientStudioStyles();

  const objectId = resolvePilotObjectId(options.objectId);
  const handle = mountClientStudio({
    target: host,
    objectId,
    assetBase: options.assetBase,
  });

  return {
    kind: "client-studio",
    host,
    root: handle.rootElement,
    styleElement: document.createElement("style"),
    objectId,
    dispose: () => {
      handle.dispose();
    },
  };
}
