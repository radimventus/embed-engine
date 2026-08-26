import { useMemo } from "react";

import { navigateToJourneySection } from "./foundation/journeyNavigation";
import { useActiveSection } from "./foundation/useActiveSection";
import { PILOT_FLAGS, PILOT_SECTION_NAV } from "./pilot/pilotVocabulary";

type ClientStudioMobileNavProps = {
  readonly visibleSceneIds: readonly string[];
};

function sceneIdForSection(sectionId: string): string {
  if (sectionId === "priority-experience") {
    return "journey-scene-priority";
  }
  if (sectionId === "ai-advisor") {
    return "journey-scene-racio";
  }
  if (sectionId === "audit-lead-capture") {
    return "journey-scene-decision";
  }
  return "journey-scene-orientation";
}

/**
 * Mobile section navigation (RCS-01 / RCS-05).
 * Same section ids as the desktop sidebar — reveals journey scenes when needed.
 */
export function ClientStudioMobileNav({
  visibleSceneIds,
}: ClientStudioMobileNavProps) {
  const navItems = useMemo(
    () =>
      PILOT_SECTION_NAV.filter(
        (item) =>
          (item.id !== "ai-advisor" || PILOT_FLAGS.showAiAdvisor) &&
          visibleSceneIds.includes(sceneIdForSection(item.id)),
      ),
    [visibleSceneIds],
  );

  const sectionIds = useMemo(() => navItems.map((item) => item.id), [navItems]);

  const activeId = useActiveSection(sectionIds);

  return (
    <nav
      data-studio-shell="mobile-nav"
      aria-label="Navigace Client Studia"
      className="sticky top-[var(--experience-header-height,72px)] z-40 w-full border-b border-embed-border-default bg-[#F7F6F4]/95 backdrop-blur desktop:hidden"
    >
      <ul className="mx-auto flex min-h-9 max-w-canvas items-stretch justify-around px-1 mobile:min-h-8">
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id} className="flex min-w-0 flex-1">
              <button
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  navigateToJourneySection(item.id);
                }}
                className={[
                  "flex min-h-9 w-full items-center justify-center gap-1 px-1 text-[10px] font-medium leading-none transition-colors touch-manipulation mobile:min-h-8",
                  isActive
                    ? "text-embed-brand-gold"
                    : "text-embed-foreground-primary/65",
                ].join(" ")}
              >
                <span className="text-[10px] font-semibold" aria-hidden="true">
                  {item.short}
                </span>
                <span className="max-w-full truncate mobile:hidden">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
