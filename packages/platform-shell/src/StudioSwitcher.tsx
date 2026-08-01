import {
  PLATFORM_STUDIOS,
  resolvePlatformStudioHref,
  type PlatformStudioId,
} from './platformStudios';

type StudioSwitcherProps = {
  readonly activeStudioId: PlatformStudioId;
  /**
   * Persist session + navigate (same path as Platform Landing).
   * When omitted, falls back to plain href navigation.
   */
  readonly onSelectStudio?: (studioId: PlatformStudioId) => void;
};

/** Canonical switcher order — SSOT for header + Landing. */
export const PLATFORM_STUDIO_SWITCH_ORDER: readonly PlatformStudioId[] = [
  'manager',
  'sales',
  'builder',
];

/**
 * VR-FIX-04 — Studio Switcher (short labels, session-aware navigation).
 */
export function StudioSwitcher({
  activeStudioId,
  onSelectStudio,
}: StudioSwitcherProps) {
  return (
    <nav
      className="platform-role-switcher"
      aria-label="Studio Switcher"
      data-testid="studio-switcher"
    >
      {PLATFORM_STUDIO_SWITCH_ORDER.map((studioId) => {
        const studio =
          PLATFORM_STUDIOS.find((item) => item.id === studioId) ??
          PLATFORM_STUDIOS[0];
        const isActive = studio.id === activeStudioId;
        const href = studio.available
          ? resolvePlatformStudioHref(studio.id)
          : null;

        if (href !== null && !isActive) {
          if (onSelectStudio !== undefined) {
            return (
              <button
                key={studio.id}
                type="button"
                className="platform-role-btn"
                title={studio.label}
                aria-label={`Otevřít ${studio.label}`}
                onClick={() => onSelectStudio(studio.id)}
              >
                {studio.shortLabel}
              </button>
            );
          }
          return (
            <a
              key={studio.id}
              href={href}
              className="platform-role-btn"
              title={studio.label}
              aria-label={`Otevřít ${studio.label}`}
            >
              {studio.shortLabel}
            </a>
          );
        }

        return (
          <span
            key={studio.id}
            className={`platform-role-btn ${
              isActive
                ? 'platform-role-btn--active'
                : 'platform-role-btn--disabled'
            }`}
            aria-current={isActive ? 'page' : undefined}
            title={!studio.available ? 'Studio zatím není dostupné' : studio.label}
          >
            {studio.shortLabel}
          </span>
        );
      })}
    </nav>
  );
}
