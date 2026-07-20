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
    </div>
  );
}
