import type { DecisionState } from "../decision-state/DecisionState";
import type { Focus } from "../focus/Focus";
import type { Signal } from "../signals/Signal";
import { SignalType } from "../signals/SignalType";
import type {
  Interpretation,
  InterpretationEvent,
  InterpretationPriority,
  RecommendedQuestion,
} from "./Interpretation";

/**
 * Priority ids consumed by Client Studio Priority Engine (vertical slice).
 */
export const INTERPRETATION_PRIORITY_IDS = [
  "energy",
  "operating-costs",
  "layout",
  "privacy",
  "design",
  "quality",
  "plot",
  "investment",
  "maintenance",
  "flexibility",
] as const;

export type InterpretationPriorityId =
  (typeof INTERPRETATION_PRIORITY_IDS)[number];

const BASE_WEIGHT = 0.35;

const PRIORITY_TITLES: Record<InterpretationPriorityId, string> = {
  energy: "Energy",
  "operating-costs": "Operating costs",
  layout: "Layout",
  privacy: "Privacy",
  design: "Design",
  quality: "Quality",
  plot: "Plot",
  investment: "Investment",
  maintenance: "Maintenance",
  flexibility: "Flexibility",
};

type QuestionSeed = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly why: string;
};

const QUESTION_BANK: Record<InterpretationPriorityId, readonly QuestionSeed[]> = {
  energy: [
    {
      id: "energy-heat",
      question: "Jaký je energetický standard a náklady na vytápění?",
      answer:
        "Modulární skladba umožňuje cílit nízkoenergetický provoz — konkrétní bilanci upřesníme podle orientace a skladby obálky.",
      why: "Energy is now a leading priority in your decision filter.",
    },
    {
      id: "energy-solar",
      question: "Lze připravit dům na fotovoltaiku?",
      answer:
        "Ano — střecha a rozvody lze připravit tak, aby FVE byla přirozeným dalším krokem bez zásahů do dispozice.",
      why: "Recommended because you are focusing on technical / energy parameters.",
    },
  ],
  "operating-costs": [
    {
      id: "opex-service",
      question: "Jaké jsou typické provozní a servisní náklady?",
      answer:
        "Provoz držíme predikovatelný modularitou a jednoduchou údržbou — detailní model ukážeme v rozhodnutí o prioritách.",
      why: "Operating costs rose in your Interpretation.",
    },
  ],
  layout: [
    {
      id: "layout-flow",
      question: "Jak spolu fungují denní a noční zóna?",
      answer:
        "Dispozice odděluje společný život od klidu — po prohlídce místností je to přesně to, na co se teď díváte.",
      why: "Because you explored rooms / the floor plan.",
    },
    {
      id: "layout-flex",
      question: "Lze dispozici upravit bez změny celkové stopy?",
      answer:
        "Ano v rámci modulární mřížky — změny zůstávají kontrolované a čitelné.",
      why: "Layout is active in your current Focus.",
    },
  ],
  privacy: [
    {
      id: "privacy-street",
      question: "Jak je řešeno soukromí vůči ulici a sousedům?",
      answer:
        "Orientace oken a vstupních zón chrání intimitu — upravitelná podle pozemku.",
      why: "Privacy became relevant in your decision filter.",
    },
  ],
  design: [
    {
      id: "design-exterior",
      question: "Jaký charakter má exteriér a materiály?",
      answer:
        "Exteriér drží klidnou soudobou řeč — galerie ukazuje přesně ten vizuální tón.",
      why: "Because you opened gallery or media.",
    },
  ],
  quality: [
    {
      id: "quality-build",
      question: "Jak je zajištěna kvalita provedení?",
      answer:
        "Výroba modulů probíhá v kontrolovaném prostředí — méně rizik než čistě staveništní stavba.",
      why: "Quality is part of your elevated priorities.",
    },
  ],
  plot: [
    {
      id: "plot-narrow",
      question: "Hodí se dům i na užší pozemek?",
      answer:
        "Ano — stopa a úrovně lze sladit s pozemkem; právě prohlížíte prostorové úrovně domu.",
      why: "Because you switched floors / spatial levels.",
    },
  ],
  investment: [
    {
      id: "invest-units",
      question: "Jaká je logika návratnosti při více jednotkách?",
      answer:
        "Rozhodnutí o investici navazujeme na vaše priority — ne na obecné marketingové sliby.",
      why: "Investment / financing is your active topic.",
    },
    {
      id: "invest-finance",
      question: "Jak probíhá financování a splátkový scénář?",
      answer:
        "Scénář sestavíme podle vašeho filtru priorit — AI kontext už na to reaguje.",
      why: "Recommended from your current decision focus.",
    },
  ],
  maintenance: [
    {
      id: "maint-care",
      question: "Jak náročná je dlouhodobá údržba?",
      answer:
        "Cílem je nízká zátěž — materiály a detaily volíme s ohledem na životní cyklus.",
      why: "Maintenance appears in your Interpretation.",
    },
  ],
  flexibility: [
    {
      id: "flex-future",
      question: "Jak dům poroste s rodinou v čase?",
      answer:
        "Flexibilita modulů umožňuje fáze — dnešní Focus určuje, co řešíme jako první.",
      why: "Flexibility is elevated in your filter.",
    },
  ],
};

const DEFAULT_QUESTIONS: readonly QuestionSeed[] = [
  {
    id: "default-start",
    question: "Čím mám začít prohlídku domu?",
    answer:
      "Začněte místnostmi a patrem, které vás zajímají — Interpretation podle toho nastaví priority a doporučení.",
    why: "Start here to teach the engine what matters to you.",
  },
  {
    id: "default-priority",
    question: "Jak si nastavím vlastní priority rozhodování?",
    answer:
      "Klikněte na karty priorit nebo procházejte dům — obojí posílá Signaly do stejného DecisionState.",
    why: "Helps you drive the shared Decision Experience.",
  },
];

function weightFor(id: InterpretationPriorityId, focus: Focus): number {
  if (focus.questionId === id) {
    return 1;
  }

  if (id === "layout" && focus.roomId !== undefined) {
    return 0.92;
  }

  if (id === "design" && focus.mediaId !== undefined) {
    return 0.9;
  }

  if (id === "plot" && focus.floorId !== undefined) {
    return 0.88;
  }

  return BASE_WEIGHT;
}

function reasonFor(
  id: InterpretationPriorityId,
  focus: Focus,
  weight: number,
): string | undefined {
  if (weight <= BASE_WEIGHT) {
    return undefined;
  }

  if (focus.questionId === id) {
    return `You selected ${PRIORITY_TITLES[id]} as a decision focus.`;
  }

  if (id === "layout" && focus.roomId !== undefined) {
    return "Because you explored a room / floor plan.";
  }

  if (id === "design" && focus.mediaId !== undefined) {
    return "Because you opened gallery or media.";
  }

  if (id === "plot" && focus.floorId !== undefined) {
    return "Because you switched floors / spatial levels.";
  }

  return undefined;
}

function isHighlighted(id: InterpretationPriorityId, focus: Focus): boolean {
  if (focus.questionId === id) {
    return true;
  }

  if (id === "layout" && focus.roomId !== undefined) {
    return true;
  }

  if (id === "design" && focus.mediaId !== undefined) {
    return true;
  }

  if (id === "plot" && focus.floorId !== undefined) {
    return true;
  }

  return false;
}

function eventLabel(signal: Signal): string {
  const labeled = signal.payload.label;
  if (typeof labeled === "string" && labeled.length > 0) {
    return labeled;
  }

  switch (signal.type) {
    case SignalType.ROOM_VIEWED:
      return typeof signal.payload.roomId === "string"
        ? `Room: ${signal.payload.roomId}`
        : "Room viewed";
    case SignalType.MEDIA_OPENED:
      return typeof signal.payload.mediaId === "string"
        ? `Media: ${signal.payload.mediaId}`
        : "Media opened";
    case SignalType.FLOOR_CHANGED:
      return typeof signal.payload.floorId === "string"
        ? `Floor: ${signal.payload.floorId}`
        : "Floor changed";
    case SignalType.QUESTION_OPENED:
      return typeof signal.payload.questionId === "string"
        ? `Priority: ${signal.payload.questionId}`
        : "Question opened";
    default:
      return signal.type;
  }
}

function projectEvents(signals: readonly Signal[]): readonly InterpretationEvent[] {
  const events = signals.map((signal) =>
    Object.freeze({
      id: signal.id,
      label: eventLabel(signal),
      signalType: signal.type,
      timestamp: signal.timestamp,
    }),
  );

  return Object.freeze(events.slice(-8).reverse());
}

function leadingTopic(
  priorities: readonly InterpretationPriority[],
  focus: Focus,
): InterpretationPriorityId {
  if (
    focus.questionId &&
    (INTERPRETATION_PRIORITY_IDS as readonly string[]).includes(focus.questionId)
  ) {
    return focus.questionId as InterpretationPriorityId;
  }

  const elevated = [...priorities]
    .filter((priority) => priority.weight > BASE_WEIGHT)
    .sort((left, right) => right.weight - left.weight);

  if (elevated[0]) {
    return elevated[0].id as InterpretationPriorityId;
  }

  return "layout";
}

function projectQuestions(
  topic: InterpretationPriorityId,
  priorities: readonly InterpretationPriority[],
): readonly RecommendedQuestion[] {
  const seeds = QUESTION_BANK[topic] ?? DEFAULT_QUESTIONS;
  const fallback = DEFAULT_QUESTIONS;
  const combined = [...seeds, ...fallback].slice(0, 5);
  const topicWeight =
    priorities.find((priority) => priority.id === topic)?.weight ?? BASE_WEIGHT;

  return Object.freeze(
    combined.map((seed, index) =>
      Object.freeze({
        id: seed.id,
        question: seed.question,
        answer: seed.answer,
        topicId: topic,
        why: seed.why,
        highlighted: index === 0 && topicWeight > BASE_WEIGHT,
      }),
    ),
  );
}

function projectConversation(
  topic: InterpretationPriorityId,
  focus: Focus,
  priorities: readonly InterpretationPriority[],
): {
  conversationContext: string;
  recommendations: readonly string[];
  activeTopic: string;
  nextAction: string;
} {
  const title = PRIORITY_TITLES[topic];
  const top = [...priorities]
    .filter((priority) => priority.weight > BASE_WEIGHT)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 3);

  const focusBits: string[] = [];
  if (focus.roomId) {
    focusBits.push(`room ${focus.roomId}`);
  }
  if (focus.floorId) {
    focusBits.push(`floor ${focus.floorId}`);
  }
  if (focus.mediaId) {
    focusBits.push(`media ${focus.mediaId}`);
  }

  const conversationContext =
    focusBits.length > 0
      ? `You are deciding with emphasis on ${title}. Current focus: ${focusBits.join(", ")}.`
      : `You are calibrating priorities. Leading topic: ${title}.`;

  const recommendations = Object.freeze(
    top.map(
      (priority) =>
        `Lean into ${PRIORITY_TITLES[priority.id as InterpretationPriorityId]} (${Math.round(priority.weight * 100)}).`,
    ),
  );

  const nextAction =
    top[0] !== undefined
      ? `Ask about ${PRIORITY_TITLES[top[0].id as InterpretationPriorityId]} — it leads your filter.`
      : "Explore a room or select a priority card to teach the engine.";

  return {
    conversationContext,
    recommendations,
    activeTopic: title,
    nextAction,
  };
}

/**
 * Pure projector: DecisionState → Interpretation.
 * Deterministic. Stateless. Never mutates DecisionState.
 */
export function project(state: DecisionState): Interpretation {
  const unsorted: InterpretationPriority[] = INTERPRETATION_PRIORITY_IDS.map(
    (id) => {
      const weight = weightFor(id, state.focus);

      return {
        id,
        weight,
        reason: reasonFor(id, state.focus, weight),
        highlighted: isHighlighted(id, state.focus),
      };
    },
  );

  const ranked = [...unsorted].sort((left, right) => right.weight - left.weight);
  const priorities: InterpretationPriority[] = unsorted.map((priority) => {
    const rank =
      priority.weight > BASE_WEIGHT
        ? ranked.findIndex((item) => item.id === priority.id) + 1
        : undefined;

    return Object.freeze({
      ...priority,
      rank,
    });
  });

  const frozenPriorities = Object.freeze(priorities);
  const topic = leadingTopic(frozenPriorities, state.focus);
  const conversation = projectConversation(topic, state.focus, frozenPriorities);

  return Object.freeze({
    priorities: frozenPriorities,
    events: projectEvents(state.signals),
    recommendedQuestions: projectQuestions(topic, frozenPriorities),
    conversationContext: conversation.conversationContext,
    recommendations: conversation.recommendations,
    activeTopic: conversation.activeTopic,
    nextAction: conversation.nextAction,
  });
}
