/**
 * Client Studio styles for Embed Delivery (fonts, shell, CSS isolation).
 * Main Tailwind CSS is registered by the Vite bundle via registerClientStudioCss.
 */

import {
  CSS_ISOLATION_POLICY,
  EMBED_BOUNDARY_ATTR,
} from "./cssIsolation";
import { appendNodes, resolveHostHead } from "./hostDocument";

export { EMBED_BOUNDARY_ATTR } from "./cssIsolation";

let registeredCss: string | null = null;
let injected = false;

const FONT_LINK_ID = "embed-client-studio-fonts";
const STYLE_ID = "embed-client-studio-css";
const SHELL_STYLE_ID = "embed-client-studio-shell-css";
const ISOLATION_STYLE_ID = "embed-css-isolation";

/** Inter — same weights as standalone Client Studio index.html. */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;900&display=swap";

/**
 * Maps standalone `html/body/#root` assumptions onto the embed mount node
 * and wires overlay geometry. Visual reclaim of host `a`/`button` lives in
 * `CSS_ISOLATION_POLICY` (PT-EMBED-02A).
 *
 * Scroll: do NOT set `overflow-x: auto` alone on the mount root.
 * CSS forces `overflow-y` to `auto` as well, creating a wheel scrollport.
 * Combined with `overscroll-behavior: none`, wheel/touchpad cannot chain to
 * the document — scrollbar drag and keyboard still work (different path).
 * Use `overflow-y: clip` so horizontal overflow can scroll without trapping
 * vertical wheel; keep document/viewport as the single vertical scrollport.
 *
 * `html`/`body` overscroll rules are host scroll coordination only — not
 * Experience visual identity (see CSS Isolation Policy).
 */
const SHELL_CSS = `
html {
  overscroll-behavior: auto;
}
body {
  overscroll-behavior: auto;
}
[data-client-studio-root] {
  display: block;
  min-height: 100vh;
  width: 100%;
  overflow-x: auto;
  overflow-y: clip;
  overscroll-behavior: auto;
  color: rgb(0 25 48);
  background-color: #f7f6f4;
  font-family: Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  isolation: isolate;
  box-sizing: border-box;
  line-height: 1.5;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}
[data-embed-overlay] {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: #f7f6f4;
  color: rgb(0 25 48);
  isolation: isolate;
}
/* Close lives on Client Studio Experience header ([data-embed-close]). */
[data-embed-overlay-mount] {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
[data-experience-header] {
  position: sticky;
  top: 0;
  z-index: 40;
}
[data-embed-overlay-mount][data-client-studio-root],
[data-embed-overlay] [data-client-studio-root] {
  min-height: 100%;
  height: auto;
  overflow-x: auto;
  overflow-y: visible;
}
`;

export function registerClientStudioCss(css: string): void {
  registeredCss = css;
}

function ensureFonts(): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(FONT_LINK_ID)) {
    return;
  }

  const preconnectGoogle = document.createElement("link");
  preconnectGoogle.rel = "preconnect";
  preconnectGoogle.href = "https://fonts.googleapis.com";

  const preconnectGstatic = document.createElement("link");
  preconnectGstatic.rel = "preconnect";
  preconnectGstatic.href = "https://fonts.gstatic.com";
  preconnectGstatic.crossOrigin = "anonymous";

  const fontLink = document.createElement("link");
  fontLink.id = FONT_LINK_ID;
  fontLink.rel = "stylesheet";
  fontLink.href = FONT_HREF;

  appendNodes(
    resolveHostHead(),
    preconnectGoogle,
    preconnectGstatic,
    fontLink,
  );
}

function upsertStyle(id: string, css: string): void {
  const head = resolveHostHead();
  let style = document.getElementById(id) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    head.appendChild(style);
  }
  style.textContent = css;
  // Keep Embed styles after host styles so utilities / isolation win collisions.
  head.appendChild(style);
}

/**
 * Mark a surface root as an Embed Experience boundary (CSS Isolation Policy).
 */
export function markEmbedBoundary(element: HTMLElement): void {
  element.setAttribute(EMBED_BOUNDARY_ATTR, "");
}

/**
 * Inject fonts + full Client Studio CSS + shell + CSS isolation policy.
 * Idempotent; safe to call on every production mount.
 * Isolation stylesheet is always re-appended last so it beats late host CSS.
 */
export function ensureClientStudioStyles(): void {
  if (typeof document === "undefined") {
    return;
  }

  ensureFonts();

  if (registeredCss !== null) {
    upsertStyle(STYLE_ID, registeredCss);
  }

  upsertStyle(SHELL_STYLE_ID, SHELL_CSS);
  // Isolation last: reclaim host a/button after utilities are present.
  upsertStyle(ISOLATION_STYLE_ID, CSS_ISOLATION_POLICY);
  injected = true;
}

export function getClientStudioStylesInjected(): boolean {
  return injected;
}
