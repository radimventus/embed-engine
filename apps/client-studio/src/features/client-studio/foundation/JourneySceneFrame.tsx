import { useEffect, useState, type ReactNode } from 'react';

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

const PRIMARY_NAV_BUTTON_CLASS =
  'inline-flex min-h-[38px] items-center justify-center rounded-[8px] bg-[#001930] px-[19px] text-[13px] font-medium text-[#FFFFFF] transition-colors duration-150 hover:bg-embed-brand-gold hover:text-[#001930] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';
const SECONDARY_NAV_BUTTON_CLASS = PRIMARY_NAV_BUTTON_CLASS;

const SCENE_MIN_HEIGHT_PX = 'calc(100vh - 72px)';

/**
 * Scene shell for one guided stop in the Decision Journey.
 * Keeps the page one-piece while adding snap + next/previous affordances.
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
      className="flex w-full snap-start snap-normal flex-col gap-[18px]"
      style={{
        minHeight: SCENE_MIN_HEIGHT_PX,
        // Last scene (Audit): Zpět sits under the footer, 40px above the bottom (CAP UX3 09).
        paddingBottom: reserveScrollSpace
          ? 'calc(100vh - 72px)'
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
      <div
        className={`flex items-start justify-between gap-3 px-section mobile:flex-col ${
          pinFooterToBottom ? 'mt-auto' : ''
        }`}
        style={
          pinFooterToBottom
            ? undefined
            : {
                // Scene uses gap-[18px]; add 12px so Tour → footer row = 30px.
                marginTop: 12,
              }
        }
      >
        {hasFooterLeading ? (
          <div className="flex min-w-0 flex-1 justify-center mobile:w-full">
            {footerLeading}
          </div>
        ) : previousSceneId ? (
          <button
            type="button"
            onClick={() => navigate(previousSceneId)}
            className={`${SECONDARY_NAV_BUTTON_CLASS} justify-start mobile:w-full`}
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
            className={`${PRIMARY_NAV_BUTTON_CLASS} ml-auto shrink-0 mobile:w-full`}
          >
            Pokračovat →
          </button>
        ) : null}
      </div>
    </div>
  );
}
