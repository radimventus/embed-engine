/**
 * Experience header action icons (HDR-02).
 * Close uses @embed-engine/ui CloseButton — do not add a local close asset.
 */

import actionCallUrl from './action-call.png';
import actionPdfUrl from './action-pdf.png';

export const EXPERIENCE_ICONS = {
  call: actionCallUrl,
  pdf: actionPdfUrl,
} as const;
