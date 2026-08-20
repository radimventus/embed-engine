/**
 * Canonical Decision Signal identities for Profil zájemce projection.
 * IDs are authority. Labels are lookup — never DOM text.
 */

export const AUDIT_LAND_QUESTION_ID = 'audit.land';
export const AUDIT_LAND_HAS_PLOT = 'owned';
export const AUDIT_LAND_SEARCHING_PLOT = 'seeking';

export const AUDIT_LAND_LABELS: Readonly<Record<string, string>> = Object.freeze({
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
    prompt: 'Co je pro vás u energie nejdůležitější?',
    options: [
      { id: 'low-cost', label: 'Nižší náklady' },
      { id: 'independence', label: 'Větší nezávislost' },
      { id: 'comfort', label: 'Každodenní komfort' },
    ],
  },
  'operating-costs': {
    prompt: 'Jak přemýšlíte o provozních nákladech?',
    options: [
      { id: 'predictability', label: 'Stabilní výdaje' },
      { id: 'low-monthly', label: 'Nízké měsíční náklady' },
      { id: 'long-term', label: 'Úspora v čase' },
    ],
  },
  layout: {
    prompt: 'Jak má dům podporovat váš každodenní život?',
    options: [
      { id: 'day-night', label: 'Oddělený den a noc' },
      { id: 'open-space', label: 'Otevřený společný prostor' },
      { id: 'flexibility', label: 'Místnosti, které se dají měnit' },
    ],
  },
  privacy: {
    prompt: 'Kde je pro vás soukromí nejdůležitější?',
    options: [
      { id: 'neighbors', label: 'Odclonění od sousedů' },
      { id: 'garden', label: 'Klidná zahrada' },
      { id: 'interior', label: 'Soukromí uvnitř domu' },
    ],
  },
  design: {
    prompt: 'Co má design domu vyjádřit?',
    options: [
      { id: 'timeless', label: 'Nadčasový klid' },
      { id: 'character', label: 'Výrazný charakter' },
      { id: 'materials', label: 'Poctivé materiály' },
    ],
  },
  quality: {
    prompt: 'Co pro vás znamená kvalita?',
    options: [
      { id: 'durability', label: 'Trvanlivost' },
      { id: 'detail', label: 'Pečlivé detaily' },
      { id: 'warranty', label: 'Jistotu záruky' },
    ],
  },
  plot: {
    prompt: 'Co je u pozemku pro vás zásadní?',
    options: [
      { id: 'orientation', label: 'Orientace ke slunci' },
      { id: 'size', label: 'Velikost pozemku' },
      { id: 'access', label: 'Přístup a okolí' },
    ],
  },
  investment: {
    prompt: 'Co chcete od investice do bydlení?',
    options: [
      { id: 'value-hold', label: 'Udržet hodnotu' },
      { id: 'budget', label: 'Jasný rozpočet' },
      { id: 'return', label: 'Dlouhodobou jistotu' },
    ],
  },
  maintenance: {
    prompt: 'Jak chcete o dům pečovat?',
    options: [
      { id: 'low-effort', label: 'Co nejméně starostí' },
      { id: 'predictable', label: 'Předvídatelné náklady' },
      { id: 'self-service', label: 'Možnost řešit sám' },
    ],
  },
  flexibility: {
    prompt: 'K čemu má být dům připravený?',
    options: [
      { id: 'lifecycle', label: 'Změny během let' },
      { id: 'work-home', label: 'Práci z domova' },
      { id: 'guests', label: 'Prostor pro hosty' },
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
  return option?.label ?? null;
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
