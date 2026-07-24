import { useHouseNavigator } from './useHouseNavigator';
import { HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS } from '../spatial-terminal-layout';
import { formatAreaM2 } from '../PropertyExplorer/propertyExplorerModel';

/**
 * Runtime-driven room list for the active floor (CSCB-03 / TOUR-13 / TOUR-20).
 * Name and area come from projected rooms.csv — never hardcoded.
 */
export function RoomPanel() {
  const { floorRooms, isRoomActive, selectRoom, selectedFloor } =
    useHouseNavigator();

  return (
    <nav
      aria-label="Místnosti"
      data-floor={selectedFloor}
      className={`${HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS} flex min-h-0 min-w-0 flex-col justify-start gap-1 overflow-x-hidden overflow-y-auto mobile:ml-0 mobile:w-full`}
    >
      {floorRooms.map((room) => {
        const active = isRoomActive(room.id);

        return (
          <button
            key={room.id}
            type="button"
            aria-pressed={active}
            data-room-id={room.id}
            data-active={active ? 'true' : 'false'}
            className={`flex min-h-[36px] w-full items-baseline justify-between gap-2 rounded-[8px] border-l-2 border-transparent py-1.5 pl-2.5 pr-2 text-left text-[13px] leading-snug tracking-wide transition-colors duration-[125ms] ease-out touch-manipulation ${
              active
                ? 'bg-[#E8E5E0] font-semibold text-[#001930]'
                : 'font-normal text-[#001930] hover:bg-[#001930] hover:text-[#FFFFFF]'
            }`}
            onClick={() => selectRoom(room.id)}
          >
            <span className="min-w-0 truncate">{room.name}</span>
            {room.area > 0 ? (
              <span className="shrink-0 tabular-nums opacity-80">
                {formatAreaM2(room.area)}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
