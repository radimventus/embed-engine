import { useMemo, useState } from 'react';

import { DEFAULT_PILOT_MAILBOX_ID } from '../../../mail';
import { getConversationMailStore } from '../../../mail/conversationMailStore';
import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import type { PilotConversationMessage } from '../../../office/pilotConversationModel';
import {
  buildForwardDraft,
  buildNewComposeDraft,
  buildReplyAllDraft,
  buildReplyDraft,
  canSendComposeDraft,
  MAIL_COMPOSE_MODE_LABELS,
  toSystemMailDraft,
  type MailComposeDraft,
  type MailComposeMode,
} from '../../../office/pilotMailCompose';

/**
 * PT-14 — Mail Composer bound to active commercial case.
 * Uses shared Mail Session only (SYSTEM + OFFICE). No SMTP in UI.
 */
export function PilotMailComposer() {
  const {
    activeCase,
    activeCaseId,
    conversation,
    selectedInboxMessage,
    sendSystemMail,
  } = usePilotWorkspaceContext();

  const [draft, setDraft] = useState<MailComposeDraft | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mailbox = useMemo(() => {
    if (conversation.activeMailbox !== null) return conversation.activeMailbox;
    const store = getConversationMailStore();
    return (
      store.mailboxes.find((item) => item.id === DEFAULT_PILOT_MAILBOX_ID) ??
      store.mailboxes[0] ??
      null
    );
  }, [conversation.activeMailbox]);

  const sourceMessage = useMemo((): PilotConversationMessage | null => {
    if (selectedInboxMessage !== null) {
      const fromConversation = conversation.messages.find(
        (item) => item.id === selectedInboxMessage.id,
      );
      if (fromConversation !== undefined) return fromConversation;
      const fromStore = getConversationMailStore().messages.find(
        (item) => item.id === selectedInboxMessage.id,
      );
      if (fromStore !== undefined) return fromStore;
    }
    if (conversation.messages.length > 0) {
      return conversation.messages[conversation.messages.length - 1] ?? null;
    }
    return null;
  }, [conversation.messages, selectedInboxMessage]);

  if (activeCase === null || activeCaseId === null || mailbox === null) {
    return (
      <p
        className="office-pilot-ws__panel-body"
        data-testid="pilot-mail-composer-need-project"
      >
        Vyberte projekt pro komunikaci.
      </p>
    );
  }

  const openMode = (mode: MailComposeMode) => {
    setError(null);
    if (mode === 'compose') {
      setDraft(
        buildNewComposeDraft({
          activeCase,
          mailbox,
          conversation: conversation.activeConversation,
        }),
      );
      return;
    }
    if (sourceMessage === null) {
      setError('Vyberte zprávu pro odpověď nebo přeposlání.');
      return;
    }
    const shared = {
      activeCase,
      mailbox,
      source: sourceMessage,
      conversation: conversation.activeConversation,
    };
    if (mode === 'reply') setDraft(buildReplyDraft(shared));
    else if (mode === 'reply-all') setDraft(buildReplyAllDraft(shared));
    else setDraft(buildForwardDraft(shared));
  };

  const patchDraft = (patch: Partial<MailComposeDraft>) => {
    setDraft((current) => (current === null ? current : { ...current, ...patch }));
  };

  const onSend = async () => {
    if (draft === null || !canSendComposeDraft(draft)) return;
    setSending(true);
    setError(null);
    try {
      await sendSystemMail(toSystemMailDraft(draft));
      setDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Odeslání se nezdařilo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      className="office-pilot-composer"
      data-testid="pilot-mail-composer"
      data-compose-bound="active-project"
      data-case-id={activeCaseId}
      data-mail-origin="OFFICE"
    >
      <div
        className="office-pilot-composer__actions"
        role="toolbar"
        aria-label="Mail Composer"
        data-testid="pilot-mail-composer-actions"
      >
        {(
          [
            'compose',
            'reply',
            'reply-all',
            'forward',
          ] as const satisfies readonly MailComposeMode[]
        ).map((mode) => (
          <button
            key={mode}
            type="button"
            className="platform-btn platform-btn--secondary"
            data-testid={`pilot-mail-compose-${mode}`}
            disabled={mode !== 'compose' && sourceMessage === null}
            onClick={() => openMode(mode)}
          >
            {MAIL_COMPOSE_MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      {error !== null ? (
        <p className="office-pilot-composer__error" data-testid="pilot-mail-composer-error">
          {error}
        </p>
      ) : null}

      {draft !== null ? (
        <form
          className="office-pilot-composer__form"
          data-testid="pilot-mail-composer-form"
          data-compose-mode={draft.mode}
          onSubmit={(event) => {
            event.preventDefault();
            void onSend();
          }}
        >
          <p className="office-pilot-composer__context" data-testid="pilot-mail-composer-context">
            {MAIL_COMPOSE_MODE_LABELS[draft.mode]} · {draft.partnerName} ·{' '}
            {activeCase.label}
          </p>

          <label className="office-pilot-composer__field">
            <span>Komu</span>
            <input
              data-testid="pilot-mail-composer-to"
              value={draft.toEmail}
              onChange={(event) => patchDraft({ toEmail: event.target.value })}
              autoComplete="email"
              required
            />
          </label>

          {draft.mode === 'reply-all' ? (
            <label className="office-pilot-composer__field">
              <span>Kopie</span>
              <input
                data-testid="pilot-mail-composer-cc"
                value={draft.ccEmail}
                onChange={(event) => patchDraft({ ccEmail: event.target.value })}
                autoComplete="email"
              />
            </label>
          ) : null}

          <label className="office-pilot-composer__field">
            <span>Předmět</span>
            <input
              data-testid="pilot-mail-composer-subject"
              value={draft.subject}
              onChange={(event) => patchDraft({ subject: event.target.value })}
              required
            />
          </label>

          <label className="office-pilot-composer__field">
            <span>Zpráva</span>
            <textarea
              data-testid="pilot-mail-composer-body"
              value={draft.body}
              onChange={(event) => patchDraft({ body: event.target.value })}
              rows={8}
              required
            />
          </label>

          <div className="office-pilot-composer__submit-row">
            <button
              type="button"
              className="platform-btn platform-btn--secondary"
              data-testid="pilot-mail-composer-cancel"
              onClick={() => setDraft(null)}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="platform-btn"
              data-testid="pilot-mail-composer-send"
              disabled={sending || !canSendComposeDraft(draft)}
            >
              {sending ? 'Odesílám…' : 'Odeslat'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
