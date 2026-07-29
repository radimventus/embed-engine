import type {
  ExperienceModuleExecution,
  ModuleExecutionIndexEntry,
} from '../../model';

/**
 * ModuleExecutionIndex (EPIC-BLD-33).
 */
export type ModuleExecutionIndex = {
  index(
    packageId: string,
    modules: readonly ExperienceModuleExecution[],
  ): readonly ModuleExecutionIndexEntry[];
  find(moduleExecutionId: string): readonly ModuleExecutionIndexEntry[];
  list(packageId?: string): readonly ModuleExecutionIndexEntry[];
  rebuild(
    packages: readonly {
      readonly id: string;
      readonly modules: readonly ExperienceModuleExecution[];
    }[],
  ): readonly ModuleExecutionIndexEntry[];
};

export function createModuleExecutionIndex(): ModuleExecutionIndex {
  let entries: ModuleExecutionIndexEntry[] = [];

  return {
    index(packageId, modules) {
      const next = modules.map((item) => ({
        packageId,
        moduleExecutionId: item.id,
        sessionId: item.sessionId,
        moduleId: item.moduleId,
        status: item.status,
      }));
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        ...next,
      ];
      return next;
    },

    find(moduleExecutionId) {
      return entries.filter(
        (item) => item.moduleExecutionId === moduleExecutionId,
      );
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
        this.index(item.id, item.modules);
      }
      return [...entries];
    },
  };
}
