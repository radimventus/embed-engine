import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { DecisionSessionRuntime } from '@embed-engine/runtime';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { ClientStudioApp } from '../features/client-studio/ClientStudioApp';
import { CLIENT_STUDIO_RELEASE } from '../features/client-studio/pilot/productionConfig';

export type MountClientStudioOptions = {
  readonly target: HTMLElement;
  /** Single Decision Session Runtime owned by the Embed delivery session. */
  readonly runtime: DecisionSessionRuntime;
};

export type ClientStudioMountHandle = {
  readonly dispose: () => void;
  readonly rootElement: HTMLElement;
};

/**
 * Mount Client Studio into a host element (Embed Delivery Layer).
 * Does not create Runtime — the delivery layer supplies the shared instance.
 */
export function mountClientStudio(
  options: MountClientStudioOptions,
): ClientStudioMountHandle {
  const { target, runtime } = options;

  target.setAttribute('data-embed-root', '');
  target.setAttribute('data-client-studio-root', '');
  target.dataset.clientStudioVersion = CLIENT_STUDIO_RELEASE.version;
  target.dataset.clientStudioGeneration = CLIENT_STUDIO_RELEASE.generation;
  target.dataset.objectId = runtime.getSession().objectId;

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
      target.removeAttribute('data-embed-root');
      target.removeAttribute('data-client-studio-root');
      delete target.dataset.clientStudioVersion;
      delete target.dataset.clientStudioGeneration;
      delete target.dataset.objectId;
      target.replaceChildren();
    },
  };
}
