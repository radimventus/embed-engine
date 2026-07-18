import { SpatialLightbox } from '../SpatialLightbox';

type MediaLightboxProps = {
  alt: string;
  isOpen: boolean;
  kind: 'photo' | 'video';
  onClose: () => void;
  poster?: string;
  src: string;
};

/** 16:9 frame at 90% viewport — matches the media display aspect. */
const MEDIA_LIGHTBOX_FRAME_CLASS =
  'aspect-video w-[min(90vw,calc(90vh*16/9))] max-h-[90vh] max-w-[90vw]';

export function MediaLightbox({
  alt,
  isOpen,
  kind,
  onClose,
  poster,
  src,
}: MediaLightboxProps) {
  return (
    <SpatialLightbox
      frameClassName={MEDIA_LIGHTBOX_FRAME_CLASS}
      isOpen={isOpen}
      label="Zvětšený náhled"
      onClose={onClose}
    >
      {kind === 'photo' ? (
        <img alt={alt} className="h-full w-full object-contain" src={src} />
      ) : (
        <video
          key={src}
          src={src}
          poster={poster}
          controls
          playsInline
          autoPlay
          className="h-full w-full object-contain"
        />
      )}
    </SpatialLightbox>
  );
}
