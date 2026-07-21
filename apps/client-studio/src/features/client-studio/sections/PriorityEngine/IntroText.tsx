import type { Experience } from '@embed-engine/core/experience';

import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from './priority-engine-layout';

type IntroTextProps = {
  experience: Experience;
};

/**
 * Placeholder terminal surface — receives composed Experience without changing copy.
 */
export function IntroText({ experience }: IntroTextProps) {
  return (
    <div
      className={PRIORITY_ENGINE_INTRO_PANEL_CLASS}
      data-experience-id={experience.id}
      data-testid="experience-placeholder"
    >
      <p className="text-sm font-medium leading-relaxed text-embed-foreground-primary">
        Calibrate your decision filter
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/70">
        Select the priorities that matter most to you. Your choices define how this property will
        be interpreted — not how it is scored.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/70">
        Adjust importance for each selected priority to reflect what truly influences your decision.
      </p>
    </div>
  );
}
