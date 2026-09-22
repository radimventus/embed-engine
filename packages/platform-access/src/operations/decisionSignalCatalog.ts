/**
 * Canonical Decision Signal identities for Profil zájemce projection.
 * IDs are authority. Labels are lookup — never DOM text.
 */

export const AUDIT_LAND_QUESTION_ID = 'audit.land';
export const AUDIT_LAND_HAS_PLOT = 'owned';
export const AUDIT_LAND_SEARCHING_PLOT = 'seeking';

export const AUDIT_LAND_LABELS: Readonly<Record<string, string>> =
  Object.freeze({
    [AUDIT_LAND_HAS_PLOT]: 'Mám pozemek',
    [AUDIT_LAND_SEARCHING_PLOT]: 'Hledám pozemek',
  });

export const AUDIT_LAND_SALES_DETAIL: Readonly<Record<string, string>> =
  Object.freeze({
    [AUDIT_LAND_HAS_PLOT]:
      'Má pozemek a chce ověřit jeho vhodnost pro tento dům.',
    [AUDIT_LAND_SEARCHING_PLOT]: 'Hledá pozemek.',
  });

export function prioritySupplementaryQuestionId(priorityId: string): string {
  return `priority.${priorityId}`;
}

export function parsePrioritySupplementaryQuestionId(
  questionId: string,
): string | null {
  const prefix = 'priority.';
  if (!questionId.startsWith(prefix)) {
    return null;
  }
  const priorityId = questionId.slice(prefix.length).trim();
  return priorityId.length > 0 ? priorityId : null;
}

type SupplementaryOption = {
  readonly id: string;
  readonly label: string;
};

type SupplementaryQuestion = {
  readonly prompt: string;
  readonly options: readonly SupplementaryOption[];
};

export const PRIORITY_SUPPLEMENTARY_QUESTIONS: Readonly<
  Record<string, SupplementaryQuestion>
> = Object.freeze({
  energy: {
    prompt: 'Co má pro vás dobře vyřešená energetika přinést?',
    options: [
      { id: 'low-cost', label: 'Nízké provozní náklady' },
      { id: 'independence', label: 'Maximální energetickou nezávislost' },
      { id: 'smart-control', label: 'Chytré řízení provozu' },
    ],
  },
  comfort: {
    prompt: 'Co vám doma nejvíc pomáhá cítit se dobře?',
    options: [
      { id: 'heating-cooling', label: 'Pohodlné vytápění + klimatizace' },
      { id: 'fresh-air', label: 'Zdravý a čerstvý vzduch' },
      { id: 'light-view', label: 'Světlo a výhled přes velká okna' },
    ],
  },
  layout: {
    prompt: 'Co vám musí dobře fungovat v každodenním uspořádání domu?',
    options: [
      { id: 'family-space', label: 'Společný prostor pro rodinu' },
      { id: 'privacy', label: 'Dostatek soukromí' },
      { id: 'flexibility', label: 'Možnost místnosti časem měnit' },
    ],
  },
  design: {
    prompt: 'Jaký dům se vám bude líbit i za mnoho let?',
    options: [
      { id: 'timeless', label: 'Nadčasový vzhled' },
      { id: 'character', label: 'Výrazný charakter' },
      { id: 'materials', label: 'Umírněnost a přírodní materiály' },
    ],
  },
  quality: {
    prompt: 'Podle čeho poznáte, že je dům opravdu kvalitní?',
    options: [
      { id: 'durability-warranty', label: 'Dlouhá životnost a záruka' },
      { id: 'materials-technology', label: 'Použité materiály a technologie' },
      {
        id: 'execution-detail',
        label: 'Kontrola provedení a technické detaily',
      },
    ],
  },
  plot: {
    prompt: 'Jak by měl dům co nejlépe využít váš pozemek?',
    options: [
      { id: 'orientation', label: 'Orientace světových stran' },
      { id: 'access-parking', label: 'Příjezd a garážové stání' },
      { id: 'garden-terrace', label: 'Krásná zahrada s terasou' },
    ],
  },
  realization: {
    prompt: 'Co očekáváte od realizace především?',
    options: [
      { id: 'price-scope', label: 'Garantovaná cena a rozsah' },
      { id: 'build-speed', label: 'Rychlost výstavby' },
      { id: 'customization', label: 'Možnost individuálních úprav' },
    ],
  },
  maintenance: {
    prompt: 'Jak se chcete o dům starat, až v něm budete bydlet?',
    options: [
      { id: 'low-effort', label: 'Minimální údržba s nízkými náklady' },
      { id: 'full-service', label: 'Pravidelný servis s plným komfortem' },
      { id: 'self-service', label: 'Možnost částečné údržby svépomocí' },
    ],
  },
});

const COACH_FAQ_QUESTIONS: Readonly<Record<string, string>> = Object.freeze({
  plot: 'Jak poznám, že je pozemek opravdu vhodný?',
  layout: 'Jak velký dům budu ve skutečnosti potřebovat?',
  privacy: 'Co nejvíce ovlivňuje pocit soukromí?',
  energy: 'Jak poznám, že energie domu bude fungovat i v běžném dni?',
  'operating-costs': 'Co nejvíce ovlivní provozní náklady v čase?',
  design: 'Jak poznám design, který ke mně opravdu patří?',
  quality: 'Kde se kvalita pozná dřív, než se v domě bydlí?',
  investment: 'Jak mám investici do bydlení vnímat bez zbytečného tlaku?',
  maintenance: 'Kolik péče o dům je ještě v pohodě — a kolik už ne?',
  flexibility: 'Jak připravit dům na změny, které ještě neznám?',
});

export function lookupSupplementaryQuestion(priorityId: string): string | null {
  return PRIORITY_SUPPLEMENTARY_QUESTIONS[priorityId]?.prompt ?? null;
}

export function lookupSupplementaryAnswer(
  priorityId: string,
  answerId: string,
): string | null {
  const option = PRIORITY_SUPPLEMENTARY_QUESTIONS[priorityId]?.options.find(
    (item) => item.id === answerId,
  );
  if (option) {
    return option.label;
  }
  const legacyLabels: Readonly<Record<string, string>> = {
    'energy:comfort': 'Každodenní komfort',
  };
  return legacyLabels[`${priorityId}:${answerId}`] ?? null;
}

export function lookupOpenedQuestionLabel(
  questionId: string,
  prompt: string | undefined,
): string {
  const trimmedPrompt = prompt?.trim() ?? '';
  if (trimmedPrompt.length > 0) {
    return trimmedPrompt;
  }
  const coachPrefix = 'coach-faq:';
  if (questionId.startsWith(coachPrefix)) {
    const priorityId = questionId.slice(coachPrefix.length);
    return COACH_FAQ_QUESTIONS[priorityId] ?? questionId;
  }
  return COACH_FAQ_QUESTIONS[questionId] ?? questionId;
}

export function lookupAuditLandLabel(answerId: string): string | null {
  return AUDIT_LAND_LABELS[answerId] ?? null;
}
