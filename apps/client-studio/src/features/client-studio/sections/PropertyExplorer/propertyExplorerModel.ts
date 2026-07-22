/**
 * Presentation-only field rows for Property Explorer (CSCB-02 / SR-003).
 * Values are already projected by Runtime — no calculations here.
 */
export type PropertyFact = {
  readonly label: string;
  readonly value: string;
};

export type PropertyFeatureGroupId =
  | 'layout'
  | 'construction'
  | 'land'
  | 'energy'
  | 'location';

export type PropertyFeatureGroup = {
  readonly id: PropertyFeatureGroupId;
  readonly title: string;
  readonly facts: readonly PropertyFact[];
};

export function formatAreaM2(value: number): string {
  return `${value.toLocaleString('cs-CZ')} m²`;
}

export function formatPriceCzk(value: number): string {
  return `${value.toLocaleString('cs-CZ')} Kč`;
}
