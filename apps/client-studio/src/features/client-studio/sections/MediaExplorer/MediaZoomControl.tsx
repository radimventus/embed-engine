import { SpatialZoomControl } from '../SpatialZoomControl';

type MediaZoomControlProps = {
  onClick: () => void;
};

export function MediaZoomControl({ onClick }: MediaZoomControlProps) {
  return <SpatialZoomControl label="Zvětšit náhled" onClick={onClick} />;
}
