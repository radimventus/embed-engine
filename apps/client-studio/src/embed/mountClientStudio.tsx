import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { DecisionSessionRuntime } from '@embed-engine/runtime';
import {
  getCanonicalHouse,
  resolveCanonicalRuntimeBinding,
} from '@embed-engine/platform-access';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { ClientStudioApp } from '../features/client-studio/ClientStudioApp';
import { CLIENT_STUDIO_RELEASE } from '../features/client-studio/pilot/productionConfig';
import { setPresentationAssetBase } from '../features/client-studio/runtime/presentationAssetBase';

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
};

function assertMountTarget(target: HTMLElement | null | undefined): HTMLElement {
  if (target == null || typeof target.setAttribute !== 'function') {
    throw new Error(
      'Embed: Client Studio mount target is missing — Delivery Layer must provide a mount container',
    );
  }
  return target;
}

function resolveMountHouseId(objectId: string | undefined): string | null {
  const candidate = objectId?.trim() ?? '';
  if (candidate.length === 0 || getCanonicalHouse(candidate) === null) {
    return null;
  }
  const binding = resolveCanonicalRuntimeBinding({
    explicitProjectId: candidate,
    fallbackToFirstPublished: false,
  });
  if (binding.runtimeHouseId === null) {
    return null;
  }
  return binding.runtimeHouseId;
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
  reactRoot.render(
    <StrictMode>
      <ErrorBoundary>
        <ClientStudioApp runtime={runtime} />
      </ErrorBoundary>
    </StrictMode>,
  );

  return {
    rootElement: target,
    dispose: () => {
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
