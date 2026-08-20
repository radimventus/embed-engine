import type { ReactNode } from 'react';

import { HeaderHoverMenu } from './HeaderHoverMenu';
import { useDecisionSessionRuntime } from '../runtime/DecisionSessionRuntimeProvider';

type HeaderContactMenuProps = {
  readonly icon: ReactNode;
};

const LINK_CLASS =
  'block text-sm text-white underline decoration-white/50 underline-offset-2 hover:decoration-white';

function telHref(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^\d+]/g, '');
  return `tel:${digits.length > 0 ? digits : trimmed}`;
}

/**
 * Kontakt — phone / email from the active Company's public Partner projection.
 */
export function HeaderContactMenu({ icon }: HeaderContactMenuProps) {
  const { company } = useDecisionSessionRuntime();
  const phone = company?.phone?.trim() || null;
  const email = company?.email?.trim() || null;

  if (phone === null && email === null) {
    return null;
  }

  return (
    <HeaderHoverMenu
      label="Kontakt"
      icon={icon}
      panelTestId="header-contact-panel"
    >
      {email !== null ? (
        <a
          role="menuitem"
          href={`mailto:${email}`}
          className={LINK_CLASS}
          style={{ color: '#FFFFFF' }}
        >
          {email}
        </a>
      ) : null}
      {phone !== null ? (
        <a
          role="menuitem"
          href={telHref(phone)}
          className={email !== null ? `${LINK_CLASS} mt-2` : LINK_CLASS}
          style={{ color: '#FFFFFF' }}
        >
          {phone}
        </a>
      ) : null}
    </HeaderHoverMenu>
  );
}
