/** Stable photo identity aligned with House Package gallery.csv `room/file`. */
export function canonicalImageMediaId(input: {
  readonly roomId?: string | null;
  readonly src: string;
}): string {
  const file = basenameFromSrc(input.src);
  const room = input.roomId?.trim() || 'house';
  return `${room}/${file}`;
}

export const TOUR_VIDEO_MEDIA_ID = 'tour-video';

function basenameFromSrc(src: string): string {
  const trimmed = src.trim();
  if (trimmed.length === 0) {
    return 'image';
  }
  try {
    const path = new URL(trimmed, 'https://local.invalid').pathname;
    const file = path.split('/').filter((part) => part.length > 0).pop();
    if (file !== undefined && file.length > 0) {
      return decodeURIComponent(file);
    }
  } catch {
    // fall through
  }
  const file = trimmed.split('/').filter((part) => part.length > 0).pop();
  return file !== undefined && file.length > 0 ? file : trimmed;
}
