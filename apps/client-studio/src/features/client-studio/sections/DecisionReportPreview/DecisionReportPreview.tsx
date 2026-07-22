import { FramedInput, Panel, PrimaryButton } from '@embed-engine/ui';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import {
  CHAPTER_PANEL_DIVIDER_CLASS,
  CHAPTER_PANEL_LABEL_CLASS,
} from '../../chapter-layout';
import { CHAPTER_HEADER_CLASS } from '../spatial-terminal-layout';
import { decisionReportPreviewFromTerminal } from './DecisionReportPreviewViewModel';

/**
 * Decision Report Preview — pure Terminal renderer (lead-capture chrome only).
 */
export function DecisionReportPreview() {
  const { experience } = useDecisionSessionRuntime();
  const terminal = experience.context.decision.terminal;
  const viewModel = decisionReportPreviewFromTerminal(terminal);

  return (
    <section
      aria-label="Náhled reportu rozhodnutí"
      className="border-b border-embed-border-default px-section py-section"
      data-terminal-id={terminal.id}
    >
      <header>
        <h2 className={CHAPTER_HEADER_CLASS}>Report rozhodnutí</h2>
      </header>

      <Panel as="article" variant="inset" className="mt-section" aria-label="Náhled reportu">
        <h3 className="text-sm font-semibold tracking-wide text-embed-foreground-primary">
          {viewModel.title}
        </h3>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Zaměření</h4>
          <ul className="mt-2 space-y-1.5" aria-label="Zaměření">
            {viewModel.priorities.map((priority) => (
              <li
                key={priority}
                className="flex items-start gap-2 text-sm leading-snug text-embed-foreground-primary"
              >
                <span
                  className="mt-px shrink-0 text-embed-brand-gold"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span>{priority}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Shrnutí</h4>
          <p className="mt-2 text-sm leading-relaxed text-embed-foreground-primary/70">
            {viewModel.summary}
          </p>
        </div>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Obsah reportu</h4>
          <ul className="mt-2 space-y-1.5" aria-label="Obsah reportu">
            {viewModel.includedItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm leading-snug text-embed-foreground-primary"
              >
                <span
                  className="mt-px shrink-0 text-embed-brand-gold"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <h4 className="text-sm font-medium text-embed-foreground-primary">
            Odeslat report e-mailem
          </h4>
          <label
            className="mt-3 block text-sm text-embed-foreground-primary/70"
            htmlFor="report-email"
          >
            Email
            <FramedInput
              id="report-email"
              type="email"
              placeholder="vas@email.cz"
              autoComplete="email"
              className="mt-1.5 max-w-md"
            />
          </label>
          <PrimaryButton type="button" className="mt-4">
            Odeslat report
          </PrimaryButton>
        </div>
      </Panel>
    </section>
  );
}
