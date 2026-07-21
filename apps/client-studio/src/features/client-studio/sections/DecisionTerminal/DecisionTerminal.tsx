import type { Experience } from '@embed-engine/core/experience';

import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';

export type DecisionTerminalProps = {
  experience: Experience;
};

/**
 * Decision Terminal — pure Experience presentation.
 * Owns no Priority, Object, or interpretation logic.
 */
export function DecisionTerminal({ experience }: DecisionTerminalProps) {
  return (
    <aside
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} overflow-y-auto`}
      data-experience-id={experience.id}
      data-testid="decision-terminal"
      aria-label="Decision Terminal"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Decision Terminal
      </p>
      <p className="mt-2 text-sm font-medium text-embed-foreground-primary">
        {experience.title}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">
        {experience.summary}
      </p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Why this recommendation
      </p>
      <ul
        className="mt-1 list-disc space-y-2 pl-4 text-sm text-embed-foreground-primary/70"
        data-testid="decision-terminal-evidence"
      >
        {experience.evidence.map((item) => (
          <li key={item.id}>
            <span className="font-medium text-embed-foreground-primary">
              {item.title}
            </span>
            <span className="mt-0.5 block text-embed-foreground-primary/70">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Focus
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70">
        {experience.focus.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Recommendations
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70">
        {experience.recommendations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}
