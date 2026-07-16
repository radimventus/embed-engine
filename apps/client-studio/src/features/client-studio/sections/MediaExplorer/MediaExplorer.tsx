import { MainMedia } from './MainMedia';
import { SectionHeader } from './SectionHeader';
import { ThumbnailRail } from './ThumbnailRail';
import { SPATIAL_TERMINAL_SECTION_CLASS } from '../spatial-terminal-layout';

export function MediaExplorer() {
  return (
    <section
      aria-label="Media Explorer"
      className={`${SPATIAL_TERMINAL_SECTION_CLASS} grid h-full min-h-0 shrink-0 grid-rows-[auto_minmax(0,1fr)_theme(height.thumbnail-rail)] content-start`}
    >
      <SectionHeader title="PROCHÁZKA DOMEM" />
      <MainMedia />
      <ThumbnailRail />
    </section>
  );
}
