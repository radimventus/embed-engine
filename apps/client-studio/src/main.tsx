import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppShell } from './components/layout/AppShell';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppShell studioTitle="Klientské studio" />
  </StrictMode>,
);
