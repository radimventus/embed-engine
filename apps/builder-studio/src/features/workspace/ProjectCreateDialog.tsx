import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import {
  OBJECT_TYPE_OPTIONS,
  type CreateWorkspaceProjectInput,
  type WorkspaceCompany,
} from './workspaceRegistry';

type ProjectCreateDialogProps = {
  readonly open: boolean;
  readonly companies: readonly WorkspaceCompany[];
  readonly busy: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (input: CreateWorkspaceProjectInput) => void;
};

/**
 * EPIC-BX-01 — Nový projekt (metadata only; content root from object type).
 */
export function ProjectCreateDialog({
  open,
  companies,
  busy,
  onClose,
  onSubmit,
}: ProjectCreateDialogProps) {
  const titleId = useId();
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '__new__');
  const [companyName, setCompanyName] = useState('');
  const [objectType, setObjectType] = useState(
    OBJECT_TYPE_OPTIONS[0]?.id ?? 'villa',
  );
  const [description, setDescription] = useState('');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setName('');
    setCompanyId(companies[0]?.id ?? '__new__');
    setCompanyName('');
    setObjectType(OBJECT_TYPE_OPTIONS[0]?.id ?? 'villa');
    setDescription('');
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open, companies]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      companyId,
      companyName: companyId === '__new__' ? companyName : undefined,
      objectType,
      description,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#23334C]/35 px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-[16px] border border-builder-line bg-white p-6 shadow-[0_20px_48px_rgba(35,51,76,0.18)]"
      >
        <h2 id={titleId} className="text-xl font-semibold text-builder-ink">
          Nový projekt
        </h2>
        <p className="mt-1 text-sm text-builder-muted">
          Projekt patří firmě ve Workspace. Typ objektu určí výchozí obsah.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Název projektu">
            <input
              ref={firstFieldRef}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
              placeholder="např. Harmony 140"
            />
          </Field>

          <Field label="Firma">
            <select
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
              <option value="__new__">＋ Nová firma…</option>
            </select>
          </Field>

          {companyId === '__new__' && (
            <Field label="Název nové firmy">
              <input
                required
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
                placeholder="např. AC Modular"
              />
            </Field>
          )}

          <Field label="Typ objektu">
            <select
              value={objectType}
              onChange={(event) => setObjectType(event.target.value)}
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
            >
              {OBJECT_TYPE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Popis">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
              placeholder="Krátký popis projektu"
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {busy ? 'Zakládám…' : 'Založit projekt'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-builder-ink">{label}</span>
      {children}
    </label>
  );
}
