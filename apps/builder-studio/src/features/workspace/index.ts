export {
  DEFAULT_WORKSPACE_PROJECTS,
  DEFAULT_WORKSPACE_COMPANIES,
  DEFAULT_WORKSPACE_FOLDERS,
  OBJECT_TYPE_OPTIONS,
  createInitialWorkspaceRegistry,
  createWorkspaceProjectFromInput,
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
  type WorkspaceProjectStatus,
} from './workspaceRegistry';
export { useWorkspaceController } from './useWorkspaceController';
export type { UpdateWorkspaceProjectInput } from './useWorkspaceController';
export { WorkspaceSidebar } from './WorkspaceSidebar';
export { ProjectCreateDialog } from './ProjectCreateDialog';
export { ProjectEditDialog } from './ProjectEditDialog';
export { requestWorkspaceActive } from './requestWorkspaceActive';
