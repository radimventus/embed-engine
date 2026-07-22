import { SegmentedControl } from '@embed-engine/ui';

import { useHouseNavigator } from './useHouseNavigator';

function floorLabel(floor: string): string {
  if (floor === '0') {
    return 'PŘÍZEMÍ';
  }

  return 'PATRO';
}

/**
 * Floor filter derived from projected activeRoom — no local selectedFloor state.
 */
export function FloorSelector() {
  const { floors, selectedFloor, selectFloor } = useHouseNavigator();

  if (floors.length < 2) {
    return null;
  }

  return (
    <SegmentedControl
      aria-label="Výběr patra"
      theme="navy"
      value={selectedFloor || floors[0]}
      onChange={selectFloor}
      options={floors.map((floor) => ({
        value: floor,
        label: floorLabel(floor),
      }))}
    />
  );
}
