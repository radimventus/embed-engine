import { CloseButton } from '@embed-engine/ui';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type SpatialLightboxProps = {
  children: ReactNode;
  frameClassName: string;
  frameStyle?: CSSProperties;
  isOpen: boolean;
  label: string;
  onClose: () => void;
};

/**
 * Full-viewport overlay. Close is centered on the top-right corner of the
 * media frame (the real rendered plan box — TOUR-22).
 */
export function SpatialLightbox({
  children,
  frameClassName,
  frameStyle,
  isOpen,
  label,
  onClose,
}: SpatialLightboxProps) {
  const prevOverlayCloseStylesRef = useRef<
    Array<{
      el: HTMLElement;
      display: string;
      visibility: string;
      opacity: string;
    }>
  >([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Popups should visually own the "X" (PNG on the image corner).
    // When running inside Delivery overlay, we hide the overlay-level close
    // to avoid a second X outside the image.
    const overlayCloseEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-embed-close]'),
    );
    prevOverlayCloseStylesRef.current = overlayCloseEls.map((el) => ({
      el,
      display: el.style.display,
      visibility: el.style.visibility,
      opacity: el.style.opacity,
    }));
    overlayCloseEls.forEach((el) => {
      el.style.display = 'none';
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      // Restore overlay close styles.
      prevOverlayCloseStylesRef.current.forEach(
        ({ el, display, visibility, opacity }) => {
          el.style.display = display;
          el.style.visibility = visibility;
          el.style.opacity = opacity;
        },
      );
      prevOverlayCloseStylesRef.current = [];
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      aria-label={label}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-embed-brand-navy/70 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
      role="dialog"
      onClick={onClose}
    >
      {/* Wrapper keeps CloseButton outside overflow-hidden so it stays fully visible. */}
      <div className="relative" onClick={(event) => event.stopPropagation()}>
        <CloseButton
          aria-label="Zavřít"
          className="absolute right-0 top-0 z-20 translate-x-1/2 -translate-y-1/2"
          onClick={onClose}
        />
        <div
          className={frameClassName}
          style={frameStyle}
          data-lightbox-frame=""
        >
          <div className="h-full w-full">{children}</div>
        </div>
      </div>
    </div>,
    document.querySelector('[data-client-studio-root]') ?? document.body,
  );
}
