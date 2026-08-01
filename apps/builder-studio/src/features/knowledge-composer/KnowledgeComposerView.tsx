import { useMemo, useState } from 'react';

import type { HousePackageEditSession } from '../house-package/housePackageEditSession';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import { KnowledgeCategoryCard } from './KnowledgeCategoryCard';
import { KnowledgeCategoryEditor } from './KnowledgeCategoryEditor';
import {
  buildKnowledgeDashboardModel,
  healthGlyph,
  healthLabel,
  searchKnowledgeCategories,
} from './knowledgeProjection';
import type { KnowledgeCategoryId } from './knowledgeCatalog';

type KnowledgeComposerViewProps = {
  readonly projectId: string;
  readonly projectName: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly onSnapshotChange: (next: HousePackageEditSnapshot) => void;
  readonly onNavigate: (nav: HousePackageNavId) => void;
};

/**
 * EPIC-BX-04 — Composer znalostí dashboard (facade over HP + Runtime defaults).
 */
export function KnowledgeComposerView({
  projectId,
  projectName,
  snapshot,
  session,
  onSnapshotChange,
  onNavigate,
}: KnowledgeComposerViewProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<KnowledgeCategoryId | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const model = useMemo(
    () => buildKnowledgeDashboardModel({ projectId, snapshot }),
    [projectId, snapshot, editorOpen],
  );

  const visible = useMemo(
    () => searchKnowledgeCategories(model.categories, query),
    [model.categories, query],
  );

  const selected =
    selectedId === null
      ? null
      : (model.categories.find((item) => item.id === selectedId) ?? null);

  return (
    <div className="space-y-6" data-testid="knowledge-composer">
      <header className="rounded-[16px] border border-[#E3E3E3] bg-white p-6 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Znalosti
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-builder-ink">
          Composer znalostí
        </h1>
        <p className="mt-1 text-sm text-builder-muted">
          {projectName} — strukturovaná znalost objektu ze stejných dat jako
          Runtime.
        </p>

        <div className="mt-5 grid gap-3 tablet:grid-cols-4">
          <Stat label="Kompletní" value={String(model.completeCount)} tone="ok" />
          <Stat label="Doplnit" value={String(model.partialCount)} tone="warn" />
          <Stat label="Chybí" value={String(model.missingCount)} tone="warn" />
          <Stat
            label="Poslední změna"
            value={model.lastChangedLabel}
            tone="neutral"
          />
        </div>

        <label className="mt-5 block text-sm">
          <span className="mb-1.5 block font-medium text-builder-ink">
            Hledat ve znalostech
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kategorie, pole nebo hodnota…"
            className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          />
        </label>
      </header>

      <section className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
        {visible.map((category) => (
          <KnowledgeCategoryCard
            key={category.id}
            category={category}
            selected={category.id === selectedId}
            onOpen={() => {
              setSelectedId(category.id);
              setEditorOpen(true);
            }}
          />
        ))}
      </section>

      {visible.length === 0 && (
        <p className="rounded-[14px] border border-[#E3E3E3] bg-white px-4 py-6 text-sm text-builder-muted">
          Žádná oblast neodpovídá hledání.
        </p>
      )}

      {selected !== null && (
        <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-builder-ink">
                {selected.label}
              </h2>
              <p className="mt-1 text-sm text-builder-muted">
                {healthGlyph(selected.health)} {healthLabel(selected.health)} ·{' '}
                {selected.itemCount} položek
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              className="rounded-[10px] border border-builder-blue bg-builder-blue px-3 py-2 text-sm font-medium text-white"
            >
              Upravit
            </button>
          </div>
          <dl className="mt-4 grid gap-2 tablet:grid-cols-2">
            {selected.fields.slice(0, 6).map((item) => (
              <div
                key={item.key}
                className="rounded-[10px] border border-[#E3E3E3] bg-builder-canvas px-3 py-2 text-sm"
              >
                <dt className="text-builder-muted">{item.label}</dt>
                <dd className="mt-0.5 font-medium text-builder-ink">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {editorOpen && selected !== null && (
        <KnowledgeCategoryEditor
          category={selected}
          projectId={projectId}
          snapshot={snapshot}
          session={session}
          onClose={() => setEditorOpen(false)}
          onSnapshotChange={(next) => {
            onSnapshotChange(next);
          }}
          onOpenHpNav={(nav) => {
            setEditorOpen(false);
            onNavigate(nav);
          }}
          onOpenExperience={() => {
            setEditorOpen(false);
            onNavigate('experience');
          }}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone: 'ok' | 'warn' | 'neutral';
}) {
  const className =
    tone === 'ok'
      ? 'bg-builder-successBg text-builder-success'
      : tone === 'warn'
        ? 'bg-builder-draftBg text-builder-draft'
        : 'bg-builder-canvas text-builder-ink';
  return (
    <div className={`rounded-[12px] px-3.5 py-3 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.06em] opacity-80">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

// re-export type for editor open state
export type { KnowledgeCategoryId } from './knowledgeCatalog';
