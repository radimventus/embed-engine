import type { PriorityDefinition, PriorityId } from '../../model';

/**
 * Priority Registry (EPIC-BLD-12).
 * Catalog only — no evaluation.
 */
export const PRIORITY_REGISTRY: readonly PriorityDefinition[] = [
  {
    id: 'energy',
    label: 'Energy',
    description: 'Energetická náročnost a efektivita.',
  },
  {
    id: 'layout',
    label: 'Layout',
    description: 'Dispozice a prostorové uspořádání.',
  },
  {
    id: 'privacy',
    label: 'Privacy',
    description: 'Soukromí a oddělení zón.',
  },
  {
    id: 'investment',
    label: 'Investment',
    description: 'Investiční náročnost a návratnost.',
  },
  {
    id: 'quality',
    label: 'Quality',
    description: 'Kvalita provedení a materiálů.',
  },
  {
    id: 'design',
    label: 'Design',
    description: 'Estetika a architektonický výraz.',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    description: 'Náročnost údržby.',
  },
  {
    id: 'flexibility',
    label: 'Flexibility',
    description: 'Flexibilita využití v čase.',
  },
  {
    id: 'operating-costs',
    label: 'OperatingCosts',
    description: 'Provozní náklady.',
  },
  {
    id: 'land',
    label: 'Land',
    description: 'Vztah k pozemku a lokalitě.',
  },
] as const;

export const DEFAULT_PRIORITIES: readonly PriorityId[] = [
  'energy',
  'layout',
  'investment',
  'quality',
] as const;

export function listPriorities(): readonly PriorityDefinition[] {
  return PRIORITY_REGISTRY;
}

export function getPriority(id: PriorityId): PriorityDefinition | null {
  return PRIORITY_REGISTRY.find((item) => item.id === id) ?? null;
}
