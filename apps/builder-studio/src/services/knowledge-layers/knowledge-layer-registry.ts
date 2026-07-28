import type { KnowledgeLayerDefinition } from '../../model';

/**
 * Knowledge Layer Registry (EPIC-BLD-14).
 * Catalog of layers — architecture only.
 */
export const KNOWLEDGE_LAYER_REGISTRY: readonly KnowledgeLayerDefinition[] = [
  {
    id: 'platform',
    scope: 'platform',
    owner: 'CONIS Platform',
    description:
      'Platformové znalosti — nikdy neobsahuje data zákazníků.',
  },
  {
    id: 'company',
    scope: 'company',
    owner: 'Company',
    description: 'Firemní znalosti — izolované pro jednu firmu.',
  },
  {
    id: 'object',
    scope: 'object',
    owner: 'Object Package',
    description: 'Znalosti objektu — patří jednomu Object Package.',
  },
  {
    id: 'session',
    scope: 'session',
    owner: 'Session',
    description: 'Dočasné session znalosti — bez persistence.',
  },
] as const;

export function listKnowledgeLayers(): readonly KnowledgeLayerDefinition[] {
  return KNOWLEDGE_LAYER_REGISTRY;
}

export function getKnowledgeLayer(
  id: KnowledgeLayerDefinition['id'],
): KnowledgeLayerDefinition | null {
  return KNOWLEDGE_LAYER_REGISTRY.find((item) => item.id === id) ?? null;
}
