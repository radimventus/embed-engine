export {
  DEFAULT_WORKSPACE_PROJECTS,
  DEFAULT_WORKSPACE_COMPANIES,
  DEFAULT_WORKSPACE_FOLDERS,
  OBJECT_TYPE_OPTIONS,
  createInitialWorkspaceRegistry,
  createWorkspaceProjectFromInput,
  createWorkspaceObjectFromInput,
  findWorkspaceCompany,
  findWorkspaceFolder,
  getActiveWorkspaceFolder,
  housesForFolder,
  openWorkspaceFolder,
  openWorkspaceProject,
  closeWorkspaceProject,
  decideProjectSwitch,
  updateWorkspaceProject,
  type WorkspaceProject,
  type WorkspaceProjectFolder,
  type WorkspaceCompany,
  type WorkspaceRegistryState,
  type CreateWorkspaceProjectInput,
  type CreateWorkspaceObjectInput,
  type WorkspaceProjectStatus,
} from './workspaceRegistry';
export { useWorkspaceController } from './useWorkspaceController';
export type { UpdateWorkspaceProjectInput } from './useWorkspaceController';
export { WorkspaceSidebar } from './WorkspaceSidebar';
export { ProjectCreateDialog } from './ProjectCreateDialog';
export { ProjectEditDialog } from './ProjectEditDialog';
export { ObjectCreateDialog } from './ObjectCreateDialog';
export { requestWorkspaceActive } from './requestWorkspaceActive';
