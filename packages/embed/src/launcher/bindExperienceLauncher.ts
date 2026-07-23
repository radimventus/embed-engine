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

export type BindExperienceLauncherOptions = {
  readonly trigger: HTMLElement;
  readonly objectId?: string;
  readonly assetBase?: string;
  readonly launchContext?: LaunchContext;
};

function buildLaunchRequest(
  options: BindExperienceLauncherOptions,
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
    restoreFocusTo: options.trigger,
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
 * Bind a host CTA so click → Launch Request → Delivery launchExperience.
 */
export function bindExperienceLauncher(
  options: BindExperienceLauncherOptions,
): LauncherArmedSession {
  const { trigger } = options;

  const onActivate = (event: Event): void => {
    event.preventDefault();

    if (isLauncherExperience(getActiveSession())) {
      return;
    }

    try {
      const request = buildLaunchRequest(options);
      const session = launchExperience(request, {
        onClose: () => {
          unmount();
        },
      });
      setActiveSession(session);
    } catch (error) {
      console.error("Embed.launch: failed to open Experience", error);
    }
  };

  trigger.addEventListener("click", onActivate);
  trigger.setAttribute("data-embed-launcher", "");
  trigger.setAttribute("aria-haspopup", "dialog");

  const unbind = (): void => {
    trigger.removeEventListener("click", onActivate);
    trigger.removeAttribute("data-embed-launcher");
    trigger.removeAttribute("aria-haspopup");
  };

  const armed: LauncherArmedSession = {
    kind: "launcher-armed",
    host: trigger,
    root: trigger,
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
