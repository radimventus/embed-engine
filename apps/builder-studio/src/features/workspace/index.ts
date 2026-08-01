export {
  DEFAULT_WORKSPACE_PROJECTS,
  DEFAULT_WORKSPACE_COMPANIES,
  OBJECT_TYPE_OPTIONS,
  createInitialWorkspaceRegistry,
  createWorkspaceProjectFromInput,
  findWorkspaceCompany,
  openWorkspaceProject,
  closeWorkspaceProject,
  decideProjectSwitch,
  updateWorkspaceProject,
  type WorkspaceProject,
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
