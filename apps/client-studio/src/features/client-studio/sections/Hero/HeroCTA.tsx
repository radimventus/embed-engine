import { PrimaryLink } from "@embed-engine/ui";
import type { MouseEvent } from "react";

import { useOptionalDecisionAnalytics } from "../../analytics";
import { PILOT_SECTION_IDS } from "../../pilot/pilotVocabulary";

const CTA_SCROLL_DURATION_MS = 520;
const WORKSPACE_LANDING_ADJUSTMENT_PX = 20;

/**
 * Primary Hero CTA — Morning Baseline reference (PT-HERO-00).
 * Lands on Social Proof so Header + full Social Proof + Tour start stay visible.
 *
 * Must NOT use scrollIntoView: guided-journey `scroll-padding-top` (~header+20)
 * leaves a strip of Hero photo under the sticky header. Drive overlay `scrollTop`
 * directly so Social Proof sits flush under the header.
 */
export function HeroCTA() {
  const analytics = useOptionalDecisionAnalytics();

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById(PILOT_SECTION_IDS.socialProof);
    if (target === null) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const header = document.querySelector<HTMLElement>(
      "[data-experience-header]",
    );
    const headerOffset = Math.ceil(
      header?.getBoundingClientRect().height ?? 72,
    );
    const overlayMount = document.querySelector<HTMLElement>(
      "[data-embed-overlay-mount]",
    );
    const scroller: HTMLElement | Window = overlayMount ?? window;

    const readScrollTop = (): number =>
      scroller instanceof Window ? scroller.scrollY : scroller.scrollTop;

    const writeScrollTop = (top: number): void => {
      if (scroller instanceof Window) {
        scroller.scrollTo({ top, left: 0, behavior: "auto" });
        return;
      }
      scroller.scrollTop = top;
    };

    const targetScrollTop = (): number => {
      const elementRect = target.getBoundingClientRect();
      const workspaceAdjustment = document.querySelector(
        '[data-testid="workspace-host"]',
      ) === null
        ? 0
        : WORKSPACE_LANDING_ADJUSTMENT_PX;
      if (scroller instanceof Window) {
        return Math.max(
          0,
          window.scrollY + elementRect.top - headerOffset + workspaceAdjustment,
        );
      }
      const containerRect = scroller.getBoundingClientRect();
      return Math.max(
        0,
        scroller.scrollTop +
          (elementRect.top - containerRect.top) -
          headerOffset +
          workspaceAdjustment,
      );
    };

    // Disable snap + scroll-padding so scene snap / padding cannot leave Hero in view.
    const snapRoots = [
      document.documentElement,
      document.body,
      overlayMount,
    ].filter((node): node is HTMLElement => node !== null);
    const previousSnap = snapRoots.map(
      (root) => root.dataset.guidedJourneySnap,
    );
    const previousPadding = snapRoots.map(
      (root) => root.style.scrollPaddingTop,
    );
    const previousBehavior = snapRoots.map((root) => root.style.scrollBehavior);

    for (const root of snapRoots) {
      root.dataset.guidedJourneySnap = "off";
      root.style.scrollPaddingTop = "0px";
      root.style.scrollBehavior = "auto";
    }

    const from = readScrollTop();
    const to = targetScrollTop();
    const durationMs = reducedMotion ? 0 : CTA_SCROLL_DURATION_MS;

    const restoreScrollChrome = (): void => {
      previousSnap.forEach((value, index) => {
        const root = snapRoots[index];
        if (!root) {
          return;
        }
        if (value === undefined) {
          delete root.dataset.guidedJourneySnap;
        } else {
          root.dataset.guidedJourneySnap = value;
        }
        root.style.scrollPaddingTop = previousPadding[index] ?? "";
        root.style.scrollBehavior = previousBehavior[index] ?? "";
      });
    };

    const finish = (): void => {
      writeScrollTop(targetScrollTop());
      restoreScrollChrome();
      // One more align after snap/padding restore — proximity snap must not
      // leave a Hero strip under the header.
      window.requestAnimationFrame(() => {
        writeScrollTop(targetScrollTop());
      });
    };

    if (durationMs <= 0 || Math.abs(to - from) < 1) {
      finish();
    } else {
      const startedAt = performance.now();
      const tick = (now: number): void => {
        const progress = Math.min(1, (now - startedAt) / durationMs);
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - (-2 * progress + 2) ** 2 / 2;
        writeScrollTop(from + (to - from) * eased);
        if (progress < 1) {
          window.requestAnimationFrame(tick);
          return;
        }
        finish();
      };
      window.requestAnimationFrame(tick);
    }

    analytics?.experienceEvent({
      experienceEventType: "hero.video.opened",
      surfaceId: "hero",
    });
    target.focus({ preventScroll: true });
    window.history.pushState(null, "", `#${PILOT_SECTION_IDS.socialProof}`);
  };

  return (
    <PrimaryLink
      href={`#${PILOT_SECTION_IDS.socialProof}`}
      data-embed-hero-cta=""
      onClick={handleNavigate}
    >
      Podívat se dovnitř – video →
    </PrimaryLink>
  );
}
