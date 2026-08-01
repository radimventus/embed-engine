import { scrollToSection } from './foundation/scrollToSection';
import { useManagerNav } from './foundation/ManagerNavProvider';
import { CUSTOMER_SUCCESS_SECTION_NAV } from './customer-success/customerSuccessVocabulary';
import { OPERATIONS_SECTION_NAV } from './operations/operationsVocabulary';

/**
 * Left AppShell rail — Customer Success + Operations (BX-17 / MSCB-01).
 */
export function ManagerStudioSidebar() {
  const { activeSectionId } = useManagerNav();

  return (
    <aside
      className="flex h-full min-h-screen w-sidebar shrink-0 flex-col bg-embed-brand-navy"
      data-studio-shell="sidebar"
      aria-label="Navigace Manager Studia"
    >
      <div className="flex h-header shrink-0 items-center px-4">
        <span className="text-xs font-medium tracking-wide text-embed-brand-gold">
          Customer Success
        </span>
      </div>

      <nav
        className="mt-2 flex flex-col gap-1 px-2"
        aria-label="Sekce Customer Success"
      >
        {CUSTOMER_SUCCESS_SECTION_NAV.map((item) => {
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
                'flex items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors',
                isActive
                  ? 'bg-embed-background-primary/15 text-embed-brand-gold'
                  : 'text-embed-background-primary/75 hover:bg-embed-background-primary/10 hover:text-embed-background-primary',
              ].join(' ')}
            >
              <span className="w-4 text-center text-xs font-medium" aria-hidden>
                {item.short}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 flex h-8 shrink-0 items-center px-4">
        <span className="text-xs font-medium tracking-wide text-embed-brand-gold/80">
          Operations
        </span>
      </div>

      <nav
        className="mt-1 flex flex-1 flex-col gap-1 px-2 pb-section"
        aria-label="Sekce Operations Terminal"
      >
        {OPERATIONS_SECTION_NAV.map((item) => {
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
                'flex items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors',
                isActive
                  ? 'bg-embed-background-primary/15 text-embed-brand-gold'
                  : 'text-embed-background-primary/75 hover:bg-embed-background-primary/10 hover:text-embed-background-primary',
              ].join(' ')}
            >
              <span className="w-4 text-center text-xs font-medium" aria-hidden>
                {item.short}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
