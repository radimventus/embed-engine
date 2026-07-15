import { useWalkthrough } from '../../../walkthrough';

export function RoomPanel() {
  const { rooms, isRoomActive, selectRoom } = useWalkthrough();

  return (
    <div className="mt-section flex h-full w-full shrink-0 grow-0 flex-col border border-embed-border-default bg-embed-status-warning/15">
      {rooms.map((room) => {
        const active = isRoomActive(room.id);

        return (
          <button
            key={room.id}
            type="button"
            aria-pressed={active}
            className={`border-b border-embed-border-default px-3 py-2 text-left text-sm transition-colors duration-[125ms] ease-out last:border-b-0 ${
              active
                ? 'bg-embed-brand-navy font-bold text-embed-white'
                : 'bg-transparent font-medium text-embed-foreground-primary'
            }`}
            onClick={() => selectRoom(room.id)}
          >
            {room.title}
          </button>
        );
      })}
    </div>
  );
}
