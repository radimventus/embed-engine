/**
 * CAP-CE-01 — Public offer resolution by slug (UI seed only).
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
      'děkujeme za schůzku. Níže najdete nabídku CONIS Embed — výběrem balíčku dokončíte obchodní krok, který jsme společně připravili.',
    heroImageUrl: OFFER_HERO_IMAGE_URL,
  },
  blokki: {
    slug: 'blokki',
    partnerName: 'Blokki',
    contactName: 'Jan Blok',
    greeting: 'Dobrý den, Jane,',
    intro:
      'děkujeme za schůzku. Níže najdete nabídku CONIS Embed — výběrem balíčku dokončíte obchodní krok, který jsme společně připravili.',
    heroImageUrl: OFFER_HERO_IMAGE_URL,
  },
});

export const DEFAULT_OFFER_SLUG = 'domy-s-energi' as const;

export function resolvePublicOffer(slug: string): PublicOffer | null {
  const key = slug.trim().toLowerCase();
  if (key.length === 0) return null;
  return OFFER_BY_SLUG[key] ?? null;
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
