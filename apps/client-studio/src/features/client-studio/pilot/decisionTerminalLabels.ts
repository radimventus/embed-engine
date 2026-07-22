/**
 * Decision Terminal presentation labels (CSCB-05A).
 * Display mapping only — does not invent, rank, or reorder Runtime semantics.
 */

import { DECISION_CATEGORIES } from '../sections/PriorityEngine/decision-cards.constants';

const PRIORITY_TITLE_BY_ID: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(DECISION_CATEGORIES.map((category) => [category.id, category.title])),
);

const CHAPTER_KIND_CS: Readonly<Record<string, string>> = Object.freeze({
  'primary-explanation': 'Hlavní vysvětlení',
  'supporting-argument': 'Podpůrný argument',
  recommendation: 'Doporučení',
  'semantic-transition': 'Přechod',
  'next-decision-step': 'Další krok',
});

const MOVE_STATUS_CS: Readonly<Record<string, string>> = Object.freeze({
  active: 'Aktivní',
  pending: 'Čeká',
  completed: 'Hotovo',
});

const MOVE_PREFIX_CS: Readonly<Record<string, string>> = Object.freeze({
  explain: 'Vysvětlení',
  acknowledge: 'Potvrzení',
  support: 'Podpora',
  recommend: 'Doporučení',
  consider: 'Ke zvážení',
  follow: 'Navazující krok',
  transition: 'Přechod',
  advance: 'Pokračování',
  inspect: 'Prohlédnout',
  media: 'Médium',
});

/** Closed map of known Runtime semantic keys → Czech customer copy. */
const DECISION_KEY_CS: Readonly<Record<string, string>> = Object.freeze({
  'explore-house-structure': 'Prozkoumejte strukturu domu',
  'primary-living-volume': 'Obývací prostor je jádrem denního života',
  'daily-workflow-core': 'Kuchyně jako centrum denního provozu',
  'private-rest-zone': 'Klidová zóna pro odpočinek',
  'service-wet-zone': 'Servisní mokrá zóna',
  'flexible-secondary-space': 'Flexibilní vedlejší prostor',
  'value-led-exploration': 'Orientace podle hodnoty a efektivity',
  'outdoor-led-exploration': 'Orientace podle kontaktu s exteriérem',
  'space-led-exploration': 'Orientace podle prostoru',
  'privacy-led-exploration': 'Orientace podle soukromí',
  'day-zone-openness': 'Otevřenost denní zóny',
  'family-gathering': 'Prostor pro rodinné setkávání',
  'workflow-efficiency': 'Efektivita denního provozu',
  'natural-light': 'Přirozené světlo',
  privacy: 'Soukromí',
  'morning-light': 'Ranní světlo',
  finishes: 'Povrchy a detaily',
  storage: 'Úložný prostor',
  flexibility: 'Flexibilita',
  growth: 'Prostor pro růst',
  'value-efficiency': 'Poměr hodnoty a nákladů',
  'outdoor-connection': 'Propojení s exteriérem',
  'spatial-generosity': 'Prostorová velkorysost',
  'inspect-layout': 'Prozkoumejte dispozici',
  'compare-rooms': 'Porovnejte místnosti',
  'inspect-value-drivers': 'Prohlédněte si, co tvoří hodnotu domu',
  'inspect-outdoor-connection': 'Podívejte se na propojení s exteriérem',
  'inspect-spatial-volume': 'Prozkoumejte prostorovou nabídku',
  'inspect-privacy-zones': 'Prozkoumejte zóny soukromí',
  'compare-priority-tradeoffs': 'Porovnejte kompromisy priorit',
  'emphasize-value': 'Důraz na hodnotu',
  'emphasize-outdoor': 'Důraz na exteriér',
  'emphasize-space': 'Důraz na prostor',
  'emphasize-privacy': 'Důraz na soukromí',
  'priority-generic': 'Obecné priority',
  'media:hero': 'Hlavní pohled',
  'media:video': 'Video',
  'media:gallery': 'Galerie',
  'media:thumbnail': 'Náhledy',
  'media:document': 'Dokumenty',
  hero: 'Hlavní pohled',
  video: 'Video',
  gallery: 'Galerie',
  thumbnail: 'Náhledy',
  document: 'Dokumenty',
});

export const DECISION_TERMINAL_CHROME_CS = Object.freeze({
  title: 'Rozhodovací terminál',
  story: 'Příběh rozhodnutí',
  moves: 'Kroky rozhodnutí',
  drivers: 'Co rozhodnutí ovlivňuje',
  selectedPriorities: 'Vybrané priority',
  noPriorities: 'Zatím bez priorit',
  strongInfluence: 'Silný vliv',
  supportingArguments: 'Podpůrné argumenty',
  rationale: 'Odůvodnění',
  outcomes: 'Výsledek a kompromisy',
  outcomeStatus: 'Výsledek',
  recommendation: 'Doporučení',
  strengths: 'Silné stránky',
  considerations: 'Na co si dát pozor',
  confidence: 'Jistota',
  focus: 'Fokus',
  nextStep: 'Další krok',
  storyNext: 'Další krok příběhu',
  detailToggle: 'Podrobný průběh rozhodnutí',
});

function humanizeToken(token: string): string {
  return token.replace(/[_:]+/g, ' ').replace(/-/g, ' ').trim();
}

/**
 * Map a Runtime semantic key to Czech display copy.
 * Unknown keys fall back to a readable token form — never invents new ranking.
 */
export function formatDecisionKeyCs(raw: string): string {
  const key = raw.trim();
  if (key.length === 0) {
    return key;
  }

  const direct = DECISION_KEY_CS[key];
  if (direct !== undefined) {
    return direct;
  }

  const priority = PRIORITY_TITLE_BY_ID[key];
  if (priority !== undefined) {
    return priority;
  }

  const chapter = CHAPTER_KIND_CS[key];
  if (chapter !== undefined) {
    return chapter;
  }

  if (key.startsWith('focus-room:')) {
    return `Přechod k místnosti`;
  }
  if (key.startsWith('focus-signal:')) {
    const signal = key.slice('focus-signal:'.length);
    return `Přechod: ${formatDecisionKeyCs(signal)}`;
  }

  const colon = key.indexOf(':');
  if (colon > 0) {
    const prefix = key.slice(0, colon);
    const rest = key.slice(colon + 1);
    const prefixLabel = MOVE_PREFIX_CS[prefix];
    const restLabel = formatDecisionKeyCs(rest);
    if (prefixLabel !== undefined) {
      return `${prefixLabel}: ${restLabel}`;
    }
    return `${humanizeToken(prefix)}: ${restLabel}`;
  }

  return humanizeToken(key);
}

export function formatChapterKindCs(kind: string): string {
  return CHAPTER_KIND_CS[kind] ?? humanizeToken(kind);
}

export function formatMoveStatusCs(status: string): string {
  return MOVE_STATUS_CS[status] ?? humanizeToken(status);
}

export function formatPriorityIdCs(priorityId: string): string {
  return PRIORITY_TITLE_BY_ID[priorityId] ?? formatDecisionKeyCs(priorityId);
}
