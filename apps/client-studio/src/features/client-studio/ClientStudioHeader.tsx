import { useEffect, useState } from 'react';
import { CloseButton } from '@embed-engine/ui';

import { AstavLogo } from './AstavLogo';
import { formatExperienceHeaderTitle } from './foundation/formatExperienceHeaderTitle';
import { CallModal } from './header/CallModal';
import { HeaderCallAction, HeaderPdfAction } from './header/HeaderTextAction';
import { PdfModal } from './header/PdfModal';

type HeaderModal = 'call' | 'pdf' | null;

/**
 * AppShell top navigation (CSCB-01) — single sticky Experience header.
 * Close uses platform CloseButton (CAP-UX-PLATFORM-01).
 */
export function ClientStudioHeader() {
  const [title, setTitle] = useState('Client Studio');
  const [showClose, setShowClose] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.querySelector('[data-embed-overlay]') !== null,
  );
  const [modal, setModal] = useState<HeaderModal>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-client-studio-root]');
    setTitle(formatExperienceHeaderTitle(root?.dataset.objectId));
    setShowClose(document.querySelector('[data-embed-overlay]') !== null);
  }, []);

  return (
    <>
      <header
        data-experience-header=""
        className="relative sticky top-0 z-50 h-header shrink-0 border-b border-embed-border-default bg-embed-background-primary"
      >
        <div
          className={[
            'mx-auto grid h-full w-canvas min-w-0 max-w-canvas grid-cols-[1fr_auto_1fr] items-center px-section mobile:w-full mobile:max-w-none mobile:min-w-0',
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
            <HeaderCallAction onClick={() => setModal('call')} />
            <HeaderPdfAction onClick={() => setModal('pdf')} />
          </div>
        </div>

        {showClose ? (
          <CloseButton
            data-embed-close=""
            aria-label="Zavřít Client Studio"
            className="absolute right-section top-1/2 z-10 -translate-y-1/2"
          />
        ) : null}
      </header>

      {modal === 'call' ? (
        <CallModal onClose={() => setModal(null)} />
      ) : null}
      {modal === 'pdf' ? <PdfModal onClose={() => setModal(null)} /> : null}
    </>
  );
}
