import {
  PLATFORM_STUDIOS,
  type PlatformStudioId,
} from './platformStudios';
import { PlatformDropdown } from './PlatformDropdown';

type StudioSwitcherProps = {
  readonly activeStudioId: PlatformStudioId;
};

export function StudioSwitcher({ activeStudioId }: StudioSwitcherProps) {
  const active =
    PLATFORM_STUDIOS.find((studio) => studio.id === activeStudioId) ??
    PLATFORM_STUDIOS[0];

  return (
    <PlatformDropdown
      ariaLabel="Studio Switcher"
      label={
        <>
          <span>{active.shortLabel}</span>
        </>
      }
    >
      {PLATFORM_STUDIOS.map((studio) => {
        const isActive = studio.id === activeStudioId;
        if (studio.available && studio.href !== null && !isActive) {
          return (
            <a
              key={studio.id}
              href={studio.href}
              role="menuitem"
              className="platform-menu-item"
            >
              {studio.label}
            </a>
          );
        }
        return (
          <span
            key={studio.id}
            role="menuitem"
            className={`platform-menu-item ${
              isActive
                ? 'platform-menu-item--active'
                : 'platform-menu-item--disabled'
            }`}
            title={!studio.available ? 'Studio zatím není dostupné' : undefined}
          >
            {studio.label}
            {isActive ? ' · aktivní' : ''}
            {!studio.available ? ' · brzy' : ''}
          </span>
        );
      })}
    </PlatformDropdown>
  );
}
