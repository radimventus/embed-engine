import { useMemo, useState } from "react";
import { buildOfficialPartnerSnippet } from "@embed-engine/embed/partner-snippet";

type HouseEmbedSnippetPanelProps = {
  readonly houseId: string | null;
};

const PRODUCTION_ASSET_BASE = "https://conis.cz";
const PARTNER_CACHE_BUST = "embed-02";

function resolveDeliveryUrl(): string {
  return String(import.meta.env.VITE_AI_DELIVERY_URL ?? "").trim();
}

/**
 * TASK-64 — Builder projection of the canonical House-scoped partner snippet.
 * The snippet owns launch mechanics only; all Experience content resolves at runtime.
 */
export function HouseEmbedSnippetPanel({
  houseId,
}: HouseEmbedSnippetPanelProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const snippet = useMemo(
    () =>
      houseId === null
        ? ""
        : buildOfficialPartnerSnippet({
            houseId,
            assetBase: PRODUCTION_ASSET_BASE,
            cacheBust: PARTNER_CACHE_BUST,
            aiDeliveryUrl: resolveDeliveryUrl(),
          }),
    [houseId],
  );

  if (houseId === null) {
    return null;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <section
      className="mt-5 rounded-[12px] border border-[#E3E3E3] bg-builder-canvas px-3 py-3"
      data-testid="house-embed-snippet"
      data-house-id={houseId}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Embed
      </p>
      <p className="mt-1 text-sm font-semibold text-builder-ink">
        Kód pro tento dům
      </p>
      <p className="mt-1 text-[11px] text-builder-muted">
        Kód načte kanonický Embed a automaticky použije právě vybraný dům.
      </p>

      <textarea
        readOnly
        aria-label="Embed kód"
        value={snippet}
        className="mt-3 h-32 w-full resize-none rounded-[10px] border border-[#DDE5EF] bg-white p-2 font-mono text-[10px] leading-relaxed text-builder-ink"
      />

      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        className="mt-2 w-full rounded-[10px] border border-builder-blue bg-white px-3 py-2 text-sm font-semibold text-builder-blue hover:bg-builder-blue hover:text-white"
      >
        {copyState === "copied"
          ? "Zkopírováno"
          : copyState === "failed"
            ? "Kopírování se nezdařilo"
            : "Kopírovat kód"}
      </button>
    </section>
  );
}
