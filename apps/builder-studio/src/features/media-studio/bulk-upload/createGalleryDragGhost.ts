/**
 * BU-002A — Gallery reorder ghost: real semi-transparent photo under the cursor.
 */

export function createGalleryDragGhost(sourceImg: HTMLImageElement): {
  readonly element: HTMLElement;
  readonly cleanup: () => void;
} {
  const ghost = document.createElement('div');
  ghost.style.cssText = [
    'position: fixed',
    'top: -1000px',
    'left: -1000px',
    'width: 120px',
    'height: 90px',
    'border-radius: 12px',
    'overflow: hidden',
    'opacity: 0.72',
    'box-shadow: 0 8px 24px rgba(0, 25, 48, 0.25)',
    'border: 2px solid #ffffff',
    'pointer-events: none',
    'z-index: 10000',
  ].join(';');

  const clone = sourceImg.cloneNode(true) as HTMLImageElement;
  clone.alt = '';
  clone.style.cssText =
    'width: 100%; height: 100%; object-fit: cover; display: block;';
  ghost.appendChild(clone);
  document.body.appendChild(ghost);

  return {
    element: ghost,
    cleanup: () => {
      ghost.remove();
    },
  };
}
