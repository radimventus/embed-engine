/**
 * Close visual — first Visual API registration.
 * Inline SVG SSOT matching the original platform close glyph (navy circle + white X).
 * No asset loaders.
 */

import type { VisualMetrics } from "../types";

export const CLOSE_VISUAL_METRICS: VisualMetrics = {
  hitAreaPx: 44,
  displayPx: 30,
};

/** Pixel space of the original close glyph artboard. */
export const CLOSE_VISUAL_VIEWBOX = "0 0 820 820" as const;

/** Navy circle fill — sampled from the original close PNG (#173660). */
export const CLOSE_VISUAL_CIRCLE_FILL = "#173660";

/** White cross fill — sampled from the original close PNG. */
export const CLOSE_VISUAL_CROSS_FILL = "#FFFFFF";

export const CLOSE_VISUAL_CIRCLE = {
  cx: 410,
  cy: 410,
  r: 400,
} as const;

/**
 * Cross bars before 45° rotation around the circle center.
 * Length / thickness measured from the original PNG (flat butt ends).
 */
export const CLOSE_VISUAL_CROSS_BARS = [
  { x: 188, y: 360, width: 444, height: 100 },
  { x: 360, y: 188, width: 100, height: 444 },
] as const;

export const CLOSE_VISUAL_CROSS_ROTATION = `rotate(45 ${CLOSE_VISUAL_CIRCLE.cx} ${CLOSE_VISUAL_CIRCLE.cy})`;

/**
 * Creates the close glyph as a DOM element.
 * Delivery must not depend on how this is built.
 */
export function createCloseVisualElement(): Element {
  const { displayPx } = CLOSE_VISUAL_METRICS;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", String(displayPx));
  svg.setAttribute("height", String(displayPx));
  svg.setAttribute("viewBox", CLOSE_VISUAL_VIEWBOX);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.style.display = "block";
  svg.style.pointerEvents = "none";
  svg.style.userSelect = "none";
  svg.style.flexShrink = "0";

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("cx", String(CLOSE_VISUAL_CIRCLE.cx));
  circle.setAttribute("cy", String(CLOSE_VISUAL_CIRCLE.cy));
  circle.setAttribute("r", String(CLOSE_VISUAL_CIRCLE.r));
  circle.setAttribute("fill", CLOSE_VISUAL_CIRCLE_FILL);
  svg.appendChild(circle);

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("transform", CLOSE_VISUAL_CROSS_ROTATION);
  group.setAttribute("fill", CLOSE_VISUAL_CROSS_FILL);
  for (const bar of CLOSE_VISUAL_CROSS_BARS) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(bar.x));
    rect.setAttribute("y", String(bar.y));
    rect.setAttribute("width", String(bar.width));
    rect.setAttribute("height", String(bar.height));
    group.appendChild(rect);
  }
  svg.appendChild(group);

  return svg;
}
