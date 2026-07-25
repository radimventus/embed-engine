import { formatPriorityIdCs } from '../../pilot/decisionTerminalLabels';
import { useExperienceProjection } from '../../runtime/useExperienceProjection';

/**
 * PT-002 — Priority Interpretation Panel.
 * Renders ExperienceProjection.interpretation only — no local semantics.
 */
export function PriorityDecisionStoryPanel() {
  const projection = useExperienceProjection();
  const { story, interpretation } = projection;

  return (
    <section
      aria-label="Decision Story — interpretační panel"
      data-testid="priority-decision-story"
      data-pt002-surface="interpretation"
      data-pt001-primary={story.primaryPriority ?? ''}
      data-pt001-secondary={story.secondaryPriority ?? ''}
      data-pt001-priorities={story.selectedPriorities.join(',')}
      data-pt001-count={String(story.selectedPriorities.length)}
      data-pt002-primary={story.primaryPriority ?? ''}
      className="mb-5 rounded-[8px] border border-embed-border-default bg-embed-surface-elevated p-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Decision Story
      </p>
      <h3 className="mt-2 text-base font-semibold text-embed-foreground-primary">
        {interpretation.headline}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-embed-foreground-primary/80">
        {interpretation.body}
      </p>
      {interpretation.primaryLabel !== null ? (
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-embed-foreground-primary/65">
          <div className="flex gap-1.5">
            <dt className="font-semibold uppercase tracking-wide text-embed-brand-gold">
              Primary
            </dt>
            <dd>{interpretation.primaryLabel}</dd>
          </div>
          {interpretation.secondaryLabel !== null ? (
            <div className="flex gap-1.5">
              <dt className="font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
                Secondary
              </dt>
              <dd>{interpretation.secondaryLabel}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {story.selectedPriorities.length > 0 ? (
        <ol
          className="mt-3 space-y-1.5 border-t border-embed-border-default/60 pt-3"
          aria-label="Vybrané priority"
        >
          {story.selectedPriorities.map((id, index) => (
            <li
              key={id}
              data-priority-id={id}
              data-priority-role={
                index === 0
                  ? 'primary'
                  : index === 1
                    ? 'secondary'
                    : `rank-${index + 1}`
              }
              className={`text-sm ${
                index === 0
                  ? 'font-bold text-embed-foreground-primary'
                  : index === 1
                    ? 'font-semibold text-embed-foreground-primary'
                    : 'text-embed-foreground-primary/75'
              }`}
            >
              <span className="mr-2 tabular-nums text-embed-foreground-primary/45">
                {index + 1}.
              </span>
              {formatPriorityIdCs(id)}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
