/**
 * Click-model typography hierarchy (docs/platform/click model.html).
 */
export const typography = {
  fontFamily: {
    sans: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    /** Platform hierarchy */
    h1: '30px',
    h2: '22px',
    h3: '18px',
    section: '11px',
    meta: '12px',
    helper: '13px',
    body: '14px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
  letterSpacing: {
    tighter: '-0.5px',
    tight: '-0.02em',
    normal: '0em',
    wide: '0.05em',
    section: '1px',
    brand: '0.3em',
  },
} as const;
