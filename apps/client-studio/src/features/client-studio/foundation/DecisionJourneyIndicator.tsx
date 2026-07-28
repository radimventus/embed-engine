import { scrollToSection } from './scrollToSection';
import type { DecisionJourneyScene } from './decisionJourney';

type DecisionJourneyIndicatorProps = {
  readonly scenes: readonly DecisionJourneyScene[];
  readonly activeSceneId: string | null;
};

/**
 * Subtle desktop-only progress indicator for the guided onepage journey.
 */
export function DecisionJourneyIndicator({
  scenes,
  activeSceneId,
}: DecisionJourneyIndicatorProps) {
  return (
    <aside
      className="pointer-events-none absolute right-section top-0 z-20 hidden h-full w-[160px] desktop:block"
      aria-label="Průchod Decision Journey"
    >
      <nav className="pointer-events-auto sticky top-[96px]">
        <ul className="m-0 list-none p-0">
          {scenes.map((scene) => {
            const active = scene.id === activeSceneId;
            return (
              <li key={scene.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(scene.id)}
                  aria-current={active ? 'step' : undefined}
                  className={[
                    'flex w-full items-center gap-2 py-1 text-left text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2',
                    active
                      ? 'text-embed-foreground-primary'
                      : 'text-embed-foreground-primary/45 hover:text-embed-foreground-primary/80',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      'text-[14px] leading-none',
                      active ? 'text-embed-brand-gold' : 'text-embed-foreground-primary/35',
                    ].join(' ')}
                  >
                    {active ? '●' : '○'}
                  </span>
                  <span>{scene.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
