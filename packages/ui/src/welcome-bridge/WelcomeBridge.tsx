import { useEffect, useState, type CSSProperties } from "react";

import { cn } from "../lib/cn";
import type { WelcomeBridgeProps } from "./types";
import { resolveWelcomeBridgeTheme } from "./welcomeBridgeTheme";

/** In-flow host — parent supplies Tour→banner gap; keep host flush. */
const HOST_STYLE: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
  boxSizing: "border-box",
  pointerEvents: "auto",
};

/**
 * Platform Welcome Bridge — Decision Transition Pattern.
 * Renders config-driven guide panel (no hardcoded Experience copy).
 * In-document CTA block — does not overlay or block the page.
 */
export function WelcomeBridge({
  config,
  avatar,
  open,
  onContinue,
  onDismiss,
  className,
  style,
}: WelcomeBridgeProps) {
  const theme = resolveWelcomeBridgeTheme(config.theme);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      setEntered(true);
    });
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onDismiss]);

  if (!open) {
    return null;
  }

  const { content } = config;
  const closeLabel = content.closeLabel ?? "Zavřít";

  return (
    <div
      role="region"
      aria-labelledby="welcome-bridge-title"
      aria-describedby="welcome-bridge-headline welcome-bridge-description"
      data-testid="welcome-bridge"
      data-welcome-bridge-variant={config.variant}
      style={HOST_STYLE}
    >
      <div
        className={cn("welcome-bridge-panel", className)}
        style={{
          width: `min(${theme.widthPx}px, 100%)`,
          minHeight: theme.minHeightPx,
          borderRadius: theme.borderRadiusPx,
          backgroundColor: theme.backgroundColor,
          boxShadow: theme.shadow,
          color: theme.headlineColor,
          display: "flex",
          gap: 16,
          padding: "18px 18px 16px",
          position: "relative",
          boxSizing: "border-box",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 320ms ease, transform 320ms ease",
          ...style,
        }}
      >
        <button
          type="button"
          aria-label={closeLabel}
          data-testid="welcome-bridge-close"
          onClick={onDismiss}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 28,
            height: 28,
            border: 0,
            borderRadius: 999,
            background: "transparent",
            color: theme.closeColor,
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div
          style={{ flexShrink: 0, paddingTop: 2 }}
          data-testid="welcome-bridge-avatar"
        >
          {avatar}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 0,
            paddingRight: 18,
            flex: 1,
          }}
        >
          <p
            id="welcome-bridge-title"
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: theme.titleColor,
            }}
          >
            {content.title}
          </p>
          <p
            id="welcome-bridge-headline"
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.45,
              color: theme.headlineColor,
            }}
          >
            {content.headline}
          </p>
          <p
            id="welcome-bridge-description"
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.45,
              color: theme.descriptionColor,
            }}
          >
            {content.description}
          </p>
          <div
            style={{
              paddingTop: 4,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <button
              type="button"
              data-testid="welcome-bridge-cta"
              onClick={onContinue}
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 36,
                border: 0,
                borderRadius: 8,
                padding: "0 14px",
                backgroundColor: theme.ctaBackgroundColor,
                color: theme.ctaTextColor,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {content.ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
