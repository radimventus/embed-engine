import { useEffect, useState } from 'react';

import { AstavLogo } from './AstavLogo';
import { formatExperienceHeaderTitle } from './foundation/formatExperienceHeaderTitle';
import { scrollToSection } from './foundation/scrollToSection';
import { PILOT_SECTION_IDS } from './pilot/pilotVocabulary';

/**
 * AppShell top navigation (CSCB-01) — single sticky Experience header.
 * Inner rail matches DesktopCanvas width + `px-section` so logo/actions share
 * the same content axis as Experience sections.
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
      className="sticky top-0 z-50 h-header shrink-0 border-b border-embed-border-default bg-embed-background-primary"
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-embed-action-primary text-[1.35rem] leading-none text-embed-action-onPrimary transition-opacity hover:opacity-90"
            >
              <span aria-hidden="true" className="text-embed-action-onPrimary">
                ×
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
