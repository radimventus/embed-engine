/**
 * Vite / browser bundle loader — CSV text inlined from public HP-002 package.
 * Alias target for `builderPackageCsv` in Vite configs.
 */
import galleryCsv from '../../../../public/house-package/gallery.csv?raw';
import roomsCsv from '../../../../public/house-package/rooms.csv?raw';
import videosCsv from '../../../../public/house-package/videos.csv?raw';

export { galleryCsv, roomsCsv, videosCsv };
