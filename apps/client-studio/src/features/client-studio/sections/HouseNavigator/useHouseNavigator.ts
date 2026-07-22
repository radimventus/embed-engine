import { useCallback, useMemo } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import {
  createHouseNavigatorViewModel,
  firstRoomOnFloor,
  isNavigatorRoomActive,
  type HouseNavigatorViewModel,
} from './houseNavigatorModel';

export type UseHouseNavigatorResult = HouseNavigatorViewModel & {
  readonly selectRoom: (roomId: string) => void;
  readonly selectFloor: (floorId: string) => void;
  readonly isRoomActive: (roomId: string) => boolean;
};

/**
 * House Navigator Runtime integration (CAP-HP-003.2).
 * Renders projected Experience; mutates only via SelectRoom commands.
 */
export function useHouseNavigator(): UseHouseNavigatorResult {
  const { experience, dispatch } = useDecisionSessionRuntime();

  const viewModel = useMemo(
    () => createHouseNavigatorViewModel(experience.context),
    [experience.context],
  );

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
    selectRoom,
    selectFloor,
    isRoomActive,
  };
}
