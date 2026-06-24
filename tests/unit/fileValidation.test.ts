import { describe, it, expect } from 'vitest';
import {
  validateFileExtension,
  validateFileMimeType,
  validateFile,
  validateTotalSize,
  sanitizeFileName,
} from '@/utils/fileValidation';

// Minimal File-like stub (only the fields the validators read).
const f = (name: string, type = '', size = 1): File =>
  ({ name, type, size }) as unknown as File;

describe('validateFileExtension', () => {
  it('accepts .heic regardless of case', () => {
    expect(validateFileExtension('x.HEIC').valid).toBe(true);
  });

  it('accepts .heif', () => {
    expect(validateFileExtension('x.heif').valid).toBe(true);
  });

  it('rejects an unsupported extension', () => {
    expect(validateFileExtension('x.png').valid).toBe(false);
  });
});

describe('validateFileMimeType', () => {
  it('accepts a known HEIC mime type', () => {
    expect(validateFileMimeType(f('x.heic', 'image/heic')).valid).toBe(true);
  });

  it('accepts an empty mime type (relies on extension)', () => {
    expect(validateFileMimeType(f('x.heic', '')).valid).toBe(true);
  });

  it('rejects a non-HEIC mime type', () => {
    expect(validateFileMimeType(f('x.heic', 'image/png')).valid).toBe(false);
  });
});

describe('validateFile', () => {
  it('accepts a valid HEIC file', () => {
    expect(validateFile(f('photo.heic', 'image/heic')).valid).toBe(true);
  });

  it('rejects a file with an unsupported extension', () => {
    expect(validateFile(f('photo.png', 'image/png')).valid).toBe(false);
  });
});

describe('validateTotalSize', () => {
  it('accepts files under the 2GB cap', () => {
    expect(validateTotalSize([f('a.heic', 'image/heic', 10 * 1024 * 1024)]).valid).toBe(true);
  });

  it('rejects when the combined size exceeds the cap', () => {
    expect(
      validateTotalSize([
        f('a.heic', 'image/heic', 2 * 1024 * 1024 * 1024),
        f('b.heic', 'image/heic', 1),
      ]).valid
    ).toBe(false);
  });
});

describe('sanitizeFileName', () => {
  it('replaces path and reserved characters with underscores', () => {
    expect(sanitizeFileName('a/b\\c:d*e?.heic')).toBe('a_b_c_d_e_.heic');
  });
});
