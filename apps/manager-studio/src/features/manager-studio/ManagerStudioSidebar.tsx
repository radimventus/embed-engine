import { scrollToSection } from './foundation/scrollToSection';
import { useManagerNav } from './foundation/ManagerNavProvider';
import { COMMERCIAL_SECTION_NAV } from './commercial/commercialVocabulary';
import { CUSTOMER_SUCCESS_SECTION_NAV } from './customer-success/customerSuccessVocabulary';
import { PLATFORM_OPS_SECTION_NAV } from './operations-center/platformOpsVocabulary';
import { PRODUCT_LEARNING_SECTION_NAV } from './product-learning/productLearningVocabulary';
import { OPERATIONS_SECTION_NAV } from './operations/operationsVocabulary';

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
    <>
      <div className="mt-4 flex h-8 shrink-0 items-center px-4 first:mt-0">
        <span className="text-xs font-medium tracking-wide text-embed-brand-gold">
          {title}
        </span>
      </div>
      <nav className="mt-1 flex flex-col gap-1 px-2" aria-label={ariaLabel}>
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
    </>
  );
}

/**
 * Left AppShell rail — Platform Ops + Customer Success + Operations (BX-17/19).
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
          Manager
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pb-section">
        <NavGroup
          title="Platform Ops"
          items={PLATFORM_OPS_SECTION_NAV}
          activeSectionId={activeSectionId}
          ariaLabel="Sekce Platform Operations Center"
        />
        <NavGroup
          title="Commercial"
          items={COMMERCIAL_SECTION_NAV}
          activeSectionId={activeSectionId}
          ariaLabel="Sekce Commercial Platform"
        />
        <NavGroup
          title="Product Learning"
          items={PRODUCT_LEARNING_SECTION_NAV}
          activeSectionId={activeSectionId}
          ariaLabel="Sekce Product Learning"
        />
        <NavGroup
          title="Customer Success"
          items={CUSTOMER_SUCCESS_SECTION_NAV}
          activeSectionId={activeSectionId}
          ariaLabel="Sekce Customer Success"
        />
        <NavGroup
          title="Operations"
          items={OPERATIONS_SECTION_NAV}
          activeSectionId={activeSectionId}
          ariaLabel="Sekce Operations Terminal"
        />
      </div>
    </aside>
  );
}
