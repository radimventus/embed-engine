/**
 * CAP-CE-01 — Public Offer Experience domain model (UI foundation).
 * Package catalog mirrors Office PE-09 SSOT (Pilot · Starter · Studio Partner).
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
  readonly partnerName: string;
  readonly greeting: string;
  readonly intro: string;
  readonly heroImageUrl: string;
  readonly contactName: string | null;
};

export const OFFER_TRIAL_DAYS = 90 as const;

export const OFFER_PACKAGES: readonly OfferPackage[] = Object.freeze([
  {
    id: 'pilot',
    name: 'Pilot',
    housesLabel: '1 dům',
    priceCzk: 4_970,
    trialDays: OFFER_TRIAL_DAYS,
    summary: 'Vstupní spolupráce — 1 dům a plná CONIS nabídka pro váš web.',
    recommended: false,
    highlights: ['1 dům', 'Pro zákazníky, správu i obchod', 'Základní branding'],
  },
  {
    id: 'starter',
    name: 'Starter',
    housesLabel: 'až 3 domy',
    priceCzk: 14_970,
    trialDays: OFFER_TRIAL_DAYS,
    summary: 'Doporučený start — až 3 domy a rozšířený provoz.',
    recommended: true,
    highlights: ['Až 3 domy', 'Pro zákazníky, správu i obchod', 'Plný brand'],
  },
  {
    id: 'studio-partner',
    name: 'Studio Partner',
    housesLabel: 'Neomezeně',
    priceCzk: 29_970,
    trialDays: OFFER_TRIAL_DAYS,
    summary: 'Partnerský provoz — více objektů a dlouhodobá spolupráce.',
    recommended: false,
    highlights: ['Neomezeně objektů', 'Pro zákazníky, správu i obchod', 'Vlastní brand'],
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
