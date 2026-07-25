import { formatPriorityIdCs } from '../../pilot/decisionTerminalLabels';
import { useDecisionContext } from '../../runtime/useDecisionContext';

/**
 * PT-002 / PT-003 — Priority Interpretation Panel.
 * Renders DecisionContext only — no local interpretive rules.
 */
export function PriorityDecisionStoryPanel() {
  const context = useDecisionContext();

  return (
    <section
      aria-label="Decision Story — interpretační panel"
      data-testid="priority-decision-story"
      data-pt002-surface="interpretation"
      data-pt003-context="true"
      data-pt001-primary={context.focusPriority ?? ''}
      data-pt001-secondary={context.secondaryPriority ?? ''}
      data-pt001-priorities={context.selectedPriorities.join(',')}
      data-pt001-count={String(context.selectedPriorities.length)}
      data-pt002-primary={context.focusPriority ?? ''}
      data-pt003-focus={context.focusPriority ?? ''}
      className="mb-5 rounded-[8px] border border-embed-border-default bg-embed-surface-elevated p-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Decision Context
      </p>
      <h3 className="mt-2 text-base font-semibold text-embed-foreground-primary">
        {context.headline}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-embed-foreground-primary/80">
        {context.summary}
      </p>
      {context.focusPriority !== null ? (
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-embed-foreground-primary/65">
          <div className="flex gap-1.5">
            <dt className="font-semibold uppercase tracking-wide text-embed-brand-gold">
              Focus
            </dt>
            <dd>{formatPriorityIdCs(context.focusPriority)}</dd>
          </div>
          {context.secondaryPriority !== null ? (
            <div className="flex gap-1.5">
              <dt className="font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
                Secondary
              </dt>
              <dd>{formatPriorityIdCs(context.secondaryPriority)}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {context.selectedPriorities.length > 0 ? (
        <ol
          className="mt-3 space-y-1.5 border-t border-embed-border-default/60 pt-3"
          aria-label="Vybrané priority"
        >
          {context.selectedPriorities.map((id, index) => (
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
