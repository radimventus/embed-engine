/**
 * Copies an explicitly requested admin activation URL. The DOM fallback keeps
 * the URL transient and never renders it in the ordinary Partner-user list.
 */
export async function copyActivationLink(value: string): Promise<void> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.writeText !== undefined
  ) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the explicit DOM selection fallback.
    }
  }
  if (typeof document === 'undefined') {
    throw new Error('Clipboard is unavailable.');
  }

  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) {
    throw new Error('Clipboard copy was rejected.');
  }
}
