import { MainMedia } from './MainMedia';
import { SectionHeader } from './SectionHeader';
import { ThumbnailRail } from './ThumbnailRail';
import { SPATIAL_TERMINAL_SECTION_CLASS } from '../spatial-terminal-layout';

export function MediaExplorer() {
  return (
    <section
      aria-label="Media Explorer"
      className={`${SPATIAL_TERMINAL_SECTION_CLASS} h-full shrink-0 content-start`}
    >
      <SectionHeader title="PROCHÁZKA DOMEM" />
      <MainMedia />
      <ThumbnailRail />
    </section>
  );
}
