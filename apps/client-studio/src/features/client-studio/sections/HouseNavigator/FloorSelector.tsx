import {
  SEGMENTED_CONTROL_SEGMENT_ACTIVE_CLASS,
  SEGMENTED_CONTROL_SEGMENT_DISABLED_CLASS,
  SEGMENTED_CONTROL_SHELL_CLASS,
} from '../spatial-terminal-layout';

export function FloorSelector() {
  return (
    <div aria-label="Výběr patra" className={SEGMENTED_CONTROL_SHELL_CLASS}>
      <button type="button" aria-pressed={true} className={SEGMENTED_CONTROL_SEGMENT_ACTIVE_CLASS}>
        PŘÍZEMÍ
      </button>
      <button type="button" disabled aria-pressed={false} className={SEGMENTED_CONTROL_SEGMENT_DISABLED_CLASS}>
        PATRO
      </button>
    </div>
  );
}
