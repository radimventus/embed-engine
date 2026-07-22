import { useMemo } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import {
  formatAreaM2,
  type PropertyFeatureGroup,
  type PropertyFeatureGroupId,
} from './propertyExplorerModel';

/**
 * Build presentation feature groups from Runtime Context / house projection.
 * Grouping is presentational only — no semantic composition.
 */
export function usePropertyFeatureGroups(): readonly PropertyFeatureGroup[] {
  const { experience } = useDecisionSessionRuntime();
  const object = experience.context.object;
  const house = experience.house;
  const floors = experience.context.navigation.floors.length;

  return useMemo(
    () =>
      Object.freeze([
        Object.freeze({
          id: 'layout' as const,
          title: 'Dispozice',
          facts: Object.freeze([
            { label: 'Počet místností', value: String(house.roomCount) },
            { label: 'Podlaží', value: String(floors) },
            { label: 'Užitná plocha', value: formatAreaM2(object.usableArea) },
          ]),
        }),
        Object.freeze({
          id: 'construction' as const,
          title: 'Konstrukce',
          facts: Object.freeze([
            { label: 'Konstrukce', value: object.construction },
            { label: 'Reference', value: object.reference },
          ]),
        }),
        Object.freeze({
          id: 'land' as const,
          title: 'Pozemek',
          facts: Object.freeze([
            { label: 'Plocha pozemku', value: formatAreaM2(house.landArea) },
            {
              label: 'Zahrada',
              value: house.hasGarden ? 'Ano' : 'Ne',
            },
          ]),
        }),
        Object.freeze({
          id: 'energy' as const,
          title: 'Energetika',
          facts: Object.freeze([
            {
              label: 'Energetická třída',
              value:
                object.energyClass.length > 0 ? object.energyClass : 'Neuvedeno',
            },
          ]),
        }),
        Object.freeze({
          id: 'location' as const,
          title: 'Lokalita',
          facts: Object.freeze([
            { label: 'Město', value: object.city },
            { label: 'Lokalita', value: object.district },
          ]),
        }),
      ]),
    [floors, house.hasGarden, house.landArea, house.roomCount, object],
  );
}

export type { PropertyFeatureGroupId };
