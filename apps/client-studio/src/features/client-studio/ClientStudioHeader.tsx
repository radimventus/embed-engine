import { useEffect, useState } from 'react';

import actionCallUrl from '../../assets/icons/action-call.png';
import actionPdfUrl from '../../assets/icons/action-pdf.png';

import { AstavLogo } from './AstavLogo';
import { formatExperienceHeaderTitle } from './foundation/formatExperienceHeaderTitle';
import { HeaderContactMenu } from './header/HeaderContactMenu';
import { HeaderSaveMenu } from './header/HeaderSaveMenu';

/**
 * AppShell top navigation (CSCB-01) — single sticky Experience header.
 * Close is owned by the Delivery overlay ([data-embed-close] in overlaySurface),
 * not by this header — no close button rendered here.
 * Kontakt / Uložit — hover panels (CAP UX 57).
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
      className="relative sticky top-0 z-50 shrink-0 border-b border-embed-border-default bg-embed-background-primary pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="mx-auto grid h-header w-full min-w-0 max-w-none grid-cols-[1fr_auto_1fr] items-center px-section desktop:w-canvas desktop:max-w-canvas">
        <div className="justify-self-start">
          <AstavLogo />
        </div>
        <p className="max-w-[12rem] truncate text-center text-sm text-embed-foreground-primary/70 tablet:max-w-[16rem] tablet:text-base desktop:max-w-[20rem]">
          {title}
        </p>
        <div className="flex items-center justify-end gap-3 justify-self-end desktop:gap-section">
          <HeaderContactMenu
            icon={
              <img
                src={actionCallUrl}
                alt=""
                width={48}
                height={48}
                className="h-10 w-10 shrink-0 object-contain desktop:h-12 desktop:w-12"
                aria-hidden="true"
              />
            }
          />
          <HeaderSaveMenu
            icon={
              <img
                src={actionPdfUrl}
                alt=""
                width={32}
                height={32}
                className="h-7 w-7 shrink-0 object-contain desktop:h-8 desktop:w-8"
                aria-hidden="true"
              />
            }
          />
        </div>
      </div>
    </header>
  );
}
