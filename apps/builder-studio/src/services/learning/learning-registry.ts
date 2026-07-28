import type { LearningOriginDefinition } from '../../model';

/**
 * Learning Origin catalog (EPIC-BLD-15).
 * Origin of an insight — not a Knowledge Layer.
 */
export const LEARNING_ORIGIN_REGISTRY: readonly LearningOriginDefinition[] = [
  {
    id: 'platform',
    label: 'Platform',
    description: 'Anonymizované poznatky napříč platformou.',
  },
  {
    id: 'company',
    label: 'Company',
    description: 'Původ ve firmě — data firmy neopouštějí Company Layer.',
  },
  {
    id: 'object',
    label: 'Object',
    description: 'Původ v objektu — nikdy přímá agregace Object dat.',
  },
  {
    id: 'session',
    label: 'Session',
    description: 'Dočasný session původ poznatku.',
  },
] as const;

/**
 * Learning Registry (EPIC-BLD-15).
 * Catalog sections: Observations, Patterns, Heuristics.
 */
export const LEARNING_REGISTRY = {
  observations: {
    id: 'observations',
    label: 'Observations',
    description: 'Anonymizovaná pozorování chování — bez customer documents.',
  },
  patterns: {
    id: 'patterns',
    label: 'Patterns',
    description: 'Datový model vzorců — bez automatické detekce.',
  },
  heuristics: {
    id: 'heuristics',
    label: 'Heuristics',
    description: 'Autorské heuristiky — bez Decision Engine.',
  },
} as const;

export function listLearningOrigins(): readonly LearningOriginDefinition[] {
  return LEARNING_ORIGIN_REGISTRY;
}
