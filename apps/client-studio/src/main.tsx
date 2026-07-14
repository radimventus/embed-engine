import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <div className="flex h-full min-h-screen flex-col bg-white">
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="text-lg font-medium tracking-[0.24em] text-neutral-900">EMBED</p>
        <p className="mt-5 text-sm text-neutral-700">Klientské studio</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-500">
          <span className="text-[#16A34A]">●</span>
          READY
        </p>
        <p className="mt-10 text-sm text-neutral-500">Platform Ready</p>
      </main>
      <footer className="pb-10 text-center">
        <p className="text-xs text-neutral-400">EMBED Platform</p>
        <p className="mt-1 text-xs text-neutral-400">v0.1.0</p>
      </footer>
    </div>
  </StrictMode>,
);
