import { describe, it, expect } from 'vitest';
import { computeTargetDims, generateFileName } from '@/workers/imagePipeline';
import type { ConversionSettings } from '@/utils/settings';

const base: ConversionSettings = {
  outputFormat: 'jpeg',
  jpegQuality: 0.92,
  resizeMode: 'none',
  maxWidth: 1920,
  maxHeight: 1080,
  preserveMetadata: false,
  timeout: 30,
};

describe('computeTargetDims', () => {
  it('returns source dimensions unchanged when resizeMode is none', () => {
    expect(computeTargetDims(4000, 3000, { ...base, resizeMode: 'none' })).toEqual({
      width: 4000,
      height: 3000,
    });
  });

  it('scales down preserving aspect ratio when contain and larger than max', () => {
    // scale = min(1920/4000, 1080/3000, 1) = 0.36
    expect(computeTargetDims(4000, 3000, { ...base, resizeMode: 'contain' })).toEqual({
      width: 1440,
      height: 1080,
    });
  });

  it('does not upscale when contain and smaller than max', () => {
    expect(computeTargetDims(800, 600, { ...base, resizeMode: 'contain' })).toEqual({
      width: 800,
      height: 600,
    });
  });

  it('fills the max box when cover, upscaling if needed', () => {
    // scale = max(1920/800, 1080/600) = 2.4
    expect(computeTargetDims(800, 600, { ...base, resizeMode: 'cover' })).toEqual({
      width: 1920,
      height: 1440,
    });
  });

  it('rounds to integer pixel dimensions', () => {
    const out = computeTargetDims(1000, 333, { ...base, resizeMode: 'contain' });
    expect(Number.isInteger(out.width)).toBe(true);
    expect(Number.isInteger(out.height)).toBe(true);
  });
});

describe('generateFileName', () => {
  it('replaces a HEIC extension with jpg for jpeg output', () => {
    expect(generateFileName('IMG_1234.HEIC', { ...base, outputFormat: 'jpeg' })).toBe(
      'IMG_1234.jpg'
    );
  });

  it('replaces a HEIF extension with png for png output', () => {
    expect(generateFileName('photo.heif', { ...base, outputFormat: 'png' })).toBe('photo.png');
  });

  it('only strips the final extension on multi-dot names', () => {
    expect(generateFileName('a.b.c.heic', { ...base, outputFormat: 'jpeg' })).toBe('a.b.c.jpg');
  });

  it('appends an extension when the name has none', () => {
    expect(generateFileName('noext', { ...base, outputFormat: 'jpeg' })).toBe('noext.jpg');
  });
});
