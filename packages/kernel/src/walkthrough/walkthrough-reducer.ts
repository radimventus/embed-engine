import type { WalkthroughAction, WalkthroughState } from '@embed-engine/contracts';

export function createInitialWalkthroughState(defaultRoomId: string): WalkthroughState {
  return {
    mode: 'ready',
    mediaMode: 'video',
    activeRoomId: null,
    activePhotoIndex: 0,
    defaultRoomId,
  };
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
      return { ...state, mode: 'playing', mediaMode: 'video' };

    case 'VIDEO_ENDED':
      if (state.mode !== 'playing') {
        return state;
      }
      return {
        ...state,
        mode: 'photo',
        mediaMode: 'photo',
        activeRoomId: state.defaultRoomId,
        activePhotoIndex: 0,
      };

    case 'SELECT_ROOM':
      return {
        ...state,
        mode: 'photo',
        mediaMode: 'photo',
        activeRoomId: action.roomId,
        activePhotoIndex: 0,
      };

    default:
      return state;
  }
}
