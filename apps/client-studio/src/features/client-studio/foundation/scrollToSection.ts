/**
 * Smooth scroll to a Decision Journey section anchor (CSCB-01).
 * Aligns the section just below the sticky Experience header when present.
 */
export function scrollToSection(sectionId: string): void {
  const target = document.getElementById(sectionId);
  if (target === null) {
    return;
  }

  const header = document.querySelector<HTMLElement>('[data-experience-header]');
  const headerOffset = header
    ? Math.ceil(header.getBoundingClientRect().height)
    : 0;

  const overlayMount = document.querySelector<HTMLElement>(
    '[data-embed-overlay-mount]',
  );

  if (overlayMount) {
    const containerRect = overlayMount.getBoundingClientRect();
    const elementRect = target.getBoundingClientRect();
    const nextTop =
      overlayMount.scrollTop +
      (elementRect.top - containerRect.top) -
      headerOffset;
    overlayMount.scrollTo({
      top: Math.max(0, nextTop),
      left: 0,
      behavior: 'smooth',
    });
  } else {
    const top =
      window.scrollY + target.getBoundingClientRect().top - headerOffset;
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'smooth' });
  }

  if (typeof target.focus === 'function') {
    target.focus({ preventScroll: true });
  }
}
