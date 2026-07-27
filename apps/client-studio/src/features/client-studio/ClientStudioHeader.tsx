import { useEffect, useState } from 'react';

import actionCallUrl from '../../assets/icons/action-call.png';
import actionPdfUrl from '../../assets/icons/action-pdf.png';

import { AstavLogo } from './AstavLogo';
import { formatExperienceHeaderTitle } from './foundation/formatExperienceHeaderTitle';
import { scrollToSection } from './foundation/scrollToSection';
import { PILOT_SECTION_IDS } from './pilot/pilotVocabulary';

/**
 * AppShell top navigation (CSCB-01) — single sticky Experience header.
 * Close is owned by the Delivery overlay ([data-embed-close] in overlaySurface),
 * not by this header — no close button rendered here.
 */
export function ClientStudioHeader() {
  const [title, setTitle] = useState('Client Studio');

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-client-studio-root]');
    setTitle(formatExperienceHeaderTitle(root?.dataset.objectId));
  }, []);

  return (
    <header
      data-experience-header=""
      className="relative sticky top-0 z-50 h-header shrink-0 border-b border-embed-border-default bg-embed-background-primary"
    >
      <div className="mx-auto grid h-full w-canvas min-w-0 max-w-canvas grid-cols-[1fr_auto_1fr] items-center px-section mobile:w-full mobile:max-w-none mobile:min-w-0">
        <div className="justify-self-start">
          <AstavLogo />
        </div>
        <p className="max-w-[20rem] truncate text-center text-base text-embed-foreground-primary/70">
          {title}
        </p>
        <div className="flex items-center justify-end gap-section justify-self-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4"
            onClick={() => {
              scrollToSection(PILOT_SECTION_IDS.audit);
            }}
          >
            <img
              src={actionCallUrl}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 object-contain"
              aria-hidden="true"
            />
            <span>Kontakt</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4"
            onClick={() => {
              scrollToSection(PILOT_SECTION_IDS.priority);
            }}
          >
            <img
              src={actionPdfUrl}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain"
              aria-hidden="true"
            />
            <span>Uložit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
