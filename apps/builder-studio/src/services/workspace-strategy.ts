import type {
  CreateWorkspaceProjectInput,
  Project,
  WorkspacePackage,
} from '../model';

export type WorkspaceStrategy = {
  readonly id: string;
  supports(input: CreateWorkspaceProjectInput): boolean;
  create(
    input: CreateWorkspaceProjectInput,
    existingProjects: readonly Project[],
    createProject: (input: CreateWorkspaceProjectInput) => Project,
  ): Project;
  validate(pkg: WorkspacePackage): boolean;
};

export function createBasicWorkspaceStrategy(): WorkspaceStrategy {
  return {
    id: 'basic-workspace-strategy',

    supports(input) {
      return input.name.trim().length > 0;
    },

    create(input, _existingProjects, createProject) {
      return createProject(input);
    },

    validate(pkg) {
      return pkg.projects.every((project) => project.name.trim().length > 0);
    },
  };
}

