import { useState } from 'react';

type FeedbackButtonProps = {
  readonly onSubmitFeedback?: (message: string) => void;
};

/**
 * EPIC-BX-15 — Global feedback control in Platform Shell (not a capability).
 */
export function FeedbackButton({ onSubmitFeedback }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="platform-feedback">
      <button
        type="button"
        className="platform-feedback__trigger"
        aria-expanded={open}
        aria-label="Poslat zpětnou vazbu"
        onClick={() => {
          setOpen((value) => !value);
          setSent(false);
        }}
      >
        Feedback
      </button>
      {open && (
        <div className="platform-feedback__panel" role="dialog" aria-label="Zpětná vazba">
          <p className="platform-feedback__title">Poslat zpětnou vazbu</p>
          <textarea
            className="platform-feedback__input"
            rows={4}
            value={message}
            placeholder="Co bychom měli zlepšit?"
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="platform-feedback__actions">
            <button
              type="button"
              className="platform-feedback__send"
              disabled={message.trim().length === 0}
              onClick={() => {
                onSubmitFeedback?.(message.trim());
                setMessage('');
                setSent(true);
              }}
            >
              Odeslat
            </button>
            <button
              type="button"
              className="platform-feedback__cancel"
              onClick={() => setOpen(false)}
            >
              Zavřít
            </button>
          </div>
          {sent && (
            <p className="platform-feedback__ok">Děkujeme — feedback uložen.</p>
          )}
        </div>
      )}
    </div>
  );
}
