import { usePriorityExperience } from './PriorityExperienceProvider';
import {
  PRIORITY_ENGINE_TITLE_BAND_CLASS,
  PRIORITY_ENGINE_TITLE_CLASS,
} from './priority-engine-layout';

/**
 * Priority Experience header — progressive disclosure of selection progress (CSCB-04).
 */
export function SectionHeader() {
  const { selectedCount, minimumSelection, minimumMet } = usePriorityExperience();

  return (
    <div className={PRIORITY_ENGINE_TITLE_BAND_CLASS}>
      <h2 className={PRIORITY_ENGINE_TITLE_CLASS}>
        CO JE PRO VÁS PODSTATNÉ? VYBERTE {minimumSelection} PRIORITY.
      </h2>
      <p
        className={`mt-2 text-sm ${
          minimumMet
            ? 'text-embed-foreground-primary/70'
            : 'text-embed-foreground-primary/55'
        }`}
        aria-live="polite"
      >
        {minimumMet
          ? `Vybráno ${selectedCount}. Rozhodovací terminál vpravo reaguje na vaše priority.`
          : `Vybráno ${selectedCount} z ${minimumSelection}. Volby můžete kdykoli změnit.`}
      </p>
    </div>
  );
}
