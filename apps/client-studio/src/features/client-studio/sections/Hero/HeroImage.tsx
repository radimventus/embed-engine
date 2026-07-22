import { useState } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { resolvePublicAssetUrl } from '../../runtime/presentationAssetBase';

/**
 * Primary visual from Experience Context hero media (Reference House Package).
 * Keeps Hero layout; only ensures the reference hero image paints (PT-TOUR-01B).
 */
export function HeroImage() {
  const { experience } = useDecisionSessionRuntime();
  const hero = experience.context.hero;
  const object = experience.context.object;
  const media = hero.heroMedia;
  const mediaSrc =
    hero.primaryMediaUrl !== null
      ? resolvePublicAssetUrl(hero.primaryMediaUrl)
      : null;
  const alt = media?.title ?? object.title;
  const [failed, setFailed] = useState(false);

  if (mediaSrc === null || media === null || failed) {
    return (
      <div
        className="relative flex h-full min-h-[16rem] w-full items-center justify-center overflow-hidden bg-embed-surface-muted px-4 text-center text-sm text-embed-foreground-primary/55"
        aria-label="Médium objektu není k dispozici"
      >
        Médium objektu není k dispozici
      </div>
    );
  }

  if (media.kind === 'video') {
    return (
      <div className="relative h-full min-h-[16rem] w-full overflow-hidden bg-embed-surface-muted">
        <video
          className="h-full w-full object-cover"
          src={mediaSrc}
          poster={
            media.thumbnailUrl !== mediaSrc
              ? resolvePublicAssetUrl(media.thumbnailUrl)
              : undefined
          }
          controls
          playsInline
          preload="metadata"
          data-object-id={object.id}
          data-media-id={media.id}
          aria-label={alt}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <section
      role="img"
      aria-label={alt}
      className="relative h-full min-h-0 w-full bg-cover bg-[center_42%] bg-no-repeat"
      style={{ backgroundImage: `url('${mediaSrc}')` }}
      data-object-id={object.id}
      data-media-id={media.id}
    >
      <img
        src={mediaSrc}
        alt={alt}
        className="pointer-events-none absolute h-px w-px opacity-0"
        onError={() => setFailed(true)}
      />
    </section>
  );
}
