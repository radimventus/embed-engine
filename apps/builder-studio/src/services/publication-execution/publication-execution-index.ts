import type {
  PublicationExecutionIndexEntry,
  PublicationExecutionPackage,
} from '../../model';

export type PublicationExecutionIndex = {
  index(
    packageId: string,
    pkg: PublicationExecutionPackage,
  ): readonly PublicationExecutionIndexEntry[];
  find(planId: string): readonly PublicationExecutionIndexEntry[];
  list(packageId?: string): readonly PublicationExecutionIndexEntry[];
  rebuild(
    packages: readonly PublicationExecutionPackage[],
  ): readonly PublicationExecutionIndexEntry[];
};

export function createPublicationExecutionIndex(): PublicationExecutionIndex {
  let entries: PublicationExecutionIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const progress = `${pkg.session.metadata.completedSteps}/${pkg.session.metadata.totalSteps}`;
      const next: PublicationExecutionIndexEntry = {
        packageId,
        executionSessionId: pkg.session.id,
        planId: pkg.session.planId,
        status: pkg.session.status,
        currentStep: pkg.session.currentStep,
        progress,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return [next];
    },

    find(planId) {
      return entries.filter((item) => item.planId === planId);
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
        this.index(item.id, item);
      }
      return [...entries];
    },
  };
}
