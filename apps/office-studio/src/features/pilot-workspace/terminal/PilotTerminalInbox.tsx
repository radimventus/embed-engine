import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import {
  PILOT_MESSAGE_DIRECTION_LABELS,
} from '../../../office/pilotConversationModel';
import {
  formatInboxReceivedAt,
  messagesInCategory,
  PILOT_INBOX_CATEGORIES,
  PILOT_INBOX_MESSAGE_STATUS_LABELS,
  type PilotInboxMessage,
} from '../../../office/pilotInboxModel';

/**
 * CAP-OP-03 / CAP-OP-10 — Inbox as Conversation Runtime projection.
 * Selecting a message updates active case + conversation. No IMAP/SMTP.
 */
export function PilotTerminalInbox() {
  const {
    cases,
    inbox,
    selectedInboxMessage,
    selectInboxMessage,
    assignInboxCase,
    unassignInboxCase,
    conversation,
    mailSessionActive,
  } = usePilotWorkspaceContext();

  const activeConversation = conversation.activeConversation;

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-inbox"
      data-pilot-inbox-default="true"
      data-inbox-runtime="conversation"
      data-conversation-runtime="true"
      data-mail-session={mailSessionActive ? 'active' : 'inactive'}
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Inbox</h3>
      </header>

      <section
        className="office-pilot-conversation"
        data-testid="pilot-conversation-runtime"
        data-transport-agnostic="true"
      >
        <h4 className="office-pilot-inbox__title">Conversation</h4>
        {activeConversation === null ? (
          <p
            className="office-pilot-inbox__empty"
            data-testid="pilot-conversation-empty"
          >
            Žádná konverzace.
          </p>
        ) : (
          <>
            <p
              className="office-pilot-conversation__subject"
              data-testid="pilot-conversation-subject"
            >
              {activeConversation.subject}
            </p>
            <p className="office-pilot-conversation__meta">
              {conversation.activeMailbox?.email ?? '—'} ·{' '}
              {conversation.messages.length} zpráv
            </p>
            <ul
              className="office-pilot-conversation__messages"
              data-testid="pilot-conversation-messages"
            >
              {conversation.messages.map((message) => (
                <li
                  key={message.id}
                  className="office-pilot-conversation__message"
                  data-testid={`pilot-conversation-message-${message.id}`}
                  data-direction={message.direction}
                  data-origin={message.origin}
                >
                  <span>
                    {PILOT_MESSAGE_DIRECTION_LABELS[message.direction]}
                  </span>
                  <strong>{message.subject}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="office-pilot-inbox" data-testid="pilot-inbox-sections">
        {PILOT_INBOX_CATEGORIES.map((category) => {
          const messages = messagesInCategory(inbox.messages, category.id);
          return (
            <section
              key={category.id}
              className="office-pilot-inbox__section"
              data-testid={`pilot-inbox-section-${category.id}`}
            >
              <h4 className="office-pilot-inbox__title">
                {category.label}
                <span className="office-pilot-inbox__count">
                  {messages.length}
                </span>
              </h4>

              {messages.length === 0 ? (
                <p className="office-pilot-inbox__empty">Žádné zprávy</p>
              ) : (
                <ul
                  className="office-pilot-inbox__list"
                  data-testid={`pilot-inbox-list-${category.id}`}
                >
                  {messages.map((message) => (
                    <MessageRow
                      key={message.id}
                      message={message}
                      active={message.id === inbox.selectedMessageId}
                      caseLabel={
                        message.caseId === null
                          ? null
                          : (cases.find((item) => item.id === message.caseId)
                              ?.label ?? message.caseId)
                      }
                      onSelect={() => selectInboxMessage(message.id)}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {selectedInboxMessage !== null ? (
        <div
          className="office-pilot-inbox__assignment"
          data-testid="pilot-inbox-assignment"
        >
          <h4 className="office-pilot-inbox__title">Přiřazení</h4>
          <p className="office-pilot-inbox__assignment-subject">
            {selectedInboxMessage.subject}
          </p>

          <label
            className="office-pilot-inbox__assign-label"
            htmlFor="pilot-inbox-assign-case"
          >
            Obchodní případ
          </label>
          <div className="office-pilot-inbox__assign-row">
            <select
              id="pilot-inbox-assign-case"
              className="office-pilot-inbox__assign-select"
              data-testid="pilot-inbox-assign-select"
              value={selectedInboxMessage.caseId ?? ''}
              onChange={(event) => {
                const next = event.target.value;
                if (next.length === 0) {
                  unassignInboxCase(selectedInboxMessage.id);
                  return;
                }
                assignInboxCase(selectedInboxMessage.id, next);
              }}
            >
              <option value="">— bez přiřazení —</option>
              {cases.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="platform-btn platform-btn--secondary"
              data-testid="pilot-inbox-unassign"
              disabled={selectedInboxMessage.caseId === null}
              onClick={() => unassignInboxCase(selectedInboxMessage.id)}
            >
              Odebrat
            </button>
          </div>
        </div>
      ) : (
        <p className="office-pilot-ws__panel-body" data-testid="pilot-inbox-pick-hint">
          Vyberte zprávu.
        </p>
      )}
    </div>
  );
}

function MessageRow({
  message,
  active,
  caseLabel,
  onSelect,
}: {
  readonly message: PilotInboxMessage;
  readonly active: boolean;
  readonly caseLabel: string | null;
  readonly onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={
          active
            ? 'office-pilot-inbox__item office-pilot-inbox__item--active'
            : 'office-pilot-inbox__item'
        }
        data-testid={`pilot-inbox-message-${message.id}`}
        data-message-status={message.status}
        aria-current={active ? 'true' : undefined}
        onClick={onSelect}
      >
        <span className="office-pilot-inbox__item-top">
          <strong className="office-pilot-inbox__sender">
            {message.senderName}
          </strong>
          <time dateTime={message.receivedAt}>
            {formatInboxReceivedAt(message.receivedAt)}
          </time>
        </span>
        <span className="office-pilot-inbox__subject">{message.subject}</span>
        <span className="office-pilot-inbox__item-meta">
          <span>{PILOT_INBOX_MESSAGE_STATUS_LABELS[message.status]}</span>
          <span>
            {caseLabel === null ? 'Bez obchodního případu' : caseLabel}
          </span>
        </span>
      </button>
    </li>
  );
}
