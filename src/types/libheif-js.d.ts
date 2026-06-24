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
