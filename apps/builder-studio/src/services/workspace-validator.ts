import type {
  Project,
  WorkspacePackage,
  WorkspaceValidation,
  WorkspaceValidationIssue,
} from '../model';

export type WorkspaceValidator = {
  validate(pkg: WorkspacePackage): WorkspaceValidation;
  validateProject(project: Project): readonly string[];
  validateStatus(project: Project): readonly string[];
  validateIntegrity(pkg: WorkspacePackage): readonly string[];
};

export function createWorkspaceValidator(): WorkspaceValidator {
  const toIssues = (
    code: string,
    messages: readonly string[],
    severity: 'error' | 'warning',
  ): readonly WorkspaceValidationIssue[] =>
    messages.map((message) => ({ code, severity, message }));

  return {
    validate(pkg) {
      const issues: WorkspaceValidationIssue[] = [
        ...pkg.projects.flatMap((project) =>
          toIssues('project', this.validateProject(project), 'error'),
        ),
        ...pkg.projects.flatMap((project) =>
          toIssues('status', this.validateStatus(project), 'error'),
        ),
        ...toIssues('integrity', this.validateIntegrity(pkg), 'warning'),
      ];

      return {
        valid: issues.every((issue) => issue.severity !== 'error'),
        issues,
        validatedAt: new Date().toISOString(),
      };
    },

    validateProject(project) {
      const issues: string[] = [];
      if (!project.id.trim()) issues.push('project.id is required.');
      if (!project.name.trim()) issues.push('project.name is required.');
      if (!project.slug.trim()) issues.push('project.slug is required.');
      if (project.description.trim().length === 0) {
        issues.push('project.description is required.');
      }
      return issues;
    },

    validateStatus(project) {
      const issues: string[] = [];
      if (
        !['DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED'].includes(project.status)
      ) {
        issues.push(`Unsupported project status: ${project.status}`);
      }
      return issues;
    },

    validateIntegrity(pkg) {
      const issues: string[] = [];
      const ids = new Set<string>();
      const slugs = new Set<string>();
      for (const project of pkg.projects) {
        if (ids.has(project.id)) issues.push(`Duplicate project id: ${project.id}`);
        if (slugs.has(project.slug)) issues.push(`Duplicate project slug: ${project.slug}`);
        ids.add(project.id);
        slugs.add(project.slug);
      }
      return issues;
    },
  };
}

