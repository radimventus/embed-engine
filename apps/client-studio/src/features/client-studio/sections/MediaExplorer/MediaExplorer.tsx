import { MainMedia } from './MainMedia';
import { SectionHeader } from './SectionHeader';
import { ThumbnailRail } from './ThumbnailRail';
import {
  SPATIAL_TERMINAL_MEDIA_TERMINAL_CONTENT_CLASS,
  SPATIAL_TERMINAL_MEDIA_TERMINAL_SECTION_CLASS,
} from '../spatial-terminal-layout';

/**
 * Media projection column (CSCB-03 / TOUR-29).
 * Thumbnail rail sits on the shared bottom baseline with Tour toggles
 * when the floorplan column drives section height.
 */
export function MediaExplorer() {
  return (
    <section
      aria-label="Media Explorer"
      className={SPATIAL_TERMINAL_MEDIA_TERMINAL_SECTION_CLASS}
    >
      <div
        className={`${SPATIAL_TERMINAL_MEDIA_TERMINAL_CONTENT_CLASS} flex min-h-0 flex-1 flex-col content-start`}
      >
        <SectionHeader title="PROCHÁZKA DOMEM" />
        <MainMedia />
        <div className="mt-auto w-full shrink-0">
          <ThumbnailRail />
        </div>
      </div>
    </section>
  );
}
