import { useState } from 'react';

import { PlatformDialog } from './PlatformDialog';
import { PlatformField } from './PlatformField';

type FeedbackButtonProps = {
  readonly onSubmitFeedback?: (message: string) => void;
};

/**
 * EPIC-BX-15 / VR-FIX-03 — Global feedback via unified dialog + form grammar.
 */
export function FeedbackButton({ onSubmitFeedback }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="platform-feedback">
      <button
        type="button"
        className="platform-feedback__trigger"
        aria-expanded={open}
        aria-label="Poslat zpětnou vazbu"
        onClick={() => setOpen(true)}
      >
        Zpětná vazba
      </button>
      <PlatformDialog
        open={open}
        title="Poslat zpětnou vazbu"
        description="Zpětná vazba jde do Platform Access — ne do produktového rozhraní."
        primaryLabel="Odeslat"
        secondaryLabel="Zavřít"
        primaryDisabled={message.trim().length === 0}
        asForm
        onClose={() => {
          setOpen(false);
          setMessage('');
        }}
        onPrimary={() => {
          onSubmitFeedback?.(message.trim());
          setMessage('');
          setOpen(false);
        }}
      >
        <PlatformField
          label="Zpráva"
          helper="Krátký popis — co by se mělo zlepšit."
        >
          <textarea
            rows={4}
            value={message}
            placeholder="Co bychom měli zlepšit?"
            onChange={(event) => setMessage(event.target.value)}
          />
        </PlatformField>
      </PlatformDialog>
    </div>
  );
}
