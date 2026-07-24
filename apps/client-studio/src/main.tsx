import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from './components/ErrorBoundary';
import { ClientStudioApp } from './features/client-studio/ClientStudioApp';
import { CLIENT_STUDIO_RELEASE } from './features/client-studio/pilot/productionConfig';
import { bootstrapEvents } from './features/client-studio/runtime/bootstrapEvents';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

document.documentElement.dataset.clientStudioVersion =
  CLIENT_STUDIO_RELEASE.version;
document.documentElement.dataset.clientStudioGeneration =
  CLIENT_STUDIO_RELEASE.generation;

bootstrapEvents.reset();
bootstrapEvents.emit('BOOTSTRAP_STARTED');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ClientStudioApp />
    </ErrorBoundary>
  </StrictMode>,
);
