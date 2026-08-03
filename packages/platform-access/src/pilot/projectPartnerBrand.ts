/**
 * PE-02 — Brand Projection Engine.
 * Single source: Company + Logo + Hero → Client / Manager / Sales only.
 * No Runtime / Decision / Builder / Office chrome coupling.
 */

import type { PartnerBranding } from '../domain/partnerBranding';
import {
  DEFAULT_PILOT_BRANDING_HERO,
  DEFAULT_PILOT_BRANDING_LOGO,
} from '../domain/partnerBranding';
import { getPartnerBranding } from './partnerBrandingStore';

export type StudioBrandProjection = {
  readonly companyId: string | null;
  readonly companyName: string;
  readonly tradeMark: string;
  readonly logoLabel: string;
  readonly heroLabel: string;
  /** True when branding was seeded for this company (CS-01 prepare pilot). */
  readonly personalized: boolean;
};

export type ProjectPartnerBrandInput = {
  readonly companyId?: string | null;
  /** Fallback when no branding store entry exists (bootstrap company name). */
  readonly fallbackCompanyName?: string | null;
};

function fromBranding(branding: PartnerBranding): StudioBrandProjection {
  const companyName = branding.firmName.trim() || 'Partner';
  return {
    companyId: branding.companyId,
    companyName,
    tradeMark: companyName,
    logoLabel: branding.logoLabel.trim() || DEFAULT_PILOT_BRANDING_LOGO,
    heroLabel: branding.heroLabel.trim() || DEFAULT_PILOT_BRANDING_HERO,
    personalized: true,
  };
}

/**
 * Project partner identity for partner studios.
 * Office / Builder must not consume this for chrome personalization.
 */
export function projectPartnerBrand(
  input: ProjectPartnerBrandInput = {},
): StudioBrandProjection {
  const companyId = input.companyId?.trim() || null;
  if (companyId !== null) {
    const stored = getPartnerBranding(companyId);
    if (stored !== null) {
      return fromBranding(stored);
    }
  }

  const fallback =
    input.fallbackCompanyName?.trim() ||
    'Pilot Partner';

  return {
    companyId,
    companyName: fallback,
    tradeMark: fallback,
    logoLabel: DEFAULT_PILOT_BRANDING_LOGO,
    heroLabel: DEFAULT_PILOT_BRANDING_HERO,
    personalized: false,
  };
}
