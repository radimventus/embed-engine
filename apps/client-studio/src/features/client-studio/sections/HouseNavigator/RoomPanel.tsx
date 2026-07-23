import { useHouseNavigator } from './useHouseNavigator';
import { HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS } from '../spatial-terminal-layout';

/**
 * Runtime-driven room list for the active floor (CSCB-03).
 * Highlight derives solely from projected activeRoomId.
 * PT-TOUR-REDESIGN-01: compact rows (~−12%), navy default label color.
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
            className={`min-h-[39px] w-full rounded-[8px] border-l-2 border-transparent py-2 pl-3 pr-2 text-left text-sm tracking-wide transition-colors duration-[125ms] ease-out touch-manipulation ${
              active
                ? 'bg-[#E8E5E0] font-semibold text-[#001930]'
                : 'font-normal text-[#001930] hover:bg-[#001930] hover:text-[#FFFFFF]'
            }`}
            onClick={() => selectRoom(room.id)}
          >
            {room.name}
          </button>
        );
      })}
    </nav>
  );
}
