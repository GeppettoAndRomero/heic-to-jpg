import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS, validateSettings } from '@/utils/settings';

describe('validateSettings', () => {
  it('accepts the default settings', () => {
    expect(validateSettings(DEFAULT_SETTINGS).valid).toBe(true);
  });

  it('rejects a JPG quality below the allowed range', () => {
    const r = validateSettings({ ...DEFAULT_SETTINGS, jpegQuality: 0.3 });
    expect(r.valid).toBe(false);
    expect(r.errors.jpegQuality).toBeDefined();
  });

  it('ignores JPG quality when the output format is png', () => {
    expect(validateSettings({ ...DEFAULT_SETTINGS, outputFormat: 'png', jpegQuality: 0.1 }).valid).toBe(
      true
    );
  });

  it('rejects a max width outside 100..20000', () => {
    expect(validateSettings({ ...DEFAULT_SETTINGS, maxWidth: 50 }).valid).toBe(false);
    expect(validateSettings({ ...DEFAULT_SETTINGS, maxWidth: 30000 }).valid).toBe(false);
  });

  it('rejects a max height outside 100..20000', () => {
    expect(validateSettings({ ...DEFAULT_SETTINGS, maxHeight: 50 }).valid).toBe(false);
    expect(validateSettings({ ...DEFAULT_SETTINGS, maxHeight: 30000 }).valid).toBe(false);
  });

  it('rejects a timeout outside 10..180', () => {
    expect(validateSettings({ ...DEFAULT_SETTINGS, timeout: 5 }).valid).toBe(false);
  });
});
