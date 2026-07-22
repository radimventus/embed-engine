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

import {
  applyFloorChanged,
  applyRoomViewed,
  useApplyCognitiveSignal,
} from '../client-studio/cognitive/CognitiveRuntimeContext';
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
  selectRoom: (roomId: string) => void;
  selectMediaIndex: (mediaIndex: number) => void;
  setMediaMode: (mediaMode: MediaMode) => void;
  selectFloor: (floorId: string) => void;
};

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

type WalkthroughProviderProps = {
  children: ReactNode;
};

function floorLabel(floor: string): string {
  if (floor === '0') {
    return 'Přízemí selected';
  }
  return 'Upper floor selected';
}

/**
 * Media chrome adapter (mode / index / play).
 * Room media + floor-plan assets come from Experience Context (ED-DA-02).
 * Media index / mode are presentation-only — never write cognitive semantics.
 */
export function WalkthroughProvider({ children }: WalkthroughProviderProps) {
  const { experience, dispatch } = useDecisionSessionRuntime();
  const applySignal = useApplyCognitiveSignal();
  const { context } = experience;
  const projectedThumbnails = context.roomMedia.thumbnails;
  const rooms = context.floorPlan.rooms;

  const floors = context.navigation.floors;

  const selectedFloor =
    context.navigation.currentFloor ?? floors[0] ?? '0';

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
    const roomMediaItems = projectedThumbnails;
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
      },
      setMediaMode: (nextMode: MediaMode) => {
        setMediaModeState(nextMode);
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
