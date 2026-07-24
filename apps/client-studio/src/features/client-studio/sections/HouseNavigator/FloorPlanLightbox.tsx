import type { ReactNode } from 'react';

import { SpatialLightbox } from '../SpatialLightbox';

type FloorPlanLightboxProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  /** width / height — keeps the popup image fully visible (TOUR-15). */
  aspectRatio: number;
};

/**
 * Floor-plan popup — image uses ~90% of the limiting viewport axis,
 * preserves aspect ratio, and stays fully on-screen (TOUR-15).
 */
export function FloorPlanLightbox({
  children,
  isOpen,
  onClose,
  aspectRatio,
}: FloorPlanLightboxProps) {
  const safeRatio = aspectRatio > 0 ? aspectRatio : 1;
  const frameStyle = {
    width: `min(90vw, calc(90vh * ${safeRatio}))`,
    height: `min(90vh, calc(90vw / ${safeRatio}))`,
    aspectRatio: String(safeRatio),
  } as const;

  return (
    <SpatialLightbox
      frameClassName="max-h-[90vh] max-w-[90vw]"
      frameStyle={frameStyle}
      isOpen={isOpen}
      label="Zvětšený půdorys"
      onClose={onClose}
    >
      {children}
    </SpatialLightbox>
  );
}
