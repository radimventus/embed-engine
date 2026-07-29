import type {
  ExperienceState,
  ExperienceStateIndexEntry,
} from '../../model';

/**
 * ExperienceStateIndex (EPIC-BLD-34).
 */
export type ExperienceStateIndex = {
  index(
    packageId: string,
    state: ExperienceState,
  ): ExperienceStateIndexEntry;
  find(stateId: string): readonly ExperienceStateIndexEntry[];
  list(packageId?: string): readonly ExperienceStateIndexEntry[];
  rebuild(
    packages: readonly {
      readonly id: string;
      readonly state: ExperienceState;
    }[],
  ): readonly ExperienceStateIndexEntry[];
};

export function createExperienceStateIndex(): ExperienceStateIndex {
  let entries: ExperienceStateIndexEntry[] = [];

  return {
    index(packageId, state) {
      const next: ExperienceStateIndexEntry = {
        packageId,
        stateId: state.id,
        sessionId: state.sessionId,
        status: state.status,
        checkpointId: state.checkpointId,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(stateId) {
      return entries.filter((item) => item.stateId === stateId);
    },

    list(packageId) {
      if (packageId === undefined) {
        return [...entries];
      }
      return entries.filter((item) => item.packageId === packageId);
    },

    rebuild(packages) {
      entries = [];
      for (const item of packages) {
        this.index(item.id, item.state);
      }
      return [...entries];
    },
  };
}
