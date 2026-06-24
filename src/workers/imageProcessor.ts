/**
 * Image Processor Worker
 *
 * HEIC/HEIF → ImageData →（resize）→ JPEG/PNG を Web Worker 内で実行する。
 * libheif-js で HEIC をデコードするため、ブラウザがネイティブ対応しない環境
 * （Chrome / Firefox / Edge ＝ Windows・Android ユーザー）でも変換できる。
 * 通常はデコード〜エンコードを worker 内で一度だけ行い UI スレッドを塞がない。
 * ただし worker で OffscreenCanvas 2D が使えない環境（Safari 16 以前 / iOS 16 以前）
 * では、重いデコードのみ worker で行い、resize/encode は `decoded` メッセージで
 * メインスレッド（imagePipeline + domCanvasEnv）に委譲する。
 */

import type {
  WorkerRequest,
  WorkerResponse,
  WorkerDecodedMessage,
  ProcessingPhase,
} from './types';
import type { ConversionSettings } from '@/utils/settings';
import { renderToBlob, generateFileName, type CanvasEnv } from './imagePipeline';

// Worker 内のグローバルコンテキスト
declare const self: Worker & typeof globalThis;

/**
 * この Worker で OffscreenCanvas の 2D コンテキストが使えるか（一度だけ判定）。
 * Safari 16 以前 / iOS 16 以前は OffscreenCanvas はあっても 2D context が無く、
 * `getContext('2d')` が null を返す（convertToBlob も未実装）。その場合は false。
 */
let offscreen2dSupported: boolean | null = null;
function supportsOffscreen2D(): boolean {
  if (offscreen2dSupported !== null) return offscreen2dSupported;
  try {
    if (typeof OffscreenCanvas === 'undefined') {
      offscreen2dSupported = false;
    } else {
      const probe = new OffscreenCanvas(1, 1);
      const ctx = probe.getContext('2d');
      offscreen2dSupported = !!ctx && typeof probe.convertToBlob === 'function';
    }
  } catch {
    offscreen2dSupported = false;
  }
  return offscreen2dSupported;
}

/** Worker 内 OffscreenCanvas を使う CanvasEnv（通常パス）。 */
const offscreenCanvasEnv: CanvasEnv = (width, height) => {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context (OffscreenCanvas)');
  return {
    canvas,
    ctx,
    toBlob: (type, quality) => canvas.convertToBlob({ type, quality }),
  };
};

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const request = e.data;
  if (request.type === 'convert') {
    await processConversion(request);
  }
};

/**
 * 変換処理のメインロジック：decode → resize → encode を一本道で実行
 */
async function processConversion(request: WorkerRequest): Promise<void> {
  const { jobId, file, settings, forceMainThreadEncode } = request;
  const startTime = Date.now();
  let phase: ProcessingPhase = 'decode';

  try {
    // フェーズ1: HEIC デコード（libheif）— 重い WASM 処理は常に Worker 内で実行
    phase = 'decode';
    sendProgress(jobId, 'decode', 0);
    const decoded = await decodeHeic(file, settings);
    sendProgress(jobId, 'decode', 100);

    // OffscreenCanvas 2D 非対応の環境（Safari 16 以前など）は、resize/encode を
    // メインスレッドへ委譲する。デコード済みの原寸 ImageData を transfer で渡す。
    // forceMainThreadEncode はテスト用（対応環境でもこの経路を検証するため）。
    if (forceMainThreadEncode || !supportsOffscreen2D()) {
      const decodeTime = Date.now() - startTime;
      const buffer = decoded.data.buffer;
      const message: WorkerDecodedMessage = {
        type: 'decoded',
        jobId,
        buffer,
        width: decoded.width,
        height: decoded.height,
        decodeTime,
      };
      self.postMessage(message, [buffer]);
      return;
    }

    // フェーズ2/3: リサイズ＋エンコード（Worker 内 OffscreenCanvas）
    phase = 'resize';
    sendProgress(jobId, 'resize', 0);
    sendProgress(jobId, 'resize', 100);
    phase = 'encode';
    sendProgress(jobId, 'encode', 0);
    const { blob, width, height } = await renderToBlob(decoded, settings, offscreenCanvasEnv);
    sendProgress(jobId, 'encode', 100);

    const processingTime = Date.now() - startTime;
    const response: WorkerResponse = {
      type: 'success',
      jobId,
      blob,
      outputFileName: generateFileName(file.name, settings),
      metadata: {
        originalSize: file.size,
        outputSize: blob.size,
        width,
        height,
        processingTime,
      },
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      jobId,
      error: error instanceof Error ? error.message : 'Unknown error',
      phase,
    };
    self.postMessage(response);
  }
}

/**
 * HEIC/HEIF を libheif-js でデコードして ImageData を返す。
 * libheif はデコード時に向き変換（irot / imir）を既定で適用するため、
 * EXIF orientation 付きの写真も正しい向きで返る。
 * 注: マルチフレーム HEIC は先頭フレームのみ変換する。
 */
async function decodeHeic(file: File, settings: ConversionSettings): Promise<ImageData> {
  const libheif = await import('libheif-js');
  const buffer = await file.arrayBuffer();
  const decoder = new libheif.HeifDecoder();
  const images = decoder.decode(buffer);

  if (!images || images.length === 0) {
    throw new Error('No image found in HEIC/HEIF file');
  }

  const image = images[0];
  const width = image.get_width();
  const height = image.get_height();

  try {
    return await new Promise<ImageData>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Decode timed out')),
      settings.timeout * 1000
    );
    try {
      image.display(
        { data: new Uint8ClampedArray(width * height * 4), width, height },
        (displayData) => {
          clearTimeout(timer);
          if (!displayData) {
            reject(new Error('Failed to decode image'));
            return;
          }
          resolve(
            new ImageData(
              new Uint8ClampedArray(displayData.data),
              displayData.width,
              displayData.height
            )
          );
        }
      );
    } catch (err) {
      clearTimeout(timer);
      reject(err instanceof Error ? err : new Error('Failed to decode image'));
    }
    });
  } finally {
    // 全フレームの WASM ヒープを解放（大量バッチでのメモリ増加を防ぐ）
    for (const img of images) {
      (img as { free?: () => void }).free?.();
    }
  }
}

/**
 * 進捗メッセージを送信
 */
function sendProgress(jobId: string, phase: ProcessingPhase, progress: number): void {
  const response: WorkerResponse = { type: 'progress', jobId, phase, progress };
  self.postMessage(response);
}
