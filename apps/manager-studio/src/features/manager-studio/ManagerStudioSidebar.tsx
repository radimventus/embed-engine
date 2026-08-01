import { scrollToSection } from './foundation/scrollToSection';
import { useManagerNav } from './foundation/ManagerNavProvider';
import { COMMERCIAL_SECTION_NAV } from './commercial/commercialVocabulary';
import { CUSTOMER_SUCCESS_SECTION_NAV } from './customer-success/customerSuccessVocabulary';
import { LAUNCH_SECTION_NAV } from './launch/launchVocabulary';
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
    <div className="mb-5">
      <p className="px-1 text-[11px] font-bold uppercase tracking-[1px] text-[var(--platform-section)]">
        {title}
      </p>
      <nav className="mt-2 flex flex-col gap-1" aria-label={ariaLabel}>
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
                'rounded-[10px] border px-3.5 py-2.5 text-left text-sm font-semibold platform-motion',
                isActive
                  ? 'border-[var(--platform-accent)] bg-[var(--platform-accent)] text-white'
                  : 'border-transparent text-[#001930] hover:bg-[var(--platform-cream-mid)]',
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
 * PR-005 — Kompletní levá navigace (české labely) + pracovní centrum.
 * PO: všechny funkce viditelné pro společný návrh finální IA.
 */
export function ManagerStudioSidebar() {
  const { activeSectionId } = useManagerNav();

  return (
    <aside
      className="flex h-full w-[260px] shrink-0 flex-col border-r border-[var(--platform-line)] bg-white"
      data-studio-shell="sidebar"
      aria-label="Navigace Manager Studia"
    >
      <div className="flex h-[52px] shrink-0 items-center px-6">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--platform-section)]">
          Pracovní centrum
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-6">
        <NavGroup
          title="Přehled"
          items={[
            {
              id: 'manager-work-center',
              label: 'Konverzní přehled',
              short: 'K',
            },
            ...LAUNCH_SECTION_NAV,
          ]}
          activeSectionId={activeSectionId}
          ariaLabel="Přehled manažera"
        />
        <NavGroup
          title="Provoz"
          items={[...OPERATIONS_SECTION_NAV, ...PLATFORM_OPS_SECTION_NAV]}
          activeSectionId={activeSectionId}
          ariaLabel="Provoz"
        />
        <NavGroup
          title="Experience"
          items={PRODUCT_LEARNING_SECTION_NAV}
          activeSectionId={activeSectionId}
          ariaLabel="Experience"
        />
        <NavGroup
          title="Případy"
          items={CUSTOMER_SUCCESS_SECTION_NAV}
          activeSectionId={activeSectionId}
          ariaLabel="Případy"
        />
        <NavGroup
          title="Obchod"
          items={COMMERCIAL_SECTION_NAV}
          activeSectionId={activeSectionId}
          ariaLabel="Obchod"
        />
      </div>
    </aside>
  );
}
