import type { CSSProperties } from 'react';

import { SpatialZoomControl } from '../SpatialZoomControl';

type FloorPlanZoomControlProps = {
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
};

export function FloorPlanZoomControl({
  onClick,
  className = 'relative z-10',
  style,
}: FloorPlanZoomControlProps) {
  return (
    <SpatialZoomControl
      label="Zvětšit půdorys"
      className={className}
      style={style}
      onClick={onClick}
    />
  );
}
