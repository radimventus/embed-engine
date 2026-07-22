import type { DecisionPresentation } from '../../runtime/projectDecisionPresentation';

type DecisionStoryPanelProps = {
  readonly story: DecisionPresentation['story'];
  readonly moves: DecisionPresentation['moves'];
};

/**
 * Decision Story + Moves — Runtime order only (CSCB-05).
 */
export function DecisionStoryPanel({ story, moves }: DecisionStoryPanelProps) {
  return (
    <section aria-label="Decision Story" className="mt-5 space-y-3">
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Decision Story
      </h4>
      <ol className="space-y-2">
        {story.chapters.map((chapter) => (
          <li
            key={chapter.id}
            data-chapter-order={chapter.order}
            className="rounded-[8px] border border-embed-border-default/80 px-3 py-2"
          >
            <p className="text-[10px] uppercase tracking-wide text-embed-foreground-primary/45">
              {chapter.kind}
            </p>
            <p className="mt-0.5 text-sm text-embed-foreground-primary">
              {chapter.key}
            </p>
          </li>
        ))}
      </ol>

      <h4 className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Decision Moves
      </h4>
      <ol className="space-y-2">
        {moves.moves.map((move) => {
          const active = move.id === moves.activeMoveId;
          return (
            <li
              key={move.id}
              data-move-order={move.order}
              data-move-status={move.status}
              aria-current={active ? 'step' : undefined}
              className={`rounded-[8px] px-3 py-2 text-sm ${
                active
                  ? 'border border-embed-brand-gold/60 bg-embed-background-primary'
                  : 'border border-transparent bg-embed-background-primary/50'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-embed-foreground-primary">
                  {move.order + 1}. {move.objective}
                </span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-embed-foreground-primary/50">
                  {move.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-embed-foreground-primary/60">
                {move.recommendedAction}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-embed-foreground-primary/55">
        Další krok Story: {story.nextDecisionStep}
      </p>
    </section>
  );
}
