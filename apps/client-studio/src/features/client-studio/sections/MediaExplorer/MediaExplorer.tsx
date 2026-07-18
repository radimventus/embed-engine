import { MainMedia } from './MainMedia';
import { SectionHeader } from './SectionHeader';
import { ThumbnailRail } from './ThumbnailRail';
import {
  SPATIAL_TERMINAL_MEDIA_TERMINAL_CONTENT_CLASS,
  SPATIAL_TERMINAL_MEDIA_TERMINAL_SECTION_CLASS,
} from '../spatial-terminal-layout';

export function MediaExplorer() {
  return (
    <section
      aria-label="Media Explorer"
      className={SPATIAL_TERMINAL_MEDIA_TERMINAL_SECTION_CLASS}
    >
      <div
        className={`${SPATIAL_TERMINAL_MEDIA_TERMINAL_CONTENT_CLASS} grid min-h-0 grid-rows-[auto_auto_auto] content-start`}
      >
        <SectionHeader title="PROCHÁZKA DOMEM" />
        <MainMedia />
        <ThumbnailRail />
      </div>
    </section>
  );
}
