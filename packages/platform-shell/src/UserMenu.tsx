import { PlatformDropdown } from './PlatformDropdown';

type UserMenuProps = {
  readonly userLabel: string;
};

/**
 * UX placeholder — no authentication.
 */
export function UserMenu({ userLabel }: UserMenuProps) {
  return (
    <PlatformDropdown
      align="right"
      ariaLabel="User menu"
      label={
        <>
          <span className="platform-avatar" aria-hidden>
            {userLabel.slice(0, 1).toUpperCase()}
          </span>
          <span>{userLabel}</span>
        </>
      }
    >
      <button type="button" role="menuitem" className="platform-menu-item">
        Profil
      </button>
      <button type="button" role="menuitem" className="platform-menu-item">
        Nastavení
      </button>
      <button
        type="button"
        role="menuitem"
        className="platform-menu-item platform-menu-item--disabled"
        title="Autentizace přijde později"
      >
        Odhlásit
      </button>
    </PlatformDropdown>
  );
}
