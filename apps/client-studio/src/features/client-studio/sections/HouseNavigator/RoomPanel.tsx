import { useWalkthrough } from '../../../walkthrough';

export function RoomPanel() {
  const { rooms, isRoomActive, selectRoom } = useWalkthrough();

  return (
    <nav aria-label="Místnosti" className="ml-[15px] flex min-h-0 min-w-0 flex-col justify-start gap-1 overflow-x-hidden overflow-y-auto">
      {rooms.map((room) => {
        const active = isRoomActive(room.id);

        return (
          <button
            key={room.id}
            type="button"
            aria-pressed={active}
            className={`w-full rounded-[8px] border-l-2 border-transparent py-2.5 pl-3 pr-2 text-left text-sm tracking-wide transition-colors duration-[125ms] ease-out ${
              active
                ? 'bg-[#E8E5E0] font-semibold text-[#001E3A]'
                : 'font-normal text-embed-foreground-primary/45 hover:bg-[#001E3A] hover:text-[#FFFFFF]'
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
