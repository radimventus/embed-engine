/**
 * Mount Embed Hero into a partner host slot (PT-EMBED-01).
 */

import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";

import {
  ensureClientStudioStyles,
  markEmbedBoundary,
} from "../../delivery/ensureStyles";
import { EmbedHero } from "./EmbedHero";

export type MountEmbedHeroOptions = {
  readonly host: HTMLElement;
  readonly assetBase?: string;
  readonly onOpenExperience: () => void;
};

export type MountedEmbedHero = {
  readonly host: HTMLElement;
  readonly dispose: () => void;
};

/**
 * Project Reference Hero into `host`. Injects Studio CSS (veil + utilities).
 */
export function mountEmbedHero(options: MountEmbedHeroOptions): MountedEmbedHero {
  ensureClientStudioStyles();

  const { host, assetBase, onOpenExperience } = options;
  host.setAttribute("data-embed-hero-host", "");
  markEmbedBoundary(host);
  host.replaceChildren();

  const mountNode = document.createElement("div");
  mountNode.setAttribute("data-embed-hero-root", "");
  host.appendChild(mountNode);

  const root: Root = createRoot(mountNode);
  root.render(
    createElement(EmbedHero, {
      assetBase,
      onOpenExperience,
    }),
  );

  return {
    host,
    dispose: () => {
      root.unmount();
      mountNode.remove();
      host.removeAttribute("data-embed-hero-host");
      host.removeAttribute("data-embed-boundary");
      host.replaceChildren();
    },
  };
}
