import type { HouseKnowledgeAtom } from '../knowledge/houseKnowledgeTypes';
import type { CanonicalHouseRuntimeContext } from '../runtime-context/canonicalHouseRuntimeContext';

export type HouseRelationshipKind = 'CONNECTED' | 'BLINDSPOT';

export type HouseRelationshipEvidenceRef = {
  readonly factId: string;
  readonly sourceId: string;
  readonly sourceKind: string;
  readonly sourceLabel?: string;
};

export type HouseRelationshipEvidenceBundle = {
  readonly houseId: string;
  readonly knowledgeVersion: string;
  readonly lensId: string;
  readonly selectedPriorityIds: readonly string[];
  readonly kind: HouseRelationshipKind;
  readonly outputId: string;
  readonly title: string;
  readonly primaryFact: HouseKnowledgeAtom;
  readonly relatedFact?: HouseKnowledgeAtom;
  readonly evidence: readonly HouseRelationshipEvidenceRef[];
};

export type HouseRelationshipNarrative = {
  readonly connection: string;
  readonly houseSolution: string;
  readonly relationship: string;
  readonly remember: string;
  readonly conclusion: string;
  readonly bullets?: readonly string[];
};

/** Semantic Client Output shared by the popup and the later TASK 111 PDF. */
export type HouseRelationshipOutput = Omit<
  HouseRelationshipEvidenceBundle,
  'primaryFact' | 'relatedFact'
> & {
  readonly narrative: HouseRelationshipNarrative;
};

export type HouseRelationshipNarrativeGenerator = (
  bundle: HouseRelationshipEvidenceBundle,
) => Promise<HouseRelationshipNarrative>;

const TOPICS_BY_PRIORITY: Readonly<Record<string, readonly string[]>> = {
  plot: ['pozemek'], land: ['pozemek'], layout: ['dispozice'],
  privacy: ['soukromí'], energy: ['energie'],
  'operating-costs': ['provozní-náklady'], design: ['design'],
  quality: ['kvalita', 'konstrukce'], investment: ['investice'],
  maintenance: ['údržba'], flexibility: ['flexibilita'],
};

const LABEL_BY_PRIORITY: Readonly<Record<string, string>> = {
  plot: 'pozemek', land: 'pozemek', layout: 'dispozice', privacy: 'soukromí',
  energy: 'energie', 'operating-costs': 'provozní náklady', design: 'design',
  quality: 'kvalita', investment: 'investice', maintenance: 'údržba',
  flexibility: 'flexibilita',
};

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

function eligibleFacts(context: CanonicalHouseRuntimeContext): readonly HouseKnowledgeAtom[] {
  return context.knowledge.filter((fact) =>
    fact.houseId === context.identity.houseId &&
    fact.temporalStatus === 'CURRENT' &&
    fact.category !== 'guardrail' &&
    fact.safeInterpretation !== undefined &&
    (fact.scope === 'PRODUCT' || fact.scope === 'DSE_KNOW_HOW' ||
      (context.specification.identity.role === 'reference' && fact.scope === 'REFERENCE_PROJECT')),
  );
}

export function houseKnowledgeVersion(context: CanonicalHouseRuntimeContext): string {
  const signature = eligibleFacts(context)
    .map((fact) => `${fact.id}|${fact.source.sourceId}|${fact.statement}|${fact.safeInterpretation ?? ''}`)
    .sort()
    .join('\n');
  return `hk-${hash(signature)}`;
}

function evidenceRef(fact: HouseKnowledgeAtom): HouseRelationshipEvidenceRef {
  return {
    factId: fact.id,
    sourceId: fact.source.sourceId,
    sourceKind: fact.source.kind,
    ...(fact.source.label === undefined ? {} : { sourceLabel: fact.source.label }),
  };
}

function clientTitle(fact: HouseKnowledgeAtom): string {
  const source = fact.interpretationPoint ?? fact.factPoint ?? fact.subject;
  const normalized = source.replace(/[.!?]+$/g, '').trim().toLocaleLowerCase('cs-CZ');
  return normalized.length === 0
    ? fact.subject
    : normalized.charAt(0).toLocaleUpperCase('cs-CZ') + normalized.slice(1);
}

function scoreDirect(fact: HouseKnowledgeAtom, lensTopics: ReadonlySet<string>): number {
  const matches = fact.relatedTopics.filter((topic) => lensTopics.has(topic)).length;
  return matches === 0 ? 0 : matches * 10 + (fact.factPoint !== undefined ? 2 : 0);
}

function makeBundle(input: {
  context: CanonicalHouseRuntimeContext;
  knowledgeVersion: string;
  lensId: string;
  selectedPriorityIds: readonly string[];
  kind: HouseRelationshipKind;
  primaryFact: HouseKnowledgeAtom;
  relatedFact?: HouseKnowledgeAtom;
}): HouseRelationshipEvidenceBundle {
  const evidenceFacts = input.relatedFact === undefined
    ? [input.primaryFact]
    : [input.primaryFact, input.relatedFact];
  return {
    houseId: input.context.identity.houseId,
    knowledgeVersion: input.knowledgeVersion,
    lensId: input.lensId,
    selectedPriorityIds: input.selectedPriorityIds,
    kind: input.kind,
    outputId: `${input.context.identity.houseId}:${input.knowledgeVersion}:${input.lensId}:${input.kind.toLowerCase()}:${input.primaryFact.id}`,
    title: clientTitle(input.primaryFact),
    primaryFact: input.primaryFact,
    ...(input.relatedFact === undefined ? {} : { relatedFact: input.relatedFact }),
    evidence: evidenceFacts.map(evidenceRef),
  };
}

/** Deterministic evidence selection. Priority changes rank, never the House corpus. */
export function selectHouseRelationshipEvidence(input: {
  readonly context: CanonicalHouseRuntimeContext;
  readonly selectedPriorityIds: readonly string[];
}): readonly HouseRelationshipEvidenceBundle[] {
  const selectedPriorityIds = [...new Set(input.selectedPriorityIds)].sort();
  const lensId = selectedPriorityIds.join('+') || 'general';
  const version = houseKnowledgeVersion(input.context);
  const lensTopics = new Set(selectedPriorityIds.flatMap((id) => TOPICS_BY_PRIORITY[id] ?? []));
  const facts = eligibleFacts(input.context);
  const direct = facts
    .map((fact) => ({ fact, score: scoreDirect(fact, lensTopics) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.fact.id.localeCompare(right.fact.id));
  const connected = direct.slice(0, 3).map(({ fact }) => fact);
  const connectedIds = new Set(connected.map((fact) => fact.id));
  const bridgeTopics = new Set(
    connected.flatMap((fact) => fact.relatedTopics).filter((topic) => !lensTopics.has(topic)),
  );
  const blindspotPool = facts.filter((fact) =>
    !connectedIds.has(fact.id) &&
    !fact.relatedTopics.some((topic) => lensTopics.has(topic)),
  );
  const blindspots: HouseKnowledgeAtom[] = [];
  const availableBridgeTopics = new Set(bridgeTopics);
  while (blindspots.length < 3) {
    const ranked = blindspotPool
      .filter((fact) => !blindspots.some((selected) => selected.id === fact.id))
      .map((fact) => ({
        fact,
        score: fact.relatedTopics.filter((topic) => availableBridgeTopics.has(topic)).length * 8 +
          (fact.constraints.length > 0 ? 1 : 0),
      }))
      .filter(({ score }) => score >= 8)
      .sort((left, right) => right.score - left.score || left.fact.id.localeCompare(right.fact.id));
    const next = ranked[0]?.fact;
    if (next === undefined) break;
    blindspots.push(next);
    next.relatedTopics.forEach((topic) => availableBridgeTopics.add(topic));
  }
  const connectedBundles = connected.map((fact) => makeBundle({
    context: input.context, knowledgeVersion: version, lensId, selectedPriorityIds,
    kind: 'CONNECTED', primaryFact: fact,
  }));
  const blindspotBundles = blindspots.map((fact, index) => {
    const relatedFact = [...connected, ...blindspots.slice(0, index)].find((connectedFact) =>
      connectedFact.relatedTopics.some((topic) => fact.relatedTopics.includes(topic)),
    );
    return makeBundle({
      context: input.context, knowledgeVersion: version, lensId, selectedPriorityIds,
      kind: 'BLINDSPOT', primaryFact: fact, relatedFact,
    });
  });
  return [...connectedBundles, ...blindspotBundles];
}

function lensText(bundle: HouseRelationshipEvidenceBundle): string {
  return bundle.selectedPriorityIds.map((id) => LABEL_BY_PRIORITY[id] ?? id).join(', ');
}

/** Source-faithful fallback and reference implementation for an LLM generator. */
export function evidenceBoundNarrative(
  bundle: HouseRelationshipEvidenceBundle,
): HouseRelationshipNarrative {
  const fact = bundle.primaryFact;
  const lens = lensText(bundle);
  const related = bundle.relatedFact;
  return {
    connection: bundle.kind === 'CONNECTED'
      ? `Tato vlastnost přímo souvisí s tím, že mezi vašimi prioritami jsou ${lens}.`
      : `Tato vlastnost neleží přímo v centru vašich priorit (${lens}), ale ovlivňuje jejich fungování jako celku.`,
    houseSolution: fact.statement,
    relationship: related === undefined
      ? fact.safeInterpretation!
      : `${fact.safeInterpretation!} Souvislost vede přes vlastnost „${related.subject}“: ${related.safeInterpretation ?? related.statement}`,
    remember: fact.constraints[0] ?? fact.clientQualifications?.[0] ??
      'Při rozhodování porovnejte tuto vlastnost s konkrétním způsobem užívání domu.',
    conclusion: fact.interpretationPoint ?? fact.safeInterpretation!,
  };
}

export async function generateHouseRelationshipOutput(
  bundle: HouseRelationshipEvidenceBundle,
  generator: HouseRelationshipNarrativeGenerator = async (value) => evidenceBoundNarrative(value),
): Promise<HouseRelationshipOutput> {
  const narrative = await generator(bundle);
  const { primaryFact: _primary, relatedFact: _related, ...identity } = bundle;
  return { ...identity, narrative };
}

export class HouseRelationshipOutputCache {
  private readonly values = new Map<string, Promise<HouseRelationshipOutput>>();

  getOrGenerate(
    bundle: HouseRelationshipEvidenceBundle,
    generator?: HouseRelationshipNarrativeGenerator,
  ): Promise<HouseRelationshipOutput> {
    const key = bundle.outputId;
    const cached = this.values.get(key);
    if (cached !== undefined) return cached;
    const pending = generateHouseRelationshipOutput(bundle, generator).catch((error) => {
      this.values.delete(key);
      throw error;
    });
    this.values.set(key, pending);
    return pending;
  }
}
