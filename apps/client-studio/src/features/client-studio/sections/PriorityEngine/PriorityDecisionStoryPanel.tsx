import {
  projectPriorityPipelineStory,
  type PriorityId,
} from '@embed-engine/runtime';

import { formatPriorityIdCs } from '../../pilot/decisionTerminalLabels';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

/**
 * PT-001 Experience projection — MVP Decision Story.
 * Reads Runtime priorityIds only. No interpretation in UI.
 */
export function PriorityDecisionStoryPanel() {
  const { experience } = useDecisionSessionRuntime();
  const priorityIds = experience.context.decision.priorityIds;
  const story = projectPriorityPipelineStory(priorityIds, 0);

  return (
    <section
      aria-label="Decision Story — priority lens"
      data-testid="priority-decision-story"
      data-pt001-primary={story.primaryPriority ?? ''}
      data-pt001-secondary={story.secondaryPriority ?? ''}
      data-pt001-priorities={story.selectedPriorities.join(',')}
      data-pt001-count={String(story.selectedPriorities.length)}
      className="mb-5 rounded-[8px] border border-embed-border-default bg-embed-surface-elevated p-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Decision Story
      </p>
      {story.selectedPriorities.length === 0 ? (
        <p className="mt-2 text-sm text-embed-foreground-primary/60">
          Vyberte priority — Experience se přizpůsobí Decision Story.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {story.selectedPriorities.map((id: PriorityId, index: number) => {
            const role =
              index === 0
                ? 'primary'
                : index === 1
                  ? 'secondary'
                  : `rank-${index + 1}`;
            return (
              <li
                key={id}
                data-priority-id={id}
                data-priority-role={role}
                className={`flex items-baseline justify-between gap-3 text-sm ${
                  index === 0
                    ? 'font-bold text-embed-foreground-primary'
                    : index === 1
                      ? 'font-semibold text-embed-foreground-primary'
                      : 'font-normal text-embed-foreground-primary/80'
                }`}
              >
                <span>
                  <span className="mr-2 tabular-nums text-embed-foreground-primary/45">
                    {index + 1}.
                  </span>
                  {formatPriorityIdCs(id)}
                </span>
                {index === 0 ? (
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-embed-brand-gold">
                    Primary
                  </span>
                ) : index === 1 ? (
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
                    Secondary
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
