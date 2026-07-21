import { usePriorityExperience } from './usePriorityExperience';
import {
  PRIORITY_ENGINE_TITLE_BAND_CLASS,
  PRIORITY_ENGINE_TITLE_CLASS,
} from './priority-engine-layout';

/**
 * Section header — product framing + Interpretation.activeTopic when ready.
 */
export function SectionHeader() {
  const { status, activeTopic } = usePriorityExperience();

  return (
    <div className={PRIORITY_ENGINE_TITLE_BAND_CLASS}>
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <h2 className={PRIORITY_ENGINE_TITLE_CLASS}>
          Priorita — co je pro vás důležité?
        </h2>
        {status === 'ready' && activeTopic ? (
          <p
            className="m-0 truncate text-xs font-medium tracking-wide text-embed-foreground-primary/55"
            data-testid="priority-active-topic"
          >
            Aktivní Priorita: {activeTopic}
          </p>
        ) : null}
      </div>
    </div>
  );
}
