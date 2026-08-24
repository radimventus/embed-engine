/**
 * Production delivery — mount Client Studio; Runtime from Builder via Provider.
 *
 * PT-EMBED-RUNTIME-INTEGRATION-01: Embed does not create HousePackage / Runtime.
 */

import { mountClientStudio } from "@client-studio/embed-mount";
import {
  getCanonicalHouse,
  getSharedWorkspaceContext,
  resolveWorkspaceHouseBinding,
} from "@embed-engine/platform-access";

import type { EmbedSession } from "../bootstrap";
import { ensureClientStudioStyles } from "./ensureStyles";
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
export function resolveClientHouseId(
  objectId: string | undefined,
): string {
  const requestedHouseId = objectId?.trim() ?? "";

  if (
    requestedHouseId.length > 0 &&
    getCanonicalHouse(requestedHouseId) !== null
  ) {
    return requestedHouseId;
  }

  const workspace = getSharedWorkspaceContext();
  const workspaceBinding =
    workspace !== null && requestedHouseId.length > 0
      ? resolveWorkspaceHouseBinding({
          projectId: workspace.projectId,
          houseId: requestedHouseId,
        })
      : null;

  if (workspaceBinding !== null) {
    return workspaceBinding.houseId;
  }

  const label =
    requestedHouseId.length > 0 ? requestedHouseId : "(default)";

  throw new Error(
    `Embed.mount: unknown objectId "${label}". Use a canonical House id from Shared Project Runtime.`,
  );
}

/**
 * Mount ClientStudioApp. Provider creates Decision Session Runtime from Builder Package
 * (`ensureBuilderPackageBootstrapped` → `projectBuilderImportToHousePackage`) — same as
 * standalone Client Studio.
 */
export function bootstrapClientStudioDelivery(
  host: HTMLElement,
  options: Pick<EmbedProductionMountOptions, "objectId" | "assetBase">,
): ClientStudioDeliverySession {
  ensureClientStudioStyles();

  const objectId = resolveClientHouseId(options.objectId);
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
    getDeliveryState: handle.getDeliveryState,
    dispose: () => {
      handle.dispose();
    },
  };
}
