import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppShell } from './components/layout/AppShell';
import { ClientStudioPage } from './features/client-studio/ClientStudioPage';
import { ClientStudioSidebar } from './features/client-studio/ClientStudioSidebar';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppShell sidebar={<ClientStudioSidebar />} showStatusBar={false} header={<></>}>
      <ClientStudioPage />
    </AppShell>
  </StrictMode>,
);
