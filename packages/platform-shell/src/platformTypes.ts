export type PlatformBreadcrumbItem = {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
  /** Cross-studio / landing navigation without leaving Platform Shell. */
  readonly onSelect?: () => void;
};

export type PlatformWorkspaceOption = {
  readonly id: string;
  readonly label: string;
  readonly companyLabel: string;
};

export type PlatformWorkspaceState = {
  readonly companyLabel: string;
  readonly projectLabel: string;
  readonly projects: readonly PlatformWorkspaceOption[];
  readonly onSelectProject?: (projectId: string) => void;
};
