import { PlatformDropdown } from './PlatformDropdown';

type UserMenuProps = {
  readonly userLabel: string;
  readonly roleLabel?: string;
  readonly onLogout?: () => void;
  readonly onOpenLanding?: () => void;
};

/**
 * VR-FIX-01 — User badge (gold avatar) per click model.
 */
export function UserMenu({
  userLabel,
  roleLabel,
  onLogout,
  onOpenLanding,
}: UserMenuProps) {
  const initials = userLabel
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <PlatformDropdown
      align="right"
      ariaLabel="Uživatelské menu"
      label={
        <>
          <span>{roleLabel ?? 'Aktivní modul'}</span>
          <span className="platform-avatar" aria-hidden>
            {initials || userLabel.slice(0, 1).toUpperCase()}
          </span>
        </>
      }
    >
      <span className="platform-menu-item platform-menu-item--disabled">
        {userLabel}
      </span>
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
          Vstupní stránka
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
