import type {
  ClientOutputNarrative,
  ClientOutputSnapshot,
  ClientOutputVariant,
} from '@embed-engine/document-runtime';
import {
  dispositionPriorityLabel,
  evidenceBoundNarrative,
  type CanonicalHouseKnowledgeSelection,
  type HouseKnowledgeAtom,
  type HouseRelationshipEvidenceBundle,
} from '@embed-engine/object-house';
import type { ProjectedMediaAsset } from '../runtime/synchronizedExperience';
import type { DecisionSessionRuntimeContextValue } from '../runtime/DecisionSessionRuntimeProvider';

function narrative(title: string, fact: string, userImpact: string): ClientOutputNarrative {
  return { title, fact, userImpact };
}

export function clientOutputVariantForLandOption(value: 'owned' | 'seeking'): ClientOutputVariant {
  return value === 'owned' ? 'HAS_LAND' : 'SEEKING_LAND';
}

export function clientOutputPlotAndProcess(variant: ClientOutputVariant): readonly string[] {
  if (variant === 'HAS_LAND') return [
    'Porovnejte orientaci domu, světové strany a návaznost obytných místností na konkrétní pozemek.',
    'Prověřte odstupy, napojení, regulaci a rozsah přípravy pozemku.',
    'Další krok potvrďte nad osazením domu na vašem pozemku.',
  ];
  if (variant === 'SEEKING_LAND') return [
    'Při výběru parcely sledujte orientaci, tvar, přístup a možnost osazení tohoto domu.',
    'Před koupí prověřte regulaci, sítě, odstupy, sklon a náklady na přípravu.',
    'Vhodný pozemek porovnejte s dispozicí domu ještě před závazným rozhodnutím.',
  ];
  return [
    'Ověřte orientaci domu a návaznost obytných místností na pozemek.',
    'Porovnejte rozsah přípravy pozemku, napojení a postup realizace.',
    'Další krok potvrďte s partnerem nad konkrétním pozemkem.',
  ];
}

const MEDIA_CONTEXTS = [
  { pattern: /hero|exterior|exteri|fas|zahr/i, topics: ['pozemek', 'dispozice'], neutral: 'Pohled na dům pomáhá posoudit jeho vztah k pozemku, zahradě a okolí.' },
  { pattern: /kitchen|kuch/i, topics: ['dispozice'], neutral: 'Kuchyň ukazuje návaznost přípravy jídla na společný obytný prostor.' },
  { pattern: /living|ob[yý]v/i, topics: ['dispozice', 'soukromí'], neutral: 'Obytný prostor ukazuje, jak dům podporuje společný každodenní život.' },
  { pattern: /vestibule|z[aá]dve[rř]|chod/i, topics: ['dispozice'], neutral: 'Vstupní část ukazuje organizaci každodenního provozu domu.' },
  { pattern: /wardrobe|šat|sat/i, topics: ['dispozice', 'údržba'], neutral: 'Úložné zázemí pomáhá udržet obytné místnosti přehledné.' },
  { pattern: /bedroom|lo[zž]nic|pokoj/i, topics: ['soukromí', 'dispozice'], neutral: 'Soukromá část domu ukazuje oddělení od společného denního provozu.' },
] as const;

function mediaContext(media: Pick<ProjectedMediaAsset, 'title' | 'roomId'>) {
  const source = `${media.title} ${media.roomId ?? ''}`;
  return MEDIA_CONTEXTS.find((item) => item.pattern.test(source)) ?? {
    topics: [] as readonly string[],
    neutral: 'Tento pohled pomáhá posoudit prostor domu v souvislosti s každodenním užíváním.',
  };
}

function relevantInterpretation(
  knowledge: CanonicalHouseKnowledgeSelection | null,
  topics: readonly string[],
): string | null {
  if (knowledge === null) return null;
  const fact = knowledge.facts.find((item) =>
    item.safeInterpretation !== undefined &&
    topics.some((topic) => item.relatedTopics.includes(topic)),
  );
  return fact?.safeInterpretation ?? null;
}

/** Client-facing caption: media semantics + canonical House interpretation, never a raw asset key. */
export function clientOutputMediaCaption(
  media: Pick<ProjectedMediaAsset, 'title' | 'roomId'>,
  knowledge: CanonicalHouseKnowledgeSelection | null,
): string {
  const context = mediaContext(media);
  const interpretation = relevantInterpretation(knowledge, context.topics);
  return interpretation === null ? context.neutral : `${context.neutral} ${interpretation}`;
}

function factNarrative(item: HouseKnowledgeAtom): ClientOutputNarrative {
  return narrative(
    item.interpretationPoint ?? item.factPoint ?? item.subject,
    item.statement,
    item.safeInterpretation ?? item.statement,
  );
}

function relationshipNarrative(bundle: HouseRelationshipEvidenceBundle): ClientOutputNarrative {
  const value = evidenceBoundNarrative(bundle);
  // `remember` intentionally stays out: it carries constraints/editorial guardrails.
  return narrative(bundle.title, value.houseSolution, value.relationship);
}

function fallbackNarratives(
  facts: readonly HouseKnowledgeAtom[],
  start: number,
): readonly ClientOutputNarrative[] {
  return facts.slice(start, start + 3).map(factNarrative);
}

export function clientOutputConclusion(
  variant: ClientOutputVariant,
  hasPriorities: boolean,
): string {
  if (variant === 'HAS_LAND') {
    return 'Máte přehled vlastností domu, které je vhodné ověřit při jeho osazení na váš konkrétní pozemek.';
  }
  if (variant === 'SEEKING_LAND') {
    return 'Máte přehled vlastností domu, podle kterých můžete posuzovat vhodnost hledaného pozemku.';
  }
  return hasPriorities
    ? 'Výstup shrnuje ověřené vlastnosti domu v souvislosti s vašimi prioritami a dalším rozhodováním.'
    : 'Výstup shrnuje ověřené vlastnosti domu a souvislosti důležité pro další rozhodování.';
}

export function buildClientOutputSnapshot(
  runtime: DecisionSessionRuntimeContextValue,
  variant: ClientOutputVariant = 'UNIVERSAL',
  now = new Date(),
): ClientOutputSnapshot {
  if (runtime.analyticsScope === null || runtime.company === null || runtime.project === null) {
    throw new Error('Client output scope is unavailable.');
  }

  const { experience, houseKnowledge, chatHouseKnowledge, relationshipEvidence } = runtime;
  const priorities = relationshipEvidence[0]?.selectedPriorityIds ?? [];
  const clientPriorities = priorities.map(dispositionPriorityLabel);
  const knowledge = priorities.length > 0 ? houseKnowledge : chatHouseKnowledge;
  const gallery = experience.context.roomMedia.gallery;
  const exteriorCandidates = [
    ...(experience.context.hero.heroMedia ? [experience.context.hero.heroMedia] : []),
    ...gallery.filter((item) => /ext|exteri|zahr|fas/i.test(`${item.title} ${item.roomId ?? ''}`)),
  ];
  const exterior = (exteriorCandidates.length > 0 ? exteriorCandidates : gallery)
    .slice(0, 2)
    .map((item) => ({
      id: item.id,
      url: item.url,
      caption: clientOutputMediaCaption(item, knowledge),
    }));
  const exteriorIds = new Set(exterior.map((item) => item.id));
  const interiors = gallery
    .filter((item) => !exteriorIds.has(item.id))
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      url: item.url,
      caption: clientOutputMediaCaption(item, knowledge),
    }));
  const floorPlan = experience.context.floorPlan;
  const floorPlanInterpretation = relevantInterpretation(knowledge, ['dispozice']);
  const floorPlans = floorPlan.src ? [{
    id: 'floorplan-current',
    url: floorPlan.src,
    caption: floorPlanInterpretation === null
      ? 'Půdorys ukazuje uspořádání místností a jejich vazby pro každodenní užívání domu.'
      : `Půdorys ukazuje uspořádání místností a jejich vazby. ${floorPlanInterpretation}`,
  }] : [];

  const facts = knowledge?.facts ?? [];
  const priorityNarratives = facts.slice(0, 3).map(factNarrative);
  const connected = relationshipEvidence
    .filter((item) => item.kind === 'CONNECTED')
    .slice(0, 3)
    .map(relationshipNarrative);
  const blindspots = relationshipEvidence
    .filter((item) => item.kind === 'BLINDSPOT')
    .slice(0, 3)
    .map(relationshipNarrative);
  const connectedTopics = connected.length > 0 ? connected : fallbackNarratives(facts, 3);
  const overlookedTopics = blindspots.length > 0
    ? blindspots
    : fallbackNarratives(facts, 6);
  const faqSource = priorities.length > 0 ? houseKnowledge : chatHouseKnowledge;

  return {
    schemaVersion: 1,
    capturedAt: now.toISOString(),
    company: { id: runtime.company.companyId, name: runtime.company.companyName },
    project: { id: runtime.project.projectId, name: runtime.company.companyName },
    house: {
      id: runtime.analyticsScope.houseId,
      name: experience.house.title,
      storeys: new Set(floorPlan.rooms.map((room) => room.floor)).size || 1,
    },
    knowledgeVersion: relationshipEvidence[0]?.knowledgeVersion ?? 'canonical-current',
    variant,
    priorities: clientPriorities,
    exterior,
    floorPlans,
    interiors,
    priorityNarratives,
    connectedTopics,
    blindspots: overlookedTopics,
    faq: faqSource?.priorityFaq.slice(0, 4).map((item) => ({
      question: item.question,
      answer: item.answer,
    })) ?? [],
    plotAndProcess: clientOutputPlotAndProcess(variant),
    auditConclusion: clientOutputConclusion(variant, priorities.length > 0),
    cta: runtime.company.email
      ? `Navazující konzultaci domluvte na ${runtime.company.email}.`
      : 'Domluvte si s partnerem navazující konzultaci.',
  };
}
