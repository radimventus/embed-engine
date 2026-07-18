import type { ReactNode } from 'react';

import { SpatialLightbox } from '../SpatialLightbox';

type FloorPlanLightboxProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

const FLOOR_PLAN_LIGHTBOX_FRAME_CLASS =
  'aspect-square w-[min(90vw,90vh)] max-h-[90vh] max-w-[90vw]';

export function FloorPlanLightbox({ children, isOpen, onClose }: FloorPlanLightboxProps) {
  return (
    <SpatialLightbox
      frameClassName={FLOOR_PLAN_LIGHTBOX_FRAME_CLASS}
      isOpen={isOpen}
      label="Zvětšený půdorys"
      onClose={onClose}
    >
      {children}
    </SpatialLightbox>
  );
}
