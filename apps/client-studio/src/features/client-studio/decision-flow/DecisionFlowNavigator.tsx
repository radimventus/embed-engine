import type { ExperienceModel } from '@embed-engine/model';

import { DecisionFlowList } from './DecisionFlowList';

type DecisionFlowNavigatorProps = {
  experience: ExperienceModel;
  onSelectDecision: (decisionId: string) => void;
};

/**
 * Read-only Decision Flow Navigator.
 *
 * Consumes only ExperienceModel.decisionFlow.
 * Does not access DecisionRegistry, DecisionState, or reconstruct the graph.
 *
 * UI tests: Client Studio has no component-test infrastructure yet.
 * Projection/determinism coverage lives in packages/decision.
 */
export function DecisionFlowNavigator({
  experience,
  onSelectDecision,
}: DecisionFlowNavigatorProps) {
  return (
    <nav aria-label="Decision Flow" className="flex flex-col px-2">
      <h2 className="px-3 pb-3 text-xs font-medium uppercase tracking-wide text-embed-background-primary/55">
        Decision Flow
      </h2>
      <DecisionFlowList
        decisions={experience.decisionFlow}
        onSelect={onSelectDecision}
      />
    </nav>
  );
}
