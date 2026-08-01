import { PlatformDropdown } from './PlatformDropdown';

type UserMenuProps = {
  readonly userLabel: string;
  readonly roleLabel?: string;
  readonly onLogout?: () => void;
  readonly onOpenLanding?: () => void;
};

/**
 * EPIC-BX-11 / BX-14 — User menu with logout + platform landing.
 */
export function UserMenu({
  userLabel,
  roleLabel,
  onLogout,
  onOpenLanding,
}: UserMenuProps) {
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
      {roleLabel !== undefined && roleLabel.length > 0 && (
        <span className="platform-menu-item platform-menu-item--disabled">
          {roleLabel}
        </span>
      )}
      <button type="button" role="menuitem" className="platform-menu-item">
        Profil
      </button>
      <button type="button" role="menuitem" className="platform-menu-item">
        Nastavení
      </button>
      {onOpenLanding !== undefined && (
        <button
          type="button"
          role="menuitem"
          className="platform-menu-item"
          onClick={onOpenLanding}
        >
          Platform Landing
        </button>
      )}
      <button
        type="button"
        role="menuitem"
        className={
          onLogout !== undefined
            ? 'platform-menu-item'
            : 'platform-menu-item platform-menu-item--disabled'
        }
        title={onLogout === undefined ? 'Přihlášení není aktivní' : undefined}
        onClick={onLogout}
        disabled={onLogout === undefined}
      >
        Odhlásit
      </button>
    </PlatformDropdown>
  );
}
