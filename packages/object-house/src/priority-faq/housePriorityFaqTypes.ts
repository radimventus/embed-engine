/**
 * CAP-REF-04 — House-owned advisory FAQ.
 * FAQ items link to House Knowledge but do not duplicate its provenance model.
 */

export type HousePriority =
  | 'LAND'
  | 'LAYOUT'
  | 'PRIVACY'
  | 'ENERGY'
  | 'OPERATING_COSTS'
  | 'DESIGN'
  | 'QUALITY'
  | 'INVESTMENT'
  | 'MAINTENANCE'
  | 'FLEXIBILITY';

export const HOUSE_PRIORITY_LABELS: Readonly<Record<HousePriority, string>> = {
  LAND: 'Pozemek',
  LAYOUT: 'Dispozice',
  PRIVACY: 'Soukromí',
  ENERGY: 'Energie',
  OPERATING_COSTS: 'Provozní náklady',
  DESIGN: 'Design',
  QUALITY: 'Kvalita',
  INVESTMENT: 'Investice',
  MAINTENANCE: 'Údržba',
  FLEXIBILITY: 'Flexibilita',
};

/**
 * Canonical advisory FAQ item, keyed by House, priority, and stable FAQ id.
 * Empty links and constraints mean no supporting atoms or caveats are recorded.
 */
export type HousePriorityFaqItem = {
  readonly id: string;
  readonly houseId: string;
  readonly priority: HousePriority;
  readonly question: string;
  readonly answer: string;
  readonly knowledgeAtomIds: readonly string[];
  readonly constraints: readonly string[];
};
