import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit tests run in Node (pure functions). Component tests opt into jsdom via a
// `// @vitest-environment jsdom` docblock. E2E lives in Playwright, not here.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  esbuild: { jsx: 'automatic', jsxImportSource: 'preact' },
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/component/**/*.test.tsx'],
    environment: 'node',
    // jsdom (used by component tests and storage-backed unit tests via docblock)
    // needs a real origin or localStorage is a non-functional opaque-origin stub.
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
    setupFiles: ['tests/setup/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
      // Scope to genuinely unit-testable modules. DOM/integration-heavy utils
      // (worker manager, zip download, SW registration) and the canvas-bound
      // renderToBlob are covered by the Playwright e2e suite instead.
      // imagePipeline.renderToBlob is canvas-bound and verified by the Playwright
      // e2e suite (both the OffscreenCanvas and main-thread paths), so the module
      // is intentionally not in the unit-coverage gate.
      include: [
        'src/utils/fileValidation.ts',
        'src/utils/settings.ts',
        'src/utils/settingsStorage.ts',
        'src/utils/etaCalculator.ts',
      ],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 75 },
    },
  },
});
