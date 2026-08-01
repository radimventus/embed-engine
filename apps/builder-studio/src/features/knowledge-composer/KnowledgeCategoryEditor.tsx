import { useEffect, useState, type FormEvent } from 'react';
import { parseCsv } from '@embed-engine/object-house/builder-package';

import {
  AiAuthorSuggestButton,
  proposeFaqAnswers,
  proposeFaqQuestions,
  proposeKnowledgeFill,
  type FaqProposalPayload,
  type KnowledgeFillPayload,
} from '../ai-author';
import type { HousePackageEditSession } from '../house-package/housePackageEditSession';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import {
  loadExperienceComposition,
  persistExperienceComposition,
} from '../experience-composer/experienceComposerStorage';
import { updateModuleConfig } from '../experience-composer/experienceComposition';
import {
  healthGlyph,
  healthLabel,
  listRoomRows,
  type KnowledgeCategoryView,
} from './knowledgeProjection';

type KnowledgeCategoryEditorProps = {
  readonly category: KnowledgeCategoryView;
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly onClose: () => void;
  readonly onSnapshotChange: (next: HousePackageEditSnapshot) => void;
  readonly onOpenHpNav: (nav: 'rooms' | 'gallery' | 'videos' | 'media' | 'plans') => void;
  readonly onOpenExperience: () => void;
};

/**
 * EPIC-BX-04 — structured Knowledge editor over existing sources only.
 */
export function KnowledgeCategoryEditor({
  category,
  projectId,
  snapshot,
  session,
  onClose,
  onSnapshotChange,
  onOpenHpNav,
  onOpenExperience,
}: KnowledgeCategoryEditorProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#23334C]/35 px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={category.label}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[16px] border border-builder-line bg-white p-6 shadow-[0_20px_48px_rgba(35,51,76,0.18)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
              Znalosti
            </p>
            <h2 className="mt-1 text-xl font-semibold text-builder-ink">
              {category.label}
            </h2>
            <p className="mt-1 text-sm text-builder-muted">
              {category.description}
            </p>
            <p className="mt-2 text-sm font-semibold text-builder-ink">
              {healthGlyph(category.health)} {healthLabel(category.health)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-[#DDE5EF] px-3 py-1.5 text-sm"
          >
            Zavřít
          </button>
        </div>

        <div className="mt-4 rounded-[12px] border border-[#E8EEF5] bg-builder-canvas px-3 py-3 text-[12px] text-builder-muted">
          Používá: {category.dependencies.join(' · ')}
        </div>

        <div className="mt-5">
          {category.editTarget.kind === 'inline-rooms' &&
            snapshot !== null &&
            session !== null && (
              <RoomsStructuredEditor
                snapshot={snapshot}
                session={session}
                onChange={onSnapshotChange}
                onOpenFull={() => onOpenHpNav('rooms')}
              />
            )}

          {category.editTarget.kind === 'inline-faq' && (
            <FaqStructuredEditor
              projectId={projectId}
              projectName={category.label}
              heroPath={snapshot?.working.heroRelativePath}
              onOpenExperience={onOpenExperience}
            />
          )}

          {(category.editTarget.kind === 'inline-readonly' ||
            category.editTarget.kind === 'hp') && (
            <ReadonlyStructuredFields
              category={category}
              projectId={projectId}
              heroPath={snapshot?.working.heroRelativePath}
              onOpenHp={
                category.editTarget.kind === 'hp'
                  ? () => {
                      const target = category.editTarget;
                      if (target.kind === 'hp') {
                        onOpenHpNav(target.nav);
                      }
                    }
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ReadonlyStructuredFields({
  category,
  projectId,
  heroPath,
  onOpenHp,
}: {
  readonly category: KnowledgeCategoryView;
  readonly projectId: string;
  readonly heroPath?: string;
  readonly onOpenHp?: () => void;
}) {
  return (
    <div className="space-y-3">
      <AiAuthorSuggestButton
        projectId={projectId}
        domain="knowledge"
        label="Doplnit"
        buildProposal={() => proposeKnowledgeFill(category)}
        onAccept={(payload) => {
          const data = payload as KnowledgeFillPayload;
          const composition = loadExperienceComposition(projectId, heroPath);
          const next = updateModuleConfig(composition, 'faq', {
            items: [...composition.configs.faq.items, data.suggestedFaq],
          });
          persistExperienceComposition(next);
        }}
      />
      {category.fields.map((item) => (
        <label key={item.key} className="block text-sm">
          <span className="mb-1.5 block font-medium text-builder-ink">
            {item.label}
          </span>
          <input
            readOnly
            value={item.value}
            className="w-full rounded-[10px] border border-[#DDE5EF] bg-builder-canvas px-3 py-2 text-sm text-builder-ink"
          />
        </label>
      ))}
      <p className="text-[12px] text-builder-muted">
        Tato oblast čte stejná data jako Runtime (House Package + projection
        defaults). ✨ Doplnit navrhne FAQ z existující Knowledge — bez nového
        store.
      </p>
      {onOpenHp !== undefined && (
        <button
          type="button"
          onClick={onOpenHp}
          className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white"
        >
          Otevřít související obsah
        </button>
      )}
    </div>
  );
}

function RoomsStructuredEditor({
  snapshot,
  session,
  onChange,
  onOpenFull,
}: {
  readonly snapshot: HousePackageEditSnapshot;
  readonly session: HousePackageEditSession;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onOpenFull: () => void;
}) {
  const [rows, setRows] = useState(() => [...listRoomRows(snapshot)]);

  useEffect(() => {
    setRows([...listRoomRows(snapshot)]);
  }, [snapshot]);

  const save = (event: FormEvent) => {
    event.preventDefault();
    const header = 'floor,room,name,area';
    const body = rows
      .map(
        (row) =>
          `${escapeCsv(row.floor)},${escapeCsv(row.room)},${escapeCsv(row.name)},${escapeCsv(row.area)}`,
      )
      .join('\n');
    onChange(session.setRoomsCsv(`${header}\n${body}\n`));
  };

  return (
    <form className="space-y-4" onSubmit={save}>
      <p className="text-sm text-builder-muted">
        Strukturovaná editace <span className="font-medium">rooms.csv</span> —
        stejný HP-002 SSOT, který používá Runtime.
      </p>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={`${row.room}-${index}`}
            className="grid gap-2 rounded-[12px] border border-[#E8EEF5] p-3 tablet:grid-cols-4"
          >
            <Field
              label="Podlaží"
              value={row.floor}
              onChange={(value) =>
                setRows((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, floor: value } : item,
                  ),
                )
              }
            />
            <Field
              label="ID místnosti"
              value={row.room}
              onChange={(value) =>
                setRows((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, room: value } : item,
                  ),
                )
              }
            />
            <Field
              label="Název"
              value={row.name}
              onChange={(value) =>
                setRows((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, name: value } : item,
                  ),
                )
              }
            />
            <Field
              label="Plocha"
              value={row.area}
              onChange={(value) =>
                setRows((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, area: value } : item,
                  ),
                )
              }
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          onClick={() =>
            setRows((prev) => [
              ...prev,
              { floor: 'p1', room: 'new-room', name: 'Nová místnost', area: '0' },
            ])
          }
        >
          Přidat místnost
        </button>
        <button
          type="submit"
          className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white"
        >
          Uložit do projektu
        </button>
        <button
          type="button"
          onClick={onOpenFull}
          className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
        >
          Otevřít Rooms
        </button>
      </div>
      <details className="text-[12px] text-builder-muted">
        <summary>Raw preview</summary>
        <pre className="mt-2 overflow-auto rounded-lg bg-builder-canvas p-3 font-mono text-[11px]">
          {parseCsv(snapshot.working.roomsCsv).rows.length} řádků v session
        </pre>
      </details>
    </form>
  );
}

function FaqStructuredEditor({
  projectId,
  projectName,
  heroPath,
  onOpenExperience,
}: {
  readonly projectId: string;
  readonly projectName: string;
  readonly heroPath?: string;
  readonly onOpenExperience: () => void;
}) {
  const composition = loadExperienceComposition(projectId, heroPath);
  const [items, setItems] = useState(() => [...composition.configs.faq.items]);

  const save = (event: FormEvent) => {
    event.preventDefault();
    const next = updateModuleConfig(composition, 'faq', { items });
    persistExperienceComposition(next);
  };

  return (
    <form className="space-y-4" onSubmit={save}>
      <p className="text-sm text-builder-muted">
        FAQ je prezentace Experience Composeru — ne nový Knowledge model. Runtime
        Decision FAQ vychází z Priority / Terminal; toto je authoring vrstva.
      </p>
      <div className="flex flex-wrap gap-2">
        <AiAuthorSuggestButton
          projectId={projectId}
          domain="faq"
          label="Navrhnout další otázky"
          buildProposal={() =>
            proposeFaqQuestions({ existing: items, projectName })
          }
          onAccept={(payload) => {
            const data = payload as FaqProposalPayload;
            setItems([...items, ...data.items]);
          }}
        />
        <AiAuthorSuggestButton
          projectId={projectId}
          domain="faq"
          label="Navrhnout odpovědi"
          buildProposal={() => proposeFaqAnswers({ existing: items })}
          onAccept={(payload) => {
            const data = payload as FaqProposalPayload;
            setItems([...data.items]);
          }}
        />
      </div>
      {items.map((item, index) => (
        <div
          key={`faq-${index}`}
          className="space-y-2 rounded-[12px] border border-[#E8EEF5] p-3"
        >
          <Field
            label="Otázka"
            value={item.question}
            onChange={(value) =>
              setItems((prev) =>
                prev.map((row, i) =>
                  i === index ? { ...row, question: value } : row,
                ),
              )
            }
          />
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-builder-ink">
              Odpověď
            </span>
            <textarea
              className="min-h-20 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
              value={item.answer}
              onChange={(event) =>
                setItems((prev) =>
                  prev.map((row, i) =>
                    i === index
                      ? { ...row, answer: event.target.value }
                      : row,
                  ),
                )
              }
            />
          </label>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              { question: 'Nová otázka', answer: '' },
            ])
          }
        >
          Přidat otázku
        </button>
        <button
          type="submit"
          className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white"
        >
          Uložit FAQ
        </button>
        <button
          type="button"
          onClick={onOpenExperience}
          className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
        >
          Otevřít Experience
        </button>
      </div>
    </form>
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
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-builder-ink">{label}</span>
      <input
        className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
