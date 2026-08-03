import { useEffect, useState, type ReactNode } from 'react';

import {
  JOURNEY_CTA_FOOTER_ROW_CLASS,
  JOURNEY_CTA_PRIMARY_CLASS,
  JOURNEY_CTA_SECONDARY_CLASS,
} from './journeyCta';

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
  'calc(100dvh - var(--experience-header-height, 72px) - var(--guided-journey-bottom-nav-offset, 0px))';

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

  const hasFooterLeading = footerLeading !== undefined && footerLeading !== null;

  return (
    <div
      id={sceneId}
      data-journey-scene={sceneId}
      className="flex w-full snap-start snap-normal flex-col gap-[18px] mobile:gap-4"
      style={{
        minHeight: SCENE_MIN_HEIGHT,
        // Last scene (Audit): Zpět sits under the footer, 40px above the bottom (CAP UX3 09).
        paddingBottom: reserveScrollSpace
          ? SCENE_MIN_HEIGHT
          : nextSceneId
            ? '30px'
            : previousSceneId
              ? '40px'
              : '0px',
        opacity: isEntered ? 1 : 0,
        transform: 'translateY(0)',
        transition: animateOnMount
          ? 'opacity 1000ms ease'
          : undefined,
        willChange: animateOnMount ? 'opacity' : undefined,
      }}
    >
      {children}
      {hasFooterLeading ? (
        <div
          className={`relative px-section ${pinFooterToBottom ? 'mt-auto' : ''}`}
          style={
            pinFooterToBottom
              ? undefined
              : {
                  // Scene uses gap-[18px]; add 12px so Tour → footer row = 30px.
                  marginTop: 12,
                }
          }
        >
          {/* Full-width center: banner ignores Pokračovat button width. */}
          <div className="flex w-full justify-center">{footerLeading}</div>
          {nextSceneId ? (
            <button
              type="button"
              onClick={() => navigate(nextSceneId)}
              className={`${JOURNEY_CTA_PRIMARY_CLASS} absolute top-0 right-0 shrink-0 mobile:static mobile:mt-3 mobile:w-full`}
            >
              Pokračovat →
            </button>
          ) : null}
        </div>
      ) : (
        <div
          className={`${JOURNEY_CTA_FOOTER_ROW_CLASS} ${
            pinFooterToBottom ? 'mt-auto' : ''
          }`}
        >
          {previousSceneId ? (
            <button
              type="button"
              onClick={() => navigate(previousSceneId)}
              className={`${JOURNEY_CTA_SECONDARY_CLASS} justify-start mobile:w-full`}
            >
              ← Zpět
            </button>
          ) : (
            <span aria-hidden="true" className="hidden min-h-[32px] desktop:block" />
          )}
          {nextSceneId ? (
            <button
              type="button"
              onClick={() => navigate(nextSceneId)}
              className={`${JOURNEY_CTA_PRIMARY_CLASS} ml-auto shrink-0 mobile:w-full`}
            >
              Pokračovat →
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
