import { useEffect, type CSSProperties, type ReactNode } from 'react';
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
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      aria-label={label}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-embed-brand-navy/70"
      role="dialog"
      onClick={onClose}
    >
      <div
        className={`relative ${frameClassName}`}
        style={frameStyle}
        data-lightbox-frame=""
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Zavřít"
          className="absolute right-0 top-0 z-20 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#001930] text-xl leading-none text-white shadow-sm transition-opacity duration-150 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2"
          onClick={onClose}
        >
          ×
        </button>
        <div className="h-full w-full">{children}</div>
      </div>
    </div>,
    document.querySelector('[data-client-studio-root]') ?? document.body,
  );
}
