import type {
  ObjectLifecycleStatus,
  ObjectMetadata,
  ObjectType,
  UpdateObjectMetadataInput,
} from '../../model';

const OBJECT_TYPES: readonly { id: ObjectType; label: string }[] = [
  { id: 'house', label: 'Dům' },
  { id: 'apartment', label: 'Byt' },
  { id: 'land', label: 'Pozemek' },
  { id: 'commercial', label: 'Komerční' },
];

const OBJECT_STATUSES: readonly {
  id: ObjectLifecycleStatus;
  label: string;
}[] = [
  { id: 'Draft', label: 'Draft' },
  { id: 'Active', label: 'Active' },
  { id: 'Archived', label: 'Archived' },
];

type MetadataEditorProps = {
  readonly metadata: ObjectMetadata;
  readonly onChange: (patch: UpdateObjectMetadataInput) => void;
};

/**
 * Metadata Editor (EPIC-BLD-08).
 * UI only — persists via ObjectService.
 */
export function MetadataEditor({ metadata, onChange }: MetadataEditorProps) {
  return (
    <section aria-labelledby="object-metadata-heading">
      <h3
        id="object-metadata-heading"
        className="text-base font-semibold text-builder-ink"
      >
        Metadata
      </h3>
      <p className="mt-1 text-[13px] text-builder-muted">
        Základní autorská data Object Package.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[13px]">
          <span className="font-medium text-builder-ink">Název</span>
          <input
            type="text"
            value={metadata.name}
            onChange={(event) => onChange({ name: event.target.value })}
            className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-sm text-builder-ink outline-none focus:border-builder-navy"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px]">
          <span className="font-medium text-builder-ink">Typ objektu</span>
          <select
            value={metadata.objectType}
            onChange={(event) =>
              onChange({ objectType: event.target.value as ObjectType })
            }
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2.5 text-sm text-builder-ink outline-none focus:border-builder-navy"
          >
            {OBJECT_TYPES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[13px]">
          <span className="font-medium text-builder-ink">Lokalita</span>
          <input
            type="text"
            value={metadata.location}
            onChange={(event) => onChange({ location: event.target.value })}
            className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-sm text-builder-ink outline-none focus:border-builder-navy"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px]">
          <span className="font-medium text-builder-ink">Stav</span>
          <select
            value={metadata.status}
            onChange={(event) =>
              onChange({
                status: event.target.value as ObjectLifecycleStatus,
              })
            }
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2.5 text-sm text-builder-ink outline-none focus:border-builder-navy"
          >
            {OBJECT_STATUSES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] sm:col-span-2">
          <span className="font-medium text-builder-ink">Popis</span>
          <textarea
            value={metadata.description}
            rows={3}
            onChange={(event) => onChange({ description: event.target.value })}
            className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-sm text-builder-ink outline-none focus:border-builder-navy"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] sm:col-span-2">
          <span className="font-medium text-builder-ink">Štítky</span>
          <input
            type="text"
            value={metadata.tags.join(', ')}
            onChange={(event) =>
              onChange({
                tags: event.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0),
              })
            }
            placeholder="modular, family, timber"
            className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-sm text-builder-ink outline-none focus:border-builder-navy"
          />
        </label>
      </div>
    </section>
  );
}
