export type WalkthroughAction =
  | { type: 'PLAY' }
  | { type: 'VIDEO_ENDED' }
  | { type: 'SELECT_ROOM'; roomId: string }
  | { type: 'SELECT_MEDIA_INDEX'; mediaIndex: number }
  | { type: 'SET_MEDIA_MODE'; mediaMode: 'video' | 'photo' };
