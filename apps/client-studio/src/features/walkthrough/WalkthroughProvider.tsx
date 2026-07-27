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
  WalkthroughState,
} from '@embed-engine/contracts';

import { useDecisionSessionRuntime } from '../client-studio/runtime/DecisionSessionRuntimeProvider';
import {
  firstPhotoTimelineIndexForRoom,
  roomIdForTimelineIndex,
} from '../client-studio/runtime/experienceHouseMedia';
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

function firstPhotoIndex(
  thumbnails: readonly HousePackageMediaItem[],
): number {
  const index = thumbnails.findIndex((item) => item.kind === 'photo');
  return index >= 0 ? index : 0;
}

/**
 * Media / navigation chrome adapter.
 * The thumbnail strip is the global Media Timeline — immutable.
 * Only activeMediaIndex / mediaMode / selected room change.
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

  const [mediaMode, setMediaModeState] = useState<MediaMode>('video');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mode, setMode] = useState<WalkthroughState['mode']>('ready');
  const previousRoomIdRef = useRef<string | null>(activeRoomId);
  const pendingPhotoIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      activeRoomId === null ||
      previousRoomIdRef.current === activeRoomId
    ) {
      previousRoomIdRef.current = activeRoomId;
      return;
    }

    previousRoomIdRef.current = activeRoomId;
    setMediaModeState('photo');
    setMode('ready');

    const pendingPhotoIndex = pendingPhotoIndexRef.current;
    if (pendingPhotoIndex !== null) {
      const pendingRoomId = roomIdForTimelineIndex(experience.house, pendingPhotoIndex);
      if (pendingRoomId === activeRoomId) {
        setActiveMediaIndex(pendingPhotoIndex);
        pendingPhotoIndexRef.current = null;
        return;
      }
    }

    const roomPhotoIndex = firstPhotoTimelineIndexForRoom(
      experience.house,
      activeRoomId,
    );
    setActiveMediaIndex(
      roomPhotoIndex ?? firstPhotoIndex(projectedThumbnails),
    );
    pendingPhotoIndexRef.current = null;
  }, [activeRoomId, experience.house, projectedThumbnails]);

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
        pendingPhotoIndexRef.current = null;
        dispatch({ type: 'SelectRoom', roomId });
      },
      selectMediaIndex: (mediaIndex: number) => {
        setActiveMediaIndex(mediaIndex);
        const item = roomMediaItems[mediaIndex];
        if (item?.kind === 'video') {
          pendingPhotoIndexRef.current = null;
          setMediaModeState('video');
        } else if (item?.kind === 'photo') {
          setMediaModeState('photo');
          const roomId = roomIdForTimelineIndex(experience.house, mediaIndex);
          if (roomId !== null && roomId !== activeRoomId) {
            pendingPhotoIndexRef.current = mediaIndex;
            dispatch({ type: 'SelectRoom', roomId });
          } else {
            pendingPhotoIndexRef.current = null;
          }
        }
        setMode('ready');
      },
      setMediaMode: (nextMode: MediaMode) => {
        pendingPhotoIndexRef.current = null;
        setMediaModeState(nextMode);
        setMode('ready');
        if (nextMode === 'video') {
          setActiveMediaIndex(0);
          return;
        }
        setActiveMediaIndex(firstPhotoIndex(roomMediaItems));
      },
    };
  }, [
    activeMediaIndex,
    activeRoomId,
    dispatch,
    experience.house,
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
