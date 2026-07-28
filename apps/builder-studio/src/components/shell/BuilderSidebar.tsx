import type { PartnerCard as PartnerCardModel, ProjectRecord } from '../../model';
import { NewProjectButton } from './NewProjectButton';
import { PartnerCard } from './PartnerCard';
import { ProjectList } from './ProjectList';

type BuilderSidebarProps = {
  readonly partner: PartnerCardModel;
  readonly projects: readonly ProjectRecord[];
  readonly activeProjectId: string | null;
  readonly onOpenProject: (projectId: string) => void;
  readonly onCreateProject: () => void;
};

export function BuilderSidebar({
  partner,
  projects,
  activeProjectId,
  onOpenProject,
  onCreateProject,
}: BuilderSidebarProps) {
  return (
    <aside className="h-full overflow-y-auto border-r border-builder-line bg-white p-6">
      <PartnerCard name={partner.name} />
      <ProjectList
        projects={projects}
        activeProjectId={activeProjectId}
        onOpenProject={onOpenProject}
      />
      <NewProjectButton onCreateProject={onCreateProject} />
    </aside>
  );
}
