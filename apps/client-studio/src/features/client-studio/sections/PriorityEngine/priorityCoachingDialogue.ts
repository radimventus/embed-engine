/**
 * Coaching dialogue copy — presentation only (PT-PRIORITY-DIALOGUE-01).
 * Conis coaches understanding; never commands or sells.
 */

import { DECISION_CATEGORIES } from './decision-cards.constants';
import {
  dialogQuestionFor,
  priorityTitleForId,
  type PriorityDialogQuestion,
} from './priorityConversation.constants';
import type { PriorityConversationPhase } from './priorityConversationProgress';

/** Soft progress cue — feeling of advance, not gamification. */
export function coachingProgressPercent(input: {
  readonly phase: PriorityConversationPhase;
  readonly selectedCount: number;
  readonly dialogAnswered: number;
  readonly dialogTotal: number;
  readonly isInterpreting: boolean;
  readonly isThinking?: boolean;
}): number {
  const {
    phase,
    selectedCount,
    dialogAnswered,
    dialogTotal,
    isInterpreting,
    isThinking = false,
  } = input;

  switch (phase) {
    case 'instruction':
      return 5;
    case 'collecting':
      return Math.min(25, 10 + selectedCount * 5);
    case 'collection-gate':
      return 30;
    case 'prep':
      return 40;
    case 'dialog': {
      if (dialogTotal <= 0) {
        return 45;
      }
      const answered =
        isInterpreting || isThinking
          ? Math.max(0, dialogAnswered - (isInterpreting ? 1 : 0))
          : dialogAnswered;
      const base = 45 + Math.round((answered / dialogTotal) * 40);
      if (isThinking) {
        return Math.min(84, base + 3);
      }
      return isInterpreting ? Math.min(84, base + 5) : Math.min(84, base);
    }
    case 'complete':
      return 100;
    default:
      return 5;
  }
}

export function formatPriorityListCs(titles: readonly string[]): string {
  if (titles.length === 0) {
    return '';
  }
  if (titles.length === 1) {
    return titles[0]!;
  }
  if (titles.length === 2) {
    return `${titles[0]} a ${titles[1]}`;
  }
  return `${titles.slice(0, -1).join(', ')} a ${titles[titles.length - 1]}`;
}

/** Why Conis asks — shown before each dialog question. */
export const PRIORITY_QUESTION_INTENT: Readonly<Record<string, string>> =
  Object.freeze({
    energy:
      'Tahle otázka mi pomůže pochopit, co pro vás znamená energie v každodenním životě.',
    'operating-costs':
      'Tahle otázka mi pomůže pochopit, jak přemýšlíte o nákladech v čase.',
    layout:
      'Tahle otázka mi pomůže pochopit, jak má dům podporovat váš denní rytmus.',
    privacy:
      'Tahle otázka mi pomůže pochopit, co pro vás znamená soukromí.',
    design:
      'Tahle otázka mi pomůže pochopit, jaký charakter domu k vám patří.',
    quality:
      'Tahle otázka mi pomůže pochopit, kde pro vás začíná pocit kvality.',
    plot:
      'Tahle otázka mi pomůže pochopit, co je pro vás u pozemku zásadní.',
    investment:
      'Tahle otázka mi pomůže pochopit, jak vnímáte dlouhodobou jistotu rozhodnutí.',
    maintenance:
      'Tahle otázka mi pomůže pochopit, kolik péče o dům chcete ve svém životě mít.',
    flexibility:
      'Tahle otázka mi pomůže pochopit, jak připravený má dům být na změny.',
  });

/** Soft interpretations after each option — Conis thinking, not verdicts. */
export const PRIORITY_ANSWER_INTERPRETATION: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = Object.freeze({
  energy: Object.freeze({
    'low-cost':
      'Zdá se, že vás u energie nejvíce zajímá, aby dům zbytečně nezatěžoval rozpočet.',
    independence:
      'Zdá se, že vám záleží na větší nezávislosti — méně spoléhat na vnější systémy.',
    comfort:
      'Zdá se, že energii vnímáte hlavně skrze každodenní komfort bydlení.',
  }),
  'operating-costs': Object.freeze({
    predictability:
      'Zdá se, že je pro vás důležitější klid z předvídatelných výdajů než honba za minimem.',
    'low-monthly':
      'Zdá se, že chcete držet měsíční náklady co nejníže — a mít jistotu v běžném provozu.',
    'long-term':
      'Zdá se, že přemýšlíte v delším horizontu — úspora, která dává smysl v čase.',
  }),
  layout: Object.freeze({
    'day-night':
      'Zdá se, že vám vyhovuje jasné oddělení denního života a odpočinku.',
    'open-space':
      'Zdá se, že je pro vás důležitý společný prostor, kde se rodina potkává.',
    flexibility:
      'Zdá se, že chcete dispozici, která se umí přizpůsobit — ne pevný scénář.',
  }),
  privacy: Object.freeze({
    neighbors:
      'Zdá se, že soukromí pro vás začíná odcloněním od okolí a sousedů.',
    garden:
      'Zdá se, že klid venku — v zahradě — je pro vás stejně důležitý jako interiér.',
    interior:
      'Zdá se, že soukromí hledáte především uvnitř domu, mezi místnostmi.',
  }),
  design: Object.freeze({
    timeless:
      'Zdá se, že vám blíže je nadčasový klid než výrazná móda.',
    character:
      'Zdá se, že dům má mít charakter — aby bylo poznat, že patří právě vám.',
    materials:
      'Zdá se, že kvalitu designu vnímáte skrze materiály a jejich poctivost.',
  }),
  quality: Object.freeze({
    durability:
      'Zdá se, že kvalita pro vás znamená především trvanlivost v čase.',
    detail:
      'Zdá se, že si všímáte detailů — tam, kde se pozná pečlivá práce.',
    warranty:
      'Zdá se, že jistotu kvality hledáte i v tom, co je za domem zaručeno.',
  }),
  plot: Object.freeze({
    orientation:
      'Zdá se, že u pozemku je pro vás klíčová orientace a světlo.',
    size:
      'Zdá se, že velikost pozemku je pro vás zásadní součást rozhodnutí.',
    access:
      'Zdá se, že stejně jako samotný pozemek vnímáte přístup a okolí.',
  }),
  investment: Object.freeze({
    'value-hold':
      'Zdá se, že investici vnímáte jako udržení hodnoty — ne jako spekulaci.',
    budget:
      'Zdá se, že potřebujete jasný rámec rozpočtu, abyste se mohli rozhodnout v klidu.',
    return:
      'Zdá se, že hledáte dlouhodobou jistotu spíš než krátkodobý efekt.',
  }),
  maintenance: Object.freeze({
    'low-effort':
      'Zdá se, že chcete dům, který vám v životě ubere starosti, ne přidá.',
    predictable:
      'Zdá se, že u údržby je pro vás důležitá předvídatelnost nákladů i práce.',
    'self-service':
      'Zdá se, že chcete mít možnost některé věci řešit sami — s přehledem.',
  }),
  flexibility: Object.freeze({
    lifecycle:
      'Zdá se, že dům má umět růst s vámi — přes změny během let.',
    'work-home':
      'Zdá se, že je pro vás důležité, aby dům unesl i práci z domova.',
    guests:
      'Zdá se, že počítáte s prostorem pro hosty — dům jako místo setkávání.',
  }),
});

export function questionIntentFor(priorityId: string): string {
  return (
    PRIORITY_QUESTION_INTENT[priorityId] ??
    'Tahle otázka mi pomůže lépe porozumět tomu, jak přemýšlíte.'
  );
}

export function interpretationFor(
  priorityId: string,
  optionId: string,
): string {
  const byOption = PRIORITY_ANSWER_INTERPRETATION[priorityId];
  const specific = byOption?.[optionId];
  if (specific) {
    return specific;
  }
  const question = dialogQuestionFor(priorityId);
  const option = question?.options.find((item) => item.id === optionId);
  if (option) {
    return `Rozumím. ${option.label} — to mi pomáhá lépe vidět, jak přemýšlíte.`;
  }
  return 'Rozumím. Tohle mi pomáhá lépe vidět, jak přemýšlíte.';
}

export type PriorityHypothesisSummary = {
  readonly title: string;
  readonly lead: string;
  readonly prioritiesLine: string;
  readonly pictureLine: string;
  readonly thanksLine: string;
};

export function buildPriorityHypothesisSummary(input: {
  readonly tags: readonly { readonly id: string; readonly title: string }[];
  readonly answers: Readonly<Record<string, string>>;
}): PriorityHypothesisSummary {
  const titles = input.tags.map((tag) => tag.title);
  const list = formatPriorityListCs(titles);
  const pictureParts: string[] = [];

  for (const [priorityId, optionId] of Object.entries(input.answers)) {
    const question = dialogQuestionFor(priorityId);
    const option = question?.options.find((item) => item.id === optionId);
    const title = priorityTitleForId(priorityId);
    if (option) {
      pictureParts.push(`${title.toLowerCase()}: ${option.label.toLowerCase()}`);
    }
  }

  const picture =
    pictureParts.length > 0
      ? `Zdá se, že ve vašem rozhodování hraje roli především ${pictureParts.join('; ')}.`
      : 'První obraz rozhodování se teprve rýsuje — a to je v pořádku.';

  return {
    title: 'Už rozumím tomu, co je pro vás důležité.',
    lead: 'Děkuji.',
    prioritiesLine:
      list.length > 0
        ? `Vaše hlavní priority teď vnímám jako ${list}.`
        : 'Už mám první obrys vašich priorit.',
    pictureLine: picture,
    thanksLine:
      'Díky vašim odpovědím už dokážu připravit přesnější doporučení — jako první odhad, ne jako hotový závěr.',
  };
}

/** Natural FAQ titles — continuation of Conis dialogue, not a database. */
export const PRIORITY_COACH_FAQ: Readonly<
  Record<string, { readonly question: string; readonly answer: string }>
> = Object.freeze({
  plot: Object.freeze({
    question: 'Jak poznám, že je pozemek opravdu vhodný?',
    answer:
      'Vhodný pozemek není jen o metrech. Společně ověříme orientaci, okolí a to, jak pozemek ladí s tím, co je pro vás důležité.',
  }),
  layout: Object.freeze({
    question: 'Jak velký dům budu ve skutečnosti potřebovat?',
    answer:
      'Velikost dává smysl až ve vztahu k tomu, jak žijete. Dispozice ukáže, které místnosti potřebujete denně — a které jen občas.',
  }),
  privacy: Object.freeze({
    question: 'Co nejvíce ovlivňuje pocit soukromí?',
    answer:
      'Soukromí vzniká z odstupu, výhledů i vnitřního uspořádání. V dalším kroku můžeme ověřit, kde je pro vás citlivé právě teď.',
  }),
  energy: Object.freeze({
    question: 'Jak poznám, že energie domu bude fungovat i v běžném dni?',
    answer:
      'Energie není jen číslo na štítku. Záleží na tom, jestli hledáte úsporu, nezávislost, nebo komfort — a jak se to potká s domem.',
  }),
  'operating-costs': Object.freeze({
    question: 'Co nejvíce ovlivní provozní náklady v čase?',
    answer:
      'Provozní náklady rostou z návyků i z domu samotného. Další krok pomůže oddělit to, co můžete ovlivnit hned, od dlouhodobých souvislostí.',
  }),
  design: Object.freeze({
    question: 'Jak poznám design, který ke mně opravdu patří?',
    answer:
      'Design není o trendu. Je o charakteru, materiálech a klidu, který v domě hledáte. Další krok to může ověřit na konkrétním domě.',
  }),
  quality: Object.freeze({
    question: 'Kde se kvalita pozná dřív, než se v domě bydlí?',
    answer:
      'Kvalita se často ukáže v detailech, trvanlivosti a jistotě. Společně pojmenujeme, co je pro vás „dost dobré“ — a co už ne.',
  }),
  investment: Object.freeze({
    question: 'Jak mám investici do bydlení vnímat bez zbytečného tlaku?',
    answer:
      'Investice je rozhodnutí o jistotě v čase. Společně oddělíme rozpočet, hodnotu a to, co chcete chránit dlouhodobě.',
  }),
  maintenance: Object.freeze({
    question: 'Kolik péče o dům je ještě v pohodě — a kolik už ne?',
    answer:
      'Údržba má sedět k vašemu životu. V dalším kroku můžeme ověřit, kde chcete mít klid — a kde vám nevadí vlastní zapojení.',
  }),
  flexibility: Object.freeze({
    question: 'Jak připravit dům na změny, které ještě neznám?',
    answer:
      'Flexibilita je o prostoru, který unese práci, hosty i životní etapy. Společně uvidíme, kde dům nabízí rezervu — a kde je pevný.',
  }),
});

export type CoachFaqItem = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
};

export function coachFaqItemsFromPriorities(
  priorityIds: readonly string[],
): readonly CoachFaqItem[] {
  const ordered =
    priorityIds.length > 0
      ? priorityIds
      : DECISION_CATEGORIES.slice(0, 3).map((category) => category.id);

  const items: CoachFaqItem[] = [];
  const seen = new Set<string>();

  for (const id of ordered) {
    if (seen.has(id)) {
      continue;
    }
    const entry = PRIORITY_COACH_FAQ[id];
    if (!entry) {
      continue;
    }
    seen.add(id);
    items.push(
      Object.freeze({
        id: `coach-faq:${id}`,
        question: entry.question,
        answer: entry.answer,
      }),
    );
  }

  return Object.freeze(items);
}

export function coachChatOpeningFromPriorities(
  priorityIds: readonly string[],
): string | null {
  if (priorityIds.length === 0) {
    return null;
  }

  const titles = priorityIds
    .slice(0, 5)
    .map((id) => priorityTitleForId(id));
  const list = formatPriorityListCs(titles);

  return [
    `Z našeho dosavadního rozhovoru vnímám, že jsou pro vás nejdůležitější ${list}.`,
    '',
    'To je zajímavá kombinace — říká mi něco o tom, jak přemýšlíte o domě.',
    '',
    'Rád bych to s vámi ještě krátce doladil.',
    '',
    'Co z toho je pro vás při skutečném výběru domu úplně nejdůležitější?',
  ].join('\n');
}

export function withQuestionIntent(
  question: PriorityDialogQuestion,
): PriorityDialogQuestion & { readonly intent: string } {
  return {
    ...question,
    intent: questionIntentFor(question.priorityId),
  };
}
