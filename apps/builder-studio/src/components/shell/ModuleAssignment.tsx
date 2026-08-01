import type { ObjectModuleDefinition, ObjectModuleId } from '../../model';

type ModuleAssignmentProps = {
  readonly registry: readonly ObjectModuleDefinition[];
  readonly assigned: readonly ObjectModuleId[];
  readonly onToggle: (moduleId: ObjectModuleId) => void;
};

/**
 * Module Assignment (EPIC-BLD-08).
 * Selects which modules the Object Package contains.
 * No module configuration.
 */
export function ModuleAssignment({
  registry,
  assigned,
  onToggle,
}: ModuleAssignmentProps) {
  const assignedSet = new Set(assigned);

  return (
    <section aria-labelledby="object-modules-heading">
      <h3
        id="object-modules-heading"
        className="text-base font-semibold text-builder-ink"
      >
        Moduly
      </h3>
      <p className="mt-1 text-[13px] text-builder-muted">
        Přiřazení z Module Registry — bez konfigurace modulů.
      </p>
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {registry.map((module) => {
          const isOn = assignedSet.has(module.id);
          return (
            <li key={module.id}>
              <button
                type="button"
                onClick={() => onToggle(module.id)}
                aria-pressed={isOn}
                className={`flex w-full flex-col rounded-[12px] border px-4 py-3 text-left transition-colors ${
                  isOn
                    ? 'border-builder-blue bg-builder-creamDark text-builder-blue'
                    : 'border-[#DDE5EF] bg-white text-builder-ink hover:border-builder-navy/40'
                }`}
              >
                <span className="text-sm font-semibold">{module.label}</span>
                <span
                  className={`mt-1 text-[12px] ${
                    isOn ? 'text-white/80' : 'text-builder-muted'
                  }`}
                >
                  {module.description}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
