import type {
  CreateLearningRecordsPackageInput,
  LearningRecordReference,
  LearningRecordsPackage,
} from '../../model';
import type { LearningPackageManager } from './learning-package-manager';

/**
 * Public Learning Package Manager API (EPIC-BLD-23).
 */
export type LearningPackageManagerApi = {
  createLearningPackage(
    input?: CreateLearningRecordsPackageInput,
  ): LearningRecordsPackage;
  loadLearningPackage(packageId: string): LearningRecordsPackage | null;
  publishLearningPackage(packageId: string): LearningRecordsPackage;
  listLearningRecords(packageId: string): readonly LearningRecordReference[];
  validateLearningPackage(packageId: string): LearningRecordsPackage;
};

export function createLearningPackageManagerApi(
  manager: LearningPackageManager,
): LearningPackageManagerApi {
  return {
    createLearningPackage(input) {
      return manager.createPackage(input);
    },
    loadLearningPackage(packageId) {
      return manager.loadPackage(packageId);
    },
    publishLearningPackage(packageId) {
      return manager.publishPackage(packageId);
    },
    listLearningRecords(packageId) {
      return manager.listRecords(packageId);
    },
    validateLearningPackage(packageId) {
      return manager.validatePackage(packageId);
    },
  };
}
