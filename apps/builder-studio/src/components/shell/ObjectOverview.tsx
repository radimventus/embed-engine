import type {
  ObjectEvent,
  ObjectModuleDefinition,
  ObjectModuleId,
  ObjectPackage,
  ReadinessReport,
  UpdateObjectMetadataInput,
  ValidationReport,
} from '../../model';
import { MetadataEditor } from './MetadataEditor';
import { ModuleAssignment } from './ModuleAssignment';

type ObjectOverviewProps = {
  readonly objectPackage: ObjectPackage;
  readonly moduleRegistry: readonly ObjectModuleDefinition[];
  readonly events: readonly ObjectEvent[];
  readonly validationReport: ValidationReport | null;
  readonly readiness: ReadinessReport | null;
  readonly onUpdateMetadata: (patch: UpdateObjectMetadataInput) => void;
  readonly onToggleModule: (moduleId: ObjectModuleId) => void;
  readonly onSaveObject: () => void;
  readonly onDuplicateObject: () => void;
};

function countMedia(objectPackage: ObjectPackage): number {
  return (
    objectPackage.media.hero.length +
    objectPackage.media.photographs.length +
    objectPackage.media.video.length
  );
}

function countLayouts(objectPackage: ObjectPackage): number {
  return (
    objectPackage.layouts.svg.length +
    objectPackage.layouts.floorplan.length +
    objectPackage.layouts.csvRooms.length +
    objectPackage.layouts.csvImages.length
  );
}

/**
 * Object Overview (EPIC-BLD-08).
 * Authoring hub: metadata, media, knowledge, modules, validation, readiness.
 */
export function ObjectOverview({
  objectPackage,
  moduleRegistry,
  events,
  validationReport,
  readiness,
  onUpdateMetadata,
  onToggleModule,
  onSaveObject,
  onDuplicateObject,
}: ObjectOverviewProps) {
  const mediaCount = countMedia(objectPackage);
  const layoutCount = countLayouts(objectPackage);
  const knowledgeCount = objectPackage.knowledge.length;

  return (
    <div className="space-y-8" data-testid="object-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Object Package
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {objectPackage.metadata.name}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {objectPackage.objectId} · v{objectPackage.version} ·{' '}
            {objectPackage.metadata.status}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSaveObject}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Uložit Object
          </button>
          <button
            type="button"
            onClick={onDuplicateObject}
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-4 py-2.5 text-sm font-medium text-builder-ink"
          >
            Duplikovat
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Média" value={`${mediaCount}`} />
        <SummaryTile label="Dispozice" value={`${layoutCount}`} />
        <SummaryTile label="Znalosti" value={`${knowledgeCount}`} />
        <SummaryTile
          label="Moduly"
          value={`${objectPackage.modules.length}`}
        />
      </div>

      <MetadataEditor
        metadata={objectPackage.metadata}
        onChange={onUpdateMetadata}
      />

      <ModuleAssignment
        registry={moduleRegistry}
        assigned={objectPackage.modules}
        onToggle={onToggleModule}
      />

      <section aria-labelledby="object-readiness-heading">
        <h3
          id="object-readiness-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Validace & připravenost
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[12px] border border-[#DDE5EF] bg-[#F8FAFC] px-4 py-3">
            <p className="text-[12px] uppercase tracking-wide text-builder-muted">
              Quality Gate
            </p>
            <p className="mt-1 text-sm font-semibold text-builder-ink">
              {validationReport?.qualityGate ?? 'Neověřeno'}
            </p>
            <p className="mt-1 text-[12px] text-builder-muted">
              {validationReport === null
                ? 'Spusťte validaci v Publish panelu.'
                : `${validationReport.errors.length} chyb · ${validationReport.warnings.length} varování`}
            </p>
          </div>
          <div className="rounded-[12px] border border-[#DDE5EF] bg-[#F8FAFC] px-4 py-3">
            <p className="text-[12px] uppercase tracking-wide text-builder-muted">
              Readiness
            </p>
            <p className="mt-1 text-sm font-semibold text-builder-ink">
              {readiness === null ? '—' : `${readiness.overallPercent}%`}
            </p>
            <p className="mt-1 text-[12px] text-builder-muted">
              {readiness === null
                ? 'Čeká na evaluaci projektu.'
                : `${readiness.errors.length} chyb · ${readiness.warnings.length} varování`}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="object-history-heading">
        <h3
          id="object-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Historie relace
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Bez persistence — pouze aktuální session.
        </p>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné události.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 12).map((event) => (
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
