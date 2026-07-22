/**
 * Smooth scroll to a Decision Journey section anchor (CSCB-01).
 */
export function scrollToSection(sectionId: string): void {
  const target = document.getElementById(sectionId);
  if (target === null) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof target.focus === 'function') {
    target.focus({ preventScroll: true });
  }
}
