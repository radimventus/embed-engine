import type { DecisionContext } from '@embed-engine/runtime';
import { createAIServiceFromDelivery, createEmbedAIDelivery } from '@embed-engine/ai';
import {
  evidenceBoundNarrative,
  type HouseRelationshipEvidenceBundle,
  type HouseRelationshipNarrative,
  type HouseRelationshipNarrativeGenerator,
} from '@embed-engine/object-house';

export function parseRelationshipNarrative(content: string): HouseRelationshipNarrative | null {
  const candidate = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? content;
  try {
    const value = JSON.parse(candidate.trim()) as Partial<HouseRelationshipNarrative>;
    const keys = ['connection', 'houseSolution', 'relationship', 'remember', 'conclusion'] as const;
    if (!keys.every((key) => typeof value[key] === 'string' && value[key]!.trim().length > 0)) return null;
    return {
      connection: value.connection!.trim(), houseSolution: value.houseSolution!.trim(),
      relationship: value.relationship!.trim(), remember: value.remember!.trim(),
      conclusion: value.conclusion!.trim(),
      ...(Array.isArray(value.bullets) && value.bullets.every((item) => typeof item === 'string')
        ? { bullets: value.bullets.map((item) => item.trim()).filter(Boolean) } : {}),
    };
  } catch {
    return null;
  }
}

/** LLM sees the selected evidence bundle; invalid output falls back to the same evidence. */
export function createRelationshipNarrativeGenerator(
  decision: DecisionContext,
): HouseRelationshipNarrativeGenerator {
  return async (bundle: HouseRelationshipEvidenceBundle) => {
    const fallback = evidenceBoundNarrative(bundle);
    const facts = [bundle.primaryFact, bundle.relatedFact].filter(
      (fact): fact is NonNullable<typeof fact> => fact !== undefined,
    );
    try {
      const sessionId = `relationship::${bundle.houseId}::${bundle.knowledgeVersion}::${bundle.lensId}::${bundle.outputId}`;
      const response = await createAIServiceFromDelivery(createEmbedAIDelivery(), {
        sessionId,
        diagnostics: false,
        recorder: false,
      }).sendMessage({
        message: [
          `Vysvětli pouze doložený výstup ${bundle.kind} pro zvolenou priority lens.`,
          'Nevymýšlej vlastnost domu, číslo ani závěr mimo dodané knowledge entries.',
          'Vrať jen JSON: connection, houseSolution, relationship, remember, conclusion a volitelné bullets.',
          `Lens: ${bundle.selectedPriorityIds.join(', ')}. Název: ${bundle.title}.`,
        ].join(' '),
        decision,
        object: {
          objectId: bundle.houseId,
          knowledge: {
            entries: facts.map((fact) => ({
              id: fact.id,
              text: [fact.statement, fact.safeInterpretation ?? ''].filter(Boolean).join('\n'),
              modelConstraints: [...fact.constraints, ...(fact.unsupportedConclusions ?? [])],
              provenance: fact.source,
            })),
          },
        },
      });
      return parseRelationshipNarrative(response.content) ?? fallback;
    } catch {
      return fallback;
    }
  };
}
