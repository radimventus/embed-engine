import { useWalkthrough } from '../../../walkthrough';

export function RoomPanel() {
  const { rooms, isRoomActive, selectRoom } = useWalkthrough();

  return (
    <nav aria-label="Místnosti" className="flex min-h-0 min-w-0 flex-col justify-start gap-1 overflow-x-hidden overflow-y-auto">
      {rooms.map((room) => {
        const active = isRoomActive(room.id);

        return (
          <button
            key={room.id}
            type="button"
            aria-pressed={active}
            className={`w-full rounded-md py-2.5 pl-3 pr-2 text-left text-sm tracking-wide transition-colors duration-[125ms] ease-out ${
              active
                ? 'border-l-2 border-embed-brand-navy bg-embed-neutral-50 font-semibold text-embed-brand-navy'
                : 'border-l-2 border-transparent font-normal text-embed-foreground-tertiary hover:bg-embed-neutral-50/80 hover:text-embed-foreground-secondary'
            }`}
            onClick={() => selectRoom(room.id)}
          >
            {room.title}
          </button>
        );
      })}
    </nav>
  );
}
