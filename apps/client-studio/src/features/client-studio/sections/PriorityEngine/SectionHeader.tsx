import {
  PRIORITY_ENGINE_TITLE_BAND_CLASS,
  PRIORITY_ENGINE_TITLE_CLASS,
} from './priority-engine-layout';
import { usePriorityExperience } from './PriorityExperienceProvider';

/**
 * Priority Experience header — title only (PT-PRIORITY-REDESIGN-01).
 * Selection progress copy removed; cards follow immediately.
 */
export function SectionHeader() {
  const { minimumSelection } = usePriorityExperience();

  return (
    <div className={PRIORITY_ENGINE_TITLE_BAND_CLASS}>
      <h2 className={PRIORITY_ENGINE_TITLE_CLASS}>
        CO JE PRO VÁS PODSTATNÉ? VYBERTE {minimumSelection} PRIORITY.
      </h2>
    </div>
  );
}
