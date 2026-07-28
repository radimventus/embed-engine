import type { WorkspaceSectionId } from '../../model';

const SECTIONS: readonly {
  id: WorkspaceSectionId;
  label: string;
}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'experience', label: 'Experience' },
  { id: 'knowledge-package', label: 'Knowledge' },
  { id: 'decision', label: 'Decision' },
  { id: 'ai-context', label: 'AI Context' },
  { id: 'knowledge-layers', label: 'Layers' },
  { id: 'learning', label: 'Learning' },
  { id: 'decision-engine', label: 'Engine' },
  { id: 'decision-runtime', label: 'Runtime' },
  { id: 'rule-evaluation', label: 'Evaluation' },
  { id: 'media', label: 'Média' },
  { id: 'layout', label: 'Dispozice' },
  { id: 'knowledge', label: 'Soubory' },
];

type SectionNavigationProps = {
  readonly activeSection: WorkspaceSectionId;
  readonly onSelectSection: (sectionId: WorkspaceSectionId) => void;
};

export function SectionNavigation({
  activeSection,
  onSelectSection,
}: SectionNavigationProps) {
  return (
    <nav
      className="sticky top-0 z-20 mb-8 flex gap-2.5 bg-builder-canvas pb-[18px]"
      aria-label="Sekce workspace"
    >
      {SECTIONS.map((section) => {
        const isActive = section.id === activeSection;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`rounded-[10px] border px-[22px] py-[13px] text-sm font-medium ${
              isActive
                ? 'border-builder-navy bg-builder-navy text-white'
                : 'border-[#DDE5EF] bg-white text-builder-ink'
            }`}
          >
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}
