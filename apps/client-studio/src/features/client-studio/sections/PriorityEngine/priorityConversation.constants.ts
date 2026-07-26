import { DECISION_CATEGORIES } from './decision-cards.constants';

/** Soft confirmation pause — used for gate / prep transitions only. */
export const CONIS_MICROINTERACTION_MS = 750;

/**
 * @deprecated Auto quiz advance replaced by user-paced Continue
 * (PT-PRIORITY-DIALOGUE-01). Kept for compatibility with older tests.
 */
export const CONIS_QUIZ_ADVANCE_MS = 1500;

/** Opening — who Conis is, what follows, without commands. */
export const PRIORITY_CONVERSATION_INTRO_LINES = Object.freeze([
  'Dobrý den.',
  'Jmenuji se Conis.',
  'Jsem tu proto, abych vám pomohl porozumět tomu, jak se rozhodujete o domě.',
] as const);

export const PRIORITY_CONVERSATION_START_HEADING = 'Začněme společně';

export const PRIORITY_CONVERSATION_START_LINES = Object.freeze([
  'Zkusme společně zjistit, co je pro vás při výběru domu opravdu důležité.',
  'Vlevo jsou témata — označíme alespoň tři, která k vám patří.',
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
  'Už vidím, kudy vaše uvažování míří.',
] as const);

export const PRIORITY_CONVERSATION_COLLECT_HINT =
  'Až budeme mít alespoň tři priority, můžeme jít o krok dál.';

export const PRIORITY_CONVERSATION_GATE_LINES = Object.freeze([
  'Už mám první představu o tom, jak přemýšlíte.',
] as const);

export const PRIORITY_CONVERSATION_GATE_PROMPT = (count: number): string => {
  if (count === 1) {
    return 'Máte jednu prioritu. Stačí nám to takto, nebo chcete ještě něco doplnit?';
  }
  if (count >= 2 && count <= 4) {
    return `Máte ${count} priority. Stačí nám to takto, nebo chcete ještě něco doplnit?`;
  }
  return `Máte ${count} priorit. Stačí nám to takto, nebo chcete ještě něco doplnit?`;
};

export const PRIORITY_CONVERSATION_FINISH_SELECTION = 'Pojďme s tímto dál';

export const PRIORITY_CONVERSATION_ADD_MORE = 'Ještě něco doplním';

export const PRIORITY_CONVERSATION_PREP_LINES = Object.freeze([
  'Už rozumím, co je pro vás důležité.',
  'Pomozte mi lépe porozumět tomu, jak přemýšlíte — ověřím ještě několik souvislostí.',
] as const);

export const PRIORITY_CONVERSATION_PREP_CONTINUE = 'Pojďme dál';

export const PRIORITY_CONVERSATION_ANSWER_ACK = 'Rozumím.';

export const PRIORITY_CONVERSATION_DIALOG_CONTINUE = 'Pokračovat';

export const PRIORITY_CONVERSATION_SUMMARY_LINES = Object.freeze([
  'Teď už vám lépe rozumím.',
  'Můžeme jít více do hloubky.',
] as const);

export const PRIORITY_CONVERSATION_AUDIT_HEADING = 'Audit jako další společná práce';

export const PRIORITY_CONVERSATION_AUDIT_LINES = Object.freeze([
  'Audit nevzniká jako další formulář.',
  'Vzniká proto, abychom ověřili vaše priority na konkrétním domě a pozemku.',
  'Můžeme validovat váš pozemek, pomoci s výběrem pozemku, nebo pokračovat ve společné práci — podle toho, kde právě jste.',
] as const);

export const PRIORITY_CONVERSATION_CONTINUE_AUDIT = 'Pokračovat v Auditu';

export const PRIORITY_CONVERSATION_NEXT_PATHS_PROMPT =
  'Nebo nejdřív otevřeme otázky či krátký rozhovor:';

export const PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL = 'Otázky z našich priorit';

export const PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL = 'Pokračovat v rozhovoru';

export const PRIORITY_CONVERSATION_PDF_NOTE =
  'Na konci Experience obdržíte osobní PDF — priority, způsob rozhodování, doporučení a shrnutí našeho rozhovoru.';

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
 * Short guided questions — coaching phrasing (2–3 options).
 * UX copy only; not Decision Runtime / Strategy.
 */
export const PRIORITY_DIALOG_QUESTIONS: Readonly<
  Record<string, PriorityDialogQuestion>
> = Object.freeze({
  energy: Object.freeze({
    priorityId: 'energy',
    prompt: 'Co je pro vás u energie nejdůležitější?',
    options: Object.freeze([
      Object.freeze({ id: 'low-cost', label: 'Nižší náklady' }),
      Object.freeze({ id: 'independence', label: 'Větší nezávislost' }),
      Object.freeze({ id: 'comfort', label: 'Každodenní komfort' }),
    ]),
  }),
  'operating-costs': Object.freeze({
    priorityId: 'operating-costs',
    prompt: 'Jak přemýšlíte o provozních nákladech?',
    options: Object.freeze([
      Object.freeze({ id: 'predictability', label: 'Stabilní výdaje' }),
      Object.freeze({ id: 'low-monthly', label: 'Nízké měsíční náklady' }),
      Object.freeze({ id: 'long-term', label: 'Úspora v čase' }),
    ]),
  }),
  layout: Object.freeze({
    priorityId: 'layout',
    prompt: 'Jak má dům podporovat váš každodenní život?',
    options: Object.freeze([
      Object.freeze({ id: 'day-night', label: 'Oddělený den a noc' }),
      Object.freeze({ id: 'open-space', label: 'Otevřený společný prostor' }),
      Object.freeze({ id: 'flexibility', label: 'Místnosti, které se dají měnit' }),
    ]),
  }),
  privacy: Object.freeze({
    priorityId: 'privacy',
    prompt: 'Kde je pro vás soukromí nejdůležitější?',
    options: Object.freeze([
      Object.freeze({ id: 'neighbors', label: 'Odclonění od sousedů' }),
      Object.freeze({ id: 'garden', label: 'Klidná zahrada' }),
      Object.freeze({ id: 'interior', label: 'Soukromí uvnitř domu' }),
    ]),
  }),
  design: Object.freeze({
    priorityId: 'design',
    prompt: 'Co má design domu vyjádřit?',
    options: Object.freeze([
      Object.freeze({ id: 'timeless', label: 'Nadčasový klid' }),
      Object.freeze({ id: 'character', label: 'Výrazný charakter' }),
      Object.freeze({ id: 'materials', label: 'Poctivé materiály' }),
    ]),
  }),
  quality: Object.freeze({
    priorityId: 'quality',
    prompt: 'Co pro vás znamená kvalita?',
    options: Object.freeze([
      Object.freeze({ id: 'durability', label: 'Trvanlivost' }),
      Object.freeze({ id: 'detail', label: 'Pečlivé detaily' }),
      Object.freeze({ id: 'warranty', label: 'Jistotu záruky' }),
    ]),
  }),
  plot: Object.freeze({
    priorityId: 'plot',
    prompt: 'Co je u pozemku pro vás zásadní?',
    options: Object.freeze([
      Object.freeze({ id: 'orientation', label: 'Orientace ke slunci' }),
      Object.freeze({ id: 'size', label: 'Velikost pozemku' }),
      Object.freeze({ id: 'access', label: 'Přístup a okolí' }),
    ]),
  }),
  investment: Object.freeze({
    priorityId: 'investment',
    prompt: 'Co chcete od investice do bydlení?',
    options: Object.freeze([
      Object.freeze({ id: 'value-hold', label: 'Udržet hodnotu' }),
      Object.freeze({ id: 'budget', label: 'Jasný rozpočet' }),
      Object.freeze({ id: 'return', label: 'Dlouhodobou jistotu' }),
    ]),
  }),
  maintenance: Object.freeze({
    priorityId: 'maintenance',
    prompt: 'Jak chcete o dům pečovat?',
    options: Object.freeze([
      Object.freeze({ id: 'low-effort', label: 'Co nejméně starostí' }),
      Object.freeze({ id: 'predictable', label: 'Předvídatelné náklady' }),
      Object.freeze({ id: 'self-service', label: 'Možnost řešit sám' }),
    ]),
  }),
  flexibility: Object.freeze({
    priorityId: 'flexibility',
    prompt: 'K čemu má být dům připravený?',
    options: Object.freeze([
      Object.freeze({ id: 'lifecycle', label: 'Změny během let' }),
      Object.freeze({ id: 'work-home', label: 'Práci z domova' }),
      Object.freeze({ id: 'guests', label: 'Prostor pro hosty' }),
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
