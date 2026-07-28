import type {
  ComposerEvent,
  Experience,
  ExperienceStructureReport,
  ObjectModuleDefinition,
  ObjectModuleId,
  Scene,
} from '../../model';
import { SceneEditor } from './SceneEditor';

type ExperienceComposerProps = {
  readonly experience: Experience;
  readonly structure: ExperienceStructureReport;
  readonly moduleRegistry: readonly ObjectModuleDefinition[];
  readonly availableModules: readonly ObjectModuleId[];
  readonly events: readonly ComposerEvent[];
  readonly selectedSceneId: string | null;
  readonly onSelectScene: (sceneId: string) => void;
  readonly onAddScene: () => void;
  readonly onRenameScene: (sceneId: string, title: string) => void;
  readonly onMoveScene: (sceneId: string, direction: 'up' | 'down') => void;
  readonly onRemoveScene: (sceneId: string) => void;
  readonly onToggleSceneModule: (
    sceneId: string,
    moduleId: ObjectModuleId,
  ) => void;
};

/**
 * Experience Overview / Composer (EPIC-BLD-09).
 * Structure composition only — no module configuration.
 */
export function ExperienceComposer({
  experience,
  structure,
  moduleRegistry,
  availableModules,
  events,
  selectedSceneId,
  onSelectScene,
  onAddScene,
  onRenameScene,
  onMoveScene,
  onRemoveScene,
  onToggleSceneModule,
}: ExperienceComposerProps) {
  const ordered = [...experience.scenes].sort((a, b) => a.order - b.order);
  const selected: Scene | null =
    ordered.find((scene) => scene.sceneId === selectedSceneId) ??
    ordered[0] ??
    null;

  const palette = moduleRegistry.filter((item) =>
    availableModules.includes(item.id),
  );

  return (
    <div className="space-y-8" data-testid="experience-composer">
      <div>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Experience Composer
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
          {experience.metadata.title}
        </h2>
        <p className="mt-1 text-[13px] text-builder-muted">
          {experience.experienceId} · v{experience.version} ·{' '}
          {experience.scenes.length} scén · {experience.modules.length} modulů
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile label="Scény" value={`${structure.sceneCount}`} />
        <SummaryTile label="Moduly" value={`${structure.moduleCount}`} />
        <SummaryTile
          label="Struktura"
          value={structure.valid ? 'Valid' : 'Invalid'}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <SceneEditor
          scenes={experience.scenes}
          selectedSceneId={selected?.sceneId ?? null}
          onSelectScene={onSelectScene}
          onAddScene={onAddScene}
          onRenameScene={onRenameScene}
          onMoveScene={onMoveScene}
          onRemoveScene={onRemoveScene}
        />

        <section aria-labelledby="module-placement-heading">
          <h3
            id="module-placement-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Module Placement
          </h3>
          <p className="mt-1 text-[13px] text-builder-muted">
            {selected === null
              ? 'Vyberte scénu.'
              : `Přiřazení modulů do „${selected.title}“ — bez konfigurace.`}
          </p>
          {selected !== null ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {palette.map((module) => {
                const isOn = selected.modules.includes(module.id);
                return (
                  <li key={module.id}>
                    <button
                      type="button"
                      onClick={() =>
                        onToggleSceneModule(selected.sceneId, module.id)
                      }
                      aria-pressed={isOn}
                      className={`flex w-full flex-col rounded-[12px] border px-4 py-3 text-left ${
                        isOn
                          ? 'border-builder-navy bg-builder-navy text-white'
                          : 'border-[#DDE5EF] bg-white text-builder-ink'
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {module.label}
                      </span>
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
          ) : null}
        </section>
      </div>

      <section aria-labelledby="navigation-heading">
        <h3
          id="navigation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Navigace
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          defaultScene: {experience.navigation.defaultScene ?? '—'}
        </p>
        <ol className="mt-3 flex flex-wrap gap-2">
          {experience.navigation.order.map((sceneId, index) => {
            const scene = experience.scenes.find(
              (item) => item.sceneId === sceneId,
            );
            return (
              <li
                key={sceneId}
                className="rounded-full border border-[#DDE5EF] bg-[#F8FAFC] px-3 py-1.5 text-[12px] text-builder-ink"
              >
                {index + 1}. {scene?.title ?? sceneId}
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="structure-validation-heading">
        <h3
          id="structure-validation-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validace struktury
        </h3>
        {structure.issues.length === 0 ? (
          <p className="mt-2 text-sm text-builder-muted">
            Struktura Experience je v pořádku.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {structure.issues.map((issue) => (
              <li
                key={`${issue.code}-${issue.sceneId ?? 'root'}`}
                className={`rounded-[10px] border px-3 py-2.5 text-[13px] ${
                  issue.severity === 'error'
                    ? 'border-[#F3C4C0] bg-[#FFF5F4] text-[#9B2C2C]'
                    : 'border-[#F5E0B8] bg-[#FFFBF0] text-[#8A6D1D]'
                }`}
              >
                <span className="font-medium uppercase">{issue.severity}</span>
                {' · '}
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="composer-history-heading">
        <h3
          id="composer-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Historie Composeru
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Session only — bez persistence.
        </p>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné události.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 10).map((event) => (
              <li
                key={event.eventId}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <div>
                  <span className="font-medium text-builder-ink">
                    {event.type}
                  </span>
                  <span className="mt-0.5 block text-builder-muted">
                    {event.message}
                  </span>
                </div>
                <time className="shrink-0 text-[11px] text-builder-muted">
                  {new Date(event.at).toLocaleTimeString('cs-CZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryTile({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-[12px] uppercase tracking-wide text-builder-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-builder-ink">{value}</p>
    </div>
  );
}
