import { useState } from 'react';
import { SegmentedControl } from '@embed-engine/ui';

import { HOUSE_PACKAGE } from '../../../walkthrough';

function uniqueFloors(): string[] {
  return [...new Set(HOUSE_PACKAGE.rooms.map((room) => room.floor))];
}

function floorLabel(floor: string): string {
  if (floor === 'ground-floor') {
    return 'PŘÍZEMÍ';
  }

  return 'PATRO';
}

export function FloorSelector() {
  const floors = uniqueFloors();
  const [selectedFloor, setSelectedFloor] = useState(floors[0] ?? '');

  if (floors.length < 2) {
    return null;
  }

  return (
    <SegmentedControl
      aria-label="Výběr patra"
      theme="navy"
      value={selectedFloor}
      onChange={setSelectedFloor}
      options={floors.map((floor) => ({
        value: floor,
        label: floorLabel(floor),
      }))}
    />
  );
}
