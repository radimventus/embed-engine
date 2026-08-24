const DEFAULT_ASSET_BASE = "https://conis.cz";
const DEFAULT_TARGET_ID = "embed-hero";
const DEFAULT_CACHE_BUST = "embed-02";

function cleanRequired(value, label) {
  const result = String(value ?? "").trim();
  if (result.length === 0) {
    throw new Error(`Partner Embed snippet: ${label} is required`);
  }
  return result;
}

function cleanBase(value) {
  return cleanRequired(value, "assetBase").replace(/\/$/, "");
}

function jsString(value) {
  return JSON.stringify(String(value)).replace(/</g, "\\u003c");
}

/**
 * Canonical House-scoped CONIS partner Embed snippet.
 *
 * Owns launch mechanics only:
 * - canonical Embed artifact
 * - House identity
 * - mount configuration
 * - optional public AI Delivery binding
 *
 * It intentionally owns no Experience, Social Proof or Chat corpus.
 */
export function buildOfficialPartnerSnippet(input) {
  const houseId = cleanRequired(input?.houseId, "houseId");
  const assetBase = cleanBase(input?.assetBase ?? DEFAULT_ASSET_BASE);
  const targetId = cleanRequired(input?.targetId ?? DEFAULT_TARGET_ID, "targetId");
  const cacheBust = cleanRequired(
    input?.cacheBust ?? DEFAULT_CACHE_BUST,
    "cacheBust",
  );
  const deliveryUrl = String(input?.aiDeliveryUrl ?? "")
    .trim()
    .replace(/\/$/, "");

  const deliveryBootstrap =
    deliveryUrl.length === 0
      ? ""
      : `<script>
  window.__EMBED_AI_DELIVERY__ = { deliveryUrl: ${jsString(deliveryUrl)} };
</script>
`;

  return `<!-- BEGIN OFFICIAL PARTNER SNIPPET -->
<div id="${targetId}"></div>
${deliveryBootstrap}<script src="${assetBase}/embed/embed.iife.js?v=${encodeURIComponent(cacheBust)}"></script>
<script>
  Embed.mount({
    mode: "launcher",
    target: ${jsString(`#${targetId}`)},
    objectId: ${jsString(houseId)},
    assetBase: ${jsString(assetBase)},
    entryPoint: "hero-cta",
    launcherId: ${jsString(targetId)}
  });
</script>
<!-- END OFFICIAL PARTNER SNIPPET -->`;
}
