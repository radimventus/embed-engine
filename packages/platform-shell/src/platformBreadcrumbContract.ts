import type { PlatformBreadcrumbItem } from './platformTypes';

export type WorkspaceBreadcrumbInput = {
  readonly projectSlug: string;
  readonly studioLabel: string;
  readonly onOpenWorkspace?: () => void;
  readonly trailing?: readonly PlatformBreadcrumbItem[];
};

/**
 * TASK 80 — canonical user-facing Workspace breadcrumb.
 *
 * Internal Company identifiers are deliberately not part of navigation identity.
 * Project identity must be supplied from authoritative Project.slug.
 */
export function buildWorkspaceBreadcrumb(
  input: WorkspaceBreadcrumbInput,
): readonly PlatformBreadcrumbItem[] {
  const projectSlug = input.projectSlug.trim();

  if (projectSlug.length === 0) {
    throw new Error('Workspace breadcrumb requires authoritative Project.slug.');
  }

  return [
    {
      id: 'conis',
      label: 'CONIS',
      onSelect: input.onOpenWorkspace,
    },
    { id: 'workspace', label: 'Workspace' },
    { id: 'project', label: projectSlug },
    { id: 'studio', label: input.studioLabel },
    ...(input.trailing ?? []),
  ];
}
