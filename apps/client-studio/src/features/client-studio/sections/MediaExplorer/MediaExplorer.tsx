import { MainMedia } from './MainMedia';
import { SectionHeader } from './SectionHeader';
import { ThumbnailRail } from './ThumbnailRail';
import {
  SPATIAL_TERMINAL_MEDIA_TERMINAL_CONTENT_CLASS,
  SPATIAL_TERMINAL_MEDIA_TERMINAL_SECTION_CLASS,
} from '../spatial-terminal-layout';

/**
 * Media projection column.
 * Thumbnail rail sits on the shared bottom baseline with Tour toggles.
 */
export function MediaExplorer() {
  return (
    <section
      aria-label="Media Explorer"
      className={`${SPATIAL_TERMINAL_MEDIA_TERMINAL_SECTION_CLASS} tabletMin:col-start-1 tabletMin:row-start-1`}
    >
      <div
        className={`${SPATIAL_TERMINAL_MEDIA_TERMINAL_CONTENT_CLASS} flex min-h-0 flex-1 flex-col content-start`}
      >
        <div className="mobile:[&>*]:!h-8 mobile:[&>*]:!min-h-8"><SectionHeader title="PROCHÁZKA DOMEM" /></div>
        <div
        data-responsive-main-media="true"
        className="min-w-0 mobile:aspect-video mobile:overflow-hidden mobile:[&>*]:!h-full mobile:[&>*]:!min-h-0 mobile:[&>*]:!w-full"
      >
        <MainMedia />
      </div>
        <div className="mt-auto w-full shrink-0 mobile:mt-0">
          <ThumbnailRail />
        </div>
      </div>
    </section>
  );
}
