import type { WalkthroughAction, WalkthroughState } from '@embed-engine/contracts';

import { reduceWalkthroughState } from './walkthrough-reducer';

type WalkthroughListener = () => void;

export class WalkthroughController {
  private state: WalkthroughState;
  private readonly listeners = new Set<WalkthroughListener>();

  constructor(initialState: WalkthroughState) {
    this.state = initialState;
  }

  getState(): Readonly<WalkthroughState> {
    return this.state;
  }

  dispatch(action: WalkthroughAction): void {
    const nextState = reduceWalkthroughState(this.state, action);

    if (
      nextState.mode === this.state.mode &&
      nextState.mediaMode === this.state.mediaMode &&
      nextState.activeRoomId === this.state.activeRoomId &&
      nextState.activePhotoIndex === this.state.activePhotoIndex
    ) {
      return;
    }

    this.state = nextState;
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: WalkthroughListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
