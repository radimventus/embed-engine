import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  HousePackageMediaItem,
  MediaMode,
  WalkthroughState,
} from '@embed-engine/contracts';

import { useDecisionSessionRuntime } from '../client-studio/runtime/DecisionSessionRuntimeProvider';
import type { ExperienceFloorPlanRoom } from '../client-studio/runtime/synchronizedExperience';

/**
 * Walkthrough room chrome for FloorPlan interaction only.
 * Assets come from Experience Context floorPlan projection (ED-DA-02).
 */
type WalkthroughRoom = ExperienceFloorPlanRoom;

type WalkthroughContextValue = {
  mode: WalkthroughState['mode'];
  mediaMode: MediaMode;
  activeRoomId: string | null;
  activeRoom: WalkthroughRoom | null;
  activeMediaIndex: number;
  activeMediaItem: HousePackageMediaItem | null;
  activeMediaSrc: string | null;
  roomMediaItems: readonly HousePackageMediaItem[];
  rooms: readonly WalkthroughRoom[];
  selectedFloor: string;
  isRoomActive: (roomId: string) => boolean;
  isMediaActive: (mediaIndex: number) => boolean;
  play: () => void;
  onVideoEnded: () => void;
  /** @deprecated Prefer useHouseNavigator().selectRoom — kept for media chrome callers. */
  selectRoom: (roomId: string) => void;
  selectMediaIndex: (mediaIndex: number) => void;
  setMediaMode: (mediaMode: MediaMode) => void;
};

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

type WalkthroughProviderProps = {
  children: ReactNode;
};

/**
 * Media / navigation chrome adapter (ED-DA-04).
 *
 * Transports Experience Context media + local UI chrome (mode / index / play).
 * Mutations go only through Decision Session `dispatch(SelectRoom)`.
 * Does not write cognitive signals or compose Runtime semantics.
 */
export function WalkthroughProvider({ children }: WalkthroughProviderProps) {
  const { experience, dispatch } = useDecisionSessionRuntime();
  const { context } = experience;
  const activeRoomId = context.activeRoom.id;
  const projectedThumbnails = context.roomMedia.thumbnails;
  const rooms = context.floorPlan.rooms;

  const floors = context.navigation.floors;

  const selectedFloor =
    context.navigation.currentFloor ?? floors[0] ?? '0';

  const [mediaMode, setMediaModeState] = useState<MediaMode>('photo');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mode, setMode] = useState<WalkthroughState['mode']>('ready');

  useEffect(() => {
    // Photo mode must never land on a video URL rendered as <img> (BUG-001).
    if (mediaMode === 'photo') {
      const firstPhotoIndex = projectedThumbnails.findIndex(
        (item) => item.kind === 'photo',
      );
      setActiveMediaIndex(firstPhotoIndex >= 0 ? firstPhotoIndex : 0);
    } else {
      setActiveMediaIndex(0);
    }
    setMode('ready');
    // Reset only on room / mode change — not on every thumbnail reorder.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- projectedThumbnails read intentionally
  }, [activeRoomId, mediaMode]);

  const value = useMemo((): WalkthroughContextValue => {
    const roomMediaItems = projectedThumbnails;
    const activeMediaItem = roomMediaItems[activeMediaIndex] ?? null;
    const activeMediaSrc = activeMediaItem?.src ?? null;
    const activeRoom =
      activeRoomId === null
        ? null
        : (rooms.find((room) => room.id === activeRoomId) ?? null);

    return {
      mode,
      mediaMode,
      activeRoomId,
      activeRoom,
      activeMediaIndex,
      activeMediaItem,
      activeMediaSrc,
      roomMediaItems,
      rooms,
      selectedFloor,
      isRoomActive: (roomId: string) => activeRoomId === roomId,
      isMediaActive: (mediaIndex: number) => activeMediaIndex === mediaIndex,
      play: () => setMode('playing'),
      onVideoEnded: () => setMode('ready'),
      selectRoom: (roomId: string) => {
        dispatch({ type: 'SelectRoom', roomId });
      },
      selectMediaIndex: (mediaIndex: number) => {
        setActiveMediaIndex(mediaIndex);
      },
      setMediaMode: (nextMode: MediaMode) => {
        setMediaModeState(nextMode);
      },
    };
  }, [
    activeMediaIndex,
    activeRoomId,
    dispatch,
    mediaMode,
    mode,
    projectedThumbnails,
    rooms,
    selectedFloor,
  ]);

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
}

export function useWalkthrough(): WalkthroughContextValue {
  const context = useContext(WalkthroughContext);

  if (context === null) {
    throw new Error('useWalkthrough must be used within WalkthroughProvider');
  }

  return context;
}
