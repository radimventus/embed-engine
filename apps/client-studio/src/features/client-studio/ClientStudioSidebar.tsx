import { useMemo } from 'react';
import type { ReactExperienceModel } from '@embed-engine/model';

import { DecisionFlowNavigator } from './decision-flow/DecisionFlowNavigator';
import { navigateToJourneySection } from './foundation/journeyNavigation';
import { useActiveSection } from './foundation/useActiveSection';
import {
  PILOT_FLAGS,
  PILOT_SECTION_NAV,
} from './pilot/pilotVocabulary';

/** Layout-spec fixed sidebar width (48px). */
const SIDEBAR_WIDTH_PX = 48;

type ClientStudioSidebarProps = {
  /** LEGACY Decision Flow model — only when CommandRuntime host is enabled. */
  legacyExperience?: ReactExperienceModel | null;
  onSelectDecision?: (decisionId: string) => void;
};

/**
 * Left AppShell rail (CSCB-01).
 * Fixed 48px per layout spec. Section nav + optional legacy Decision Flow overlay.
 * RCS-05 — section jumps reveal journey scenes via navigateToJourneySection.
 */
export function ClientStudioSidebar({
  legacyExperience = null,
  onSelectDecision,
}: ClientStudioSidebarProps) {
  const showLegacyFlow =
    legacyExperience !== null && onSelectDecision !== undefined;

  const navItems = useMemo(
    () =>
      PILOT_SECTION_NAV.filter(
        (item) =>
          item.id !== 'ai-advisor' || PILOT_FLAGS.showAiAdvisor,
      ),
    [],
  );

  const sectionIds = useMemo(
    () => navItems.map((item) => item.id),
    [navItems],
  );

  const activeId = useActiveSection(sectionIds);

  return (
    <aside
      className="flex h-full min-h-screen w-sidebar shrink-0 flex-col bg-embed-brand-navy"
      style={{ width: SIDEBAR_WIDTH_PX }}
      data-studio-shell="sidebar"
      aria-label="Navigace Client Studia"
    >
      <div className="flex h-header shrink-0 items-center justify-center">
        <span
          className="block h-2 w-2 rounded-full bg-embed-brand-gold"
          aria-hidden="true"
        />
      </div>

      {!showLegacyFlow ? (
        <nav
          className="mt-section flex flex-1 flex-col items-center gap-2"
          aria-label="Sekce Decision Journey"
        >
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => {
                  navigateToJourneySection(item.id);
                }}
                className={[
                  'flex h-9 w-9 items-center justify-center text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-embed-background-primary/15 text-embed-brand-gold'
                    : 'text-embed-background-primary/70 hover:bg-embed-background-primary hover:text-embed-brand-navy',
                ].join(' ')}
              >
                {item.short}
              </button>
            );
          })}
        </nav>
      ) : (
        <div
          className="mt-section overflow-y-auto"
          data-legacy-experience="command-runtime-sidebar"
        >
          <DecisionFlowNavigator
            experience={legacyExperience}
            onSelectDecision={onSelectDecision}
          />
        </div>
      )}
    </aside>
  );
}
