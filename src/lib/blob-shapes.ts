//src/lib/blob-shapes.ts
/**
 * Blob shape registry.
 *
 * Every shape is a single closed path with its own `viewBox`, so the
 * <Blob> component can render with preserveAspectRatio="none" and let
 * any shape fill any box without distortion beyond what's baked into
 * the path itself.
 */

export type BlobShape = keyof typeof BLOB_SHAPES;

export type ShapeDef = {
  viewBox: string;
  d: string;
};

export const BLOB_SHAPES = {
  lagoon: {
    viewBox: "0 0 312.9 259.3",
    d: "M0,124.4c0,64.5,116.1,134.9,180.1,134.9c65,0,132.8-70.4,132.8-134.9S231.1-35.4,136.5,13.5C79.6,42.9,0,59.9,0,124.4z",
  },
  organic: {
    viewBox: "0 0 334 254",
    d: "M332.2,100.7C329.5,59.9,261,20.4,197.1,7C133.1-6.5,20.6,1.5,2.6,87.2c-7,33.4,23.4,153.9,162,164.8C241.5,258,335.9,157.1,332.2,100.7z",
  },
} satisfies Record<string, ShapeDef>;

export const BLOB_SHAPE_NAMES = Object.keys(BLOB_SHAPES) as BlobShape[];