import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { PlatformAccessRoot } from '@embed-engine/platform-access';
import '@embed-engine/platform-access/styles.css';

import { ErrorBoundary } from './components/ErrorBoundary';
import { BuilderStudioApp } from './features/builder-studio/BuilderStudioApp';
import { BUILDER_STUDIO_RELEASE } from './features/builder-studio/release';
import { HousePackageRuntimePreview } from './features/house-package/HousePackageRuntimePreview';
import {
  isBuilderNahledWindow,
} from './features/house-package/mountHousePackageRuntimePreview';
import '@embed-engine/platform-shell/styles.css';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

document.documentElement.dataset.builderStudioVersion =
  BUILDER_STUDIO_RELEASE.version;
document.documentElement.dataset.builderStudioGeneration =
  BUILDER_STUDIO_RELEASE.generation;

const nahledWindow = isBuilderNahledWindow();

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      {nahledWindow ? (
        <HousePackageRuntimePreview
          open
          releaseSummary={null}
          verification={null}
          onClose={() => {
            window.close();
          }}
        />
      ) : (
        <PlatformAccessRoot studioId="builder">
          <BuilderStudioApp />
        </PlatformAccessRoot>
      )}
    </ErrorBoundary>
  </StrictMode>,
);
