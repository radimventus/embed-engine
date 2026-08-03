import { useEffect, useRef, useState } from 'react';

import { useWalkthrough } from '../../../walkthrough';
import { DECISION_TRANSITION_EASING } from '../../../walkthrough/transition-tokens';
import { useDecisionCrossfade } from '../../../walkthrough/useDecisionCrossfade';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { evidenceLog } from '../../runtime/runtimeEvidence';

import { MediaLightbox } from './MediaLightbox';
import { MediaZoomControl } from './MediaZoomControl';
import { PlayControl } from './PlayControl';
import { useMediaSwipeNavigation } from './useMediaSwipeNavigation';
import { SPATIAL_TERMINAL_MEDIA_VIEWPORT_CLASS } from '../spatial-terminal-layout';

function buildMediaKey(
  mediaMode: string,
  mode: string,
  activeMediaSrc: string | null,
): string {
  if (mediaMode === 'photo' && activeMediaSrc !== null && activeMediaSrc.length > 0) {
    return `photo|${activeMediaSrc}`;
  }

  if (
    mediaMode === 'video' &&
    activeMediaSrc !== null &&
    activeMediaSrc.length > 0
  ) {
    return `video|${activeMediaSrc}`;
  }

  return `video|intro|${mode}`;
}

function parsePhotoSrc(displayKey: string): string | null {
  if (!displayKey.startsWith('photo|')) {
    return null;
  }

  const src = displayKey.slice('photo|'.length);
  if (src.length === 0 || src === 'null' || src === 'undefined') {
    return null;
  }
  return src;
}

/**
 * Media Explorer viewport — Experience Context room media only (CAP-HP-003.5).
 */
function isWistiaEmbedUrl(url: string): boolean {
  return (
    url.includes('fast.wistia.net/embed') ||
    url.includes('wistia.com/embed')
  );
}

export function MainMedia() {
  const { experience } = useDecisionSessionRuntime();
  const gallery = experience.context.roomMedia;
  const {
    mode,
    mediaMode,
    activeMediaIndex,
    play,
    onVideoEnded,
    selectMediaIndex,
  } = useWalkthrough();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [mediaPending, setMediaPending] = useState(true);

  useEffect(() => {
    evidenceLog('3.GalleryRuntime.beforeMainMedia', {
      activeRoomId: gallery.roomId,
      roomMediaTitle: gallery.title,
      heroUrl: gallery.heroUrl,
      videoUrl: gallery.videoUrl,
      thumbnails: gallery.thumbnails.map((item, index) => ({
        index,
        kind: item.kind,
        src: item.src,
      })),
      houseMediaIds: experience.house.media.map((asset) => asset.id),
      globalGalleryPhotos: gallery.gallery.map((item) => ({
        id: item.id,
        url: item.url,
      })),
    });
    evidenceLog('5.ComponentEvidence.MainMedia', {
      roomId: gallery.roomId,
      title: gallery.title,
      heroUrl: gallery.heroUrl,
      videoUrl: gallery.videoUrl,
      photoCount: gallery.gallery.length,
      videoCount: gallery.videos.length,
      thumbnailCount: gallery.thumbnails.length,
      firstThumbnail: gallery.thumbnails[0] ?? null,
      lastThumbnail: gallery.thumbnails[gallery.thumbnails.length - 1] ?? null,
    });
  }, [experience.house.media, gallery]);

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

  /** Single Tour video from the global timeline — never remounted on room change. */
  const videoSrc =
    gallery.thumbnails.find((item) => item.kind === 'video')?.src ??
    gallery.videoUrl ??
    gallery.videos[0]?.url ??
    '';
  const videoPoster =
    gallery.thumbnails.find((item) => item.kind === 'photo')?.thumbnailSrc ??
    '';
  const videoKey = `${videoSrc}|${mediaMode}`;

  const mediaKey = buildMediaKey(mediaMode, mode, activeMediaSrc);
  const { displayKey, opacity, phaseMs } = useDecisionCrossfade(mediaKey);

  useEffect(() => {
    setHasStartedPlayback(false);
    setMediaFailed(false);
    setMediaPending(true);
  }, [mediaMode, videoSrc, mode, activeMediaSrc]);

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

  const photoSrc =
    parsePhotoSrc(displayKey) ??
    (mediaMode === 'photo' ? activeMediaSrc : null);
  const showPhoto =
    mediaMode === 'photo' && photoSrc !== null && photoSrc.length > 0;
  const isWistiaVideo =
    mediaMode === 'video' && !showPhoto && isWistiaEmbedUrl(videoSrc);
  const showPlayControl =
    mediaMode === 'video' && !hasStartedPlayback && !isWistiaVideo;
  const showNativeControls =
    mediaMode === 'video' && hasStartedPlayback && !isWistiaVideo;
  const previewAlt = showPhoto
    ? (gallery.title ?? 'Fotografie místnosti')
    : 'Náhled procházky domem';

  const swipeEnabled =
    !mediaFailed &&
    !isLightboxOpen &&
    gallery.thumbnails.length > 1 &&
    (showPhoto || showPlayControl || isWistiaVideo);

  const swipeHandlers = useMediaSwipeNavigation({
    enabled: swipeEnabled,
    itemCount: gallery.thumbnails.length,
    activeIndex: activeMediaIndex,
    onSelectIndex: selectMediaIndex,
  });

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
    <div
      className={`${SPATIAL_TERMINAL_MEDIA_VIEWPORT_CLASS} touch-pan-y`}
      data-media-swipe={swipeEnabled ? 'on' : 'off'}
      {...swipeHandlers}
    >
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
            className="h-full w-full object-cover mobile:bg-embed-brand-navy mobile:object-contain"
            draggable={false}
            data-walkthrough-mode={mode}
            data-media-mode={mediaMode}
            onLoad={() => setMediaPending(false)}
            onError={() => {
              setMediaPending(false);
              setMediaFailed(true);
            }}
          />
        ) : isWistiaVideo ? (
          <iframe
            key={videoKey}
            src={videoSrc}
            title={gallery.title ?? 'Video prohlídka'}
            className="h-full w-full border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={() => {
              setMediaPending(false);
              setHasStartedPlayback(true);
            }}
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
              className="h-full w-full object-cover mobile:object-contain"
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
      {!mediaFailed && !isWistiaVideo ? (
        <MediaZoomControl onClick={() => setIsLightboxOpen(true)} />
      ) : null}
      <MediaLightbox
        alt={previewAlt}
        isOpen={isLightboxOpen && !mediaFailed && !isWistiaVideo}
        kind={showPhoto ? 'photo' : 'video'}
        poster={videoPoster}
        src={showPhoto ? photoSrc : videoSrc}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}
