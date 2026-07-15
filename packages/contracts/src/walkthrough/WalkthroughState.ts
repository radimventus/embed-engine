import type { MediaMode } from './MediaMode';
import type { WalkthroughMode } from './WalkthroughMode';

export type WalkthroughState = {
  mode: WalkthroughMode;
  mediaMode: MediaMode;
  activeRoomId: string | null;
  activePhotoIndex: number;
  defaultRoomId: string;
};
