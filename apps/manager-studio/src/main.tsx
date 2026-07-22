import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from './components/ErrorBoundary';
import { ManagerStudioApp } from './features/manager-studio/ManagerStudioApp';
import { MANAGER_STUDIO_RELEASE } from './features/manager-studio/operations/operationsVocabulary';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

document.documentElement.dataset.managerStudioVersion =
  MANAGER_STUDIO_RELEASE.version;
document.documentElement.dataset.managerStudioGeneration =
  MANAGER_STUDIO_RELEASE.generation;

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ManagerStudioApp />
    </ErrorBoundary>
  </StrictMode>,
);
