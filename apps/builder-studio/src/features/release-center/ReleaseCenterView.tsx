import { useEffect, useMemo, useState, type FormEvent } from 'react';

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageReleaseSummary } from '../house-package/productionPublishGate';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import { buildReleaseCenterModel } from './releaseCenterModel';
import {
  appendReleaseRecord,
  clearReleaseNotesDraft,
  loadReleaseNotesDraft,
  rollbackToRelease,
  saveReleaseNotesDraft,
} from './releaseHistoryStorage';
import {
  captureReleaseProductSnapshot,
  emptyReleaseNotesDraft,
  type ReleaseNotesDraft,
  type ReleaseRecord,
} from './releaseRecord';
import type { ReleaseReadinessTone } from './releaseReadiness';

type ReleaseCenterViewProps = {
  readonly projectId: string;
  readonly projectName: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly publishing: boolean;
  readonly publishError: string | null;
  readonly onPublish: () => Promise<HousePackageReleaseSummary | null>;
  readonly onNavigate: (nav: HousePackageNavId) => void;
};

/**
 * EPIC-BX-07 — Release Center orchestrates existing publish; history/notes are metadata.
 */
export function ReleaseCenterView({
  projectId,
  projectName,
  snapshot,
  validationReport,
  releaseSummary,
  publishing,
  publishError,
  onPublish,
  onNavigate,
}: ReleaseCenterViewProps) {
  const [notes, setNotes] = useState<ReleaseNotesDraft>(() =>
    loadReleaseNotesDraft(projectId),
  );
  const [historyTick, setHistoryTick] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareLeftId, setCompareLeftId] = useState<string | null>(null);
  const [compareRightId, setCompareRightId] = useState<string | null>(null);
  const [rollbackId, setRollbackId] = useState<string | null>(null);
  const [publishBusy, setPublishBusy] = useState(false);

  useEffect(() => {
    setNotes(loadReleaseNotesDraft(projectId));
    setHistoryTick((value) => value + 1);
  }, [projectId]);

  const model = useMemo(
    () =>
      buildReleaseCenterModel({
        projectId,
        snapshot,
        validationReport,
        releaseSummary,
        notesDraft: notes,
        compareLeftId,
        compareRightId,
        historyTick,
      }),
    [
      projectId,
      snapshot,
      validationReport,
      releaseSummary,
      notes,
      compareLeftId,
      compareRightId,
      historyTick,
    ],
  );

  const selected =
    model.history.find((item) => item.id === selectedId) ??
    model.current ??
    null;

  const handleSaveNotes = (event: FormEvent) => {
    event.preventDefault();
    const saved = saveReleaseNotesDraft(projectId, notes);
    setNotes(saved);
  };

  const handlePublish = async () => {
    setPublishBusy(true);
    try {
      const summary = await onPublish();
      if (summary === null) {
        return;
      }
      const record = appendReleaseRecord({
        projectId,
        summary,
        notes,
        product: captureReleaseProductSnapshot({ projectId, snapshot }),
        qa: model.readiness.qa,
      });
      clearReleaseNotesDraft(projectId);
      setNotes(emptyReleaseNotesDraft());
      setSelectedId(record.id);
      setCompareRightId(record.id);
      if (model.history[0] !== undefined) {
        setCompareLeftId(model.history[0].id);
      }
      setHistoryTick((value) => value + 1);
    } finally {
      setPublishBusy(false);
    }
  };

  const confirmRollback = () => {
    if (rollbackId === null) {
      return;
    }
    const activated = rollbackToRelease(projectId, rollbackId);
    if (activated !== null) {
      setSelectedId(activated.id);
      setHistoryTick((value) => value + 1);
    }
    setRollbackId(null);
  };

  return (
    <div className="space-y-5" data-testid="release-center">
      <header className="rounded-[16px] border border-[#E8EEF5] bg-white p-6 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Release
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-builder-ink">
          Release Center
        </h1>
        <p className="mt-1 text-sm text-builder-muted">
          {projectName} — řízení verzí objektu (existující publish · release
          metadata).
        </p>
      </header>

      <div className="grid gap-4 desktop:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <CurrentReleaseCard
          current={model.current}
          sessionSummary={model.sessionSummary}
        />
        <ReleaseReadinessCard
          model={model}
          onNavigate={onNavigate}
          onPublish={() => {
            void handlePublish();
          }}
          publishing={publishing || publishBusy}
          publishError={publishError}
        />
      </div>

      <div className="grid gap-4 desktop:grid-cols-2">
        <ReleaseNotesEditor
          notes={notes}
          onChange={setNotes}
          onSave={handleSaveNotes}
        />
        <PreparedChangesCard changes={model.preparedChanges} />
      </div>

      <ReleaseHistoryTable
        history={model.history}
        selectedId={selected?.id ?? null}
        onSelect={(id) => {
          setSelectedId(id);
          if (compareLeftId === null) {
            setCompareLeftId(id);
          } else if (compareRightId === null && id !== compareLeftId) {
            setCompareRightId(id);
          }
        }}
        onRollback={(id) => setRollbackId(id)}
      />

      {selected !== null && <ReleaseDetailCard release={selected} />}

      <CompareReleasesPanel
        history={model.history}
        leftId={compareLeftId}
        rightId={compareRightId}
        compare={model.compare}
        onLeft={setCompareLeftId}
        onRight={setCompareRightId}
      />

      {rollbackId !== null && (
        <RollbackDialog
          release={model.history.find((item) => item.id === rollbackId) ?? null}
          onCancel={() => setRollbackId(null)}
          onConfirm={confirmRollback}
        />
      )}
    </div>
  );
}

function CurrentReleaseCard({
  current,
  sessionSummary,
}: {
  readonly current: ReleaseRecord | null;
  readonly sessionSummary: HousePackageReleaseSummary | null;
}) {
  const version = current?.version ?? sessionSummary?.housePackageVersion;
  const fingerprint =
    current?.fingerprint ?? sessionSummary?.buildFingerprint ?? null;
  const releasedAt =
    current?.releasedAt ?? sessionSummary?.releaseTimestamp ?? null;

  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Current Release
      </p>
      {version === undefined ? (
        <p className="mt-3 text-sm text-builder-muted">
          Zatím žádná publikace — po Publish se zde objeví aktivní verze.
        </p>
      ) : (
        <dl className="mt-4 grid gap-3 tablet:grid-cols-2">
          <Meta label="Version" value={`v${version}`} />
          <Meta
            label="Datum"
            value={
              releasedAt !== null
                ? new Date(releasedAt).toLocaleString('cs-CZ')
                : '—'
            }
          />
          <Meta label="Autor" value={current?.author ?? 'uživatel'} />
          <Meta
            label="Fingerprint"
            value={fingerprint !== null ? shorten(fingerprint) : '—'}
          />
          <Meta
            label="Validation"
            value={current?.validationStatus ?? '—'}
          />
          <Meta
            label="Decision QA"
            value={current?.decisionQaLabel ?? '—'}
          />
        </dl>
      )}
    </section>
  );
}

function ReleaseReadinessCard({
  model,
  onNavigate,
  onPublish,
  publishing,
  publishError,
}: {
  readonly model: ReturnType<typeof buildReleaseCenterModel>;
  readonly onNavigate: (nav: HousePackageNavId) => void;
  readonly onPublish: () => void;
  readonly publishing: boolean;
  readonly publishError: string | null;
}) {
  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Release Readiness
      </p>
      <ul className="mt-3 space-y-1.5">
        {model.readiness.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onNavigate(item.nav)}
              className="flex w-full items-start gap-2 rounded-[10px] border border-[#E8EEF5] bg-builder-canvas px-3 py-2 text-left"
            >
              <span className="text-sm font-semibold">{mark(item.tone)}</span>
              <span>
                <span className="block text-sm font-medium text-builder-ink">
                  {item.label}
                </span>
                <span className="text-[11px] text-builder-muted">
                  {item.detail}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div
        className={`mt-4 rounded-[12px] border px-4 py-3 ${
          model.readyToRelease
            ? 'border-builder-success/30 bg-builder-success/5'
            : 'border-[#E8EEF5] bg-builder-canvas'
        }`}
      >
        <p className="text-sm font-semibold text-builder-ink">
          {model.readyToRelease ? 'Ready to Release' : 'Not ready'}
        </p>
        <p className="mt-1 text-[12px] text-builder-muted">
          Publish zůstává jeden — Release Center pouze orchestrace.
        </p>
      </div>
      <button
        type="button"
        disabled={publishing || !model.readyToRelease}
        onClick={onPublish}
        className="mt-3 w-full rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {publishing ? 'Publikuji…' : 'Publish'}
      </button>
      {publishError !== null && (
        <p className="mt-2 text-sm text-builder-draft">{publishError}</p>
      )}
    </section>
  );
}

function ReleaseNotesEditor({
  notes,
  onChange,
  onSave,
}: {
  readonly notes: ReleaseNotesDraft;
  readonly onChange: (notes: ReleaseNotesDraft) => void;
  readonly onSave: (event: FormEvent) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Release Notes
      </p>
      <p className="mt-1 text-sm text-builder-muted">
        Metadata vydání — nejsou součástí HP-002.
      </p>
      <form className="mt-4 space-y-3" onSubmit={onSave}>
        <NoteField
          label="Co se změnilo"
          value={notes.changed}
          onChange={(value) => onChange({ ...notes, changed: value })}
        />
        <NoteField
          label="Proč"
          value={notes.why}
          onChange={(value) => onChange({ ...notes, why: value })}
        />
        <NoteField
          label="Interní poznámka"
          value={notes.internal}
          onChange={(value) => onChange({ ...notes, internal: value })}
        />
        <button
          type="submit"
          className="rounded-[10px] border border-[#DDE5EF] bg-white px-4 py-2 text-sm font-medium text-builder-ink"
        >
          Uložit poznámky
        </button>
      </form>
    </section>
  );
}

function PreparedChangesCard({
  changes,
}: {
  readonly changes: ReturnType<typeof buildReleaseCenterModel>['preparedChanges'];
}) {
  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Připravené změny
      </p>
      <ul className="mt-3 space-y-1.5">
        {changes.map((change) => (
          <li
            key={change.id}
            className="rounded-[10px] border border-[#E8EEF5] bg-builder-canvas px-3 py-2 text-sm text-builder-ink"
          >
            {change.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReleaseHistoryTable({
  history,
  selectedId,
  onSelect,
  onRollback,
}: {
  readonly history: readonly ReleaseRecord[];
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onRollback: (id: string) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Release History
      </p>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-builder-muted">
          Historie je prázdná — po úspěšném Publish se zde objeví záznamy.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.06em] text-builder-muted">
              <tr>
                <th className="pb-2 pr-3 font-medium">Verze</th>
                <th className="pb-2 pr-3 font-medium">Datum</th>
                <th className="pb-2 pr-3 font-medium">Autor</th>
                <th className="pb-2 pr-3 font-medium">Stav</th>
                <th className="pb-2 pr-3 font-medium">Poznámka</th>
                <th className="pb-2 font-medium">Akce</th>
              </tr>
            </thead>
            <tbody>
              {history.map((release) => {
                const selected = release.id === selectedId;
                return (
                  <tr
                    key={release.id}
                    className={`border-t border-[#E8EEF5] ${
                      selected ? 'bg-builder-panel' : ''
                    }`}
                  >
                    <td className="py-2.5 pr-3">
                      <button
                        type="button"
                        className="font-semibold text-builder-navy"
                        onClick={() => onSelect(release.id)}
                      >
                        v{release.version}
                      </button>
                    </td>
                    <td className="py-2.5 pr-3 text-builder-muted">
                      {new Date(release.releasedAt).toLocaleString('cs-CZ')}
                    </td>
                    <td className="py-2.5 pr-3">{release.author}</td>
                    <td className="py-2.5 pr-3">{statusLabel(release.status)}</td>
                    <td className="py-2.5 pr-3 text-builder-muted">
                      {release.notes.changed || '—'}
                    </td>
                    <td className="py-2.5">
                      {release.status !== 'active' && (
                        <button
                          type="button"
                          className="text-[12px] font-medium text-builder-navy"
                          onClick={() => onRollback(release.id)}
                        >
                          Rollback
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ReleaseDetailCard({ release }: { readonly release: ReleaseRecord }) {
  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Detail vydání
      </p>
      <h2 className="mt-1 text-lg font-semibold text-builder-ink">
        v{release.version}
      </h2>
      <dl className="mt-4 grid gap-3 tablet:grid-cols-3">
        <Meta label="Fingerprint" value={shorten(release.fingerprint)} />
        <Meta label="Embed" value={release.embedVersion} />
        <Meta label="Stav" value={statusLabel(release.status)} />
        <Meta label="Co se změnilo" value={release.notes.changed || '—'} />
        <Meta label="Proč" value={release.notes.why || '—'} />
        <Meta label="Interní" value={release.notes.internal || '—'} />
      </dl>
      <p className="mt-3 text-[12px] text-builder-muted">
        Hero: {release.product.heroPath || '—'} · Gallery:{' '}
        {release.product.galleryFiles.length} · Experience:{' '}
        {release.product.experienceModules.join(', ') || '—'}
      </p>
    </section>
  );
}

function CompareReleasesPanel({
  history,
  leftId,
  rightId,
  compare,
  onLeft,
  onRight,
}: {
  readonly history: readonly ReleaseRecord[];
  readonly leftId: string | null;
  readonly rightId: string | null;
  readonly compare: ReturnType<typeof buildReleaseCenterModel>['compare'];
  readonly onLeft: (id: string) => void;
  readonly onRight: (id: string) => void;
}) {
  if (history.length < 2) {
    return (
      <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Compare Releases
        </p>
        <p className="mt-3 text-sm text-builder-muted">
          Pro porovnání jsou potřeba alespoň dvě vydání.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Compare Releases
      </p>
      <p className="mt-1 text-sm text-builder-muted">
        Diff produktu — média, Experience, Knowledge, Hero (ne soubory).
      </p>
      <div className="mt-4 grid gap-3 tablet:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-builder-ink">A</span>
          <select
            className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
            value={leftId ?? ''}
            onChange={(event) => onLeft(event.target.value)}
          >
            <option value="">Vyberte…</option>
            {history.map((release) => (
              <option key={release.id} value={release.id}>
                v{release.version} · {statusLabel(release.status)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-builder-ink">B</span>
          <select
            className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
            value={rightId ?? ''}
            onChange={(event) => onRight(event.target.value)}
          >
            <option value="">Vyberte…</option>
            {history.map((release) => (
              <option key={release.id} value={release.id}>
                v{release.version} · {statusLabel(release.status)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {compare !== null && (
        <ul className="mt-4 space-y-2">
          {compare.changes.map((change) => (
            <li
              key={change.area}
              className={`rounded-[10px] border px-3 py-2 text-sm ${
                change.changed
                  ? 'border-builder-navy/30 bg-builder-panel'
                  : 'border-[#E8EEF5] bg-builder-canvas'
              }`}
            >
              <span className="font-semibold text-builder-ink">
                {change.changed ? 'Δ ' : ''}
                {change.area}
              </span>
              <span className="mt-0.5 block text-builder-muted">
                {change.detail}
              </span>
            </li>
          ))}
          <li className="pt-1 text-[12px] text-builder-muted">
            {compare.changeCount} produktových změn
          </li>
        </ul>
      )}
    </section>
  );
}

function RollbackDialog({
  release,
  onCancel,
  onConfirm,
}: {
  readonly release: ReleaseRecord | null;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) {
  if (release === null) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-[16px] border border-[#E8EEF5] bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-builder-ink">Rollback</h2>
        <p className="mt-2 text-sm text-builder-muted">
          Aktivovat existující release <strong>v{release.version}</strong>?
          Neproběhne nový publish — pouze přepnutí aktivního vydání v Release
          Center.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2 text-sm"
            onClick={onCancel}
          >
            Zrušit
          </button>
          <button
            type="button"
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white"
            onClick={onConfirm}
          >
            Potvrdit Rollback
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteField({
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
      <textarea
        className="min-h-20 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Meta({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-builder-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-builder-ink break-all">
        {value}
      </dd>
    </div>
  );
}

function mark(tone: ReleaseReadinessTone): string {
  if (tone === 'pass') return '✔';
  if (tone === 'warn') return '⚠';
  return '✘';
}

function statusLabel(status: ReleaseRecord['status']): string {
  if (status === 'active') return 'Aktivní';
  if (status === 'rolled-back') return 'Rolled back';
  return 'Nahrazeno';
}

function shorten(value: string): string {
  return value.length > 42 ? `${value.slice(0, 40)}…` : value;
}
