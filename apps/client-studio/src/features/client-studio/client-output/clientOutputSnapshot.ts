import type {
  ClientOutputMedia,
  ClientOutputNarrative,
  ClientOutputSnapshot,
  ClientOutputVariant,
} from '@embed-engine/document-runtime';
import {
  dispositionPriorityLabel,
  type CanonicalHouseKnowledgeSelection,
  type HouseKnowledgeAtom,
  type HouseRelationshipEvidenceBundle,
} from '@embed-engine/object-house';
import { WORKFLOW_BY_LAND } from '../sections/AuditLeadCapture/audit-panel';
import { resolveClientRuntimeBinding } from '../runtime/clientCanonicalBind';
import type { ProjectedMediaAsset } from '../runtime/synchronizedExperience';
import type { DecisionSessionRuntimeContextValue } from '../runtime/DecisionSessionRuntimeProvider';

function narrative(title: string, fact: string, userImpact?: string): ClientOutputNarrative {
  return userImpact === undefined ? { title, fact } : { title, fact, userImpact };
}

export function clientOutputVariantForLandOption(value: 'owned' | 'seeking'): ClientOutputVariant {
  return value === 'owned' ? 'HAS_LAND' : 'SEEKING_LAND';
}

function workflowCopy(mode: 'owned' | 'seeking'): readonly string[] {
  return WORKFLOW_BY_LAND[mode].map((station) =>
    `${station.title}: ${station.lines.join(' ')}`,
  );
}

export function clientOutputPlotAndProcess(variant: ClientOutputVariant): readonly string[] {
  if (variant === 'HAS_LAND') return workflowCopy('owned');
  if (variant === 'SEEKING_LAND') return workflowCopy('seeking');
  return [];
}

type MediaRole = 'cover' | 'exterior' | 'floorplan' | 'interior';

const ROOM_TOPICS: Readonly<Record<string, readonly string[]>> = {
  exterior: ['pozemek', 'zahrada', 'design'],
  terrace: ['pozemek', 'zahrada', 'dispozice'],
  kitchen: ['dispozice', 'provoz'],
  'living-room': ['dispozice', 'soukromí', 'zahrada'],
  vestibule: ['dispozice', 'provoz'],
  wardrobe: ['dispozice', 'údržba'],
  bedroom: ['soukromí', 'dispozice'],
  bathroom: ['provoz', 'údržba'],
  toilet: ['provoz', 'dispozice'],
  'children-room': ['soukromí', 'dispozice'],
  office: ['soukromí', 'dispozice'],
  'technical-room': ['provoz', 'údržba', 'energie'],
};

const ROOM_LABELS: Readonly<Record<string, string>> = {
  exterior: 'Exteriér', terrace: 'Terasa', kitchen: 'Kuchyně',
  'living-room': 'Obývací pokoj', vestibule: 'Zádveří', wardrobe: 'Šatna',
  bedroom: 'Ložnice', bathroom: 'Koupelna', toilet: 'Toaleta',
  'children-room': 'Dětský pokoj', office: 'Pracovna',
  'technical-room': 'Technická místnost',
};

const ROOM_EVIDENCE_TERMS: Readonly<Record<string, readonly string[]>> = {
  terrace: ['terasa', 'zahrad'], kitchen: ['kuchyň', 'kuchyn'],
  'living-room': ['obýv', 'společensk', 'obytn'], vestibule: ['zádveří', 'vstup'],
  wardrobe: ['šatn', 'úlož', 'uklád'], bedroom: ['ložnic', 'soukrom'],
  bathroom: ['koupeln'], toilet: ['toalet', 'wc'],
  'children-room': ['dětsk', 'pokoj'], office: ['pracovn'],
  'technical-room': ['technick'],
};

function relevantInterpretation(
  knowledge: CanonicalHouseKnowledgeSelection | null,
  topics: readonly string[],
  position = 0,
): string | null {
  if (knowledge === null) return null;
  const candidates = knowledge.facts.filter((item) =>
    item.safeInterpretation !== undefined &&
    topics.some((topic) => item.relatedTopics.includes(topic)),
  );
  if (candidates.length === 0) return null;
  return candidates[position % candidates.length]?.safeInterpretation ?? null;
}

function subjectRelevantInterpretation(
  knowledge: CanonicalHouseKnowledgeSelection | null,
  roomId: string | null | undefined,
  topics: readonly string[],
  position = 0,
): string | null {
  if (knowledge === null || roomId == null) return null;
  const terms = ROOM_EVIDENCE_TERMS[roomId];
  if (terms === undefined) return relevantInterpretation(knowledge, topics, position);
  const candidates = knowledge.facts.filter((item) => {
    if (item.safeInterpretation === undefined) return false;
    const searchable = normalizedText([
      item.subject, item.category, item.statement, item.safeInterpretation,
      ...item.relatedTopics,
    ].join(' '));
    return terms.some((term) => searchable.includes(normalizedText(term)));
  });
  return candidates[position % Math.max(candidates.length, 1)]?.safeInterpretation ?? null;
}

function semanticLead(role: MediaRole, label: string, position: number): string {
  if (role === 'cover') return 'Úvodní pohled představuje dům v jeho architektonickém kontextu.';
  if (role === 'exterior') return position === 0
    ? 'Tento exteriérový pohled ukazuje vztah domu k pozemku a venkovnímu prostoru.'
    : 'Druhý pohled doplňuje podobu domu a jeho návaznost na okolí.';
  if (role === 'floorplan') return 'Půdorys ukazuje uspořádání místností a jejich vzájemné vazby.';
  const interiorLeads = [
    `Pohled na prostor ${label} ukazuje jeho podobu a místo v každodenním provozu domu.`,
    `Další perspektiva prostoru ${label} pomáhá posoudit jeho návaznost na ostatní části domu.`,
    `Tento záběr prostoru ${label} doplňuje představu o jeho každodenním využití.`,
  ];
  return interiorLeads[position % interiorLeads.length]!;
}

/** Client-facing caption: media semantics + canonical House interpretation. */
export function clientOutputMediaCaption(
  media: Pick<ProjectedMediaAsset, 'title' | 'roomId'>,
  knowledge: CanonicalHouseKnowledgeSelection | null,
  options: { readonly role?: MediaRole; readonly label?: string; readonly position?: number } = {},
): string {
  const role = options.role ?? 'interior';
  const label = options.label ?? ROOM_LABELS[media.roomId ?? ''] ?? 'Interiér';
  const position = options.position ?? 0;
  const topics = ROOM_TOPICS[media.roomId ?? ''] ?? [];
  const lead = semanticLead(role, label, position);
  const interpretation = role === 'interior'
    ? subjectRelevantInterpretation(knowledge, media.roomId, topics, position)
    : relevantInterpretation(knowledge, topics, position);
  return interpretation === null || interpretation.trim() === lead.trim()
    ? lead
    : `${lead} ${interpretation}`;
}

function normalizedText(value: string): string {
  return value.toLocaleLowerCase('cs-CZ').replace(/[^a-zá-ž0-9]+/gi, ' ').trim();
}

function factNarrative(
  item: HouseKnowledgeAtom,
  interpretationByFactId: ReadonlyMap<string, string>,
): ClientOutputNarrative {
  const canonicalMeaning = interpretationByFactId.get(item.id);
  const impact = canonicalMeaning !== undefined &&
    normalizedText(canonicalMeaning) !== normalizedText(item.statement)
    ? canonicalMeaning
    : undefined;
  return narrative(item.factPoint ?? item.subject, item.statement, impact);
}

function relationshipNarrative(bundle: HouseRelationshipEvidenceBundle): ClientOutputNarrative {
  const primaryImpact = bundle.primaryFact.safeInterpretation;
  return narrative(
    bundle.title,
    bundle.primaryFact.statement,
    primaryImpact !== undefined && normalizedText(primaryImpact) !== normalizedText(bundle.primaryFact.statement)
      ? primaryImpact
      : undefined,
  );
}

function fallbackNarratives(
  facts: readonly HouseKnowledgeAtom[],
  interpretationByFactId: ReadonlyMap<string, string>,
  start: number,
): readonly ClientOutputNarrative[] {
  return facts.slice(start, start + 3).map((item) => factNarrative(item, interpretationByFactId));
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

function uniqueByUrl(items: readonly ProjectedMediaAsset[]): readonly ProjectedMediaAsset[] {
  const urls = new Set<string>();
  return items.filter((item) => {
    if (urls.has(item.url)) return false;
    urls.add(item.url);
    return true;
  });
}

function projectMedia(
  item: ProjectedMediaAsset,
  role: MediaRole,
  label: string,
  knowledge: CanonicalHouseKnowledgeSelection | null,
  position: number,
): ClientOutputMedia {
  return {
    id: item.id,
    url: item.url,
    role,
    label,
    caption: clientOutputMediaCaption(item, knowledge, { role, label, position }),
  };
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
  const roomById = new Map(experience.house.rooms.map((room) => [room.id, room]));
  const gallery = uniqueByUrl(experience.context.roomMedia.gallery);
  const exteriorGallery = gallery.filter((item) => roomById.get(item.roomId ?? '')?.area === 0);
  const interiorGallery = gallery.filter((item) => (roomById.get(item.roomId ?? '')?.area ?? 0) > 0);
  const hero = experience.context.hero.heroMedia;
  const coverSource = hero ?? exteriorGallery[0] ?? null;
  const cover = coverSource === null ? [] : [
    projectMedia(coverSource, 'cover', 'Exteriér', knowledge, 0),
  ];
  const coverUrl = coverSource?.url;
  const exterior = exteriorGallery
    .filter((item) => item.url !== coverUrl)
    .slice(0, 2)
    .map((item, index) => projectMedia(item, 'exterior', 'Exteriér', knowledge, index));
  const interiors = interiorGallery.slice(0, 15).map((item, index) => {
    const label = roomById.get(item.roomId ?? '')?.name ?? 'Interiér';
    return projectMedia(item, 'interior', label, knowledge, index);
  });
  const floorPlan = experience.context.floorPlan;
  const floorPlanInterpretation = relevantInterpretation(knowledge, ['dispozice'], 0);
  const floorPlans: readonly ClientOutputMedia[] = floorPlan.src ? [{
    id: 'floorplan-current',
    url: floorPlan.src,
    role: 'floorplan',
    label: experience.house.rooms.some((room) => room.floor > 0) ? 'Aktivní podlaží' : '1. NP',
    caption: floorPlanInterpretation === null
      ? semanticLead('floorplan', 'Půdorys', 0)
      : `${semanticLead('floorplan', 'Půdorys', 0)} ${floorPlanInterpretation}`,
  }] : [];

  const facts = knowledge?.facts ?? [];
  const interpretationByFactId = new Map(
    (knowledge?.interpretations ?? []).map((item) => [item.factId, item.text]),
  );
  const priorityNarratives = facts.slice(0, 3)
    .map((item) => factNarrative(item, interpretationByFactId));
  const connected = relationshipEvidence
    .filter((item) => item.kind === 'CONNECTED')
    .slice(0, 3)
    .map(relationshipNarrative);
  const blindspots = relationshipEvidence
    .filter((item) => item.kind === 'BLINDSPOT')
    .slice(0, 3)
    .map(relationshipNarrative);
  const connectedTopics = connected.length > 0 ? connected : fallbackNarratives(facts, interpretationByFactId, 3);
  const overlookedTopics = blindspots.length > 0 ? blindspots : fallbackNarratives(facts, interpretationByFactId, 6);
  const faqSource = priorities.length > 0 ? houseKnowledge : chatHouseKnowledge;
  const contactParts = [runtime.company.email, runtime.company.phone].filter(Boolean);
  const projection = resolveClientRuntimeBinding().project;
  const branding = projection?.project.projectId === runtime.project.projectId
    ? projection.branding
    : null;

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
    cover,
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
    landPaths: variant === 'UNIVERSAL' ? {
      hasLand: workflowCopy('owned'),
      seekingLand: workflowCopy('seeking'),
    } : undefined,
    auditConclusion: clientOutputConclusion(variant, priorities.length > 0),
    cta: contactParts.length > 0
      ? `Navazující konzultaci domluvte s ${runtime.company.companyName}: ${contactParts.join(' · ')}.`
      : `Navazující konzultaci domluvte s ${runtime.company.companyName}.`,
    partner: {
      companyName: runtime.company.companyName,
      ...(runtime.company.email ? { email: runtime.company.email } : {}),
      ...(runtime.company.phone ? { phone: runtime.company.phone } : {}),
      ...(branding?.logoUrl ? { logoUrl: branding.logoUrl } : {}),
      ...(branding?.websiteUrl ? { websiteUrl: branding.websiteUrl } : {}),
    },
  };
}
