import { useEffect, useRef, useState } from 'react';

import { HOUSE_PACKAGE, useWalkthrough } from '../../../walkthrough';
import { DECISION_TRANSITION_EASING } from '../../../walkthrough/transition-tokens';
import { useDecisionCrossfade } from '../../../walkthrough/useDecisionCrossfade';

import { PlayControl } from './PlayControl';

function buildMediaKey(
  mediaMode: string,
  mode: string,
  activeRoomId: string | null,
  activeMediaSrc: string | null,
): string {
  if (mediaMode === 'photo' && activeMediaSrc !== null) {
    return `photo|${activeRoomId ?? 'none'}|${activeMediaSrc}`;
  }

  if (mediaMode === 'video' && activeRoomId !== null && activeMediaSrc !== null) {
    return `video|${activeRoomId}|${activeMediaSrc}`;
  }

  return `video|intro|${mode}`;
}

function parsePhotoSrc(displayKey: string): string | null {
  if (!displayKey.startsWith('photo|')) {
    return null;
  }

  const parts = displayKey.split('|');
  return parts[2] ?? null;
}

export function MainMedia() {
  const {
    mode,
    mediaMode,
    activeMediaSrc,
    activeRoomId,
    activeRoom,
    play,
    onVideoEnded,
  } = useWalkthrough();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);

  const isRoomVideo = activeRoomId !== null && mediaMode === 'video';
  const videoSrc = isRoomVideo
    ? (activeRoom?.videoSrc ?? HOUSE_PACKAGE.walkthroughVideoSrc)
    : HOUSE_PACKAGE.walkthroughVideoSrc;
  const videoPoster = isRoomVideo
    ? (activeRoom?.heroSrc ?? HOUSE_PACKAGE.walkthroughVideoPoster)
    : HOUSE_PACKAGE.walkthroughVideoPoster;
  const videoKey = `${videoSrc}|${activeRoomId ?? 'intro'}|${mediaMode}`;

  const mediaKey = buildMediaKey(mediaMode, mode, activeRoomId, activeMediaSrc);
  const { displayKey, opacity, phaseMs } = useDecisionCrossfade(mediaKey);

  useEffect(() => {
    setHasStartedPlayback(false);
  }, [mediaMode, videoSrc, activeRoomId, mode]);

  useEffect(() => {
    const video = videoRef.current;

    if (video === null || mediaMode !== 'video') {
      return;
    }

    video.pause();
    video.currentTime = 0;
    video.load();

    if (mode === 'playing') {
      void video.play();
    }
  }, [mediaMode, mode, videoKey, videoSrc]);

  const photoSrc = parsePhotoSrc(displayKey);
  const showPhoto = photoSrc !== null;
  const showPlayControl = mediaMode === 'video' && !hasStartedPlayback;
  const showNativeControls = mediaMode === 'video' && hasStartedPlayback;

  const handlePlay = () => {
    if (mode === 'ready') {
      play();
      return;
    }

    const video = videoRef.current;

    if (video !== null) {
      void video.play();
    }
  };

  const handleVideoPlay = () => {
    setHasStartedPlayback(true);
  };

  const handleVideoEnded = () => {
    if (mode === 'playing') {
      onVideoEnded();
    }
  };

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 max-w-full shrink-0 overflow-hidden border border-embed-border-default bg-embed-status-warning/15">
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
              key={videoKey}
              ref={videoRef}
              src={videoSrc}
              poster={videoPoster}
              controls={showNativeControls}
              className="h-full w-full object-cover"
              playsInline
              preload="metadata"
              onPlay={handleVideoPlay}
              onEnded={handleVideoEnded}
              data-walkthrough-mode={mode}
              data-media-mode={mediaMode}
            />
            {showPlayControl ? <PlayControl onPlay={handlePlay} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
