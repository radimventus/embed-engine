/**
 * Client Studio styles for Embed Delivery (fonts, shell, host isolation).
 * Main Tailwind CSS is registered by the Vite bundle via registerClientStudioCss.
 */

import { appendNodes, resolveHostHead } from "./hostDocument";

let registeredCss: string | null = null;
let injected = false;

const FONT_LINK_ID = "embed-client-studio-fonts";
const STYLE_ID = "embed-client-studio-css";
const SHELL_STYLE_ID = "embed-client-studio-shell-css";

/** Inter — same weights as standalone Client Studio index.html. */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;900&display=swap";

/**
 * Maps standalone `html/body/#root` assumptions onto the embed mount node
 * and reduces accidental host-page inheritance inside the Experience.
 *
 * Scroll: do NOT set `overflow-x: auto` alone on the mount root.
 * CSS forces `overflow-y` to `auto` as well, creating a wheel scrollport.
 * Combined with `overscroll-behavior: none`, wheel/touchpad cannot chain to
 * the document — scrollbar drag and keyboard still work (different path).
 * Use `overflow-y: clip` so horizontal overflow can scroll without trapping
 * vertical wheel; keep document/viewport as the single vertical scrollport.
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
[data-embed-overlay-chrome] {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e3e3e3;
  background: #f7f6f4;
}
[data-embed-close] {
  appearance: none;
  border: 1px solid #c9c4bc;
  background: #fff;
  color: #001930;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
}
[data-embed-close]:hover {
  border-color: #001930;
}
[data-embed-overlay-mount] {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
[data-embed-overlay-mount][data-client-studio-root],
[data-embed-overlay] [data-client-studio-root] {
  min-height: 100%;
  height: auto;
  overflow-x: auto;
  overflow-y: visible;
}
[data-client-studio-root],
[data-client-studio-root] *,
[data-client-studio-root] *::before,
[data-client-studio-root] *::after {
  box-sizing: border-box;
  border-color: #e3e3e3;
}
[data-client-studio-root] img,
[data-client-studio-root] svg,
[data-client-studio-root] video,
[data-client-studio-root] canvas {
  display: block;
  vertical-align: middle;
}
[data-client-studio-root] button,
[data-client-studio-root] input,
[data-client-studio-root] textarea,
[data-client-studio-root] select {
  font: inherit;
  color: inherit;
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
  // Keep Embed styles after host styles so utilities win collisions.
  head.appendChild(style);
}

/**
 * Inject fonts + full Client Studio CSS + embed shell bridge.
 * Idempotent; safe to call on every production mount.
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
  injected = true;
}

export function getClientStudioStylesInjected(): boolean {
  return injected;
}
