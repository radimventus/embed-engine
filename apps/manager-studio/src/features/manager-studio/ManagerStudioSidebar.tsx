import { scrollToSection } from './foundation/scrollToSection';
import { useManagerNav } from './foundation/ManagerNavProvider';

const WORK_CENTER_NAV = [
  {
    id: 'mwc-dropoff',
    label: 'Místa ztráty zákazníků',
  },
  {
    id: 'mwc-factors',
    label: 'Faktory rozhodnutí',
  },
  {
    id: 'mwc-improvements',
    label: 'Doporučená vylepšení',
  },
] as const;

/**
 * PR-005 — Navigace pracovního centra (ne seznam capability).
 */
export function ManagerStudioSidebar() {
  const { activeSectionId } = useManagerNav();

  return (
    <aside
      className="flex h-full w-[260px] shrink-0 flex-col border-r border-[#E7ECF3] bg-white"
      data-studio-shell="sidebar"
      aria-label="Navigace Manager Studia"
    >
      <div className="flex h-[52px] shrink-0 items-center px-6">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#7D8796]">
          Pracovní centrum
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-6">
        <p className="px-1 text-[11px] font-bold uppercase tracking-[1px] text-[#7D8796]">
          Přehled
        </p>
        <nav className="mt-2 flex flex-col gap-1" aria-label="Přehled manažera">
          <button
            type="button"
            aria-label="Konverzní přehled"
            aria-current={
              activeSectionId === 'manager-work-center' ||
              activeSectionId === 'mwc-dropoff'
                ? 'true'
                : undefined
            }
            onClick={() => {
              scrollToSection('manager-work-center');
            }}
            className={[
              'rounded-[10px] border px-3.5 py-2.5 text-left text-sm font-semibold platform-motion',
              activeSectionId === 'manager-work-center' ||
              activeSectionId === 'mwc-dropoff'
                ? 'border-[var(--platform-accent)] bg-[var(--platform-accent)] text-white'
                : 'border-transparent text-[#001930] hover:bg-[#F7F9FC]',
            ].join(' ')}
          >
            Konverzní přehled
          </button>
          {WORK_CENTER_NAV.map((item) => {
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
                    : 'border-transparent text-[#001930] hover:bg-[#F7F9FC]',
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
