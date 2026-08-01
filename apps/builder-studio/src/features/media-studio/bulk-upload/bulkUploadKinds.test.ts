import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BULK_UPLOAD_KINDS,
  isAllowedBulkExtension,
  sanitizeBulkFileName,
} from './bulkUploadKinds.ts';

describe('BU-001 bulk upload kinds', () => {
  it('keeps separate upload kinds for images, svg and documents', () => {
    assert.equal(BULK_UPLOAD_KINDS.images.relativeDir, 'media/gallery');
    assert.equal(BULK_UPLOAD_KINDS.svg.relativeDir, 'media/plans');
    assert.equal(BULK_UPLOAD_KINDS.documents.relativeDir, 'media/documents');
    assert.equal(BULK_UPLOAD_KINDS.images.accept.includes('.webp'), true);
    assert.equal(BULK_UPLOAD_KINDS.documents.accept.includes('.pdf'), true);
  });

  it('accepts only declared extensions per kind', () => {
    assert.equal(isAllowedBulkExtension('images', 'a.WEBP'), true);
    assert.equal(isAllowedBulkExtension('images', 'a.svg'), false);
    assert.equal(isAllowedBulkExtension('svg', 'plan.SVG'), true);
    assert.equal(isAllowedBulkExtension('documents', 'spec.docx'), true);
    assert.equal(isAllowedBulkExtension('documents', 'spec.xlsx'), false);
  });

  it('sanitizes file names without path traversal', () => {
    assert.equal(sanitizeBulkFileName('../../x y.png'), 'x-y.png');
  });
});
