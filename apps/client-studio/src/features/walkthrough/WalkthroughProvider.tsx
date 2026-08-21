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
import { canonicalImageMediaId } from '@embed-engine/platform-access';

import { useDecisionSessionRuntime } from '../client-studio/runtime/DecisionSessionRuntimeProvider';
import {
  firstPhotoTimelineIndexForRoom,
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
  /** Increments on every VIDEO/FOTKY toggle — forces rail re-anchor. */
  mediaModeEpoch: number;
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

  const [mediaMode, setMediaModeState] = useState<MediaMode>(
    projectedThumbnails[0]?.kind === 'video' ? 'video' : 'photo',
  );
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mode, setMode] = useState<WalkthroughState['mode']>('ready');
  const [mediaModeEpoch, setMediaModeEpoch] = useState(0);
  const previousRoomIdRef = useRef<string | null>(activeRoomId);
  const activeMediaIndexRef = useRef(activeMediaIndex);
  activeMediaIndexRef.current = activeMediaIndex;

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

    /** Thumbnail already selected a photo of this room — keep that index. */
    const roomForActivePhoto =
      projectedThumbnails[activeMediaIndexRef.current]?.roomId ?? null;
    if (roomForActivePhoto === activeRoomId) {
      return;
    }

    const roomPhotoIndex = firstPhotoTimelineIndexForRoom(
      experience.house,
      activeRoomId,
    );
    const nextIndex = roomPhotoIndex ?? firstPhotoIndex(projectedThumbnails);
    setActiveMediaIndex(nextIndex);
    const nextPhoto = projectedThumbnails[nextIndex];
    if (nextPhoto?.kind === 'photo') {
      dispatch({
        type: 'ViewImage',
        mediaId: canonicalImageMediaId({
          roomId: nextPhoto.roomId,
          src: nextPhoto.src,
        }),
      });
    }
  }, [activeRoomId, dispatch, experience.house, projectedThumbnails]);

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
      mediaModeEpoch,
      isRoomActive: (roomId: string) => activeRoomId === roomId,
      isMediaActive: (mediaIndex: number) => activeMediaIndex === mediaIndex,
      play: () => setMode('playing'),
      onVideoEnded: () => setMode('ready'),
      selectRoom: (roomId: string) => {
        dispatch({ type: 'SelectRoom', roomId });
      },
      selectMediaIndex: (mediaIndex: number) => {
        setActiveMediaIndex(mediaIndex);
        const item = roomMediaItems[mediaIndex];
        if (item?.kind === 'video') {
          setMediaModeState('video');
          setMode('playing');
          return;
        }
        if (item?.kind === 'photo') {
          setMediaModeState('photo');
          dispatch({
            type: 'ViewImage',
            mediaId: canonicalImageMediaId({
              roomId: item.roomId,
              src: item.src,
            }),
          });
          const roomId = item.roomId;
          if (roomId !== null && roomId !== activeRoomId) {
            dispatch({ type: 'SelectRoom', roomId });
          }
        }
        setMode('ready');
      },
      setMediaMode: (nextMode: MediaMode) => {
        const firstMatchingIndex = roomMediaItems.findIndex(
          (item) => item.kind === nextMode,
        );
        const resolvedMode =
          firstMatchingIndex >= 0 ? nextMode : 'photo';
        setMediaModeEpoch((value) => value + 1);
        setMediaModeState(resolvedMode);
        setMode('ready');
        if (firstMatchingIndex >= 0) {
          setActiveMediaIndex(firstMatchingIndex);
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
    mediaModeEpoch,
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
