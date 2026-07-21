import { createContext, useContext } from 'react';
import {
  createEmptyPrioritySelection,
  type PrioritySelection,
} from '@embed-engine/core/experience';

const PrioritySelectionContext = createContext<PrioritySelection>(
  createEmptyPrioritySelection(),
);

export const PrioritySelectionProvider = PrioritySelectionContext.Provider;

export function usePrioritySelection(): PrioritySelection {
  return useContext(PrioritySelectionContext);
}
