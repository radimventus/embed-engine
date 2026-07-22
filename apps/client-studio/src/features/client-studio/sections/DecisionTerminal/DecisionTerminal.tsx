import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { projectTerminalPresentation } from '../../runtime/projectTerminalPresentation';
import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';

/**
 * Decision Terminal — renders `context.decision.terminal` only.
 * No recomputation, enrichment, or fallback composition (ED-DA-01R).
 */
export function DecisionTerminal() {
  const { experience } = useDecisionSessionRuntime();
  const terminal = experience.context.decision.terminal;
  const view = projectTerminalPresentation(terminal);

  return (
    <aside
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} overflow-y-auto`}
      data-terminal-id={view.id}
      data-testid="decision-terminal"
      aria-label="Rozhodovací terminál"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Rozhodovací terminál
      </p>
      <p className="mt-2 text-sm font-medium text-embed-foreground-primary">
        {view.recommendation}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">
        {view.status}
      </p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Proč toto doporučení
      </p>
      <ul
        className="mt-1 list-disc space-y-2 pl-4 text-sm text-embed-foreground-primary/70"
        data-testid="decision-terminal-evidence"
      >
        {view.rationale.map((key) => (
          <li key={key}>
            <span className="font-medium text-embed-foreground-primary">{key}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Na co si dát pozor
      </p>
      <ul
        className="mt-1 list-disc space-y-2 pl-4 text-sm text-embed-foreground-primary/70"
        data-testid="decision-terminal-concerns"
      >
        {view.unresolvedQuestions.map((key) => (
          <li key={key}>
            <span className="font-medium text-embed-foreground-primary">{key}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Míra jistoty doporučení
      </p>
      <div
        className="mt-1 space-y-1 text-sm text-embed-foreground-primary/70"
        data-testid="decision-terminal-confidence"
      >
        <p className="font-medium text-embed-foreground-primary">{view.confidence}</p>
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Dokončené kroky
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70">
        {view.completedMoveIds.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Doporučení
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70">
        <li>{view.recommendation}</li>
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Doporučené další kroky
      </p>
      <ul
        className="mt-1 list-disc space-y-2 pl-4 text-sm text-embed-foreground-primary/70"
        data-testid="decision-terminal-actions"
      >
        <li>
          <span className="font-medium text-embed-foreground-primary">
            {view.recommendedNextAction}
          </span>
        </li>
      </ul>
    </aside>
  );
}
