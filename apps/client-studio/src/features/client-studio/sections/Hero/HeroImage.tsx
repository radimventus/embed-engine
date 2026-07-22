import { getHousePresentationAssets } from '../../../walkthrough';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { getHeroMediaProjection } from '../../runtime/synchronizedExperience';

/** Primary visual from projected room media (CAP-HP-003.3). */
export function HeroImage() {
  const { experience } = useDecisionSessionRuntime();
  const hero = getHeroMediaProjection(experience);
  const assets = getHousePresentationAssets();
  const heroSrc = hero.primaryMediaUrl || assets.openingHeroSrc;

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-embed-surface-muted">
      <img
        src={heroSrc}
        alt={hero.title}
        className="h-full w-full object-cover"
        data-room-id={experience.roomMedia?.roomId ?? undefined}
      />
    </div>
  );
}
