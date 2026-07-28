import { scrollToSection } from './scrollToSection';

type JourneySceneTransitionProps = {
  readonly previousSceneId?: string;
  readonly nextSceneId?: string;
};

const NAV_BUTTON_CLASS =
  'inline-flex min-h-[48px] items-center justify-center rounded-[8px] bg-[#001930] px-5 text-base font-medium text-[#FFFFFF] transition-colors duration-150 hover:bg-embed-brand-gold hover:text-[#001930] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';

/**
 * Navigation lives only in the large semantic gaps between scenes.
 */
export function JourneySceneTransition({
  previousSceneId,
  nextSceneId,
}: JourneySceneTransitionProps) {
  return (
    <div className="flex h-[180px] items-center px-section">
      <div className="grid w-full grid-cols-2 items-center gap-4 mobile:grid-cols-1">
        <div className="justify-self-start mobile:justify-self-stretch">
          {previousSceneId ? (
            <button
              type="button"
              onClick={() => scrollToSection(previousSceneId)}
              className={`${NAV_BUTTON_CLASS} min-w-[168px]`}
            >
              ↑ Zpět
            </button>
          ) : null}
        </div>
        <div className="justify-self-end mobile:justify-self-stretch">
          {nextSceneId ? (
            <button
              type="button"
              onClick={() => scrollToSection(nextSceneId)}
              className={`${NAV_BUTTON_CLASS} min-w-[168px]`}
            >
              Pokračovat ↓
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
