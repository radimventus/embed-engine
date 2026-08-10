/**
 * PE-02 / PT-DATA-02 — Brand Projection Engine.
 * Prefer Shared Project manifest (Builder-authored) when projectId is known.
 * Partner branding store remains for provisioned PE personalization when no project bind.
 */

import type { PartnerBranding } from '../domain/partnerBranding';
import {
  DEFAULT_PILOT_BRANDING_HERO,
  DEFAULT_PILOT_BRANDING_LOGO,
} from '../domain/partnerBranding';
import { getCanonicalProject } from '../projection/canonicalProjectProjection';
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
  /** Shared Project id — preferred brand source (Builder manifest). */
  readonly projectId?: string | null;
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
 * Project partner identity for partner studios (Manager / Sales chrome).
 * CAP-PLAT-02c — when `projectId` is set, brand comes from CPL.
 * Office / Builder must not consume this for chrome personalization.
 * Client chrome uses `resolveClientRuntimeBinding` / CPL directly.
 */
export function projectPartnerBrand(
  input: ProjectPartnerBrandInput = {},
): StudioBrandProjection {
  const projectId = input.projectId?.trim() || null;
  if (projectId !== null) {
    const projection = getCanonicalProject(projectId);
    if (projection !== null) {
      const companyName = projection.partner.companyName.trim() || 'Partner';
      const logo =
        projection.branding.logoLabel.trim() || DEFAULT_PILOT_BRANDING_LOGO;
      const hero =
        projection.branding.heroLabel.trim() || DEFAULT_PILOT_BRANDING_HERO;
      return {
        companyId: projection.partner.companyId,
        companyName,
        tradeMark: companyName,
        logoLabel: logo,
        heroLabel: hero,
        personalized: projection.branding.logoLabel.trim().length > 0,
      };
    }
  }

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
