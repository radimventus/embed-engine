import { DECISION_CATEGORIES } from './decision-cards.constants';

/** Pause after confirmation before the next mental step (PT-PRIORITY-TUNING-02). */
export const CONIS_MICROINTERACTION_MS = 500;

/** Opening introduction — presence, not instruction. */
export const PRIORITY_CONVERSATION_INTRO_LINES = Object.freeze([
  'Dobrý den, jmenuji se Conis.',
  'Pomohu vám lépe porozumět tomu, co je při výběru domu opravdu důležité.',
  'Občas se vás na něco zeptám, abych lépe porozuměl, jak přemýšlíte.',
] as const);

/** Tinted guidance block under the introduction. */
export const PRIORITY_CONVERSATION_START_LINES = Object.freeze([
  'Začněte alespoň třemi prioritami.',
  'Intenzitu můžete kdykoli upravit.',
] as const);

/** @deprecated Prefer PRIORITY_CONVERSATION_START_LINES */
export const PRIORITY_CONVERSATION_INSTRUCTION_LINES =
  PRIORITY_CONVERSATION_START_LINES;

/** @deprecated Prefer PRIORITY_CONVERSATION_START_LINES */
export const PRIORITY_CONVERSATION_INSTRUCTION =
  PRIORITY_CONVERSATION_START_LINES.join(' ');

export const PRIORITY_CONVERSATION_MINIMUM = 3;

export const PRIORITY_CONVERSATION_MAXIMUM = 10;

export const PRIORITY_DIALOG_QUESTION_COUNT = 3;

export const PRIORITY_CONVERSATION_COLLECT_LINES = Object.freeze([
  'Dobře.',
  'Mám to.',
] as const);

export const PRIORITY_CONVERSATION_COLLECT_HINT =
  'Až budete mít alespoň tři, můžeme jít dál.';

export const PRIORITY_CONVERSATION_GATE_LINES = Object.freeze([
  'Už mám první představu.',
] as const);

export const PRIORITY_CONVERSATION_GATE_PROMPT = (count: number): string => {
  if (count === 1) {
    return 'Máte jednu prioritu. Stačí takto, nebo chcete ještě něco doplnit?';
  }
  if (count >= 2 && count <= 4) {
    return `Máte ${count} priority. Stačí takto, nebo chcete ještě něco doplnit?`;
  }
  return `Máte ${count} priorit. Stačí takto, nebo chcete ještě něco doplnit?`;
};

export const PRIORITY_CONVERSATION_FINISH_SELECTION = 'Stačí takto';

export const PRIORITY_CONVERSATION_ADD_MORE = 'Ještě doplním';

export const PRIORITY_CONVERSATION_PREP_LINES = Object.freeze([
  'Děkuji.',
  'Už rozumím, co je pro vás důležité.',
  'Ještě si ověřím několik souvislostí.',
] as const);

export const PRIORITY_CONVERSATION_PREP_CONTINUE = 'Pojďme dál';

export const PRIORITY_CONVERSATION_ANSWER_ACK = 'Rozumím.';

export const PRIORITY_CONVERSATION_SUMMARY_LINES = Object.freeze([
  'Děkuji.',
  'Teď máme společný základ.',
] as const);

export const PRIORITY_CONVERSATION_NEXT_PATHS_PROMPT =
  'Kde chcete pokračovat?';

export const PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL = 'Časté otázky';

export const PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL = 'Zeptat se mě';

export const PRIORITY_CONVERSATION_PDF_NOTE =
  'Na konci Experience si budete moci stáhnout osobní zprávu.';

export type PriorityDialogOption = {
  readonly id: string;
  readonly label: string;
};

export type PriorityDialogQuestion = {
  readonly priorityId: string;
  readonly prompt: string;
  readonly options: readonly PriorityDialogOption[];
};

/**
 * Short guided questions — 2–3 options each.
 * UX copy only; not Decision Runtime / Strategy.
 */
export const PRIORITY_DIALOG_QUESTIONS: Readonly<
  Record<string, PriorityDialogQuestion>
> = Object.freeze({
  energy: Object.freeze({
    priorityId: 'energy',
    prompt: 'Co je pro vás u energie nejdůležitější?',
    options: Object.freeze([
      Object.freeze({ id: 'low-cost', label: 'nízké náklady' }),
      Object.freeze({ id: 'independence', label: 'nezávislost' }),
      Object.freeze({ id: 'comfort', label: 'komfort' }),
    ]),
  }),
  'operating-costs': Object.freeze({
    priorityId: 'operating-costs',
    prompt: 'U provozních nákladů vás nejvíce zajímá?',
    options: Object.freeze([
      Object.freeze({ id: 'predictability', label: 'předvídatelnost' }),
      Object.freeze({ id: 'low-monthly', label: 'nízké měsíční výdaje' }),
      Object.freeze({ id: 'long-term', label: 'dlouhodobá úspora' }),
    ]),
  }),
  layout: Object.freeze({
    priorityId: 'layout',
    prompt: 'U dispozice je pro vás klíčové?',
    options: Object.freeze([
      Object.freeze({ id: 'day-night', label: 'oddělení dne a noci' }),
      Object.freeze({ id: 'open-space', label: 'otevřený prostor' }),
      Object.freeze({ id: 'flexibility', label: 'flexibilita místností' }),
    ]),
  }),
  privacy: Object.freeze({
    priorityId: 'privacy',
    prompt: 'U soukromí vám nejvíce záleží na?',
    options: Object.freeze([
      Object.freeze({ id: 'neighbors', label: 'odclonění od sousedů' }),
      Object.freeze({ id: 'garden', label: 'klidná zahrada' }),
      Object.freeze({ id: 'interior', label: 'soukromí uvnitř domu' }),
    ]),
  }),
  design: Object.freeze({
    priorityId: 'design',
    prompt: 'U designu je pro vás podstatné?',
    options: Object.freeze([
      Object.freeze({ id: 'timeless', label: 'nadčasovost' }),
      Object.freeze({ id: 'character', label: 'výrazný charakter' }),
      Object.freeze({ id: 'materials', label: 'kvalita materiálů' }),
    ]),
  }),
  quality: Object.freeze({
    priorityId: 'quality',
    prompt: 'U kvality hledáte především?',
    options: Object.freeze([
      Object.freeze({ id: 'durability', label: 'trvanlivost' }),
      Object.freeze({ id: 'detail', label: 'pečlivé detaily' }),
      Object.freeze({ id: 'warranty', label: 'jistotu záruky' }),
    ]),
  }),
  plot: Object.freeze({
    priorityId: 'plot',
    prompt: 'U pozemku je pro vás zásadní?',
    options: Object.freeze([
      Object.freeze({ id: 'orientation', label: 'orientace ke slunci' }),
      Object.freeze({ id: 'size', label: 'velikost pozemku' }),
      Object.freeze({ id: 'access', label: 'přístup a okolí' }),
    ]),
  }),
  investment: Object.freeze({
    priorityId: 'investment',
    prompt: 'U investice je pro vás důležité?',
    options: Object.freeze([
      Object.freeze({ id: 'value-hold', label: 'udržení hodnoty' }),
      Object.freeze({ id: 'budget', label: 'jasný rozpočet' }),
      Object.freeze({ id: 'return', label: 'návratnost' }),
    ]),
  }),
  maintenance: Object.freeze({
    priorityId: 'maintenance',
    prompt: 'U údržby preferujete?',
    options: Object.freeze([
      Object.freeze({ id: 'low-effort', label: 'minimální péči' }),
      Object.freeze({ id: 'predictable', label: 'předvídatelné náklady' }),
      Object.freeze({ id: 'self-service', label: 'svépomocné řešení' }),
    ]),
  }),
  flexibility: Object.freeze({
    priorityId: 'flexibility',
    prompt: 'U flexibility je pro vás důležité?',
    options: Object.freeze([
      Object.freeze({ id: 'lifecycle', label: 'změny v čase' }),
      Object.freeze({ id: 'work-home', label: 'práce z domova' }),
      Object.freeze({ id: 'guests', label: 'prostor pro hosty' }),
    ]),
  }),
});

export function priorityTitleForId(priorityId: string): string {
  return (
    DECISION_CATEGORIES.find((category) => category.id === priorityId)?.title ??
    priorityId
  );
}

export function intensityPercent(importance: number): number {
  return Math.round(Math.min(1, Math.max(0, importance)) * 100);
}

export function dialogQuestionFor(priorityId: string): PriorityDialogQuestion | null {
  return PRIORITY_DIALOG_QUESTIONS[priorityId] ?? null;
}

/**
 * Pick up to 3 priorities for refinement — highest intensity, selection order as tiebreak.
 */
export function pickDialogPriorityIds(
  selectionOrder: readonly string[],
  intensityById: Readonly<Record<string, number>>,
  limit: number = PRIORITY_DIALOG_QUESTION_COUNT,
): string[] {
  return [...selectionOrder]
    .sort((left, right) => {
      const intensityDelta =
        (intensityById[right] ?? 0) - (intensityById[left] ?? 0);
      if (intensityDelta !== 0) {
        return intensityDelta;
      }
      return selectionOrder.indexOf(left) - selectionOrder.indexOf(right);
    })
    .slice(0, limit);
}
