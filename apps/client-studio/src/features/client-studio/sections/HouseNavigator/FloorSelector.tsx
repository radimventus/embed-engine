import { useHouseNavigator } from './useHouseNavigator';
import {
  TOUR_SEGMENTED_SHELL_CLASS,
  tourSegmentedButtonClass,
} from './MediaModeToggle';

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

  return (
    <div aria-label="Výběr patra" className={TOUR_SEGMENTED_SHELL_CLASS}>
      {floors.map((floor) => {
        const active = floor === activeFloor;

        return (
          <button
            key={floor}
            type="button"
            aria-pressed={active}
            className={tourSegmentedButtonClass(active)}
            onClick={() => selectFloor(floor)}
          >
            {floorLabel(floor)}
          </button>
        );
      })}
    </div>
  );
}
