import type { ExperienceDecision } from '@embed-engine/model';

import { DecisionFlowItem } from './DecisionFlowItem';

type DecisionFlowListProps = {
  decisions: readonly ExperienceDecision[];
  onSelect: (decisionId: string) => void;
};

/**
 * Renders the projected Decision Flow list in presentation order.
 */
export function DecisionFlowList({ decisions, onSelect }: DecisionFlowListProps) {
  return (
    <ul className="flex flex-col gap-0.5">
      {decisions.map((decision) => (
        <li key={decision.id}>
          <DecisionFlowItem decision={decision} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
