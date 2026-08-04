import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import {
  formatInboxReceivedAt,
  messagesInCategory,
  PILOT_INBOX_CATEGORIES,
  PILOT_INBOX_MESSAGE_STATUS_LABELS,
  type PilotInboxMessage,
} from '../../../office/pilotInboxModel';

/**
 * CAP-OP-03 — Inbox Runtime: message list + case assignment.
 * Selecting a message updates PilotWorkspaceProvider active case.
 */
export function PilotTerminalInbox() {
  const {
    cases,
    inbox,
    selectedInboxMessage,
    selectInboxMessage,
    assignInboxCase,
    unassignInboxCase,
  } = usePilotWorkspaceContext();

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-inbox"
      data-pilot-inbox-default="true"
      data-inbox-runtime="true"
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Inbox</h3>
        <p className="office-pilot-ws__panel-body">
          Pracovní schránka obchodníka. Přiřazení aktualizuje aktivní obchodní
          případ ve Shared Context.
        </p>
      </header>

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
          <h4 className="office-pilot-inbox__title">Přiřazení obchodního případu</h4>
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

          <p
            className="office-pilot-inbox__timeline-slot"
            data-testid="pilot-inbox-timeline-slot"
            data-timeline-ready="true"
          >
            Timeline interface připraven (`inbox.message.*`) — napojení v PT-07.
          </p>
        </div>
      ) : (
        <p className="office-pilot-ws__panel-body" data-testid="pilot-inbox-pick-hint">
          Vyberte zprávu ze seznamu pro přiřazení obchodního případu.
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
