import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { OfferExperienceApp } from './OfferExperienceApp';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Offer Experience root element is missing');
}

createRoot(rootElement).render(
  <StrictMode>
    <OfferExperienceApp />
  </StrictMode>,
);
