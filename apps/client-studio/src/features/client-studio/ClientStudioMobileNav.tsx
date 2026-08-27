import { useEffect, useMemo, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const syncScrollState = () => {
      setIsScrolled(window.scrollY > 24);
    };
    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });
    return () => window.removeEventListener("scroll", syncScrollState);
  }, []);
  const activeItem = navItems.find((item) => item.id === activeId) ?? navItems[0];

  return (
    <nav
      data-studio-shell="mobile-nav"
      data-mobile-scrolled={isScrolled ? "true" : "false"}
      aria-label="Navigace Client Studia"
      className="z-40 border-b border-embed-border-default bg-[#F7F6F4]/95 backdrop-blur desktop:hidden mobile:fixed mobile:left-3 mobile:top-3 mobile:z-[80] mobile:w-auto mobile:min-w-0 mobile:max-w-none"
    >
      <div className="relative flex min-h-9 w-full items-center gap-2 px-2">
        <button
          data-mobile-hamburger=""
          type="button"
          aria-label="Otevřít navigaci"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-lg text-embed-foreground-primary"
        >
          ☰
        </button>

        <span
          className={`min-w-0 flex-1 truncate text-[11px] text-embed-foreground-primary/70 ${
            isScrolled ? "hidden" : ""
          }`}
        >
          {activeItem?.label ?? "Prohlídka"}
        </span>
      </div>

      {isOpen ? (
        <div className="absolute left-2 top-full z-50 mt-1 min-w-44 rounded-md border border-embed-border-default bg-white p-1 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                navigateToJourneySection(item.id);
                setIsOpen(false);
              }}
              className="block w-full rounded px-3 py-2 text-left text-xs text-embed-foreground-primary hover:bg-black/5"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
