import { PrimaryButton } from '@embed-engine/ui';

import { DecisionProgress } from './DecisionProgress';
import { PRIORITY_ENGINE_ACTION_AREA_CLASS } from './priority-engine-layout';

type DecisionActionAreaProps = {
  minimumMet: boolean;
  minimumSelection: number;
  selectedCount: number;
};

export function DecisionActionArea({
  minimumMet,
  minimumSelection,
  selectedCount,
}: DecisionActionAreaProps) {
  return (
    <div className={PRIORITY_ENGINE_ACTION_AREA_CLASS}>
      <DecisionProgress
        minimumMet={minimumMet}
        minimumSelection={minimumSelection}
        selectedCount={selectedCount}
      />
      <PrimaryButton
        type="button"
        size="sm"
        disabled
        className="w-[120px] shrink-0 rounded-[8px] px-0 py-2 text-xs font-medium tracking-wide"
      >
        Pokračovat
      </PrimaryButton>
    </div>
  );
}
