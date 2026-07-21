import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from './priority-engine-layout';

export function IntroText() {
  return (
    <div className={PRIORITY_ENGINE_INTRO_PANEL_CLASS}>
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
