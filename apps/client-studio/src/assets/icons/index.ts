/**
 * Shared Experience header icons (HDR-01 / HDR-02).
 * Single PNG sources used across the Client Studio platform surface.
 * Replace files in place with Communication Manual assets when provided.
 */

import actionCallUrl from './action-call.png';
import actionPdfUrl from './action-pdf.png';
import experienceCloseUrl from './experience-close.png';

export const EXPERIENCE_ICONS = {
  close: experienceCloseUrl,
  call: actionCallUrl,
  pdf: actionPdfUrl,
} as const;
