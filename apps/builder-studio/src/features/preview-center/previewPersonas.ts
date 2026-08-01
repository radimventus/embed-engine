/**
 * EPIC-BX-06 — Preview personas map to Runtime priority profiles.
 * No mock interpretation — Shared Runtime owns semantics via ChangePriority.
 */

export type PreviewPersonaId =
  | 'family'
  | 'investor'
  | 'senior'
  | 'single';

export type PreviewPersona = {
  readonly id: PreviewPersonaId;
  readonly label: string;
  readonly description: string;
  /** Runtime priority IDs (Decision Categories) — highest importance first. */
  readonly priorityIds: readonly string[];
};

export const PREVIEW_PERSONAS: readonly PreviewPersona[] = [
  {
    id: 'family',
    label: 'Rodina',
    description: 'Dispozice, soukromí, pozemek.',
    priorityIds: ['layout', 'privacy', 'plot', 'flexibility'],
  },
  {
    id: 'investor',
    label: 'Investor',
    description: 'Investice, provoz, kvalita.',
    priorityIds: ['investment', 'operating-costs', 'quality', 'energy'],
  },
  {
    id: 'senior',
    label: 'Senior',
    description: 'Údržba, energie, soukromí.',
    priorityIds: ['maintenance', 'energy', 'privacy', 'quality'],
  },
  {
    id: 'single',
    label: 'Single',
    description: 'Design, flexibilita, dispozice.',
    priorityIds: ['design', 'flexibility', 'layout', 'operating-costs'],
  },
] as const;

export function getPreviewPersona(id: PreviewPersonaId): PreviewPersona {
  return PREVIEW_PERSONAS.find((item) => item.id === id) ?? PREVIEW_PERSONAS[0];
}
