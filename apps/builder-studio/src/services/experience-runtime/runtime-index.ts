import type {
  ExperienceRuntimeIndexEntry,
  RuntimeExecution,
} from '../../model';

/**
 * RuntimeIndex (EPIC-BLD-32).
 */
export type RuntimeIndex = {
  index(
    packageId: string,
    execution: RuntimeExecution,
  ): ExperienceRuntimeIndexEntry;
  find(executionId: string): readonly ExperienceRuntimeIndexEntry[];
  list(packageId?: string): readonly ExperienceRuntimeIndexEntry[];
  rebuild(
    packages: readonly {
      readonly id: string;
      readonly execution: RuntimeExecution;
    }[],
  ): readonly ExperienceRuntimeIndexEntry[];
};

export function createRuntimeIndex(): RuntimeIndex {
  let entries: ExperienceRuntimeIndexEntry[] = [];

  return {
    index(packageId, execution) {
      const next: ExperienceRuntimeIndexEntry = {
        packageId,
        executionId: execution.id,
        sessionId: execution.sessionId,
        storyId: execution.storyId,
        status: execution.status,
        currentMove: execution.currentMove,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(executionId) {
      return entries.filter((item) => item.executionId === executionId);
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
        this.index(item.id, item.execution);
      }
      return [...entries];
    },
  };
}
