import type { ExperienceHouseRoom } from '@embed-engine/model';
import type { SessionExperience } from '@embed-engine/runtime';

/**
 * Pure view model for House Navigator — projected Experience only.
 * No Runtime internals. No duplicated Room Registry.
 */
export type HouseNavigatorViewModel = {
  readonly rooms: readonly ExperienceHouseRoom[];
  readonly activeRoom: ExperienceHouseRoom | null;
  readonly activeRoomId: string | null;
  readonly selectedFloor: string;
  readonly floors: readonly string[];
};

export function floorKey(floor: number): string {
  return String(floor);
}

export function createHouseNavigatorViewModel(
  experience: SessionExperience,
): HouseNavigatorViewModel {
  const rooms = experience.house.rooms;
  const floors = Object.freeze(
    [...new Set(rooms.map((room) => floorKey(room.floor)))],
  );
  const activeRoom = experience.activeRoom;
  const selectedFloor =
    activeRoom !== null
      ? floorKey(activeRoom.floor)
      : (floors[0] ?? '0');

  return Object.freeze({
    rooms,
    activeRoom,
    activeRoomId: experience.activeRoomId,
    selectedFloor,
    floors,
  });
}

export function isNavigatorRoomActive(
  viewModel: HouseNavigatorViewModel,
  roomId: string,
): boolean {
  return viewModel.activeRoomId === roomId;
}

export function firstRoomOnFloor(
  viewModel: HouseNavigatorViewModel,
  floorId: string,
): ExperienceHouseRoom | undefined {
  return viewModel.rooms.find((room) => floorKey(room.floor) === floorId);
}
