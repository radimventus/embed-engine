import { useEffect, useMemo, useState } from "react";
import {
  createWorkspaceHouseChangeMessage,
  resolveWorkspaceHostHref,
  usePlatformSession,
} from "@embed-engine/platform-access";
import {
  resolveClientActiveProjectId,
  readActiveClientHouseId,
  listClientHouses,
  resolveClientRuntimeBinding,
} from "./runtime/clientCanonicalBind";


/**
 * Mobile section navigation (RCS-01 / RCS-05).
 * Same section ids as the desktop sidebar — reveals journey scenes when needed.
 */
export function ClientStudioMobileNav() {
  const { session, updateWorkspaceScope } = usePlatformSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const binding = resolveClientRuntimeBinding();
  const activeProjectId =
    binding.runtimeProjectId ?? resolveClientActiveProjectId(session?.projectId);
  const houses = useMemo(
    () => listClientHouses(activeProjectId),
    [activeProjectId],
  );
  const activeHouseId = readActiveClientHouseId(binding);

  useEffect(() => {
    const syncScrollState = () => setIsScrolled(window.scrollY > 24);
    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });
    return () => window.removeEventListener("scroll", syncScrollState);
  }, []);

  const switchActiveHouse = (houseId: string): void => {
    if (
      activeProjectId === null ||
      !listClientHouses(activeProjectId).some(
        (house) => house.house?.houseId === houseId,
      )
    ) return;

    updateWorkspaceScope({ activeHouseId: houseId });

    const embedRoot =
      document.querySelector<HTMLElement>('[data-embed-root]');
    if (embedRoot !== null) {
      embedRoot.dataset.objectId = houseId;
      window.dispatchEvent(new Event('embed:house-change'));
    }

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

  return (
    <nav
      data-studio-shell="mobile-nav"
      data-mobile-scrolled={isScrolled ? "true" : "false"}
      aria-label="Navigace Client Studia"
      className="desktop:hidden mobile:fixed mobile:left-3 mobile:top-3 mobile:z-[80]"
    >
      <div className="relative h-10 w-10">
        <button
          data-mobile-hamburger=""
          type="button"
          aria-label="Otevřít navigaci"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md border border-embed-border-default bg-[#F7F6F4]/95 p-0 text-lg text-embed-foreground-primary shadow-sm backdrop-blur"
        >
          ☰
        </button>


      </div>

      {isOpen ? (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-52 rounded-md border border-embed-border-default bg-white p-1 shadow-lg"
          aria-label="Seznam domů"
        >
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
            Domy
          </p>
          {houses.map((house) => {
            if (house.house === null) return null;
            const houseId = house.house.houseId;
            const isActive = houseId === activeHouseId;

            return (
              <button
                key={houseId}
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  setIsOpen(false);
                  if (houseId !== activeHouseId) switchActiveHouse(houseId);
                }}
                className={[
                  "block w-full rounded px-3 py-2 text-left text-sm",
                  isActive ? "bg-black/5 font-semibold" : "hover:bg-black/5",
                ].join(" ")}
              >
                {house.house.name}
              </button>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
}
