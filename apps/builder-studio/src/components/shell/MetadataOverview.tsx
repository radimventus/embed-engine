import { useEffect, useState } from 'react';
import type {
  Asset,
  MetadataEvent,
  MetadataPackage,
  MetadataStatus,
  ObjectAttribute,
  ObjectAttributeType,
  ObjectMetadataDocument,
} from '../../model';

type MetadataOverviewProps = {
  readonly metadataPackage: MetadataPackage | null;
  readonly document: ObjectMetadataDocument | null;
  readonly availableAssets: readonly Asset[];
  readonly events: readonly MetadataEvent[];
  readonly indexCount: number;
  readonly message: string | null;
  readonly onCreateMetadata: () => void;
  readonly onUpdateGeneral: (patch: {
    title: string;
    slug: string;
    summary: string;
    description: string;
    category: string;
    language: string;
    status: MetadataStatus;
  }) => void;
  readonly onUpdateSeo: (patch: {
    title: string;
    description: string;
    keywords: string;
    canonicalUrl: string;
    socialImageAssetId: string | null;
  }) => void;
  readonly onAttachAsset: (assetId: string) => void;
  readonly onDetachAsset: (assetId: string) => void;
  readonly onOpenAsset: (assetId: string) => void;
  readonly onAddAttribute: (
    attribute: Omit<ObjectAttribute, 'id' | 'metadata'> & {
      readonly id?: string;
      readonly metadata?: ObjectAttribute['metadata'];
    },
  ) => void;
  readonly onEditAttribute: (attribute: ObjectAttribute) => void;
  readonly onRemoveAttribute: (key: string) => void;
  readonly onReorderAttribute: (key: string, direction: 'up' | 'down') => void;
  readonly onValidate: () => void;
  readonly onPublishDraft: () => void;
};

const ATTRIBUTE_TYPES: readonly ObjectAttributeType[] = [
  'string',
  'number',
  'boolean',
  'url',
  'json',
];

const METADATA_STATUSES: readonly MetadataStatus[] = [
  'DRAFT',
  'READY',
  'PUBLISHED',
  'ARCHIVED',
];

export function MetadataOverview({
  metadataPackage,
  document,
  availableAssets,
  events,
  indexCount,
  message,
  onCreateMetadata,
  onUpdateGeneral,
  onUpdateSeo,
  onAttachAsset,
  onDetachAsset,
  onOpenAsset,
  onAddAttribute,
  onEditAttribute,
  onRemoveAttribute,
  onReorderAttribute,
  onValidate,
  onPublishDraft,
}: MetadataOverviewProps) {
  const [title, setTitle] = useState(document?.title ?? '');
  const [slug, setSlug] = useState(document?.slug ?? '');
  const [summary, setSummary] = useState(document?.summary ?? '');
  const [description, setDescription] = useState(document?.description ?? '');
  const [category, setCategory] = useState(document?.category ?? 'house');
  const [language, setLanguage] = useState(document?.language ?? 'cs');
  const [status, setStatus] = useState<MetadataStatus>(
    document?.status ?? 'DRAFT',
  );
  const [seoTitle, setSeoTitle] = useState(document?.seo.title ?? '');
  const [seoDescription, setSeoDescription] = useState(
    document?.seo.description ?? '',
  );
  const [keywords, setKeywords] = useState(
    document?.seo.keywords.join(', ') ?? '',
  );
  const [canonicalUrl, setCanonicalUrl] = useState(
    document?.seo.canonicalUrl ?? '',
  );
  const [socialImageAssetId, setSocialImageAssetId] = useState(
    document?.seo.socialImageAssetId ?? '',
  );
  const [attachAssetId, setAttachAssetId] = useState('');
  const [attrKey, setAttrKey] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [attrType, setAttrType] = useState<ObjectAttributeType>('string');
  const [attrGroup, setAttrGroup] = useState('specs');
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setTitle(document?.title ?? '');
    setSlug(document?.slug ?? '');
    setSummary(document?.summary ?? '');
    setDescription(document?.description ?? '');
    setCategory(document?.category ?? 'house');
    setLanguage(document?.language ?? 'cs');
    setStatus(document?.status ?? 'DRAFT');
    setSeoTitle(document?.seo.title ?? '');
    setSeoDescription(document?.seo.description ?? '');
    setKeywords(document?.seo.keywords.join(', ') ?? '');
    setCanonicalUrl(document?.seo.canonicalUrl ?? '');
    setSocialImageAssetId(document?.seo.socialImageAssetId ?? '');
  }, [document?.id, document?.updatedAt]);

  const referencedAssets = (document?.assetReferences ?? []).map((assetId) => {
    const asset = availableAssets.find((item) => item.id === assetId) ?? null;
    return { assetId, asset };
  });

  const attachableAssets = availableAssets.filter(
    (asset) =>
      asset.status === 'ACTIVE' &&
      !(document?.assetReferences ?? []).includes(asset.id),
  );

  const imageAssets = availableAssets.filter(
    (asset) => asset.status === 'ACTIVE' && asset.type === 'IMAGE',
  );

  return (
    <div className="space-y-8" data-testid="metadata-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Object Metadata Editor
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {metadataPackage?.metadata.title ?? 'Metadata'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            Kanonický popis objektu — reference na assety, bez Asset Manager
            mutací, AI a Runtime publish.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              onCreateMetadata();
            }}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Create Metadata
          </button>
          <button
            type="button"
            onClick={onValidate}
            disabled={metadataPackage === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onPublishDraft}
            disabled={metadataPackage === null}
            className="rounded-[10px] border border-builder-navy px-4 py-2.5 text-sm font-medium text-builder-navy disabled:opacity-40"
          >
            Publish Draft
          </button>
        </div>
      </div>

      {message !== null ? (
        <p className="rounded-[10px] border border-[#DDE5EF] px-4 py-3 text-sm text-builder-muted">
          {message}
        </p>
      ) : null}

      <p className="text-[13px] text-builder-muted">
        status: {document?.status ?? '—'} · refs:{' '}
        {document?.assetReferences.length ?? 0} · index: {indexCount}
      </p>

      <section aria-labelledby="metadata-general" className="space-y-3">
        <h3
          id="metadata-general"
          className="text-base font-semibold text-builder-ink"
        >
          General
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Title" value={title} onChange={setTitle} />
          <Field label="Slug" value={slug} onChange={setSlug} />
          <Field label="Category" value={category} onChange={setCategory} />
          <Field label="Language" value={language} onChange={setLanguage} />
          <label className="text-[13px] text-builder-muted">
            Status
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as MetadataStatus)
              }
              className="mt-1 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-ink"
            >
              {METADATA_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-[13px] text-builder-muted">
          Summary
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="mt-1 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-ink"
            rows={2}
          />
        </label>
        <label className="block text-[13px] text-builder-muted">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-ink"
            rows={3}
          />
        </label>
        <button
          type="button"
          disabled={document === null}
          onClick={() =>
            onUpdateGeneral({
              title,
              slug,
              summary,
              description,
              category,
              language,
              status,
            })
          }
          className="rounded-[10px] border border-builder-navy px-3 py-2 text-sm font-medium text-builder-navy disabled:opacity-40"
        >
          Save General
        </button>
      </section>

      <section aria-labelledby="metadata-seo" className="space-y-3">
        <h3 id="metadata-seo" className="text-base font-semibold text-builder-ink">
          SEO
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="SEO Title" value={seoTitle} onChange={setSeoTitle} />
          <Field
            label="Canonical URL"
            value={canonicalUrl}
            onChange={setCanonicalUrl}
          />
          <Field label="Keywords" value={keywords} onChange={setKeywords} />
          <label className="text-[13px] text-builder-muted">
            Social Image
            <select
              value={socialImageAssetId}
              onChange={(event) => setSocialImageAssetId(event.target.value)}
              className="mt-1 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-ink"
            >
              <option value="">None</option>
              {imageAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.id})
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-[13px] text-builder-muted">
          SEO Description
          <textarea
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
            className="mt-1 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-ink"
            rows={3}
          />
        </label>
        <button
          type="button"
          disabled={document === null}
          onClick={() =>
            onUpdateSeo({
              title: seoTitle,
              description: seoDescription,
              keywords,
              canonicalUrl,
              socialImageAssetId: socialImageAssetId.trim() || null,
            })
          }
          className="rounded-[10px] border border-builder-navy px-3 py-2 text-sm font-medium text-builder-navy disabled:opacity-40"
        >
          Save SEO
        </button>
      </section>

      <section aria-labelledby="metadata-assets" className="space-y-3">
        <h3
          id="metadata-assets"
          className="text-base font-semibold text-builder-ink"
        >
          Asset References
        </h3>
        <p className="text-[13px] text-builder-muted">
          Pouze reference na Asset Manager — Attach / Detach / Open. Assety se
          nevytváří ani nemažou.
        </p>
        <div className="overflow-x-auto rounded-[12px] border border-[#DDE5EF]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F7FAFD] text-[12px] uppercase tracking-wide text-builder-muted">
              <tr>
                <th className="px-3 py-2">Asset ID</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {referencedAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-3 text-builder-muted"
                  >
                    Zatím žádné připojené assety.
                  </td>
                </tr>
              ) : (
                referencedAssets.map(({ assetId, asset }) => (
                  <tr key={assetId} className="border-t border-[#DDE5EF]">
                    <td className="px-3 py-2 font-mono text-xs">{assetId}</td>
                    <td className="px-3 py-2">{asset?.name ?? '—'}</td>
                    <td className="px-3 py-2">{asset?.type ?? '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenAsset(assetId)}
                          className="rounded-[8px] border border-[#DDE5EF] px-2 py-1 text-xs"
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => onDetachAsset(assetId)}
                          className="rounded-[8px] border border-[#DDE5EF] px-2 py-1 text-xs"
                        >
                          Detach
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[240px] flex-1 text-[13px] text-builder-muted">
            Attach asset
            <select
              value={attachAssetId}
              onChange={(event) => setAttachAssetId(event.target.value)}
              className="mt-1 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-ink"
            >
              <option value="">Select asset…</option>
              {attachableAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} · {asset.type}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={document === null || !attachAssetId}
            onClick={() => {
              onAttachAsset(attachAssetId);
              setAttachAssetId('');
            }}
            className="rounded-[10px] border border-builder-navy px-3 py-2 text-sm font-medium text-builder-navy disabled:opacity-40"
          >
            Attach
          </button>
        </div>
      </section>

      <section aria-labelledby="metadata-attributes" className="space-y-3">
        <h3
          id="metadata-attributes"
          className="text-base font-semibold text-builder-ink"
        >
          Attributes
        </h3>
        <div className="overflow-x-auto rounded-[12px] border border-[#DDE5EF]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F7FAFD] text-[12px] uppercase tracking-wide text-builder-muted">
              <tr>
                <th className="px-3 py-2">Key</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Group</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...(document?.attributes ?? [])]
                .sort((left, right) => left.order - right.order)
                .map((attribute) => (
                  <tr key={attribute.id} className="border-t border-[#DDE5EF]">
                    <td className="px-3 py-2 font-medium">{attribute.key}</td>
                    <td className="px-3 py-2">{attribute.value}</td>
                    <td className="px-3 py-2">{attribute.type}</td>
                    <td className="px-3 py-2">{attribute.group}</td>
                    <td className="px-3 py-2">{attribute.order}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAttributeId(attribute.id);
                            setAttrKey(attribute.key);
                            setAttrValue(attribute.value);
                            setAttrType(attribute.type);
                            setAttrGroup(attribute.group);
                          }}
                          className="rounded-[8px] border border-[#DDE5EF] px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onReorderAttribute(attribute.key, 'up')}
                          className="rounded-[8px] border border-[#DDE5EF] px-2 py-1 text-xs"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onReorderAttribute(attribute.key, 'down')
                          }
                          className="rounded-[8px] border border-[#DDE5EF] px-2 py-1 text-xs"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveAttribute(attribute.key)}
                          className="rounded-[8px] border border-[#DDE5EF] px-2 py-1 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-2 md:grid-cols-5">
          <Field label="Key" value={attrKey} onChange={setAttrKey} />
          <Field label="Value" value={attrValue} onChange={setAttrValue} />
          <label className="text-[13px] text-builder-muted">
            Type
            <select
              value={attrType}
              onChange={(event) =>
                setAttrType(event.target.value as ObjectAttributeType)
              }
              className="mt-1 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-ink"
            >
              {ATTRIBUTE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <Field label="Group" value={attrGroup} onChange={setAttrGroup} />
          <div className="flex items-end">
            <button
              type="button"
              disabled={document === null || !attrKey.trim()}
              onClick={() => {
                if (editingAttributeId !== null) {
                  const existing = document?.attributes.find(
                    (item) => item.id === editingAttributeId,
                  );
                  if (existing) {
                    onEditAttribute({
                      ...existing,
                      key: attrKey.trim(),
                      value: attrValue,
                      type: attrType,
                      group: attrGroup.trim() || 'specs',
                    });
                  }
                  setEditingAttributeId(null);
                } else {
                  onAddAttribute({
                    key: attrKey.trim(),
                    value: attrValue,
                    type: attrType,
                    group: attrGroup.trim() || 'specs',
                    order: (document?.attributes.length ?? 0) + 1,
                  });
                }
                setAttrKey('');
                setAttrValue('');
                setAttrGroup('specs');
                setAttrType('string');
              }}
              className="w-full rounded-[10px] border border-builder-navy px-3 py-2 text-sm font-medium text-builder-navy disabled:opacity-40"
            >
              {editingAttributeId !== null ? 'Save attribute' : 'Add attribute'}
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="metadata-events">
        <h3
          id="metadata-events"
          className="text-base font-semibold text-builder-ink"
        >
          Metadata Events
        </h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné události.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 10).map((event) => (
              <li
                key={event.eventId}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">{event.type}</span>
                <span className="mt-0.5 block text-builder-muted">
                  {event.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="block text-[13px] text-builder-muted">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm text-builder-ink"
      />
    </label>
  );
}
