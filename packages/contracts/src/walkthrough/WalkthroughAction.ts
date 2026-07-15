export type WalkthroughAction =
  | { type: 'PLAY' }
  | { type: 'VIDEO_ENDED' }
  | { type: 'SELECT_ROOM'; roomId: string };
