import { getHousePresentationAssets } from '../../../walkthrough';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

/** Opening visual — prefers projected house media, falls back to presentation catalog. */
export function HeroImage() {
  const { experience } = useDecisionSessionRuntime();
  const assets = getHousePresentationAssets();
  const projectedImage = experience.house.media.find(
    (asset) => asset.type === 'image',
  );
  const heroSrc = projectedImage?.url || assets.openingHeroSrc;

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-embed-surface-muted">
      <img
        src={heroSrc}
        alt={experience.house.title}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
