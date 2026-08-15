/**
 * Embed.mount — public entry.
 *
 * Production inline: Delivery Layer → ClientStudioApp (Provider → Builder Runtime).
 * Production launcher: bind Experience Launcher → Launch on click → overlay Delivery.
 * Legacy: explicit `fixture: "garden"` or `experience` → Priority HTML renderer.
 */

import { logEmbedRuntimeBuild } from "./buildFingerprint";
import { bootstrapLegacyGardenEmbed } from "./delivery/legacyGarden";
import { bootstrapClientStudioDelivery } from "./delivery/mountClientStudioDelivery";
import { resolveProductionAssetBase } from "./delivery/resolveProductionAssetBase";
import {
  isLegacyExperienceMount,
  isLegacyGardenMount,
  isProductionMount,
  resolveExperienceMode,
  toLaunchContext,
  type EmbedMountOptions,
  type EmbedProductionMountOptions,
} from "./delivery/types";
import { resolveEngineEvents, resolveJourneyFixture } from "./fixtures";
import { bindExperienceLauncher } from "./launcher/bindExperienceLauncher";
import { setActiveSession } from "./session";
import { teardownEmbed } from "./teardown";

function resolveElement(
  target: string | HTMLElement | null | undefined,
  label: string,
): HTMLElement {
  if (target == null) {
    throw new Error(`Embed.mount: ${label} is required`);
  }

  if (typeof target !== "string") {
    return target;
  }

  const element = document.querySelector<HTMLElement>(target);
  if (!element) {
    throw new Error(`Embed.mount: ${label} not found: ${target}`);
  }
  return element;
}

function resolveLauncherTrigger(
  options: EmbedProductionMountOptions,
): HTMLElement | undefined {
  if (options.launcher === undefined) {
    return undefined;
  }
  return resolveElement(options.launcher, "launcher");
}

function resolveOptionalTarget(
  options: EmbedProductionMountOptions,
): HTMLElement | undefined {
  if (options.target === undefined) {
    return undefined;
  }
  return resolveElement(options.target, "target");
}

function resolveInlineTarget(options: EmbedProductionMountOptions): HTMLElement {
  if (options.target === undefined) {
    throw new Error('Embed.mount: inline/standalone mode requires `target`');
  }
  return resolveElement(options.target, "target");
}

/**
 * Mount Embed into a host element, or arm an Experience Launcher.
 * Replaces any previously active Embed session.
 */
export function mount(options: EmbedMountOptions): void {
  teardownEmbed();
  logEmbedRuntimeBuild("Embed Runtime");

  if (isLegacyGardenMount(options) || isLegacyExperienceMount(options)) {
    const host = resolveElement(options.target, "target");
    const fixture = resolveJourneyFixture(options);
    const engineEvents = resolveEngineEvents(options, fixture);
    const session = bootstrapLegacyGardenEmbed(host, fixture, engineEvents);
    setActiveSession(session);
    return;
  }

  if (isProductionMount(options)) {
    const mode = resolveExperienceMode(options);
    const assetBase = resolveProductionAssetBase(options.assetBase);

    if (mode === "launcher") {
      const trigger = resolveLauncherTrigger(options);
      const heroHost = resolveOptionalTarget(options);
      if (trigger === undefined && heroHost === undefined) {
        throw new Error(
          "Embed.mount: Launcher Mode requires `launcher` and/or `target` (Embed Hero host)",
        );
      }
      const armed = bindExperienceLauncher({
        trigger,
        heroHost,
        objectId: options.objectId,
        assetBase,
        launchContext: toLaunchContext(options),
      });
      setActiveSession(armed);
      return;
    }

    const host = resolveInlineTarget(options);
    const session = bootstrapClientStudioDelivery(host, {
      objectId: options.objectId,
      assetBase,
    });
    setActiveSession(session);
    return;
  }

  throw new Error("Embed.mount: unsupported mount options");
}

export type { EmbedMountOptions };
