import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { PlatformAccessRoot } from '@embed-engine/platform-access';
import '@embed-engine/platform-access/styles.css';

import { OfficeStudioApp } from './OfficeStudioApp';
import { PartnerCommercialJourneyApp } from './PartnerCommercialJourneyApp';
import '@embed-engine/platform-shell/styles.css';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found');
}

const partnerCommercialJourney =
  new URLSearchParams(window.location.search).get('partnerJourney') === '1';

createRoot(rootElement).render(
  <StrictMode>
    <PlatformAccessRoot studioId={partnerCommercialJourney ? 'manager' : 'office'}>
      {partnerCommercialJourney ? (
        <PartnerCommercialJourneyApp />
      ) : (
        <OfficeStudioApp />
      )}
    </PlatformAccessRoot>
  </StrictMode>,
);
