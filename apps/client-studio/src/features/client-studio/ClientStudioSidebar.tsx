import { useEffect, useMemo, useState } from "react";
import type { ReactExperienceModel } from "@embed-engine/model";
import {
  createWorkspaceHouseChangeMessage,
  listWorkspaceHouses,
  resolveWorkspaceHostHref,
  usePlatformSession,
  type WorkspaceHouseIdentity,
} from "@embed-engine/platform-access";

import { DecisionFlowNavigator } from "./decision-flow/DecisionFlowNavigator";
import { navigateToJourneySection } from "./foundation/journeyNavigation";
import { useActiveSection } from "./foundation/useActiveSection";
import { PILOT_SECTION_IDS } from "./pilot/pilotVocabulary";
import {
  resolveClientActiveProjectId,
  readActiveClientHouseId,
} from "./runtime/clientCanonicalBind";

/** Layout-spec fixed sidebar width (48px). */
const SIDEBAR_WIDTH_PX = 48;

/** PT-CS-07 — visible Journey progress targets, grouped by canonical scenes. */
const SCENE_NAV = [
  {
    sceneId: "journey-scene-orientation",
    sectionId: PILOT_SECTION_IDS.hero,
    label: "Scéna 1 — Hero",
  },
  {
    sceneId: "journey-scene-orientation",
    sectionId: PILOT_SECTION_IDS.walkthrough,
    label: "Scéna 2 — Tour",
  },
  {
    sceneId: "journey-scene-priority",
    sectionId: PILOT_SECTION_IDS.priority,
    label: "Scéna 3 — Priority",
  },
  {
    sceneId: "journey-scene-racio",
    sectionId: PILOT_SECTION_IDS.aiAdvisor,
    label: "Scéna 4 — Racio",
  },
  {
    sceneId: "journey-scene-decision",
    sectionId: PILOT_SECTION_IDS.audit,
    label: "Scéna 5 — Audit a Footer",
  },
] as const;

const ORIENTATION_SECTION_IDS = [
  PILOT_SECTION_IDS.hero,
  PILOT_SECTION_IDS.walkthrough,
] as const;

type ClientStudioSidebarProps = {
  /** LEGACY Decision Flow model — only when CommandRuntime host is enabled. */
  legacyExperience?: ReactExperienceModel | null;
  onSelectDecision?: (decisionId: string) => void;
  activeSceneId?: string | null;
  visibleSceneIds?: readonly string[];
};

/**
 * Left AppShell rail (CSCB-01 / PT-CS-07 / CAP-PLAT-02c / CAP-PLAT-04h).
 * Hamburger → CPL Houses. Scene Navigator = UI navigation only.
 */
export function ClientStudioSidebar({
  legacyExperience = null,
  onSelectDecision,
  activeSceneId = null,
  visibleSceneIds = [SCENE_NAV[0].sceneId],
}: ClientStudioSidebarProps) {
  const { session, updateWorkspaceScope } = usePlatformSession();
  const showLegacyFlow =
    legacyExperience !== null && onSelectDecision !== undefined;

  const visibleSceneNav = useMemo(
    () => SCENE_NAV.filter((item) => visibleSceneIds.includes(item.sceneId)),
    [visibleSceneIds],
  );
  const [activeOrientationSectionId, setActiveOrientationSectionId] =
    useState<string>(PILOT_SECTION_IDS.hero);
  const observedOrientationSectionId = useActiveSection(
    ORIENTATION_SECTION_IDS,
  );

  useEffect(() => {
    if (
      activeSceneId === "journey-scene-orientation" &&
      observedOrientationSectionId !== null
    ) {
      setActiveOrientationSectionId(observedOrientationSectionId);
    }
  }, [activeSceneId, observedOrientationSectionId]);

  const activeSectionId =
    activeSceneId === "journey-scene-orientation"
      ? activeOrientationSectionId
      : (visibleSceneNav.find((item) => item.sceneId === activeSceneId)
          ?.sectionId ?? null);

  const [menuOpen, setMenuOpen] = useState(false);
  const activeProjectId = resolveClientActiveProjectId(session?.projectId);
  const houses = useMemo<readonly WorkspaceHouseIdentity[]>(
    () =>
      activeProjectId === null ? [] : listWorkspaceHouses(activeProjectId),
    [activeProjectId, session],
  );
  const activeHouseId = session?.activeHouseId ?? readActiveClientHouseId();

  const switchActiveHouse = (houseId: string): void => {
    if (
      activeProjectId === null ||
      !listWorkspaceHouses(activeProjectId).some(
        (house) => house.houseId === houseId,
      )
    ) {
      return;
    }
    updateWorkspaceScope({ activeHouseId: houseId });
    const message = createWorkspaceHouseChangeMessage(houseId);
    if (typeof window === "undefined") return;
    if (window.parent === window) {
      window.dispatchEvent(new CustomEvent(message.type, { detail: message }));
      return;
    }
    window.parent.postMessage(
      message,
      new URL(resolveWorkspaceHostHref()).origin,
    );
  };

  const toggleHouseMenu = (): void => {
    setMenuOpen((wasOpen) => !wasOpen);
  };

  return (
    <aside
      className="relative flex h-full min-h-screen w-sidebar shrink-0 flex-col bg-embed-brand-navy"
      style={{ width: SIDEBAR_WIDTH_PX }}
      data-studio-shell="sidebar"
      aria-label="Navigace Client Studia"
    >
      <div className="flex h-header shrink-0 items-center justify-center">
        <button
          type="button"
          aria-label="Otevřít menu domů"
          aria-expanded={menuOpen}
          data-testid="client-house-menu-toggle"
          onClick={toggleHouseMenu}
          className="text-xl font-bold text-embed-brand-gold transition-opacity hover:opacity-80"
        >
          ☰
        </button>
      </div>

      {!showLegacyFlow ? (
        <nav
          className="mt-3 flex flex-1 flex-col items-center gap-3"
          aria-label="Scene Navigator"
          data-testid="client-scene-navigator"
        >
          {visibleSceneNav.map((item) => {
            const isActive = activeSectionId === item.sectionId;
            return (
              <button
                key={item.sectionId}
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? "true" : undefined}
                data-testid={`client-scene-dot-${item.sectionId}`}
                data-client-scene-dot=""
                data-active-scene-dot={isActive ? "true" : "false"}
                onClick={() => {
                  if (item.sceneId === "journey-scene-orientation") {
                    setActiveOrientationSectionId(item.sectionId);
                  }
                  navigateToJourneySection(item.sectionId);
                }}
                className={[
                  "box-border h-3 w-3 rounded-full transition-colors",
                  isActive
                    ? "border-2 border-embed-brand-gold bg-embed-brand-gold"
                    : "border border-embed-background-primary/50 bg-embed-background-primary/25 hover:border-embed-brand-gold/70",
                ].join(" ")}
              />
            );
          })}
          <span className="sr-only">
            {visibleSceneNav.map((scene) => scene.label).join(" · ")}
          </span>
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

      {menuOpen ? (
        <div
          className="absolute left-full top-0 z-[60] flex h-full w-56 flex-col border-r border-embed-brand-gold/30 bg-embed-brand-navy shadow-lg"
          data-testid="client-house-menu"
          role="dialog"
          aria-label="Seznam domů"
        >
          <p className="px-3 py-4 text-xs font-semibold uppercase tracking-wide text-embed-brand-gold">
            Domy
          </p>
          <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4">
            {houses.map((house) => {
              const houseId = house.houseId;
              const isActive = houseId === activeHouseId;
              return (
                <li key={houseId}>
                  <button
                    type="button"
                    data-testid={`client-house-option-${houseId}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => {
                      setMenuOpen(false);
                      if (houseId !== activeHouseId) {
                        switchActiveHouse(houseId);
                      }
                    }}
                    className={[
                      "w-full rounded-[6px] px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-embed-background-primary/15 text-embed-brand-gold"
                        : "text-embed-background-primary/85 hover:bg-embed-background-primary/10 hover:text-embed-brand-gold",
                    ].join(" ")}
                  >
                    {house.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
