import { MediaModeToggle } from './MediaModeToggle';
import { RoomPanel } from './RoomPanel';
import { RoomSelect } from './RoomSelect';
import { FloorSelector } from './FloorSelector';
import { useHouseNavigator } from './useHouseNavigator';
import {
  HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS,
  SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS,
  SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS,
} from '../spatial-terminal-layout';

/**
 * Room menu column:
 * 20 px from display (pl), 20 px to floor plan via floor-plan column pl.
 * Title-band spacer matches Media Explorer so Top(menu) == Top(display).
 * Responsive variants preserve canonical room navigation authority; desktop SSOT remains unchanged.
 */
export function RoomIndex() {
  const { floors } = useHouseNavigator();
  const hasMultipleFloors = floors.length >= 2;

  return (
    <section
      aria-label="Seznam místností"
      className="relative z-20 flex h-full min-w-0 shrink-0 flex-col content-start items-stretch gap-0 overflow-x-hidden pb-section pl-[20px] pr-0 tabletMin:col-start-1 tabletMin:row-start-2 tabletMin:px-section mobile:px-0 mobile:pb-2"
    >
      <div className={`${SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS} mobile:hidden`} aria-hidden="true">
        <span className="invisible">.</span>
      </div>
      <div className="hidden min-h-0 flex-1 flex-col justify-start pt-0 tabletMax:flex desktop:flex">
        <RoomPanel />
      </div>

      <div className="hidden w-full mobile:mx-auto mobile:mt-1 mobile:block mobile:w-4/5 tabletMin:block tabletMax:hidden desktop:hidden">
        <RoomSelect />
      </div>

      <div className={`${SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS} hidden justify-center pb-1 tabletMax:flex desktop:flex`}>
        <div className={`${HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS} z-20`}>
          <MediaModeToggle />
        </div>
      </div>

      <div
        className="hidden w-full items-center pt-1 mobile:flex tabletMin:hidden tabletMax:hidden desktop:hidden"
        data-mobile-tour-switch-row
      >
        {hasMultipleFloors ? (
          <>
            <div className="flex w-[40%] justify-start">
              <div className="w-full">
                <MediaModeToggle />
              </div>
            </div>
            <div className="flex w-[40%] justify-end">
              <div className="w-full">
                <FloorSelector />
              </div>
            </div>
          </>
        ) : (
          <div className="flex w-full justify-center">
            <div className="w-[40%]">
              <MediaModeToggle />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
