import { SpatialZoomControl } from '../SpatialZoomControl';

type FloorPlanZoomControlProps = {
  onClick: () => void;
};

export function FloorPlanZoomControl({ onClick }: FloorPlanZoomControlProps) {
  return <SpatialZoomControl label="Zvětšit půdorys" onClick={onClick} />;
}
