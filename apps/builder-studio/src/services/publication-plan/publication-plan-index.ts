import type {
  PublicationPlanIndexEntry,
  PublicationPlanPackage,
} from '../../model';

export type PublicationPlanIndex = {
  index(
    packageId: string,
    pkg: PublicationPlanPackage,
  ): readonly PublicationPlanIndexEntry[];
  find(rootArtifactId: string): readonly PublicationPlanIndexEntry[];
  list(packageId?: string): readonly PublicationPlanIndexEntry[];
  rebuild(
    packages: readonly PublicationPlanPackage[],
  ): readonly PublicationPlanIndexEntry[];
};

export function createPublicationPlanIndex(): PublicationPlanIndex {
  let entries: PublicationPlanIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: PublicationPlanIndexEntry = {
        packageId,
        planId: pkg.plan.id,
        rootArtifactId: pkg.plan.rootArtifactId,
        status: pkg.plan.status,
        stepCount: pkg.plan.steps.length,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return [next];
    },

    find(rootArtifactId) {
      return entries.filter((item) => item.rootArtifactId === rootArtifactId);
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
