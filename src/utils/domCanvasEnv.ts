/**
 * メインスレッド用の CanvasEnv（HTMLCanvasElement バック）。
 *
 * Worker 内の OffscreenCanvas 2D が使えない環境（Safari 16 以前 / iOS 16 以前など）で、
 * resize/encode をメインスレッドの <canvas> に委譲するためのアダプタ。
 * 重い HEIC デコードは Worker 側で完了済みで、ここに来るのは描画＋Blob 化だけなので
 * UI ブロックは軽微。
 *
 * 注: DOM に触れるため呼び出しはクライアント（ブラウザ）でのみ。SSR からは呼ばない。
 */

import type { CanvasEnv } from '@/workers/imagePipeline';

export const domCanvasEnv: CanvasEnv = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context (HTMLCanvasElement)');

  return {
    canvas,
    ctx,
    toBlob: (type, quality) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob returned null'))),
          type,
          quality
        );
      }),
  };
};
