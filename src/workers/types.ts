/**
 * Worker通信の型定義
 * 仕様: 2.1.2 HEIC/HEIF 変換、2.1.5 バッチ処理
 */

import type { ConversionSettings } from '@/utils/settings';

// ジョブの状態
export type JobStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

// 処理フェーズ
export type ProcessingPhase = 'decode' | 'resize' | 'encode' | 'complete';

// メインスレッドからWorkerへのメッセージ
export interface WorkerRequest {
  type: 'convert';
  jobId: string;
  file: File;
  settings: ConversionSettings;
  /**
   * テスト用シーム: true のとき OffscreenCanvas 2D 対応環境でも強制的に
   * メインスレッド encode 経路（decoded メッセージ）を通す。本番では未設定（=false）。
   * WorkerManager が globalThis.__HEIC_FORCE_MAIN_THREAD_ENCODE__ を見て設定する。
   */
  forceMainThreadEncode?: boolean;
}

// Workerからメインスレッドへのメッセージ
export type WorkerResponse =
  | WorkerProgressMessage
  | WorkerSuccessMessage
  | WorkerDecodedMessage
  | WorkerErrorMessage;

// 進捗メッセージ
export interface WorkerProgressMessage {
  type: 'progress';
  jobId: string;
  phase: ProcessingPhase;
  progress: number; // 0-100
}

// 成功メッセージ
export interface WorkerSuccessMessage {
  type: 'success';
  jobId: string;
  blob: Blob;
  outputFileName: string;
  metadata: {
    originalSize: number;
    outputSize: number;
    width: number;
    height: number;
    processingTime: number; // ミリ秒
  };
}

// デコード結果のメインスレッド委譲メッセージ
// OffscreenCanvas 2D 非対応の Worker（Safari 16 以前など）で、resize/encode を
// メインスレッドに任せるために、デコード済み（原寸・リサイズ前）の ImageData を送る。
// `buffer` は Uint8ClampedArray の ArrayBuffer で、transfer して渡す（コピーなし）。
export interface WorkerDecodedMessage {
  type: 'decoded';
  jobId: string;
  buffer: ArrayBuffer;
  width: number;
  height: number;
  decodeTime: number; // ミリ秒（デコードのみ）
}

// エラーメッセージ
export interface WorkerErrorMessage {
  type: 'error';
  jobId: string;
  error: string;
  phase: ProcessingPhase;
}

// ジョブ情報
export interface ConversionJob {
  id: string;
  file: File;
  settings: ConversionSettings;
  status: JobStatus;
  phase?: ProcessingPhase;
  progress: number;
  result?: Blob;
  error?: string;
  startTime?: number;
  endTime?: number;
}
