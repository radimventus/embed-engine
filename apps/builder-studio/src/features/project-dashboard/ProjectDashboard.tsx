import { HOUSE_PACKAGE_URL_ROOT } from '../house-package/housePackagePaths';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import {
  toneGlyph,
  type ProjectDashboardModel,
  type ReadinessTone,
} from './projectDashboardModel';

type ProjectDashboardProps = {
  readonly model: ProjectDashboardModel;
  readonly onNavigate: (nav: HousePackageNavId) => void;
  readonly onEditProject: () => void;
  readonly onPublish: () => void;
  readonly historyOpen?: boolean;
};

/**
 * EPIC-BX-02 — project home: status, readiness, stats, next steps.
 */
export function ProjectDashboard({
  model,
  onNavigate,
  onEditProject,
  onPublish,
  historyOpen = false,
}: ProjectDashboardProps) {
  const heroUrl =
    model.heroPath !== null
      ? `${HOUSE_PACKAGE_URL_ROOT}/${model.heroPath}`
      : null;

  return (
    <div className="space-y-6" data-testid="project-dashboard">
      <header className="overflow-hidden rounded-[18px] border border-[#E8EEF5] bg-white shadow-sm">
        <div className="grid gap-0 desktop:grid-cols-[1.2fr_1fr]">
          <div className="relative min-h-[200px] bg-builder-soft">
            {heroUrl !== null ? (
              <img
                src={heroUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#EEF4FF] via-[#F5F7FB] to-[#E6ECF3]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#23334C]/55 to-transparent" />
            <div className="relative flex h-full min-h-[200px] flex-col justify-end p-6 text-white">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-sm font-bold text-builder-navy">
                {model.companyInitials}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {model.projectName}
              </h1>
              <p className="mt-1 text-sm text-white/85">{model.companyName}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
                  Stav projektu
                </p>
                <p className="mt-1 text-xl font-semibold text-builder-ink">
                  {model.readinessStateLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={onEditProject}
                className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium text-builder-ink"
              >
                Upravit projekt
              </button>
            </div>

            <dl className="grid gap-4 tablet:grid-cols-3">
              <StatusCell
                label={model.publishHeadline.label}
                value={model.publishHeadline.version ?? '—'}
              />
              <StatusCell label="Poslední změna" value={model.lastChangedLabel} />
              <StatusCell label="Stav" value={model.readinessStateLabel} />
            </dl>
          </div>
        </div>
      </header>

      <section className="grid gap-4 desktop:grid-cols-[1.1fr_0.9fr]">
        <ReadinessCenter
          items={model.readiness}
          onNavigate={onNavigate}
        />
        <ProjectStats model={model} />
      </section>

      <section className="grid gap-4 desktop:grid-cols-2">
        <LastPublicationCard
          model={model}
          highlighted={historyOpen}
        />
        <QuickActions
          onNavigate={onNavigate}
          onPublish={onPublish}
        />
      </section>
    </div>
  );
}

function StatusCell({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#E8EEF5] bg-builder-canvas px-3.5 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-builder-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-builder-ink">{value}</dd>
    </div>
  );
}

function ReadinessCenter({
  items,
  onNavigate,
}: {
  readonly items: ProjectDashboardModel['readiness'];
  readonly onNavigate: (nav: HousePackageNavId) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-builder-ink">Připravenost</h2>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onNavigate(item.nav)}
              className="flex w-full items-center gap-3 rounded-[12px] border border-[#E8EEF5] bg-builder-canvas px-3.5 py-2.5 text-left text-sm hover:border-builder-navy/25"
            >
              <span aria-hidden className={toneTextClass(item.tone)}>
                {toneGlyph(item.tone)}
              </span>
              <span className="font-medium text-builder-ink">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectStats({ model }: { readonly model: ProjectDashboardModel }) {
  const rows = [
    { label: 'místností', value: model.stats.rooms },
    { label: 'fotografií', value: model.stats.photos },
    { label: 'video', value: model.stats.videos },
    { label: 'SVG', value: model.stats.svgPlans },
    {
      label: 'moduly Experience',
      value: model.stats.experienceModules,
    },
  ] as const;

  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-builder-ink">
        Statistiky projektu
      </h2>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between border-b border-builder-divider pb-2 text-sm"
          >
            <span className="font-semibold text-builder-ink">{row.value}</span>
            <span className="text-builder-muted">{row.label}</span>
          </li>
        ))}
      </ul>
      <p
        className={`mt-4 rounded-[10px] px-3 py-2 text-sm font-semibold ${
          model.stats.validationLabel.includes('PASS')
            ? 'bg-builder-successBg text-builder-success'
            : model.stats.validationLabel.includes('WARNING')
              ? 'bg-builder-panel text-builder-navy'
              : 'bg-builder-draftBg text-builder-draft'
        }`}
      >
        {model.stats.validationLabel}
      </p>
    </section>
  );
}

function LastPublicationCard({
  model,
  highlighted,
}: {
  readonly model: ProjectDashboardModel;
  readonly highlighted: boolean;
}) {
  return (
    <section
      id="project-publication-history"
      className={`rounded-[16px] border bg-white p-5 shadow-sm ${
        highlighted
          ? 'border-builder-navy ring-2 ring-builder-navy/15'
          : 'border-[#E8EEF5]'
      }`}
    >
      <h2 className="text-base font-semibold text-builder-ink">
        Poslední publikace
      </h2>
      {model.lastPublication === null ? (
        <p className="mt-3 text-sm text-builder-muted">
          V této session ještě neproběhla publikace. Historie je zatím
          read-only.
        </p>
      ) : (
        <dl className="mt-3 space-y-2 text-sm">
          <HistoryRow label="Verze" value={model.lastPublication.version} />
          <HistoryRow
            label="Fingerprint"
            value={model.lastPublication.fingerprint}
            mono
          />
          <HistoryRow label="Datum" value={model.lastPublication.dateLabel} />
          <HistoryRow label="Autor" value={model.lastPublication.author} />
        </dl>
      )}
    </section>
  );
}

function QuickActions({
  onNavigate,
  onPublish,
}: {
  readonly onNavigate: (nav: HousePackageNavId) => void;
  readonly onPublish: () => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-builder-ink">
        Pokračovat v práci
      </h2>
      <ul className="mt-3 space-y-1.5">
        <QuickAction
          label="Upravit galerii"
          onClick={() => onNavigate('gallery')}
        />
        <QuickAction
          label="Upravit dispozice"
          onClick={() => onNavigate('rooms')}
        />
        <QuickAction
          label="Upravit Experience"
          onClick={() => onNavigate('experience')}
        />
        <QuickAction
          label="Upravit Knowledge"
          onClick={() => onNavigate('knowledge')}
        />
        <QuickAction
          label="Upravit Media"
          onClick={() => onNavigate('media-studio')}
        />
        <QuickAction label="Publikovat" onClick={onPublish} emphasis />
      </ul>
    </section>
  );
}

function QuickAction({
  label,
  onClick,
  emphasis = false,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly emphasis?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium ${
          emphasis
            ? 'bg-builder-navy text-white'
            : 'text-builder-navy hover:bg-builder-panel'
        }`}
      >
        <span aria-hidden>→</span>
        <span>{label}</span>
      </button>
    </li>
  );
}

function HistoryRow({
  label,
  value,
  mono = false,
}: {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-builder-divider pb-2">
      <dt className="text-builder-muted">{label}</dt>
      <dd
        className={`max-w-[70%] break-all text-right font-medium text-builder-ink ${
          mono ? 'font-mono text-[11px]' : 'text-sm'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function toneTextClass(tone: ReadinessTone): string {
  if (tone === 'ok') return 'text-builder-success';
  if (tone === 'warn') return 'text-builder-draft';
  return 'text-builder-muted';
}
