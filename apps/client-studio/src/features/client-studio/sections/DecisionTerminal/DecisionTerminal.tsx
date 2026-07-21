import type { Experience } from '@embed-engine/core/experience';

import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';

export type DecisionTerminalProps = {
  experience: Experience;
};

const SEVERITY_CS = {
  low: 'nízká',
  medium: 'střední',
  high: 'vysoká',
} as const;

const LEVEL_CS = {
  low: 'nízká',
  medium: 'střední',
  high: 'vysoká',
} as const;

const ACTION_TYPE_CS = {
  primary: 'primární',
  secondary: 'sekundární',
} as const;

const ACTION_INTENT_CS = {
  explore: 'prozkoumat',
  compare: 'porovnat',
  contact: 'kontaktovat',
  calculate: 'spočítat',
} as const;

/**
 * Decision Terminal — pure Experience presentation.
 * Owns no Priority, Object, or interpretation logic.
 */
export function DecisionTerminal({ experience }: DecisionTerminalProps) {
  return (
    <aside
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} overflow-y-auto`}
      data-experience-id={experience.id}
      data-testid="decision-terminal"
      aria-label="Rozhodovací terminál"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Rozhodovací terminál
      </p>
      <p className="mt-2 text-sm font-medium text-embed-foreground-primary">
        {experience.title}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">
        {experience.summary}
      </p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Proč toto doporučení
      </p>
      <ul
        className="mt-1 list-disc space-y-2 pl-4 text-sm text-embed-foreground-primary/70"
        data-testid="decision-terminal-evidence"
      >
        {experience.evidence.map((item) => (
          <li key={item.id}>
            <span className="font-medium text-embed-foreground-primary">
              {item.title}
            </span>
            <span className="mt-0.5 block text-embed-foreground-primary/70">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Na co si dát pozor
      </p>
      <ul
        className="mt-1 list-disc space-y-2 pl-4 text-sm text-embed-foreground-primary/70"
        data-testid="decision-terminal-concerns"
      >
        {experience.concerns.map((item) => (
          <li key={item.id}>
            <span className="font-medium text-embed-foreground-primary">
              {item.title}
            </span>
            <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-embed-foreground-primary/45">
              {SEVERITY_CS[item.severity]}
            </span>
            <span className="mt-0.5 block text-embed-foreground-primary/70">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Míra jistoty doporučení
      </p>
      <div
        className="mt-1 space-y-1 text-sm text-embed-foreground-primary/70"
        data-testid="decision-terminal-confidence"
      >
        <p className="font-medium text-embed-foreground-primary">
          {LEVEL_CS[experience.confidence.level]} · {experience.confidence.score}
        </p>
        <p className="leading-relaxed">{experience.confidence.explanation}</p>
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Zaměření
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70">
        {experience.focus.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Doporučení
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70">
        {experience.recommendations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Doporučené další kroky
      </p>
      <ul
        className="mt-1 list-disc space-y-2 pl-4 text-sm text-embed-foreground-primary/70"
        data-testid="decision-terminal-actions"
      >
        {experience.actions.map((item) => (
          <li key={item.id}>
            <span className="font-medium text-embed-foreground-primary">
              {item.label}
            </span>
            <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-embed-foreground-primary/45">
              {ACTION_TYPE_CS[item.type]} · {ACTION_INTENT_CS[item.intent]}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
