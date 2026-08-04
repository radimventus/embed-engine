/**
 * CS-01 — Partner branding store (MVP local; not production CMS).
 */

import type { PartnerBranding } from '../domain/partnerBranding';
import {
  DEFAULT_PILOT_BRANDING_HERO,
  DEFAULT_PILOT_BRANDING_LOGO,
  DEFAULT_PILOT_BRANDING_WEBSITE,
} from '../domain/partnerBranding';

export const PARTNER_BRANDING_STORAGE_KEY = 'conis.platform.partner-branding.v1';

type BrandingStore = {
  readonly byCompanyId: Record<string, PartnerBranding>;
};

let memoryStore: BrandingStore = { byCompanyId: {} };

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function loadStore(): BrandingStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(PARTNER_BRANDING_STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryStore;
    const parsed = JSON.parse(raw) as { byCompanyId?: Record<string, PartnerBranding> };
    memoryStore = {
      byCompanyId:
        parsed.byCompanyId !== null && typeof parsed.byCompanyId === 'object'
          ? parsed.byCompanyId
          : {},
    };
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function saveStore(store: BrandingStore): void {
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(PARTNER_BRANDING_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function resetPartnerBrandingStore(): void {
  memoryStore = { byCompanyId: {} };
  if (canUseStorage()) {
    localStorage.removeItem(PARTNER_BRANDING_STORAGE_KEY);
  }
}

export function upsertPartnerBranding(input: {
  readonly companyId: string;
  readonly firmName: string;
  readonly logoLabel?: string;
  readonly heroLabel?: string;
  readonly websiteUrl?: string;
}): PartnerBranding {
  const store = loadStore();
  const previous = store.byCompanyId[input.companyId];
  const branding: PartnerBranding = {
    companyId: input.companyId,
    firmName: input.firmName.trim(),
    logoLabel: input.logoLabel?.trim() || DEFAULT_PILOT_BRANDING_LOGO,
    heroLabel: input.heroLabel?.trim() || DEFAULT_PILOT_BRANDING_HERO,
    websiteUrl:
      input.websiteUrl?.trim() ||
      previous?.websiteUrl ||
      DEFAULT_PILOT_BRANDING_WEBSITE,
    updatedAt: new Date().toISOString(),
  };
  saveStore({
    byCompanyId: {
      ...store.byCompanyId,
      [input.companyId]: branding,
    },
  });
  return branding;
}

export function getPartnerBranding(companyId: string): PartnerBranding | null {
  const raw = loadStore().byCompanyId[companyId];
  if (raw === undefined) return null;
  return {
    ...raw,
    websiteUrl:
      typeof raw.websiteUrl === 'string'
        ? raw.websiteUrl
        : DEFAULT_PILOT_BRANDING_WEBSITE,
  };
}
