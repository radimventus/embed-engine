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
  ResolvedHousePackageRoom,
  WalkthroughState,
} from '@embed-engine/contracts';
import type { ExperienceHouseRoom } from '@embed-engine/model';

import {
  applyFloorChanged,
  applyMediaOpened,
  applyRoomViewed,
  useApplyCognitiveSignal,
} from '../client-studio/cognitive/CognitiveRuntimeContext';
import { useDecisionSessionRuntime } from '../client-studio/runtime/DecisionSessionRuntimeProvider';
import { getMediaRoom } from './presentation-assets';

type WalkthroughRoom = {
  readonly id: string;
  readonly title: string;
  readonly floor: string;
  readonly decisionCanvasSrc: string;
  readonly heroSrc: string;
  readonly gallerySrcs: readonly string[];
  readonly photos: readonly string[];
  readonly mediaItems: readonly HousePackageMediaItem[];
  readonly videoSrc: string;
  readonly floorPlanRegion: ResolvedHousePackageRoom['floorPlanRegion'];
};

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
  selectRoom: (roomId: string) => void;
  selectMediaIndex: (mediaIndex: number) => void;
  setMediaMode: (mediaMode: MediaMode) => void;
  selectFloor: (floorId: string) => void;
};

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

type WalkthroughProviderProps = {
  children: ReactNode;
};

function floorKey(floor: number): string {
  return String(floor);
}

function floorLabel(floor: string): string {
  if (floor === '0') {
    return 'Přízemí selected';
  }
  return 'Upper floor selected';
}

function toWalkthroughRoom(room: ExperienceHouseRoom): WalkthroughRoom {
  const media = getMediaRoom(room.id);
  return {
    id: room.id,
    title: room.name,
    floor: floorKey(room.floor),
    decisionCanvasSrc: media?.decisionCanvasSrc ?? '',
    heroSrc: media?.heroSrc ?? '',
    gallerySrcs: media?.gallerySrcs ?? [],
    photos: media?.photos ?? [],
    mediaItems: media?.mediaItems ?? [],
    videoSrc: media?.videoSrc ?? '',
    floorPlanRegion: media?.floorPlanRegion ?? null,
  };
}

/**
 * Media chrome adapter (mode / index / play).
 * Room media content comes from SynchronizedExperience.roomMedia (CAP-HP-003.3).
 */
export function WalkthroughProvider({ children }: WalkthroughProviderProps) {
  const { experience, dispatch } = useDecisionSessionRuntime();
  const applySignal = useApplyCognitiveSignal();
  const projectedMedia = experience.roomMedia;

  const rooms = useMemo(
    () => experience.house.rooms.map(toWalkthroughRoom),
    [experience.house.rooms],
  );

  const floors = useMemo(
    () => [...new Set(rooms.map((room) => room.floor))],
    [rooms],
  );

  const selectedFloor = useMemo(() => {
    if (experience.activeRoomId === null) {
      return floors[0] ?? '0';
    }
    const active = rooms.find((room) => room.id === experience.activeRoomId);
    return active?.floor ?? floors[0] ?? '0';
  }, [experience.activeRoomId, floors, rooms]);

  const [mediaMode, setMediaModeState] = useState<MediaMode>('photo');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mode, setMode] = useState<WalkthroughState['mode']>('ready');

  useEffect(() => {
    if (experience.activeRoomId !== null) {
      return;
    }
    const defaultRoom = rooms[0];
    if (defaultRoom === undefined) {
      return;
    }
    const result = dispatch({ type: 'SelectRoom', roomId: defaultRoom.id });
    if (result.ok) {
      applyRoomViewed(applySignal, defaultRoom.id, `${defaultRoom.title} opened`);
    }
  }, [applySignal, dispatch, experience.activeRoomId, rooms]);

  useEffect(() => {
    setActiveMediaIndex(0);
    setMode('ready');
  }, [experience.activeRoomId, mediaMode]);

  const value = useMemo((): WalkthroughContextValue => {
    const roomMediaItems = projectedMedia?.mediaItems ?? [];
    const activeMediaItem = roomMediaItems[activeMediaIndex] ?? null;
    const activeMediaSrc = activeMediaItem?.src ?? null;
    const activeRoom =
      experience.activeRoomId === null
        ? null
        : (rooms.find((room) => room.id === experience.activeRoomId) ?? null);

    return {
      mode,
      mediaMode,
      activeRoomId: experience.activeRoomId,
      activeRoom,
      activeMediaIndex,
      activeMediaItem,
      activeMediaSrc,
      roomMediaItems,
      rooms,
      selectedFloor,
      isRoomActive: (roomId: string) => experience.activeRoomId === roomId,
      isMediaActive: (mediaIndex: number) => activeMediaIndex === mediaIndex,
      play: () => setMode('playing'),
      onVideoEnded: () => setMode('ready'),
      selectRoom: (roomId: string) => {
        const result = dispatch({ type: 'SelectRoom', roomId });
        if (!result.ok) {
          return;
        }
        const room = rooms.find((item) => item.id === roomId);
        applyRoomViewed(
          applySignal,
          roomId,
          room ? `${room.title} opened` : 'Room opened',
        );
      },
      selectMediaIndex: (mediaIndex: number) => {
        setActiveMediaIndex(mediaIndex);
        const media = roomMediaItems[mediaIndex];
        applyMediaOpened(
          applySignal,
          `media-${mediaIndex}`,
          media?.kind === 'video' ? 'Video opened' : `Photo ${mediaIndex + 1} opened`,
        );
      },
      setMediaMode: (nextMode: MediaMode) => {
        setMediaModeState(nextMode);
        applyMediaOpened(
          applySignal,
          `mode-${nextMode}`,
          nextMode === 'photo'
            ? 'Photos / interior-exterior gallery'
            : 'Video walkthrough',
        );
      },
      selectFloor: (floorId: string) => {
        applyFloorChanged(applySignal, floorId, floorLabel(floorId));
        const roomOnFloor = rooms.find((room) => room.floor === floorId);
        if (roomOnFloor) {
          const result = dispatch({
            type: 'SelectRoom',
            roomId: roomOnFloor.id,
          });
          if (result.ok) {
            applyRoomViewed(
              applySignal,
              roomOnFloor.id,
              `${roomOnFloor.title} opened`,
            );
          }
        }
      },
    };
  }, [
    activeMediaIndex,
    applySignal,
    dispatch,
    experience.activeRoomId,
    mediaMode,
    mode,
    projectedMedia,
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

export { getPresentationAssets as getHousePresentationAssets } from './presentation-assets';
