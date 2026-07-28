export const BUILDER_STUDIO_RELEASE = {
  product: 'Builder Studio',
  generation: 'BLD-01',
  version:
    typeof __BUILDER_STUDIO_VERSION__ !== 'undefined'
      ? __BUILDER_STUDIO_VERSION__
      : '0.1.0',
} as const;
