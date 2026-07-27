import { useHouseNavigator } from './useHouseNavigator';
import { TourSegmentedControl } from './TourSegmentedControl';

function floorLabel(floor: string): string {
  if (floor === '0') {
    return 'PŘÍZEMÍ';
  }

  return 'PATRO';
}

/**
 * Floor filter — same visual language as VIDEO / FOTKY (TOUR-12).
 * Shown only when the Object Package has more than one floor.
 */
export function FloorSelector() {
  const { floors, selectedFloor, selectFloor } = useHouseNavigator();

  if (floors.length < 2) {
    return null;
  }

  const activeFloor = selectedFloor || floors[0];
  const options = floors.map((floor) => ({
    value: floor,
    label: floorLabel(floor),
  }));

  return (
    <TourSegmentedControl
      aria-label="Výběr patra"
      value={activeFloor}
      options={options}
      onChange={selectFloor}
    />
  );
}
