import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { DecisionSessionRuntime } from '@embed-engine/runtime';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { ClientStudioApp } from '../features/client-studio/ClientStudioApp';
import { CLIENT_STUDIO_RELEASE } from '../features/client-studio/pilot/productionConfig';
import { setPresentationAssetBase } from '../features/client-studio/runtime/presentationAssetBase';
import { ClientStudioSessionBoundary } from './ClientStudioSessionBoundary';

export type MountClientStudioOptions = {
  readonly target: HTMLElement;
  /**
   * Optional Runtime from delivery tests / specialized hosts.
   * Production Embed omits this — Client Studio Provider bootstraps Builder Package
   * the same way as standalone Client Studio (PT-EMBED-RUNTIME-INTEGRATION-01).
   */
  readonly runtime?: DecisionSessionRuntime;
  /**
   * Explicit Client House id. A Project-only id intentionally does not select a House.
   */
  readonly objectId?: string;
  /**
   * Optional origin for `/media` and `/house-package` assets (no trailing slash).
   * Required when the host origin does not serve Client Studio public assets.
   * Must be set before Provider bootstrap so CSV fetch resolves against the same base.
   */
  readonly assetBase?: string;
};

export type ClientStudioMountHandle = {
  readonly dispose: () => void;
  readonly rootElement: HTMLElement;
  readonly getDeliveryState: () => EmbedDeliveryState | null;
};

export const EMBED_DELIVERY_STATE_EVENT = 'embed:delivery-state';

export type EmbedDeliveryState = {
  readonly requestedHouseId: string | null;
  readonly resolvedHouseId: string;
  readonly projectId: string;
  readonly packageRoot: string;
  readonly permittedHouses: readonly { readonly houseId: string; readonly name: string }[];
  readonly normalizedPresentationAssets: unknown;
  readonly activeHouseId: string;
  readonly activeRoomId: string | null;
};

function assertMountTarget(target: HTMLElement | null | undefined): HTMLElement {
  if (target == null || typeof target.setAttribute !== 'function') {
    throw new Error(
      'Embed: Client Studio mount target is missing — Delivery Layer must provide a mount container',
    );
  }
  return target;
}

function resolveInitialLandingOffsetPx(target: HTMLElement): number {
  const value = Number(target.dataset.clientInitialLandingOffset);
  return Number.isFinite(value) ? value : 0;
}

function resolveMountHouseId(objectId: string | undefined): string | null {
  const candidate = objectId?.trim() ?? '';
  return candidate.length > 0 ? candidate : null;
}

/**
 * Mount Client Studio into a host element (Embed Delivery Layer).
 *
 * Production: omit `runtime` so DecisionSessionRuntimeProvider creates Runtime from
 * Builder Package (`ensureBuilderPackageBootstrapped` → `projectBuilderImportToHousePackage`)
 * — identical to standalone Client Studio.
 */
export function mountClientStudio(
  options: MountClientStudioOptions,
): ClientStudioMountHandle {
  const { runtime, assetBase, objectId } = options;
  const target = assertMountTarget(options.target);
  const houseId = resolveMountHouseId(objectId);
  const initialLandingOffsetPx = resolveInitialLandingOffsetPx(target);

  setPresentationAssetBase(assetBase);

  // Mount-root contract for Experience chrome (Local / Embed Demo / Playground / IIFE).
  target.setAttribute('data-embed-root', '');
  target.setAttribute('data-client-studio-root', '');
  target.setAttribute('data-embed-boundary', '');
  target.dataset.clientStudioVersion = CLIENT_STUDIO_RELEASE.version;
  target.dataset.clientStudioGeneration = CLIENT_STUDIO_RELEASE.generation;
  if (houseId !== null) {
    target.dataset.objectId = houseId;
  }
  document.documentElement.dataset.clientStudioVersion =
    CLIENT_STUDIO_RELEASE.version;
  document.documentElement.dataset.clientStudioGeneration =
    CLIENT_STUDIO_RELEASE.generation;

  const reactRoot: Root = createRoot(target);
  let deliveryState: EmbedDeliveryState | null = null;
  const onDeliveryState = (event: Event): void => {
    deliveryState = (event as CustomEvent<EmbedDeliveryState>).detail;
  };
  target.addEventListener(EMBED_DELIVERY_STATE_EVENT, onDeliveryState);
  reactRoot.render(
    <StrictMode>
      <ErrorBoundary>
        <ClientStudioSessionBoundary>
          <ClientStudioApp
            runtime={runtime}
            initialLandingOffsetPx={initialLandingOffsetPx}
          />
        </ClientStudioSessionBoundary>
      </ErrorBoundary>
    </StrictMode>,
  );

  return {
    rootElement: target,
    getDeliveryState: () => deliveryState,
    dispose: () => {
      target.removeEventListener(EMBED_DELIVERY_STATE_EVENT, onDeliveryState);
      reactRoot.unmount();
      setPresentationAssetBase(undefined);
      target.removeAttribute('data-embed-root');
      target.removeAttribute('data-client-studio-root');
      target.removeAttribute('data-embed-boundary');
      delete target.dataset.clientStudioVersion;
      delete target.dataset.clientStudioGeneration;
      delete target.dataset.objectId;
      target.replaceChildren();
    },
  };
}
