/**
 * Type definitions for libheif-js
 * libheif-js provides HEIF/HEIC image decoding capabilities
 */

declare module 'libheif-js' {
  export interface HeifImage {
    get_width(): number;
    get_height(): number;
    display(
      imageData: ImageData | { data: Uint8ClampedArray; width: number; height: number },
      callback: (result: ImageData | null) => void
    ): void;
  }

  export class HeifDecoder {
    decode(buffer: ArrayBuffer): HeifImage[];
  }
}

// Separate-wasm build of libheif-js: the emscripten module factory, used so the
// WebAssembly ships as its own `.wasm` file instead of an inlined base64 blob
// (handbook/LICENSE-AUDIT.md R8 / HANDBOOK §9.3). Call it with `{ wasmBinary }`.
declare module 'libheif-js/libheif-wasm/libheif.js' {
  import type { HeifDecoder } from 'libheif-js';
  interface LibheifModule {
    HeifDecoder: typeof HeifDecoder;
  }
  const factory: (moduleOverrides?: { wasmBinary?: ArrayBuffer | Uint8Array }) => LibheifModule;
  export default factory;
}

// `?url` makes Vite emit libheif.wasm as a standalone hashed asset and return its URL.
declare module 'libheif-js/libheif-wasm/libheif.wasm?url' {
  const src: string;
  export default src;
}
