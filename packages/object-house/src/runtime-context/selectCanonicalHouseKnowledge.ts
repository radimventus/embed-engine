import { clientHouseFactText, clientHouseKnowledgeText } from '../knowledge/clientHouseKnowledgeText';
import type { HouseKnowledgeAtom } from '../knowledge/houseKnowledgeTypes';
import type {
  HousePriority,
  HousePriorityFaqItem,
} from '../priority-faq/housePriorityFaqTypes';
import type { CanonicalHouseRuntimeContext } from './canonicalHouseRuntimeContext';

const SEARCH_STOPWORDS = new Set(['jaky','jaka','jake','jako','ktery','ktera','ktere','tento','tohot','tomto','dome','domu','dum','jsem','jsou','bude','bych','nebo','pro','prosim','muze','muzu','mam','ma','jak','co','je','se','si','na','do','ve','od','za','a','i','s','v','o','u','to']);
function knowledgeTerms(text: string): string[] {
  return [...new Set(text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/\b(tri|trech|trem|tremi)\b/g,' tri ').replace(/\bdet\w*/g,' deti ')
    .replace(/\bprac(ujeme|ovat|uji|ovna|ovnu|ovny|ovnou)\b/g,' prace ')
    .replace(/m²|m2/g,' ploch ').replace(/(topen\w*|topit)/g,' vytapeni ')
    .replace(/zatepl\w*/g,' izolace ').match(/[a-z0-9]+/g) ?? [])]
    .filter(term => !SEARCH_STOPWORDS.has(term) && term.length > 2).map(term => term.slice(0,5));
}

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
  readonly modelConstraints?: readonly string[];
  readonly provenance?: { readonly sourceId: string; readonly kind: string; readonly label?: string; readonly editorialNotes?: readonly string[] };
};

/**
 * Formats only source-backed statements and their constraints for a downstream
 * knowledge consumer. It intentionally emits no media reference or inference.
 */
export function canonicalHouseKnowledgeEntries(
  selection: CanonicalHouseKnowledgeSelection,
  question?: string,
): readonly CanonicalHouseKnowledgeEntry[] {
  // Search the complete House knowledge, independently of selected priorities.
  // Keep each answer with its question, provenance and local constraints.
  if (question !== undefined) {
    const terms = knowledgeTerms(question);
    const records = selection.facts.map(fact => ({ fact,
      aliases: knowledgeTerms((fact.retrievalAliases ?? []).join(' ')),
      subject: knowledgeTerms(fact.subject), body: knowledgeTerms(fact.statement) }));
    const frequencies = new Map<string, number>();
    for (const record of records) {
      for (const term of new Set([...record.subject, ...record.body, ...record.aliases])) {
        frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
      }
    }
    const ranked = records.map(record => ({ ...record, score: terms.reduce((sum, term) => {
      const frequency = frequencies.get(term) ?? 0;
      const weight = Math.log(1 + records.length / (1 + frequency));
      return sum + weight * (record.subject.includes(term) ? 5 : record.aliases.includes(term) ? 5 : record.body.includes(term) ? 1 : 0);
    }, 0) })).filter(record => record.score > 0).sort((a,b) => b.score-a.score);
    const entries: CanonicalHouseKnowledgeEntry[] = [];
    let length = 0;
    for (const { fact } of ranked) {
      const entry = serializeFact(fact);
      const size = JSON.stringify(entry).length;
      if (length + size > 14000) continue;
      entries.push(entry); length += size;
      if (entries.length === 12) break;
    }
    return entries;
  }
  return [
    ...selection.facts.map(fact => serializeFact(fact)),
    ...(selection.guardrails.length ? [{id: 'guardrails', text: '', modelConstraints: selection.guardrails}] : []),
  ];
}

function serializeFact(fact: HouseKnowledgeAtom): CanonicalHouseKnowledgeEntry {
  return {
    id: fact.id,
    text: [...new Set([clientHouseKnowledgeText(fact.subject), clientHouseFactText(fact),
      fact.safeInterpretation ? clientHouseKnowledgeText(fact.safeInterpretation) : ''])].filter(Boolean).join('\n'),
    provenance: fact.source,
    modelConstraints: [...new Set([...fact.constraints, ...(fact.unsupportedConclusions ?? [])])],
  };
}

/**
 * Projects every safely usable CURRENT House fact for an explicit Chat question.
 *
 * Priority may influence advisory relevance, FAQ and recommendation only. It must
 * never censor a source-backed fact that belongs to the active canonical House.
 */
export function selectCanonicalChatHouseKnowledge(
  context: CanonicalHouseRuntimeContext,
): CanonicalHouseKnowledgeSelection {
  const facts = context.knowledge.filter(
    (atom) =>
      atom.houseId === context.identity.houseId &&
      atom.temporalStatus === 'CURRENT' &&
      atom.category !== 'guardrail' &&
      (atom.scope === 'PRODUCT' || atom.scope === 'DSE_KNOW_HOW' ||
        (context.specification.identity.role === 'reference' && atom.scope === 'REFERENCE_PROJECT')),
  );
  return {
    canonicalHouseId: context.identity.houseId,
    facts,
    interpretations: facts
      .filter((fact) => fact.safeInterpretation !== undefined)
      .map((fact) => ({
        factId: fact.id,
        text: fact.safeInterpretation!,
      })),
    guardrails: [
      ...new Set(
        facts.flatMap((atom) => [
          ...atom.constraints,
          ...(atom.unsupportedConclusions ?? []),
        ]),
      ),
    ],
    priorityFaq: [],
  };
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
    atom.houseId === context.identity.houseId &&
      atom.temporalStatus === 'CURRENT' &&
    atom.category !== 'guardrail' &&
    (atom.scope === 'PRODUCT' || atom.scope === 'DSE_KNOW_HOW' ||
      (context.specification.identity.role === 'reference' && atom.scope === 'REFERENCE_PROJECT'));
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
  ).sort((left, right) => priorityIndex(left) - priorityIndex(right));
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
      facts.flatMap((atom) => [
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
