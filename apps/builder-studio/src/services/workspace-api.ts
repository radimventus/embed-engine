import type {
  CreateWorkspaceProjectInput,
  ListWorkspaceProjectsInput,
  Project,
  WorkspaceEvent,
  WorkspaceIndexEntry,
  WorkspacePackage,
  WorkspaceValidation,
} from '../model';
import type { WorkspaceService } from './workspace-service';

export type WorkspaceApi = {
  initialize(): WorkspacePackage;
  createProject(input: CreateWorkspaceProjectInput): Project;
  openProject(projectId: string): Project;
  archiveProject(projectId: string): Project;
  duplicateProject(projectId: string): Project;
  listProjects(input?: ListWorkspaceProjectsInput): readonly Project[];
  findProject(projectId: string): Project | null;
  validate(): WorkspaceValidation;
  dispose(): WorkspacePackage;
  getPackage(): WorkspacePackage | null;
  listEvents(): readonly WorkspaceEvent[];
  listIndex(): readonly WorkspaceIndexEntry[];
};

export function createWorkspaceApi(service: WorkspaceService): WorkspaceApi {
  const workspace = service;

  return {
    initialize() {
      return workspace.initialize();
    },
    createProject(input) {
      return workspace.createProject(input);
    },
    openProject(projectId) {
      return workspace.openProject(projectId);
    },
    archiveProject(projectId) {
      return workspace.archiveProject(projectId);
    },
    duplicateProject(projectId) {
      return workspace.duplicateProject(projectId);
    },
    listProjects(input) {
      return workspace.listProjects(input);
    },
    findProject(projectId) {
      return workspace.findProject(projectId);
    },
    validate() {
      return workspace.validate();
    },
    dispose() {
      return workspace.dispose();
    },
    getPackage() {
      return workspace.getPackage();
    },
    listEvents() {
      return workspace.getEvents();
    },
    listIndex() {
      return workspace.getIndex();
    },
  };
}
