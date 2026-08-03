import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { PlatformAccessRoot } from '@embed-engine/platform-access';
import '@embed-engine/platform-access/styles.css';

import { OfficeStudioApp } from './OfficeStudioApp';
import '@embed-engine/platform-shell/styles.css';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <PlatformAccessRoot studioId="office">
      <OfficeStudioApp />
    </PlatformAccessRoot>
  </StrictMode>,
);
