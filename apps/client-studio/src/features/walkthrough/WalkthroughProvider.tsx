import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { MediaMode, ResolvedHousePackageRoom, WalkthroughState } from '@embed-engine/contracts';
import { WalkthroughController, createInitialWalkthroughState } from '@embed-engine/kernel';

import { HOUSE_PACKAGE } from './house-package';

type WalkthroughContextValue = {
  mode: WalkthroughState['mode'];
  mediaMode: MediaMode;
  activeRoomId: string | null;
  activeRoom: ResolvedHousePackageRoom | null;
  activePhotoSrc: string | null;
  roomPhotos: readonly string[];
  rooms: readonly ResolvedHousePackageRoom[];
  isRoomActive: (roomId: string) => boolean;
  play: () => void;
  onVideoEnded: () => void;
  selectRoom: (roomId: string) => void;
};

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

type WalkthroughProviderProps = {
  children: ReactNode;
};

export function WalkthroughProvider({ children }: WalkthroughProviderProps) {
  const controllerRef = useRef<WalkthroughController | null>(null);

  if (controllerRef.current === null) {
    controllerRef.current = new WalkthroughController(
      createInitialWalkthroughState(HOUSE_PACKAGE.defaultRoomId),
    );
  }

  const controller = controllerRef.current;
  const [state, setState] = useState<WalkthroughState>(() => controller.getState());

  useEffect(
    () =>
      controller.subscribe(() => {
        setState(controller.getState());
      }),
    [controller],
  );

  const value = useMemo((): WalkthroughContextValue => {
    const activeRoom =
      state.activeRoomId === null
        ? null
        : (HOUSE_PACKAGE.rooms.find((room) => room.id === state.activeRoomId) ?? null);
    const roomPhotos = activeRoom?.photos ?? [];
    const activePhotoSrc =
      activeRoom === null ? null : (roomPhotos[state.activePhotoIndex] ?? null);

    return {
      mode: state.mode,
      mediaMode: state.mediaMode,
      activeRoomId: state.activeRoomId,
      activeRoom,
      activePhotoSrc,
      roomPhotos,
      rooms: HOUSE_PACKAGE.rooms,
      isRoomActive: (roomId: string) => state.activeRoomId === roomId,
      play: () => controller.dispatch({ type: 'PLAY' }),
      onVideoEnded: () => controller.dispatch({ type: 'VIDEO_ENDED' }),
      selectRoom: (roomId: string) => controller.dispatch({ type: 'SELECT_ROOM', roomId }),
    };
  }, [controller, state]);

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
}

export function useWalkthrough(): WalkthroughContextValue {
  const context = useContext(WalkthroughContext);

  if (context === null) {
    throw new Error('useWalkthrough must be used within WalkthroughProvider');
  }

  return context;
}

export { HOUSE_PACKAGE };
