/**
 * SessionNavigator (EPIC-BLD-19).
 * Navigates only along Decision Story move order — no branching or adaptation.
 */
export type SessionNavigator = {
  current(): string | null;
  next(): string | null;
  previous(): string | null;
  jumpTo(moveId: string): string | null;
  indexOf(moveId: string | null): number;
  canGoNext(): boolean;
  canGoPrevious(): boolean;
};

export function createSessionNavigator(
  moveIds: readonly string[],
  currentMoveId: string | null,
): SessionNavigator {
  const indexOf = (moveId: string | null): number => {
    if (moveId === null) {
      return -1;
    }
    return moveIds.indexOf(moveId);
  };

  const currentIndex = indexOf(currentMoveId);

  return {
    current() {
      return currentMoveId;
    },

    next() {
      if (moveIds.length === 0) {
        return null;
      }
      if (currentIndex < 0) {
        return moveIds[0] ?? null;
      }
      if (currentIndex >= moveIds.length - 1) {
        return null;
      }
      return moveIds[currentIndex + 1] ?? null;
    },

    previous() {
      if (currentIndex <= 0) {
        return null;
      }
      return moveIds[currentIndex - 1] ?? null;
    },

    jumpTo(moveId) {
      if (!moveIds.includes(moveId)) {
        return null;
      }
      return moveId;
    },

    indexOf,

    canGoNext() {
      if (moveIds.length === 0) {
        return false;
      }
      if (currentIndex < 0) {
        return true;
      }
      return currentIndex < moveIds.length - 1;
    },

    canGoPrevious() {
      return currentIndex > 0;
    },
  };
}
