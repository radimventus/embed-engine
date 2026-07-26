import {
  PRIORITY_ENGINE_TITLE_BAND_CLASS,
  PRIORITY_ENGINE_TITLE_CLASS,
} from './priority-engine-layout';

/**
 * Priority Experience header — calm section title (PT-PRIORITY-TUNING-02).
 * Imperative selection copy lives in the Conis panel, not the heading.
 */
export function SectionHeader() {
  return (
    <div className={PRIORITY_ENGINE_TITLE_BAND_CLASS}>
      <h2 className={PRIORITY_ENGINE_TITLE_CLASS}>
        Co je pro vás při bydlení podstatné?
      </h2>
    </div>
  );
}
