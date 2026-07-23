import { useEffect, useState } from 'react';

import { AstavLogo } from './AstavLogo';
import { formatExperienceHeaderTitle } from './foundation/formatExperienceHeaderTitle';
import { scrollToSection } from './foundation/scrollToSection';
import { PILOT_SECTION_IDS } from './pilot/pilotVocabulary';

/**
 * AppShell top navigation (CSCB-01) — single sticky Experience header.
 * Content rail matches DesktopCanvas; Close sits on the viewport edge as a
 * system action, outside the experience content grid.
 */
export function ClientStudioHeader() {
  const [title, setTitle] = useState('Client Studio');
  const [showClose, setShowClose] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.querySelector('[data-embed-overlay]') !== null,
  );

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-client-studio-root]');
    setTitle(formatExperienceHeaderTitle(root?.dataset.objectId));
    setShowClose(document.querySelector('[data-embed-overlay]') !== null);
  }, []);

  return (
    <header
      data-experience-header=""
      className="relative sticky top-0 z-50 h-header shrink-0 border-b border-embed-border-default bg-embed-background-primary"
    >
      <div
        className={[
          'mx-auto grid h-full w-canvas min-w-0 max-w-canvas grid-cols-[1fr_auto_1fr] items-center px-section mobile:w-full mobile:max-w-none mobile:min-w-0',
          // Clear absolute Close when the canvas spans near the header edge.
          showClose ? 'max-[1499px]:pr-16' : '',
        ].join(' ')}
      >
        <div className="justify-self-start">
          <AstavLogo />
        </div>
        <p className="max-w-[20rem] truncate text-center text-base text-embed-foreground-primary/70">
          {title}
        </p>
        <div className="flex items-center justify-end gap-section justify-self-end">
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
        </div>
      </div>

      {showClose ? (
        <button
          type="button"
          data-embed-close=""
          aria-label="Zavřít Client Studio"
          className="absolute right-section top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-embed-action-primary text-embed-action-onPrimary transition-opacity hover:opacity-90"
        >
          <span
            aria-hidden="true"
            className="block translate-y-[-0.05em] text-[2rem] font-bold leading-none text-embed-action-onPrimary"
          >
            ×
          </span>
        </button>
      ) : null}
    </header>
  );
}
