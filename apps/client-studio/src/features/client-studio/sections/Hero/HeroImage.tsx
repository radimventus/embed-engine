import { useState } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

/**
 * Primary visual from Experience Context hero media (Object Package projection).
 * Supports image / render URL and video; empty surface as fallback (BUG-001).
 */
export function HeroImage() {
  const { experience } = useDecisionSessionRuntime();
  const hero = experience.context.hero;
  const object = experience.context.object;
  const media = hero.heroMedia;
  const mediaSrc = hero.primaryMediaUrl;
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
          poster={media.thumbnailUrl !== mediaSrc ? media.thumbnailUrl : undefined}
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
    <div className="relative h-full min-h-[16rem] w-full overflow-hidden bg-embed-surface-muted">
      <img
        src={mediaSrc}
        alt={alt}
        className="h-full w-full object-cover"
        data-object-id={object.id}
        data-media-id={media.id}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
