import { MainMedia } from './MainMedia';
import { SectionHeader } from './SectionHeader';
import { ThumbnailRail } from './ThumbnailRail';

export function MediaExplorer() {
  return (
    <section
      aria-label="Media Explorer"
      className="border-b border-embed-border-default px-4 py-6 md:px-8 md:py-8"
    >
      <SectionHeader title="PROCHÁZKA DOMEM" />
      <MainMedia />
      <ThumbnailRail />
    </section>
  );
}
