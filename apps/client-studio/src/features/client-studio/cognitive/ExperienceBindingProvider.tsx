import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createExperienceBinding,
  type ExperienceBinding,
  type ExperienceSessionSnapshot,
  type Runtime,
} from '@embed-engine/core';
import { createSignal, SignalType, type Signal } from '@embed-engine/core/cognitive';

const EMPTY_SNAPSHOT: ExperienceSessionSnapshot = Object.freeze({
  version: 0,
  status: 'idle',
  interpretation: undefined,
  decisionStory: null,
  facts: Object.freeze({}),
});

const ExperienceBindingContext = createContext<ExperienceBinding | null>(null);
const ExperienceSessionContext =
  createContext<ExperienceSessionSnapshot>(EMPTY_SNAPSHOT);

type ExperienceBindingProviderProps = {
  runtime: Runtime | null;
  children: ReactNode;
};

/**
 * LEGACY — Cognitive Experience root (RI-003 EX-01).
 *
 * Not mounted on the live Decision Session path (ED-DA-04).
 * Prefer `DecisionSessionRuntimeProvider` + `experience.context`.
 *
 * @see ./LEGACY.md
 */
export function ExperienceBindingProvider({
  runtime,
  children,
}: ExperienceBindingProviderProps) {
  const binding = useMemo(
    () => (runtime !== null ? createExperienceBinding(runtime) : null),
    [runtime],
  );

  const [snapshot, setSnapshot] = useState<ExperienceSessionSnapshot>(() =>
    binding?.getSessionSnapshot() ?? EMPTY_SNAPSHOT,
  );

  useEffect(() => {
    if (binding === null) {
      setSnapshot(EMPTY_SNAPSHOT);
      return;
    }

    setSnapshot(binding.getSessionSnapshot());
    return binding.subscribeSession(setSnapshot);
  }, [binding]);

  return (
    <ExperienceBindingContext.Provider value={binding}>
      <ExperienceSessionContext.Provider value={snapshot}>
        {children}
      </ExperienceSessionContext.Provider>
    </ExperienceBindingContext.Provider>
  );
}

export function useExperienceBinding(): ExperienceBinding | null {
  return useContext(ExperienceBindingContext);
}

export function useExperienceSession(): ExperienceSessionSnapshot {
  return useContext(ExperienceSessionContext);
}

export function useApplyCognitiveSignal() {
  const binding = useExperienceBinding();

  return (signal: Signal) => {
    binding?.applySignal(signal);
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
  extra: Readonly<Record<string, unknown>> = {},
) {
  apply(
    createSignal({
      type: SignalType.QUESTION_OPENED,
      payload: { questionId, label, ...extra },
    }),
  );
}
