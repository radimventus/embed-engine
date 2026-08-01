import {
  PLATFORM_STUDIOS,
  resolvePlatformStudioHref,
  type PlatformStudioId,
} from './platformStudios';

type StudioSwitcherProps = {
  readonly activeStudioId: PlatformStudioId;
};

/**
 * VR-FIX-01 — Click-model pill role switcher (Manager / Sales / Builder).
 */
export function StudioSwitcher({ activeStudioId }: StudioSwitcherProps) {
  const order: readonly PlatformStudioId[] = ['manager', 'sales', 'builder'];

  return (
    <nav
      className="platform-role-switcher"
      aria-label="Studio Switcher"
      data-testid="studio-switcher"
    >
      {order.map((studioId) => {
        const studio =
          PLATFORM_STUDIOS.find((item) => item.id === studioId) ??
          PLATFORM_STUDIOS[0];
        const isActive = studio.id === activeStudioId;
        const href = studio.available
          ? resolvePlatformStudioHref(studio.id)
          : null;

        if (href !== null && !isActive) {
          return (
            <a
              key={studio.id}
              href={href}
              className="platform-role-btn"
            >
              {studio.label}
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
            title={!studio.available ? 'Studio zatím není dostupné' : undefined}
          >
            {studio.label}
          </span>
        );
      })}
    </nav>
  );
}
