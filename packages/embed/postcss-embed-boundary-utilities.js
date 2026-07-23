/**
 * PT-EMBED-02A — raise specificity of Embed utility class rules under
 * `[data-embed-boundary]` so they beat host `.theme a { … !important }`
 * when utilities already emit `!important` (Tailwind `important: true`).
 *
 * Does not wrap element/preflight selectors (`a`, `body`, `*`) — those stay
 * global as produced by Tailwind base; Delivery isolation CSS reclaim handles
 * interactive elements inside the boundary.
 */

const BOUNDARY = "[data-embed-boundary]";

/** @type {import('postcss').PluginCreator} */
function embedBoundaryUtilities() {
  return {
    postcssPlugin: "embed-boundary-utilities",
    Once(root) {
      root.walkRules((rule) => {
        if (rule.parent?.type === "atrule" && rule.parent.name === "keyframes") {
          return;
        }
        const selectors = rule.selector.split(",").map((s) => s.trim());
        const next = selectors.map((selector) => {
          if (selector.includes(BOUNDARY)) {
            return selector;
          }
          // Only class-based utilities / components (`.foo`, `.sm\:foo`, etc.)
          if (!/(?:^|[\s>+~])\./.test(selector) && !selector.startsWith(".")) {
            return selector;
          }
          return `${BOUNDARY} ${selector}`;
        });
        rule.selector = next.join(", ");
      });
    },
  };
}
embedBoundaryUtilities.postcss = true;

export default embedBoundaryUtilities;
