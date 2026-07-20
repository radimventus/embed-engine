import { createContext, useContext, type ReactNode } from 'react';
import type { Runtime } from '@embed-engine/core';
import { createSignal, SignalType, type Signal } from '@embed-engine/core/cognitive';

const CognitiveRuntimeContext = createContext<Runtime | null>(null);

type CognitiveRuntimeProviderProps = {
  runtime: Runtime | null;
  children: ReactNode;
};

export function CognitiveRuntimeProvider({
  runtime,
  children,
}: CognitiveRuntimeProviderProps) {
  return (
    <CognitiveRuntimeContext.Provider value={runtime}>
      {children}
    </CognitiveRuntimeContext.Provider>
  );
}

export function useCognitiveRuntime(): Runtime | null {
  return useContext(CognitiveRuntimeContext);
}

export function useApplyCognitiveSignal() {
  const runtime = useCognitiveRuntime();

  return (signal: Signal) => {
    runtime?.applySignal(signal);
  };
}

export function applyRoomViewed(
  apply: (signal: Signal) => void,
  roomId: string,
  label: string,
) {
  apply(
    createSignal({
      type: SignalType.ROOM_VIEWED,
      payload: { roomId, label },
    }),
  );
}

export function applyMediaOpened(
  apply: (signal: Signal) => void,
  mediaId: string,
  label: string,
) {
  apply(
    createSignal({
      type: SignalType.MEDIA_OPENED,
      payload: { mediaId, label },
    }),
  );
}

export function applyFloorChanged(
  apply: (signal: Signal) => void,
  floorId: string,
  label: string,
) {
  apply(
    createSignal({
      type: SignalType.FLOOR_CHANGED,
      payload: { floorId, label },
    }),
  );
}

export function applyQuestionOpened(
  apply: (signal: Signal) => void,
  questionId: string,
  label: string,
) {
  apply(
    createSignal({
      type: SignalType.QUESTION_OPENED,
      payload: { questionId, label },
    }),
  );
}
