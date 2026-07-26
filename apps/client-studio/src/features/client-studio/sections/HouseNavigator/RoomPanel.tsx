import { useWalkthrough } from '../../../walkthrough';
import { useHouseNavigator } from './useHouseNavigator';
import { formatAreaM2 } from '../PropertyExplorer/propertyExplorerModel';

/**
 * Runtime-driven room list (CSCB-03 / TOUR-33).
 * One continuous 1 px token border for the whole list (incl. Exteriér).
 * Dividers share the same border token — no shadows, no double edges.
 */
export function RoomPanel() {
  const { floorRooms, isRoomActive, selectedFloor } = useHouseNavigator();
  const { selectRoom } = useWalkthrough();

  return (
    <nav
      aria-label="Místnosti"
      data-floor={selectedFloor}
      className="flex min-h-0 min-w-0 w-full flex-col justify-start overflow-hidden overflow-y-auto rounded-[8px] border border-embed-border-default divide-y divide-embed-border-default shadow-none mobile:w-full"
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
            className={`flex min-h-[36px] w-full items-baseline justify-between gap-2 border-0 py-1.5 pl-2.5 pr-2 text-left text-[13px] leading-snug tracking-wide shadow-none transition-colors duration-[125ms] ease-out touch-manipulation ${
              active
                ? 'bg-embed-surface-interactive font-semibold text-embed-foreground-primary'
                : 'bg-transparent font-normal text-embed-foreground-primary hover:bg-embed-brand-navy hover:text-embed-action-onPrimary'
            }`}
            onClick={() => selectRoom(room.id)}
          >
            <span className="min-w-0 translate-y-[2px] truncate">{room.name}</span>
            {room.area > 0 ? (
              <span className="shrink-0 translate-y-[2px] tabular-nums opacity-80">
                {formatAreaM2(room.area)}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
