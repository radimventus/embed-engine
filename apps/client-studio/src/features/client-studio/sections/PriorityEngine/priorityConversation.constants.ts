import { DECISION_CATEGORIES } from './decision-cards.constants';

/** Soft confirmation pause — used for gate / prep transitions only. */
export const CONIS_MICROINTERACTION_MS = 750;

/** Conis thinking beat before interpretation (presentation only). */
export const CONIS_THINKING_MS = 850;

/**
 * @deprecated Auto quiz advance replaced by user-paced Continue.
 * Kept for compatibility with older tests.
 */
export const CONIS_QUIZ_ADVANCE_MS = 1500;

/**
 * Opening inside Priority — Welcome Bridge already introduced Conis.
 * Keep a short orientation into Priority work (no second self-introduction).
 */
export const PRIORITY_CONVERSATION_INTRO_LINES: readonly string[] =
  Object.freeze(['Teď se zaměříme na vaše priority.'] as const);

export const PRIORITY_CONVERSATION_START_HEADING = 'Začněme';

export const PRIORITY_CONVERSATION_START_LINES = Object.freeze([
  'Označte alespoň tři karty a nastavte jejich intenzitu',
  '(míru důležitosti pro vás).',
  'Ukážu vám pak, co stojí za pozornost právě z tohoto pohledu.',
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
    return 'Máte jednu zvolenou prioritu. Stačí to takto, nebo chcete ještě něco upravit?';
  }
  if (count >= 2 && count <= 4) {
    return `Máte ${count} zvolené priority. Stačí to takto, nebo chcete ještě něco upravit?`;
  }
  return `Máte ${count} zvolených priorit. Stačí to takto, nebo chcete ještě něco upravit?`;
};

export const PRIORITY_CONVERSATION_FINISH_SELECTION = 'Potvrdit nastavení';

export const PRIORITY_CONVERSATION_ADD_MORE = 'Ještě to doplním';

export const PRIORITY_CONVERSATION_PREP_TITLE =
  'Už rozumím tomu, co je pro vás důležité.';

export const PRIORITY_CONVERSATION_PREP_LINES = Object.freeze([
  'Pomozte mi ještě lépe porozumět tomu, jak přemýšlíte — ověřím několik souvislostí.',
] as const);

export const PRIORITY_CONVERSATION_PREP_CONTINUE = 'Pokračovat';

export const PRIORITY_CONVERSATION_ANSWER_ACK = 'Rozumím.';

export const PRIORITY_CONVERSATION_DIALOG_CONTINUE = 'Pokračovat';

export const PRIORITY_CONVERSATION_COMPLETE_PANEL_TITLE =
  'První kapitola je hotová.';

export const PRIORITY_CONVERSATION_COMPLETE_PANEL_LINES = Object.freeze([
  'Teď už vím, na co se u tohoto domu společně podívat.',
] as const);

/** Continues to chapter summary — scroll only on this click (CAP UX3 08). */
export const PRIORITY_CONVERSATION_REVISIT_CONTINUE = 'Pokračovat';

export const PRIORITY_CONVERSATION_NEXT_PATHS_PROMPT = 'Čím budeme pokračovat?';

export const PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL =
  'Otázky z našich priorit';

export const PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL =
  'Pokračovat v rozhovoru';

/** Full-width chapter bridge — value language, never internal „Audit“. */
export const PRIORITY_BRIDGE_TITLE = 'Co pro vás může tento dům znamenat';

export const PRIORITY_PAYOFF_INTRO =
  'Teď můžeme hlouběji prozkoumat, co je z vašeho pohledu nyní důležité.';

export const PRIORITY_PAYOFF_UPPER_LINES = Object.freeze([
  'Máte už jasněji v tom, co od domu očekáváte. Super.',
  'Teď vám rád pomůžu všimnout si věcí, které pro vás mohou být důležité.',
] as const);

export const PRIORITY_PAYOFF_FACTS_HEADING = 'Co dostáváte';

export const PRIORITY_PAYOFF_MEANING_HEADING = 'Co to znamená v běžném životě';

export const PRIORITY_PAYOFF_RECALL_HEADING = 'Všimněte si';

export const PRIORITY_PAYOFF_RECALL_INTRO =
  'Tento prostor už znáte z prohlídky domu.';

export const PRIORITY_PAYOFF_EXPLORATION_BULLETS = Object.freeze([
  'Projděte si OTÁZKY A ODPOVĚDI přizpůsobené vašim prioritám.',
  'Můžeme také DISKUTOVAT PŘES CHAT o čemkoli, co vás k tomuto domu zajímá.',
  'Na konci vám připravím OSOBNÍ SOUHRN s důležitými FAKTY A OBRÁZKY dle vašich priorit.',
] as const);

export const PRIORITY_PAYOFF_PLOT_TRANSITION =
  'V dalším kroku se pak podíváme, jestli už pozemek máte, nebo ho teprve hledáte.';

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
    prompt: 'Co má pro vás dobře vyřešená energetika přinést?',
    options: Object.freeze([
      Object.freeze({ id: 'low-cost', label: 'Nízké provozní náklady' }),
      Object.freeze({
        id: 'independence',
        label: 'Maximální energetickou nezávislost',
      }),
      Object.freeze({ id: 'smart-control', label: 'Chytré řízení provozu' }),
    ]),
  }),
  comfort: Object.freeze({
    priorityId: 'comfort',
    prompt: 'Co vám doma nejvíc pomáhá cítit se dobře?',
    options: Object.freeze([
      Object.freeze({
        id: 'heating-cooling',
        label: 'Pohodlné vytápění + klimatizace',
      }),
      Object.freeze({ id: 'fresh-air', label: 'Zdravý a čerstvý vzduch' }),
      Object.freeze({
        id: 'light-view',
        label: 'Světlo a výhled přes velká okna',
      }),
    ]),
  }),
  layout: Object.freeze({
    priorityId: 'layout',
    prompt: 'Co vám musí dobře fungovat v každodenním uspořádání domu?',
    options: Object.freeze([
      Object.freeze({
        id: 'family-space',
        label: 'Společný prostor pro rodinu',
      }),
      Object.freeze({ id: 'privacy', label: 'Dostatek soukromí' }),
      Object.freeze({
        id: 'flexibility',
        label: 'Možnost místnosti časem měnit',
      }),
    ]),
  }),
  design: Object.freeze({
    priorityId: 'design',
    prompt: 'Jaký dům se vám bude líbit i za mnoho let?',
    options: Object.freeze([
      Object.freeze({ id: 'timeless', label: 'Nadčasový vzhled' }),
      Object.freeze({ id: 'character', label: 'Výrazný charakter domu' }),
      Object.freeze({
        id: 'materials',
        label: 'Umírněnost a přírodní materiály',
      }),
    ]),
  }),
  quality: Object.freeze({
    priorityId: 'quality',
    prompt: 'Podle čeho poznáte, že je dům opravdu kvalitní?',
    options: Object.freeze([
      Object.freeze({
        id: 'durability-warranty',
        label: 'Dlouhá životnost a záruka',
      }),
      Object.freeze({
        id: 'materials-technology',
        label: 'Použité materiály a technologie',
      }),
      Object.freeze({
        id: 'execution-detail',
        label: 'Kontrola provedení a technické detaily',
      }),
    ]),
  }),
  plot: Object.freeze({
    priorityId: 'plot',
    prompt: 'Jak by měl dům co nejlépe využít váš pozemek?',
    options: Object.freeze([
      Object.freeze({ id: 'orientation', label: 'Orientace světových stran' }),
      Object.freeze({
        id: 'access-parking',
        label: 'Příjezd a garážové stání',
      }),
      Object.freeze({
        id: 'garden-terrace',
        label: 'Krásná zahrada s terasou',
      }),
    ]),
  }),
  realization: Object.freeze({
    priorityId: 'realization',
    prompt: 'Co očekáváte od realizace především?',
    options: Object.freeze([
      Object.freeze({ id: 'price-scope', label: 'Garantovaná cena a rozsah' }),
      Object.freeze({ id: 'build-speed', label: 'Rychlost výstavby' }),
      Object.freeze({
        id: 'customization',
        label: 'Možnost individuálních úprav',
      }),
    ]),
  }),
  maintenance: Object.freeze({
    priorityId: 'maintenance',
    prompt: 'Jak se chcete o dům starat, až v něm budete bydlet?',
    options: Object.freeze([
      Object.freeze({
        id: 'low-effort',
        label: 'Minimální údržba s nízkými náklady',
      }),
      Object.freeze({
        id: 'full-service',
        label: 'Pravidelný servis s plným komfortem',
      }),
      Object.freeze({
        id: 'self-service',
        label: 'Možnost částečné údržby svépomocí',
      }),
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

export function dialogQuestionFor(
  priorityId: string,
): PriorityDialogQuestion | null {
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
