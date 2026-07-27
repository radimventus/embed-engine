/**
 * Platform Visual API — framework-agnostic visual elements for non-UI layers.
 * Close is the first registered visual; the registry is extensible.
 */

export type VisualName = "close";

export type VisualMetrics = {
  readonly hitAreaPx: number;
  readonly displayPx: number;
};

export type CreateVisualOptions = {
  readonly name: VisualName;
};
