// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings } from '@/utils/settingsStorage';
import { DEFAULT_SETTINGS } from '@/utils/settings';

describe('settingsStorage', () => {
  beforeEach(() => localStorage.clear());

  it('returns the defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips saved settings', () => {
    const s = { ...DEFAULT_SETTINGS, outputFormat: 'png' as const, jpegQuality: 0.8 };
    saveSettings(s);
    expect(loadSettings()).toEqual(s);
  });

  it('merges a stored partial over the defaults', () => {
    localStorage.setItem('heic-converter-settings', JSON.stringify({ outputFormat: 'png' }));
    const loaded = loadSettings();
    expect(loaded.outputFormat).toBe('png');
    expect(loaded.maxWidth).toBe(DEFAULT_SETTINGS.maxWidth);
  });

  it('falls back to the defaults on malformed JSON', () => {
    localStorage.setItem('heic-converter-settings', '{not valid json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
