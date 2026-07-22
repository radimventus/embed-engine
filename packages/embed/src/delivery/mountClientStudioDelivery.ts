/**
 * Production delivery — mount Client Studio with a shared Decision Session Runtime.
 */

import { mountClientStudio } from "@client-studio/embed-mount";

import type { EmbedSession } from "../bootstrap";
import { createDeliveryRuntime } from "./createDeliveryRuntime";
import { ensureClientStudioStyles } from "./ensureStyles";
import { resolveObjectPackage } from "./resolveObjectPackage";
import type { EmbedProductionMountOptions } from "./types";

export type ClientStudioDeliverySession = EmbedSession & {
  readonly kind: "client-studio";
  readonly objectId: string;
};

/**
 * Resolve Object Package → create Runtime → mount ClientStudioApp.
 * Single Runtime instance for the session (not duplicated inside Provider).
 */
export function bootstrapClientStudioDelivery(
  host: HTMLElement,
  options: EmbedProductionMountOptions,
): ClientStudioDeliverySession {
  ensureClientStudioStyles();

  const housePackage = resolveObjectPackage(options.objectId);
  const runtime = createDeliveryRuntime(housePackage);
  const handle = mountClientStudio({
    target: host,
    runtime,
    assetBase: options.assetBase,
  });

  return {
    kind: "client-studio",
    host,
    root: handle.rootElement,
    styleElement: document.createElement("style"),
    objectId: housePackage.identity.id,
    dispose: () => {
      handle.dispose();
    },
  };
}
