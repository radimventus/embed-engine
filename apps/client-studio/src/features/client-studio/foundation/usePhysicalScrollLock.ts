import { useEffect } from "react";

/** Blocks only physical wheel/touch movement while a scene anchor has focus. */
export function usePhysicalScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const root =
      document.querySelector<HTMLElement>("[data-embed-overlay-mount]") ??
      window;
    const preventPhysicalScroll = (event: Event) => event.preventDefault();

    root.addEventListener("wheel", preventPhysicalScroll, { passive: false });
    root.addEventListener("touchmove", preventPhysicalScroll, {
      passive: false,
    });

    return () => {
      root.removeEventListener("wheel", preventPhysicalScroll);
      root.removeEventListener("touchmove", preventPhysicalScroll);
    };
  }, [active]);
}
