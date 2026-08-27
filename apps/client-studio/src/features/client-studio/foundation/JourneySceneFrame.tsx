import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  JOURNEY_CTA_FOOTER_ROW_CLASS,
  JOURNEY_CTA_PRIMARY_CLASS,
  JOURNEY_CTA_SECONDARY_CLASS,
} from "./journeyCta";

type JourneySceneFrameProps = {
  readonly sceneId: string;
  readonly previousSceneId?: string;
  readonly nextSceneId?: string;
  readonly onNavigate?: (sceneId: string) => void;
  readonly animateOnMount?: boolean;
  readonly reserveScrollSpace?: boolean;
  /** When false, footer sits 30px under content instead of viewport bottom. */
  readonly pinFooterToBottom?: boolean;
  /** Leading footer slot (e.g. Welcome Bridge), top-aligned with nav CTA. */
  readonly footerLeading?: ReactNode;
  readonly children: ReactNode;
};

const SCENE_MIN_HEIGHT =
  "calc(100dvh - var(--experience-header-height, 72px))";
const SCENE_CTA_GAP = "20px";
const UNREVEALED_SCENE_SPACE =
  "calc(20px + 100dvh - var(--experience-header-height, 72px))";

/**
 * Scene shell for one guided stop in the Decision Journey.
 * Keeps the page one-piece while adding snap + next/previous affordances.
 * RCS-05 — unified CTA + mobile scene height cleared of bottom nav.
 */
export function JourneySceneFrame({
  sceneId,
  previousSceneId,
  nextSceneId,
  onNavigate,
  animateOnMount = false,
  reserveScrollSpace = false,
  pinFooterToBottom = true,
  footerLeading,
  children,
}: JourneySceneFrameProps) {
  const [isEntered, setIsEntered] = useState(!animateOnMount);
  const hasFooterLeading =
    footerLeading !== undefined && footerLeading !== null;
  const footerLeadingRef = useRef<HTMLDivElement>(null);
  const [isFooterLeadingVisible, setIsFooterLeadingVisible] = useState(false);

  useEffect(() => {
    const root = footerLeadingRef.current;

    if (!hasFooterLeading || root === null) {
      setIsFooterLeadingVisible(false);
      return;
    }

    const updateVisibility = () => {
      const child = root.firstElementChild as HTMLElement | null;

      if (child === null) {
        setIsFooterLeadingVisible(false);
        return;
      }

      const style = window.getComputedStyle(child);
      const rect = child.getBoundingClientRect();

      setIsFooterLeadingVisible(
        style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number.parseFloat(style.opacity || "1") > 0.05 &&
          rect.width > 1 &&
          rect.height > 1,
      );
    };

    updateVisibility();

    const mutationObserver = new MutationObserver(updateVisibility);
    mutationObserver.observe(root, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    const resizeObserver = new ResizeObserver(updateVisibility);
    resizeObserver.observe(root);

    const timer = window.setInterval(updateVisibility, 120);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.clearInterval(timer);
    };
  }, [hasFooterLeading]);

  useEffect(() => {
    if (!animateOnMount) {
      setIsEntered(true);
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      setIsEntered(true);
    });
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [animateOnMount]);

  const navigate = (targetSceneId: string) => {
    onNavigate?.(targetSceneId);
  };

  return (
    <div
      id={sceneId}
      data-journey-scene={sceneId}
      className="flex w-full snap-start snap-normal flex-col gap-5"
      style={{
        minHeight: SCENE_MIN_HEIGHT,
        // Before the next scene is revealed, retain only the space needed to
        // expose the CTA above mobile navigation.
        paddingBottom: reserveScrollSpace
          ? UNREVEALED_SCENE_SPACE
          : nextSceneId
            ? SCENE_CTA_GAP
            : previousSceneId
              ? "40px"
              : "0px",
        opacity: isEntered ? 1 : 0,
        transform: "translateY(0)",
        transition: animateOnMount ? "opacity 1000ms ease" : undefined,
        willChange: animateOnMount ? "opacity" : undefined,
      }}
    >
      {children}
      {hasFooterLeading ? (
        <div
          className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 px-section ${
            pinFooterToBottom ? "mt-auto" : ""
          }`}
        >
          <div ref={footerLeadingRef} data-mobile-journey-bridge="" className="min-w-0">{footerLeading}</div>
          {nextSceneId ? (
            <button
              type="button"
              onClick={() => navigate(nextSceneId)}
              className={`${JOURNEY_CTA_PRIMARY_CLASS} shrink-0 justify-self-end ${
                isFooterLeadingVisible ? "mobile:hidden" : ""
              }`}
            >
              Pokračovat →
            </button>
          ) : null}
        </div>
      ) : (
        <div
          className={`${JOURNEY_CTA_FOOTER_ROW_CLASS} mobile:flex-row mobile:flex-nowrap mobile:items-center mobile:[&>*]:min-w-0 mobile:items-center mobile:justify-between mobile:gap-3 ${
            pinFooterToBottom ? "mt-auto" : ""
          }`}
        >
          {previousSceneId ? (
            <button
              type="button"
              onClick={() => navigate(previousSceneId)}
              className={`${JOURNEY_CTA_SECONDARY_CLASS} justify-start mobile:w-auto mobile:shrink-0 mobile:whitespace-nowrap`}
            >
              ← Zpět
            </button>
          ) : (
            <span
              aria-hidden="true"
              className="hidden min-h-[32px] desktop:block"
            />
          )}
          {nextSceneId ? (
            <button
              type="button"
              onClick={() => navigate(nextSceneId)}
              className={`${JOURNEY_CTA_PRIMARY_CLASS} ml-auto shrink-0 mobile:w-auto`}
            >
              Pokračovat →
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
