import { useWalkthrough } from '../../../walkthrough';
import { useHouseNavigator } from './useHouseNavigator';
import { formatAreaM2 } from '../PropertyExplorer/propertyExplorerModel';

/**
 * Runtime-driven room list.
 * Visual style: borderless + dividers + active fill (Tour polish).
 * Typography / cell height: original compact sizing.
 */
export function RoomPanel() {
  const { floorRooms, isRoomActive, selectedFloor } = useHouseNavigator();
  const { selectRoom } = useWalkthrough();

  return (
    <nav
      aria-label="Místnosti"
      data-floor={selectedFloor}
      className="flex min-h-0 min-w-0 w-full flex-col justify-start overflow-y-auto mobile:w-full"
    >
      {floorRooms.map((room, index) => {
        const active = isRoomActive(room.id);

        return (
          <div
            key={room.id}
            className={index === 0 ? 'pt-0' : 'border-t border-embed-border-default pt-1'}
          >
            <button
              type="button"
              aria-pressed={active}
              data-room-id={room.id}
              data-active={active ? 'true' : 'false'}
              className={`flex min-h-[32px] w-full items-baseline justify-between gap-2 rounded-[10px] border-0 py-1 pl-2.5 pr-2 text-left leading-snug tracking-wide shadow-none transition-colors duration-[125ms] ease-out touch-manipulation ${
                active
                  ? 'bg-embed-surface-interactive font-semibold text-embed-foreground-primary'
                  : 'bg-transparent font-normal text-embed-foreground-primary hover:bg-embed-surface-interactive'
              }`}
              style={{ fontSize: 13 }}
              onClick={() => selectRoom(room.id)}
            >
              <span className="min-w-0 truncate">{room.name}</span>
              {room.area > 0 ? (
                <span className="shrink-0 tabular-nums opacity-80">
                  {formatAreaM2(room.area)}
                </span>
              ) : null}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
