import type { Experience } from '@embed-engine/core/experience';

import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from './priority-engine-layout';

type IntroTextProps = {
  experience: Experience;
};

/**
 * Decision Terminal placeholder — renders composed Experience only.
 * Does not interpret Priority; PriorityEngine owns composition.
 */
export function IntroText({ experience }: IntroTextProps) {
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
