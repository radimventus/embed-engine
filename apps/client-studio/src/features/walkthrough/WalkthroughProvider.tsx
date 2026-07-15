import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type {
  HousePackageMediaItem,
  MediaMode,
  ResolvedHousePackageRoom,
  WalkthroughState,
} from '@embed-engine/contracts';
import { WalkthroughController, createInitialWalkthroughState } from '@embed-engine/kernel';

import { HOUSE_PACKAGE } from './house-package';

type WalkthroughContextValue = {
  mode: WalkthroughState['mode'];
  mediaMode: MediaMode;
  activeRoomId: string | null;
  activeRoom: ResolvedHousePackageRoom | null;
  activeMediaIndex: number;
  activeMediaItem: HousePackageMediaItem | null;
  activeMediaSrc: string | null;
  roomMediaItems: readonly HousePackageMediaItem[];
  rooms: readonly ResolvedHousePackageRoom[];
  isRoomActive: (roomId: string) => boolean;
  isMediaActive: (mediaIndex: number) => boolean;
  play: () => void;
  onVideoEnded: () => void;
  selectRoom: (roomId: string) => void;
  selectMediaIndex: (mediaIndex: number) => void;
  setMediaMode: (mediaMode: MediaMode) => void;
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
    const roomMediaItems = activeRoom?.mediaItems ?? [];
    const activeMediaItem = roomMediaItems[state.activeMediaIndex] ?? null;
    const activeMediaSrc = activeMediaItem?.src ?? null;

    return {
      mode: state.mode,
      mediaMode: state.mediaMode,
      activeRoomId: state.activeRoomId,
      activeRoom,
      activeMediaIndex: state.activeMediaIndex,
      activeMediaItem,
      activeMediaSrc,
      roomMediaItems,
      rooms: HOUSE_PACKAGE.rooms,
      isRoomActive: (roomId: string) => state.activeRoomId === roomId,
      isMediaActive: (mediaIndex: number) => state.activeMediaIndex === mediaIndex,
      play: () => controller.dispatch({ type: 'PLAY' }),
      onVideoEnded: () => controller.dispatch({ type: 'VIDEO_ENDED' }),
      selectRoom: (roomId: string) => controller.dispatch({ type: 'SELECT_ROOM', roomId }),
      selectMediaIndex: (mediaIndex: number) =>
        controller.dispatch({ type: 'SELECT_MEDIA_INDEX', mediaIndex }),
      setMediaMode: (mediaMode: MediaMode) =>
        controller.dispatch({ type: 'SET_MEDIA_MODE', mediaMode }),
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
