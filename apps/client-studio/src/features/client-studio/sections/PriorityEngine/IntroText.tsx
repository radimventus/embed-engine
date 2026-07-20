import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from './priority-engine-layout';

export function IntroText() {
  return (
    <div className={PRIORITY_ENGINE_INTRO_PANEL_CLASS}>
      <p className="text-sm font-medium leading-relaxed text-embed-foreground-primary">
        This experience adapts to you
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/70">
        Walk the house — open rooms, switch floors, browse gallery photos, or ask a question.
        Each action becomes a Signal. Priorities update from Interpretation, not from static
        marketing copy.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/70">
        Watch the numbers, highlights, and timeline below the cards. That is the engine reacting
        in real time.
      </p>
    </div>
  );
}
