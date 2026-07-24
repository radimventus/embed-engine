/**
 * Experience Launcher — host entry surface (ELA-01).
 *
 * Accepts user activation, builds Launch Request, hands off to Delivery.
 * Does not create Runtime, mount Studio, or own Reveal.
 */

import {
  launchExperience,
  type LauncherArmedSession,
} from "../delivery/launchExperience";
import type { LaunchRequest } from "../delivery/launchRequest";
import {
  LAUNCHER_DEFAULT_PRESENTATION,
  type LaunchContext,
} from "../delivery/presentation";
import {
  getActiveSession,
  getArmedLauncher,
  setActiveSession,
  setArmedLauncher,
} from "../session";
import { unmount } from "../unmount";
import {
  mountEmbedHero,
  type MountedEmbedHero,
} from "./embedHero/mountEmbedHero";

export type BindExperienceLauncherOptions = {
  readonly trigger?: HTMLElement;
  /** Partner slot for Embed Hero projection (PT-EMBED-01). */
  readonly heroHost?: HTMLElement;
  readonly objectId?: string;
  readonly assetBase?: string;
  readonly launchContext?: LaunchContext;
};

function buildLaunchRequest(
  options: BindExperienceLauncherOptions,
  restoreFocusTo: HTMLElement,
): LaunchRequest {
  return {
    presentation: LAUNCHER_DEFAULT_PRESENTATION,
    launchContext: {
      hostKind: "partner-website",
      entryPoint: "launcher",
      ...options.launchContext,
    },
    objectId: options.objectId,
    assetBase: options.assetBase,
    restoreFocusTo,
  };
}

function isLauncherExperience(
  session: ReturnType<typeof getActiveSession>,
): boolean {
  return (
    session !== null &&
    "kind" in session &&
    session.kind === "client-studio-launcher"
  );
}

/**
 * Bind a host CTA (and optional Embed Hero) so activation → Launch Request → Delivery.
 */
export function bindExperienceLauncher(
  options: BindExperienceLauncherOptions,
): LauncherArmedSession {
  const focusHost = options.trigger ?? options.heroHost;
  if (focusHost === undefined) {
    throw new Error(
      "Embed.mount: Launcher Mode requires `launcher` and/or `target` (Embed Hero host)",
    );
  }

  let hero: MountedEmbedHero | undefined;

  const openExperience = (): void => {
    if (isLauncherExperience(getActiveSession())) {
      return;
    }

    const request = buildLaunchRequest(options, focusHost);
    void launchExperience(request, {
      onClose: () => {
        unmount();
      },
    })
      .then((session) => {
        setActiveSession(session);
      })
      .catch((error: unknown) => {
        console.error("Embed.launch: failed to open Experience", error);
      });
  };

  if (options.heroHost !== undefined) {
    hero = mountEmbedHero({
      host: options.heroHost,
      assetBase: options.assetBase,
      onOpenExperience: openExperience,
    });
  }

  const onActivate = (event: Event): void => {
    event.preventDefault();
    openExperience();
  };

  const trigger = options.trigger;
  if (trigger !== undefined) {
    trigger.addEventListener("click", onActivate);
    trigger.setAttribute("data-embed-launcher", "");
    trigger.setAttribute("aria-haspopup", "dialog");
  }

  const unbind = (): void => {
    if (trigger !== undefined) {
      trigger.removeEventListener("click", onActivate);
      trigger.removeAttribute("data-embed-launcher");
      trigger.removeAttribute("aria-haspopup");
    }
    hero?.dispose();
    hero = undefined;
  };

  const armed: LauncherArmedSession = {
    kind: "launcher-armed",
    host: focusHost,
    root: options.heroHost ?? trigger ?? focusHost,
    styleElement: document.createElement("style"),
    unbind,
    dispose: () => {
      unbind();
      if (getArmedLauncher() === armed) {
        setArmedLauncher(null);
      }
    },
  };

  setArmedLauncher(armed);
  return armed;
}
