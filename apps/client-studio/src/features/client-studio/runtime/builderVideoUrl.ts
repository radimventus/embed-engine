/**
 * Resolve external / local video URLs from HP-002 Video Registry provider + mediaId.
 */
export function resolveBuilderVideoUrl(provider: string, mediaId: string): string {
  switch (provider) {
    case 'wistia':
      return `https://fast.wistia.net/embed/iframe/${mediaId}`;
    case 'youtube':
      return `https://www.youtube.com/embed/${mediaId}`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${mediaId}`;
    case 'mux':
      return mediaId.startsWith('http')
        ? mediaId
        : `https://stream.mux.com/${mediaId}.m3u8`;
    case 'local':
      return mediaId.startsWith('/')
        ? mediaId
        : `/house-package/media/videos/${mediaId}`;
    default:
      return mediaId;
  }
}
