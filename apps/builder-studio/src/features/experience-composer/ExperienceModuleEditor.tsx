import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

import {
  getModuleDefinition,
  type ExperienceComposition,
  type ExperienceModuleConfigs,
  type ExperienceModuleId,
} from './experienceComposition';

type ExperienceModuleEditorProps = {
  readonly moduleId: ExperienceModuleId;
  readonly composition: ExperienceComposition;
  readonly onClose: () => void;
  readonly onSave: <K extends ExperienceModuleId>(
    moduleId: K,
    config: ExperienceModuleConfigs[K],
  ) => void;
};

/**
 * EPIC-BX-03 — per-module configuration editor (authoring metadata).
 */
export function ExperienceModuleEditor({
  moduleId,
  composition,
  onClose,
  onSave,
}: ExperienceModuleEditorProps) {
  const definition = getModuleDefinition(moduleId);

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
        aria-label={`Upravit ${definition.label}`}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[16px] border border-builder-line bg-white p-6 shadow-[0_20px_48px_rgba(35,51,76,0.18)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
              Module Editor
            </p>
            <h2 className="mt-1 text-xl font-semibold text-builder-ink">
              {definition.label}
            </h2>
            <p className="mt-1 text-sm text-builder-muted">
              {definition.description}
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

        <div className="mt-5">
          {moduleId === 'hero' && (
            <HeroEditor
              value={composition.configs.hero}
              onCancel={onClose}
              onSave={(config) => {
                onSave('hero', config);
                onClose();
              }}
            />
          )}
          {moduleId === 'priority' && (
            <PriorityEditor
              value={composition.configs.priority}
              onCancel={onClose}
              onSave={(config) => {
                onSave('priority', config);
                onClose();
              }}
            />
          )}
          {moduleId === 'house-navigator' && (
            <HouseNavigatorEditor
              value={composition.configs['house-navigator']}
              onCancel={onClose}
              onSave={(config) => {
                onSave('house-navigator', config);
                onClose();
              }}
            />
          )}
          {moduleId === 'faq' && (
            <FaqEditor
              value={composition.configs.faq}
              onCancel={onClose}
              onSave={(config) => {
                onSave('faq', config);
                onClose();
              }}
            />
          )}
          {moduleId === 'ai-advisor' && (
            <AiAdvisorEditor
              value={composition.configs['ai-advisor']}
              onCancel={onClose}
              onSave={(config) => {
                onSave('ai-advisor', config);
                onClose();
              }}
            />
          )}
          {moduleId === 'lead-capture' && (
            <LeadCaptureEditor
              value={composition.configs['lead-capture']}
              onCancel={onClose}
              onSave={(config) => {
                onSave('lead-capture', config);
                onClose();
              }}
            />
          )}
        </div>
      </div>
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

function EditorActions({ onCancel }: { readonly onCancel: () => void }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-[10px] border border-[#DDE5EF] px-4 py-2 text-sm font-medium"
      >
        Zrušit
      </button>
      <button
        type="submit"
        className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white"
      >
        Uložit modul
      </button>
    </div>
  );
}

function HeroEditor({
  value,
  onCancel,
  onSave,
}: {
  readonly value: ExperienceModuleConfigs['hero'];
  readonly onCancel: () => void;
  readonly onSave: (config: ExperienceModuleConfigs['hero']) => void;
}) {
  const [title, setTitle] = useState(value.title);
  const [subtitle, setSubtitle] = useState(value.subtitle);
  const [cta, setCta] = useState(value.cta);
  const [imagePath, setImagePath] = useState(value.imagePath);

  useEffect(() => {
    setTitle(value.title);
    setSubtitle(value.subtitle);
    setCta(value.cta);
    setImagePath(value.imagePath);
  }, [value]);

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSave({ title, subtitle, cta, imagePath });
      }}
    >
      <Field label="Nadpis">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field label="Podnadpis">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
        />
      </Field>
      <Field label="CTA">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
          value={cta}
          onChange={(event) => setCta(event.target.value)}
        />
      </Field>
      <Field label="Hero obrázek (relativní cesta v projektu)">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 font-mono text-[12px]"
          value={imagePath}
          onChange={(event) => setImagePath(event.target.value)}
        />
      </Field>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function PriorityEditor({
  value,
  onCancel,
  onSave,
}: {
  readonly value: ExperienceModuleConfigs['priority'];
  readonly onCancel: () => void;
  readonly onSave: (config: ExperienceModuleConfigs['priority']) => void;
}) {
  const [enabled, setEnabled] = useState(value.enabled);
  const [orderText, setOrderText] = useState(value.priorityOrder.join(', '));
  const [intensitiesText, setIntensitiesText] = useState(
    JSON.stringify(value.intensities, null, 2),
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        let intensities = value.intensities;
        try {
          intensities = JSON.parse(intensitiesText) as Record<string, number>;
        } catch {
          // keep previous
        }
        onSave({
          enabled,
          priorityOrder: orderText
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          intensities,
        });
      }}
    >
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
        />
        Zapnuto
      </label>
      <Field label="Pořadí priorit (oddělené čárkou)">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 font-mono text-[12px]"
          value={orderText}
          onChange={(event) => setOrderText(event.target.value)}
        />
      </Field>
      <Field label="Intenzity (JSON)">
        <textarea
          className="min-h-32 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 font-mono text-[12px]"
          value={intensitiesText}
          onChange={(event) => setIntensitiesText(event.target.value)}
        />
      </Field>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function HouseNavigatorEditor({
  value,
  onCancel,
  onSave,
}: {
  readonly value: ExperienceModuleConfigs['house-navigator'];
  readonly onCancel: () => void;
  readonly onSave: (config: ExperienceModuleConfigs['house-navigator']) => void;
}) {
  const [defaultRoomHint, setDefaultRoomHint] = useState(value.defaultRoomHint);
  const [showFloorPlan, setShowFloorPlan] = useState(value.showFloorPlan);

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSave({ defaultRoomHint, showFloorPlan });
      }}
    >
      <Field label="Výchozí místnost">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
          value={defaultRoomHint}
          onChange={(event) => setDefaultRoomHint(event.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={showFloorPlan}
          onChange={(event) => setShowFloorPlan(event.target.checked)}
        />
        Zobrazit půdorys
      </label>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function FaqEditor({
  value,
  onCancel,
  onSave,
}: {
  readonly value: ExperienceModuleConfigs['faq'];
  readonly onCancel: () => void;
  readonly onSave: (config: ExperienceModuleConfigs['faq']) => void;
}) {
  const [text, setText] = useState(
    value.items
      .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join('\n\n'),
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        const blocks = text
          .split(/\n\s*\n/)
          .map((block) => block.trim())
          .filter(Boolean);
        const items = blocks.map((block) => {
          const lines = block.split('\n');
          const question = lines
            .find((line) => line.startsWith('Q:'))
            ?.replace(/^Q:\s*/, '') ?? '';
          const answer = lines
            .find((line) => line.startsWith('A:'))
            ?.replace(/^A:\s*/, '') ?? '';
          return { question, answer };
        });
        onSave({ items });
      }}
    >
      <Field label="Otázky a odpovědi (Q: / A: bloky)">
        <textarea
          className="min-h-56 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 font-mono text-[12px]"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </Field>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function AiAdvisorEditor({
  value,
  onCancel,
  onSave,
}: {
  readonly value: ExperienceModuleConfigs['ai-advisor'];
  readonly onCancel: () => void;
  readonly onSave: (config: ExperienceModuleConfigs['ai-advisor']) => void;
}) {
  const [prompt, setPrompt] = useState(value.prompt);
  const [tone, setTone] = useState(value.tone);

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSave({ prompt, tone });
      }}
    >
      <Field label="Prompt">
        <textarea
          className="min-h-28 w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
      </Field>
      <Field label="Tón komunikace">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
          value={tone}
          onChange={(event) => setTone(event.target.value)}
        />
      </Field>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function LeadCaptureEditor({
  value,
  onCancel,
  onSave,
}: {
  readonly value: ExperienceModuleConfigs['lead-capture'];
  readonly onCancel: () => void;
  readonly onSave: (config: ExperienceModuleConfigs['lead-capture']) => void;
}) {
  const [formLabel, setFormLabel] = useState(value.formLabel);
  const [cta, setCta] = useState(value.cta);
  const [nextAction, setNextAction] = useState(value.nextAction);

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSave({ formLabel, cta, nextAction });
      }}
    >
      <Field label="Formulář">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
          value={formLabel}
          onChange={(event) => setFormLabel(event.target.value)}
        />
      </Field>
      <Field label="CTA">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
          value={cta}
          onChange={(event) => setCta(event.target.value)}
        />
      </Field>
      <Field label="Následná akce">
        <input
          className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2"
          value={nextAction}
          onChange={(event) => setNextAction(event.target.value)}
        />
      </Field>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}
