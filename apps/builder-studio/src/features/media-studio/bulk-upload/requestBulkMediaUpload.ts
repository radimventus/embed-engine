/**
 * BU-001 — Builder host upload (presentation). Does not touch Package Layer APIs.
 */

import type { BulkUploadKind } from './bulkUploadKinds';
import { sanitizeBulkFileName } from './bulkUploadKinds';

export type BulkUploadFileResult = {
  readonly fileName: string;
  readonly relativePath: string;
  readonly ok: boolean;
  readonly error?: string;
};

export type BulkUploadResponse = {
  readonly ok: boolean;
  readonly results: readonly BulkUploadFileResult[];
  readonly error?: string;
};

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function requestBulkMediaUpload(input: {
  readonly kind: BulkUploadKind;
  readonly file: File;
}): Promise<BulkUploadFileResult> {
  const fileName = sanitizeBulkFileName(input.file.name);
  const contentBase64 = await fileToBase64(input.file);
  const response = await fetch('/api/house-package/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: input.kind,
      files: [{ name: fileName, contentBase64 }],
    }),
  });
  const payload = (await response.json()) as BulkUploadResponse;
  if (!response.ok || !payload.ok || payload.results.length === 0) {
    return {
      fileName,
      relativePath: '',
      ok: false,
      error: payload.error ?? 'Upload selhal.',
    };
  }
  return payload.results[0];
}
