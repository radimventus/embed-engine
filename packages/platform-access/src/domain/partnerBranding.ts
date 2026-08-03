/**
 * CS-01 — Partner branding seed for pilot provisioning (MVP local).
 */

export type PartnerBranding = {
  readonly companyId: string;
  readonly firmName: string;
  readonly logoLabel: string;
  readonly heroLabel: string;
  readonly updatedAt: string;
};

export const DEFAULT_PILOT_BRANDING_LOGO = 'Pilot Logo (placeholder)' as const;
export const DEFAULT_PILOT_BRANDING_HERO = 'Reference House Hero' as const;
