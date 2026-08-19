import { colors } from "@embed-engine/design-tokens";
import {
  createSocialProofTickerSchedule,
  nextSocialProofTickerIndex,
  resolveSocialProofFeed,
  SOCIAL_PROOF_TICK_MS,
} from "@embed-engine/core";
import { PrimaryLink } from "@embed-engine/ui";
import { useEffect, useMemo, useState } from "react";

const SECTION_SURFACE_CLASS =
  "overflow-hidden rounded-[11px] border border-embed-border-default bg-[#FFFFFF] shadow-[0_1px_11px_rgba(0,25,48,0.044)]";

const HERO_FEATURES = [
  { value: "124 m2", label: "Užitná plocha" },
  { value: "A ++", label: "Energetická třída" },
  { value: "Dřevostavba", label: "Difuzně otevřená" },
] as const;

const HERO_CONTENT_BOTTOM_VEIL_STYLE = {
  backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${colors.border.default} 30%, #FFFFFF), #FFFFFF)`,
} as const;

const SOCIAL_PROOF_COLUMN_DIVIDER_STYLE = {
  backgroundColor: colors.action.accent,
} as const;

const REFERENCE_HERO_SRC = "/media/house-modern-01/exterior.webp";

/** Compact layout threshold — matches reference mobile breakpoint. */
const COMPACT_MAX_WIDTH_PX = 767;

export type EmbedHeroProps = {
  readonly assetBase?: string;
  /** Called when the primary CTA is activated (opens Experience). */
  readonly onOpenExperience: () => void;
};

function resolveAssetUrl(path: string, assetBase?: string): string {
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (assetBase === undefined || assetBase.trim().length === 0) {
    return normalized;
  }
  return `${assetBase.replace(/\/$/, "")}${normalized}`;
}

function SocialProofIcon({ name }: { readonly name: "viewing" | "saved" | "inquiry" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#D4AF37",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-8 w-8",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "viewing":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="16" cy="9" r="2" />
          <path d="M3.5 18.5c.4-2.8 2.6-4.5 5.5-4.5s5.1 1.7 5.5 4.5" />
          <path d="M14 14.2c1.1-.7 2.5-1.1 4-1.1 2.3 0 4.1 1.2 4.5 3.4" />
        </svg>
      );
    case "saved":
      return (
        <svg {...common}>
          <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v14l-6.5-3.5L5.5 20V6A1.5 1.5 0 0 1 7 4.5z" />
        </svg>
      );
    case "inquiry":
      return (
        <svg {...common}>
          <rect x="3.5" y="8" width="12" height="10" rx="1" />
          <path d="M3.5 11.5h12M7.5 8v10" />
          <circle cx="17.5" cy="7" r="3.5" />
          <path d="M16.3 6.2c.2-.6.8-1 1.4-1 .8 0 1.4.5 1.4 1.2 0 .7-.4 1-1 1.3-.5.2-.8.5-.8 1.1M17.5 10.2h.01" />
        </svg>
      );
    default:
      return null;
  }
}

function SocialProofItem({
  icon,
  value,
  label,
}: {
  readonly icon: "viewing" | "saved" | "inquiry";
  readonly value: string;
  readonly label: string;
}) {
  return (
    <div className="flex h-social-proof items-center justify-center px-section">
      <div className="flex max-w-full items-center gap-3">
        <SocialProofIcon name={icon} />
        <p className="text-left text-sm leading-snug text-[#001930]">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          <span className="ml-2 text-[#001930]/70">{label}</span>
        </p>
      </div>
    </div>
  );
}

function EmbedHeroContent({
  compact,
  onOpenExperience,
}: {
  readonly compact: boolean;
  readonly onOpenExperience: () => void;
}) {
  return (
    <section
      aria-label="Hero Content"
      className={[
        "relative flex h-full min-h-0 w-full flex-col justify-center bg-white px-section py-section",
        compact ? "py-8" : "",
      ].join(" ")}
    >
      <div className={compact ? "" : "translate-x-[10px]"}>
        <p className="text-sm font-bold uppercase tracking-wide text-[#D4AF37]">
          MODERN A01 – 4+kk
        </p>

        <h1
          className={[
            "mt-3 font-sans font-black leading-[1.15] tracking-tight text-embed-foreground-primary",
            compact ? "text-[2rem]" : "text-[2.52rem]",
          ].join(" ")}
        >
          Rodinný dům, kde to dýchá štěstím
        </h1>

        <dl
          className={[
            "mt-8 grid divide-x divide-embed-border-default",
            compact
              ? "grid-cols-1 gap-3 divide-x-0"
              : "grid-cols-3",
          ].join(" ")}
        >
          {HERO_FEATURES.map((feature) => (
            <div
              key={feature.label}
              className={[
                "flex flex-col",
                compact ? "px-0" : "px-3 first:pl-0 last:pr-0",
              ].join(" ")}
            >
              <dd className="order-1 text-base font-bold leading-tight text-[#D4AF37]">
                {feature.value}
              </dd>
              <dt className="order-2 mt-1 text-xs leading-snug text-embed-foreground-primary">
                {feature.label}
              </dt>
            </div>
          ))}
        </dl>

        <div
          className={[
            "mt-10 flex",
            compact
              ? "justify-start"
              : "-translate-x-[10px] translate-y-[50px] justify-center",
          ].join(" ")}
        >
          <PrimaryLink
            href="#embed-experience"
            data-embed-hero-cta=""
            onClick={(event) => {
              event.preventDefault();
              onOpenExperience();
            }}
          >
            Podívat se dovnitř – video →
          </PrimaryLink>
        </div>
      </div>

      {!compact ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[33px]"
          style={HERO_CONTENT_BOTTOM_VEIL_STYLE}
        />
      ) : null}
    </section>
  );
}

function EmbedHeroImage({
  assetBase,
  compact,
}: {
  readonly assetBase?: string;
  readonly compact: boolean;
}) {
  const heroSrc = resolveAssetUrl(REFERENCE_HERO_SRC, assetBase);

  return (
    <section
      role="img"
      aria-label="Rodinný dům MODERN A01"
      className="relative h-full min-h-0 w-full bg-cover bg-[center_42%] bg-no-repeat"
      style={{ backgroundImage: `url('${heroSrc}')` }}
    >
      {!compact ? (
        <div
          aria-hidden="true"
          className="animate-hero-photo-veil pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4"
        >
          <div className="absolute inset-y-0 left-0 w-1/2 bg-white/65" />
          <div className="absolute inset-y-0 left-1/2 w-1/2 bg-white/45" />
        </div>
      ) : null}
    </section>
  );
}

function EmbedSocialProof({ compact }: { readonly compact: boolean }) {
  const [startIndex, setStartIndex] = useState(0);
  const entries = useMemo(
    () =>
      createSocialProofTickerSchedule(resolveSocialProofFeed({
        houseId: "bungalov-4kk",
        isReferenceHouse: true,
      })),
    [],
  );
  if (entries.length === 0) return null;
  const visibleEntries = Array.from(
    { length: compact ? 1 : 3 },
    (_, offset) =>
      entries[
        (startIndex + offset) % entries.length
      ]!,
  );

  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setStartIndex(
          (current) =>
            nextSocialProofTickerIndex(current, entries),
        ),
      SOCIAL_PROOF_TICK_MS,
    );
    return () => window.clearInterval(timer);
  }, [entries.length]);

  return (
    <section
      aria-label="Social Proof"
      className={[
        "relative grid bg-[#FFFFFF] text-[#001930]",
        compact ? "grid-cols-1" : "grid-cols-3",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-white"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[2px] z-10 h-px"
        style={{ backgroundColor: colors.action.accent }}
      />
      {!compact ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/3 top-[25%] z-10 h-1/2 w-px -translate-x-1/2"
            style={SOCIAL_PROOF_COLUMN_DIVIDER_STYLE}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-2/3 top-[25%] z-10 h-1/2 w-px -translate-x-1/2"
            style={SOCIAL_PROOF_COLUMN_DIVIDER_STYLE}
          />
        </>
      ) : null}
      {visibleEntries.map((entry) => (
        <SocialProofItem key={entry.id} label={entry.text} {...entry} />
      ))}
    </section>
  );
}

function useCompactLayout(host: HTMLElement | null): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (host === null) {
      return;
    }

    const update = (): void => {
      setCompact(host.getBoundingClientRect().width <= COMPACT_MAX_WIDTH_PX);
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, [host]);

  return compact;
}

/**
 * Partner-page projection of Hero Reference Implementation v1.0 (PT-EMBED-01).
 * Projects Client Studio Hero identity — do not redesign (PT-HERO-FREEZE-01).
 * SSOT: docs/architecture/HERO-V1-FREEZE.md
 * CTA opens Experience — does not scroll inside Studio.
 */
export function EmbedHero({ assetBase, onOpenExperience }: EmbedHeroProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const compact = useCompactLayout(host);

  return (
    <div
      ref={setHost}
      data-embed-hero=""
      className="w-full font-sans text-embed-foreground-primary antialiased"
    >
      <section
        aria-label="Embed Hero"
        className={SECTION_SURFACE_CLASS}
      >
        <div
          className={[
            "relative w-full overflow-hidden",
            compact ? "h-auto min-h-0" : "h-hero-image",
          ].join(" ")}
        >
          <div
            className={[
              "grid h-full min-h-0",
              compact
                ? "grid-cols-1 grid-rows-[auto_minmax(16rem,1fr)]"
                : "grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
            ].join(" ")}
          >
            <EmbedHeroContent
              compact={compact}
              onOpenExperience={onOpenExperience}
            />
            <EmbedHeroImage assetBase={assetBase} compact={compact} />
          </div>
        </div>
        <EmbedSocialProof compact={compact} />
      </section>
    </div>
  );
}
