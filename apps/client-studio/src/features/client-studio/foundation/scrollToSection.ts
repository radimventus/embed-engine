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

/** Priority chapter bridge block — CAP UX 39 scroll target. */
export const PRIORITY_BRIDGE_ANCHOR_ID = 'priority-chapter-bridge';

/**
 * Timed smooth scroll for Priority bridge anchor (CAP UX 39).
 * Does not change default scrollToSection behavior for other sections.
 */
export function scrollElementIntoView(
  target: HTMLElement,
  durationMs: number = 600,
): void {
  const header = document.querySelector<HTMLElement>('[data-experience-header]');
  const headerOffset = header
    ? Math.ceil(header.getBoundingClientRect().height)
    : 0;

  const overlayMount = document.querySelector<HTMLElement>(
    '[data-embed-overlay-mount]',
  );

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (overlayMount) {
    const containerRect = overlayMount.getBoundingClientRect();
    const elementRect = target.getBoundingClientRect();
    const nextTop =
      overlayMount.scrollTop +
      (elementRect.top - containerRect.top) -
      headerOffset;
    animateScroll(overlayMount, Math.max(0, nextTop), durationMs, reducedMotion);
  } else {
    const top =
      window.scrollY + target.getBoundingClientRect().top - headerOffset;
    animateScroll(window, Math.max(0, top), durationMs, reducedMotion);
  }

  if (typeof target.focus === 'function') {
    target.focus({ preventScroll: true });
  }
}

function animateScroll(
  scroller: HTMLElement | Window,
  to: number,
  durationMs: number,
  reducedMotion: boolean,
): void {
  const from =
    scroller instanceof Window ? scroller.scrollY : scroller.scrollTop;

  if (reducedMotion || durationMs <= 0) {
    if (scroller instanceof Window) {
      scroller.scrollTo({ top: to, left: 0, behavior: 'auto' });
    } else {
      scroller.scrollTop = to;
    }
    return;
  }

  const delta = to - from;
  if (Math.abs(delta) < 1) {
    return;
  }

  const startedAt = performance.now();

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - (-2 * progress + 2) ** 2 / 2;
    const next = from + delta * eased;
    if (scroller instanceof Window) {
      scroller.scrollTo({ top: next, left: 0, behavior: 'auto' });
    } else {
      scroller.scrollTop = next;
    }
    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
}
