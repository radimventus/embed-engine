import { useHouseNavigator } from './useHouseNavigator';

export function RoomSelect() {
  const { floorRooms, activeRoomId, selectRoom } = useHouseNavigator();

  if (floorRooms.length === 0) {
    return null;
  }

  const value =
    activeRoomId !== null && floorRooms.some((room) => room.id === activeRoomId)
      ? activeRoomId
      : floorRooms[0]!.id;

  return (
    <label className="block w-full min-w-0">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/55">
        Místnost
      </span>
      <select
        aria-label="Místnost"
        value={value}
        onChange={(event) => selectRoom(event.target.value)}
        className="min-h-11 w-full min-w-0 rounded-[8px] border border-embed-border-default bg-white px-3 text-sm font-medium text-embed-foreground-primary outline-none touch-manipulation"
      >
        {floorRooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>
    </label>
  );
}
