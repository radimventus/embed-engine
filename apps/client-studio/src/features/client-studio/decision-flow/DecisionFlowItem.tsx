import type { ExperienceDecision } from '@embed-engine/model';

type DecisionFlowItemProps = {
  decision: ExperienceDecision;
  onSelect: (decisionId: string) => void;
};

function markerFor(decision: ExperienceDecision): string {
  if (decision.current) {
    return '●';
  }
  if (decision.visited) {
    return '✓';
  }
  return '○';
}

/**
 * Single projected Decision Flow step.
 * Presentation only — no navigation state ownership.
 */
export function DecisionFlowItem({ decision, onSelect }: DecisionFlowItemProps) {
  const marker = markerFor(decision);

  return (
    <button
      type="button"
      onClick={() => onSelect(decision.id)}
      aria-current={decision.current ? 'step' : undefined}
      className={[
        'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm tracking-wide transition-opacity duration-150 ease-out',
        decision.current
          ? 'bg-embed-background-primary/15 font-medium text-embed-brand-gold'
          : decision.visited
            ? 'text-embed-background-primary/90 hover:bg-embed-background-primary/10'
            : 'text-embed-background-primary/45 hover:bg-embed-background-primary/10 hover:text-embed-background-primary/70',
      ].join(' ')}
    >
      <span className="w-4 shrink-0 text-center" aria-hidden="true">
        {marker}
      </span>
      <span>{decision.title}</span>
    </button>
  );
}
