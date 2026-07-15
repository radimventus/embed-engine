import { MainMedia } from './MainMedia';
import { SectionHeader } from './SectionHeader';
import { ThumbnailRail } from './ThumbnailRail';

export function MediaExplorer() {
  return (
    <section
      aria-label="Media Explorer"
      className="grid h-full shrink-0 grid-rows-[auto_auto_auto] px-section py-section"
    >
      <SectionHeader title="PROCHÁZKA DOMEM" />
      <MainMedia />
      <ThumbnailRail />
    </section>
  );
}
