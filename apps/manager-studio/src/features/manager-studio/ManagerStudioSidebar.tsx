import { scrollToSection } from './foundation/scrollToSection';
import { ManagerWorkspaceScopeControls } from './ManagerWorkspaceScopeControls';
import { useManagerNav } from './foundation/ManagerNavProvider';
import { PARTNER_NAV_GROUPS } from './partnerNav';

function NavGroup({
  title,
  items,
  activeSectionId,
  ariaLabel,
}: {
  readonly title: string;
  readonly items: readonly {
    readonly id: string;
    readonly label: string;
    readonly short: string;
  }[];
  readonly activeSectionId: string | null;
  readonly ariaLabel: string;
}) {
  return (
    <div className="mb-5">
      <p className="px-1 text-[11px] font-bold uppercase tracking-[1px] text-[var(--platform-section)]">
        {title}
      </p>
      <nav className="mt-2 flex flex-col gap-1.5" aria-label={ariaLabel}>
        {items.map((item) => {
          const isActive = activeSectionId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => {
                scrollToSection(item.id);
              }}
              className={[
                'rounded-xl border px-3.5 py-3 text-left text-sm font-semibold platform-motion',
                isActive
                  ? 'border-[var(--platform-blue)] bg-[var(--platform-cream-light)] text-[var(--platform-navy)]'
                  : 'border-[#E3E3E3] bg-white text-[var(--platform-navy)] hover:border-[var(--platform-blue)] hover:bg-[var(--platform-blue)] hover:text-white',
              ].join(' ')}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * PR-026A — Cream Light rail · white nav cards (Builder object-list principle).
 */
export function ManagerStudioSidebar() {
  const { activeSectionId } = useManagerNav();

  return (
    <aside
      className="flex h-full w-[260px] shrink-0 flex-col border-r-2 border-[var(--platform-cream-dark)] bg-[var(--platform-cream-light)]"
      data-studio-shell="sidebar"
      aria-label="Navigace Manager Studia"
    >
      <div className="flex h-[52px] shrink-0 items-center px-6">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--platform-section)]">
          Pracovní centrum
        </span>
      </div>
      <ManagerWorkspaceScopeControls />
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-6">
        {PARTNER_NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.title}
            title={group.title}
            items={group.items}
            activeSectionId={activeSectionId}
            ariaLabel={group.ariaLabel}
          />
        ))}
      </div>
    </aside>
  );
}
