/**
 * Click-model motion — light, unobtrusive.
 */
export const motion = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 300,
    emphasis: 600,
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  /** Ready-to-use CSS transition snippets */
  transition: {
    interactive: 'all 0.25s ease',
    color: 'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
    expand: 'max-height 0.25s ease, opacity 0.2s ease',
    width: 'width 0.6s ease',
  },
} as const;
