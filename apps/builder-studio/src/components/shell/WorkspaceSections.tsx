import type { AssetCategoryId, AssetCollection } from '../../model';
import { AssetCard } from '../assets/AssetCard';

type WorkspaceSectionProps = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly collections: readonly AssetCollection[];
  readonly onAddAsset: (categoryId: AssetCategoryId) => void;
  readonly onRemoveAsset: (
    categoryId: AssetCategoryId,
    assetId: string,
  ) => void;
  readonly onUpdateMetadata: (
    categoryId: AssetCategoryId,
    assetId: string,
    patch: { readonly label: string },
  ) => void;
};

function WorkspaceSectionFrame({
  id,
  title,
  description,
  collections,
  onAddAsset,
  onRemoveAsset,
  onUpdateMetadata,
}: WorkspaceSectionProps) {
  return (
    <section id={id} className="mb-[60px]">
      <h3 className="mb-2 text-2xl font-semibold">{title}</h3>
      <p className="mb-6 text-builder-muted">{description}</p>
      {collections.map((collection) => (
        <AssetCard
          key={collection.categoryId}
          collection={collection}
          onUploadPlaceholder={() => onAddAsset(collection.categoryId)}
          onRemove={(assetId) =>
            onRemoveAsset(collection.categoryId, assetId)
          }
          onUpdateMetadata={(assetId, patch) =>
            onUpdateMetadata(collection.categoryId, assetId, patch)
          }
        />
      ))}
    </section>
  );
}

export function MediaSection(props: Omit<WorkspaceSectionProps, 'id' | 'title' | 'description'>) {
  return (
    <WorkspaceSectionFrame
      id="media"
      title="Média"
      description="Fotografie, video a hero objektu."
      {...props}
    />
  );
}

export function LayoutSection(props: Omit<WorkspaceSectionProps, 'id' | 'title' | 'description'>) {
  return (
    <WorkspaceSectionFrame
      id="layout"
      title="Dispozice"
      description="Podklady pro House Navigator."
      {...props}
    />
  );
}

export function KnowledgeSection(props: Omit<WorkspaceSectionProps, 'id' | 'title' | 'description'>) {
  return (
    <WorkspaceSectionFrame
      id="knowledge"
      title="Znalosti"
      description="Dokumenty spravované Builderem (bez Runtime interpretace)."
      {...props}
    />
  );
}
