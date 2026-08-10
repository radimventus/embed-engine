/**
 * PT-CJ-06 — Persistent CTA while browsing studios without purchase.
 * Partner can return to Pilot Program selection anytime.
 */

import { useMemo, type CSSProperties } from 'react';

import { resolvePilotOfferHref } from '../cloud/cloudConfig';
import { isPilotPartnerRoles } from '../domain/pilotPartnerAccess';
import { offerSlugFromCompanyId } from '../pilot/pilotProvisionSnapshot';
import { WELCOME_PRIMARY_CTA_LABEL } from '../pilot/welcomeExperience';
import { restoreSession } from '../session/authService';

type SelectPilotProgramCtaProps = {
  /** Visual density — landing vs floating studio chrome. */
  readonly variant?: 'landing' | 'bar';
  readonly className?: string;
};

const BAR_STYLE: CSSProperties = {
  position: 'fixed',
  zIndex: 40,
  right: 16,
  bottom: 16,
  padding: '12px 18px',
  borderRadius: 999,
  border: '1px solid #18428f',
  background: '#18428f',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  boxShadow: '0 8px 24px rgba(0, 25, 48, 0.18)',
};

const LANDING_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 12,
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid #18428f',
  background: '#18428f',
  color: '#fff',
  textAlign: 'center',
  fontSize: 15,
  fontWeight: 600,
  textDecoration: 'none',
  boxSizing: 'border-box',
};

/**
 * Shows "Vybrat pilotní program" for pilot partners with a restored session.
 * Works without SessionProvider (Client Studio / Embed browse path).
 * Hidden for operators and anonymous Embed hosts.
 */
export function SelectPilotProgramCta({
  variant = 'bar',
  className,
}: SelectPilotProgramCtaProps) {
  const href = useMemo(() => {
    const session = restoreSession();
    if (session === null) return null;
    if (!isPilotPartnerRoles(session.user.roles)) return null;
    const companyId = session.companyId;
    if (typeof companyId !== 'string' || companyId.length === 0) return null;
    return resolvePilotOfferHref(offerSlugFromCompanyId(companyId));
  }, []);

  if (href === null) return null;

  const classes = [
    'platform-select-pilot-cta',
    variant === 'landing'
      ? 'platform-select-pilot-cta--landing'
      : 'platform-select-pilot-cta--bar',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      className={classes}
      href={href}
      style={variant === 'landing' ? LANDING_STYLE : BAR_STYLE}
      data-testid="select-pilot-program-cta"
    >
      {WELCOME_PRIMARY_CTA_LABEL}
    </a>
  );
}
