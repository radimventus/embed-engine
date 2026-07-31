/**
 * CAP-BLD-07 — mount production Experience (Shared Runtime) over HP-002.
 * Reuses Embed.mount → Client Studio — no Stub Runtime, no second preview.
 */

import clientStudioCss from '../../../../client-studio/src/index.css?inline';
import { Embed, registerClientStudioCss } from '@embed-engine/embed';
import { RUNTIME_HOUSE_PACKAGE_SOURCE } from '@embed-engine/object-house/builder-package';

import { PRODUCTION_RUNTIME_SOURCE } from './releaseVerification';

let cssRegistered = false;

export type HousePackageRuntimePreviewHandle = {
  readonly dispose: () => void;
  readonly runtimeSource: typeof RUNTIME_HOUSE_PACKAGE_SOURCE;
  readonly embedVersion: string;
  readonly embedBuildMarker: string;
};

export type MountHousePackageRuntimePreviewOptions = {
  readonly target: HTMLElement;
  readonly objectId?: string;
  /** Omit to use Builder host origin (serves /house-package). */
  readonly assetBase?: string;
};

/**
 * Mount the same Decision Experience as Embed / Client Studio over local HP-002.
 */
export function mountHousePackageRuntimePreview(
  options: MountHousePackageRuntimePreviewOptions,
): HousePackageRuntimePreviewHandle {
  if (!cssRegistered) {
    registerClientStudioCss(clientStudioCss);
    cssRegistered = true;
  }

  const objectId = options.objectId?.trim() || 'house-modern-01';

  Embed.mount({
    target: options.target,
    mode: 'inline',
    objectId,
    assetBase: options.assetBase,
    hostId: 'builder-studio-runtime-preview',
    entryPoint: 'builder-preview',
  });

  if (RUNTIME_HOUSE_PACKAGE_SOURCE !== PRODUCTION_RUNTIME_SOURCE) {
    throw new Error(
      `Runtime Preview source mismatch: expected ${PRODUCTION_RUNTIME_SOURCE}, got ${RUNTIME_HOUSE_PACKAGE_SOURCE}`,
    );
  }

  return {
    runtimeSource: RUNTIME_HOUSE_PACKAGE_SOURCE,
    embedVersion: Embed.version,
    embedBuildMarker: Embed.build.marker,
    dispose: () => {
      Embed.unmount(options.target);
    },
  };
}
