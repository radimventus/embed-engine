import type { ObjectPackage } from '../../model';
import type { ObjectService } from './object-service';

/**
 * Public Object API (EPIC-BLD-08).
 * Thin facade over ObjectService.
 */
export type ObjectApi = {
  loadObject(objectId: string): ObjectPackage | null;
  saveObject(objectId: string): ObjectPackage;
  duplicateObject(objectId: string): ObjectPackage;
};

export function createObjectApi(service: ObjectService): ObjectApi {
  return {
    loadObject(objectId) {
      return service.loadObject(objectId);
    },
    saveObject(objectId) {
      return service.saveObject(objectId);
    },
    duplicateObject(objectId) {
      return service.duplicateObject(objectId);
    },
  };
}
