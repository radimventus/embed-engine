/**
 * TASK-83 — Persistent PRE-PILOT conversion layer.
 * The CTA always returns to the same Partner Commercial Journey
 * inside canonical Workspace Host. It never opens legacy /offer/.
 */

import { useMemo, type CSSProperties } from 'react';

import { resolvePartnerCommercialJourneyHref } from '../cloud/cloudConfig';
import { isPilotPartnerRoles } from '../domain/pilotPartnerAccess';
import { WELCOME_PRIMARY_CTA_LABEL } from '../pilot/welcomeExperience';
import { restoreSession } from '../session/authService';

type SelectPilotProgramCtaProps = {
  readonly variant?: 'landing' | 'bar';
  readonly className?: string;
};

const INTENSE_GOLD = '#f2b705';
const NAVY = '#071b33';

const BAR_ZONE_STYLE: CSSProperties = {
  width: '100%',
  minHeight: 92,
  boxSizing: 'border-box',
  padding: '18px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#F7F6F4',
};

const BAR_STYLE: CSSProperties = {
  display: 'block',
  width: 'min(100%, 384px)',
  boxSizing: 'border-box',
  padding: '16px 28px',
  borderRadius: 999,
  border: '1px solid #d1a55f',
  background: '#d1a55f',
  color: '#fff',
  textAlign: 'center',
  fontSize: 16,
  fontWeight: 700,
  textDecoration: 'none',
};

const LANDING_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 12,
  padding: '12px 16px',
  borderRadius: 10,
  border: `1px solid ${INTENSE_GOLD}`,
  background: INTENSE_GOLD,
  color: NAVY,
  textAlign: 'center',
  fontSize: 15,
  fontWeight: 700,
  textDecoration: 'none',
  boxSizing: 'border-box',
};

/**
 * TASK-83 lifecycle visibility is intentionally role/session based in this
 * cutover. TASK-84 will replace this with authoritative lifecycle gating:
 * PRE_PILOT → PAYMENT_REPORTED → PILOT_ACTIVE.
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

    return resolvePartnerCommercialJourneyHref();
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

  const link = (
    <a
      className={classes}
      href={href}
      style={variant === 'landing' ? LANDING_STYLE : BAR_STYLE}
      data-testid="select-pilot-program-cta"
    >
      {WELCOME_PRIMARY_CTA_LABEL}
    </a>
  );

  if (variant === 'landing') return link;

  return (
    <div
      style={BAR_ZONE_STYLE}
      data-testid="select-pilot-program-zone"
    >
      {link}
    </div>
  );
}
