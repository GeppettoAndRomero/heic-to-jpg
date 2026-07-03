import { describe, it, expect } from 'vitest';
import { AppError, resolveErrorMessage } from '@/utils/appError';
import { ui } from '@/i18n/ui';

describe('resolveErrorMessage', () => {
  it('maps codes (incl. worker-forwarded string codes) to localized strings', () => {
    // Worker throws AppError('errNoImageInHeic'); it crosses postMessage as the .message string.
    expect(resolveErrorMessage('errNoImageInHeic', ui.en)).toBe('No image was found in this HEIC/HEIF file.');
    expect(resolveErrorMessage('errNoImageInHeic', ui.ja)).toBe('この HEIC/HEIF ファイルに画像が見つかりませんでした。');
    expect(resolveErrorMessage(new AppError('errWorkerStopped'), ui.de)).toBe(
      'Die Verarbeitung wurde gestoppt. Bitte lade die Seite neu und versuche es erneut.'
    );
  });

  it('falls back to the localized generic message for unmapped English/undefined errors', () => {
    // e.g. an internal canvas error string, or a missing job.error.
    expect(resolveErrorMessage('Failed to get 2D context (OffscreenCanvas)', ui.zh)).toBe(ui.zh.errConversionFailed);
    expect(resolveErrorMessage(undefined, ui.es)).toBe(ui.es.errConversionFailed);
  });

  it('every locale defines the mapped codes', () => {
    for (const loc of ['en', 'ja', 'zh', 'de', 'es'] as const)
      for (const c of ['errNoImageInHeic', 'errWorkerStopped', 'errConversionFailed'])
        expect((ui as any)[loc][c], `${loc}.${c}`).toBeTruthy();
  });
});
