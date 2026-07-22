import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { getHeroMediaProjection } from '../../runtime/synchronizedExperience';

/** Primary visual from projected `activeRoom.heroMedia`. */
export function HeroImage() {
  const { experience } = useDecisionSessionRuntime();
  const hero = getHeroMediaProjection(experience);
  const heroSrc = hero.primaryMediaUrl;

  if (heroSrc === null) {
    return (
      <div className="relative h-full min-h-0 w-full overflow-hidden bg-embed-surface-muted" />
    );
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-embed-surface-muted">
      <img
        src={heroSrc}
        alt={hero.title}
        className="h-full w-full object-cover"
        data-room-id={experience.activeRoom?.id ?? undefined}
        data-media-id={hero.heroMedia?.id ?? undefined}
      />
    </div>
  );
}
