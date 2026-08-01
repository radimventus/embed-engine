import { useState } from 'react';

import { PlatformDialog } from '@embed-engine/platform-shell';

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
 * EPIC-BX-10 / VR-FIX-06 — Navrhnout with PlatformDialog confirm (never auto-writes).
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

      <PlatformDialog
        open={pending !== null}
        title={pending?.label ?? 'Návrh'}
        description="Návrh se zapíše až po potvrzení. AI nikdy nepřepisuje data autonomně."
        primaryLabel="Přijmout návrh"
        secondaryLabel="Odmítnout"
        onClose={() => {
          if (pending !== null) {
            rejectSuggestion(projectId, pending.id);
          }
          setPending(null);
        }}
        onSecondary={() => {
          if (pending !== null) {
            rejectSuggestion(projectId, pending.id);
          }
          setPending(null);
        }}
        onPrimary={() => {
          if (pending === null) return;
          const accepted = acceptSuggestion(projectId, pending.id);
          if (accepted !== null) {
            onAccept(accepted.payload, accepted);
          }
          setPending(null);
        }}
      >
        {pending !== null && (
          <>
            <p className="platform-type-helper">
              Vstup: {pending.inputSummary}
            </p>
            <p className="platform-type-helper" style={{ marginTop: 6 }}>
              Kontext: {pending.contextSummary}
            </p>
            <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-[12px] border border-[#E8EEF5] bg-builder-canvas p-3 text-sm text-builder-ink">
              {pending.proposalText}
            </pre>
          </>
        )}
      </PlatformDialog>
    </>
  );
}
