import type { CSSProperties, ReactNode } from "react";

/**
 * Decision Transition Pattern — Welcome Bridge configuration.
 * Presentation-only. Experience supplies content; component stays copy-free.
 */

export type WelcomeBridgeTrigger =
  | {
      readonly kind: "on-continue-to-priority";
    }
  | {
      readonly kind: "delay-after-mount";
      readonly delayMs: number;
    }
  | {
      readonly kind: "manual";
    };

export type WelcomeBridgeContent = {
  readonly title: string;
  readonly headline: string;
  readonly description: string;
  readonly metrics?: readonly {
    readonly label: string;
    readonly value: string;
  }[];
  readonly ctaLabel: string;
  readonly closeLabel?: string;
};

export type WelcomeBridgeTheme = {
  readonly backgroundColor: string;
  readonly titleColor: string;
  readonly headlineColor: string;
  readonly descriptionColor: string;
  readonly ctaBackgroundColor: string;
  readonly ctaTextColor: string;
  readonly closeColor: string;
  readonly widthPx: number;
  readonly minHeightPx: number;
  readonly borderRadiusPx: number;
  readonly shadow: string;
};

export type WelcomeBridgeConfig = {
  /** Experience / product variant id. */
  readonly variant: string;
  readonly content: WelcomeBridgeContent;
  /** First matching trigger wins; bridge shows at most once per Experience mount. */
  readonly triggers: readonly WelcomeBridgeTrigger[];
  readonly theme?: Partial<WelcomeBridgeTheme>;
};

export type WelcomeBridgeProps = {
  readonly config: WelcomeBridgeConfig;
  readonly avatar: ReactNode;
  readonly open: boolean;
  readonly onContinue: () => void;
  readonly onDismiss: () => void;
  readonly className?: string;
  readonly style?: CSSProperties;
};
