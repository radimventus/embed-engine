import { useCallback, useEffect, useMemo } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { evidenceLog } from '../../runtime/runtimeEvidence';
import {
  createHouseNavigatorViewModel,
  firstRoomOnFloor,
  isNavigatorRoomActive,
  roomsOnFloor,
  type HouseNavigatorViewModel,
} from './houseNavigatorModel';
import type { ExperienceHouseRoom } from '@embed-engine/model';

export type UseHouseNavigatorResult = HouseNavigatorViewModel & {
  /** Rooms on the currently selected floor (spatial list). */
  readonly floorRooms: readonly ExperienceHouseRoom[];
  readonly selectRoom: (roomId: string) => void;
  readonly selectFloor: (floorId: string) => void;
  readonly isRoomActive: (roomId: string) => boolean;
};

/**
 * House Navigator Runtime integration (CAP-HP-003.2 / CSCB-03).
 * Renders projected Experience; mutates only via SelectRoom commands.
 */
export function useHouseNavigator(): UseHouseNavigatorResult {
  const { experience, dispatch } = useDecisionSessionRuntime();

  const viewModel = useMemo(
    () => createHouseNavigatorViewModel(experience.context),
    [experience.context],
  );

  const floorRooms = useMemo(
    () => roomsOnFloor(viewModel, viewModel.selectedFloor),
    [viewModel],
  );

  useEffect(() => {
    evidenceLog('5.ComponentEvidence.Navigator', {
      activeRoomId: viewModel.activeRoomId,
      selectedFloor: viewModel.selectedFloor,
      floors: viewModel.floors,
      roomIds: viewModel.rooms.map((room) => room.id),
      roomNames: viewModel.rooms.map((room) => room.name),
      floorRoomIds: floorRooms.map((room) => room.id),
    });
  }, [floorRooms, viewModel]);

  const selectRoom = useCallback(
    (roomId: string) => {
      dispatch({ type: 'SelectRoom', roomId });
    },
    [dispatch],
  );

  const selectFloor = useCallback(
    (floorId: string) => {
      const room = firstRoomOnFloor(viewModel, floorId);
      if (room === undefined) {
        return;
      }
      dispatch({ type: 'SelectRoom', roomId: room.id });
    },
    [dispatch, viewModel],
  );

  const isRoomActive = useCallback(
    (roomId: string) => isNavigatorRoomActive(viewModel, roomId),
    [viewModel],
  );

  return {
    ...viewModel,
    floorRooms,
    selectRoom,
    selectFloor,
    isRoomActive,
  };
}
