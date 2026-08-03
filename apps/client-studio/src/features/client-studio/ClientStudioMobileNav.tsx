import { useMemo } from 'react';

import { navigateToJourneySection } from './foundation/journeyNavigation';
import { useActiveSection } from './foundation/useActiveSection';
import {
  PILOT_FLAGS,
  PILOT_SECTION_NAV,
} from './pilot/pilotVocabulary';

/**
 * Mobile section navigation (RCS-01 / RCS-05).
 * Same section ids as the desktop sidebar — reveals journey scenes when needed.
 */
export function ClientStudioMobileNav() {
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
    <nav
      data-studio-shell="mobile-nav"
      aria-label="Navigace Client Studia"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-embed-border-default bg-embed-brand-navy pb-[env(safe-area-inset-bottom,0px)] desktop:hidden"
    >
      <ul className="mx-auto flex h-14 max-w-canvas items-stretch justify-around px-1">
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id} className="flex min-w-0 flex-1">
              <button
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => {
                  navigateToJourneySection(item.id);
                }}
                className={[
                  'flex min-h-11 w-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium leading-tight transition-colors touch-manipulation',
                  isActive
                    ? 'text-embed-brand-gold'
                    : 'text-embed-background-primary/70',
                ].join(' ')}
              >
                <span className="text-xs font-semibold" aria-hidden="true">
                  {item.short}
                </span>
                <span className="max-w-full truncate">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
