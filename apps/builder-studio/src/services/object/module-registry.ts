import type { ObjectModuleDefinition, ObjectModuleId } from '../../model';

/**
 * Module Registry (EPIC-BLD-08).
 * Catalog only — no module configuration.
 */
export const OBJECT_MODULE_REGISTRY: readonly ObjectModuleDefinition[] = [
  {
    id: 'hero',
    label: 'Hero',
    description: 'Úvodní vizuál Experience.',
  },
  {
    id: 'market-pulse',
    label: 'Market Pulse',
    description: 'Tržní kontext a signály.',
  },
  {
    id: 'house-navigator',
    label: 'House Navigator',
    description: 'Prohlídka dispozice.',
  },
  {
    id: 'priority',
    label: 'Priority',
    description: 'Priority rozhodování.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'Časté otázky.',
  },
  {
    id: 'ai-advisor',
    label: 'AI Advisor',
    description: 'AI poradce.',
  },
  {
    id: 'lead-capture',
    label: 'Lead Capture',
    description: 'Zachycení leadu.',
  },
] as const;

export const DEFAULT_OBJECT_MODULES: readonly ObjectModuleId[] = [
  'hero',
  'house-navigator',
  'priority',
  'faq',
] as const;

export function listObjectModules(): readonly ObjectModuleDefinition[] {
  return OBJECT_MODULE_REGISTRY;
}

export function getObjectModule(
  moduleId: ObjectModuleId,
): ObjectModuleDefinition | null {
  return OBJECT_MODULE_REGISTRY.find((item) => item.id === moduleId) ?? null;
}
