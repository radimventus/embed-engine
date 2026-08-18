/**
 * Production delivery — mount Client Studio; Runtime from Builder via Provider.
 *
 * PT-EMBED-RUNTIME-INTEGRATION-01: Embed does not create HousePackage / Runtime.
 */

import { mountClientStudio } from "@client-studio/embed-mount";
import {
  getSharedWorkspaceContext,
  resolveMountProjectView,
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

/** PT-PDM-03 — Shared Project Runtime validates mount id before Client Studio. */
function resolvePilotProjectId(objectId: string | undefined): string {
  const view = resolveMountProjectView(objectId ?? null);
  if (view !== null) {
    return view.project.id;
  }
  const draftHouseId = objectId?.trim() ?? "";
  const workspace = getSharedWorkspaceContext();
  const draftBinding =
    workspace !== null && draftHouseId.length > 0
      ? resolveWorkspaceHouseBinding({
          projectId: workspace.projectId,
          houseId: draftHouseId,
        })
      : null;
  if (
    draftBinding !== null &&
    draftBinding.authoringDraftPackage !== null
  ) {
    return draftBinding.houseId;
  }
  const label = draftHouseId.length > 0 ? draftHouseId : "(default)";
  throw new Error(
    `Embed.mount: unknown projectId "${label}". Use a Shared Project id from Shared Project Runtime.`,
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

  const objectId = resolvePilotProjectId(options.objectId);
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
