/**
 * CAP-CE-01 — Public Offer Experience domain model (UI foundation).
 * Package catalog mirrors the approved Office Pilot Program offer.
 * No persistence / payment / backend.
 */

export type OfferPackageId = 'pilot' | 'starter' | 'studio-partner';

export type OfferPackage = {
  readonly id: OfferPackageId;
  readonly name: string;
  readonly housesLabel: string;
  readonly priceCzk: number;
  readonly trialDays: number;
  readonly summary: string;
  readonly recommended: boolean;
  readonly highlights: readonly string[];
};

export type PublicOffer = {
  readonly slug: string;
  readonly companyId: string;
  readonly partnerId: string;
  readonly partnerName: string;
  readonly greeting: string;
  readonly intro: string;
  readonly heroImageUrl: string;
  readonly contactName: string | null;
};

export const OFFER_TRIAL_DAYS = 30 as const;

export const OFFER_PACKAGES: readonly OfferPackage[] = Object.freeze([
  {
    id: 'pilot',
    name: 'PILOT',
    housesLabel: '1 dům',
    priceCzk: 9_970,
    trialDays: OFFER_TRIAL_DAYS,
    summary: 'Nejjednodušší způsob, jak CONIS ověřit v praxi.',
    recommended: false,
    highlights: ['1 dům', 'Pro zákazníky, správu i obchod', 'Základní branding'],
  },
  {
    id: 'starter',
    name: 'PILOT TIP',
    housesLabel: '3 domy',
    priceCzk: 19_970,
    trialDays: OFFER_TRIAL_DAYS,
    summary: 'Pro rychlé ověření na reprezentativním vzorku nabídky.',
    recommended: true,
    highlights: ['3 domy', 'Pro zákazníky, správu i obchod', 'Plný brand'],
  },
  {
    id: 'studio-partner',
    name: 'PILOT MAX',
    housesLabel: 'až 10 domů',
    priceCzk: 59_970,
    trialDays: OFFER_TRIAL_DAYS,
    summary: 'Pro rychlejší nasazení větší části katalogu.',
    recommended: false,
    highlights: ['až 10 domů', 'Pro zákazníky, správu i obchod', 'Vlastní brand'],
  },
]);

export function getOfferPackage(id: OfferPackageId): OfferPackage {
  const found = OFFER_PACKAGES.find((item) => item.id === id);
  if (found === undefined) {
    throw new Error(`Unknown offer package: ${id}`);
  }
  return found;
}

export function isOfferPackageId(value: string): value is OfferPackageId {
  return OFFER_PACKAGES.some((item) => item.id === value);
}

export function formatOfferPriceCzk(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Hero photography — same Cloudinary asset as CONIS nabídka pilot. */
export const OFFER_HERO_IMAGE_URL =
  'https://res.cloudinary.com/djiq5pxj1/image/upload/v1785073673/Sni%CC%81mek_obrazovky_2026-07-26_v_15.45.55_fsdfjn.png' as const;

/** Soft circle watermark from CONIS nabídka pilot. */
export const OFFER_WATERMARK_URL =
  'https://res.cloudinary.com/djiq5pxj1/image/upload/v1785055783/motiv_pro_vodoznak_lzr0l6.png' as const;
