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

export type HousePackageDirtyState = 'clean' | 'modified';

export type HousePackageEditSnapshot = {
  readonly baseline: HousePackageWorkingContent;
  readonly working: HousePackageWorkingContent;
  readonly dirtyState: HousePackageDirtyState;
  readonly dirty: readonly HpEditSection[];
  readonly canUndo: boolean;
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
}): HousePackageEditSnapshot {
  const dirty = dirtySections(input.baseline, input.working);
  const validation = validateHousePackageWorking(input.working);
  const sectionErrors = errorsForDirtySections(validation.errors, dirty);
  return {
    baseline: input.baseline,
    working: input.working,
    dirtyState: dirty.length === 0 ? 'clean' : 'modified',
    dirty,
    canUndo: input.undoStack.length > 0,
    validation,
    sectionErrors,
    geometryByFloor: input.mount.geometryByFloor,
    packageRootLabel: input.mount.packageRootLabel,
    canonicalDiskRoot: input.mount.canonicalDiskRoot,
    mountedAt: input.mount.mountedAt,
  };
}

/**
 * Create an edit session bound to a mount. Mutations stay in memory only.
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

  const commit = (
    next: HousePackageWorkingContent,
  ): HousePackageEditSnapshot => {
    undoStack = [cloneWorking(working), ...undoStack].slice(0, MAX_UNDO);
    working = next;
    return buildSnapshot({ baseline, working, undoStack, mount });
  };

  return {
    snapshot() {
      return buildSnapshot({ baseline, working, undoStack, mount });
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
      return buildSnapshot({ baseline, working, undoStack, mount });
    },

    discard() {
      undoStack = [];
      working = cloneWorking(baseline);
      return buildSnapshot({ baseline, working, undoStack, mount });
    },

    reset() {
      return this.discard();
    },
  };
}
