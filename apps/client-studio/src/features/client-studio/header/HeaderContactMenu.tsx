import type { ReactNode } from 'react';

import {
  EXPERIENCE_CONTACT_EMAIL,
  EXPERIENCE_CONTACT_PHONE_DISPLAY,
  EXPERIENCE_CONTACT_PHONE_TEL,
} from './experienceContact';
import { HeaderHoverMenu } from './HeaderHoverMenu';

type HeaderContactMenuProps = {
  readonly icon: ReactNode;
};

const LINK_CLASS =
  'block text-sm text-white underline decoration-white/50 underline-offset-2 hover:decoration-white';

/**
 * Kontakt — mailto / tel from partner contact SSOT (CAP UX 57).
 */
export function HeaderContactMenu({ icon }: HeaderContactMenuProps) {
  return (
    <HeaderHoverMenu
      label="Kontakt"
      icon={icon}
      panelTestId="header-contact-panel"
    >
      <a
        role="menuitem"
        href={`mailto:${EXPERIENCE_CONTACT_EMAIL}`}
        className={LINK_CLASS}
        style={{ color: '#FFFFFF' }}
      >
        {EXPERIENCE_CONTACT_EMAIL}
      </a>
      <a
        role="menuitem"
        href={`tel:${EXPERIENCE_CONTACT_PHONE_TEL}`}
        className={`${LINK_CLASS} mt-2`}
        style={{ color: '#FFFFFF' }}
      >
        {EXPERIENCE_CONTACT_PHONE_DISPLAY}
      </a>
    </HeaderHoverMenu>
  );
}
