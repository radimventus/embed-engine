import { useEffect, useRef, useState } from 'react';

import { useWalkthrough } from '../../../walkthrough';
import { DECISION_TRANSITION_EASING } from '../../../walkthrough/transition-tokens';
import { useDecisionCrossfade } from '../../../walkthrough/useDecisionCrossfade';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

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
 * Media Explorer viewport — Experience Context room media only (CAP-HP-003.5).
 */
export function MainMedia() {
  const { experience } = useDecisionSessionRuntime();
  const gallery = experience.context.roomMedia;
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
  const [mediaFailed, setMediaFailed] = useState(false);
  const [mediaPending, setMediaPending] = useState(true);

  const activeMediaItem = (() => {
    const selected = gallery.thumbnails[activeMediaIndex] ?? null;
    if (mediaMode !== 'photo') {
      return selected;
    }
    if (selected !== null && selected.kind === 'photo') {
      return selected;
    }
    return gallery.thumbnails.find((item) => item.kind === 'photo') ?? selected;
  })();
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
    setMediaFailed(false);
    setMediaPending(true);
  }, [mediaMode, videoSrc, activeRoomId, mode, activeMediaSrc]);

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
        {mediaFailed ? (
          <div
            className="flex h-full w-full items-center justify-center bg-embed-surface-muted px-4 text-center text-sm text-embed-foreground-primary/55"
            role="status"
            aria-live="polite"
          >
            Médium se nepodařilo načíst
          </div>
        ) : showPhoto ? (
          <img
            src={photoSrc}
            alt={previewAlt}
            className="h-full w-full object-cover"
            data-walkthrough-mode={mode}
            data-media-mode={mediaMode}
            onLoad={() => setMediaPending(false)}
            onError={() => {
              setMediaPending(false);
              setMediaFailed(true);
            }}
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
              onLoadedData={() => setMediaPending(false)}
              onError={() => {
                setMediaPending(false);
                setMediaFailed(true);
              }}
              data-walkthrough-mode={mode}
              data-media-mode={mediaMode}
            />
            {showPlayControl ? <PlayControl onPlay={handlePlay} /> : null}
          </>
        )}
        {mediaPending && !mediaFailed ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-embed-surface-muted/80 text-sm text-embed-foreground-primary/55"
            role="status"
            aria-live="polite"
          >
            Načítám médium…
          </div>
        ) : null}
      </div>
      {!mediaFailed ? (
        <MediaZoomControl onClick={() => setIsLightboxOpen(true)} />
      ) : null}
      <MediaLightbox
        alt={previewAlt}
        isOpen={isLightboxOpen && !mediaFailed}
        kind={showPhoto ? 'photo' : 'video'}
        poster={videoPoster}
        src={showPhoto ? photoSrc : videoSrc}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}
