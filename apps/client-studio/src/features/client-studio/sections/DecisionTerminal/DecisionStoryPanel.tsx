import {
  DECISION_TERMINAL_CHROME_CS,
  formatChapterKindCs,
  formatDecisionKeyCs,
  formatMoveStatusCs,
} from '../../pilot/decisionTerminalLabels';
import type { DecisionPresentation } from '../../runtime/projectDecisionPresentation';

type DecisionStoryPanelProps = {
  readonly story: DecisionPresentation['story'];
  readonly moves: DecisionPresentation['moves'];
};

/**
 * Decision Story + Moves — Runtime order only; collapsed on first view (CSCB-05A).
 */
export function DecisionStoryPanel({ story, moves }: DecisionStoryPanelProps) {
  return (
    <details className="mt-5 group">
      <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/55 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="text-embed-brand-gold group-open:rotate-90 transition-transform">
            ›
          </span>
          {DECISION_TERMINAL_CHROME_CS.detailToggle}
        </span>
      </summary>

      <section aria-label={DECISION_TERMINAL_CHROME_CS.story} className="mt-3 space-y-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
          {DECISION_TERMINAL_CHROME_CS.story}
        </h4>
        <ol className="space-y-2">
          {story.chapters.map((chapter) => (
            <li
              key={chapter.id}
              data-chapter-order={chapter.order}
              className="rounded-[8px] border border-embed-border-default/80 px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-wide text-embed-foreground-primary/45">
                {formatChapterKindCs(chapter.kind)}
              </p>
              <p className="mt-0.5 text-sm text-embed-foreground-primary">
                {formatDecisionKeyCs(chapter.key)}
              </p>
            </li>
          ))}
        </ol>

        <h4 className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
          {DECISION_TERMINAL_CHROME_CS.moves}
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
                    {move.order + 1}. {formatDecisionKeyCs(move.objective)}
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-embed-foreground-primary/50">
                    {formatMoveStatusCs(move.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-embed-foreground-primary/60">
                  {formatDecisionKeyCs(move.recommendedAction)}
                </p>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-embed-foreground-primary/55">
          {DECISION_TERMINAL_CHROME_CS.storyNext}:{' '}
          {formatDecisionKeyCs(story.nextDecisionStep)}
        </p>
      </section>
    </details>
  );
}
