/**
 * CAP-BLD-03 — in-memory edit session over mounted HP-002.
 * Working content is the HP texts themselves (no Builder Package).
 */

import type { BuilderPackageImportError } from '@embed-engine/object-house/builder-package';

import type { HousePackageMount } from './mountHousePackage';
import {
  dirtySections,
  errorsForDirtySections,
  validateHousePackageWorking,
  type HousePackageValidation,
  type HousePackageWorkingContent,
  type HpEditSection,
} from './validateHousePackageWorking';

const MAX_UNDO = 40;

export type HousePackageDirtyState = 'clean' | 'modified' | 'save-failed';

export type HousePackageEditSnapshot = {
  readonly baseline: HousePackageWorkingContent;
  readonly working: HousePackageWorkingContent;
  readonly dirtyState: HousePackageDirtyState;
  readonly dirty: readonly HpEditSection[];
  readonly canUndo: boolean;
  readonly saveError: string | null;
  readonly validation: HousePackageValidation;
  readonly sectionErrors: readonly BuilderPackageImportError[];
  readonly geometryByFloor: HousePackageMount['geometryByFloor'];
  readonly packageRootLabel: HousePackageMount['packageRootLabel'];
  readonly canonicalDiskRoot: HousePackageMount['canonicalDiskRoot'];
  readonly mountedAt: string;
};

export type HousePackageEditSession = {
  snapshot(): HousePackageEditSnapshot;
  setRoomsCsv(next: string): HousePackageEditSnapshot;
  setGalleryCsv(next: string): HousePackageEditSnapshot;
  setVideosCsv(next: string): HousePackageEditSnapshot;
  setManifestJson(next: string | null): HousePackageEditSnapshot;
  setHeroRelativePath(next: string): HousePackageEditSnapshot;
  undo(): HousePackageEditSnapshot;
  /** Discard all edits — reset working content to mounted baseline. */
  discard(): HousePackageEditSnapshot;
  reset(): HousePackageEditSnapshot;
  markSaveFailed(message: string): HousePackageEditSnapshot;
  clearSaveFailed(): HousePackageEditSnapshot;
};

function cloneWorking(
  content: HousePackageWorkingContent,
): HousePackageWorkingContent {
  return {
    galleryCsv: content.galleryCsv,
    roomsCsv: content.roomsCsv,
    videosCsv: content.videosCsv,
    manifestJson: content.manifestJson,
    heroRelativePath: content.heroRelativePath,
  };
}

function buildSnapshot(input: {
  readonly baseline: HousePackageWorkingContent;
  readonly working: HousePackageWorkingContent;
  readonly undoStack: readonly HousePackageWorkingContent[];
  readonly mount: HousePackageMount;
  readonly saveError: string | null;
}): HousePackageEditSnapshot {
  const dirty = dirtySections(input.baseline, input.working);
  const validation = validateHousePackageWorking(input.working);
  const sectionErrors = errorsForDirtySections(validation.errors, dirty);
  const dirtyState: HousePackageDirtyState =
    input.saveError !== null
      ? 'save-failed'
      : dirty.length === 0
        ? 'clean'
        : 'modified';
  return {
    baseline: input.baseline,
    working: input.working,
    dirtyState,
    dirty,
    canUndo: input.undoStack.length > 0,
    saveError: input.saveError,
    validation,
    sectionErrors,
    geometryByFloor: input.mount.geometryByFloor,
    packageRootLabel: input.mount.packageRootLabel,
    canonicalDiskRoot: input.mount.canonicalDiskRoot,
    mountedAt: input.mount.mountedAt,
  };
}

/**
 * Create an edit session bound to a mount. Mutations stay in memory only
 * until CAP-BLD-04 persist via Node host.
 */
export function createHousePackageEditSession(
  mount: HousePackageMount,
): HousePackageEditSession {
  const baseline: HousePackageWorkingContent = {
    galleryCsv: mount.texts.galleryCsv,
    roomsCsv: mount.texts.roomsCsv,
    videosCsv: mount.texts.videosCsv,
    manifestJson: mount.texts.manifestJson,
    heroRelativePath: mount.heroRelativePath,
  };
  let working = cloneWorking(baseline);
  let undoStack: HousePackageWorkingContent[] = [];
  let saveError: string | null = null;

  const commit = (
    next: HousePackageWorkingContent,
  ): HousePackageEditSnapshot => {
    undoStack = [cloneWorking(working), ...undoStack].slice(0, MAX_UNDO);
    working = next;
    saveError = null;
    return buildSnapshot({ baseline, working, undoStack, mount, saveError });
  };

  return {
    snapshot() {
      return buildSnapshot({ baseline, working, undoStack, mount, saveError });
    },

    setRoomsCsv(next) {
      if (next === working.roomsCsv) {
        return this.snapshot();
      }
      return commit({ ...working, roomsCsv: next });
    },

    setGalleryCsv(next) {
      if (next === working.galleryCsv) {
        return this.snapshot();
      }
      return commit({ ...working, galleryCsv: next });
    },

    setVideosCsv(next) {
      if (next === working.videosCsv) {
        return this.snapshot();
      }
      return commit({ ...working, videosCsv: next });
    },

    setManifestJson(next) {
      if (next === working.manifestJson) {
        return this.snapshot();
      }
      return commit({ ...working, manifestJson: next });
    },

    setHeroRelativePath(next) {
      const trimmed = next.trim();
      if (trimmed === working.heroRelativePath) {
        return this.snapshot();
      }
      return commit({ ...working, heroRelativePath: trimmed });
    },

    undo() {
      const previous = undoStack[0];
      if (previous === undefined) {
        return this.snapshot();
      }
      undoStack = undoStack.slice(1);
      working = cloneWorking(previous);
      saveError = null;
      return buildSnapshot({ baseline, working, undoStack, mount, saveError });
    },

    discard() {
      undoStack = [];
      working = cloneWorking(baseline);
      saveError = null;
      return buildSnapshot({ baseline, working, undoStack, mount, saveError });
    },

    reset() {
      return this.discard();
    },

    markSaveFailed(message) {
      saveError = message;
      return buildSnapshot({ baseline, working, undoStack, mount, saveError });
    },

    clearSaveFailed() {
      saveError = null;
      return buildSnapshot({ baseline, working, undoStack, mount, saveError });
    },
  };
}
