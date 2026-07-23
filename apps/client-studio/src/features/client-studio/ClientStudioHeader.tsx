import { useEffect, useState } from 'react';

import { AstavLogo } from './AstavLogo';
import { scrollToSection } from './foundation/scrollToSection';
import { PILOT_SECTION_IDS } from './pilot/pilotVocabulary';

/**
 * AppShell top navigation (CSCB-01) — single sticky Experience header.
 * Owns brand, object label, journey actions, and Embed Close (×) when hosted
 * inside the Delivery overlay. No separate Close bar above this header.
 */
export function ClientStudioHeader() {
  const [objectLabel, setObjectLabel] = useState('Client Studio');
  const [showClose, setShowClose] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.querySelector('[data-embed-overlay]') !== null,
  );

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-client-studio-root]');
    const objectId = root?.dataset.objectId;
    if (objectId && objectId.trim().length > 0) {
      setObjectLabel(objectId);
    }
    setShowClose(document.querySelector('[data-embed-overlay]') !== null);
  }, []);

  return (
    <header
      data-experience-header=""
      className="sticky top-0 z-50 grid h-header shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-embed-border-default bg-embed-background-primary px-section"
    >
      <AstavLogo />
      <p className="max-w-[16rem] truncate text-center text-base text-embed-foreground-primary/70">
        {objectLabel}
      </p>
      <div className="flex items-center justify-end gap-section">
        <button
          type="button"
          className="text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4"
          onClick={() => {
            scrollToSection(PILOT_SECTION_IDS.audit);
          }}
        >
          Zavolat
        </button>
        <button
          type="button"
          className="text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4"
          onClick={() => {
            scrollToSection(PILOT_SECTION_IDS.priority);
          }}
        >
          Uložit
        </button>
        {showClose ? (
          <button
            type="button"
            data-embed-close=""
            aria-label="Zavřít Client Studio"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-embed-border-default bg-embed-background-primary text-xl leading-none text-embed-foreground-primary transition-colors hover:border-embed-brand-navy"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
