import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { SalesStudioApp } from './SalesStudioApp';
import '@embed-engine/platform-shell/styles.css';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <SalesStudioApp />
  </StrictMode>,
);
