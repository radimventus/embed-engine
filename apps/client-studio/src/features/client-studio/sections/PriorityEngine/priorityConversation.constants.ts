import { DECISION_CATEGORIES } from './decision-cards.constants';

/** Opening instruction — State A (no interpretation). */
export const PRIORITY_CONVERSATION_INSTRUCTION =
  'Vyberte alespoň tři oblasti, které budou nejvíce ovlivňovat vaše budoucí bydlení.';

export const PRIORITY_CONVERSATION_MINIMUM = 3;

export const PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL = 'Pokračovat do FAQ';

export const PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL = 'Zeptat se Conisu';

export const PRIORITY_CONVERSATION_PDF_NOTE =
  'Na konci celé Experience si budete moci stáhnout osobní zprávu s doporučením.';

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

export function dialogQuestionFor(priorityId: string): PriorityDialogQuestion | null {
  return PRIORITY_DIALOG_QUESTIONS[priorityId] ?? null;
}
