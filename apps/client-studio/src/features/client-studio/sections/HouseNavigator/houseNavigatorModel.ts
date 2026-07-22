import type { ExperienceHouseRoom } from '@embed-engine/model';
import type { ExperienceContext } from '@embed-engine/runtime';

/**
 * Pure view model for House Navigator — Experience Context only.
 * No Runtime internals. No duplicated Room Registry derivation.
 */
export type HouseNavigatorViewModel = {
  readonly rooms: readonly ExperienceHouseRoom[];
  readonly activeRoom: ExperienceHouseRoom | null;
  readonly activeRoomId: string | null;
  readonly selectedFloor: string;
  readonly floors: readonly string[];
};

export function floorKey(floor: number | string): string {
  return String(floor);
}

export function createHouseNavigatorViewModel(
  context: ExperienceContext,
): HouseNavigatorViewModel {
  const { navigation, activeRoom } = context;
  return Object.freeze({
    rooms: navigation.rooms,
    activeRoom: activeRoom.room,
    activeRoomId: activeRoom.id,
    selectedFloor: navigation.currentFloor ?? navigation.floors[0] ?? '0',
    floors: navigation.floors,
  });
}

export function isNavigatorRoomActive(
  viewModel: HouseNavigatorViewModel,
  roomId: string,
): boolean {
  return viewModel.activeRoomId === roomId;
}

export function roomsOnFloor(
  viewModel: HouseNavigatorViewModel,
  floorId: string,
): readonly ExperienceHouseRoom[] {
  return Object.freeze(
    viewModel.rooms.filter((room) => floorKey(room.floor) === floorId),
  );
}

export function firstRoomOnFloor(
  viewModel: HouseNavigatorViewModel,
  floorId: string,
): ExperienceHouseRoom | undefined {
  return roomsOnFloor(viewModel, floorId)[0];
}
