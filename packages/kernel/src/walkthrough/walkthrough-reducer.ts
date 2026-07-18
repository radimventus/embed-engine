import type { WalkthroughAction, WalkthroughState } from '@embed-engine/contracts';

const FIRST_PHOTO_MEDIA_INDEX = 1;

export function createInitialWalkthroughState(defaultRoomId: string): WalkthroughState {
  return {
    mode: 'ready',
    mediaMode: 'video',
    /** Default room selected so the rail shows video + photos on first paint. */
    activeRoomId: defaultRoomId,
    activeMediaIndex: 0,
    defaultRoomId,
  };
}

function mediaModeForIndex(mediaIndex: number): WalkthroughState['mediaMode'] {
  return mediaIndex === 0 ? 'video' : 'photo';
}

export function reduceWalkthroughState(
  state: WalkthroughState,
  action: WalkthroughAction,
): WalkthroughState {
  switch (action.type) {
    case 'PLAY':
      if (state.mode !== 'ready') {
        return state;
      }
      return { ...state, mode: 'playing', mediaMode: 'video', activeMediaIndex: 0 };

    case 'VIDEO_ENDED':
      if (state.mode !== 'playing') {
        return state;
      }
      return {
        ...state,
        mode: 'photo',
        mediaMode: 'photo',
        activeRoomId: state.defaultRoomId,
        activeMediaIndex: FIRST_PHOTO_MEDIA_INDEX,
      };

    case 'SELECT_ROOM':
      return {
        ...state,
        mode: 'photo',
        mediaMode: 'photo',
        activeRoomId: action.roomId,
        activeMediaIndex: FIRST_PHOTO_MEDIA_INDEX,
      };

    case 'SELECT_MEDIA_INDEX':
      if (state.activeRoomId === null) {
        return state;
      }
      return {
        ...state,
        activeMediaIndex: action.mediaIndex,
        mediaMode: mediaModeForIndex(action.mediaIndex),
      };

    case 'SET_MEDIA_MODE':
      if (state.activeRoomId === null) {
        if (action.mediaMode === state.mediaMode) {
          return state;
        }
        return { ...state, mediaMode: action.mediaMode, activeMediaIndex: 0 };
      }

      if (action.mediaMode === 'video') {
        return { ...state, mediaMode: 'video', activeMediaIndex: 0 };
      }

      return {
        ...state,
        mediaMode: 'photo',
        activeMediaIndex:
          state.activeMediaIndex === 0 ? FIRST_PHOTO_MEDIA_INDEX : state.activeMediaIndex,
      };

    default:
      return state;
  }
}
