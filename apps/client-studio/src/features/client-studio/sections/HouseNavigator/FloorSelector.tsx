import { SegmentedControl } from '@embed-engine/ui';

import { useWalkthrough } from '../../../walkthrough';

function floorLabel(floor: string): string {
  if (floor === 'ground-floor') {
    return 'PŘÍZEMÍ';
  }

  return 'PATRO';
}

export function FloorSelector() {
  const { rooms, selectedFloor, selectFloor } = useWalkthrough();
  const floors = [...new Set(rooms.map((room) => room.floor))];

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
