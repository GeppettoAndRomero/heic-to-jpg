import { type Page, type Download } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

export const HEIC_B64 = readFileSync(
  fileURLToPath(new URL('../fixtures/heic/sample.heic', import.meta.url))
).toString('base64');

/** Wait until the island has hydrated and the conversion subsystem is ready. */
export async function waitReady(page: Page) {
  await page.waitForFunction(() => (window as Record<string, unknown>).__toolReady === true);
}

/** Feed the bundled HEIC through the drop-zone path and return the download. */
export async function convert(page: Page): Promise<Download> {
  const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
  await page.evaluate((b64) => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const file = new File([bytes], 'sample.heic', { type: 'image/heic' });
    window.dispatchEvent(new CustomEvent('filesDropped', { detail: [file] }));
  }, HEIC_B64);
  return downloadPromise;
}
