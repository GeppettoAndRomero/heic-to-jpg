/**
 * Image Pipeline（resize → encode の共有ロジック）
 *
 * デコード済みの ImageData を resize して JPEG/PNG にエンコードする工程を、
 * canvas の実体（Worker 内の OffscreenCanvas / メインスレッドの HTMLCanvasElement）
 * から切り離す。これにより同じパイプラインを 2 つの実行環境で共有できる：
 *   - 通常: Worker 内の OffscreenCanvas（UI スレッドを塞がない）
 *   - フォールバック: OffscreenCanvas 2D 非対応の Worker（Safari 16 以前など）では
 *     メインスレッドの <canvas> に委譲する（`domCanvasEnv`）
 *
 * canvas の生成と Blob 化だけを `CanvasEnv` 経由で差し替え、resize の算術と
 * 描画手順はここに一本化する。
 */

import type { ConversionSettings } from '@/utils/settings';

/** OffscreenCanvas と HTMLCanvasElement の双方が満たす 2D コンテキストの最小集合。 */
type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** 1 枚分の描画面。`canvas` は drawImage のソースにもなる（CanvasImageSource）。 */
export interface CanvasSurface {
  canvas: CanvasImageSource;
  ctx: Ctx2D;
  toBlob(type: string, quality?: number): Promise<Blob>;
}

/** 指定サイズの描画面を作る環境（Offscreen 版 / DOM 版を差し替える）。 */
export type CanvasEnv = (width: number, height: number) => CanvasSurface;

/**
 * リサイズ後の出力サイズを算出する（描画はしない純関数）。
 * - none: 原寸
 * - contain: 長辺を maxWidth/maxHeight に収める。拡大はしない（scale ≤ 1）
 * - cover: maxWidth/maxHeight を覆う。必要なら拡大する
 */
export function computeTargetDims(
  srcW: number,
  srcH: number,
  settings: ConversionSettings
): { width: number; height: number } {
  if (settings.resizeMode === 'none') return { width: srcW, height: srcH };

  const { maxWidth, maxHeight, resizeMode } = settings;
  let scale = 1;
  if (resizeMode === 'contain') {
    scale = Math.min(maxWidth / srcW, maxHeight / srcH, 1);
  } else if (resizeMode === 'cover') {
    scale = Math.max(maxWidth / srcW, maxHeight / srcH);
  }
  return { width: Math.round(srcW * scale), height: Math.round(srcH * scale) };
}

/**
 * ImageData を（必要なら）リサイズして JPEG/PNG の Blob にエンコードする。
 * canvas の実体は `createCanvas`（CanvasEnv）が供給するため、Worker でも
 * メインスレッドでも同一コードで動く。
 */
export async function renderToBlob(
  imageData: ImageData,
  settings: ConversionSettings,
  createCanvas: CanvasEnv
): Promise<{ blob: Blob; width: number; height: number }> {
  const { width: targetW, height: targetH } = computeTargetDims(
    imageData.width,
    imageData.height,
    settings
  );
  const needsResize = targetW !== imageData.width || targetH !== imageData.height;

  const type = settings.outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = settings.outputFormat === 'jpeg' ? settings.jpegQuality : undefined;

  if (!needsResize) {
    const surface = createCanvas(imageData.width, imageData.height);
    surface.ctx.putImageData(imageData, 0, 0);
    const blob = await surface.toBlob(type, quality);
    return { blob, width: imageData.width, height: imageData.height };
  }

  // 原寸の描画面に putImageData → 出力サイズの描画面へ高品質スケール
  const src = createCanvas(imageData.width, imageData.height);
  src.ctx.putImageData(imageData, 0, 0);

  const dst = createCanvas(targetW, targetH);
  dst.ctx.imageSmoothingEnabled = true;
  dst.ctx.imageSmoothingQuality = 'high';
  dst.ctx.drawImage(
    src.canvas,
    0,
    0,
    imageData.width,
    imageData.height,
    0,
    0,
    targetW,
    targetH
  );
  const blob = await dst.toBlob(type, quality);
  return { blob, width: targetW, height: targetH };
}

/**
 * 出力ファイル名を生成（拡張子は出力形式に合わせる）。
 */
export function generateFileName(originalName: string, settings: ConversionSettings): string {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const extension = settings.outputFormat === 'jpeg' ? 'jpg' : 'png';
  return `${baseName}.${extension}`;
}
