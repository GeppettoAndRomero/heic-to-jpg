import { test, expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const HEIC = fileURLToPath(new URL('../fixtures/heic/sample.heic', import.meta.url));
const HEIC_B64 = readFileSync(HEIC).toString('base64');

const isJpeg = (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
const isPng = (b: Buffer) =>
  b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;

/**
 * Drives a real HEIC conversion through the UI and asserts:
 *  - a valid JPG/PNG file is produced (correct magic bytes), and
 *  - no request left the origin (the no-upload covenant; TESTING.md E2E item #1).
 * When forceFallback is true, the worker is forced down the main-thread encode
 * path (the Safari/iOS <= 16 branch) via the documented test seam.
 */
async function convertAndAssert(page: Page, forceFallback: boolean) {
  const external: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (
      !url.startsWith('http://localhost:4321') &&
      !url.startsWith('data:') &&
      !url.startsWith('blob:')
    ) {
      external.push(url);
    }
  });

  if (forceFallback) {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__HEIC_FORCE_MAIN_THREAD_ENCODE__ = true;
    });
  }

  await page.goto('/heic-to-jpg/');
  // Wait until the island has hydrated and the conversion subsystem is ready.
  await page.waitForFunction(() => (window as Record<string, unknown>).__toolReady === true);

  const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
  // Feed the real HEIC through the same path the drop zone uses.
  await page.evaluate((b64) => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const file = new File([bytes], 'sample.heic', { type: 'image/heic' });
    window.dispatchEvent(new CustomEvent('filesDropped', { detail: [file] }));
  }, HEIC_B64);
  const download = await downloadPromise;

  const name = download.suggestedFilename();
  expect(name).toMatch(/\.(jpg|png)$/);

  const path = await download.path();
  expect(path).toBeTruthy();
  const buf = readFileSync(path as string);
  expect(buf.length).toBeGreaterThan(100);
  if (name.endsWith('.jpg')) expect(isJpeg(buf)).toBe(true);
  else expect(isPng(buf)).toBe(true);

  expect(external, `unexpected cross-origin requests: ${external.join(', ')}`).toHaveLength(0);
}

test.describe('HEIC conversion', () => {
  test('converts a HEIC to an image in the browser with no upload', async ({ page }) => {
    await convertAndAssert(page, false);
  });

  test('converts via the main-thread fallback (Safari/iOS <= 16 path)', async ({ page }) => {
    await convertAndAssert(page, true);
  });
});
