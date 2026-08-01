import type { CapabilityId } from '@embed-engine/capabilities';

/**
 * PR-004 — Presentační lokalizace Inspectoru (Registry SSOT zůstává EN).
 */
const CAPABILITY_CS: Record<
  string,
  { readonly name: string; readonly description: string }
> = {
  dashboard: {
    name: 'Přehled projektu',
    description: 'Přehled projektu a shrnutí připravenosti.',
  },
  media: {
    name: 'Média',
    description: 'Media Studio nad obsahovými oblastmi House Package.',
  },
  knowledge: {
    name: 'Znalosti',
    description: 'Composer znalostí — projekce a editační plochy.',
  },
  experience: {
    name: 'Experience',
    description: 'Experience Composer — struktura Decision Experience.',
  },
  preview: {
    name: 'Náhled',
    description: 'Centrum náhledu — persony, zařízení, Decision Path.',
  },
  release: {
    name: 'Publikace',
    description: 'Centrum publikace — orchestrace release metadat.',
  },
  collaboration: {
    name: 'Spolupráce',
    description: 'Workspace spolupráce — review, úkoly, aktivita.',
  },
  intelligence: {
    name: 'Intelligence',
    description: 'Klientská plocha Decision Intelligence Core.',
  },
  ai: {
    name: 'AI Author',
    description: 'Kontextové návrhy AI Author (deterministické).',
  },
  operations: {
    name: 'Provoz',
    description: 'Provozní plochy Manager Studia.',
  },
  pipeline: {
    name: 'Pipeline',
    description: 'Sales pipeline — skryté, dokud není produktizováno.',
  },
  'customer-success': {
    name: 'Zákaznický úspěch',
    description:
      'Zákaznický úspěch — onboarding, adopce, zdraví, doporučení.',
  },
  'operations-center': {
    name: 'Provozní centrum platformy',
    description:
      'Provozní centrum — přehled, časová osa, upozornění, metriky CONIS.',
  },
  'product-learning': {
    name: 'Učení produktu',
    description:
      'Centrum učení produktu — registr zpětné vazby, poznatky, roadmapa.',
  },
  'commercial-platform': {
    name: 'Obchodní platforma',
    description:
      'Obchodní platforma — edice, oprávnění, předplatná, návrhy navýšení.',
  },
  'launch-center': {
    name: 'Centrum spuštění',
    description:
      'Centrum spuštění CONIS — orchestrace Pilot → GA nad existující připraveností.',
  },
};

const MATURITY_CS: Record<string, string> = {
  stable: 'Stabilní',
  beta: 'Beta',
  experimental: 'Experimentální',
};

const ENTITLEMENT_CS: Record<string, string> = {
  included: 'V ceně',
  optional: 'Volitelné',
  experimental: 'Experimentální',
  hidden: 'Skryté',
};

const OWNER_CS: Record<string, string> = {
  platform: 'Platforma',
};

export function localizeCapabilityName(id: CapabilityId | string): string {
  return CAPABILITY_CS[id]?.name ?? id;
}

export function localizeCapabilityDescription(
  id: CapabilityId | string,
  fallback: string,
): string {
  return CAPABILITY_CS[id]?.description ?? fallback;
}

export function localizeMaturity(value: string): string {
  return MATURITY_CS[value] ?? value;
}

export function localizeEntitlement(value: string): string {
  return ENTITLEMENT_CS[value] ?? value;
}

export function localizeOwner(value: string): string {
  return OWNER_CS[value] ?? value;
}

export function localizeDependencyIds(
  ids: readonly string[],
): string {
  return ids.map((id) => localizeCapabilityName(id)).join(', ');
}
