import { useState } from 'react';

import {
  acceptSuggestion,
  generateSuggestion,
  rejectSuggestion,
} from './aiAuthorService';
import type { ProposalResult } from './aiAuthorProposals';
import type { AiAuthorDomain, AiSuggestion } from './aiAuthorTypes';

type AiAuthorSuggestButtonProps = {
  readonly projectId: string;
  readonly domain: AiAuthorDomain;
  readonly buildProposal: () => ProposalResult;
  /** Apply payload only after explicit Accept. */
  readonly onAccept: (payload: unknown, suggestion: AiSuggestion) => void;
  readonly label?: string;
  readonly className?: string;
};

/**
 * EPIC-BX-10 — contextual ✨ Navrhnout with confirm step (never auto-writes).
 */
export function AiAuthorSuggestButton({
  projectId,
  domain,
  buildProposal,
  onAccept,
  label,
  className = '',
}: AiAuthorSuggestButtonProps) {
  const [pending, setPending] = useState<AiSuggestion | null>(null);

  return (
    <>
      <button
        type="button"
        className={
          className ||
          'rounded-[8px] border border-[#DDE5EF] bg-white px-2.5 py-1.5 text-[12px] font-medium text-builder-navy'
        }
        onClick={() => {
          const proposal = buildProposal();
          const suggestion = generateSuggestion({
            projectId,
            domain,
            proposal,
          });
          setPending(suggestion);
        }}
      >
        ✨ {label ?? 'Navrhnout'}
      </button>

      {pending !== null && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={pending.label}
            className="w-full max-w-lg rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-lg"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
              AI Author · {pending.status}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-builder-ink">
              {pending.label}
            </h3>
            <p className="mt-2 text-[12px] text-builder-muted">
              Vstup: {pending.inputSummary}
            </p>
            <p className="text-[12px] text-builder-muted">
              Kontext: {pending.contextSummary}
            </p>
            <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-[12px] border border-[#E8EEF5] bg-builder-canvas p-3 text-sm text-builder-ink">
              {pending.proposalText}
            </pre>
            <p className="mt-3 text-[11px] text-builder-muted">
              Návrh se zapíše až po potvrzení. AI nikdy nepřepisuje data
              autonomně.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-[10px] border border-[#DDE5EF] px-4 py-2 text-sm"
                onClick={() => {
                  rejectSuggestion(projectId, pending.id);
                  setPending(null);
                }}
              >
                Odmítnout
              </button>
              <button
                type="button"
                className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white"
                onClick={() => {
                  const accepted = acceptSuggestion(projectId, pending.id);
                  if (accepted !== null) {
                    onAccept(accepted.payload, accepted);
                  }
                  setPending(null);
                }}
              >
                Přijmout návrh
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
