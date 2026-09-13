import {useCallback, useRef, useState} from 'react';
import {PlatformDialog} from './PlatformDialog';
import {PlatformField} from './PlatformField';
import {createFeedbackSubmission, type FeedbackSubmissionState} from './feedbackSubmission';

export function ManagerFeedbackButton({onSubmitFeedback}: {onSubmitFeedback?: (message: string) => void | Promise<unknown>}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<FeedbackSubmissionState>({status: 'idle'});
  const sender = useRef(onSubmitFeedback);
  sender.current = onSubmitFeedback;
  const submit = useRef(createFeedbackSubmission(async text => {
    if (!sender.current) throw new Error('Odeslání není dostupné. Zpráva nebyla uložena.');
    return sender.current(text);
  }, setState));
  const pending = state.status === 'pending';
  // PlatformDialog ties its focus lifecycle to onClose identity. Typing must
  // not restart that lifecycle and move focus onto the close button.
  const closeDialog = useCallback(() => {if (!pending) setOpen(false);}, [pending]);
  return <div className="platform-feedback">
    <button type="button" className="platform-feedback__trigger" aria-label="Poslat zpětnou vazbu" aria-expanded={open} disabled={pending}
      onClick={() => {setOpen(true); setState({status: 'idle'});}}>Zpětná vazba</button>
    {state.status === 'success' && <p className="platform-feedback__panel" role="status">Děkujeme. Zpětná vazba byla uložena.</p>}
    <PlatformDialog open={open} title="Poslat zpětnou vazbu" description="Napište nám, co v Manageru potřebujete zlepšit."
      asForm busy={pending} primaryLabel={pending ? 'Odesílám…' : 'Odeslat'} secondaryLabel="Zavřít"
      primaryDisabled={pending || !message.trim()} onClose={closeDialog}
      onPrimary={() => {void submit.current(message).then(ok => {if (ok) {setMessage(''); setOpen(false);}});}}>
      <PlatformField label="Zpráva"><textarea rows={4} maxLength={5000} value={message} disabled={pending}
        onChange={event => setMessage(event.target.value)} /></PlatformField>
      {state.status === 'error' && <p role="alert">{state.error}</p>}
    </PlatformDialog>
  </div>;
}
