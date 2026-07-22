import { useEffect, useRef, useState } from 'react';

import { useWalkthrough } from '../../../walkthrough';
import { DECISION_TRANSITION_EASING } from '../../../walkthrough/transition-tokens';
import { useDecisionCrossfade } from '../../../walkthrough/useDecisionCrossfade';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { getGalleryMediaProjection } from '../../runtime/synchronizedExperience';

import { MediaLightbox } from './MediaLightbox';
import { MediaZoomControl } from './MediaZoomControl';
import { PlayControl } from './PlayControl';
import { SPATIAL_TERMINAL_MEDIA_VIEWPORT_CLASS } from '../spatial-terminal-layout';

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

/**
 * Media Explorer viewport — projected gallery assets only (CAP-HP-003.4).
 */
export function MainMedia() {
  const { experience } = useDecisionSessionRuntime();
  const gallery = getGalleryMediaProjection(experience);
  const {
    mode,
    mediaMode,
    activeMediaIndex,
    play,
    onVideoEnded,
  } = useWalkthrough();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeMediaItem = gallery.thumbnails[activeMediaIndex] ?? null;
  const activeMediaSrc = activeMediaItem?.src ?? null;
  const activeRoomId = gallery.roomId;

  const isRoomVideo = activeRoomId !== null && mediaMode === 'video';
  const videoSrc = isRoomVideo
    ? (gallery.videoUrl ?? gallery.videos[0]?.url ?? '')
    : (gallery.videos[0]?.url ?? '');
  const videoPoster = isRoomVideo
    ? (gallery.heroUrl ?? gallery.heroMedia?.thumbnailUrl ?? '')
    : (gallery.heroUrl ?? '');
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
  const previewAlt = showPhoto
    ? (gallery.title ?? 'Fotografie místnosti')
    : 'Náhled procházky domem';

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
    <div className={SPATIAL_TERMINAL_MEDIA_VIEWPORT_CLASS}>
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity,
          transitionDuration: `${phaseMs}ms`,
          transitionTimingFunction: DECISION_TRANSITION_EASING,
        }}
        data-room-id={activeRoomId ?? undefined}
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
      <MediaZoomControl onClick={() => setIsLightboxOpen(true)} />
      <MediaLightbox
        alt={previewAlt}
        isOpen={isLightboxOpen}
        kind={showPhoto ? 'photo' : 'video'}
        poster={videoPoster}
        src={showPhoto ? photoSrc : videoSrc}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}
