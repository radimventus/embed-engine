import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

/** Primary visual from Experience Context hero media. */
export function HeroImage() {
  const { experience } = useDecisionSessionRuntime();
  const hero = experience.context.hero;
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
        data-room-id={experience.context.activeRoom.id ?? undefined}
        data-media-id={hero.heroMedia?.id ?? undefined}
      />
    </div>
  );
}
