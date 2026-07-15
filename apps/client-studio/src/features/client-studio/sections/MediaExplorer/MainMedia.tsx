import { useEffect, useRef } from 'react';

import { HOUSE_PACKAGE, useWalkthrough } from '../../../walkthrough';
import {
  DECISION_TRANSITION_EASING,
} from '../../../walkthrough/transition-tokens';
import { useDecisionCrossfade } from '../../../walkthrough/useDecisionCrossfade';

import { PlayControl } from './PlayControl';

function buildMediaKey(
  mediaMode: string,
  mode: string,
  activeRoomId: string | null,
  activePhotoSrc: string | null,
): string {
  if (mediaMode === 'photo' && activePhotoSrc !== null) {
    return `photo|${activeRoomId ?? 'none'}|${activePhotoSrc}`;
  }

  return `video|${mode}`;
}

function parsePhotoSrc(displayKey: string): string | null {
  if (!displayKey.startsWith('photo|')) {
    return null;
  }

  const parts = displayKey.split('|');
  return parts[2] ?? null;
}

export function MainMedia() {
  const { mode, mediaMode, activePhotoSrc, activeRoomId, play, onVideoEnded } = useWalkthrough();
  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaKey = buildMediaKey(mediaMode, mode, activeRoomId, activePhotoSrc);
  const { displayKey, opacity, phaseMs } = useDecisionCrossfade(mediaKey);

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) {
      return;
    }

    if (mode === 'photo') {
      video.pause();
      video.currentTime = 0;
      return;
    }

    if (mode === 'playing') {
      void video.play();
      return;
    }

    video.pause();
  }, [mode]);

  const photoSrc = parsePhotoSrc(displayKey);
  const showPhoto = photoSrc !== null;

  return (
    <div className="relative mt-section flex aspect-video w-full shrink-0 grow-0 items-center justify-center overflow-hidden border border-embed-border-default bg-embed-status-warning/15">
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity,
          transitionDuration: `${phaseMs}ms`,
          transitionTimingFunction: DECISION_TRANSITION_EASING,
        }}
      >
        {showPhoto ? (
          <img
            src={photoSrc}
            alt=""
            className="h-full w-full object-cover"
            data-walkthrough-mode={mode}
            data-media-mode={mediaMode}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={HOUSE_PACKAGE.walkthroughVideoSrc}
              poster={HOUSE_PACKAGE.walkthroughVideoPoster}
              className="h-full w-full object-cover"
              playsInline
              preload="metadata"
              onEnded={onVideoEnded}
              data-walkthrough-mode={mode}
              data-media-mode={mediaMode}
            />
            {mode === 'ready' ? <PlayControl onPlay={play} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
