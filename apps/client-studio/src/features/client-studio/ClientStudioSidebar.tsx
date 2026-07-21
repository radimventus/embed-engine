import { useState } from 'react';
import type { ReactExperienceModel } from '@embed-engine/model';

import { DecisionFlowNavigator } from './decision-flow/DecisionFlowNavigator';

const SIDEBAR_COLLAPSED_WIDTH_PX = 48;
const SIDEBAR_EXPANDED_WIDTH_PX = 220;

type ClientStudioSidebarProps = {
  experience: ReactExperienceModel | null;
  onSelectDecision: (decisionId: string) => void;
};

/**
 * Left shell: presentation expand/collapse only.
 *
 * LEGACY — Decision Flow navigation from CommandRuntime ReactExperienceModel.
 * Not Cognitive Session / Interpretation (EX-01 quarantine).
 */
export function ClientStudioSidebar({
  experience,
  onSelectDecision,
}: ClientStudioSidebarProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      className="flex h-full min-h-screen shrink-0 flex-col bg-embed-brand-navy transition-[width] duration-200 ease-out"
      style={{
        width: expanded ? SIDEBAR_EXPANDED_WIDTH_PX : SIDEBAR_COLLAPSED_WIDTH_PX,
      }}
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

      {expanded && experience !== null ? (
        <div className="mt-section">
          <DecisionFlowNavigator
            experience={experience}
            onSelectDecision={onSelectDecision}
          />
        </div>
      ) : null}
    </aside>
  );
}
