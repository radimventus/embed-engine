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
    if (!Array.isArray(value.bullets) || value.bullets.length < 2 ||
      !value.bullets.every((item) => typeof item === 'string' && item.trim().length > 0)) return null;
    return {
      connection: value.connection!.trim(), houseSolution: value.houseSolution!.trim(),
      relationship: value.relationship!.trim(), remember: value.remember!.trim(),
      conclusion: value.conclusion!.trim(),
      bullets: value.bullets.map((item) => item.trim()),
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
    const facts = [bundle.primaryFact, bundle.relatedFact, ...bundle.supportingFacts].filter(
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
          `Ústřední téma celého výstupu je „${bundle.title}“. Každá část se k němu musí výslovně vztahovat a nesmí přesunout hlavní pozornost na vedlejší fakt.`,
          'PRIMARY FACT je autorita pro téma, řešení domu, praktickou hodnotu i závěr. RELATED FACT použij jen k vysvětlení jedné doložené souvislosti.',
          'Piš pro zájemce o dům: konkrétně vysvětli, co vlastnost přináší v běžném životě, při rozhodování a při posouzení pozemku či užívání domu, pokud to evidence dokládá.',
          'Pole relationship rozveď nejpodrobněji: vysvětli ústřední téma, jeho praktické důsledky a vazby doložené PRIMARY FACT; u témat pozemku zohledni světové strany, tvar nebo charakter pozemku pouze tehdy, jsou-li v evidenci.',
          'Pole bullets musí obsahovat 2 až 4 stylisticky uhlazené, ověřené faktické výroky vycházející přímo z evidence.',
          'V každém bulletu označ pomocí **...** jen 1 až 3 nejdůležitější faktické fráze, nikdy celý bullet. Zbytek věty ponech běžným řezem; nepřidávej úvodní pomlčku ani hvězdičku.',
          'Nevymýšlej vlastnost domu, číslo, orientaci, parametr pozemku ani závěr mimo dodané knowledge entries.',
          'Vrať jen JSON: connection, houseSolution, relationship, remember, conclusion, bullets.',
          `Lens: ${bundle.selectedPriorityIds.join(', ')}. Název: ${bundle.title}.`,
          `PRIMARY FACT: ${bundle.primaryFact.statement} ${bundle.primaryFact.safeInterpretation ?? ''}`,
          `RELATED FACT: ${bundle.relatedFact === undefined ? 'není' : `${bundle.relatedFact.statement} ${bundle.relatedFact.safeInterpretation ?? ''}`}`,
          `SUPPORTING FACTS: ${bundle.supportingFacts.map((fact) => fact.statement).join(' | ')}`,
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
