import { useState } from 'react';
import type { ReactExperienceModel } from '@embed-engine/model';

import { DecisionFlowNavigator } from './decision-flow/DecisionFlowNavigator';

const SIDEBAR_COLLAPSED_WIDTH_PX = 48;
const SIDEBAR_EXPANDED_WIDTH_PX = 220;

type ClientStudioSidebarProps = {
  /** LEGACY Decision Flow model — only when CommandRuntime host is enabled. */
  legacyExperience?: ReactExperienceModel | null;
  onSelectDecision?: (decisionId: string) => void;
};

/**
 * Left shell: presentation expand/collapse.
 * Default Cognitive demo: chrome only (no CommandRuntime Decision Flow).
 */
export function ClientStudioSidebar({
  legacyExperience = null,
  onSelectDecision,
}: ClientStudioSidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const showLegacyFlow =
    legacyExperience !== null && onSelectDecision !== undefined;

  return (
    <aside
      className="flex h-full min-h-screen shrink-0 flex-col bg-embed-brand-navy transition-[width] duration-200 ease-out"
      style={{
        width: expanded ? SIDEBAR_EXPANDED_WIDTH_PX : SIDEBAR_COLLAPSED_WIDTH_PX,
      }}
      data-cognitive-shell="true"
    >
      <div
        className={`flex h-header shrink-0 -translate-y-[3px] items-center ${expanded ? 'justify-start px-4' : 'justify-center'}`}
      >
        <button
          type="button"
          aria-label={expanded ? 'Zavřít menu' : 'Otevřít menu'}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="flex flex-col items-center justify-center gap-1.5 p-2"
        >
          <span className="block h-px w-5 bg-embed-background-primary" />
          <span className="block h-px w-5 bg-embed-background-primary" />
          <span className="block h-px w-5 bg-embed-background-primary" />
        </button>
      </div>

      {expanded && showLegacyFlow ? (
        <div className="mt-section" data-legacy-experience="command-runtime-sidebar">
          <DecisionFlowNavigator
            experience={legacyExperience}
            onSelectDecision={onSelectDecision}
          />
        </div>
      ) : null}
    </aside>
  );
}
