import type { ReactNode } from 'react';

import { SpatialLightbox } from '../SpatialLightbox';

type FloorPlanLightboxProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  /** Real floorplan width/height ratio — never a virtual 16:9 box (TOUR-17 / TOUR-22). */
  aspectRatio: number;
};

/**
 * Floor-plan popup sized to the real plan aspect (~90% limiting viewport axis).
 * Close control is anchored to the rendered plan frame corner (TOUR-22).
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
      frameClassName="overflow-hidden"
      frameStyle={frameStyle}
      isOpen={isOpen}
      label="Zvětšený půdorys"
      onClose={onClose}
    >
      {children}
    </SpatialLightbox>
  );
}
