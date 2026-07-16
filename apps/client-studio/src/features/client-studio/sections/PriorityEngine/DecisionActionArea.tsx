import { DecisionProgress } from './DecisionProgress';
import {
  PRIORITY_ENGINE_ACTION_AREA_CLASS,
  PRIORITY_ENGINE_CONFIRM_PLACEHOLDER_CLASS,
} from './priority-engine-layout';

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
      <button type="button" disabled className={PRIORITY_ENGINE_CONFIRM_PLACEHOLDER_CLASS}>
        Pokračovat
      </button>
    </div>
  );
}
