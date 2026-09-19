const INITIAL_SCROLL_MEDIA_SELECTOR =
  'img[data-initial-scroll-media="true"]';

/**
 * Prepare media Chrome has already selected for the initial viewport path.
 *
 * Eager images are already requested by their normal product markup, so wait
 * for their decode even while the request is in flight. Lazy thumbnails are
 * included only after they are loaded; this never starts an offscreen request.
 */
export async function prepareInitialScrollMedia(
  root: ParentNode = document,
): Promise<void> {
  const candidates = Array.from(
    root.querySelectorAll<HTMLImageElement>(INITIAL_SCROLL_MEDIA_SELECTOR),
  ).filter(
    (image) =>
      image.loading !== 'lazy' || (image.complete && image.naturalWidth > 0),
  );

  await Promise.all(
    candidates.map((image) => image.decode().catch(() => undefined)),
  );
}
