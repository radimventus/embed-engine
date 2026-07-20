import type { DecisionState } from "../decision-state/DecisionState";
import type { Signal } from "../signals/Signal";
import { SignalType } from "../signals/SignalType";
import { reduceFloorChanged } from "./reducers/floorChanged";
import { reduceMediaOpened } from "./reducers/mediaOpened";
import { reduceQuestionOpened } from "./reducers/questionOpened";
import { reduceRoomViewed } from "./reducers/roomViewed";

type SignalReducer = (
  state: DecisionState,
  signal: Signal,
) => DecisionState;

const SIGNAL_REDUCERS: Record<SignalType, SignalReducer> = {
  [SignalType.ROOM_VIEWED]: reduceRoomViewed,
  [SignalType.MEDIA_OPENED]: reduceMediaOpened,
  [SignalType.FLOOR_CHANGED]: reduceFloorChanged,
  [SignalType.QUESTION_OPENED]: reduceQuestionOpened,
};

/**
 * Pure Cognitive Layer reducer.
 * Sole writer of DecisionState transitions from Signals.
 */
export function reduce(state: DecisionState, signal: Signal): DecisionState {
  const signalReducer = SIGNAL_REDUCERS[signal.type];
  if (signalReducer === undefined) {
    return state;
  }

  return signalReducer(state, signal);
}
