import type {
  ClientPublicationEvent,
  ClientPublicationIndexEntry,
  ClientPublicationModel,
  ClientPublicationPackage,
  ClientPublicationValidation,
  InitializeClientPublicationInput,
  LoadClientPublicationInput,
} from '../../model';
import {
  createClientPublicationAdapter,
  type ClientPublicationAdapter,
} from './client-publication-adapter';

export type ClientPublicationApi = {
  loadClientPublication(
    packageId: string | null,
    input: LoadClientPublicationInput,
    init?: InitializeClientPublicationInput,
  ): ClientPublicationPackage;
  publishClientPublication(packageId: string): ClientPublicationPackage;
  listClientPublications(): readonly ClientPublicationModel[];
  findClientPublication(objectId: string): ClientPublicationModel | null;
  validateClientPublication(packageId: string): ClientPublicationValidation;
  initialize(input: InitializeClientPublicationInput): ClientPublicationPackage;
  transformClientPublication(packageId: string): ClientPublicationPackage;
  preview(packageId: string): ClientPublicationPackage | null;
  listPackages(): readonly ClientPublicationPackage[];
  listEvents(): readonly ClientPublicationEvent[];
  listIndex(): readonly ClientPublicationIndexEntry[];
  dispose(packageId: string): ClientPublicationPackage;
};

export function createClientPublicationApi(
  adapter?: ClientPublicationAdapter,
): ClientPublicationApi {
  const service = adapter ?? createClientPublicationAdapter();

  return {
    initialize(input) {
      return service.initialize(input);
    },
    loadClientPublication(packageId, input, init) {
      if (packageId === null) {
        return service.initialize({
          sessionId: init?.sessionId ?? 'client-publication-session-demo',
          title: init?.title ?? 'Builder Client Publication',
          publication: init?.publication ?? input,
        });
      }
      return service.load(packageId, input);
    },
    publishClientPublication(packageId) {
      service.validate(packageId);
      return service.publish(packageId);
    },
    listClientPublications() {
      return service.listClientPublications();
    },
    findClientPublication(objectId) {
      return service.findClientPublication(objectId);
    },
    validateClientPublication(packageId) {
      return service.validate(packageId);
    },
    transformClientPublication(packageId) {
      return service.transform(packageId);
    },
    preview(packageId) {
      return service.getPackage(packageId);
    },
    listPackages() {
      return service.listPackages();
    },
    listEvents() {
      return service.getEvents();
    },
    listIndex() {
      return service.getIndex();
    },
    dispose(packageId) {
      return service.dispose(packageId);
    },
  };
}
