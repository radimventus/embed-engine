export type FeedbackSubmissionState = {status: 'idle' | 'pending' | 'success' | 'error'; error?: string};

/** One request at a time, including clicks before React has rerendered. */
export function createFeedbackSubmission(send: (message: string) => Promise<unknown>, changed: (state: FeedbackSubmissionState) => void) {
  let pending = false;
  return async (message: string): Promise<boolean> => {
    if (pending) return false;
    if (!message.trim() || message.trim().length > 5000) {
      changed({status: 'error', error: 'Napište zprávu o délce 1–5000 znaků.'});
      return false;
    }
    pending = true;
    changed({status: 'pending'});
    try {
      const receipt = await send(message.trim());
      if (!receipt || typeof receipt !== 'object' || !('feedbackId' in receipt) || typeof receipt.feedbackId !== 'string' || !receipt.feedbackId) {
        throw new Error('Server nepotvrdil uložení zprávy.');
      }
      changed({status: 'success'});
      return true;
    } catch (error) {
      changed({status: 'error', error: error instanceof Error ? error.message : 'Zprávu se nepodařilo uložit. Zkuste to znovu.'});
      return false;
    } finally { pending = false; }
  };
}
