# heic-to-jpg

Convert HEIC and HEIF photos to JPG or PNG, entirely in your browser. Files are
processed on your device and never uploaded. Open source, works offline (PWA).

Part of [runlocally](https://runlocally.app) — small tools that run locally on your device.

## How it works

HEIC/HEIF is decoded with [libheif](https://github.com/catdad-experiments/libheif-js)
(WebAssembly) inside a Web Worker, then re-encoded to JPG or PNG on a canvas. The whole
pipeline runs client-side — there is no server component, so your files have no path off
your device. EXIF orientation is applied during decode.

## Features

- HEIC / HEIF → JPG or PNG
- Batch conversion (each file downloads when done, or a ZIP)
- Adjustable JPG quality, optional resize
- Works offline (PWA), installable

## Develop

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build to dist/
```

Stack: Astro + Preact + TypeScript. Decoding runs in a Web Worker via libheif (WASM).

## Browser support

Works in current Chrome, Edge, Firefox and Safari. Decoding is done via WebAssembly, so it
runs even where the browser has no native HEIC support (e.g. Windows and Android). The only
hard requirement is a module Web Worker (Safari 15+). Resizing and encoding use an
`OffscreenCanvas` inside the worker when available, and fall back to a main-thread `<canvas>`
where the worker has no 2D `OffscreenCanvas` — e.g. Safari/iOS 16 and earlier — so those
browsers convert too.

## License

[MIT](./LICENSE). Built and maintained by Geppetto. Some code is written with AI
assistance; all review and decisions are the maintainer's.
