/**
 * CAP-CE-01 / PT-COM-02 — Public offer resolution by slug.
 * Seeds for demos; unknown slugs synthesize a partner-specific offer (first sale).
 */

import {
  OFFER_HERO_IMAGE_URL,
  type PublicOffer,
} from './offerModel';

const OFFER_BY_SLUG: Readonly<Record<string, PublicOffer>> = Object.freeze({
  'domy-s-energi': {
    slug: 'domy-s-energi',
    partnerName: 'Domy s energií',
    contactName: 'Jana Energetická',
    greeting: 'Dobrý den, Jano,',
    intro:
      'děkujeme za schůzku. Níže najdete nabídku CONIS — výběrem balíčku dokončíte obchodní krok, který jsme společně připravili.',
    heroImageUrl: OFFER_HERO_IMAGE_URL,
  },
  blokki: {
    slug: 'blokki',
    partnerName: 'Blokki',
    contactName: 'Jan Blok',
    greeting: 'Dobrý den, Jane,',
    intro:
      'děkujeme za schůzku. Níže najdete nabídku CONIS — výběrem balíčku dokončíte obchodní krok, který jsme společně připravili.',
    heroImageUrl: OFFER_HERO_IMAGE_URL,
  },
});

export const DEFAULT_OFFER_SLUG = 'domy-s-energi' as const;

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function readOfferQueryOverrides(): {
  readonly partnerName?: string;
  readonly contactName?: string;
} {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const partnerName = params.get('partner')?.trim();
  const contactName = params.get('contact')?.trim();
  return {
    partnerName:
      partnerName !== undefined && partnerName.length > 0
        ? partnerName
        : undefined,
    contactName:
      contactName !== undefined && contactName.length > 0
        ? contactName
        : undefined,
  };
}

function synthesizePublicOffer(slug: string): PublicOffer {
  const overrides = readOfferQueryOverrides();
  const partnerName = overrides.partnerName ?? titleFromSlug(slug);
  const contactName = overrides.contactName ?? partnerName;
  const first = contactName.split(/\s+/)[0] ?? contactName;
  return {
    slug,
    partnerName,
    contactName,
    greeting: `Dobrý den, ${first},`,
    intro:
      'děkujeme za schůzku. Níže najdete nabídku CONIS — výběrem balíčku dokončíte obchodní krok, který jsme společně připravili.',
    heroImageUrl: OFFER_HERO_IMAGE_URL,
  };
}

export function resolvePublicOffer(slug: string): PublicOffer | null {
  const key = slug.trim().toLowerCase();
  if (key.length === 0) return null;
  return OFFER_BY_SLUG[key] ?? synthesizePublicOffer(key);
}

/**
 * Parse `/offer/{slug}` from the current path.
 * Also accepts bare `/{slug}` when the app is hosted under `/offer/`.
 */
export function parseOfferSlugFromPath(pathname: string): string | null {
  const cleaned = pathname.replace(/\/+$/, '') || '/';
  const offerMatch = cleaned.match(/^\/offer\/([^/]+)$/i);
  if (offerMatch !== null) {
    return decodeURIComponent(offerMatch[1] ?? '').trim() || null;
  }
  const bareMatch = cleaned.match(/^\/([^/]+)$/);
  if (bareMatch !== null) {
    const segment = decodeURIComponent(bareMatch[1] ?? '').trim();
    if (segment.length === 0 || segment === 'index.html') return null;
    return segment;
  }
  return null;
}
