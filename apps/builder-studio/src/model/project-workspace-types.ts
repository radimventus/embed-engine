export type WorkspaceProjectStatus =
  | 'DRAFT'
  | 'READY'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type Project = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly status: WorkspaceProjectStatus;
  readonly thumbnail: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastOpenedAt: string | null;
  readonly metadata: {
    readonly customer: string;
    readonly manifestPath: string;
    readonly lastSyncedAt: string;
    readonly syncStatus: string;
  };
};

export type WorkspacePackage = {
  readonly id: string;
  readonly version: string;
  readonly projects: readonly Project[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly activeProjectId: string | null;
    readonly projectCount: number;
    readonly status: 'Ready' | 'Disposed';
  };
};

export type InitializeWorkspaceInput = {
  readonly title?: string;
};

export type CreateWorkspaceProjectInput = {
  readonly name: string;
  readonly description?: string;
};

export type WorkspaceProjectSort =
  | 'updatedAt'
  | 'name'
  | 'status';

export type ListWorkspaceProjectsInput = {
  readonly query?: string;
  readonly sortBy?: WorkspaceProjectSort;
};

export type WorkspaceValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type WorkspaceValidation = {
  readonly valid: boolean;
  readonly issues: readonly WorkspaceValidationIssue[];
  readonly validatedAt: string;
};

export type WorkspaceIndexEntry = {
  readonly projectId: string;
  readonly slug: string;
  readonly name: string;
  readonly status: WorkspaceProjectStatus;
  readonly updatedAt: string;
};

export type WorkspaceEventType =
  | 'ProjectCreated'
  | 'ProjectOpened'
  | 'ProjectDuplicated'
  | 'ProjectArchived'
  | 'ProjectStatusChanged';

export type WorkspaceEvent = {
  readonly eventId: string;
  readonly type: WorkspaceEventType;
  readonly projectId: string;
  readonly at: string;
  readonly message: string;
};
