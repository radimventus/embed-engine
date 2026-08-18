import type { BulkUploadKind } from './bulkUploadKinds';
import {
  BULK_UPLOAD_KINDS,
  sanitizeBulkFileName,
} from './bulkUploadKinds';
import {
  requestPlatformHousePackageMediaUpload,
} from '../../house-package/requestPlatformHousePackage';

export type BulkUploadFileResult = {
  readonly fileName: string;
  readonly relativePath: string;
  /** Authenticated, durable Platform API address for this media item. */
  readonly mediaUrl?: string;
  readonly ok: boolean;
  readonly error?: string;
};

export async function requestBulkMediaUpload(input: {
  readonly houseId: string;
  readonly kind: BulkUploadKind;
  readonly file: File;
}): Promise<BulkUploadFileResult> {
  const fileName = sanitizeBulkFileName(input.file.name);
  const relativePath = `${BULK_UPLOAD_KINDS[input.kind].relativeDir}/${fileName}`;
  const result = await requestPlatformHousePackageMediaUpload({
    houseId: input.houseId,
    relativePath,
    file: input.file,
  });
  if (!result.ok) {
    return {
      fileName,
      relativePath: '',
      ok: false,
      error: result.error,
    };
  }
  return {
    fileName,
    relativePath: result.media.relativePath,
    mediaUrl: result.media.url,
    ok: true,
  };
}
