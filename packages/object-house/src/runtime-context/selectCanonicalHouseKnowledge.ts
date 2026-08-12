import type { HouseKnowledgeAtom } from '../knowledge/houseKnowledgeTypes';
import type {
  HousePriority,
  HousePriorityFaqItem,
} from '../priority-faq/housePriorityFaqTypes';
import type { CanonicalHouseRuntimeContext } from './canonicalHouseRuntimeContext';

const HOUSE_PRIORITY_BY_RUNTIME_PRIORITY: Readonly<
  Record<string, HousePriority>
> = {
  plot: 'LAND',
  land: 'LAND',
  layout: 'LAYOUT',
  privacy: 'PRIVACY',
  energy: 'ENERGY',
  'operating-costs': 'OPERATING_COSTS',
  design: 'DESIGN',
  quality: 'QUALITY',
  investment: 'INVESTMENT',
  maintenance: 'MAINTENANCE',
  flexibility: 'FLEXIBILITY',
};

const SOURCE_TOPICS_BY_RUNTIME_PRIORITY: Readonly<
  Record<string, readonly string[]>
> = {
  plot: ['pozemek'],
  land: ['pozemek'],
  layout: ['dispozice'],
  privacy: ['soukromí'],
  energy: ['energie'],
  'operating-costs': ['provozní-náklady'],
  design: ['design'],
  quality: ['kvalita'],
  investment: ['investice'],
  maintenance: ['údržba'],
  flexibility: ['flexibilita'],
};

export type CanonicalHouseKnowledgeSelection = {
  /** Canonical source identity, never the materialized Runtime House identity. */
  readonly canonicalHouseId: string;
  /** Source-backed facts relevant to the selected priorities. */
  readonly facts: readonly HouseKnowledgeAtom[];
  /** Practical meanings authored with the facts, never inferred from visitor intent. */
  readonly interpretations: readonly CanonicalHouseFactInterpretation[];
  /** Source constraints and prohibited conclusions for the selected priorities. */
  readonly guardrails: readonly string[];
  /** Advisory FAQ is already bounded by source-linked constraints and provenance. */
  readonly priorityFaq: readonly HousePriorityFaqItem[];
};

export type CanonicalHouseFactInterpretation = {
  readonly factId: string;
  readonly text: string;
};

export type CanonicalHouseKnowledgeEntry = {
  readonly id: string;
  readonly text: string;
};

/**
 * Formats only source-backed statements and their constraints for a downstream
 * knowledge consumer. It intentionally emits no media reference or inference.
 */
export function canonicalHouseKnowledgeEntries(
  selection: CanonicalHouseKnowledgeSelection,
): readonly CanonicalHouseKnowledgeEntry[] {
  const interpretationByFactId = new Map(
    selection.interpretations.map((item) => [item.factId, item.text]),
  );

  return [
    ...selection.facts.map((fact) => ({
      id: fact.id,
      text: [
        fact.statement,
        interpretationByFactId.get(fact.id) ?? '',
        ...fact.constraints,
        ...(fact.unsupportedConclusions ?? []),
      ]
        .filter(Boolean)
        .join(' '),
    })),
    ...selection.guardrails.map((text, index) => ({
      id: `guardrail:${index}`,
      text,
    })),
  ];
}

/**
 * Projects canonical House knowledge for actual Runtime priorities only.
 *
 * FAQ-linked facts are preferred. When they do not provide a complete payoff,
 * related payoff-ready atoms, then other canonical House atoms, may complete it.
 * This keeps scope, constraints, and guardrails intact and deliberately does not
 * infer a Tour image: the canonical Knowledge model has no image annotation.
 */
export function selectCanonicalHouseKnowledge(
  context: CanonicalHouseRuntimeContext,
  runtimePriorityIds: readonly string[],
): CanonicalHouseKnowledgeSelection {
  const priorities = new Set(
    runtimePriorityIds
      .map((priorityId) => HOUSE_PRIORITY_BY_RUNTIME_PRIORITY[priorityId])
      .filter((priority): priority is HousePriority => priority !== undefined),
  );
  const priorityFaq = context.priorityFaq.filter((item) =>
    priorities.has(item.priority),
  );
  const atomIds = new Set(
    priorityFaq.flatMap((item) => item.knowledgeAtomIds),
  );
  const linkedKnowledge = context.knowledge.filter((atom) => atomIds.has(atom.id));
  const sourceTopics = new Set(
    runtimePriorityIds.flatMap(
      (priorityId) => SOURCE_TOPICS_BY_RUNTIME_PRIORITY[priorityId] ?? [],
    ),
  );
  const isCurrentFact = (atom: HouseKnowledgeAtom): boolean =>
    atom.temporalStatus === 'CURRENT' &&
    atom.category !== 'guardrail' &&
    (atom.scope === 'PRODUCT' || atom.scope === 'DSE_KNOW_HOW');
  const isPayoffReady = (atom: HouseKnowledgeAtom): boolean =>
    isCurrentFact(atom) &&
    atom.factPoint !== undefined &&
    atom.interpretationPoint !== undefined &&
    atom.safeInterpretation !== undefined;
  const priorityIndex = (atom: HouseKnowledgeAtom): number =>
    runtimePriorityIds.findIndex((priorityId) =>
      (SOURCE_TOPICS_BY_RUNTIME_PRIORITY[priorityId] ?? []).some((topic) =>
        atom.relatedTopics.includes(topic),
      ),
    );
  const directFacts = linkedKnowledge
    .filter(isCurrentFact)
    .sort((left, right) => priorityIndex(left) - priorityIndex(right));
  const payoffReadyFallbacks = context.knowledge.filter(
    (atom) =>
      !atomIds.has(atom.id) &&
      isPayoffReady(atom) &&
      atom.relatedTopics.some((topic) => sourceTopics.has(topic)),
  );
  const fallbackIds = new Set(payoffReadyFallbacks.map((atom) => atom.id));
  const generalPayoffFallbacks = context.knowledge.filter(
    (atom) =>
      !atomIds.has(atom.id) &&
      !fallbackIds.has(atom.id) &&
      isPayoffReady(atom),
  );
  const facts = [
    ...directFacts,
    ...payoffReadyFallbacks,
    ...generalPayoffFallbacks,
  ];
  const guardrails = [
    ...new Set(
      linkedKnowledge.flatMap((atom) => [
        ...atom.constraints,
        ...(atom.unsupportedConclusions ?? []),
      ]),
    ),
  ];

  return {
    canonicalHouseId: context.identity.houseId,
    facts,
    interpretations: facts
      .filter((fact) => fact.safeInterpretation !== undefined)
      .map((fact) => ({
        factId: fact.id,
        text: fact.safeInterpretation!,
      })),
    guardrails,
    priorityFaq,
  };
}
